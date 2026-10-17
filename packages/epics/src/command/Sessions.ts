import { execFileSync, spawnSync } from "node:child_process"
import {
  closeSync,
  existsSync,
  mkdirSync,
  openSync,
  readFileSync,
  readSync,
  readdirSync,
  statSync,
  writeFileSync
} from "node:fs"
import { homedir } from "node:os"
import { basename, join, relative } from "node:path"

import { EpicConfig } from "$/epics/config/EpicConfig"
import { epicStateFor } from "$/epics/list/EpicState"

import {
  ENTRYPOINT_PLACES,
  EXIT,
  EpicCommandError,
  LOCAL_ENTRYPOINTS,
  TITLE_ICONS,
  bareTitle,
  parseVerbArgs,
  type LiveSession,
  type NamedSession,
  type RunningSession,
  type SessionSummary,
  type TranscriptDigest,
  type VerbArgs
} from "./command.types"
import { Git } from "./Git"
import { Stock } from "./Stock"
import { Worktrees } from "./Worktrees"

/****************
 * ### `Sessions`
 * `epic session <verb> ...`:  Claude Code sessions -- find, open, title, digest -- and what every other verb group
 * reads of them.  The `/session`, `/wtf` and `/worktrees` skills use it.
 * - Where they are:  Claude Code's own folder (`home`, `~/.claude`):
 *   - running ones:  its registry, `sessions/<pid>.json`
 *   - saved ones:  their transcripts, `projects/<slug>/<id>.jsonl`
 *   - titles waiting for a session's next prompt:  `session-titles/<id>`
 * - The verbs (`run()`):
 *   - `list [<words>...] [--all] [--limit N]`:  this repo's saved sessions (main checkout, worktrees and package
 *     folders together), newest first, matching every word;  this session left out.  `--all`:  every project's.
 *   - `find <name>`:  sessions titled `<name>` or that worked in worktree `<name>`, any project, newest first
 *   - `open <id prefix | exact title>`:  opens it in the VS Code Claude panel, in the window it RUNS in, else this
 *     session's window (the extension's URI handler, routed by `windowId`)
 *   - `title [<title>]`:  THIS session (`CLAUDE_CODE_SESSION_ID`):  alone, its title (`*` named by hand) and any
 *     queued one;  with a title, queues it for the next prompt, unless it already has it
 *   - `done [<name>]`:  mark finished work's sessions `✅ <title>`:  alone, THIS session;  with a name, every session
 *     titled `<name>` or that worked in worktree `<name>`.  Applied on each one's next prompt or resume (a hook
 *     applies a queued title:  nothing else can).  Reopening the work takes the ✅ off (`PromptGate`).
 *   - `icons [--dry-run]`:  every named session of this repo given the icon its work's state calls for
 *     (`workIcon()`), queued
 *   - `window [pid]`:  the VS Code window id a process runs in (default this session's)
 *   - `transcript <id prefix>`:  another session's prompts, last reply and waiting question
 *   - `--json` (`list`, `find`, `transcript`):  the data instead of lines
 * - Node built-ins only, plus the repo's config:  no spell.  Was `session.py` and `transcript.py`.
 ****************/
export class Sessions {
  /** Claude Code's own folder:  STATIC for the object's life;  a test that needs another builds another object */
  readonly home: string

  /** - `home`:  default `Sessions.claudeHome()` */
  constructor({ home = Sessions.claudeHome() }: SessionsProps = {}) {
    this.home = home
  }

  ////////////////
  // ## The verbs
  ////////////////

  /** Run `epic session <args>`;  resolves to the exit code.  Throws `EpicCommandError` for a bad command line. */
  async run(args: string[]): Promise<number> {
    const { positional, flags } = parseVerbArgs(args, SWITCHES)
    const [verb = "list", ...rest] = positional
    switch (verb) {
      case "list":
        return this.list(rest, flags)
      case "find":
        return this.find(rest.join(" "), flags)
      case "open":
        return this.open(rest.join(" ").trim())
      case "title":
        return this.titleThis(rest.join(" ").trim())
      case "done":
        return this.markDone(rest.join(" ").trim())
      case "icons":
        return this.refreshIcons(Boolean(flags.dryRun))
      case "window": {
        const window = Sessions.windowOf(rest[0] ? Number(rest[0]) : Sessions.thisPid())
        out(String(window ?? "none"))
        return window === undefined ? EXIT.ERRORS : EXIT.OK
      }
      case "transcript":
        return this.showTranscript(rest[0], flags)
      default:
        throw new EpicCommandError(
          `unknown verb '${verb}':  list, find, open, title, done, icons, window or transcript`
        )
    }
  }

