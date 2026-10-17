import chalk from "chalk"
import { Command } from "commander"

import { EpicConfig } from "$/epics/config/EpicConfig"

import { EXIT, EpicCommandError } from "./command.types"
import { GROUP_VERBS, type GroupName } from "./epicGroups"
import { EpicTools, type EpicToolName } from "./EpicTools"
import { Git } from "./Git"
import { Parking } from "./Parking"
import { Requests } from "./Requests"
import { Sessions } from "./Sessions"
import { Shared } from "./Shared"
import { Stock } from "./Stock"
import { Worktrees } from "./Worktrees"

/****************
 * ### `EpicProgram`
 * `epic <verb> ...`:  the epic tools, a command of their own (epic `epic-workflow` P9) -- the commander tree, and
 * `epic --help`.  Each verb group registers here, under its own heading, and runs in THIS process.
 * - Most verbs edit or read an epic page (`epics/<name>/<name>.plan.html`):  the `epic` tool
 *   (`EpicTools.runPlanDoc()`), after `planDocArgs()` turns Owen's `seo#J3` addressing into the tool's arguments
 * - `send`, `requests`, `file`, `home`, `merge`:  `Requests`
 * - `worktree`, `session`, `park`, `shared`, `stock`:  `Worktrees`, `Sessions`, `Parking`, `Shared`, `Stock`
 *   (epic `epic-eject` P5:  they were `spell dev worktree` ...)
 * - `window`, `server` and the docs tools' groups (`ask`, `choices`, `comments`, `notes`, `agents`, `airplane`):
 *   scripts passed through, their arguments verbatim (`EpicTools.run()`)
 * - `config`:  the repo's `.epic/config.json5`, a value or all of them (`config()`)
 * - Each group's verbs are listed (`epicGroups.ts`) for their help, `epic ask new --help`, and an unknown one is
 *   refused;  every verb's help has its usage, what it does and an example (`epic close --help`);  an unknown verb
 *   exits 1, listing them;  a usage error exits 2 (`EXIT`)
 * - ONE copy of the code:  every verb runs THIS checkout's code, whichever checkout calls it;  the data is the
 *   caller's (`Git.nearestCheckout()`).  `epic --version` says which code runs.
 * - The old spellings still run here:  `spell dev plan-doc <verb> <name> ...`, `spell dev worktree ...`,
 *   `spell dev details ...` (the CLI's `devProgram.ts`), and `spell epic <verb>`
 * - Lean:  it loads no spell, and the `epic` tool only when a page verb runs, so `epic` starts in a fraction of a
 *   second.  Its entry is the CLI's `epicMain.ts`;  NEVER imports the CLI package (`$/cli`).
 * - NOTE: `spell dev commands` reads the `epic.command(...)` calls in this file's TEXT:  keep the receiver named `epic`
 ****************/
export class EpicProgram {
  /** the commander tree:  every verb on it */
  readonly epic: Command

  constructor() {
    const epic = new Command("epic")
      .description(
        "Work with epics:  their pages (epics/<name>/), the pages Owen answers on, worktrees, sessions, windows, " +
          "agents, airplane mode."
      )
      .usage("<verb> <epic>[#<id>] [arguments]")
      .addHelpText("after", EPIC_HELP)
      // each verb by name alone in the list:  its arguments are its own (`epic <verb> --help`)
      .configureHelp({ subcommandTerm: (verb) => verb.name() })
    this.epic = epic
    // `epic --version`:  which code runs, for "a worktree behind main runs main's code"
    epic.option("-V, --version", "the code this epic runs:  its commit, branch and checkout")
    epic.on("option:version", () => {
      process.stdout.write(`${EpicProgram.version()}\n`)
      process.exit(EXIT.OK)
    })
    // our own `help`, as `spell` has:  `epic help add` ~== `epic add --help`
    epic.helpCommand("help [verb]", "show help -- for one verb, e.g. epic help update")
    // an unknown verb:  say so, with the verbs there are (commander's own message names none)
    epic.on("command:*", ([verb]: string[]) => unknownVerb(epic, `epic ${verb}`))
    this.addRequestVerbs()
    this.addPageVerbs()
    this.addSagaVerbs()
    this.addWorkVerbs()
    this.addWindowVerbs()
    this.addSettingsVerbs()
    this.addToolGroups()
  }

