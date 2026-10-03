/**
 * Shared types for the `spell` command-line tool -- see `main.ts`.
 * - Runtime-light:  `import type` only, plus the small `CliError` class and `EXIT` codes.
 */
import type { SP } from "$/spell"

////////////////
// ## Targets
////////////////

/**
 * What one command-line argument names -- see `resolveTarget()`.
 * - `arg`:  what was typed, for messages.
 * - `project`:  one spell project, e.g. `@library/cards`, a project folder, `@workspace`.
 * - `file`:  one `.spell` file, inside its project.
 * - `root`:  a whole project root, e.g. `@library` -- commands turn it into projects with `CliSession.projectsFor()`.
 */
export type CliTarget =
  | { kind: "project"; arg: string; project: SP.SpellProject }
  | { kind: "file"; arg: string; file: SP.SpellFile }
  | { kind: "root"; arg: string; title: string; projectIds: string[] }

/** A `CliTarget` once any `root` has become the projects in it. */
export type ResolvedTarget = Exclude<CliTarget, { kind: "root" }>

////////////////
// ## Options
////////////////

/**
 * Flags every command takes.
 * - `verbose`:  let spell's own logging through, to stderr.
 * - `all`:  a bare root means ALL its projects, rather than asking which.
 */
export type GlobalOptions = {
  verbose?: boolean
  all?: boolean
}

/**
 * `spell compile` flags.
 * - `stdout`:  print a project's compiled output rather than writing `<Project>.compiled.js`.
 * - `force`:  recompile the projects it imports, too, even those already compiled
 */
export type CompileOptions = GlobalOptions & {
  stdout?: boolean
  force?: boolean
}

/**
 * `spell describe` flags.
 * - `inherited`:  list members types inherit, too
 * - `compiled`:  show the javascript something compiles to -- when describing ONE thing
 * - `json`:  print the explorer's own data, rather than text
 */
export type DescribeOptions = GlobalOptions & {
  inherited?: boolean
  compiled?: boolean
  json?: boolean
}

/**
 * `spell check` flags.
 * - `json`:  print problems as a JSON array of `Problem`s, rather than lines
 */
export type CheckOptions = GlobalOptions & {
  json?: boolean
}

/**
 * `name` for comparing as people would:  lower case, with spaces, `-` and `_` all one space --
 * so `stock pile` finds `Stock_Pile`, and `short-suit` finds `short_suit`.
 */
export function normalizedName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[\s_-]+/g, " ")
    .trim()
}

/**
 * `spell watch` flags.
 * - `checkOnly`:  re-check on each change, rather than recompile -- writes nothing
 * - `test`:  run each project's tests after each rebuild with no errors -- `spell test --watch`
 * - `name`:  with `test`, only tests whose names contain it
 */
export type WatchOptions = GlobalOptions & {
  checkOnly?: boolean
  test?: boolean
  name?: string
}

/**
 * `spell run` flags.
 * - `browser`:  `true` opens the project in a browser even if it shows no UI;  `false` never does.  Left out:  only
 *   if it tried to show one.
 */
export type RunOptions = GlobalOptions & {
  browser?: boolean
}

/**
 * `spell test` flags.
 * - `name`:  only tests whose names contain it, e.g. `deck` -- ignoring case, and spaces ~== `-` ~== `_`
 * - `watch`:  run them again whenever the project changes -- `spell watch --test`
 */
export type TestOptions = GlobalOptions & {
  name?: string
  watch?: boolean
}

/**
 * `spell projects` flags.
 * - `json`:  print the list as JSON
 */
export type ProjectsOptions = GlobalOptions & {
  json?: boolean
}

/**
 * `spell speed` flags.
 * - `runs`:  how many runs per side, each a fresh process -- default 3
 * - `against`:  a git ref, e.g. `HEAD`, to time as well, as "Previous"
 * - `json`:  print each side's combined results as JSON
 */
export type SpeedOptions = GlobalOptions & {
  runs?: number
  against?: string
  json?: boolean
}

/**
 * `spell format` flags.
 * - `check`:  write nothing:  list the files that would change, and exit 1 if any would
 */
