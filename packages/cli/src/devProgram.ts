/**
 * `spell dev <noun> <verb>`:  the repo's OWN tools (worktrees, docs, servers ...), as opposed to the spell language --
 * the commander tree both entries build:  `main.ts` (so `spell --help` lists `dev`) and the lean `devMain.ts`.
 * - The plan for them, and every command the repo has:  `guides/dev/commands/commands.html`
 * - Each finds the nearest checkout from the current folder (`findCheckout()`), so it works in a worktree
 * - Kinds:
 *   - pass-throughs (`docs`, `design`, `server`, `vscode`):  a repo tool run with its arguments verbatim,
 *     `(args) => Promise<exitCode>`;  this file imports them directly, so they load no spell
 *   - the epic verbs' OLD spellings, hidden from `spell dev --help`:  the `epic` command has them now
 *     (`$/epics/command/`), and these run the same code, the epic code's, until no caller is left
 *     - `plan-doc`:  the `epic` tool in its own order (`EpicTools.planDoc()`)
 *     - `details` (`epic ask`), `choices`, `comments`, `notes`, `agents`, `airplane`, `window`:  its tools
 *       (`EpicTools.run()`)
 *     - `session`, `worktree`, `park`, `stock`, `shared` (epic `epic-eject` P5):  its classes
 *   - lean commands of our own (`pack`, `bundles`):
 *     `(args, options) => Promise<exitCode>`, imported directly the same way
 *   - the rest (`commands`, `wwod`):  `$/cli` commands, which load spell (`CliSession`);
 *     run through the `runBarrel` each entry passes in
 * - NOTE: `commandsCommand` reads the `dev.command(...)` calls in this file's TEXT:  keep the receiver named `dev`
 * - NOT in the barrel:  it's how the entries start, and must stay importable without it.
 */
import chalk from "chalk"
import { Command } from "commander"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { EpicCommandError } from "$/epics/command/command.types"
import { EpicTools, type EpicToolName } from "$/epics/command/EpicTools"
import { Parking } from "$/epics/command/Parking"
import { Sessions } from "$/epics/command/Sessions"
import { Shared } from "$/epics/command/Shared"
import { Stock } from "$/epics/command/Stock"
import { Worktrees } from "$/epics/command/Worktrees"
import { CliError, EXIT, type BundlesOptions, type GlobalOptions, type PackOptions } from "$/cli/cli.types"
import { DESIGN_VERBS, DOCS_VERBS } from "$/cli/dev/passThrough"
import { BUNDLES_VERBS, bundlesCommand } from "$/cli/commands/bundlesCommand"
import { designCommand } from "$/cli/commands/designCommand"
import { docsCommand } from "$/cli/commands/docsCommand"
import { PACK_VERBS, packCommand } from "$/cli/commands/packCommand"
import { serverCommand } from "$/cli/commands/serverCommand"
import { vscodeCommand } from "$/cli/commands/vscodeCommand"

/** The `spell` program, with the options every command takes:  each entry adds its commands. */
export function spellProgram(): Command {
  return new Command("spell")
    .description("Compile, check and explore spell projects.")
    .option("--all", "a whole root, e.g. @spell/library, means ALL its projects")
    .option("--verbose", "show spell's own logging, on stderr")
}

/**
 * Add `spell dev` and its nouns to `program`;  returns the `dev` command.
 * - `runBarrel`:  runs a `$/cli` command by name, e.g. `sessionCommand`
 */
