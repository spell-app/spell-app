/**
 * `spell` command-line tool:  entry point, run by `bin/spell.mjs` -- `spell --help` for what it does.
 * - `consoleGuard` comes FIRST, and everything else only after it, via dynamic `import()`:
 *   modules log as they load, e.g. `environment.ts`.
 * - Each command is `CLI.<name>Command(session, args, options)`, resolving to the exit code.
 * - `spell dev ...` (and the deprecated `spell plan-doc` / `spell goals`) start in the lean `devMain.ts`
 *   instead, which loads no spell;  its commands that need spell come back here.  Their tree:  `devProgram.ts`.
 */
import "./consoleGuard"
// Defines `__PACKAGE_VERSION__` -- the PARSER's, which `spell --version` prints -- before anything reads it
import "$/spell/node/packageVersion.node"
// types only:  erased, so it loads nothing ahead of `consoleGuard`
import type { CliSession, GlobalOptions } from "$/cli"

const { default: chalk } = await import("chalk")
const { CLI } = await import("$/cli")
const { devProgram, rawArgs, runLean, spellProgram } = await import("$/cli/devProgram")

// output piped into e.g. `head`, which closed it:  nothing more to say
process.stdout.on("error", (error: NodeJS.ErrnoException) => error.code === "EPIPE" && process.exit(0))

/** How to name things, after `spell --help`. */
const PROJECT_HELP = `
Projects:
  Card.spell, ./path/to/Project        a spell file, or the project in a folder
  @workspace                           the project in the current folder
  @library/cards, @test/Solitaire      one project, by its root's short name
  @system:library:cards                one project, by full id
  @library, @examples, @user, @system  a whole root:  pick from its projects, or pass --all
  (none)                               the project here -- or, outside one, asks, completing as you type`

/** Help for a command's project argument(s):  a project, or a lone spell file, which counts as one. */
const PROJECT_ARG = "a spell file, project folder, or @root/project -- default the project here, else asks"
const PROJECTS_ARG = "spell files, project folders, or @roots/projects -- default the project here, else asks"

const program = spellProgram().version(globalThis.__PACKAGE_VERSION__).addHelpText("after", PROJECT_HELP)

program
  .command("compile")
  .description("compile projects to <Project>.compiled.js, or print a file's compiled javascript")
  .argument("[projects...]", PROJECTS_ARG)
  .option("--stdout", "print a project's compiled output instead of writing it")
  .option("--target <name>", 'compile to this target too, e.g. ts/solid -- default project.json\'s "targets"')
  .option("--force", "recompile the projects it imports too, even those already compiled")
  .action((args: string[], _options, command) => run(CLI.compileCommand, args, command.optsWithGlobals()))

program
  .command("check")
  .description("list errors, one per line as path:line:col, exiting 1 if there are any")
  .argument("[projects...]", PROJECTS_ARG)
  .option("--json", "print errors as JSON")
  .action((args: string[], _options, command) => run(CLI.checkCommand, args, command.optsWithGlobals()))

program
  .command("describe")
  .description("what a file or project declares, as the Type Explorer shows it -- or all about ONE thing in it")
  .argument("[project]", PROJECT_ARG)
  .argument("[name]", 'one thing to describe, e.g. Card, or "test card setup"')
  .argument("[member]", "one of its members, e.g. color")
  .option("--inherited", "list members types inherit, too")
  .option("--compiled", "show the javascript it compiles to, when describing one thing")
  .option("--json", "print the Type Explorer's own data")
  .action((project: string, name: string | undefined, member: string | undefined, _options, command) =>
    run(
      CLI.describeCommand,
      [project, name, member].filter((it) => it !== undefined),
      command.optsWithGlobals()
    )
  )

program
  .command("explore")
  .description("full-screen Type Explorer:  browse what a project declares -- o opens it in $SPELL_EDITOR (code)")
  .argument("[project]", PROJECT_ARG)
  .action((project: string | undefined, _options, command) =>
    run(CLI.exploreCommand, project ? [project] : [], command.optsWithGlobals())
  )

