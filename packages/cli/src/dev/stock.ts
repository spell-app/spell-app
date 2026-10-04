import { existsSync, readdirSync, statSync } from "fs"
import { basename, join, relative } from "path"

import { CLI } from "$/cli"

/** Hours:  touched within `RECENT_HOURS` is in process;  a session idle for `STALE_HOURS` is dead. */
export const RECENT_HOURS = 6
export const STALE_HOURS = 24
/** Minutes:  a busy session silent this long is hung;  a question unanswered this long is stalled. */
export const SILENT_MINUTES = 20
export const UNANSWERED_MINUTES = 30

/** Report titles, per group. */
export const STOCK_TITLES: Record<CLI.StockGroup, string> = {
  active: "In process",
  stalled: "Hung or parked",
  dead: "Dead, still hanging on"
}

/**
 * Everything open in the repo at `main`, sorted into groups, for `/worktrees` (was `whassup.py`, then `worktrees.py`).  Read-only.
 * - looks at:  worktrees and branches;  running Claude sessions, in this repo or anywhere on the machine;  `/park`
 *   notes and `/bedtime` reports in worktrees;  plan docs with phases left;  `park:<name>` stashes left behind;
 *   window files (`workspaces/ongoing/<name>.code-workspace`) with no worktree
 * - a session working in a worktree belongs to that worktree's item;  the rest are items of their own
 */
export function takeStock(main = CLI.mainRoot()): CLI.StockReport {
  const sessions = liveSessions(main)
  const items: CLI.StockItem[] = []
  // every plan doc in one tool run, not one each
  const epicsDir = join(main, "packages", "docs", "epics")
  const planNames = existsSync(epicsDir)
    ? readdirSync(epicsDir).filter((name) => statSync(join(epicsDir, name)).isDirectory())
    : []
  const every = [...planNames.sort(), ...worktreeNames(main).map((it) => it.name)]
  CLI.planSummaries(
    every
      .map((name) => CLI.planFile(name, join(main, ".claude", "worktrees", name), main))
      .filter((file): file is string => !!file),
    main
  )
  const claimed = new Set<string>()
  for (const { name, path, branch } of worktreeNames(main))
    items.push(checkoutItem(main, name, path, branch, sessions, claimed))
  const branchesSeen = new Set(items.map((item) => item.branch))
  for (const branch of CLI.git(["for-each-ref", "--format=%(refname:short)", "refs/heads"], main)
    .out.split("\n")
    .filter(Boolean)) {
    if (!branchesSeen.has(branch) && branch !== "main")
      items.push(checkoutItem(main, branch, null, branch, sessions, claimed))
  }
  const names = new Set(items.map((item) => item.name))
  const epics = join(main, "packages", "docs", "epics")
  for (const name of existsSync(epics) ? readdirSync(epics).sort() : []) {
    if (!statSync(join(epics, name)).isDirectory() || names.has(name)) continue
    const item = planItem(main, name)
    if (item) items.push(item)
  }
  for (const session of sessions) if (!claimed.has(session.id)) items.push(sessionItem(session))
  items.push(
    ...stashItems(main),
    ...windowItems(main, new Set(items.filter((item) => item.worktree).map((item) => item.name)))
  )
  const groups = { active: [] as string[], stalled: [] as string[], dead: [] as string[] }
  for (const group of ["active", "stalled", "dead"] as const)
    groups[group] = items.filter((item) => item.group === group).map((item) => item.key)
  return { generated: iso(Date.now()), main, sessions, idle: idleWorktrees(sessions, main), groups, items }
}

////////////////
// ## Items
////////////////

