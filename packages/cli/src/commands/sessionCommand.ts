import { spawnSync } from "child_process"
import { readFileSync } from "fs"
import { relative } from "path"

import { CLI } from "$/cli"

/** Longest prompt and reply a transcript digest prints, in characters. */
const PROMPT_LIMIT = 800
const REPLY_LIMIT = 3000

/**
 * `spell dev session <verb> ...`:  Claude Code sessions -- find, open, title, digest.  The `/session` and `/wtf`
 * skills use it.
 * - `list [<words>...] [--all] [--limit N]`:  this repo's saved sessions (main checkout, worktrees and package
 *   folders together), newest first, matching every word;  this session left out.  `--all`:  every project's.
 * - `find <name>`:  sessions titled `<name>` or that worked in worktree `<name>`, any project, newest first
 * - `open <id prefix | exact title>`:  opens it in the VS Code Claude panel, in the window it RUNS in, else this
 *   session's window (the extension's URI handler, routed by `windowId`)
 * - `title [<title>]`:  THIS session (`CLAUDE_CODE_SESSION_ID`):  alone, its title (`*` named by hand) and any queued one;
 *   with a title, queues it for the next prompt, unless it already has it
 * - `done [<name>]`:  mark finished work's sessions `✅ <title>` (epic `windows-and-review` P6):  alone, THIS session,
 *   applied on its next prompt;  with a name, every session titled `<name>` or that worked in worktree `<name>`,
 *   applied when each is next resumed or prompted (a hook applies a queued title:  nothing else can).  Reopening the
 *   work (`/isolate <name>`, `/epic <name>`, `/unpark <name>`) takes the ✅ off (`.claude/hooks/prompt-gate.mjs`)
 * - `icons [--dry-run]`:  every named session of this repo given the icon its work's state calls for (`workIcon()`:
 *   📅 a future epic, ✅ merged or its plan all done, 🚧 under way), queued, so each shows on that session's next
 *   prompt or resume;  `--dry-run`:  only say what it would queue
 * - `window [pid]`:  the VS Code window id a process runs in (default this session's)
 * - `transcript <id prefix>`:  another session's prompts, last reply and waiting question
 * - `--json` (`list`, `find`, `transcript`):  the data instead of lines
 * - The logic:  `src/dev/sessions.ts`, `src/dev/transcript.ts`.  Was `session.py` and `transcript.py`.
 */
export async function sessionCommand(
  session: CLI.CliSession,
  args: string[],
  options: CLI.SessionOptions
): Promise<number> {
  const [verb = "list", ...rest] = args
  switch (verb) {
    case "list":
      return listSessions(session, rest, options)
    case "find":
      return findSessions(session, rest.join(" "), options)
    case "open":
      return openSession(session, rest.join(" ").trim())
    case "title":
      return titleSession(session, rest.join(" ").trim())
    case "done":
      return markDone(session, rest.join(" ").trim())
    case "icons":
      return refreshIcons(session, Boolean(options.dryRun))
    case "window": {
      const window = CLI.windowOf(rest[0] ? Number(rest[0]) : CLI.thisPid())
      session.out(String(window ?? "none"))
      return window === undefined ? CLI.EXIT.ERRORS : CLI.EXIT.OK
    }
    case "transcript":
      return showTranscript(session, rest[0], options)
    default:
      throw new CLI.CliError(`unknown verb '${verb}':  list, find, open, title, done, icons, window or transcript`)
  }
}

////////////////
// ## Verbs
////////////////

/** `list`:  one line per session:  id, last active, running or saved, title (`*` = named by hand), folder. */
function listSessions(session: CLI.CliSession, words: string[], options: CLI.SessionOptions): number {
  const limit = Number(options.limit ?? 15)
  const wanted = words.map((word) => word.toLowerCase())
  const live = CLI.runningSessions()
  const me = process.env.CLAUDE_CODE_SESSION_ID
  const root = CLI.mainRoot()
  const shown = CLI.savedSessions({ everywhere: options.all })
    .filter((it) => it.id !== me)
    .filter((it) => {
      const hay = `${it.id} ${it.title} ${it.prompt}`.toLowerCase()
      return wanted.every((word) => hay.includes(word))
    })
    .slice(0, limit)
  if (options.json) {
    const listed = shown.map((it) => ({ ...it, running: live.get(it.id) ?? null }))
    session.out(JSON.stringify(listed, null, 2))
    return CLI.EXIT.OK
  }
  for (const it of shown) {
    const record = live.get(it.id)
    const status = record
      ? `running (${record.status ?? "?"}, ${CLI.ENTRYPOINT_PLACES[record.entrypoint ?? ""] ?? "?"})`
      : "saved"
    const where = it.cwd ? relative(root, it.cwd) || "." : "?"
    const title = `${it.named ? "*" : " "}${it.title.slice(0, 60).padEnd(61)}`
    session.out(`${it.id.slice(0, 8)}  ${stamp(it.last)}  ${status.padEnd(28)}  ${title}  ${where}`)
  }
  if (!shown.length) session.out("no matching sessions")
  return CLI.EXIT.OK
}