export function devProgram(program: Command, runBarrel: RunBarrel): Command {
  const dev = program
    .command("dev")
    .description("the repo's own tools -- worktrees, docs, servers ...:  guides/dev/commands")
    .addHelpText("after", MOVED_HELP)

  ////////////////
  // ## The epic verbs' old spellings:  `epic` has them now
  ////////////////

  dev
    .command("plan-doc", { hidden: true })
    .description("old spelling of `epic <verb>`:  edit an epic page -- `spell dev plan-doc` alone lists its commands")
    .argument("[args...]", "a plan-doc command and its arguments, e.g. summary seo")
    .allowUnknownOption()
    .helpOption(false)
    // everything after `plan-doc`, raw:  its `--goal` / `--estimate` ... are the tool's, not ours
    .action(() => runLean(EpicTools.planDoc, rawArgs("plan-doc")))

  // goals is PARKED (epic `epic-workflow` P6):  its tool is in `packages/goals.zip`, rebuilt by epic `epic-goals`
  dev
    .command("goals", { hidden: true })
    .description("PARKED:  the goals tools are in packages/goals.zip, until epic epic-goals rebuilds them")
    .argument("[args...]", "ignored")
    .allowUnknownOption()
    .helpOption(false)
    .action((args: string[]) => {
      process.stderr.write(`${chalk.yellow(GOALS_PARKED)}\n`)
      // asked for help (`spell dev goals help`), the message is the answer;  a goals command is a failure
      process.exit(!args.length || args[0] === "help" ? EXIT.OK : EXIT.ERRORS)
    })

  oldTool(dev.command("details", { hidden: true }), "details", "epic ask:  details pages, and the answers on them")
  oldTool(dev.command("choices", { hidden: true }), "choices", "epic choices:  choice pages, Owen's call on each name")
  oldTool(dev.command("notes", { hidden: true }), "notes", "epic notes:  page notes Owen left on docs pages")
  oldTool(dev.command("comments", { hidden: true }), "comments", "epic comments:  comments Owen leaves on docs pages")
  oldTool(dev.command("agents", { hidden: true }), "agents", "epic agents:  the running-agents list")
  oldTool(dev.command("airplane", { hidden: true }), "airplane", "epic airplane:  airplane mode")
  oldTool(dev.command("window", { hidden: true }), "window", "epic window:  VS Code windows per package and worktree")

  oldVerbs(dev.command("session", { hidden: true }), "epic session:  Claude Code sessions", (args) =>
    new Sessions().run(args)
  )
  oldVerbs(
    dev.command("worktree", { hidden: true }),
    "epic worktree:  git worktrees and the sessions in them",
    (args) => new Worktrees().run(args)
  )
  oldVerbs(dev.command("park", { hidden: true }), "epic park:  parked work", (args) => new Parking().run(args))
  oldVerbs(dev.command("stock", { hidden: true }), "epic stock:  take stock", (args) => new Stock().run(args))
  oldVerbs(dev.command("shared", { hidden: true }), "epic shared:  shared content", (args) => new Shared().run(args))

  ////////////////
  // ## Pass-throughs
  ////////////////

  dev
    .command("docs")
    .description(
      "the docs tools:  update, index, new, open, link a page, fuss over writing, offline check (packages/epics/tools)"
    )
    .argument("[verb]", DOCS_VERBS.join(" | "))
    .argument("[args...]", "the tool's arguments, e.g. open solid/solid-2 --vs")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(docsCommand, rawArgs("docs")))

  dev
    .command("design")
    .description(
      "Spell's claude.ai design system:  build its files and bundle, check it, pull a board as a page, track pushes"
    )
    .argument("[verb]", DESIGN_VERBS.join(" | "))
    .argument("[args...]", "the tool's arguments, e.g. build --out /tmp/ds")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(designCommand, rawArgs("design")))

  dev
    .command("server")
    .description("this checkout's page server -- start --all:  every web server (page server, editor, Spell UI)")
    .argument("[verb]", "serve | start [--all] | ensure | stop | status | url <file> | prune [--dry-run]")
    .argument("[args...]", "the verb's arguments, e.g. --port 4800")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(serverCommand, rawArgs("server")))

  dev
    .command("pack")
    .description(
      "component packs:  another package's custom elements, loaded on demand by <ui-root> -- new, element, build, check"
    )
    .argument("<verb>", `${PACK_VERBS.join(" | ")}`)
    .argument("[names...]", "new <name> | element <pack> <tag> | build <pack> | check [pack]")
    .option("--prefix <prefix>", "new:  every tag's prefix, e.g. epic- (default the package's own, else <name>-)")
    .option("--no-build", "new, element:  write the files, don't build the pack")
    .option("--json", "print the report as JSON")
    .action((verb: string, names: string[], options: PackOptions) =>
      runLean((args) => packCommand(args, options), [verb, ...names])
    )

  dev
    .command("bundles")
    .description(
      "the bundles the page server serves, built on demand, never committed (Spell UI's docs site, the brand pages)"
    )
    .argument("<verb>", `${BUNDLES_VERBS.join(" | ")}`)
    .argument("[names...]", "build [<name>...] [--stale] | check [<name>...];  no name:  every bundle")
    .option("--stale", "build:  only the bundles whose sources changed since their last build")
    .option("--json", "print the report as JSON")
    .action((verb: string, names: string[], options: BundlesOptions) =>
      runLean((args) => bundlesCommand(args, options), [verb, ...names])
    )

  dev
    .command("vscode")
    .description("the VS Code extension:  build its .vsix, install it into VS Code -- no verb does both")
    .argument("[verb]", "build | install -- default both")
    .option("--force", "build or install even from a branch behind main (which downgrades every window)")
    .action((verb: string | undefined, options: { force?: boolean }) =>
      runLean(vscodeCommand, [...(verb ? [verb] : []), ...(options.force ? ["--force"] : [])])
    )

  ////////////////
  // ## Commands that load spell
  ////////////////

  dev
    .command("commands")
    .description("every yarn script, spell command and skill, against the commands page -- check exits 1 on a gap")
    .argument("[verb]", "list (default):  each command, ✓ if the page names it;  check:  only the gaps")
    .option("--json", "print every command, and the gaps, as JSON")
    .action((verb: string | undefined, _options, command) =>
      runBarrel("commandsCommand", verb ? [verb] : [], command.optsWithGlobals())
    )

  dev
    .command("wwod")
    .description(
      "WWOD, the agents' rules:  check every citation and repo path in WWOD, AGENTS.md, CLAUDE.md and skills"
    )
    .argument("[verb]", "check (default)")
    .argument("[files...]", "check:  more files to check, beyond the default set")
    .option("--json", "check:  print the report as JSON")
    .action((verb: string | undefined, files: string[], _options, command) =>
      runBarrel("wwodCommand", [verb ?? "check", ...files], command.optsWithGlobals())
    )

  return dev
}