/** A worktree and / or branch `name`, with the sessions working in it (marked `claimed`). */
function checkoutItem(
  main: string,
  name: string,
  worktree: string | null,
  branch: string | null,
  sessions: CLI.LiveSession[],
  claimed: Set<string>
): CLI.StockItem {
  const here = sessions.filter((session) => worktree && inFolder(session.cwd, worktree))
  for (const session of here) claimed.add(session.id)
  const ahead = branch ? count(main, `main..${branch}`) : 0
  const behind = branch ? count(main, `${branch}..main`) : 0
  // commits whose patch is already in `main` (squashed, cherry-picked) don't count as work
  const unique = ahead
    ? lines(CLI.git(["cherry", "main", branch!], main).out).filter((line) => line.startsWith("+")).length
    : 0
  const dirty = worktree ? lines(CLI.git(["status", "--short"], worktree).out) : []
  const moved =
    !!branch && lines(CLI.git(["reflog", "show", "--format=%H", `refs/heads/${branch}`], main).out).length > 1
  const plan = CLI.planStatus(name, join(main, ".claude", "worktrees", name), main)
  const item: CLI.StockItem = {
    key: worktree ? `worktree:${name}` : `branch:${name}`,
    kind: worktree ? "worktree" : "branch",
    name,
    worktree,
    branch,
    ahead,
    unique,
    behind,
    dirty: dirty.length,
    everCommitted: moved,
    lastCommit: branch ? CLI.git(["log", "-1", "--format=%cI", branch], main).out || null : null,
    lastTouched: lastTouched(main, worktree, branch, here),
    plan: plan.folder,
    planDone: plan.done,
    parked: note(main, worktree, "PARKED", name),
    morning: note(main, worktree, "MORNING", name),
    sessions: here
  }
  return classifyCheckout(main, item)
}

/** Set `group`, `why` and `actions` on a worktree / branch item. */
function classifyCheckout(main: string, item: CLI.StockItem): CLI.StockItem {
  const why: string[] = []
  const work = item.unique || item.dirty
  const parked = item.parked && item.parked.state !== "resumed" ? item.parked : null
  const { sessions } = item

  // stuck beats everything:  a session that stopped moving, or a question nobody answered
  for (const session of sessions) {
    if (session.state === "hung") why.push(`session \`${session.name}\` busy but silent for ${session.silentMin} min`)
  }
  for (const session of sessions) {
    if (session.question && session.questionMin >= UNANSWERED_MINUTES) {
      why.push(`session \`${session.name}\` asked a question ${session.questionMin} min ago, unanswered`)
    }
  }
  if (why.length) return setGroup(item, "stalled", [...why, ...notes(item, parked)], stalledActions(main, item))

  // a session moving in it beats a leftover morning report.  Not a `/park` note:  parking is the LAST thing a
  // session does (so it was just active), and resuming sets the note to `resumed`
  const moving = sessions.some(
    (session) =>
      ["busy", "waiting"].includes(session.state) || (!parked && hoursSince(session.lastActive) < RECENT_HOURS)
  )
  const lastTouchedAt = item.lastTouched
  if (moving || (sessions.length && !parked && !item.morning && hoursSince(lastTouchedAt) < STALE_HOURS)) {
    return setGroup(item, "active", [describeSessions(item), ...notes(item, parked)], activeActions(item))
  }
  if (parked || item.morning) return setGroup(item, "stalled", notes(item, parked), stalledActions(main, item))

  if (!work) {
    let merged = item.everCommitted ? "merged into `main`" : "never got a commit"
    if (item.ahead) merged = `its ${item.ahead} commits are already in \`main\` (squashed or cherry-picked)`
    const idle = sessions.length ? `;  session(s) idle ${age(lastTouchedAt)}` : ""
    return setGroup(item, "dead", [`nothing left:  ${merged}, nothing uncommitted${idle}`], deadActions(main, item))
  }

  const left = [
    item.unique ? `${item.unique} commits not in \`main\`` : "",
    item.dirty ? `${item.dirty} uncommitted files` : ""
  ]
    .filter(Boolean)
    .join(", ")
  if (hoursSince(lastTouchedAt) < RECENT_HOURS) {
    return setGroup(item, "active", [`${left};  touched ${age(lastTouchedAt)}, no session open`], activeActions(item))
  }
  if (item.plan && item.planDone) why.push(`plan all done, but ${left}:  never merged?`)
  else why.push(`${left};  untouched ${age(lastTouchedAt)}, no session open`)
  return setGroup(item, "stalled", why, stalledActions(main, item))
}

