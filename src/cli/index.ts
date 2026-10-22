/**
 * Barrel for spell-app's `spell` commands (`spell app ...`, `spell projects`), and the language commands' work it
 * does for spell-lang's commands, through its `"language"` hook (`cli/hooks.ts`):  compile, lint, run ... spell
 * projects from a terminal.
 * - Node-only:  loads projects from disk, and draws Ink screens.
 * - `CliSession` is one command's run;  `resolveProject()` turns an argument into what it names.
 * - The program itself is the kit's (`spell-kit/cli`, epic `repo-split` P13).
 * - NOTE: deliberately left out, as side effects the moment they're imported:
 *   - `consoleGuard.ts`:  silences `console.*`
 *   - `languageCommands.ts`:  the hook's work, loaded after `consoleGuard`
 */
export * as CLI from "."
export * from "./cli.types"

export * from "./resolveProject"
export * from "./CliSession"
export * from "./staleBecause"
export * from "./EditorPages"
export * from "./schemas"
export * from "./scopeTree"
export * from "./describeText"
export * from "./parseText"
export * from "./recentProjects"
export * from "./projectChoices"
export * from "./serve"
export * from "./runInBrowser"
export * from "./runTarget"
export * from "./ui"
// its folder's barrel by its full name:  `./commands` is `commands.ts` beside this, the repo's command list
export * from "spell-app/cli/commands/index"