program
  .command("run")
  .description("compile a project and run it -- one that shows a UI opens in your browser, until Ctrl-C")
  .argument("[project]", PROJECT_ARG)
  .option("--browser", "open it in a browser even if it shows no UI")
  .option("--no-browser", "never open a browser:  just skip what needs one")
  .action((project: string | undefined, _options, command) =>
    run(CLI.runCommand, project ? [project] : [], command.optsWithGlobals())
  )

program
  .command("test")
  .description("run each `to test ...` in projects, reporting ✓ or ✗ -- exits 1 if any fail")
  .argument("[projects...]", PROJECTS_ARG)
  .option("--name <text>", 'only tests whose names contain this, e.g. "deck creation"')
  .option("--watch", "run them again whenever a project changes -- spell watch --test")
  .action((projects: string[], _options, command) => run(CLI.testCommand, projects, command.optsWithGlobals()))

program
  .command("watch")
  .description("recompile projects whenever their files change, showing their errors -- until q or Ctrl-C")
  .argument("[projects...]", PROJECTS_ARG)
  .option("--check-only", "re-check instead of recompiling:  writes nothing")
  .option("--test", "run each project's tests after each rebuild with no errors")
  .option("--name <text>", "with --test:  only tests whose names contain this")
  .action((projects: string[], _options, command) => run(CLI.watchCommand, projects, command.optsWithGlobals()))

program
  .command("format")
  .description("tidy the whitespace of .spell files, as VS Code's Format Document does -- never in projects/test/")
  .argument("[projects...]", PROJECTS_ARG)
  .option("--check", "write nothing:  list files that would change, exiting 1 if any would")
  .action((args: string[], _options, command) => run(CLI.formatCommand, args, command.optsWithGlobals()))

program
  .command("projects")
  .description("list the project roots -- or, given one, the projects in it")
  .argument("[root]", "a project root, e.g. @library or @user")
  .option("--json", "print the list as JSON")
  .action((root: string | undefined, _options, command) =>
    run(CLI.projectsCommand, root ? [root] : [], command.optsWithGlobals())
  )

program
  .command("speed")
  .description("time the parser's rule tests -- --against HEAD to compare with a commit")
  .argument("[module]", "only this module's rules, e.g. if")
  .option("--runs <count>", "runs per side, each a fresh process", (value) => Number(value), 3)
  .option("--against <ref>", "time this git commit too, e.g. HEAD, in a temp worktree")
  .option("--json", "print each side's combined results as JSON")
  .action((module: string | undefined, _options, command) =>
    run(CLI.speedCommand, module ? [module] : [], command.optsWithGlobals())
  )

program
  .command("parse")
  .description("how spell reads a line:  its match tree, then the javascript it compiles to")
  .argument("<text>", 'a line of spell, e.g. "print 1 + 2" -- several lines parse as a block')
  .option("--rule <name>", "parse as this rule only, e.g. expression -- default statement, then expression")
  .option("--in <project>", "parse inside this project's scope, e.g. @test/Solitaire")
  .option("--json", "print the result as JSON")
  .option("--tree", "print the spell tree -- what it means -- not the match tree;  with --json:  its data")
  .option("--html", "with --tree:  print it as a <ui-tree-diagram> for a docs page")
  .action((text: string, _options, command) => run(CLI.parseCommand, [text], command.optsWithGlobals()))

program
  .command("repl")
  .description("spell parse, a line at a time -- what a line declares, later lines know.  Piped:  reads stdin")
  .argument("[project]", "parse inside this project's scope, e.g. @test/Solitaire")
  .action((project: string | undefined, _options, command) =>
    run(CLI.replCommand, project ? [project] : [], command.optsWithGlobals())
  )

program
  .command("explain")
  .description("what a word means to spell:  rules it names or starts -- and, --in a project, what it declares")
  .argument("<word>", "e.g. print, repeat -- or, with --in, a type, property or method")
  .option("--in <project>", "look in this project too, e.g. @test/Solitaire")
  .option("--json", "print what was found as JSON")
  .action((word: string, _options, command) => run(CLI.explainCommand, [word], command.optsWithGlobals()))