  /**
   * Run the command line (`process.argv`, `epic <verb> ...`);  never resolves:  every verb exits the process with its
   * code (`runVerb()`).
   */
  async parse(): Promise<void> {
    // output piped into e.g. `head`, which closed it:  nothing more to say
    process.stdout.on("error", (error: NodeJS.ErrnoException) => error.code === "EPIPE" && process.exit(EXIT.OK))
    await this.epic.parseAsync()
  }

  ////////////////
  // ## Epic-wide:  requests from other sessions
  ////////////////

  /** `send`, `requests`, `file`, `home`, `merge`:  `Requests`. */
  private addRequestVerbs(): void {
    const epic = this.epic
    epic.commandsGroup("Requests from other sessions:")

    const requests = (verb: Command) =>
      verb
        .argument("[args...]")
        .allowUnknownOption()
        .action(() => runVerb(() => new Requests().run([verb.name(), ...rawArgs(verb.name())])))

    requests(epic.command("send"))
      .description("send an epic a request:  Owen's words and screenshots;  no epic:  the tooling home")
      .usage('[<epic>] --text "..." | --file <file> [--images <n>] [--context "..."] [--from <session>] [--json]')
      .addHelpText("after", example('epic send seo --text "the comment box is too narrow" --images 1'))

    requests(epic.command("requests"))
      .description("every request sent to an epic, and where each went")
      .usage("<epic> [--json]")
      .addHelpText("after", example("epic requests seo"))

    requests(epic.command("file"))
      .description(
        "file a request into a phase:  Owen's words and screenshots into its Requests field;  or, with no phase, " +
          'mark where it went:  "dropped:  done in P3"'
      )
      .usage('<epic>#P3 <request id>  |  <epic> <request id> "where it went"')
      .addHelpText("after", FILE_HELP)

    // `file`'s old name (epic `epic-workflow` P19):  `epic add-request seo#P7 r3 --from ... --file r3.html`
    requests(epic.command("add-request", { hidden: true }))

    requests(epic.command("home"))
      .description("the tooling home, the epic dev-tooling requests go to;  with an epic, set it")
      .usage("[<epic>]")
      .addHelpText("after", example("epic home epic-workflow"))

    requests(epic.command("merge"))
      .description("a standing epic's phase onto main at once, fast-forward only;  run in the main checkout")
      .usage("<epic>")
      .addHelpText("after", example("epic merge epic-workflow"))
  }

  ////////////////
  // ## Epic page:  making and reading
  ////////////////

