/**
 * Barrel for spell-app's `spell` commands' work, one per file -- flattened into `spell-app/cli`.
 * - Each is `(session, args, options) => Promise<exitCode>`:
 *   - the app's own:  `spell app create | serve` (`newCommand`, `serveCommand`), `spell projects`
 *   - the language's:  spell-lang's commands (`spell compile` ...), through the `"language"` hook
 *     (`languageCommands.ts`)
 * - Except `vscodeCommand`, `(args) => Promise<exitCode>`:  it loads no spell.
 * - NOT here:  the kit's commands (`spell server` ...), Spell UI's (`spell pack` ...), the `epic` command's verbs.
 */
export * from "./compileCommand"
export * from "./lintCommand"
export * from "./describeCommand"
export * from "./runCommand"
export * from "./watchCommand"
export * from "./projectsCommand"
export * from "./speedtestCommand"
export * from "./formatCommand"
export * from "./parseCommand"
export * from "./replCommand"
export * from "./explainCommand"
export * from "./translateCommand"
export * from "./newCommand"
export * from "./serveCommand"
export * from "./vscodeCommand"