program
  .command("new")
  .description("make a spell project:  <name>/project.json and a starter <name>.spell")
  .argument("<name>", "the project's name, e.g. Snake")
  .option("--in <folder>", "make it in this folder -- default @user's, projects/user/")
  .action((name: string, _options, command) => run(CLI.newCommand, [name], command.optsWithGlobals()))

program
  .command("serve")
  .description("run the spell app -- editor and server, which saves to disk -- and open it, until Ctrl-C")
  .argument(
    "[project]",
    "open the editor on this, e.g. @examples/Solitaire -- default the project here, else the chooser"
  )
  .option(
    "--port <port>",
    "the editor's port, for a page server this starts -- default 3000, else any free one",
    (value) => Number(value)
  )
  .option("--headless", "don't open a browser:  just print the URL")
  .action((project: string | undefined, _options, command) =>
    run(CLI.serveCommand, project ? [project] : [], command.optsWithGlobals())
  )

program
  .command("icons")
  .description("find @spell-app/ui icons by name, alias or keyword -- --open shows them in a browser")
  .argument("[query...]", "words to look for, e.g. bell -- none:  every icon")
  .option("--pack <id>", "only this pack:  fa7-free, fa7-brands or fomantic")
  .option("--json", "print the icons found as JSON")
  .option("--open", "show them as pictures in a browser, until Ctrl-C")
  .action((query: string[], _options, command) => run(CLI.iconsCommand, query, command.optsWithGlobals()))

program
  .command("static")
  .description("ui-* pages as plain HTML for crawlers and no-JS readers:  page.static.html + ui.static.css")
  .argument("<pages...>", "html pages, or folders of them -- writes each as <page>.static.html beside it")
  .option("-o, --output <path>", "write the page here -- or, for several, into this folder")
  .option("--inline-css", "put each page's stylesheet in a <style> in the page, not the folder's ui.static.css")
  .option("--css <file>", "write ONE stylesheet, for every page, here (default:  ui.static.css per folder)")
  .option("--no-minify", "leave the stylesheet readable")
  .action((pages: string[], _options, command) => run(CLI.staticCommand, pages, command.optsWithGlobals()))

program
  .command("pony")
  .description("a pony in Spell's wizard hat, saying something -- yours, or one of its own")
  .argument("[words...]", "what the pony says")
  .action((words: string[], _options, command) => run(CLI.ponyCommand, words, command.optsWithGlobals()))

// our own `help`, not commander's:  an unknown command is a mistake, not a reason to print the general help
program.helpCommand(false)
program
  .command("help")
  .description("show help -- for one command, e.g. spell help compile")
  .argument("[command]", "the command to show help for")
  .action((name: string | undefined) => {
    const command = name === undefined ? program : program.commands.find((it) => it.name() === name)
    if (!command) {
      process.stderr.write(chalk.red(`No command '${name}' -- \`spell help\` lists them\n`))
      process.exit(CLI.EXIT.USAGE)
    }
    command.outputHelp()
  })

program
  .command("goals")
  .description("deprecated:  spell dev goals")
  .argument("[args...]", "a goals command and its arguments, e.g. update spell/motivation")
  .allowUnknownOption()
  .helpOption(false)
  .action(() => runLean(CLI.goalsCommand, rawArgs("goals")))

program
  .command("plan-doc")
  .description("deprecated:  spell dev plan-doc")
  .argument("[args...]", "a plan-doc command and its arguments, e.g. summary seo")
  .allowUnknownOption()
  .helpOption(false)
  .action(() => runLean(CLI.planDocCommand, rawArgs("plan-doc")))

// `spell dev ...`:  the repo's own tools.  `bin/spell.mjs` runs them through the lean `devMain.ts`;  here for
// `spell --help` / `spell help dev`, and a command line it didn't route there, e.g. `spell --verbose dev ...`
devProgram(program, (name, args, options) => run(CLI[name] as BarrelCommandFn, args, options))

await program.parseAsync()

/** A `$/cli` command, as `run()` takes it:  `devProgram()` names the ones it needs. */
type BarrelCommandFn = (session: CliSession, args: string[], options: GlobalOptions) => Promise<number>

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