  /** The verbs on an epic page:  the `epic` tool's. */
  private addPageVerbs(): void {
    const epic = this.epic
    epic.commandsGroup("Epic page:  making and reading:")

    this.page(
      epic.command("new"),
      "make an epic page from the template;  --future:  an idea for later, not planned yet;  --saga:  the saga it serves",
      'epic new seo --title "SEO" --prompt "Make the docs findable"'
    ).usage('<epic> [--title "Title"] [--prompt "text" | --prompt-file <file>] [--future] [--saga <id>]')
    this.page(
      epic.command("list"),
      "every epic:  in progress, future or done, where it runs, items not reviewed",
      "epic list --json"
    ).usage("[--json]")
    this.page(
      epic.command("summary"),
      "an epic's phases, the next one, its open questions, issues, caveats and todos",
      "epic summary seo"
    ).usage("<epic> [--json]")
    this.page(
      epic.command("summaries"),
      "`summary --json` of each page, by path (worktrees' too), for /epics",
      "epic summaries epics/seo/seo.plan.html"
    ).usage("<file.html>...")
    this.page(
      epic.command("items"),
      "what a review walks:  sections, counts, items, the queue",
      "epic items seo --filter unreviewed"
    ).usage("<epic> [--section issues] [--filter unreviewed | open | reviewed | queued | all] [--json] [--spec <file>]")
    this.page(
      epic.command("docs"),
      "the docs an epic wrote besides its page, and its changelog entry (for /docs-check)",
      "epic docs seo"
    ).usage("<epic> [--json]")
    this.page(
      epic.command("decisions"),
      "what an epic's page settled:  phases' Done and Updated notes, items' answers",
      "epic decisions seo"
    ).usage("<epic> [--json]")
    this.page(
      epic.command("open"),
      "show an epic's page in VS Code's side bar:  Spell Docs, or with --review the Review tab",
      "epic open seo --review"
    ).usage("<epic> [--review]")
    this.page(
      epic.command("check"),
      "ids, #id links, phases, parts;  its links;  then the browser check",
      "epic check seo --no-browser"
    ).usage("<epic> [--no-browser] [--links]")

    ////////////////
    // ## Epic page:  phases
    ////////////////

    epic.commandsGroup("Epic page:  phases:")

    this.page(
      epic.command("add-phase"),
      "add a phase:  what's wrong (symptom), what changes;  --before N inserts it as PN",
      'epic add-phase seo "Sitemap" --symptom "<p>No sitemap.</p>" --changes "<p>Write one.</p>" --estimate 2h'
    )
      .usage('<epic> "Short Name" --symptom <html> --changes <html> [--goal ...] [--files ...] [--verify ...]')
      .addHelpText("after", "\n  Also:  [--estimate 2h] [--before N]")
    this.page(epic.command("update"), "set a phase's or an item's fields, or the page's flags")
      .usage("<epic>#P3 | <epic>#J3 | <epic>  --field <value> ...")
      .addHelpText("after", UPDATE_HELP)
    this.page(
      epic.command("updated"),
      "a change to a phase's plan:  an Update block at the end of its description",
      'epic updated seo#P3 "<p>Split in two:  the sitemap first.</p>" --summary "split in two"'
    ).usage('<epic>#P3 "<html>" | --file <file> [--summary "..."]')
    this.page(
      epic.command("phase"),
      "set a phase's status;  done:  --done writes what was built",
      'epic phase seo#P3 done --done "<ul><li>the sitemap, written on build</li></ul>"'
    ).usage("<epic>#P3 todo | active | done [--done <html>] [--no-open]")
    this.page(
      epic.command("commit"),
      "list a commit under a phase or an item (replacing its entry there)",
      'epic commit seo#P3 1a2b3c4 "the sitemap, written on build"'
    ).usage('<epic>#P3 | <epic>#J3  <sha> "what it did"')
    this.page(
      epic.command("commits"),
      "every phase and item commit in the page's history, into their lists",
      "epic commits seo --backfill"
    ).usage("<epic> --backfill")

    ////////////////
    // ## Epic page:  items
    ////////////////

    epic.commandsGroup("Epic page:  items:")

    this.page(
      epic.command("add"),
      "add an item (J judgement, Q question, I issue, C caveat, T todo, V test, D decision)"
    )
      .usage('<epic>#J "Title" [--details <html>] [--calm]')
      .addHelpText("after", ADD_HELP)
    this.page(
      epic.command("calm"),
      "items not urgent (yellow), as the page's id chip does;  --loud:  urgent (red) again",
      "epic calm seo#J3 J4"
    ).usage("<epic>#J3 [J4 ...] [--loud]")
    this.page(
      epic.command("decide"),
      "answer a question:  the answer goes into it;  --option marks the chosen option",
      'epic decide seo#Q3 "Both, the sitemap first" --option A'
    ).usage('<epic>#Q3 "answer" [--details <html>] [--option A]')
    this.page(epic.command("close"), "close an item:  done", "epic close seo#J3").usage("<epic>#J3")
    this.page(epic.command("reopen"), "open a closed or canceled item again", "epic reopen seo#J3").usage("<epic>#J3")
    this.page(
      epic.command("cancel"),
      "an item made moot by another decision:  struck through",
      'epic cancel seo#J3 "moot:  P4 dropped the page"'
    ).usage('<epic>#J3 ["why"]')
    this.page(
      epic.command("details"),
      "write an agent's details or reply into an item;  --append adds it, --more under it",
      "epic details seo#J3 --file reply.html"
    ).usage("<epic>#J3 --file <reply.html> [--append | --more]")
    this.page(
      epic.command("status"),
      "Claude's status card on an item:  underway (spinner on), done, or noted",
      'epic status seo#J3 underway "Reading the routes"'
    ).usage('<epic>#J3 underway "<reading>" | done ["<summary>"] | noted "<what was recorded>"')
    this.page(
      epic.command("restore"),
      "put earlier text (from git) into an item's Original Discussion",
      'epic restore seo#J3 --file old.html --as-of "2026-10-01 09:00"'
    ).usage('<epic>#J3 --file <old.html> [--as-of "YYYY-MM-DD HH:MM"]')
    this.page(
      epic.command("review"),
      "mark an item reviewed today;  the outcome goes in the log",
      'epic review seo#J3 "kept as it is"'
    ).usage('<epic>#J3 ["outcome"]')
    this.page(epic.command("defer"), "put an item off:  still not reviewed, dated", "epic defer seo#J3").usage(
      "<epic>#J3"
    )
    this.page(
      epic.command("queue"),
      "work a review decided on, waiting to be done",
      'epic queue seo#J3 "rename the flag to --all"'
    ).usage('<epic>#J3 "the work"')
    this.page(epic.command("unqueue"), "off the to-do list:  started, or dropped", "epic unqueue seo#J3").usage(
      "<epic>#J3"
    )

    ////////////////
    // ## Epic page:  the review inbox
    ////////////////

    epic.commandsGroup("Epic page:  the review inbox:")

    this.page(
      epic.command("inbox"),
      "the marks and comments Owen sends from the page, and how a review session takes them"
    )
      .usage("<epic> [listen | unlisten | wait | apply]  |  <epic>#J3 working on | off  |  <epic>#J3 done | clear")
      .addHelpText("after", INBOX_HELP)

    ////////////////
    // ## Epic page:  log and upkeep
    ////////////////

    epic.commandsGroup("Epic page:  log and upkeep:")

    this.page(epic.command("log"), "a timestamped line in the page's log", 'epic log seo "P3 started"').usage(
      '<epic> "text"'
    )
    this.page(
      epic.command("prompt"),
      'set the prompt that started the epic ("" removes it)',
      "epic prompt seo --file prompt.md"
    ).usage('<epic> "text" | --file <file>')
    this.page(
      epic.command("bedtime"),
      "a /bedtime run:  start turns bedtime mode on (changes stay green until reviewed), done off",
      'epic bedtime seo start "P3-P6,P9"'
    ).usage('<epic> start "P3-P6,P9" | done "summary"')
    this.page(
      epic.command("overnight"),
      "an older page's Overnight report section (before 2026-10-05):  gone, once read",
      "epic overnight seo remove"
    ).usage("<epic> remove")
    this.page(
      epic.command("backfill"),
      "items Owen already went through in past sessions:  a dry run unless --apply",
      "epic backfill seo --apply"
    ).usage("<epic> | --all [--apply]")
    this.page(
      epic.command("convert"),
      "rewrite pages from the old markup into <epic-*> markup, into --out only",
      "epic convert seo --out /tmp/converted"
    ).usage("<epic>... | --all [--dry-run] [--out <folder>] [--verbose]")
    this.page(
      epic.command("split"),
      "store a page as a skeleton plus part files;  --done:  every finished epic",
      "epic split seo --dry-run"
    ).usage("<epic> [--dry-run] | --done [--dry-run]")
    this.page(epic.command("join"), "a split page back into one file", "epic join seo").usage("<epic>")
    this.page(
      epic.command("migrate"),
      "bring pages up to today's markup, every step of their kind;  safe to run again",
      "epic migrate --all --dry-run"
    ).usage("[<kind>] [<epic>... | --all] [--file <page>] [--step <name>] [--dry-run] [--notify] [--list]")
  }