/** `find <name>`:  the sessions titled `name` or that worked in worktree `name`. */
function findSessions(session: CLI.CliSession, name: string, options: CLI.SessionOptions): number {
  if (!name) throw new CLI.CliError("find:  which name?")
  const found = CLI.sessionsNamed(name)
  if (options.json) session.out(JSON.stringify(found, null, 2))
  else {
    for (const it of found) {
      session.out(`${it.id.slice(0, 8)}  ${it.title.padEnd(24)}  ${it.last.slice(0, 16)}  ${it.cwd ?? ""}`)
    }
    if (!found.length) session.out(`no session named or in worktree ${name}`)
  }
  return CLI.EXIT.OK
}

/**
 * `open <key>`:  open the one session whose id starts with `key` (else whose title is exactly `key`).
 * - one transcript copied into two project folders is one session
 * - a session running in a terminal or Desktop is refused:  the panel can't take it over
 */
function openSession(session: CLI.CliSession, key: string): number {
  if (!key) throw new CLI.CliError("open:  which session?")
  const every = CLI.savedSessions({ everywhere: true })
  const byId = every.filter((it) => it.id.startsWith(key))
  const hits = [
    ...new Map(
      (byId.length ? byId : every.filter((it) => it.title === key || CLI.bareTitle(it.title) === key)).map((it) => [
        it.id,
        it
      ])
    ).values()
  ]
  if (hits.length !== 1)
    throw new CLI.CliError(`open:  ${hits.length} sessions match '${key}';  pass more of the id`, CLI.EXIT.ERRORS)
  const [hit] = hits
  const live = CLI.runningSessions().get(hit.id)
  if (live && live.entrypoint !== "claude-vscode") {
    const place = CLI.ENTRYPOINT_PLACES[live.entrypoint ?? ""] ?? "?"
    throw new CLI.CliError(`open:  ${hit.id.slice(0, 8)} is running in the ${place}, not VS Code`, CLI.EXIT.ERRORS)
  }
  const target = CLI.windowOf(live ? live.pid : CLI.thisPid())
  const url = `vscode://anthropic.claude-code/open?session=${hit.id}${target === undefined ? "" : `&windowId=${target}`}`
  const run = spawnSync("code", ["--open-url", url], { stdio: "inherit" })
  if (run.status !== 0) throw new CLI.CliError(`open:  \`code --open-url\` failed`, CLI.EXIT.ERRORS)
  session.out(`opened ${hit.id.slice(0, 8)} "${hit.title}" in window ${target ?? "?"}${live ? " (where it runs)" : ""}`)
  return CLI.EXIT.OK
}

/** `title [<title>]`:  show THIS session's title, or queue a new one unless it already has it. */
function titleSession(session: CLI.CliSession, title: string): number {
  const me = process.env.CLAUDE_CODE_SESSION_ID
  if (!me) throw new CLI.CliError("title:  needs CLAUDE_CODE_SESSION_ID")
  const transcript = CLI.transcriptOf(me)
  const summary = transcript ? CLI.summarizeSession(transcript) : undefined
  const current = summary?.title ?? null
  const queued = CLI.queuedTitle(me)
  if (!title) {
    session.out(`${summary?.named ? "*" : " "}${current ?? "?"}${queued ? `  (queued:  ${queued})` : ""}`)
    return CLI.EXIT.OK
  }
  // so skills can call it on every resume / phase start:  "check, rename if needed" is one command
  if (queued === title || (current === title && queued === null)) {
    session.out(`${me.slice(0, 8)} is already "${title}"${queued ? " (queued)" : ""}:  nothing to do`)
    return CLI.EXIT.OK
  }
  CLI.queueTitle(me, title)
  session.out(`queued "${title}" for ${me.slice(0, 8)} (was "${current ?? "?"}"):  applied on the next prompt`)
  return CLI.EXIT.OK
}

/**
 * `done [<name>]`:  queue `✅ <title>` for this session, or for every session of `name` (`sessionsNamed()`);  one
 * already ✅, or with a ✅ queued, is left.
 */
function markDone(session: CLI.CliSession, name: string): number {
  const me = process.env.CLAUDE_CODE_SESSION_ID
  if (!name && !me) throw new CLI.CliError("done:  needs a name, or CLAUDE_CODE_SESSION_ID")
  const targets = name
    ? CLI.sessionsNamed(name).map((it) => ({ id: it.id, title: it.title }))
    : [{ id: me!, title: currentTitle(me!) ?? "" }]
  if (!targets.length) session.out(`no session named or in worktree ${name}`)
  for (const { id, title } of targets) {
    // its work's name:  the title without its icon (🚧, 📅 or an older ✅);  the queued one first, it's newer
    const queued = CLI.queuedTitle(id)
    const bare = CLI.bareTitle(queued ?? title) || name
    const done = `${CLI.TITLE_ICONS.done} ${bare}`
    if ((queued ?? title) === done) {
      session.out(`${id.slice(0, 8)} is already done:  "${done}"`)
      continue
    }
    CLI.queueTitle(id, done)
    session.out(`queued "${done}" for ${id.slice(0, 8)}:  applied on its next prompt or resume`)
  }
  return CLI.EXIT.OK
}