/**
 * Run pass-through `command` for `args`, then exit with the code it returns.
 * - A `CliError` (or the epic code's `EpicCommandError`) prints just its message;  anything else is a crash, and
 *   prints its stack.
 */
export async function runLean(command: (args: string[]) => Promise<number>, args: string[]): Promise<never> {
  let exitCode: number
  try {
    exitCode = await command(args)
  } catch (error) {
    const known = error instanceof CliError || error instanceof EpicCommandError
    process.stderr.write(`${chalk.red(known ? error.message : ((error as Error)?.stack ?? String(error)))}\n`)
    exitCode = known ? error.exitCode : EXIT.ERRORS
  }
  // let stdout drain first, e.g. into a pipe, or `process.exit()` cuts it short
  await new Promise<void>((done) => process.stdout.write("", () => done()))
  process.exit(exitCode)
}

/**
 * Make `command` the old spelling of an epic tool, `spell dev <noun>`:  the epic code's tool `tool` (`EpicTools`),
 * its arguments verbatim;  hidden.
 * - `description`:  where it went, `epic ask:  ...`
 */
function oldTool(command: Command, tool: EpicToolName, description: string): Command {
  const noun = command.name()
  return command
    .description(`old spelling of ${description}`)
    .argument("[args...]", "the tool's command and its arguments")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean((args) => EpicTools.run(tool, args), rawArgs(noun)))
}

/**
 * Make `command` the old spelling of an epic verb group, `spell dev <noun>`:  the epic code's class, run with the
 * arguments verbatim (`run`);  hidden.  Its flags are the class's to read, as the `epic` command passes them.
 */
function oldVerbs(command: Command, description: string, run: (args: string[]) => Promise<number>): Command {
  const noun = command.name()
  return command
    .description(`old spelling of ${description}`)
    .argument("[args...]", "the verb and its arguments")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(run, rawArgs(noun)))
}

/**
 * Everything on the command line after `noun` (the first one after `dev`, if any), as typed.
 * - Why:  commander would take a tool's own flags, e.g. `--all`, as ours.
 */
export function rawArgs(noun: string): string[] {
  const argv = process.argv
  return argv.slice(argv.indexOf(noun, argv.indexOf("dev") + 1) + 1)
}

/** After `spell dev --help`'s nouns:  where the epic tools went. */
const MOVED_HELP = `
The epic tools moved to their own command, \`epic\` (epic --help):  plan-doc, details (now epic ask), choices,
comments, notes, agents, airplane;  and window, session, worktree, park, stock, shared (epic epic-eject P5).
Their old spellings here still work, e.g. spell dev plan-doc summary seo, spell dev worktree list.`

/** What `spell dev goals` says while goals is parked (epic `epic-workflow` P6, Owen 2026-10-11). */
const GOALS_PARKED =
  "goals is parked:  its tools, skills and routes are in packages/goals.zip (guides/goals/goals.html says what it " +
  "was);  epic epic-goals rebuilds it on the epic tools.  The saga pages still show, read only."

/** A `$/cli` command `spell dev` runs by name:  each loads the whole barrel, spell included. */
export type BarrelCommand = "commandsCommand" | "wwodCommand"

/** Runs `$/cli` command `name` for `args`, then exits with its code. */
export type RunBarrel = (name: BarrelCommand, args: string[], options: GlobalOptions) => Promise<never>
