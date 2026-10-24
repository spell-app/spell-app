/**
 * spell-app's hooks into the commands of the repos below it (its `package.json`'s `"spell": { "hooks" }`,
 * epic `repo-split` P13):
 * - `language`:  the work of spell-parser's commands (`spell compile`, `spell run`, `spell lint` ...), which find
 *   projects the app's way today (`languageCommands.ts`)
 * - Each loads only when a command asks (`CLI.needHook()`):  `spell help` never does.
 */
import type { HookList } from "spell/cli"

export default {
  language: async () => (await loadApp()).languageCommands
} satisfies HookList

/**
 * The language and app commands' work (`languageCommands.ts`), loaded the one safe way:
 * - `consoleGuard` FIRST, and everything else only after it:  spell logs as its modules load
 * - then the parser's version (`__PACKAGE_VERSION__`), before anything reads it
 */
export async function loadApp(): Promise<typeof import("spell-app/cli/languageCommands")> {
  await import("spell-app/cli/consoleGuard")
  await import("spell-parser/spell/node/packageVersion.node")
  return import("spell-app/cli/languageCommands")
}
