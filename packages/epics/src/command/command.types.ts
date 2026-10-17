/**
 * Types for the `epic` command's verb groups (`$/epics/command/`):
 * Claude Code sessions, worktrees, parked work, taking stock, shared content, requests.
 * - Runtime-light:  types, constants, the folder's one error class, and pure helpers over them.
 * - Its position:  the BOTTOM of the folder's imports, and loaded by plain `node` too (types stripped):
 *   the prompt gate (`PromptGate.ts`, which the `UserPromptSubmit` hook imports by path) needs `TITLE_ICONS`.
 *   - So NEVER give it a value import, an alias, an `enum` or a parameter property:  plain `node` can't load those.
 */

////////////////
// ## Exit codes and errors
////////////////

/** What every verb exits with. */
export const EXIT = {
  /** all went well */
  OK: 0,
  /** it failed, or found problems;  an unknown verb */
  ERRORS: 1,
  /** the command line itself was wrong, e.g. a missing name */
  USAGE: 2
} as const

/**
 * A verb's own failure, its message all there is to say:  the program prints it (no stack) and exits `exitCode`.
 * - default `EXIT.USAGE`:  most are a command line that can't work (`find:  which name?`)
 * - anything else thrown is a bug, and prints its stack
 */
export class EpicCommandError extends Error {
  /** what the program exits with */
  exitCode: number
  constructor(message: string, exitCode: number = EXIT.USAGE) {
    super(message)
    this.exitCode = exitCode
  }
}
EpicCommandError.prototype.name = "EpicCommandError"

/**
 * A verb's arguments, read from the command line as typed:  `--key value` flags, `--switch` switches, the rest in
 * order (`parseVerbArgs()`).
 * - flag names camelCased:  `--dry-run` is `dryRun`
 */
export type VerbArgs = { positional: string[]; flags: Record<string, string | true> }

/**
 * `argv` as `VerbArgs`.
 * - `switches`:  the flags that take no value, camelCased:  a word after one is a positional (`--all seo`)
 * - any other flag takes the next word as its value, unless that starts with `--`
 */
export function parseVerbArgs(argv: string[], switches: readonly string[] = []): VerbArgs {
  const positional: string[] = []
  const flags: Record<string, string | true> = {}
  for (let i = 0; i < argv.length; i++) {
    const match = /^--([\w-]+)$/.exec(argv[i]!)
    if (!match) {
      positional.push(argv[i]!)
      continue
    }
    const name = match[1]!.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())
    const next = argv[i + 1]
    if (!switches.includes(name) && next !== undefined && !next.startsWith("--")) flags[name] = argv[++i]!
    else flags[name] = true
  }
  return { positional, flags }
}

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
 * One saved session, summarized from its transcript `~/.claude/projects/<slug>/<id>.jsonl` -- `Sessions.summarize()`.
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
 * A session found by name or worktree -- `Sessions.named()`.
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
 * What another session has been doing -- `Sessions.digest()`.
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

/**
 * A running session, as `/worktrees` sees it -- `Sessions.live()`.
 * - `name`:  its title;  `agent`:  what `ListAgents` and `SendMessage` call it (the registry's name)
 * - `checkout`:  `main checkout`, `worktree <name>` or `(not in git)`;  `folder`:  `cwd` inside it (`""` at its root)
 * - `state`:  the registry's `busy` / `idle` / `waiting`, or `hung` for `busy` with no transcript write for
 *   `Stock.SILENT_MINUTES`
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

/**
 * The icon a session's title starts with, saying where its work stands (Owen, 2026-10-07):
 * - 🚧 under way:  `/isolate`, `/epic <name>`, `/unpark`, `/epic resume` (the prompt gate, `PromptGate`)
 * - 📅 a future epic written down (`/epic future`)
 * - ✅ merged (`epic session done`)
 * - from its epic's state (`epic session icons`;  `$/epics/list/EpicState`):
 *   🚨 errors (every phase done, items need Owen), ⏸️ paused (phases left, untouched for days)
 */