/** Asides about an item's `/park` note and `/bedtime` report, which don't decide its group alone. */
function notes(item: CLI.StockItem, parked: CLI.StockItem["parked"]): string[] {
  const found = parked ? [`parked (${parked.state}):  ${parked.stopped || "see the note"}`] : []
  if (item.morning) found.push("`/bedtime` left a morning report (`MORNING-*.md`):  `/wakeup` not finished")
  return found
}

/** A plan doc with no worktree or branch:  stalled if phases are left, else nothing to report. */
function planItem(main: string, name: string): CLI.StockItem | undefined {
  const plan = CLI.planStatus(name, join(main, ".claude", "worktrees", name), main)
  if (!plan.folder || plan.done) return undefined
  const item: CLI.StockItem = {
    key: `plan:${name}`,
    kind: "plan",
    name,
    plan: plan.folder,
    planDone: false,
    sessions: []
  }
  const actions = [
    action("wtf", `\`/wtf ${name}\`:  where it stopped`),
    action("epic", `pick it up:  \`/epic ${name}\` in a new session`)
  ]
  return setGroup(item, "stalled", ["plan doc with phases left, no worktree or branch working on it"], actions)
}

/** A running session not inside any worktree:  the main checkout, or elsewhere on the machine. */
function sessionItem(session: CLI.LiveSession): CLI.StockItem {
  const item: CLI.StockItem = {
    key: `session:${session.id.slice(0, 8)}`,
    kind: "session",
    name: session.name,
    sessions: [session],
    lastTouched: session.lastActive
  }
  if (session.this) return setGroup(item, "active", ["this session"], [])
  const where = session.inRepo ? "main checkout" : session.cwd
  const opener = action("open", `open it:  \`/session ${session.id.slice(0, 8)}\``)
  if (session.state === "hung") {
    const why = [`busy but silent for ${session.silentMin} min (${where})`]
    return setGroup(item, "stalled", why, [opener, action("wtf", "`/wtf` digest of it"), kill(session)])
  }
  if (session.question && session.questionMin >= UNANSWERED_MINUTES) {
    const why = [`asked a question ${session.questionMin} min ago, unanswered (${where})`]
    return setGroup(item, "stalled", why, [opener, action("answer", "show me the question here")])
  }
  if (session.state === "idle" && !session.used && hoursSince(session.lastActive) >= 1) {
    const why = [`\`${session.name}\` never got a prompt, open ${age(session.lastActive)} (${where})`]
    return setGroup(item, "dead", why, [kill(session)])
  }
  // outside a worktree nothing else is in flight, so `RECENT_HOURS`, not `STALE_HOURS`
  if (session.state === "idle" && hoursSince(session.lastActive) >= RECENT_HOURS) {
    const why = [`\`${session.name}\` idle, last active ${age(session.lastActive)} (${where})`]
    return setGroup(item, "dead", why, [kill(session), opener])
  }
  const why = [`\`${session.name}\` ${session.state}, last active ${age(session.lastActive)} (${where})`]
  return setGroup(item, "active", why, [opener])
}