  ////////////////
  // ## Sagas
  ////////////////

  /** `saga`:  the sagas' list and each epic's saga, the `epic` tool's. */
  private addSagaVerbs(): void {
    const epic = this.epic
    epic.commandsGroup("Sagas:")

    this.page(epic.command("saga"), "the sagas (epics of epics):  their list in order, and the saga each epic serves")
      .usage(
        'list [--json] | set <epic> <saga> | set <epic> --none | new <id> "Title" --purpose "..." | page <id> | ...'
      )
      .addHelpText("after", SAGA_HELP)
  }

  ////////////////
  // ## Worktrees, sessions, parked work, shared content
  ////////////////

  /** `worktree`, `session`, `park`, `stock`, `shared`:  this folder's classes (epic `epic-eject` P5). */
  private addWorkVerbs(): void {
    const epic = this.epic
    epic.commandsGroup("Worktrees, sessions and parked work:")

    this.group(
      epic.command("worktree"),
      "git worktrees:  the live sessions and where they work, where a name stands, merging main in",
      (args) => new Worktrees().run(args)
    )
    this.group(
      epic.command("session"),
      "Claude Code sessions:  list, find, open in VS Code, title this one, mark finished ones ✅, digest a transcript",
      (args) => new Sessions().run(args)
    )
    this.group(
      epic.command("park"),
      "parked work:  the PARKED notes, what /wait-for could wait on, waiting for a name to finish",
      (args) => new Parking().run(args)
    )
    epic
      .command("stock")
      .description("take stock:  worktrees, branches, sessions, parked work, plans -- in process, hung or parked, dead")
      .usage("[--json]")
      .argument("[args...]")
      .allowUnknownOption()
      .addHelpText("after", example("epic stock --json"))
      .action(() => runVerb(() => new Stock().run(rawArgs("stock"))))

    epic.commandsGroup("Shared content:")

    this.group(
      epic.command("shared"),
      "shared content:  docs pages, sagas and logs in one repo beside the checkout, linked into every one",
      (args) => new Shared().run(args)
    )
  }

