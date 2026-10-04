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
  /** when the record last changed, in ms */
  updatedAt?: number
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

/**
 * A plan doc's summary, from the plan-doc tool's `summaries` (`summary --json` per file);  `error` when it couldn't
 * read the doc.  Only the fields read here.
 */
export type PlanSummary = {
  title?: string
  phases?: { n?: number; name?: string; status?: string; estimate?: string }[]
  error?: string
}

/** Something `/wait-for ?` offers:  a worktree, an epic, or a running session. */
export type WaitCandidate = { name: string; label: string }

/**
 * A parked worktree's note, `.claude/worktrees/<name>/PARKED-<name>.md`.
 * - `state`:  from line 1, `<!-- park: <state> -->`:  `parked`, `waiting:<other>`, `resumed`
 * - `stopped`:  the first line under "## Where it stopped"
 */
export type ParkedNote = { name: string; file: string; state: string; stopped: string }

////////////////
// ## Taking stock
////////////////

/**
 * Everything open in the repo, grouped -- `takeStock()`, `spell dev stock`.
 * - `groups`:  item keys per group, in report order
 */
export type StockReport = {
  generated: string
  main: string
  /** every running session on the machine, in this repo or not */
  sessions: LiveSession[]
  /** this repo's worktrees with no session in them */
  idle: IdleWorktree[]
  groups: Record<StockGroup, string[]>
  items: StockItem[]
}

/** A worktree under `.claude/worktrees/` with no running session in it. */
export type IdleWorktree = { path: string; branch: string }

/**
 * - `active` -- in process:  a session working in it, or touched in the last `RECENT_HOURS`
 * - `stalled` -- hung or parked:  `/park`ed, waiting, a busy session gone silent, a question nobody answered, work
 *   untouched for `RECENT_HOURS`, a plan with phases left and nothing working on it
 * - `dead` -- nothing of value left:  merged or empty worktrees and branches, sessions idle for `STALE_HOURS`
 *   (`RECENT_HOURS` outside any worktree), window files with no worktree
 */
export type StockGroup = "active" | "stalled" | "dead"

/**
 * One thing open:  a worktree, branch, plan, session, stash or window file.
 * - `key`:  `<kind>:<name>`;  `why`:  the reasons for its group, in words
 * - `actions`:  what `/worktrees` offers;  each action's `commands` are shell lines to run one by one from the MAIN
 *   checkout, `[]` for a step Claude takes (open a session, `/wtf`, ask)
 * - the other fields depend on `kind`:
 *   - worktree / branch:  `worktree` ... `morning`;  `unique`:  commits whose patch isn't in `main` yet (not
 *     squashed in);  `everCommitted`:  its reflog moved past "Created"
 *   - plan:  `plan`, `planDone`;  session:  `lastTouched`;  stash:  `stash` (sha);  window:  `file`
 */
export type StockItem = {
  key: string
  kind: "worktree" | "branch" | "plan" | "session" | "stash" | "window"
  name: string
  group?: StockGroup
  why?: string[]
  actions?: StockAction[]
  sessions: LiveSession[]
  worktree?: string | null
  branch?: string | null
  ahead?: number
  unique?: number
  behind?: number
  dirty?: number
  everCommitted?: boolean
  lastCommit?: string | null
  lastTouched?: string | null
  plan?: string | null
  planDone?: boolean
  parked?: { state: string; stopped: string; file: string } | null
  morning?: { file: string } | null
  stash?: string
  file?: string
}

/** Something `/worktrees` can do about an item. */
export type StockAction = { id: string; label: string; commands: string[] }

/**
 * A running session, as `/worktrees` sees it.
 * - `name`:  its title;  `agent`:  what `ListAgents` and `SendMessage` call it (the registry's name)
 * - `checkout`:  `main checkout`, `worktree <name>` or `(not in git)`;  `folder`:  `cwd` inside it (`""` at its root)
 * - `state`:  the registry's `busy` / `idle` / `waiting`, or `hung` for `busy` with no transcript write for
 *   `SILENT_MINUTES`
 * - `question`:  an `AskUserQuestion` with no answer after it, `questionMin` minutes ago
 * - `this`:  the session that ran the command;  `used`:  it has a transcript (got a prompt)
 */
export type LiveSession = {
  id: string
  name: string
  agent: string | null
  pid: number
  cwd: string
  inRepo: boolean
  where: string | null
  checkout: string
  branch: string
  folder: string
  state: string
  waitingFor: string | null
  lastActive: string
  silentMin: number
  question: string | null
  questionMin: number
  this: boolean
  used: boolean
}

/** Entrypoints of LOCAL sessions:  web, cloud and SDK sessions are left out. */
export const LOCAL_ENTRYPOINTS = new Set(["cli", "claude-vscode", "claude-desktop"])

/** Where an entrypoint runs, in words. */
export const ENTRYPOINT_PLACES: Record<string, string> = {
  cli: "terminal",
  "claude-vscode": "VS Code",
  "claude-desktop": "Desktop"
}

////////////////
// ## Shared content
////////////////

/**
 * The shared-content manifest (`sharedConfig()`).
 * - `main`:  the main checkout;  `dir`:  the shared repo, absolute;  `links`:  folders every checkout links,
 *   relative to a checkout's root
 */
export type SharedConfig = { main: string; dir: string; links: string[] }

/**
 * One link in one checkout:  its `state` (`linkState()`), and what `linkCheckout()` did about it (`action`).
 */
export type LinkReport = {
  path: string
  state: "ok" | "tracked" | "missing" | "real" | "dangling" | "elsewhere"
  action?: "ok" | "tracked" | "linked" | "replaced" | "diverged" | "no-shared"
}

/**
 * `spell dev shared status`.
 * - `dir`, `exists`, `isRepo`:  the shared repo;  `dirty`:  files not committed;  `last`:  its newest commit
 * - `checkouts`:  each checkout (`.` the main one) and its links
 */
export type SharedStatus = {
  dir: string
  exists: boolean
  isRepo: boolean
  dirty: number
  last: string
  checkouts: { checkout: string; links: LinkReport[] }[]
}
