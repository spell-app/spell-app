/**
 * Barrel for the `spell` command-line tool's commands, one per file -- flattened into `~/cli`.
 * - Each is `(session, args, options) => Promise<exitCode>`, wired up in `main.ts`.
 */
export * from "./compileCommand"
export * from "./checkCommand"
export * from "./describeCommand"
export * from "./exploreCommand"
export * from "./runCommand"
export * from "./watchCommand"
