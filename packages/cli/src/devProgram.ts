/**
 * `spell dev <noun> <verb>`:  the repo's OWN tools (worktrees, docs, servers ...), as opposed to the spell language --
 * the commander tree both entries build:  `main.ts` (so `spell --help` lists `dev`) and the lean `devMain.ts`.
 * - The plan for them, and every command the repo has:  `guides/dev/commands/commands.html`
 * - Each finds the nearest checkout from the current folder (`findCheckout()`), so it works in a worktree
 * - Two kinds:
 *   - pass-throughs (`plan-doc`, `goals`, `docs`, `details`, `design`, `server`, `window`, `vscode`):  a repo tool
 *     run with its arguments verbatim, `(args) => Promise<exitCode>`;  this file imports them directly, so they
 *     load no spell
 *   - the rest (`commands`, `session` ...):  `$/cli` commands, which load spell (`CliSession`);  run through the
 *     `runBarrel` each entry passes in
 * - NOTE: `commandsCommand` reads the `dev.command(...)` calls in this file's TEXT:  keep the receiver named `dev`
 * - NOT in the barrel:  it's how the entries start, and must stay importable without it.
 */
import chalk from "chalk"
import { Command } from "commander"

// Import directly, not through `$/cli`:  the barrel loads spell, and `spell dev` must start fast (`devMain.ts`)
import { CliError, EXIT, type GlobalOptions } from "$/cli/cli.types"
import { DESIGN_VERBS, DOCS_VERBS } from "$/cli/dev/passThrough"
import { designCommand } from "$/cli/commands/designCommand"
import { detailsCommand } from "$/cli/commands/detailsCommand"
import { docsCommand } from "$/cli/commands/docsCommand"
import { goalsCommand } from "$/cli/commands/goalsCommand"
import { planDocCommand } from "$/cli/commands/planDocCommand"
import { serverCommand } from "$/cli/commands/serverCommand"
import { vscodeCommand } from "$/cli/commands/vscodeCommand"
import { windowCommand } from "$/cli/commands/windowCommand"

/** The `spell` program, with the options every command takes:  each entry adds its commands. */
export function spellProgram(): Command {
  return new Command("spell")
    .description("Compile, check and explore spell projects.")
    .option("--all", "a whole root, e.g. @library, means ALL its projects")
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

  ////////////////
  // ## Pass-throughs
  ////////////////

  dev
    .command("plan-doc")
    .description("edit a plan doc (epics/) -- `spell dev plan-doc` lists its commands")
    .argument("[args...]", "a plan-doc command and its arguments, e.g. summary seo")
    .allowUnknownOption()
    .helpOption(false)
    // everything after `plan-doc`, raw:  its `--goal` / `--estimate` ... are the tool's, not ours
    .action(() => runLean(planDocCommand, rawArgs("plan-doc")))

  dev
    .command("goals")
    .description("plans in goals/:  talk, add thoughts, update, open -- `spell dev goals help` lists its commands")
    .argument("[args...]", "a goals command and its arguments, e.g. update spell/motivation")
    .allowUnknownOption()
    .helpOption(false)
    // everything after `goals`, raw:  commander would take `--all` as the global option
    .action(() => runLean(goalsCommand, rawArgs("goals")))

  dev
    .command("docs")
    .description("the docs tools:  update, index, new, open, link a page (packages/docs/tools)")
    .argument("[verb]", DOCS_VERBS.join(" | "))
    .argument("[args...]", "the tool's arguments, e.g. open solid/solid-2 --vs")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(docsCommand, rawArgs("docs")))

  dev
    .command("details")
    .description("details pages in VS Code's side bar, and the answers on them (the /details skill's tool)")
    .argument("[args...]", "a details command and its arguments")
    .allowUnknownOption()
    .helpOption(false)
    .action(() => runLean(detailsCommand, rawArgs("details")))

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
    .command("agents")
    .description("the agents' rules:  check every WWOD citation and repo path in WWOD, AGENTS.md, CLAUDE.md and skills")
    .argument("[verb]", "check (default)")
    .argument("[files...]", "check:  more files to check, beyond the default set")
    .option("--json", "check:  print the report as JSON")
    .action((verb: string | undefined, files: string[], _options, command) =>
      runBarrel("agentsCommand", [verb ?? "check", ...files], command.optsWithGlobals())
    )

  return dev
}

/**
 * Run pass-through `command` for `args`, then exit with the code it returns.
 * - A `CliError` prints just its message;  anything else is a crash, and prints its stack.
 * - Used for the deprecated top-level `spell plan-doc` / `spell goals` too (`main.ts`).
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

/** A `$/cli` command `spell dev` runs by name:  each loads the whole barrel, spell included. */
export type BarrelCommand =
  | "commandsCommand"
  | "sessionCommand"
  | "worktreeCommand"
  | "parkCommand"
  | "stockCommand"
  | "sharedCommand"
  | "agentsCommand"

/** Runs `$/cli` command `name` for `args`, then exits with its code. */
export type RunBarrel = (name: BarrelCommand, args: string[], options: GlobalOptions) => Promise<never>
