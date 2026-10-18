/**
 * Types for `spell dev`'s repo tools (`src/dev/`):  the pass-throughs, the WWOD check, component packs.
 * - Runtime-light:  types and constants only.
 * - The `epic` command's verb groups (sessions, worktrees, parked work, shared content) have their own:
 *   `$/epics/command/command.types`.
 */

////////////////
// ## The commands page
////////////////

/**
 * The commands page's data, from a checkout's root (`spell dev commands`, `spell dev pack new`).
 * - a data file (`DataFile`, epic `epic-workflow` P21), JSON5
 * - its old `commands.json` is read while there's no `.json5`
 */
export const COMMANDS_JSON = "guides/dev/commands/commands.json5"

////////////////
// ## Pass-through tools
////////////////

/**
 * How `spell dev` runs one repo tool, the way its yarn script did -- see `runTool()`.
 * - `tool`:  the script, relative to a checkout's root
 * - `tsx`:  the `tsconfig.json` it runs under `tsx` with, relative to a checkout's root;  none:  plain `node`
 * - `cwd`:  the folder it runs in, relative to a checkout's root;  none:  the caller's
 *   - the docs tools run in `packages/epics` (as `yarn workspace` ran them in the docs package),
 *     and print paths relative to it
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

/** `spell dev wwod check`'s answer:  WWOD's size, how many files were read, and what's broken. */
export type AgentRulesReport = { sections: number; rules: number; files: number; problems: AgentRulesProblem[] }

////////////////
// ## Component packs
////////////////

/**
 * A component pack:  a package `packages/<name>/` whose `package.json` has a `spellPack` (`readPack()`).
 * - `prefix`:  every tag's, e.g. `epic-`;  `dir`:  the package, absolute:  the folder of its `components/`
 * - a pack that's a whole checkout (spell-epic, epic `epic-eject` J14), absolute too:
 *   - `src`:  the folder `$/<name>` names (else `<dir>/src`)
 *   - `manifest`:  the folder of its `package.json` (else `dir`)
 */
export type PackInfo = { name: string; prefix: string; dir: string; src?: string; manifest?: string }

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