  /** `list`:  one line per session:  id, last active, running or saved, title (`*` = named by hand), folder. */
  private list(words: string[], flags: VerbArgs["flags"]): number {
    const limit = Number(flags.limit ?? 15)
    const wanted = words.map((word) => word.toLowerCase())
    const live = this.running()
    const me = process.env.CLAUDE_CODE_SESSION_ID
    const root = Git.mainRoot()
    const shown = this.saved({ everywhere: Boolean(flags.all) })
      .filter((it) => it.id !== me)
      .filter((it) => {
        const hay = `${it.id} ${it.title} ${it.prompt}`.toLowerCase()
        return wanted.every((word) => hay.includes(word))
      })
      .slice(0, limit)
    if (flags.json) {
      const listed = shown.map((it) => ({ ...it, running: live.get(it.id) ?? null }))
      out(JSON.stringify(listed, null, 2))
      return EXIT.OK
    }
    for (const it of shown) {
      const record = live.get(it.id)
      const status = record
        ? `running (${record.status ?? "?"}, ${ENTRYPOINT_PLACES[record.entrypoint ?? ""] ?? "?"})`
        : "saved"
      const where = it.cwd ? relative(root, it.cwd) || "." : "?"
      const title = `${it.named ? "*" : " "}${it.title.slice(0, 60).padEnd(61)}`
      out(`${it.id.slice(0, 8)}  ${stamp(it.last)}  ${status.padEnd(28)}  ${title}  ${where}`)
    }
    if (!shown.length) out("no matching sessions")
    return EXIT.OK
  }

  /** `find <name>`:  the sessions titled `name` or that worked in worktree `name`. */
  private find(name: string, flags: VerbArgs["flags"]): number {
    if (!name) throw new EpicCommandError("find:  which name?")
    const found = this.named(name)
    if (flags.json) out(JSON.stringify(found, null, 2))
    else {
      for (const it of found)
        out(`${it.id.slice(0, 8)}  ${it.title.padEnd(24)}  ${it.last.slice(0, 16)}  ${it.cwd ?? ""}`)
      if (!found.length) out(`no session named or in worktree ${name}`)
    }
    return EXIT.OK
  }

  /**
   * `open <key>`:  open the one session whose id starts with `key` (else whose title is exactly `key`).
   * - one transcript copied into two project folders is one session
   * - a session running in a terminal or Desktop is refused:  the panel can't take it over
   */
  private open(key: string): number {
    if (!key) throw new EpicCommandError("open:  which session?")
    const every = this.saved({ everywhere: true })
    const byId = every.filter((it) => it.id.startsWith(key))
    const matched = byId.length ? byId : every.filter((it) => it.title === key || bareTitle(it.title) === key)
    const hits = [...new Map(matched.map((it) => [it.id, it])).values()]
    if (hits.length !== 1)
      throw new EpicCommandError(`open:  ${hits.length} sessions match '${key}';  pass more of the id`, EXIT.ERRORS)
    const [hit] = hits as [SessionSummary]
    const live = this.running().get(hit.id)
    if (live && live.entrypoint !== "claude-vscode") {
      const place = ENTRYPOINT_PLACES[live.entrypoint ?? ""] ?? "?"
      throw new EpicCommandError(`open:  ${hit.id.slice(0, 8)} is running in the ${place}, not VS Code`, EXIT.ERRORS)
    }
    const target = Sessions.windowOf(live ? live.pid : Sessions.thisPid())
    const url = `vscode://anthropic.claude-code/open?session=${hit.id}${target === undefined ? "" : `&windowId=${target}`}`
    const run = spawnSync("code", ["--open-url", url], { stdio: "inherit" })
    if (run.status !== 0) throw new EpicCommandError("open:  `code --open-url` failed", EXIT.ERRORS)
    out(`opened ${hit.id.slice(0, 8)} "${hit.title}" in window ${target ?? "?"}${live ? " (where it runs)" : ""}`)
    return EXIT.OK
  }

