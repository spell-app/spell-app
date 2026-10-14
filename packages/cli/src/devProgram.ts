/**
 * `spell dev <noun> <verb>`:  the repo's OWN tools (worktrees, docs, servers ...), as opposed to the spell language --
 * the commander tree both entries build:  `main.ts` (so `spell --help` lists `dev`) and the lean `devMain.ts`.
 * - The plan for them, and every command the repo has:  `guides/dev/commands/commands.html`
 * - Each finds the nearest checkout from the current folder (`findCheckout()`), so it works in a worktree
 * - Two kinds:
 *   - pass-throughs (`docs`, `design`, `server`, `window`, `vscode`):  a repo tool run with its arguments verbatim,
 *     `(args) => Promise<exitCode>`;  this file imports them directly, so they load no spell
 *   - the epic tools' OLD spellings (`plan-doc`, `details`, `choices`, `comments`, `notes`, `agents`, `airplane`):
 *     pass-throughs too, hidden from `spell dev --help`;  the `epic` command has them now (`epicProgram.ts`), and
 *     these run the same tools, unchanged, until no caller is left
 *   - lean commands of our own (`pack`, `bundles`):
 *     `(args, options) => Promise<exitCode>`, imported directly the same way
 *   - the rest (`commands`, `session` ...):  `$/cli` commands, which load spell (`CliSession`);
 *     run through the `runBarrel` each entry passes in
 * - NOTE: `commandsCommand` reads the `dev.command(...)` calls in this file's TEXT:  keep the receiver named `dev`
 * - NOT in the barrel:  it's how the entries start, and must stay importable without it.
 */