export type FormatOptions = GlobalOptions & {
  check?: boolean
}

/**
 * `spell parse` flags.
 * - `rule`:  parse as this rule only, e.g. `expression`
 * - `in`:  parse inside this target's project, e.g. `@test/Solitaire`
 * - `json`:  print the result as JSON
 */
export type ParseOptions = GlobalOptions & {
  rule?: string
  in?: string
  json?: boolean
}

/**
 * `spell explain` flags.
 * - `in`:  look in this target's project, too, e.g. `@test/Solitaire`
 * - `json`:  print what was found as JSON
 */
export type ExplainOptions = GlobalOptions & {
  in?: string
  json?: boolean
}

/**
 * `spell serve` flags.
 * - `port`:  the editor's port -- default 3000;  its server's is the next one up
 * - `headless`:  don't open a browser
 */
export type ServeOptions = GlobalOptions & {
  port?: number
  headless?: boolean
}

/**
 * `spell icons` flags.
 * - `pack`:  only this pack, e.g. `fa7-brands`
 * - `json`:  print the icons found as JSON
 * - `open`:  show them in a browser, as pictures
 */
export type IconsOptions = GlobalOptions & {
  pack?: string
  json?: boolean
  open?: boolean
}

/**
 * `spell dev commands` flags.
 * - `json`:  print every command, and the problems, as JSON
 */
export type CommandsOptions = GlobalOptions & {
  json?: boolean
}

/**
 * `spell new` flags.
 * - `in`:  make the project in this folder -- default `@user`'s, `projects/user/`
 */
export type NewOptions = GlobalOptions & {
  in?: string
}

////////////////
// ## Running
////////////////

/**
 * What `runProject.ts` -- the child process `spell run` / `spell test` start -- is to do.  Passed as JSON,
 * in env var `SPELL_RUN`.
 * - `mode`:  `run` the project, or run its `test ...` functions and report
 * - `name`:  the project's, for messages
 * - `entry`:  URL of its compiled javascript -- a temp file, never in the project
 * - `projects`:  URL of each project it imports' `<Project>.compiled.js`, by id -- for `@spell/project/<id>`
 * - `spellCore`:  URL of `core`'s `src/index.ts`, for `@spell/core`
 * - `verbose`:  `test` shows every check, and anything printed, not just failures
 * - `filter`:  `test` runs only tests whose names contain it -- see `runProject.ts`
 */
export type RunSpec = {
  mode: "run" | "test"
  name: string
  entry: string
  projects: Record<string, string>
  spellCore: string
  verbose?: boolean
  filter?: string
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
 * One error in the spell, as `spell check` reports it -- see `CliSession.problems()`.
 * - `project`:  its project's id
 * - `path`:  absolute path of the file it's in -- none if the whole parse crashed
 * - `line`, `column`:  where, from 1
 */
export type Problem = {
  project: string
  path?: string
  line?: number
  column?: number
  message: string
}

////////////////
// ## Status
////////////////

/** Where a `StatusRow`'s work has got to. */
export type StatusState = "running" | "ok" | "errors" | "failed"

/**
 * One line of progress in a `StatusReporter`, e.g. one project compiling.
 * - `label`:  what's being worked on, e.g. a project id
 * - `note`:  short outcome after the label, e.g. `3 errors · wrote Foo.compiled.js`
 * - `details`:  lines listed under it, e.g. each error
 */
export type StatusRow = {
  label: string
  state: StatusState
  note?: string
  details?: string[]
}

////////////////
// ## Errors
////////////////

/** Process exit codes. */
export const EXIT = {
  /** all went well */
  OK: 0,
  /** the spell had errors, e.g. a line that doesn't parse */
  ERRORS: 1,
  /** the command line itself was wrong, e.g. an unknown project */
  USAGE: 2
} as const

/**
 * A problem to tell the user about in plain words, then exit -- NOT a crash, so no stack trace.
 * - `exitCode` defaults to `EXIT.USAGE`.
 */
export class CliError extends Error {
  exitCode: number
  constructor(message: string, exitCode: number = EXIT.USAGE) {
    super(message)
    this.exitCode = exitCode
  }
}