  /** `title [<title>]`:  show THIS session's title, or queue a new one unless it already has it. */
  private titleThis(title: string): number {
    const me = process.env.CLAUDE_CODE_SESSION_ID
    if (!me) throw new EpicCommandError("title:  needs CLAUDE_CODE_SESSION_ID")
    const transcript = this.transcriptOf(me)
    const summary = transcript ? this.summarize(transcript) : undefined
    const current = summary?.title ?? null
    const queued = this.queuedTitle(me)
    if (!title) {
      out(`${summary?.named ? "*" : " "}${current ?? "?"}${queued ? `  (queued:  ${queued})` : ""}`)
      return EXIT.OK
    }
    // so skills can call it on every resume / phase start:  "check, rename if needed" is one command
    if (queued === title || (current === title && queued === null)) {
      out(`${me.slice(0, 8)} is already "${title}"${queued ? " (queued)" : ""}:  nothing to do`)
      return EXIT.OK
    }
    this.queueTitle(me, title)
    out(`queued "${title}" for ${me.slice(0, 8)} (was "${current ?? "?"}"):  applied on the next prompt`)
    return EXIT.OK
  }

  /**
   * `done [<name>]`:  queue `✅ <title>` for this session, or for every session of `name` (`named()`);  one
   * already ✅, or with a ✅ queued, is left.
   */
  private markDone(name: string): number {
    const me = process.env.CLAUDE_CODE_SESSION_ID
    if (!name && !me) throw new EpicCommandError("done:  needs a name, or CLAUDE_CODE_SESSION_ID")
    const targets = name
      ? this.named(name).map((it) => ({ id: it.id, title: it.title }))
      : [{ id: me!, title: this.currentTitle(me!) ?? "" }]
    if (!targets.length) out(`no session named or in worktree ${name}`)
    for (const { id, title } of targets) {
      // its work's name:  the title without its icon (🚧, 📅 or an older ✅);  the queued one first, it's newer
      const queued = this.queuedTitle(id)
      const bare = bareTitle(queued ?? title) || name
      const done = `${TITLE_ICONS.done} ${bare}`
      if ((queued ?? title) === done) {
        out(`${id.slice(0, 8)} is already done:  "${done}"`)
        continue
      }
      this.queueTitle(id, done)
      out(`queued "${done}" for ${id.slice(0, 8)}:  applied on its next prompt or resume`)
    }
    return EXIT.OK
  }

  /**
   * `icons`:  queue the icon each named session's work calls for (`workIcon()`), when its title (or the one queued)
   * isn't that already;  says what it did, or (`dryRun`) would do.
   * - a session's work:  its title without its icon (`bareTitle()`);  sessions of one name are looked up once
   * - a name with no worktree, branch or epic page (a session titled "SVG from image") is left as it is
   */
  private refreshIcons(dryRun: boolean): number {
    const byName = new Map<string, SessionSummary[]>()
    for (const it of this.saved()) {
      if (!it.named) continue
      const name = bareTitle(this.queuedTitle(it.id) ?? it.title)
      byName.set(name, [...(byName.get(name) ?? []), it])
    }
    let queued = 0
    for (const [name, sessions] of [...byName].sort(([a], [b]) => a.localeCompare(b))) {
      const icon = this.workIcon(
        name,
        sessions.map((it) => it.id)
      )
      if (!icon) continue
      const wanted = `${icon} ${name}`
      for (const it of sessions) {
        const now = this.queuedTitle(it.id) ?? it.title
        if (now === wanted) continue
        if (!dryRun) this.queueTitle(it.id, wanted)
        queued++
        out(`${dryRun ? "would queue" : "queued"} "${wanted}" for ${it.id.slice(0, 8)} (now "${now}")`)
      }
    }
    out(
      queued
        ? `${queued} session${queued === 1 ? "" : "s"}${dryRun ? " to retitle" : " retitled"}:  each shows on its next prompt or resume`
        : "every named session already has its icon"
    )
    return EXIT.OK
  }

  /**
   * The icon work `name`'s state calls for (`TITLE_ICONS`), from its worktree, branch and epic page
   * (`Worktrees.nameStatus()`);  `null` when `name` isn't work this repo knows.
   * - with an epic page, its epic's state (`$/epics/list/EpicState`;  a session of it running counts as touched):
   *   📅 future, 🚧 in progress, 🚨 errors (every phase done, items need Owen), ⏸️ paused (untouched for days)
   * - ✅ finished:  its branch merged into `main`, or every phase of its plan done with nothing left to merge
   * - 🚧 under way:  a worktree, a branch with commits `main` lacks, or a plan done that waits to merge
   */
  private workIcon(name: string, ids: string[]): string | null {
    const worktrees = new Worktrees({ sessions: this })
    const status = worktrees.nameStatus(name, ids)
    if (!status.worktree && !status.branch && !status.plan) return null
    const file = status.plan && worktrees.planFile(name, status.worktree ?? "")
    const plan = file ? Worktrees.planFacts(file) : null
    const state = plan && epicStateFor({ ...plan, running: status.sessions.some((it) => it.running) }).name
    if (state === "future") return TITLE_ICONS.future
    if (state === "errors") return TITLE_ICONS.errors
    if (state === "paused") return TITLE_ICONS.paused
    if (state === "progress" && plan?.phases.length) return TITLE_ICONS.active
    // a plan all done whose branch still has commits `main` lacks isn't finished:  it waits to merge
    if (status.finished && status.ahead === 0) return TITLE_ICONS.done
    return TITLE_ICONS.active
  }

