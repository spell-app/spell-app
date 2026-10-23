/**
 * Shared types for spell-app's `spell` commands (`cli/commands.ts`) and the language commands' work (`cli/hooks.ts`).
 * - Runtime-light:  types, plus `normalizedName()`.
 * - The kit's (`spell/cli`) and the language's (`spell-parser/cli`) are re-exported here, so every file of this
 *   folder says `CLI.CliError`, `CLI.CompileOptions` ...:  ONE `CliError` class for every repo's commands.
 */
import type { SP } from "spell-parser/spell"
import type { GlobalOptions } from "spell/cli"

export { CliError, EXIT, type GlobalOptions } from "spell/cli"
export type {
  CompileOptions,
  DescribeOptions,
  ExplainOptions,
  FormatOptions,
  LintOptions,
  ParseOptions,
  RunOptions,
  SeedOptions,
  SpeedtestOptions,
  TestOptions,
  TranslateOptions,
  WatchOptions
} from "spell-parser/cli"

////////////////
// ## Projects
////////////////

/**
 * What one command-line argument names -- see `resolveProject()`.
 * - `arg`:  what was typed, for messages.
 * - `project`:  one spell project, e.g. `@spell/examples/Solitaire`, a project folder, `@here`.
 * - `file`:  one `.spell` file, inside its project.
 * - `root`:  a whole project root, e.g. `@spell/library` -- commands turn it into projects with `CliSession.projectsFor()`.
 */
export type CliProject =
  | { kind: "project"; arg: string; project: SP.SpellProject }
  | { kind: "file"; arg: string; file: SP.SpellFile }
  | { kind: "root"; arg: string; title: string; projectIds: string[] }

/** A `CliProject` once any `root` has become the projects in it. */
export type ResolvedProject = Exclude<CliProject, { kind: "root" }>

////////////////
// ## Options
////////////////

/**
 * `name` for comparing as people would:  lower case, with spaces, `-`, `_` and a word's capital all one space.
 * - So `stock pile` finds `StockPile` (a type's name since epic `drawable-thing` P11),
 *   and `short-suit` finds `short_suit` and `shortSuit`.
 */
export function normalizedName(name: string): string {
  return name
    .replace(/(?<=[a-z0-9])(?=[A-Z])/g, " ")
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim()
}

/**
 * `spell projects` flags.
 * - `json`:  print the list as JSON
 */
export type ProjectsOptions = GlobalOptions & {
  json?: boolean
}

/**
 * `spell app serve` flags.
 * - `port`:  the editor's port -- default 3000;  its server's is the next one up
 * - `headless`:  don't open a browser
 */
export type ServeOptions = GlobalOptions & {
  port?: number
  headless?: boolean
}

/**
 * `spell app create` flags (`spell new` until epic `repo-split` P13).
 * - `in`:  make the project in this folder -- default `owen@spell`'s, your space's (`<spell-spaces>/@spell/owen@/`)
 */
export type NewOptions = GlobalOptions & {
  in?: string
}

////////////////
// ## Running
////////////////

/**
 * What `runProject.ts` -- the child process `spell run` / `spell test` start -- is to do.
 * - Passed as JSON, in env var `SPELL_RUN`.
 * - `mode`:  `run` the project, or run its `test ...` functions and report
 * - `name`:  the project's, for messages
 * - `entry`:  URL of its compiled javascript -- a temp file, never in the project
 * - `projects`:  URL of each project it imports' `<Project>.spell.js`, by id -- for `@spell/project/<id>`
 * - `core`:  URL of `core`'s `src/index.ts`, for `@spell/core`
 * - `verbose`:  `test` shows every check, and anything printed, not just failures
 * - `filter`:  `test` runs only tests whose names contain it -- see `runProject.ts`
 * - `dom`:  run in a fake page, drawing what it draws, and print it -- see `fakeDom()` in `runProject.ts`
 * - `seed`:  start its random numbers from it, before it loads -- see `core.seedRandom()`.
 *   Left out:  random, as in a browser.
 * - `messages`:  what the core says, e.g. a test's lines, in the language the program speaks (epic `spanish` P12, P19):
 *   see `core.useMessages()`.
 *   Left out:  English.
 */
export type RunSpec = {
  mode: "run" | "test"
  name: string
  entry: string
  projects: Record<string, string>
  core: string
  verbose?: boolean
  filter?: string
  dom?: boolean
  seed?: number
  messages?: Record<string, string>
}

/**
 * What `runProject.ts` tells `spell run` once the project has loaded, over IPC.
 * - `skipped`:  what it tried which needs a browser, e.g. `start the game` -- see `headless()`
 */
export type RunReport = {
  skipped: string[]
}

////////////////
// ## Places
////////////////

/**
 * Where something in the Type Explorer's tree is declared -- see `CLI.declaredAt()`.
 * - `uri`:  of the file it's in
 * - `line`:  line its statement starts on, from 1
 */
export type DeclaredAt = {
  uri: string
  line: number
}

////////////////
// ## Problems
////////////////

/**
 * One error in the spell, as `spell lint` reports it -- see `CliSession.problems()`.
 * - Or a warning, which says so in `severity` -- see `CliSession.warnings()`.
 * - `project`:  its project's id
 * - `path`:  absolute path of the file it's in -- none if the whole parse crashed
 * - `line`, `column`:  where, from 1
 * - `severity`:  `"warning"` for a warning;  none for an error
 */
export type Problem = {
  project: string
  path?: string
  line?: number
  column?: number
  message: string
  severity?: "warning"
}

////////////////
// ## Status
////////////////

/** Where a `StatusRow`'s work has got to. */
export type StatusState = "running" | "ok" | "errors" | "failed"

/**
 * One line of progress in a `StatusReporter`, e.g. one project compiling.
 * - `label`:  what's being worked on, e.g. a project id
 * - `note`:  short outcome after the label, e.g. `3 errors · wrote Foo.spell.js`
 * - `details`:  lines listed under it, e.g. each error
 */
export type StatusRow = {
  label: string
  state: StatusState
  note?: string
  details?: string[]
}