/** `park:<name>` stashes:  `/park` stashes, then pops in the worktree, so one left behind means a move broke. */
function stashItems(main: string): CLI.StockItem[] {
  const items: CLI.StockItem[] = []
  for (const line of lines(CLI.git(["stash", "list", "--format=%H %gd %gs"], main).out)) {
    const [sha, ref, ...words] = line.split(" ")
    const subject = words.join(" ")
    const tag = /park:(\S+)/.exec(subject)
    if (!tag) continue
    const name = tag[1]
    const item: CLI.StockItem = { key: `stash:${sha.slice(0, 8)}`, kind: "stash", name, stash: sha, sessions: [] }
    const actions = [
      action("apply", `apply it in worktree \`${name}\``, [`git -C .claude/worktrees/${name} stash apply ${sha}`]),
      action("drop", "drop it (look first)", [`git stash show -p ${sha}`, `git stash drop <ref of ${sha}>`])
    ]
    items.push(setGroup(item, "stalled", [`\`/park\` stash left behind (${ref}):  \`${subject}\``], actions))
  }
  return items
}

/** Window files with no worktree:  `window.mjs close` deletes them;  a session that left without it, didn't. */
function windowItems(main: string, worktrees: Set<string>): CLI.StockItem[] {
  const folder = join(main, "workspaces", "ongoing")
  if (!existsSync(folder)) return []
  const items: CLI.StockItem[] = []
  for (const file of readdirSync(folder).sort()) {
    if (!file.endsWith(".code-workspace")) continue
    const name = basename(file, ".code-workspace")
    if (worktrees.has(name)) continue
    const item: CLI.StockItem = { key: `window:${name}`, kind: "window", name, file: join(folder, file), sessions: [] }
    const actions = [action("close", "close its window and delete the file", [`node scripts/window.mjs close ${name}`])]
    items.push(setGroup(item, "dead", ["window file for a worktree that's gone"], actions))
  }
  return items
}

////////////////
// ## Actions
////////////////

/** What to offer for work in process:  a digest, and merging when it looks finished. */
function activeActions(item: CLI.StockItem): CLI.StockAction[] {
  const found = [action("wtf", `\`/wtf ${item.name}\`:  what it's doing`)]
  if (item.morning)
    found.push(action("wakeup", `go through the morning report:  \`/wakeup\` in \`${item.name}\`'s session`))
  const idle = !item.sessions.some((session) => ["busy", "hung"].includes(session.state))
  if (item.unique && !item.dirty && idle && (!item.plan || item.planDone)) found.push(merge(item))
  return found
}

/** What to offer for hung or parked work. */
function stalledActions(main: string, item: CLI.StockItem): CLI.StockAction[] {
  const found: CLI.StockAction[] = []
  const { parked } = item
  if (parked?.state.startsWith("waiting:")) {
    const target = parked.state.slice("waiting:".length)
    if (CLI.nameStatus(target, [], main).finished)
      found.push(action("nudge", `tell it \`${target}\` is done:  \`/unpark ${item.name}\``))
  }
  if (parked && parked.state !== "resumed")
    found.push(action("unpark", `pick it up:  \`/unpark ${item.name}\` in a new session`))
  else if (item.morning)
    found.push(action("wakeup", `read the morning report:  \`/wakeup\` in \`${item.name}\`'s session`))
  for (const session of item.sessions)
    found.push(action("open", `open session \`${session.name}\`:  \`/session ${session.id.slice(0, 8)}\``))
  found.push(action("wtf", `\`/wtf ${item.name}\`:  where it stopped`))
  // a parked branch ends in a WIP commit:  never merge that
  if (item.unique && !item.dirty && !parked && !item.sessions.length) found.push(merge(item))
  for (const session of item.sessions) if (session.state === "hung" && !session.this) found.push(kill(session))
  // a running session owns its worktree:  it parks or leaves first
  if ((item.worktree || item.branch) && !item.sessions.length) found.push(discard(main, item))
  return found
}

