/**
 * `spell` command-line tool:  entry point, run by `bin/spell.mjs` -- `spell --help` for what it does.
 * - `consoleGuard` comes FIRST, and everything else only after it, via dynamic `import()`:
 *   modules log as they load, e.g. `environment.ts`.
 * - Each command is `CLI.<name>Command(session, args, options)`, resolving to the exit code.
 */
import "./consoleGuard"
// Defines `__PACKAGE_VERSION__` -- the PARSER's, which `spell --version` prints -- before anything reads it
import "#spell/node/packageVersion.node"
// types only:  erased, so it loads nothing ahead of `consoleGuard`
import type { CliSession, GlobalOptions } from "#cli"

const { Command } = await import("commander")
const { default: chalk } = await import("chalk")
const { CLI } = await import("#cli")

// output piped into e.g. `head`, which closed it:  nothing more to say
process.stdout.on("error", (error: NodeJS.ErrnoException) => error.code === "EPIPE" && process.exit(0))

/** How to name things, after `spell --help`. */
const TARGET_HELP = `
Targets:
  Card.spell, ./path/to/Project        a spell file, or the project in a folder
  @workspace                           the project in the current folder
  @library/cards, @test/Solitaire      one project, by its root's short name
  @system:library:cards                one project, by full id
  @library, @examples, @user, @system  a whole root:  pick from its projects, or pass --all`

const program = new Command("spell")
  .description("Compile, check and explore spell projects.")
  .version(globalThis.__PACKAGE_VERSION__)
  .option("--all", "a whole root, e.g. @library, means ALL its projects")
  .option("--verbose", "show spell's own logging, on stderr")
  .addHelpText("after", TARGET_HELP)

program
  .command("compile")
  .description("compile projects to <Project>.compiled.js, or print a file's compiled javascript")
  .argument("<targets...>", "spell files, project folders, or @roots/projects")
  .option("--stdout", "print a project's compiled output instead of writing it")
  .action((args: string[], _options, command) => run(CLI.compileCommand, args, command.optsWithGlobals()))

program
  .command("check")
  .description("list errors, one per line as path:line:col, exiting 1 if there are any")
  .argument("<targets...>", "spell files, project folders, or @roots/projects")
  .option("--json", "print errors as JSON")
  .action((args: string[], _options, command) => run(CLI.checkCommand, args, command.optsWithGlobals()))

program
  .command("describe")
  .description("what a file or project declares, as the Type Explorer shows it -- or all about ONE thing in it")
  .argument("<target>", "a spell file, project folder, or @root/project")
  .argument("[name]", 'one thing to describe, e.g. Card, or "test card setup"')
  .argument("[member]", "one of its members, e.g. color")
  .option("--inherited", "list members types inherit, too")
  .option("--compiled", "show the javascript it compiles to, when describing one thing")
  .option("--json", "print the Type Explorer's own data")
  .action((target: string, name: string | undefined, member: string | undefined, _options, command) =>
    run(
      CLI.describeCommand,
      [target, name, member].filter((it) => it !== undefined),
      command.optsWithGlobals()
    )
  )

program
  .command("explore")
  .description("full-screen Type Explorer:  browse what a project declares -- o opens it in $SPELL_EDITOR (code)")
  .argument("[target]", "a spell file, project folder, or @root/project -- default @workspace")
  .action((target: string | undefined, _options, command) =>
    run(CLI.exploreCommand, target ? [target] : [], command.optsWithGlobals())
  )

program
  .command("run")
  .description("compile a project and run it -- what needs a browser, e.g. starting its UI, is skipped")
  .argument("[target]", "a spell file, project folder, or @root/project -- default @workspace")
  .action((target: string | undefined, _options, command) =>
    run(CLI.runCommand, [target ?? CLI.WORKSPACE_ARG], command.optsWithGlobals())
  )

program
  .command("test")
  .description("run each `to test ...` in projects, reporting ✓ or ✗ -- exits 1 if any fail")
  .argument("[targets...]", "spell files, project folders, or @roots/projects -- default @workspace")
  .action((targets: string[], _options, command) =>
    run(CLI.testCommand, targets.length ? targets : [CLI.WORKSPACE_ARG], command.optsWithGlobals())
  )

program
  .command("watch")
  .description("recompile projects whenever their files change, showing their errors -- until q or Ctrl-C")
  .argument("[targets...]", "spell files, project folders, or @roots/projects -- default @workspace")
  .option("--check-only", "re-check instead of recompiling:  writes nothing")
  .action((targets: string[], _options, command) => run(CLI.watchCommand, targets, command.optsWithGlobals()))

await program.parseAsync()

/**
 * Run `command` for `args`, then exit with the code it returns.
 * - A `CLI.CliError` prints just its message;  anything else is a crash, and prints its stack.
 * - NOTE: exits explicitly -- a parse can leave timers running, which would keep the process alive.
 */
async function run<Options extends GlobalOptions>(
  command: (session: CliSession, args: string[], options: Options) => Promise<number>,
  args: string[],
  options: Options
): Promise<never> {
  let exitCode: number
  try {
    exitCode = await command(new CLI.CliSession(options), args, options)
  } catch (error) {
    const isCliError = error instanceof CLI.CliError
    process.stderr.write(`${chalk.red(isCliError ? error.message : ((error as Error)?.stack ?? String(error)))}\n`)
    exitCode = isCliError ? error.exitCode : CLI.EXIT.ERRORS
  }
  // let stdout drain first, e.g. into a pipe, or `process.exit()` cuts it short
  await new Promise<void>((done) => process.stdout.write("", () => done()))
  process.exit(exitCode)
}