export const TITLE_ICONS = { active: "🚧", future: "📅", done: "✅", errors: "🚨", paused: "⏸️" } as const

/** Icons titles may still start with from before:  😴, sleeping (gone 2026-10-10:  epic `airplane` P8). */
const OLD_TITLE_ICONS = ["😴"]

/** `title` without its leading icon (`TITLE_ICONS`, or an old one):  `🚧 seo` -> `seo`;  the name its work goes by. */
export function bareTitle(title: string): string {
  const icons = [...Object.values(TITLE_ICONS), ...OLD_TITLE_ICONS].join("|")
  return title.replace(new RegExp(`^(?:${icons})\\s*`, "u"), "")
}

////////////////
// ## Worktrees and parked work
////////////////

/** What `Git.run()` returns. */
export type GitResult = { ok: boolean; out: string; err: string; code: number }

/**
 * The checkout holding a folder -- `Worktrees.checkoutOf()`.
 * - `label`:  `main checkout` or `worktree <name>`;  outside git, `root` is `undefined` and `label` `(not in git)`
 * - `inside`:  the folder relative to the root, `""` at the root
 */
export type CheckoutPlace = { root?: string; label: string; branch: string; inside: string }

/**
 * Where session / worktree / plan `name` stands -- `Worktrees.nameStatus()`.
 * - `ahead`:  commits on branch `name` not in `main`
 * - `merged`:  the branch had commits of its own (its reflog moved past "Created") and all are in `main` now
 * - `plan`:  its epic page folder;  `planDone`:  every phase done
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
 * What an epic page's state is read from (`$/epics/list/EpicState` `EpicFacts`) -- `Worktrees.planFacts()`.
 * - `phases`:  each phase's status;  `updated`, `future`, `standing`:  the page's
 * - `urgent`:  the ids of the items that need Owen
 */
export type PlanFacts = {
  phases: string[]
  updated: string | null
  future: boolean
  standing: boolean
  urgent: string[]
}

/**
 * An epic page's summary, from the `epic` tool's `summaries` (`summary --json` per file);  `error` when it couldn't
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

/**
 * What `Parking.waitFor()` ends with.
 * - `code`:  `0` finished (with the status, `why` saying which);  `2` time's up;  `3` nothing by that name
 */
export type WaitResult = { code: number; status?: NameStatus; message?: string }

/** A worktree under `.claude/worktrees/` with no running session in it. */
export type IdleWorktree = { path: string; branch: string }

////////////////
// ## Taking stock
////////////////

/**
 * Everything open in the repo, grouped -- `Stock.take()`, `epic stock`.
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

/**
 * - `active` -- in process:  a session working in it, or touched in the last `Stock.RECENT_HOURS`
 * - `stalled` -- hung or parked:  `/park`ed, waiting, a busy session gone silent, a question nobody answered, work
 *   untouched for `Stock.RECENT_HOURS`, a plan with phases left and nothing working on it
 * - `dead` -- nothing of value left:  merged or empty worktrees and branches, sessions idle for `Stock.STALE_HOURS`
 *   (`Stock.RECENT_HOURS` outside any worktree), window files with no worktree
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

////////////////
// ## Shared content
////////////////

/**
 * The shared-content manifest (`Shared.configOf()`).
 * - `main`:  the main checkout;  `dir`:  the shared repo, absolute;  `links`:  folders every checkout links,
 *   relative to a checkout's root
 * - `worktrees`:  the folder holding the worktrees, absolute (`.epic/config.json5`'s `worktreesFolder`)
 */
export type SharedConfig = { main: string; dir: string; worktrees: string; links: string[] }

/**
 * One link in one checkout:  its `state` (`Shared.linkState()`), and what `Shared.link()` did about it (`action`).
 */
export type LinkReport = {
  path: string
  state: "ok" | "tracked" | "missing" | "real" | "dangling" | "elsewhere"
  action?: "ok" | "tracked" | "linked" | "replaced" | "diverged" | "no-shared"
}