import chalk from "chalk"
import { Command } from "commander"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT, type BundlesOptions, type GlobalOptions, type PackOptions } from "$/cli/cli.types"
import { DESIGN_VERBS, DOCS_VERBS } from "$/cli/dev/passThrough"
import { agentsCommand } from "$/cli/commands/agentsCommand"
import { airplaneCommand } from "$/cli/commands/airplaneCommand"
import { BUNDLES_VERBS, bundlesCommand } from "$/cli/commands/bundlesCommand"
import { designCommand } from "$/cli/commands/designCommand"
import { choicesCommand } from "$/cli/commands/choicesCommand"
import { detailsCommand } from "$/cli/commands/detailsCommand"
import { docsCommand } from "$/cli/commands/docsCommand"
import { notesCommand } from "$/cli/commands/notesCommand"
import { commentsCommand } from "$/cli/commands/commentsCommand"
import { PACK_VERBS, packCommand } from "$/cli/commands/packCommand"
import { planDocCommand } from "$/cli/commands/planDocCommand"
import { serverCommand } from "$/cli/commands/serverCommand"
import { vscodeCommand } from "$/cli/commands/vscodeCommand"
import { windowCommand } from "$/cli/commands/windowCommand"

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
  // ## The epic tools' old spellings:  `epic` has them now
  ////////////////

  dev
    .command("plan-doc", { hidden: true })
    .description("old spelling of `epic <verb>`:  edit an epic page -- `spell dev plan-doc` alone lists its commands")
    .argument("[args...]", "a plan-doc command and its arguments, e.g. summary seo")
    .allowUnknownOption()
    .helpOption(false)
    // everything after `plan-doc`, raw:  its `--goal` / `--estimate` ... are the tool's, not ours
    .action(() => runLean(planDocCommand, rawArgs("plan-doc")))

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

  dev
    .command("details", { hidden: true })
    .description("old spelling of `epic ask`:  details pages in VS Code's side bar, and the answers on them")
    .argument("[args...]", "a details command and its arguments")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(detailsCommand, rawArgs("details")))

  dev
    .command("choices", { hidden: true })
    .description("old spelling of `epic choices`:  syntax-choices pages, Owen's call on each name")
    .argument("[args...]", "a choices command and its arguments")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(choicesCommand, rawArgs("choices")))

  dev
    .command("notes", { hidden: true })
    .description("old spelling of `epic notes`:  page notes Owen leaves on docs pages")
    .argument("[verb]", "list (default) [--all] [--json] | answer <page> <id> --file <html> | done <page> <id>")
    .argument("[args...]", "the verb's arguments, e.g. answer guides/x.html n3 --file reply.html")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(notesCommand, rawArgs("notes")))

  dev
    .command("comments", { hidden: true })
    .description("old spelling of `epic comments`:  comments Owen leaves on docs pages' blocks")
    .argument(
      "[verb]",
      "list (default) [--all] [--json] | gather [<page>... | --all] [--epic <name>] [--json] | working | answer"
    )
    .argument("[args...]", "the verb's arguments, e.g. answer guides/x.html cm3 --file reply.html")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(commentsCommand, rawArgs("comments")))

  dev
    .command("agents", { hidden: true })
    .description("old spelling of `epic agents`:  the running-agents list of this epic (else checkout)")
    .argument("[verb]", "list (default) [--json] | add <name> <task> | set <name> | done <name> | wait | told <name>")
    .argument("[args...]", 'the verb\'s arguments, e.g. add aaa "docstrings in string.ts"')
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(agentsCommand, rawArgs("agents")))

  dev
    .command("airplane", { hidden: true })
    .description("old spelling of `epic airplane`:  airplane mode, everything queued for /airplane land")
    .argument("[verb]", "status (default) [--json] | on | off | check [--fix] [--json] | inbox [--json]")
    .argument("[args...]", "the verb's flags")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(airplaneCommand, rawArgs("airplane")))

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
    .argument("[verb]", "serve | start [--all] | ensure | stop | status | url <file>")
    .argument("[args...]", "the verb's arguments, e.g. --port 4800")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(serverCommand, rawArgs("server")))

  dev
    .command("window")
    .description("VS Code windows per package and worktree:  open, close, handoff, show ... (scripts/window.mjs)")
    .argument("[args...]", "a window command and its arguments, e.g. open <name>")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(windowCommand, rawArgs("window")))

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
    .action((verb: string | undefined) => runLean(vscodeCommand, verb ? [verb] : []))

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
    .command("session")
    .description(
      "Claude Code sessions:  list, find, open in VS Code, title this one, mark finished ones ✅, digest a transcript"
    )
    .argument(
      "[verb]",
      "list (default) [words...] | find <name> | open <id|title> | title [title] | done [name] | icons | window [pid] | transcript <id>"
    )
    .argument("[args...]", "the verb's arguments")
    .option("--limit <n>", "list:  at most this many (default 15)")
    .option("--json", "list, find, transcript:  print the data as JSON")
    .option("--dry-run", "icons:  say what it would retitle, retitle nothing")
    .action((verb: string | undefined, args: string[], _options, command) =>
      runBarrel("sessionCommand", verb ? [verb, ...args] : [], command.optsWithGlobals())
    )

  dev
    .command("worktree")
    .description(
      "git worktrees:  list the live sessions and where they work, or where a worktree / plan / session stands"
    )
    .argument("[verb]", "list (default) | status <name> | merge-main [--continue]")
    .argument("[name]", "status:  a worktree, branch, plan doc or session name")
    .option("--json", "list, merge-main:  print the data as JSON")
    .option("--continue", "merge-main:  finish a merge it stopped on other conflicts, once they're resolved and added")
    .action((verb: string | undefined, name: string | undefined, _options, command) =>
      runBarrel(
        "worktreeCommand",
        [verb, name].filter((it) => it !== undefined),
        command.optsWithGlobals()
      )
    )

  dev
    .command("park")
    .description("parked work:  list the PARKED notes, what /wait-for could wait on, or wait for a name to finish")
    .argument("<verb>", "list | candidates | wait <name>")
    .argument("[name]", "wait:  a worktree, branch, plan doc or session name")
    .option("--every <seconds>", "wait:  poll this often (default 60)")
    .option("--max <seconds>", "wait:  give up after this long, exiting 2 (default 7140)")
    .action((verb: string, name: string | undefined, _options, command) =>
      runBarrel(
        "parkCommand",
        [verb, name].filter((it) => it !== undefined),
        command.optsWithGlobals()
      )
    )

  dev
    .command("stock")
    .description("take stock:  worktrees, branches, sessions, parked work, plans -- in process, hung or parked, dead")
    .option("--json", "print the report as JSON, with each action's shell lines")
    .action((_options, command) => runBarrel("stockCommand", [], command.optsWithGlobals()))

  dev
    .command("shared")
    .description(
      "shared content:  docs pages, goal sets and logs in one repo beside the checkout, linked into every one"
    )
    .argument(
      "[verb]",
      "status (default) | init [--import] | link [--all] | commit [--session <id>] | migrate <worktree> [--dry-run] | repair [--dry-run]"
    )
    .argument("[name]", "migrate:  the worktree")
    .option("--json", "status, migrate, repair:  print the data as JSON")
    .option("--import", "init:  copy this checkout's folders into the new shared repo")
    .option("--session <id>", "commit:  the Claude Code session, for the commit's trailer")
    .option("--quiet", "commit:  print nothing")
    .option("--dry-run", "migrate, repair:  say what it would do, change nothing")
    .action((verb: string | undefined, name: string | undefined, _options, command) =>
      runBarrel(
        "sharedCommand",
        [verb, name].filter((it) => it !== undefined),
        command.optsWithGlobals()
      )
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
 * - A `CliError` prints just its message;  anything else is a crash, and prints its stack.
 * - Used for the `epic` command's verbs too (`epicProgram.ts`).
 */
export async function runLean(command: (args: string[]) => Promise<number>, args: string[]): Promise<never> {
  let exitCode: number
  try {
    exitCode = await command(args)
  } catch (error) {
    const isCliError = error instanceof CliError
    process.stderr.write(`${chalk.red(isCliError ? error.message : ((error as Error)?.stack ?? String(error)))}\n`)
    exitCode = isCliError ? error.exitCode : EXIT.ERRORS
  }
  process.exit(exitCode)
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
comments, notes, agents, airplane.  Their old spellings here still work, e.g. spell dev plan-doc summary seo.`

/** What `spell dev goals` says while goals is parked (epic `epic-workflow` P6, Owen 2026-10-11). */
const GOALS_PARKED =
  "goals is parked:  its tools, skills and routes are in packages/goals.zip (guides/goals/goals.html says what it " +
  "was);  epic epic-goals rebuilds it on the epic tools.  The goals pages still show, read only."

/** A `$/cli` command `spell dev` runs by name:  each loads the whole barrel, spell included. */
export type BarrelCommand =
  | "commandsCommand"
  | "sessionCommand"
  | "worktreeCommand"
  | "parkCommand"
  | "stockCommand"
  | "sharedCommand"
  | "wwodCommand"

/** Runs `$/cli` command `name` for `args`, then exits with its code. */
export type RunBarrel = (name: BarrelCommand, args: string[], options: GlobalOptions) => Promise<never>
