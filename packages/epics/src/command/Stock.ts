import { existsSync, readdirSync, statSync } from "node:fs"
import { basename, join, relative } from "node:path"

import { EpicConfig } from "$/epics/config/EpicConfig"

import {
  EXIT,
  parseVerbArgs,
  type LiveSession,
  type StockAction,
  type StockGroup,
  type StockItem,
  type StockReport
} from "./command.types"
import { Git } from "./Git"
import { Parking } from "./Parking"
import { Worktrees } from "./Worktrees"

/****************
 * ### `Stock`
 * `epic stock [--json]`:  every running session and where it works, then everything open in this repo --
 * worktrees, branches, parked and `/bedtime` work, plans with phases left, stashes and window files left behind --
 * sorted into "in process", "hung or parked" and "dead, still hanging on", each with what `/worktrees` can do about
 * it.  Read-only.  Was `whassup.py`, then `worktrees.py` (`/worktrees`).
 * - text:  the sessions table (`Worktrees.table()`), then one section per group, an item per line with its
 *   reasons, then its actions (`> id:  label`)
 * - `--json`:  `{ generated, main, sessions, idle, groups, items }`, each action with the shell lines it runs
 * - looks at:  worktrees and branches;  running Claude sessions, in this repo or anywhere on the machine;  `/park`
 *   notes and `/bedtime` reports in worktrees;  epic pages with phases left;  `park:<name>` stashes left behind;
 *   window files (`workspaces/ongoing/<name>.code-workspace`) with no worktree
 * - a session working in a worktree belongs to that worktree's item;  the rest are items of their own
 ****************/
export class Stock {
  /** the worktrees, and where each name stands:  STATIC for the object's life */
  readonly worktrees: Worktrees

  /** - `worktrees`:  default the current folder's repo's */
  constructor({ worktrees = new Worktrees() }: { worktrees?: Worktrees } = {}) {
    this.worktrees = worktrees
  }

  /** the repo's main checkout */
  get main(): string {
    return this.worktrees.main
  }

  /** the repo's `.epic/config.json5` */
  get config(): EpicConfig {
    return this.worktrees.config
  }

  ////////////////
  // ## The verb
  ////////////////

  /** Run `epic stock <args>`;  resolves to the exit code. */
  async run(args: string[]): Promise<number> {
    const { flags } = parseVerbArgs(args, ["json"])
    const report = this.take()
    if (flags.json) {
      out(JSON.stringify(report, null, 2))
      return EXIT.OK
    }
    for (const line of Worktrees.table(report.sessions, report.idle)) out(line)
    const items = new Map(report.items.map((item) => [item.key, item]))
    for (const group of ["active", "stalled", "dead"] as const) {
      const keys = report.groups[group]
      out(`## ${Stock.TITLES[group]} (${keys.length})\n\n`)
      for (const key of keys) {
        const item = items.get(key)!
        out(`- ${key}  ${(item.why ?? []).join(";  ")}`)
        for (const action of item.actions ?? []) out(`    > ${action.id}:  ${action.label}`)
      }
      out("")
    }
    return EXIT.OK
  }

  /** Everything open in the repo, sorted into groups (`StockReport`).  Read-only. */
  take(): StockReport {
    const { main, config, worktrees } = this
    const sessions = worktrees.sessions.live(main)
    const items: StockItem[] = []
    // every epic page in one tool run, not one each
    const epicsDir = Worktrees.epicsDir(main)
    const planNames = existsSync(epicsDir)
      ? readdirSync(epicsDir).filter((name) => statSync(join(epicsDir, name)).isDirectory())
      : []
    const every = [...planNames.sort(), ...worktrees.named().map((it) => it.name)]
    worktrees.planSummaries(
      every
        .map((name) => worktrees.planFile(name, config.worktreeFolder(name)))
        .filter((file): file is string => !!file)
    )
    const claimed = new Set<string>()
    for (const { name, path, branch } of worktrees.named())
      items.push(this.checkoutItem(name, path, branch, sessions, claimed))
    const branchesSeen = new Set(items.map((item) => item.branch))
    for (const branch of lines(Git.run(["for-each-ref", "--format=%(refname:short)", "refs/heads"], main).out)) {
      if (!branchesSeen.has(branch) && branch !== config.baseBranch)
        items.push(this.checkoutItem(branch, null, branch, sessions, claimed))
    }
    const names = new Set(items.map((item) => item.name))
    for (const name of existsSync(epicsDir) ? readdirSync(epicsDir).sort() : []) {
      if (!statSync(join(epicsDir, name)).isDirectory() || names.has(name)) continue
      const item = this.planItem(name)
      if (item) items.push(item)
    }
    for (const session of sessions) if (!claimed.has(session.id)) items.push(sessionItem(session))
    items.push(
      ...this.stashItems(),
      ...this.windowItems(new Set(items.filter((item) => item.worktree).map((item) => item.name)))
    )
    const groups = { active: [] as string[], stalled: [] as string[], dead: [] as string[] }
    for (const group of ["active", "stalled", "dead"] as const)
      groups[group] = items.filter((item) => item.group === group).map((item) => item.key)
    return { generated: Stock.iso(Date.now()), main, sessions, idle: worktrees.idle(sessions), groups, items }
  }