  ////////////////
  // ## Windows and the page server
  ////////////////

  /** `window`, `server`:  scripts passed through. */
  private addWindowVerbs(): void {
    const epic = this.epic
    epic.commandsGroup("Windows and the page server:")

    this.group(
      epic.command("window"),
      "VS Code windows per package and worktree:  open, close, handoff, show, stay-check ...",
      (args) => EpicTools.run("window", args)
    )
    this.group(
      epic.command("server"),
      "this checkout's page server;  start --all:  every web server (page server, editor, Spell UI)",
      (args) =>
        args[0] === "start" && args.includes("--all")
          ? EpicTools.run(
              "serve",
              args.slice(1).filter((arg) => arg !== "--all")
            )
          : EpicTools.run("server", args)
    )
  }

  ////////////////
  // ## The repo's settings
  ////////////////

  /** `config`. */
  private addSettingsVerbs(): void {
    const epic = this.epic
    epic.commandsGroup("The repo's settings:")

    epic
      .command("config")
      .description("where this repo keeps its epic things (.epic/config.json5):  a value, or all of them")
      .usage("[<key>] [--json]")
      .argument("[args...]")
      .allowUnknownOption()
      .addHelpText("after", CONFIG_HELP)
      .action(() => runVerb(() => EpicProgram.config(rawArgs("config"))))
  }

  ////////////////
  // ## Groups:  the docs tools
  ////////////////

  /** `ask`, `choices`, `comments`, `notes`, `agents`, `airplane`:  the docs tools passed through. */
  private addToolGroups(): void {
    const epic = this.epic
    epic.commandsGroup("Pages Owen answers on, agents, airplane mode:")

    const tool = (name: EpicToolName) => (args: string[]) => EpicTools.run(name, args)
    this.group(
      epic.command("ask"),
      "details pages:  a question explained on a page in VS Code's side bar, Owen answering on it",
      tool("details")
    )
    this.group(
      epic.command("choices"),
      "choice pages:  a table of names Claude recommends, Owen's call on each",
      tool("choices")
    )
    this.group(
      epic.command("comments"),
      "comments Owen leaves on docs pages:  list, wait for, gather, mark and answer them",
      tool("comments")
    )
    this.group(
      epic.command("notes"),
      "page notes Owen left on docs pages (before comments):  list, answer, mark done",
      tool("notes")
    )
    this.group(
      epic.command("agents"),
      "the running-agents list of this epic (else this checkout):  what each background agent is doing",
      tool("agents")
    )
    this.group(
      epic.command("airplane"),
      "airplane mode:  the docs worked on with no Claude, everything kept for /airplane land",
      tool("airplane")
    )
  }

  ////////////////
  // ## Building verbs
  ////////////////