/** Clean-up for a worktree / branch with nothing left in it. */
function deadActions(main: string, item: CLI.StockItem): CLI.StockAction[] {
  const found = item.sessions.filter((session) => session.state === "idle" && !session.this).map(kill)
  const commands: string[] = []
  if (existsSync(join(main, "workspaces", "ongoing", `${item.name}.code-workspace`)))
    commands.push(`node scripts/window.mjs close ${item.name}`)
  if (item.worktree) commands.push(`git worktree remove ${relative(main, item.worktree)}`)
  // `-d` refuses unmerged work;  squashed-in commits need `-D`, which `discard` asks about separately
  if (item.branch) commands.push(`git branch ${item.ahead ? "-D" : "-d"} ${item.branch}`)
  found.unshift(action("remove", item.worktree ? "remove worktree and branch" : "delete the branch", commands))
  return found
}

/**
 * Merge a finished branch into `main`.
 * - NOTE: `--no-edit` makes a merge commit, where `/isolate done` fast-forwards (`--ff-only`):  `SUSPECTED-BUGS.md`,
 *   "claude-code";  one policy is roadmap R3's `spell dev worktree merge`
 */
function merge(item: CLI.StockItem): CLI.StockAction {
  return action("merge", `merge \`${item.branch}\` into \`main\` (${item.unique} commits)`, [
    `git merge --no-edit ${item.branch}`
  ])
}

/** Throw the work away:  ALWAYS asked about on its own, listing what goes. */
function discard(main: string, item: CLI.StockItem): CLI.StockAction {
  const commands = item.worktree ? [`node scripts/window.mjs close ${item.name}`] : []
  if (item.worktree) commands.push(`git worktree remove --force ${relative(main, item.worktree)}`)
  if (item.branch) commands.push(`git branch -D ${item.branch}`)
  return action("discard", "throw the work away (asks again first)", commands)
}

/** End a running session's process:  its panel / tab shows it ended, and `/session` reopens it. */
function kill(session: CLI.LiveSession): CLI.StockAction {
  return action("kill", `end session \`${session.name}\` (pid ${session.pid})`, [`kill ${session.pid}`])
}

/** An action;  no `commands` means a step Claude takes. */
function action(id: string, label: string, commands: string[] = []): CLI.StockAction {
  return { id, label, commands }
}

/** Put `item` in `group`, with its reasons and actions. */
function setGroup(
  item: CLI.StockItem,
  group: CLI.StockGroup,
  why: string[],
  actions: CLI.StockAction[]
): CLI.StockItem {
  return Object.assign(item, { group, why, actions })
}

/** One line on the sessions in `item`. */
function describeSessions(item: CLI.StockItem): string {
  const bits = item.sessions.map(
    (session) =>
      `\`${session.name}\`${session.this ? " (this one)" : ""} ${session.state}` +
      (session.question ? `, asked a question ${session.questionMin} min ago` : "")
  )
  return bits.length ? `session ${bits.join(", ")}` : "no session"
}

////////////////
// ## Sessions
////////////////

/** Every running session on the machine, as `/worktrees` sees it -- see `LiveSession`. */
export function liveSessions(main = CLI.mainRoot()): CLI.LiveSession[] {
  const mine = CLI.ancestorPids()
  const found: CLI.LiveSession[] = []
  for (const record of CLI.runningSessions().values()) {
    const transcript = CLI.transcriptOf(record.sessionId)
    const mtime = transcript ? statSync(transcript).mtimeMs : (record.updatedAt ?? 0)
    const tail = transcript ? CLI.transcriptTail(record.sessionId, 512_000) : ""
    const cwd = [...tail.matchAll(/"cwd":"([^"]*)"/g)].at(-1)?.[1] || record.cwd || ""
    const silent = Math.floor((Date.now() - mtime) / 60_000)
    const state = record.status ?? "?"
    const asked = pendingQuestion(tail)
    const place = cwd && existsSync(cwd) ? CLI.checkoutOf(cwd) : { label: "(not in git)", branch: "", inside: cwd }
    found.push({
      id: record.sessionId,
      name: CLI.sessionTitle(record.sessionId) || record.name || record.sessionId.slice(0, 8),
      agent: record.name ?? null,
      pid: record.pid,
      cwd,
      inRepo: inFolder(cwd, main),
      where: CLI.ENTRYPOINT_PLACES[record.entrypoint ?? ""] ?? record.entrypoint ?? null,
      checkout: place.label,
      branch: place.branch,
      folder: place.inside,
      state: state === "busy" && silent >= SILENT_MINUTES ? "hung" : state,
      waitingFor: record.waitingFor ?? null,
      lastActive: iso(mtime),
      silentMin: silent,
      question: asked?.question ?? null,
      questionMin: asked?.minutes ?? 0,
      this: mine.has(record.pid),
      used: !!transcript
    })
  }
  return found
}