  /** Session `id`'s title from its transcript, or `null`. */
  private currentTitle(id: string): string | null {
    const transcript = this.transcriptOf(id)
    return (transcript && this.summarize(transcript)?.title) ?? null
  }

  /** `transcript <id prefix>`:  the digest, as markdown (or JSON). */
  private showTranscript(id: string | undefined, flags: VerbArgs["flags"]): number {
    if (!id) throw new EpicCommandError("transcript:  which session id?")
    const digest = this.digest(id)
    if (!digest) throw new EpicCommandError(`no transcript for ${id}`, EXIT.ERRORS)
    if (flags.json) {
      out(JSON.stringify(digest, null, 2))
      return EXIT.OK
    }
    out(`transcript:  ${digest.path}\n\n## Owen's prompts\n\n`)
    for (const { when, text } of digest.prompts) out(`- ${when}  ${cut(text, PROMPT_LIMIT)}`)
    out(`\n## Last reply\n\n${cut(digest.lastReply ?? "(none)", REPLY_LIMIT)}`)
    if (digest.pending?.length) {
      out("\n## Waiting for an answer\n\n")
      for (const question of digest.pending) {
        out(`- ${question.question ?? ""}`)
        for (const option of question.options ?? []) out(`  - ${option.label ?? ""}:  ${option.description ?? ""}`)
      }
    }
    return EXIT.OK
  }

  ////////////////
  // ## Running sessions
  ////////////////

  /**
   * The live sessions, by session id:  each registry record `sessions/<pid>.json` whose process is alive.
   * - a record whose `pid` is gone is a session that ended without cleaning up:  skipped
   */
  running(): Map<string, RunningSession> {
    const found = new Map<string, RunningSession>()
    const folder = join(this.home, "sessions")
    if (!existsSync(folder)) return found
    for (const name of readdirSync(folder).sort()) {
      if (!name.endsWith(".json")) continue
      const record = readJSON(join(folder, name)) as Partial<RunningSession>
      if (typeof record.pid === "number" && record.sessionId && isAlive(record.pid)) {
        found.set(record.sessionId, record as RunningSession)
      }
    }
    return found
  }