  /**
   * Make `verb` a verb on an epic page:  run by the `epic` tool, after `planDocArgs()`;  returns it, for its usage
   * line and help.
   * - `sample`:  a whole command line, for its help's "Example:" (a verb with its own help text has its examples
   *   there)
   * - its arguments are taken raw (`rawArgs()`):  `--goal` / `--details` ... are the tool's, not commander's
   * - `epic.command("<name>")` stays at each call:  `spell dev commands` finds the verbs by that text
   */
  private page(verb: Command, description: string, sample?: string): Command {
    const name = verb.name()
    if (sample) verb.addHelpText("after", example(sample))
    return verb
      .description(description)
      .argument("[args...]")
      .allowUnknownOption()
      .action(() => runVerb(() => EpicTools.runPlanDoc([name, ...rawArgs(name)])))
  }

  /**
   * Make `command` group `name` of `epic`'s, run by `run` with its arguments verbatim, with a verb of its own for
   * each of `GROUP_VERBS`, so `epic ask new --help` prints that verb's help.
   * - an unknown verb (`epic ask bogus`):  refused, exit 1, listing the group's verbs
   * - no verb (`epic agents`, `epic comments --json`):  the tool's default, or its usage;  a verb after a flag the
   *   tool takes (`epic agents --epic seo list`) is the tool's to read:  commander can't tell a flag's value from a
   *   verb
   * - `epic.command("<name>")` stays at each call:  `spell dev commands` finds the verbs by that text
   */
  private group(command: Command, description: string, run: (args: string[]) => Promise<number>): Command {
    const name = command.name() as GroupName
    command
      .description(description)
      .usage("<verb> [arguments]")
      .argument("[args...]")
      .allowUnknownOption()
      .configureHelp({ subcommandTerm: (verb) => verb.name() })
      .addHelpText(
        "after",
        `${example(GROUP_VERBS[name][0]!.example)}\n\nepic ${name} <verb> --help says more about each.`
      )
      .action((args: string[]) => {
        // a known verb went to its own command (below):  a word here is a verb the group lacks
        if (args[0] !== undefined && !args[0].startsWith("-")) unknownVerb(command, `epic ${name} ${args[0]}`)
        return runVerb(() => run(rawArgs(name)))
      })
    for (const verb of GROUP_VERBS[name]) {
      command
        .command(verb.name)
        .description(verb.description)
        // a verb with no arguments (`airplane on`):  none, rather than commander's "[options] [args...]"
        .usage(verb.usage || " ")
        .argument("[args...]")
        .allowUnknownOption()
        .addHelpText("after", example(verb.example))
        .action(() => runVerb(() => run(rawArgs(name))))
    }
    return command
  }

  ////////////////
  // ## Statics:  verbs of the program itself
  ////////////////

  /**
   * `epic config [<key>] [--json]`:  where this repo keeps its epic things, as `.epic/config.json5` says
   * (`EpicConfig`, epic `epic-eject` P4).
   * - `<key>`:  that value alone, on a line of its own, for a skill to use in a path:
   *   `epic config contentFolder` => `/Users/owen/www/spell-app/spell-app-dev`
   *   - folders absolute;  a window name by its dotted key, `windows.default`
   * - no key:  every value, `key:  value` a line;  `--json`:  all of them as JSON
   * - the repo:  the checkout the command runs in (any worktree reads the main checkout's file), else this code's
   * - Returns 0.  Throws `EpicCommandError`:  exit 2 for an unknown key, listing the keys;  1 for a file that won't
   *   read.
   * - static:  needs no tree
   */
  static async config(args: string[]): Promise<number> {
    const json = args.includes("--json")
    const [key] = args.filter((arg) => !arg.startsWith("--"))
    let values: Record<string, string | boolean>
    try {
      values = EpicConfig.of(Git.nearestCheckout(".git")).values()
    } catch (error) {
      throw new EpicCommandError((error as Error).message, EXIT.ERRORS)
    }
    if (key === undefined) {
      const lines = Object.entries(values).map(([name, value]) => `${name}:  ${value}`)
      process.stdout.write(json ? `${JSON.stringify(values, null, 2)}\n` : `${lines.join("\n")}\n`)
      return EXIT.OK
    }
    if (!(key in values))
      throw new EpicCommandError(`epic config ${key}?  no such key.  The keys:  ${Object.keys(values).join(", ")}`)
    process.stdout.write(json ? `${JSON.stringify(values[key])}\n` : `${values[key]}\n`)
    return EXIT.OK
  }

