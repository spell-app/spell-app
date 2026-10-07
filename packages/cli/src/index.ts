/**
 * Barrel for the `spell` command-line tool:  compile, check and explore spell projects from a terminal.
 * - Node-only:  loads projects from disk, and draws Ink screens.
 * - `CliSession` is one command's run;  `resolveProject()` turns an argument into what it names.
 * - NOTE: deliberately left out, as side effects the moment they're imported:
 *   - `main.ts`:  the process entry, run by `bin/spell.mjs`
 *   - `consoleGuard.ts`:  silences `console.*`
 */
export * as CLI from "."
export * from "./cli.types"

export * from "./findCheckout"
export * from "./resolveProject"
export * from "./CliSession"
export * from "./scopeTree"
export * from "./describeText"
export * from "./parseText"
export * from "./recentProjects"
export * from "./projectChoices"
export * from "./serve"
export * from "./iconSearch"
export * from "./runInBrowser"
export * from "./ui"
export * from "./dev"
export * from "./commands"
