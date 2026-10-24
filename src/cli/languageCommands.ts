/**
 * The language commands' work (spell-parser's `spell compile`, `spell run` ...):  what spell-app's `"language"` hook
 * loads (`cli/hooks.ts`, epic `repo-split` P13).
 * - Each makes one `CliSession`, which loads projects the app's way:  addresses like `@spell/examples/Solitaire`,
 *   spaces' folders on disk, the editor's language service.
 * - NOT in the barrel:  `hooks.ts` loads it after `consoleGuard.ts`, which must run before spell loads.
 */
import type { LanguageCommands } from "spell-parser/cli"
import { CLI } from "spell-app/cli"

/** spell-parser's commands, each on a new `CliSession` with the command's flags. */
export const languageCommands: LanguageCommands = {
  compile: (args, options) => CLI.compileCommand(session(options), args, options),
  lint: (args, options) => CLI.lintCommand(session(options), args, options),
  describe: (args, options) => CLI.describeCommand(session(options), args, options),
  run: (args, options) => CLI.runCommand(session(options), args, options),
  test: (args, options) => CLI.testCommand(session(options), args, options),
  watch: (args, options) => CLI.watchCommand(session(options), args, options),
  format: (args, options) => CLI.formatCommand(session(options), args, options),
  speedtest: (args, options) => CLI.speedtestCommand(session(options), args, options),
  parse: (args, options) => CLI.parseCommand(session(options), args, options),
  repl: (args, options) => CLI.replCommand(session(options), args, options),
  explain: (args, options) => CLI.explainCommand(session(options), args, options),
  translate: (args, options) => CLI.translateCommand(session(options), args, options),
  translateTime: (args, options) => CLI.translateTimeCommand(session(options), args, options)
}

/**
 * The app's commands (`spell app create | serve | preview`, `spell projects`), by name, each on a new `CliSession`:  what
 * `cli/commands.ts` runs.
 */
export const appCommands = {
  create: (args: string[], options: CLI.NewOptions) => CLI.newCommand(session(options), args, options),
  serve: (args: string[], options: CLI.ServeOptions) => CLI.serveCommand(session(options), args, options),
  preview: (args: string[], options: CLI.PreviewOptions) => CLI.previewCommand(session(options), args, options),
  projects: (args: string[], options: CLI.ProjectsOptions) => CLI.projectsCommand(session(options), args, options)
}

/** A command's session, with its flags. */
function session(options: CLI.GlobalOptions): CLI.CliSession {
  return new CLI.CliSession(options)
}