  /**
   * `epic --version`:  the code this `epic` runs, `<short sha> (<branch>) <checkout>`.
   * - static:  this code's checkout, whoever calls
   */
  static version(): string {
    const sha = Git.run(["rev-parse", "--short", "HEAD"], Git.CODE_ROOT).out || "?"
    const branch = Git.run(["branch", "--show-current"], Git.CODE_ROOT).out || "detached"
    return `epic ${sha} (${branch}) ${Git.CODE_ROOT}`
  }
}

/**
 * Run verb `run`, then exit with the code it resolves to, once its output is written.
 * - An `EpicCommandError` prints just its message, in red;  anything else is a crash, and prints its stack.
 * - NOTE: exits explicitly:  a tool can leave timers running, which would keep the process alive.
 */
async function runVerb(run: () => Promise<number>): Promise<never> {
  let exitCode: number
  try {
    exitCode = await run()
  } catch (error) {
    const known = error instanceof EpicCommandError
    process.stderr.write(`${chalk.red(known ? error.message : ((error as Error)?.stack ?? String(error)))}\n`)
    exitCode = known ? error.exitCode : EXIT.ERRORS
  }
  // let stdout drain first, e.g. into a pipe, or `process.exit()` cuts it short
  await new Promise<void>((done) => process.stdout.write("", () => done()))
  process.exit(exitCode)
}

/**
 * Refuse `typed`, a verb `command` doesn't have, listing those it does;  exits 1, as commander exits for a mistake
 * (a usage error, a verb's missing argument, is 2:  `EXIT.USAGE`).
 */
function unknownVerb(command: Command, typed: string): never {
  const verbs = command.createHelp().visibleCommands(command)
  const names = verbs.map((verb) => verb.name()).filter((name) => name !== "help")
  const help = command.parent ? `${typed.split(" ").slice(0, 2).join(" ")} <verb> --help` : "epic <verb> --help"
  process.stderr.write(
    `${chalk.red(`${typed}?  no such verb.`)}  The verbs:\n${wrap(names.join(", "))}\n${help} says what each does.\n`
  )
  process.exit(EXIT.ERRORS)
}

/** `text` wrapped at spaces to lines of at most 100 columns, each indented 2. */
function wrap(text: string): string {
  const lines: string[] = []
  let line = ""
  for (const word of text.split(" ")) {
    if (line && line.length + word.length + 1 > 98) {
      lines.push(line)
      line = ""
    }
    line = line ? `${line} ${word}` : word
  }
  return [...lines, line].map((each) => `  ${each}`).join("\n")
}

/** A verb's help's "Example:", for `addHelpText("after", ...)`. */
function example(commandLine: string): string {
  return `\nExample:\n  ${commandLine}`
}

/**
 * Everything on the command line after verb `verb`, as typed.
 * - Why:  commander would take a tool's own flags (`--all`, `--goal`) as ours
 */
function rawArgs(verb: string): string[] {
  const argv = process.argv
  return argv.slice(argv.indexOf(verb, 2) + 1)
}

/** After `epic --help`'s verbs:  how to name things. */
const EPIC_HELP = `
Naming what a verb acts on:
  seo                 the epic's page, epics/seo/seo.plan.html
  seo#J3              an item:  J3 (a comment on the page, seo#M3, too;  m3, cm3 read the same)
  seo#P3              a phase:  P3, or by its id, seo#p-epic-migrate;  phase, updated and file take its name
                      too:  seo#epic-migrate, "seo#Epic Migrate"
  seo#J               a new item of that kind, for add:  epic add seo#J "Title"
  SAGA:/epics         a saga's page, sagas/epics/epics.saga.html:  epic add SAGA:/epics#T "Title"
  guides/x.html#M3    a comment on a docs page, for epic comments (and a page note, guides/x.html#n3)

Examples:
  epic summary seo
  epic phase seo#P3 done --done "<ul><li>...</li></ul>"
  epic update seo#P3 --goal "<p>...</p>" --estimate 2h
  epic status seo#J3 underway "Writing the answer"
  epic inbox seo wait

epic <verb> --help says more about each;  an id always goes after a #, never as a word of its own.`

