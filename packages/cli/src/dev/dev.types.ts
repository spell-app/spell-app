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

/**
 * What `migrateWorktree()` does with one shared file of a worktree.
 * - `action`:  `skip` (the worktree didn't change it, or matches), `take` (the worktree's copy goes into the shared
 *   repo), `delete` (the worktree deleted it), `union` (a log changed on both sides:  merged, `text`), `rebuild` (a
 *   built file changed on both sides:  the shared copy stays, its tool runs again), `conflict`
 */
export type FoldReport = {
  file: string
  action: "skip" | "take" | "delete" | "union" | "rebuild" | "conflict"
  text?: string
}

/**
 * `spell dev shared migrate`'s answer.
 * - `folds`:  every shared file's fate;  `conflicts`:  the files that stopped it;  `done`:  it went through (not a
 *   dry run, no conflicts)
 */
export type MigrateReport = {
  worktree: string
  branch: string
  folds: FoldReport[]
  conflicts: string[]
  done: boolean
}

////////////////
// ## Merging main
////////////////

/**
 * One generated output family, and the command that rebuilds it from the merged source (`GENERATORS`).
 * - `outputs`:  globs, relative to a checkout's root (`path.matchesGlob()`);  a folder is `<folder>/**`
 * - `run`:  the command, run in `cwd` (relative to a checkout's root)
 */
export type Generator = { name: string; outputs: string[]; cwd: string; run: string[] }

/**
 * A snapshot entry the merge's regenerated `.snap` holds with a value NEITHER side had:  nobody reviewed it.
 * - `file`:  the `.snap`, relative to the checkout;  `keys`:  its `exports[...]` names
 */
export type SnapshotReview = { file: string; keys: string[] }

/**
 * `spell dev worktree merge-main`'s answer.
 * - `result`:
 *   - `up-to-date`:  `main` is already in the branch
 *   - `fast-forward`:  the branch had nothing of its own, so it moved to `main`
 *   - `merged`:  a merge commit, generated files regenerated
 *   - `conflicts`:  stopped mid-merge on `conflicts`;  resolve them, `git add` them, then `--continue`
 * - `regenerated`:  each generator that ran, and the files it staged
 * - `review`:  snapshot entries to show Owen (`SnapshotReview`)
 * - `unstaged`:  files a generator changed outside its `outputs`, left for a person to look at
 */
export type MergeMainReport = {
  branch: string
  result: "up-to-date" | "fast-forward" | "merged" | "conflicts"
  conflicts: string[]
  regenerated: { name: string; files: string[] }[]
  review: SnapshotReview[]
  unstaged: string[]
}

/**
 * `mergeMain()`'s options.
 * - `mode`:  `start` (default) merges `main`;  `continue` finishes a merge it stopped on other conflicts
 * - `generators`:  the table (tests pass their own);  default `GENERATORS`
 * - `snapshotUpdate`:  the command that updates the snapshots of `tests`;  default `yarn vp test run <tests> --update`
 */
export type MergeMainOptions = {
  mode?: "start" | "continue"
  generators?: Generator[]
  snapshotUpdate?: (tests: string[]) => string[]
}

////////////////
// ## Pass-through tools
////////////////

/**
 * How `spell dev` runs one repo tool, the way its yarn script did -- see `runTool()`.
 * - `tool`:  the script, relative to a checkout's root
 * - `tsx`:  the `tsconfig.json` it runs under `tsx` with, relative to a checkout's root;  none:  plain `node`
 * - `cwd`:  the folder it runs in, relative to a checkout's root;  none:  the caller's
 *   - `yarn workspace @spell-app/docs` ran the docs tools in `packages/docs`, and they print paths relative to it
 */
export type ToolSpec = { tool: string; tsx?: string; cwd?: string }

////////////////
// ## Agent rules
////////////////

/**
 * One broken citation or path (`checkAgentRules()`).
 * - `file`:  relative to the checkout;  `cite`:  what it says (`§12 › "title"`, a backticked path)
 */
export type AgentRulesProblem = { file: string; line: number; cite: string; problem: string }

/** `spell dev agents check`'s answer:  WWOD's size, how many files were read, and what's broken. */
export type AgentRulesReport = { sections: number; rules: number; files: number; problems: AgentRulesProblem[] }

////////////////
// ## Component packs
////////////////

/**
 * A component pack:  a package `packages/<name>/` whose `package.json` has a `spellPack` (`readPack()`).
 * - `prefix`:  every tag's, e.g. `epic-`;  `dir`:  the package, absolute
 */
export type PackInfo = { name: string; prefix: string; dir: string }

/**
 * What `spell dev pack new` / `element` did, paths relative to the checkout.
 * - `created`:  files written;  `skipped`:  files already there, left as they were
 * - `updated`:  files it added to, with what in parens:  `package.json (workspaces)`, a barrel's export ...
 * - `built`:  the pack's build, when it ran (`--no-build` skips it)
 */
export type PackScaffoldReport = {
  pack: string
  created: string[]
  updated: string[]
  skipped: string[]
  built?: PackBuildReport
}

/**
 * `spell dev pack build`'s answer.
 * - `files`:  what it wrote, relative to the checkout;  `tags`:  the catalog's;  `hash`:  the sources'
 */
export type PackBuildReport = { pack: string; files: string[]; tags: string[]; hash: string }

/**
 * `spell dev pack check`'s answer for one pack.
 * - `hash`:  the sources' now;  `stale`:  each generated file that's out of date, and why (none:  current)
 */
export type PackCheckReport = { pack: string; hash: string; stale: string[] }