/**
 * `icons`:  queue the icon each named session's work calls for (`workIcon()`), when its title (or the one queued)
 * isn't that already;  says what it did, or (`dryRun`) would do.
 * - a session's work:  its title without its icon (`bareTitle()`);  sessions of one name are looked up once
 * - a name with no worktree, branch or plan doc (a session titled "SVG from image") is left as it is
 */
function refreshIcons(session: CLI.CliSession, dryRun: boolean): number {
  const byName = new Map<string, CLI.SessionSummary[]>()
  for (const it of CLI.savedSessions()) {
    if (!it.named) continue
    const name = CLI.bareTitle(CLI.queuedTitle(it.id) ?? it.title)
    byName.set(name, [...(byName.get(name) ?? []), it])
  }
  let queued = 0
  for (const [name, sessions] of [...byName].sort(([a], [b]) => a.localeCompare(b))) {
    const icon = workIcon(
      name,
      sessions.map((it) => it.id)
    )
    if (!icon) continue
    const wanted = `${icon} ${name}`
    for (const it of sessions) {
      const now = CLI.queuedTitle(it.id) ?? it.title
      if (now === wanted) continue
      if (!dryRun) CLI.queueTitle(it.id, wanted)
      queued++
      session.out(`${dryRun ? "would queue" : "queued"} "${wanted}" for ${it.id.slice(0, 8)} (now "${now}")`)
    }
  }
  session.out(
    queued
      ? `${queued} session${queued === 1 ? "" : "s"}${dryRun ? " to retitle" : " retitled"}:  each shows on its next prompt or resume`
      : "every named session already has its icon"
  )
  return CLI.EXIT.OK
}

/**
 * The icon work `name`'s state calls for (`TITLE_ICONS`), from its worktree, branch and plan doc (`nameStatus()`);
 * `null` when `name` isn't work this repo knows.
 * - 📅 its plan doc is a future epic (`<body data-future>`, `/epic future`)
 * - ✅ finished:  its branch merged into `main`, or every phase of its plan done with nothing left to merge
 * - 🚧 under way:  a worktree, a branch with commits `main` lacks, or a plan with phases left
 */
function workIcon(name: string, ids: string[]): string | null {
  const status = CLI.nameStatus(name, ids)
  if (!status.worktree && !status.branch && !status.plan) return null
  const plan = status.plan && CLI.planFile(name, status.worktree ?? "", CLI.mainRoot())
  if (plan && /<body\b[^>]*\bdata-future\b/.test(readFileSync(plan, "utf8"))) return CLI.TITLE_ICONS.future
  // a plan all done whose branch still has commits `main` lacks isn't finished:  it waits to merge
  if (status.finished && status.ahead === 0) return CLI.TITLE_ICONS.done
  return CLI.TITLE_ICONS.active
}

/** Session `id`'s title from its transcript, or `null`. */
function currentTitle(id: string): string | null {
  const transcript = CLI.transcriptOf(id)
  return (transcript && CLI.summarizeSession(transcript)?.title) ?? null
}

/** `transcript <id prefix>`:  the digest, as markdown (or JSON). */
function showTranscript(session: CLI.CliSession, id: string | undefined, options: CLI.SessionOptions): number {
  if (!id) throw new CLI.CliError("transcript:  which session id?")
  const digest = CLI.digestTranscript(id)
  if (!digest) throw new CLI.CliError(`no transcript for ${id}`, CLI.EXIT.ERRORS)
  if (options.json) {
    session.out(JSON.stringify(digest, null, 2))
    return CLI.EXIT.OK
  }
  session.out(`transcript:  ${digest.path}\n\n## Owen's prompts\n\n`)
  for (const { when, text } of digest.prompts) session.out(`- ${when}  ${cut(text, PROMPT_LIMIT)}`)
  session.out(`\n## Last reply\n\n${cut(digest.lastReply ?? "(none)", REPLY_LIMIT)}`)
  if (digest.pending?.length) {
    session.out("\n## Waiting for an answer\n\n")
    for (const question of digest.pending) {
      session.out(`- ${question.question ?? ""}`)
      for (const option of question.options ?? [])
        session.out(`  - ${option.label ?? ""}:  ${option.description ?? ""}`)
    }
  }
  return CLI.EXIT.OK
}

////////////////
// ## Helpers
////////////////

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