/**
 * The sessions as a text table (title, agent, id, status, where, worktree, branch, folder;  `<- this` marks the
 * one that ran it), then the worktrees no session is in, then a blank line:  `spell dev worktree list`, and the top
 * of `spell dev stock`'s report.
 */
export function sessionTable(sessions: CLI.LiveSession[], idle: CLI.IdleWorktree[]): string[] {
  const head = ["session", "agent", "id", "status", "where", "worktree", "branch", "folder"]
  const rows = sessions.map((session) => [
    `${session.name}${session.this ? "  <- this" : ""}`,
    session.agent ?? "",
    session.id.slice(0, 8),
    `${session.state}${session.waitingFor ? ` (${session.waitingFor})` : ""}`,
    session.where ?? "?",
    session.checkout,
    session.branch,
    session.folder
  ])
  const widths = head.map((_, column) => Math.max(...[head, ...rows].map((row) => row[column].length)))
  const lines = [head, widths.map((width) => "-".repeat(width)), ...rows].map((row) =>
    row
      .map((cell, column) => cell.padEnd(widths[column]))
      .join("  ")
      .trimEnd()
  )
  if (idle.length) lines.push("", "No session in:", ...idle.map((it) => `  ${it.path}  [${it.branch}]`))
  return [...lines, ""]
}

/** Each worktree under `.claude/worktrees/` that no session in `sessions` works in. */
export function idleWorktrees(sessions: CLI.LiveSession[], main = CLI.mainRoot()): CLI.IdleWorktree[] {
  return worktreeNames(main)
    .filter(({ path }) => !sessions.some((session) => inFolder(session.cwd, path)))
    .map(({ path, branch }) => ({ path, branch }))
}

/** An `AskUserQuestion` in transcript text `tail` with no answer after it:  its first question, minutes ago. */
function pendingQuestion(tail: string): { question: string; minutes: number } | undefined {
  let pending: { question: string; minutes: number } | undefined
  for (const line of tail.split("\n")) {
    if (!line.includes('"AskUserQuestion"') && !line.includes('"tool_result"')) continue
    const entry = CLI.parseJSONLine(line)
    if (entry.isSidechain) continue
    const content = (entry.message as { content?: unknown } | undefined)?.content
    for (const block of Array.isArray(content) ? content : []) {
      if (block?.type === "tool_result") pending = undefined
      else if (block?.type === "tool_use" && block.name === "AskUserQuestion") {
        const [first = {}] = block.input?.questions ?? []
        pending = { question: first.question ?? "?", minutes: minutesSince(entry.timestamp as string) }
      }
    }
  }
  return pending
}

////////////////
// ## Checkouts
////////////////

/** Each worktree under `.claude/worktrees/`:  `{ name, path, branch }`. */
function worktreeNames(main: string): { name: string; path: string; branch: string }[] {
  const root = join(main, ".claude", "worktrees")
  return CLI.worktreesOf(main)
    .filter((it) => it.path.startsWith(`${root}/`) && it.branch !== "(detached)")
    .map((it) => ({ name: basename(it.path), path: it.path, branch: it.branch }))
}

