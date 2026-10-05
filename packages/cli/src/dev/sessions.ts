import { execFileSync } from "child_process"
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
} from "fs"
import { homedir } from "os"
import { basename, join } from "path"

import { CLI } from "$/cli"

/**
 * Claude Code's own folder:  `~/.claude`, or `SPELL_CLAUDE_HOME` (tests point it at a fixture).
 * - sessions' registry:  `sessions/<pid>.json`;  transcripts:  `projects/<slug>/<id>.jsonl`;  queued titles:
 *   `session-titles/<id>`
 */
export function claudeHome(): string {
  return process.env.SPELL_CLAUDE_HOME || join(homedir(), ".claude")
}

////////////////
// ## Running sessions
////////////////

/**
 * The live sessions, by session id:  each registry record `sessions/<pid>.json` whose process is alive.
 * - a record whose `pid` is gone is a session that ended without cleaning up:  skipped
 */
export function runningSessions(home = claudeHome()): Map<string, CLI.RunningSession> {
  const found = new Map<string, CLI.RunningSession>()
  const folder = join(home, "sessions")
  if (!existsSync(folder)) return found
  for (const name of readdirSync(folder).sort()) {
    if (!name.endsWith(".json")) continue
    const record = readJSON(join(folder, name)) as Partial<CLI.RunningSession>
    if (typeof record.pid === "number" && record.sessionId && isAlive(record.pid)) {
      found.set(record.sessionId, record as CLI.RunningSession)
    }
  }
  return found
}

/** Whether process `pid` exists:  signal 0 checks without sending anything. */
export function isAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    // EPERM:  it exists, it's just not ours
    return (error as NodeJS.ErrnoException).code === "EPERM"
  }
}

////////////////
// ## Saved sessions
////////////////

/**
 * The saved LOCAL sessions of the repo holding `cwd`, newest first.
 * - this repo:  transcript folders named for its main checkout (`slug(mainRoot())`), or starting with that plus
 *   `-`:  worktrees and package folders share the prefix
 * - `everywhere`:  every project's sessions
 * - web, cloud and SDK sessions are left out:  only `LOCAL_ENTRYPOINTS` (or none recorded)
 */