  /**
   * Every running session on the machine, as `/worktrees` sees it -- see `LiveSession`.
   * - `main`:  the repo whose sessions are `inRepo`
   */
  live(main = Git.mainRoot()): LiveSession[] {
    const mine = Sessions.ancestorPids()
    const found: LiveSession[] = []
    for (const record of this.running().values()) {
      const transcript = this.transcriptOf(record.sessionId)
      const mtime = transcript ? statSync(transcript).mtimeMs : (record.updatedAt ?? 0)
      const tail = transcript ? readTail(transcript, 512_000) : ""
      const cwd = [...tail.matchAll(/"cwd":"([^"]*)"/g)].at(-1)?.[1] || record.cwd || ""
      const silent = Math.floor((Date.now() - mtime) / 60_000)
      const state = record.status ?? "?"
      const asked = pendingQuestion(tail)
      const place =
        cwd && existsSync(cwd) ? Worktrees.checkoutOf(cwd) : { label: "(not in git)", branch: "", inside: cwd }
      found.push({
        id: record.sessionId,
        name: this.title(record.sessionId) || record.name || record.sessionId.slice(0, 8),
        agent: record.name ?? null,
        pid: record.pid,
        cwd,
        inRepo: cwd === main || cwd.startsWith(`${main}/`),
        where: ENTRYPOINT_PLACES[record.entrypoint ?? ""] ?? record.entrypoint ?? null,
        checkout: place.label,
        branch: place.branch,
        folder: place.inside,
        state: state === "busy" && silent >= Stock.SILENT_MINUTES ? "hung" : state,
        waitingFor: record.waitingFor ?? null,
        lastActive: Stock.iso(mtime),
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
   * The running sessions working on `epic`:  titled `<epic>` in Claude's session registry, with or without its icon
   * (`🚧 epic-workflow`).
   * - their `name` is the address `SendMessage` takes
   */
  ofEpic(epic: string): RunningSession[] {
    return [...this.running().values()].filter((session) => {
      const title = session.name ?? this.title(session.sessionId)
      return title !== null && title !== undefined && bareTitle(title) === epic
    })
  }

  ////////////////
  // ## Saved sessions
  ////////////////

  /**
   * The saved LOCAL sessions of the repo holding `cwd`, newest first.
   * - this repo:  transcript folders named for its main checkout (`projectSlug(mainRoot)`), or starting with that
   *   plus `-`:  worktrees and package folders share the prefix
   * - `everywhere`:  every project's sessions
   * - web, cloud and SDK sessions are left out:  only `LOCAL_ENTRYPOINTS` (or none recorded)
   */
  saved(options: { everywhere?: boolean; cwd?: string } = {}): SessionSummary[] {
    const prefix = Sessions.projectSlug(Git.mainRoot(options.cwd))
    const projects = join(this.home, "projects")
    if (!existsSync(projects)) return []
    const found: SessionSummary[] = []
    for (const dir of readdirSync(projects)) {
      if (!options.everywhere && dir !== prefix && !dir.startsWith(`${prefix}-`)) continue
      const folder = join(projects, dir)
      if (!statSync(folder).isDirectory()) continue
      for (const name of readdirSync(folder)) {
        if (!name.endsWith(".jsonl")) continue
        const summary = this.summarize(join(folder, name))
        if (summary && (summary.entrypoint === null || LOCAL_ENTRYPOINTS.has(summary.entrypoint))) found.push(summary)
      }
    }
    return found.sort((a, b) => b.last - a.last)
  }

  /**
   * One transcript, summarized;  `undefined` when it has no prompt and no title.
   * - parses only the few lines that matter (titles, the first user entries), so 10MB transcripts stay fast
   * - `cwd`:  the last `"cwd"` in the transcript's final 256KB
   * - a `<id>/custom-title.json` sidecar beats the transcript's own `custom-title`
   */
  summarize(path: string): SessionSummary | undefined {
    let custom: string | null = null
    let ai: string | null = null
    let prompt: string | null = null
    let entrypoint: string | null = null
    let cwd: string | null = null
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (line.includes('"custom-title"') || line.includes('"ai-title"')) {
        const entry = Sessions.parseJSONLine(line)
        custom = (entry.customTitle as string) || custom
        ai = (entry.aiTitle as string) || ai
      } else if ((entrypoint === null || prompt === null) && line.includes('"type":"user"')) {
        const entry = Sessions.parseJSONLine(line)
        entrypoint ??= (entry.entrypoint as string) ?? null
        cwd ??= (entry.cwd as string) ?? null
        prompt ??= Sessions.entryPrompt(entry)
      }
    }
    const moved = [...readTail(path, 256_000).matchAll(/"cwd":"([^"]*)"/g)]
    if (moved.length) cwd = moved.at(-1)![1]!
    const sidecar = join(path.replace(/\.jsonl$/, ""), "custom-title.json")
    if (existsSync(sidecar)) custom = (readJSON(sidecar).customTitle as string) || custom
    if (!prompt && !custom && !ai) return undefined
    return {
      id: basename(path, ".jsonl"),
      title: custom || ai || prompt!.slice(0, 60),
      named: !!custom,
      prompt,
      entrypoint,
      cwd,
      last: statSync(path).mtimeMs
    }
  }

  /**
   * The sessions titled `name` (`/rename`) or that worked in worktree `name`, newest first;  running or not, any
   * project.  Used by `epic session find`, and by worktree / park status.
   */
  named(name: string): NamedSession[] {
    // a `cwd` in worktree `name`:  the worktrees folder from the repo's `.epic/config.json5`
    const config = EpicConfig.of(Git.mainRoot())
    const found: NamedSession[] = []
    for (const path of this.transcripts()) {
      let title: string | null = null
      let cwd: string | null = null
      let last = ""
      let inWorktree = false
      for (const line of readFileSync(path, "utf8").split("\n")) {
        // cheap pre-check:  most lines are neither
        if (!line.includes('"custom-title"') && !line.includes('"cwd"')) continue
        const entry = Sessions.parseJSONLine(line)
        if (entry.type === "custom-title") title = (entry.customTitle as string) ?? null
        if (typeof entry.cwd === "string" && entry.cwd) {
          cwd = entry.cwd
          last = (entry.timestamp as string) ?? last
          inWorktree ||= config.worktreeNameOf(cwd) === name
        }
      }
      // titled `<name>`, with or without its icon (`🚧 <name>`, `✅ <name>`:  `bareTitle()`)
      const titled = title !== null && bareTitle(title) === name
      if (titled || inWorktree) found.push({ id: basename(path, ".jsonl"), title: title ?? "-", last, cwd })
    }
    return found.sort((a, b) => b.last.localeCompare(a.last) || b.id.localeCompare(a.id))
  }

  /** Every transcript file, of every project. */
  transcripts(): string[] {
    const projects = join(this.home, "projects")
    if (!existsSync(projects)) return []
    const found: string[] = []
    for (const dir of readdirSync(projects)) {
      const folder = join(projects, dir)
      if (!statSync(folder).isDirectory()) continue
      for (const name of readdirSync(folder)) if (name.endsWith(".jsonl")) found.push(join(folder, name))
    }
    return found
  }

  /**
   * The transcript of session `id`, in any project folder;  `undefined` when there's none.
   * - one session's transcript can sit in two folders (copied when it moved):  the newest wins
   */
  transcriptOf(id: string): string | undefined {
    const projects = join(this.home, "projects")
    if (!existsSync(projects)) return undefined
    let newest: { path: string; mtime: number } | undefined
    for (const dir of readdirSync(projects)) {
      const path = join(projects, dir, `${id}.jsonl`)
      if (!existsSync(path)) continue
      const mtime = statSync(path).mtimeMs
      if (!newest || mtime > newest.mtime) newest = { path, mtime }
    }
    return newest?.path
  }

  /**
   * Session `id`'s title:  its last `custom-title`, else its last `ai-title`;  `null` when it has neither.
   * - the same rule as `.claude/hooks/handoff.mjs`, which finds a session's tab by it
   */
  title(id: string): string | null {
    const path = this.transcriptOf(id)
    if (!path) return null
    let custom: string | null = null
    let ai: string | null = null
    for (const line of readFileSync(path, "utf8").split("\n")) {
      if (!line.includes('"custom-title"') && !line.includes('"ai-title"')) continue
      const entry = Sessions.parseJSONLine(line)
      if (entry.type === "custom-title") custom = (entry.customTitle as string) ?? null
      else if (entry.type === "ai-title") ai = (entry.aiTitle as string) ?? null
    }
    return custom || ai
  }

  /**
   * What another session has been doing, from its transcript:  for `/wtf <name>`.
   * - `idPrefix`:  a session id, or its first characters;  the newest matching transcript wins
   * - prompts:  what Owen typed, oldest first (slash commands as `/name args`;  tool results, hook output and
   *   reminders dropped);  sidechains (subagents) skipped
   * - `lastReply`:  the session's last reply text
   * - `pending`:  an `AskUserQuestion` no answer has come back for yet
   * - returns `undefined` when no transcript matches
   */
  digest(idPrefix: string): TranscriptDigest | undefined {
    const paths = this.transcripts().filter((path) => basename(path).startsWith(idPrefix))
    if (!paths.length) return undefined
    const path = paths.reduce((newest, it) => (statSync(it).mtimeMs > statSync(newest).mtimeMs ? it : newest))
    const digest: TranscriptDigest = { path, prompts: [], lastReply: null, pending: null }
    for (const line of readFileSync(path, "utf8").split("\n")) {
      const entry = Sessions.parseJSONLine(line)
      if (entry.isSidechain) continue
      const message = entry.message as { content?: unknown } | undefined
      if (!message || typeof message !== "object") continue
      const blocks = typeof message.content === "string" ? [{ type: "text", text: message.content }] : message.content
      if (!Array.isArray(blocks)) continue
      if (entry.type === "user") {
        for (const block of blocks) {
          // any answer clears a waiting question
          if (block?.type === "tool_result") digest.pending = null
          else if (block?.type === "text") {
            const text = Sessions.promptText(block.text ?? "")
            const when = typeof entry.timestamp === "string" ? entry.timestamp.slice(0, 16) : ""
            if (text) digest.prompts.push({ when, text })
          }
        }
      } else if (entry.type === "assistant") {
        for (const block of blocks) {
          if (block?.type === "text" && String(block.text ?? "").trim()) digest.lastReply = block.text.trim()
          else if (block?.type === "tool_use" && block.name === "AskUserQuestion") {
            digest.pending = block.input?.questions ?? []
          }
        }
      }
    }
    return digest
  }

  ////////////////
  // ## Titles
  ////////////////

  /**
   * Queue `title` for session `id`:  `session-titles/<id>` in Claude Code's folder.
   * - Claude can't run `/rename`:  the `UserPromptSubmit` hook `~/.claude/hooks/session-title.mjs` returns the
   *   file as `sessionTitle` on the session's NEXT prompt, then deletes it (undocumented, found in CLI 2.1.287)
   */
  queueTitle(id: string, title: string): void {
    mkdirSync(join(this.home, "session-titles"), { recursive: true })
    writeFileSync(join(this.home, "session-titles", id), title)
  }

  /** The title queued for session `id`'s next prompt (`queueTitle()`), or `null`. */
  queuedTitle(id: string): string | null {
    const file = join(this.home, "session-titles", id)
    return existsSync(file) ? readFileSync(file, "utf8").trim() : null
  }

  ////////////////
  // ## Statics:  Claude Code's folder, processes, transcript lines
  ////////////////

  /**
   * Claude Code's own folder:  `~/.claude`, or `SPELL_CLAUDE_HOME` (tests point it at a fixture).
   * - static:  the default every `Sessions` starts from, before there's one
   */
  static claudeHome(): string {
    return process.env.SPELL_CLAUDE_HOME || join(homedir(), ".claude")
  }

  /**
   * The pids above this process, so the session that ran us can be told apart (or left out).
   * - static:  this process's, whatever the folder
   */
  static ancestorPids(): Set<number> {
    const pids = new Set<number>()
    for (let pid = process.ppid; pid > 1 && !pids.has(pid);) {
      pids.add(pid)
      pid = Number(run("ps", ["-o", "ppid=", "-p", String(pid)]).trim() || 0)
    }
    return pids
  }

  /**
   * The VS Code window id hosting process `pid` (or an ancestor), or `undefined`.
   * - the extension host above a Claude panel session keeps log files open under `.../logs/<stamp>/window<n>/exthost/`
   * - walks up the parents (`ps -o ppid=`) until one has them
   * - static:  about processes, not Claude's folder
   */
  static windowOf(pid: number): number | undefined {
    for (let at = pid; at > 1;) {
      const files = run("lsof", ["-p", String(at)])
      const match = /\/logs\/[^/]+\/window(\d+)\/exthost\//.exec(files)
      if (match) return Number(match[1])
      at = Number(run("ps", ["-o", "ppid=", "-p", String(at)]).trim() || 0)
    }
    return undefined
  }

  /**
   * This session's process, to find its window from:  `CLAUDE_PID`, else our parent.
   * - our parent may be a shell or `yarn`, not `claude`:  `windowOf()` walks up past them
   * - static:  this process's
   */
  static thisPid(): number {
    return Number(process.env.CLAUDE_PID) || process.ppid
  }

  /**
   * A folder's name under `~/.claude/projects`:  every character but a letter or digit becomes `-`.
   * - static:  pure
   */
  static projectSlug(path: string): string {
    return path.replace(/[^A-Za-z0-9]/g, "-")
  }

  /**
   * One JSON line (a transcript's), or `{}` when it isn't an object.
   * - static:  pure;  `Requests` reads transcripts' lines too
   */
  static parseJSONLine(line: string): Record<string, unknown> {
    try {
      const value = JSON.parse(line)
      return value && typeof value === "object" ? value : {}
    } catch {
      return {}
    }
  }

  /**
   * What Owen typed, from a transcript `user` entry;  `null` for tool results and harness text.
   * - `isMeta` entries are the harness's
   * - static:  pure
   */
  static entryPrompt(entry: Record<string, unknown>): string | null {
    if (entry.isMeta) return null
    let content = (entry.message as { content?: unknown } | undefined)?.content
    if (Array.isArray(content)) {
      content = content
        .filter((block) => block?.type === "text")
        .map((block) => block.text ?? "")
        .join(" ")
    }
    const text = typeof content === "string" ? Sessions.promptText(content) : null
    return text && collapse(text)
  }

  /**
   * A typed prompt from a message's text, trimmed (line breaks kept);  `null` for harness noise.
   * - a slash command counts, as `/name args`:  a session started by `/clear` + `/epic` has no other prompt
   * - reminders and IDE context (`<system-reminder>`, `<ide_selection>`, `<ide_opened_file>`) are dropped;  what's
   *   left starting with `<` is not a prompt, nor are the harness's own messages:
   *   - a skill's instructions ("Base directory for this skill:")
   *   - another session's message ("Another Claude session sent a message:"), e.g. a subagent's report
   * - `entryPrompt()` collapses the result to one line, for summaries
   * - static:  pure
   */
  static promptText(text: string): string | null {
    const command = /<command-name>(.*?)<\/command-name>/s.exec(text)
    if (command) {
      const args = /<command-args>(.*?)<\/command-args>/s.exec(text)
      return `${command[1]} ${args ? args[1]!.trim() : ""}`.trim() || null
    }
    const left = text.replace(/<(system-reminder|ide_selection|ide_opened_file)>.*?<\/\1>/gs, "").trim()
    if (!left || left.startsWith("<") || HARNESS_MESSAGES.some((start) => left.startsWith(start))) return null
    return left
  }
}

/** What `new Sessions()` takes. */
export type SessionsProps = {
  /** Claude Code's own folder;  default `Sessions.claudeHome()` */
  home?: string
}

/** The flags of `epic session` that take no value. */
const SWITCHES = ["all", "json", "dryRun"]

/** Longest prompt and reply a transcript digest prints, in characters. */
const PROMPT_LIMIT = 800
const REPLY_LIMIT = 3000

/** How the harness's own `user` messages start:  never prompts. */
const HARNESS_MESSAGES = ["Base directory for this skill:", "Another Claude session sent a message:"]

/** Write `text` to stdout, on its own line. */
function out(text: string): void {
  process.stdout.write(text.endsWith("\n") ? text : `${text}\n`)
}

/** Whether process `pid` exists:  signal 0 checks without sending anything. */
function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    // EPERM:  it exists, it's just not ours
    return (error as NodeJS.ErrnoException).code === "EPERM"
  }
}

/** An `AskUserQuestion` in transcript text `tail` with no answer after it:  its first question, minutes ago. */
function pendingQuestion(tail: string): { question: string; minutes: number } | undefined {
  let pending: { question: string; minutes: number } | undefined
  for (const line of tail.split("\n")) {
    if (!line.includes('"AskUserQuestion"') && !line.includes('"tool_result"')) continue
    const entry = Sessions.parseJSONLine(line)
    if (entry.isSidechain) continue
    const content = (entry.message as { content?: unknown } | undefined)?.content
    for (const block of Array.isArray(content) ? content : []) {
      if (block?.type === "tool_result") pending = undefined
      else if (block?.type === "tool_use" && block.name === "AskUserQuestion") {
        const [first = {}] = block.input?.questions ?? []
        pending = { question: first.question ?? "?", minutes: Stock.minutesSince(entry.timestamp as string) }
      }
    }
  }
  return pending
}

/** A JSON file, or `{}`. */
function readJSON(path: string): Record<string, unknown> {
  try {
    return Sessions.parseJSONLine(readFileSync(path, "utf8"))
  } catch {
    return {}
  }
}

/** The last `bytes` of file `path`, as text. */
function readTail(path: string, bytes: number): string {
  const size = statSync(path).size
  const length = Math.min(size, bytes)
  const buffer = Buffer.alloc(length)
  const fd = openSync(path, "r")
  try {
    readSync(fd, buffer, 0, length, size - length)
  } finally {
    closeSync(fd)
  }
  return buffer.toString("utf8")
}

/** `text` with every run of whitespace one space, trimmed. */
function collapse(text: string): string {
  return text.split(/\s+/).filter(Boolean).join(" ")
}

/** `command args` stdout, or "" when it fails. */
function run(command: string, args: string[]): string {
  try {
    return execFileSync(command, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] })
  } catch (error) {
    // lsof exits 1 when some files can't be listed, but still prints the rest
    return String((error as { stdout?: string }).stdout ?? "")
  }
}

/** `ms` as local `MM-DD HH:MM`. */
function stamp(ms: number): string {
  const date = new Date(ms)
  return `${two(date.getMonth() + 1)}-${two(date.getDate())} ${two(date.getHours())}:${two(date.getMinutes())}`

  /** `value` as two digits. */
  function two(value: number): string {
    return String(value).padStart(2, "0")
  }
}

/** `text` cut to `limit` characters, marked when cut. */
function cut(text: string, limit: number): string {
  return text.length <= limit ? text : `${text.slice(0, limit)} [...]`
}