/** After `epic config --help`. */
const CONFIG_HELP = `
The keys (folders print absolute;  the file's are relative to the main checkout):
  contentFolder        the shared content repo:  epics, guides, sagas, the logs
  baseBranch           the branch worktrees start from and merge into
  worktreesFolder      where worktrees go, <worktreesFolder>/<name>
  installCommand       what makes a new worktree ready to run
  windows.default      the window a worktree's window is opened from, by default
  windows.repoName     the repo root's folder name in every window
  windows.contentName  the content repo's folder name in every window
  linkSessionFolders   whether worktrees' saved-session folders are linked to main's
Any worktree reads the main checkout's file;  a key it leaves out takes its default.

Examples:
  epic config contentFolder
  epic config --json`

/** After `epic file --help`. */
const FILE_HELP = `
Into a phase, the request's words, context and screenshots go into its Requests field, and the request is marked
filed there (P3).  With no phase, it's only marked, saying where it went.

Examples:
  epic file seo#P3 r3
  epic file seo r3 "dropped:  done in P2"`

/** After `epic update --help`. */
const UPDATE_HELP = `
A phase (seo#P3):
  --symptom, --changes, --goal, --files, --verify <html>   its body ("" removes one)
  --estimate <time>                                       its estimate, e.g. 1-2h
  --title "New name" [--html]                             rename it:  links that say the old name follow
An item (seo#J3):
  --title "New title" [--html]                            retitle it
  --calm  /  --loud                                       not urgent (yellow)  /  urgent (red)
The page (seo):
  --standing [on | off],  --no-standing                   a standing epic:  open for good, never done

Examples:
  epic update seo#P3 --goal "<p>...</p>" --estimate 2h
  epic update seo#J3 --title "Clearer title"
  epic update epic-workflow --standing`

/** After `epic saga --help`. */
const SAGA_HELP = `
The sagas' list, in Owen's order:  sagas/sagas.json5.  An epic names its saga:  <epic-page saga="<id>">.
  epic saga list [--json]                         the sagas in order, each with its epics and guide count
  epic saga set <epic> <saga>                     the saga an epic serves (--none:  no saga);  logged
  epic saga new <id> "Title" --purpose "..." [--after <id>]
                                                  a new saga, last or after <id>;  its id one or two words
  epic saga move <id> --before <id> | --after <id>
                                                  its place in the list
  epic saga title <id> "Title"                    its title
  epic saga rename <old> <new>                    its id:  epic pages, guides' saga metas, its folder and
                                                  SAGA:/<old> addresses in the shared pages follow
  epic saga page <id> [--force]                   its page, sagas/<id>/<id>.saga.html, from the template;
                                                  --force remakes it;  every epic verb edits it as SAGA:/<id>

Example:
  epic saga set python-target output-targets`

/** After `epic add --help`. */
const ADD_HELP = `
Prints the new item's id.  The letter after # is its kind:
  J judgement   Q question   I issue   C caveat   T todo   V test (checked by hand)   D decision (a question born answered)
--calm (last):  a judgement or issue that wouldn't surprise Owen, yellow rather than red.

Example:
  epic add seo#J "Kept one file per template" --details "<p>Why ...</p>" --calm`

/** After `epic inbox --help`. */
const INBOX_HELP = `
Examples:
  epic inbox seo                  what Owen sent from the page:  requests, marks, comments
  epic inbox seo listen           this session waits on the inbox;  unlisten:  stopped
  epic inbox seo wait             block until there's work, print it, exit 0 (run it in the background)
  epic inbox seo apply [ids...]   apply the sent approve / pick / todo marks to the page;  --all:  sent or not
  epic inbox seo#J3 working on    the page's spinner on an item (or a comment, seo#M3);  off:  stopped
  epic inbox seo#J3 done          an agent finished the item:  its mark and spinner go
  epic inbox seo#J3 clear         drop its marks (a revisit talked over)`