export function savedSessions(
  options: { everywhere?: boolean; cwd?: string } = {},
  home = claudeHome()
): CLI.SessionSummary[] {
  const prefix = projectSlug(CLI.mainRoot(options.cwd))
  const projects = join(home, "projects")
  if (!existsSync(projects)) return []
  const found: CLI.SessionSummary[] = []
  for (const dir of readdirSync(projects)) {
    if (!options.everywhere && dir !== prefix && !dir.startsWith(`${prefix}-`)) continue
    const folder = join(projects, dir)
    if (!statSync(folder).isDirectory()) continue
    for (const name of readdirSync(folder)) {
      if (!name.endsWith(".jsonl")) continue
      const summary = summarizeSession(join(folder, name))
      if (summary && (summary.entrypoint === null || CLI.LOCAL_ENTRYPOINTS.has(summary.entrypoint))) found.push(summary)
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
export function summarizeSession(path: string): CLI.SessionSummary | undefined {
  let custom: string | null = null
  let ai: string | null = null
  let prompt: string | null = null
  let entrypoint: string | null = null
  let cwd: string | null = null
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.includes('"custom-title"') || line.includes('"ai-title"')) {
      const entry = parseJSONLine(line)
      custom = (entry.customTitle as string) || custom
      ai = (entry.aiTitle as string) || ai
    } else if ((entrypoint === null || prompt === null) && line.includes('"type":"user"')) {
      const entry = parseJSONLine(line)
      entrypoint ??= (entry.entrypoint as string) ?? null
      cwd ??= (entry.cwd as string) ?? null
      prompt ??= entryPrompt(entry)
    }
  }
  const moved = [...readTail(path, 256_000).matchAll(/"cwd":"([^"]*)"/g)]
  if (moved.length) cwd = moved.at(-1)![1]
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
 * project.  Used by `spell dev session find`, and by worktree / park status.
 */
export function sessionsNamed(name: string, home = claudeHome()): CLI.NamedSession[] {
  const worktree = `/.claude/worktrees/${name}`
  const found: CLI.NamedSession[] = []
  for (const path of transcripts(home)) {
    let title: string | null = null
    let cwd: string | null = null
    let last = ""
    let inWorktree = false
    for (const line of readFileSync(path, "utf8").split("\n")) {
      // cheap pre-check:  most lines are neither
      if (!line.includes('"custom-title"') && !line.includes('"cwd"')) continue
      const entry = parseJSONLine(line)
      if (entry.type === "custom-title") title = (entry.customTitle as string) ?? null
      if (typeof entry.cwd === "string" && entry.cwd) {
        cwd = entry.cwd
        last = (entry.timestamp as string) ?? last
        inWorktree ||= cwd.endsWith(worktree) || cwd.includes(`${worktree}/`)
      }
    }
    if (title === name || inWorktree) found.push({ id: basename(path, ".jsonl"), title: title ?? "-", last, cwd })
  }
  return found.sort((a, b) => b.last.localeCompare(a.last) || b.id.localeCompare(a.id))
}

/** Every transcript file, of every project. */
export function transcripts(home = claudeHome()): string[] {
  const projects = join(home, "projects")
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
 * What Owen typed, from a transcript `user` entry;  `null` for tool results and harness text.
 * - `isMeta` entries are the harness's
 */
export function entryPrompt(entry: Record<string, unknown>): string | null {
  if (entry.isMeta) return null
  let content = (entry.message as { content?: unknown } | undefined)?.content
  if (Array.isArray(content)) {
    content = content
      .filter((block) => block?.type === "text")
      .map((block) => block.text ?? "")
      .join(" ")
  }
  const text = typeof content === "string" ? promptText(content) : null
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
 */
export function promptText(text: string): string | null {
  const command = /<command-name>(.*?)<\/command-name>/s.exec(text)
  if (command) {
    const args = /<command-args>(.*?)<\/command-args>/s.exec(text)
    return `${command[1]} ${args ? args[1].trim() : ""}`.trim() || null
  }
  const left = text.replace(/<(system-reminder|ide_selection|ide_opened_file)>.*?<\/\1>/gs, "").trim()
  if (!left || left.startsWith("<") || HARNESS_MESSAGES.some((start) => left.startsWith(start))) return null
  return left
}

/** How the harness's own `user` messages start:  never prompts. */
const HARNESS_MESSAGES = ["Base directory for this skill:", "Another Claude session sent a message:"]

/** A folder's name under `~/.claude/projects`:  every character but a letter or digit becomes `-`. */
export function projectSlug(path: string): string {
  return path.replace(/[^A-Za-z0-9]/g, "-")
}

/**
 * The transcript of session `id`, in any project folder;  `undefined` when there's none.
 * - one session's transcript can sit in two folders (copied when it moved):  the newest wins
 */
export function transcriptOf(id: string, home = claudeHome()): string | undefined {
  const projects = join(home, "projects")
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

/** The last `bytes` of session `id`'s transcript, as text;  "" when it has none. */
export function transcriptTail(id: string, bytes: number, home = claudeHome()): string {
  const path = transcriptOf(id, home)
  return path ? readTail(path, bytes) : ""
}

/**
 * Session `id`'s title:  its last `custom-title`, else its last `ai-title`;  `null` when it has neither.
 * - the same rule as `.claude/hooks/handoff.mjs`, which finds a session's tab by it
 */
export function sessionTitle(id: string, home = claudeHome()): string | null {
  const path = transcriptOf(id, home)
  if (!path) return null
  let custom: string | null = null
  let ai: string | null = null
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (!line.includes('"custom-title"') && !line.includes('"ai-title"')) continue
    const entry = parseJSONLine(line)
    if (entry.type === "custom-title") custom = (entry.customTitle as string) ?? null
    else if (entry.type === "ai-title") ai = (entry.aiTitle as string) ?? null
  }
  return custom || ai
}

/** The last folder session `id` worked in:  the last `"cwd"` in its transcript's final 256KB, or `null`. */
export function lastCwd(id: string, home = claudeHome()): string | null {
  const path = transcriptOf(id, home)
  const found = path ? [...readTail(path, 256_000).matchAll(/"cwd":"([^"]*)"/g)] : []
  return found.length ? found.at(-1)![1] : null
}

/** The pids above this process, so the session that ran us can be told apart (or left out). */
export function ancestorPids(): Set<number> {
  const pids = new Set<number>()
  for (let pid = process.ppid; pid > 1 && !pids.has(pid);) {
    pids.add(pid)
    pid = Number(run("ps", ["-o", "ppid=", "-p", String(pid)]).trim() || 0)
  }
  return pids
}

////////////////
// ## Titles and windows
////////////////

/**
 * Queue `title` for session `id`:  `~/.claude/session-titles/<id>`.
 * - Claude can't run `/rename`:  the `UserPromptSubmit` hook `~/.claude/hooks/session-title.mjs` returns the
 *   file as `sessionTitle` on the session's NEXT prompt, then deletes it (undocumented, found in CLI 2.1.287)
 */
export function queueTitle(id: string, title: string, home = claudeHome()): void {
  mkdirSync(join(home, "session-titles"), { recursive: true })
  writeFileSync(join(home, "session-titles", id), title)
}

/** The title queued for session `id`'s next prompt (`queueTitle()`), or `null`. */
export function queuedTitle(id: string, home = claudeHome()): string | null {
  const file = join(home, "session-titles", id)
  return existsSync(file) ? readFileSync(file, "utf8").trim() : null
}

/**
 * The VS Code window id hosting process `pid` (or an ancestor), or `undefined`.
 * - the extension host above a Claude panel session keeps log files open under `.../logs/<stamp>/window<n>/exthost/`
 * - walks up the parents (`ps -o ppid=`) until one has them
 */
export function windowOf(pid: number): number | undefined {
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
 */
export function thisPid(): number {
  return Number(process.env.CLAUDE_PID) || process.ppid
}

////////////////
// ## Helpers
////////////////

/** One JSON line (a transcript's), or `{}` when it isn't an object. */
export function parseJSONLine(line: string): Record<string, unknown> {
  try {
    const value = JSON.parse(line)
    return value && typeof value === "object" ? value : {}
  } catch {
    return {}
  }
}

/** A JSON file, or `{}`. */
function readJSON(path: string): Record<string, unknown> {
  try {
    return parseJSONLine(readFileSync(path, "utf8"))
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
