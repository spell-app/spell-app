/**
 * Barrel for the `spell` command-line tool's commands, one per file -- flattened into `$/cli`.
 * - Each is `(session, args, options) => Promise<exitCode>`, wired up in `main.ts`, or `devProgram.ts` for
 *   `spell dev`.
 * - NOTE: the pass-throughs (`planDoc`, `goals`, `docs`, `details`, `server`, `window`, `vscode`) are
 *   `(args) => Promise<exitCode>`, and import no barrel:  the lean `spell dev` entry, `devMain.ts`, loads them
 *   without spell.  So does `pack`, `(args, options) => Promise<exitCode>`.
 */
export * from "./compileCommand"
export * from "./checkCommand"
export * from "./describeCommand"
export * from "./exploreCommand"
export * from "./goalsCommand"
export * from "./planDocCommand"
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
export * from "./sessionCommand"
export * from "./worktreeCommand"
export * from "./parkCommand"
export * from "./stockCommand"
export * from "./sharedCommand"
export * from "./docsCommand"
export * from "./detailsCommand"
export * from "./designCommand"
export * from "./serverCommand"
export * from "./windowCommand"
export * from "./vscodeCommand"
export * from "./staticCommand"
export * from "./ponyCommand"
export * from "./agentsCommand"
export * from "./packCommand"