  ////////////////
  // ## Items
  ////////////////

  /** A worktree and / or branch `name`, with the sessions working in it (marked `claimed`). */
  private checkoutItem(
    name: string,
    worktree: string | null,
    branch: string | null,
    sessions: LiveSession[],
    claimed: Set<string>
  ): StockItem {
    const { main, config } = this
    const here = sessions.filter((session) => worktree && inFolder(session.cwd, worktree))
    for (const session of here) claimed.add(session.id)
    const base = config.baseBranch
    const ahead = branch ? this.count(`${base}..${branch}`) : 0
    const behind = branch ? this.count(`${branch}..${base}`) : 0
    // commits whose patch is already in the base branch (squashed, cherry-picked) don't count as work
    const unique = ahead
      ? lines(Git.run(["cherry", base, branch!], main).out).filter((line) => line.startsWith("+")).length
      : 0
    const dirty = worktree ? lines(Git.run(["status", "--short"], worktree).out) : []
    const moved =
      !!branch && lines(Git.run(["reflog", "show", "--format=%H", `refs/heads/${branch}`], main).out).length > 1
    const plan = this.worktrees.planStatus(name, config.worktreeFolder(name))
    const item: StockItem = {
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
      lastCommit: branch ? Git.run(["log", "-1", "--format=%cI", branch], main).out || null : null,
      lastTouched: this.lastTouched(worktree, branch, here),
      plan: plan.folder,
      planDone: plan.done,
      parked: this.parkedNote(worktree, name),
      morning: morningNote(worktree, name),
      sessions: here
    }
    return this.classifyCheckout(item)
  }

  /** Set `group`, `why` and `actions` on a worktree / branch item. */
  private classifyCheckout(item: StockItem): StockItem {
    const why: string[] = []
    const work = item.unique || item.dirty
    const parked = item.parked && item.parked.state !== "resumed" ? item.parked : null
    const { sessions } = item

    // stuck beats everything:  a session that stopped moving, or a question nobody answered
    for (const session of sessions) {
      if (session.state === "hung") why.push(`session \`${session.name}\` busy but silent for ${session.silentMin} min`)
    }
    for (const session of sessions) {
      if (session.question && session.questionMin >= Stock.UNANSWERED_MINUTES) {
        why.push(`session \`${session.name}\` asked a question ${session.questionMin} min ago, unanswered`)
      }
    }
    if (why.length) return setGroup(item, "stalled", [...why, ...notes(item, parked)], this.stalledActions(item))

    // a session moving in it beats a leftover morning report.  Not a `/park` note:  parking is the LAST thing a
    // session does (so it was just active), and resuming sets the note to `resumed`
    const moving = sessions.some(
      (session) =>
        ["busy", "waiting"].includes(session.state) || (!parked && hoursSince(session.lastActive) < Stock.RECENT_HOURS)
    )
    const lastTouchedAt = item.lastTouched
    if (moving || (sessions.length && !parked && !item.morning && hoursSince(lastTouchedAt) < Stock.STALE_HOURS)) {
      return setGroup(item, "active", [describeSessions(item), ...notes(item, parked)], activeActions(item))
    }
    if (parked || item.morning) return setGroup(item, "stalled", notes(item, parked), this.stalledActions(item))

    if (!work) {
      let merged = item.everCommitted ? "merged into `main`" : "never got a commit"
      if (item.ahead) merged = `its ${item.ahead} commits are already in \`main\` (squashed or cherry-picked)`
      const idle = sessions.length ? `;  session(s) idle ${age(lastTouchedAt)}` : ""
      return setGroup(item, "dead", [`nothing left:  ${merged}, nothing uncommitted${idle}`], this.deadActions(item))
    }

    const left = [
      item.unique ? `${item.unique} commits not in \`main\`` : "",
      item.dirty ? `${item.dirty} uncommitted files` : ""
    ]
      .filter(Boolean)
      .join(", ")
    if (hoursSince(lastTouchedAt) < Stock.RECENT_HOURS) {
      return setGroup(item, "active", [`${left};  touched ${age(lastTouchedAt)}, no session open`], activeActions(item))
    }
    if (item.plan && item.planDone) why.push(`plan all done, but ${left}:  never merged?`)
    else why.push(`${left};  untouched ${age(lastTouchedAt)}, no session open`)
    return setGroup(item, "stalled", why, this.stalledActions(item))
  }

