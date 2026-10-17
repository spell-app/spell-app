/**
 * Barrel for the `spell` command-line tool's commands, one per file -- flattened into `$/cli`.
 * - Each is `(session, args, options) => Promise<exitCode>`,
 *   wired up in `main.ts`, or `devProgram.ts` for `spell dev`.
 * - NOT here:  the `epic` command's verbs, `$/epics/command/` (epic `epic-eject` P5).
 *   `spell dev` keeps their old spellings as aliases, in `devProgram.ts`.
 * - NOTE: the pass-throughs (`docs`, `design`, `server`, `vscode`) are `(args) => Promise<exitCode>`,
 *   and import no barrel:  the lean `spell dev` entry, `devMain.ts`, loads them without spell.
 *   - So do `pack` and `bundles`, `(args, options) => Promise<exitCode>`.
 */
export * from "./compileCommand"
export * from "./checkCommand"
export * from "./describeCommand"
export * from "./exploreCommand"
export * from "./runCommand"
export * from "./watchCommand"
export * from "./projectsCommand"
export * from "./speedCommand"
export * from "./formatCommand"
export * from "./parseCommand"
export * from "./replCommand"
export * from "./explainCommand"
export * from "./newCommand"
export * from "./iconsCommand"
export * from "./serveCommand"
export * from "./commandsCommand"
export * from "./docsCommand"
export * from "./designCommand"
export * from "./serverCommand"
export * from "./vscodeCommand"
export * from "./staticCommand"
export * from "./ponyCommand"
export * from "./wwodCommand"
export * from "./packCommand"
export * from "./bundlesCommand"