/**
 * `epic shared status`.
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
 * What `SharedMigration` does with one shared file of a worktree.
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
 * `epic shared migrate`'s answer.
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
 * One generated output family, and the command that rebuilds it from the merged source:  a line of a checkout's
 * `.epic/generators.json5` (`MainMerge.generatorsOf()`).
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
 * `epic worktree merge-main`'s answer.
 * - `result`:
 *   - `up-to-date`:  `main` is already in the branch
 *   - `fast-forward`:  the branch had nothing of its own, so it moved to `main`
 *   - `merged`:  a merge commit, generated files regenerated
 *   - `conflicts`:  stopped mid-merge on `conflicts`;  resolve them, `git add` them, then `--continue`
 * - `untracked`:  conflicted files the merged `.gitignore` ignores (generated output no longer committed), taken out
 *   of the index and left on disk
 * - `regenerated`:  each generator that ran, and the files it staged
 * - `review`:  snapshot entries to show Owen (`SnapshotReview`)
 * - `unstaged`:  files a generator changed outside its `outputs`, left for a person to look at
 */
export type MergeMainReport = {
  branch: string
  result: "up-to-date" | "fast-forward" | "merged" | "conflicts"
  conflicts: string[]
  untracked: string[]
  regenerated: { name: string; files: string[] }[]
  review: SnapshotReview[]
  unstaged: string[]
}

////////////////
// ## Requests
////////////////

/**
 * One request Owen sent an epic from another session (`Requests`):  its `request.md`, read.
 * - `from`:  the sending session's title and id, `🚧 python (83d39e12)`
 * - `at`:  when, local time to the minute
 * - `status`:  `new` until the epic's session files it, then `filed`
 * - `filed`:  where it went, `P7 · Comment Threads`
 * - `text`:  Owen's words, verbatim
 * - `context`:  what the sender was looking at
 * - `images`:  file names beside `request.md`
 */
export type EpicRequest = {
  id: string
  epic: string
  from: string
  at: string
  status: string
  filed?: string
  text: string
  context?: string
  images: string[]
}

/**
 * What `Requests.send()` takes.
 * - `epic`:  the epic it goes to
 * - `text`:  Owen's words, kept verbatim
 * - `from`:  the sending session's id (`CLAUDE_CODE_SESSION_ID`);  its pasted images come from its transcript
 * - `images`:  how many of the newest images Owen pasted to keep (0:  none)
 * - `context`:  what the sender was looking at:  a page, a file, an item id
 */
export type SendRequestProps = {
  epic: string
  text: string
  from?: string
  images?: number
  context?: string
}

/**
 * What `Requests.send()` did.
 * - `folder`:  where the request was written
 * - `receivers`:  the epic's running sessions, to tell (`SendMessage`);  none:  open its window
 * - `fromEpic`:  the sender IS one of the epic's sessions:  it takes the request up itself
 */
export type SentRequest = {
  request: EpicRequest
  folder: string
  receivers: RunningSession[]
  fromEpic: boolean
}

/** One image from a transcript:  its type (`image/png`) and its bytes, base64. */
export type PastedImage = {
  mediaType: string
  data: string
}

////////////////
// ## Tools
////////////////

/**
 * How the `epic` command runs one of its tools, a script in a child `node` -- `EpicTools.run()`.
 * - `tool`:  the script, relative to a checkout's root
 * - `tsx`:  the `tsconfig.json` it runs under `tsx` with, relative to a checkout's root;  none:  plain `node`
 * - `cwd`:  the folder it runs in, relative to the DATA checkout's root (the caller's);  none:  the caller's folder
 *   - the docs tools run in `packages/epics` (as `yarn workspace` ran them), and print paths relative to it
 * - `code`:  whose copy of the script runs
 *   - `own` (default):  the one beside the running `epic`, so every checkout runs ONE copy of the epic code
 *   - `caller`:  the caller's checkout's, for a tool that serves that checkout (the page server)
 */
export type ToolSpec = { tool: string; tsx?: string; cwd?: string; code?: "own" | "caller" }