/** `/park`'s `PARKED-<name>.md` (`{ state, stopped, file }`) or `/bedtime`'s `MORNING-<name>.md` (`{ file }`). */
function note(main: string, worktree: string | null, kind: "PARKED", name: string): CLI.StockItem["parked"]
function note(main: string, worktree: string | null, kind: "MORNING", name: string): CLI.StockItem["morning"]
function note(
  main: string,
  worktree: string | null,
  kind: "PARKED" | "MORNING",
  name: string
): CLI.StockItem["parked" | "morning"] {
  if (!worktree) return null
  const file = join(worktree, `${kind}-${name}.md`)
  if (!existsSync(file)) return null
  if (kind === "MORNING") return { file }
  const found = CLI.parkedNotes(main).find((it) => it.file === file)
  return found ? { state: found.state, stopped: found.stopped, file } : null
}

/** Latest of:  the last commit, the newest uncommitted file, a session's last transcript write;  ISO, or `null`. */
function lastTouched(
  main: string,
  worktree: string | null,
  branch: string | null,
  sessions: CLI.LiveSession[]
): string | null {
  const times: (number | undefined)[] = branch
    ? [isoToMs(CLI.git(["log", "-1", "--format=%cI", branch], main).out)]
    : []
  if (worktree) {
    for (const line of lines(CLI.git(["status", "--short", "--untracked-files=all"], worktree).out)) {
      const file = join(worktree, line.slice(3).split(" -> ").at(-1)!)
      if (existsSync(file)) times.push(statSync(file).mtimeMs)
    }
  }
  times.push(...sessions.map((session) => isoToMs(session.lastActive)))
  const known = times.filter((time): time is number => !!time)
  return known.length ? iso(Math.max(...known)) : null
}

/** `git rev-list --count <range>` in `main`. */
function count(main: string, range: string): number {
  return Number(CLI.git(["rev-list", "--count", range], main).out || 0)
}

/** Whether `path` is `folder` or inside it. */
function inFolder(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}/`)
}

/** `text`'s lines, empty ones dropped. */
function lines(text: string): string[] {
  return text.split("\n").filter(Boolean)
}

////////////////
// ## Time
////////////////

/** `ms` as local ISO time to the minute, with its offset:  `2026-10-03T09:05-07:00`. */
export function iso(ms: number): string {
  const date = new Date(ms)
  const offset = -date.getTimezoneOffset()
  const sign = offset >= 0 ? "+" : "-"
  return (
    `${date.getFullYear()}-${two(date.getMonth() + 1)}-${two(date.getDate())}` +
    `T${two(date.getHours())}:${two(date.getMinutes())}` +
    `${sign}${two(Math.floor(Math.abs(offset) / 60))}:${two(Math.abs(offset) % 60)}`
  )

  /** `value` as two digits. */
  function two(value: number): string {
    return String(value).padStart(2, "0")
  }
}

/** An ISO time as ms, or `undefined`. */
function isoToMs(text: string | null | undefined): number | undefined {
  const ms = text ? Date.parse(text) : NaN
  return Number.isNaN(ms) ? undefined : ms
}

/** Hours since ISO time `text`;  `Infinity` without one. */
function hoursSince(text: string | null | undefined): number {
  const ms = isoToMs(text)
  return ms === undefined ? Infinity : (Date.now() - ms) / 3_600_000
}

/** Whole minutes since ISO time `text`;  0 without one. */
function minutesSince(text: string | null | undefined): number {
  const ms = isoToMs(text)
  return ms === undefined ? 0 : Math.floor((Date.now() - ms) / 60_000)
}

/** `3 min ago`, `5 h ago`, `2 days ago`, `never`. */
function age(text: string | null | undefined): string {
  const hours = hoursSince(text)
  if (hours === Infinity) return "never"
  if (hours < 1) return `${Math.floor(hours * 60)} min ago`
  return hours < 48 ? `${Math.floor(hours)} h ago` : `${Math.floor(hours / 24)} days ago`
}