  /** An epic page with no worktree or branch:  stalled if phases are left, else nothing to report. */
  private planItem(name: string): StockItem | undefined {
    const plan = this.worktrees.planStatus(name, this.config.worktreeFolder(name))
    if (!plan.folder || plan.done) return undefined
    const item: StockItem = {
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
    return setGroup(item, "stalled", ["epic page with phases left, no worktree or branch working on it"], actions)
  }

  /** `park:<name>` stashes:  `/park` stashes, then pops in the worktree, so one left behind means a move broke. */
  private stashItems(): StockItem[] {
    const items: StockItem[] = []
    for (const line of lines(Git.run(["stash", "list", "--format=%H %gd %gs"], this.main).out)) {
      const [sha = "", ref, ...words] = line.split(" ")
      const subject = words.join(" ")
      const tag = /park:(\S+)/.exec(subject)
      if (!tag) continue
      const name = tag[1]!
      const item: StockItem = { key: `stash:${sha.slice(0, 8)}`, kind: "stash", name, stash: sha, sessions: [] }
      const actions = [
        action("apply", `apply it in worktree \`${name}\``, [`git -C ${this.worktreeAt(name)} stash apply ${sha}`]),
        action("drop", "drop it (look first)", [`git stash show -p ${sha}`, `git stash drop <ref of ${sha}>`])
      ]
      items.push(setGroup(item, "stalled", [`\`/park\` stash left behind (${ref}):  \`${subject}\``], actions))
    }
    return items
  }

  /** Window files with no worktree:  `epic window close` deletes them;  a session that left without it, didn't. */
  private windowItems(worktrees: Set<string>): StockItem[] {
    const folder = join(this.main, "workspaces", "ongoing")
    if (!existsSync(folder)) return []
    const items: StockItem[] = []
    for (const file of readdirSync(folder).sort()) {
      if (!file.endsWith(".code-workspace")) continue
      const name = basename(file, ".code-workspace")
      if (worktrees.has(name)) continue
      const item: StockItem = { key: `window:${name}`, kind: "window", name, file: join(folder, file), sessions: [] }
      const actions = [action("close", "close its window and delete the file", [`epic window close ${name}`])]
      items.push(setGroup(item, "dead", ["window file for a worktree that's gone"], actions))
    }
    return items
  }

  ////////////////
  // ## Actions
  ////////////////

  /** What to offer for hung or parked work. */
  private stalledActions(item: StockItem): StockAction[] {
    const found: StockAction[] = []
    const { parked } = item
    if (parked?.state.startsWith("waiting:")) {
      const target = parked.state.slice("waiting:".length)
      if (this.worktrees.nameStatus(target, []).finished)
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
    if ((item.worktree || item.branch) && !item.sessions.length) found.push(this.discard(item))
    return found
  }

  /** Clean-up for a worktree / branch with nothing left in it. */
  private deadActions(item: StockItem): StockAction[] {
    const found = item.sessions.filter((session) => session.state === "idle" && !session.this).map(kill)
    const commands: string[] = []
    if (existsSync(join(this.main, "workspaces", "ongoing", `${item.name}.code-workspace`)))
      commands.push(`epic window close ${item.name}`)
    if (item.worktree) commands.push(`git worktree remove ${relative(this.main, item.worktree)}`)
    // `-d` refuses unmerged work;  squashed-in commits need `-D`, which `discard` asks about separately
    if (item.branch) commands.push(`git branch ${item.ahead ? "-D" : "-d"} ${item.branch}`)
    found.unshift(action("remove", item.worktree ? "remove worktree and branch" : "delete the branch", commands))
    return found
  }

  /** Throw the work away:  ALWAYS asked about on its own, listing what goes. */
  private discard(item: StockItem): StockAction {
    const commands = item.worktree ? [`epic window close ${item.name}`] : []
    if (item.worktree) commands.push(`git worktree remove --force ${relative(this.main, item.worktree)}`)
    if (item.branch) commands.push(`git branch -D ${item.branch}`)
    return action("discard", "throw the work away (asks again first)", commands)
  }

  ////////////////
  // ## Checkouts
  ////////////////

  /** Worktree `name`'s folder as a command typed in the main checkout gives it:  `.claude/worktrees/<name>`. */
  private worktreeAt(name: string): string {
    return relative(this.main, this.config.worktreeFolder(name))
  }

  /** `/park`'s `PARKED-<name>.md` in `worktree`:  `{ state, stopped, file }`, or `null`. */
  private parkedNote(worktree: string | null, name: string): StockItem["parked"] {
    if (!worktree) return null
    const file = join(worktree, `PARKED-${name}.md`)
    if (!existsSync(file)) return null
    const found = new Parking({ worktrees: this.worktrees }).notes().find((it) => it.file === file)
    return found ? { state: found.state, stopped: found.stopped, file } : null
  }

  /** Latest of:  the last commit, the newest uncommitted file, a session's last transcript write;  ISO, or `null`. */
  private lastTouched(worktree: string | null, branch: string | null, sessions: LiveSession[]): string | null {
    const times: (number | undefined)[] = branch
      ? [isoToMs(Git.run(["log", "-1", "--format=%cI", branch], this.main).out)]
      : []
    if (worktree) {
      for (const line of lines(Git.run(["status", "--short", "--untracked-files=all"], worktree).out)) {
        const file = join(worktree, line.slice(3).split(" -> ").at(-1)!)
        if (existsSync(file)) times.push(statSync(file).mtimeMs)
      }
    }
    times.push(...sessions.map((session) => isoToMs(session.lastActive)))
    const known = times.filter((time): time is number => !!time)
    return known.length ? Stock.iso(Math.max(...known)) : null
  }

  /** `git rev-list --count <range>` in the main checkout. */
  private count(range: string): number {
    return Number(Git.run(["rev-list", "--count", range], this.main).out || 0)
  }

  ////////////////
  // ## Thresholds and time
  ////////////////

  /** Hours:  touched within this is in process.  Static:  the rule, the same for every repo. */
  static readonly RECENT_HOURS = 6

  /** Hours:  a session idle this long is dead.  Static:  the rule. */
  static readonly STALE_HOURS = 24

  /** Minutes:  a busy session silent this long is hung.  Static:  the rule;  `Sessions.live()` reads it too. */
  static readonly SILENT_MINUTES = 20

  /** Minutes:  a question unanswered this long is stalled.  Static:  the rule. */
  static readonly UNANSWERED_MINUTES = 30

  /** Report titles, per group.  Static:  words, the same for every report. */
  static readonly TITLES: Record<StockGroup, string> = {
    active: "In process",
    stalled: "Hung or parked",
    dead: "Dead, still hanging on"
  }

  /**
   * `ms` as local ISO time to the minute, with its offset:  `2026-10-03T09:05-07:00`.
   * - static:  pure;  `Sessions.live()` stamps with it too
   */
  static iso(ms: number): string {
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

  /**
   * Whole minutes since ISO time `text`;  0 without one.
   * - static:  pure;  `Sessions.live()` ages a waiting question with it
   */
  static minutesSince(text: string | null | undefined): number {
    const ms = isoToMs(text)
    return ms === undefined ? 0 : Math.floor((Date.now() - ms) / 60_000)
  }
}

////////////////
// ## Helpers:  no repo needed
////////////////

/** Write `text` to stdout, on its own line. */
function out(text: string): void {
  process.stdout.write(text.endsWith("\n") ? text : `${text}\n`)
}

/** Asides about an item's `/park` note and `/bedtime` report, which don't decide its group alone. */
function notes(item: StockItem, parked: StockItem["parked"]): string[] {
  const found = parked ? [`parked (${parked.state}):  ${parked.stopped || "see the note"}`] : []
  if (item.morning) found.push("`/bedtime` left a morning report (`MORNING-*.md`):  `/wakeup` not finished")
  return found
}

/** `/bedtime`'s `MORNING-<name>.md` in `worktree`:  `{ file }`, or `null`. */
function morningNote(worktree: string | null, name: string): StockItem["morning"] {
  const file = worktree && join(worktree, `MORNING-${name}.md`)
  return file && existsSync(file) ? { file } : null
}

/** A running session not inside any worktree:  the main checkout, or elsewhere on the machine. */
function sessionItem(session: LiveSession): StockItem {
  const item: StockItem = {
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
  if (session.question && session.questionMin >= Stock.UNANSWERED_MINUTES) {
    const why = [`asked a question ${session.questionMin} min ago, unanswered (${where})`]
    return setGroup(item, "stalled", why, [opener, action("answer", "show me the question here")])
  }
  if (session.state === "idle" && !session.used && hoursSince(session.lastActive) >= 1) {
    const why = [`\`${session.name}\` never got a prompt, open ${age(session.lastActive)} (${where})`]
    return setGroup(item, "dead", why, [kill(session)])
  }
  // outside a worktree nothing else is in flight, so `RECENT_HOURS`, not `STALE_HOURS`
  if (session.state === "idle" && hoursSince(session.lastActive) >= Stock.RECENT_HOURS) {
    const why = [`\`${session.name}\` idle, last active ${age(session.lastActive)} (${where})`]
    return setGroup(item, "dead", why, [kill(session), opener])
  }
  const why = [`\`${session.name}\` ${session.state}, last active ${age(session.lastActive)} (${where})`]
  return setGroup(item, "active", why, [opener])
}

/** What to offer for work in process:  a digest, and merging when it looks finished. */
function activeActions(item: StockItem): StockAction[] {
  const found = [action("wtf", `\`/wtf ${item.name}\`:  what it's doing`)]
  if (item.morning)
    found.push(action("wakeup", `go through the morning report:  \`/wakeup\` in \`${item.name}\`'s session`))
  const idle = !item.sessions.some((session) => ["busy", "hung"].includes(session.state))
  if (item.unique && !item.dirty && idle && (!item.plan || item.planDone)) found.push(merge(item))
  return found
}

/**
 * Merge a finished branch into `main`.
 * - NOTE: `--no-edit` makes a merge commit, where `/isolate done` fast-forwards (`--ff-only`):  `agents/SUSPECTED-BUGS.md`,
 *   "claude-code";  one policy is roadmap R3's `epic worktree merge`
 */
function merge(item: StockItem): StockAction {
  return action("merge", `merge \`${item.branch}\` into \`main\` (${item.unique} commits)`, [
    `git merge --no-edit ${item.branch}`
  ])
}

/** End a running session's process:  its panel / tab shows it ended, and `/session` reopens it. */
function kill(session: LiveSession): StockAction {
  return action("kill", `end session \`${session.name}\` (pid ${session.pid})`, [`kill ${session.pid}`])
}

/** An action;  no `commands` means a step Claude takes. */
function action(id: string, label: string, commands: string[] = []): StockAction {
  return { id, label, commands }
}

/** Put `item` in `group`, with its reasons and actions. */
function setGroup(item: StockItem, group: StockGroup, why: string[], actions: StockAction[]): StockItem {
  return Object.assign(item, { group, why, actions })
}

/** One line on the sessions in `item`. */
function describeSessions(item: StockItem): string {
  const bits = item.sessions.map(
    (session) =>
      `\`${session.name}\`${session.this ? " (this one)" : ""} ${session.state}` +
      (session.question ? `, asked a question ${session.questionMin} min ago` : "")
  )
  return bits.length ? `session ${bits.join(", ")}` : "no session"
}

/** Whether `path` is `folder` or inside it. */
function inFolder(path: string, folder: string): boolean {
  return path === folder || path.startsWith(`${folder}/`)
}

/** `text`'s lines, empty ones dropped. */
function lines(text: string): string[] {
  return text.split("\n").filter(Boolean)
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

/** `3 min ago`, `5 h ago`, `2 days ago`, `never`. */
function age(text: string | null | undefined): string {
  const hours = hoursSince(text)
  if (hours === Infinity) return "never"
  if (hours < 1) return `${Math.floor(hours * 60)} min ago`
  return hours < 48 ? `${Math.floor(hours)} h ago` : `${Math.floor(hours / 24)} days ago`
}
