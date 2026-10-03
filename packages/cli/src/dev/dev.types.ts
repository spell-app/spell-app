/**
 * Types for `spell dev`'s repo tools (`src/dev/`):  Claude Code sessions, worktrees, parked work.
 * - Runtime-light:  types and constants only.
 */

////////////////
// ## Sessions
////////////////

/**
 * A live Claude Code session, from its registry record `~/.claude/sessions/<pid>.json`.
 * - only the fields we read;  the record has more
 */
export type RunningSession = {
  /** the `claude` process */
  pid: number
  /** session id, the transcript's file name */
  sessionId: string
  /** `busy`, `idle`, `waiting` ... */
  status?: string
  /** `cli`, `claude-vscode`, `claude-desktop`, `sdk-ts` ... */
  entrypoint?: string
  /** folder it started in */
  cwd?: string
  /** title the registry knows, when any */
  name?: string
  /** what a `waiting` session waits for, e.g. `permission` */
  waitingFor?: string
}

/**
 * One saved session, summarized from its transcript `~/.claude/projects/<slug>/<id>.jsonl` -- `summarizeSession()`.
 * - `title`:  the last `custom-title` (`/rename`), else the last `ai-title`, else the first prompt (60 chars)
 * - `cwd`:  the LATEST folder it worked in, so a session that moved into a worktree shows the worktree
 * - `last`:  the transcript's mtime, in ms
 */
export type SessionSummary = {
  id: string
  title: string
  /** titled by hand (`custom-title`) */
  named: boolean
  prompt: string | null
  entrypoint: string | null
  cwd: string | null
  last: number
}

/**
 * A session found by name or worktree -- `sessionsNamed()`.
 * - `last`:  ISO timestamp of its last line with a `cwd`
 */
export type NamedSession = {
  id: string
  /** its `custom-title`, or `-` */
  title: string
  last: string
  cwd: string | null
}

/**
 * What another session has been doing -- `digestTranscript()`.
 * - `prompts`:  what Owen typed, oldest first (`when` is the timestamp's first 16 chars)
 * - `pending`:  an `AskUserQuestion` still waiting, with its options
 */
export type TranscriptDigest = {
  path: string
  prompts: { when: string; text: string }[]
  lastReply: string | null
  pending: PendingQuestion[] | null
}

/** One question of a waiting `AskUserQuestion`. */
export type PendingQuestion = {
  question?: string
  options?: { label?: string; description?: string }[]
}

////////////////
// ## Worktrees and parked work
////////////////

/**
 * Where a live session works -- `spell dev worktree list`.
 * - `worktree`:  `main checkout`, `worktree <name>`, or `(not in git)`
 * - `folder`:  inside its checkout (`""` at the root);  the full path outside a checkout
 * - `this`:  the session that ran the command
 */
export type SessionPlace = {
  name: string
  id: string
  status: string
  where: string
  worktree: string
  branch: string
  folder: string
  this: boolean
}

/**
 * Where session / worktree / plan `name` stands -- `nameStatus()`.
 * - `ahead`:  commits on branch `name` not in `main`
 * - `merged`:  the branch had commits of its own (its reflog moved past "Created") and all are in `main` now
 * - `plan`:  its plan doc folder;  `planDone`:  every phase done
 * - `finished`:  `merged` or `planDone`, `why` saying which (`park wait` adds "worktree removed", "session exited")
 */
export type NameStatus = {
  name: string
  worktree: string | null
  branch: string | null
  ahead: number
  merged: boolean
  plan: string | null
  planDone: boolean
  sessions: { id: string; title: string | null; running: boolean; pid: number | null }[]
  finished: boolean
  why: string | null
}

/** Something `/wait-for ?` offers:  a worktree, an epic, or a running session. */
export type WaitCandidate = { name: string; label: string }

/**
 * A parked worktree's note, `.claude/worktrees/<name>/PARKED-<name>.md`.
 * - `state`:  from line 1, `<!-- park: <state> -->`:  `parked`, `waiting:<other>`, `resumed`
 * - `stopped`:  the first line under "## Where it stopped"
 */
export type ParkedNote = { name: string; file: string; state: string; stopped: string }

/** Entrypoints of LOCAL sessions:  web, cloud and SDK sessions are left out. */
export const LOCAL_ENTRYPOINTS = new Set(["cli", "claude-vscode", "claude-desktop"])

/** Where an entrypoint runs, in words. */
export const ENTRYPOINT_PLACES: Record<string, string> = {
  cli: "terminal",
  "claude-vscode": "VS Code",
  "claude-desktop": "Desktop"
}
