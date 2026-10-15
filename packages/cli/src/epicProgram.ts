/**
 * `epic <verb> ...`:  the epic tools, a command of their own beside `spell` (epic `epic-workflow` P9) --
 * the commander tree the lean `epicMain.ts` builds, and `epic --help`.
 * - Most verbs edit or read an epic page (`epics/<name>/<name>.plan.html`):  the `epic` tool, run IN this process
 *   (`planDocCommand()`), after `planDocArgs()` turns Owen's `seo#J3` addressing into the tool's arguments
 * - The groups (`ask`, `choices`, `comments`, `notes`, `agents`, `airplane`):  the docs tools, passed through as
 *   `spell dev` passes them, their arguments verbatim
 * - `send`, `requests`, `file`, `home`, `merge`:  need the `$/cli` barrel (which loads spell), so they're handed
 *   over to `main.ts` (`handOver`), as `spell dev`'s barrel commands are
 * - The old spellings still run the same tools:  `spell dev plan-doc <verb> <name> ...`, `spell dev details ...`
 *   (`devProgram.ts`), and `spell epic <verb>` (`bin/spell.mjs` sends it here)
 * - NOTE: `commandsCommand` reads the `epic.command(...)` calls in this file's TEXT:  keep the receiver named `epic`
 * - NOT in the barrel:  it's how `epicMain.ts` starts, and must load without it (no spell)
 */
import { Command } from "commander"

// Import directly, not through `$/cli`:  the barrel loads spell, and `epic` must start fast (`epicMain.ts`)
import { EXIT } from "$/cli/cli.types"
import { agentsCommand } from "$/cli/commands/agentsCommand"
import { airplaneCommand } from "$/cli/commands/airplaneCommand"
import { choicesCommand } from "$/cli/commands/choicesCommand"
import { commentsCommand } from "$/cli/commands/commentsCommand"
import { detailsCommand } from "$/cli/commands/detailsCommand"
import { notesCommand } from "$/cli/commands/notesCommand"
import { planDocCommand } from "$/cli/commands/planDocCommand"
import { runLean } from "$/cli/devProgram"
import { planDocArgs } from "$/cli/epic/epicArgs"

/**
 * The `epic` program, every verb on it.
 * - `handOver`:  runs the command line through `main.ts` instead (it loads spell), for the verbs that need it
 */
export function epicProgram(handOver: () => Promise<never>): Command {
  const epic = new Command("epic")
    .description("Work with epics:  their pages (epics/<name>/), the pages Owen answers on, agents, airplane mode.")
    .usage("<verb> <epic>[#<id>] [arguments]")
    .addHelpText("after", EPIC_HELP)
    // each verb by name alone in the list:  its arguments are its own (`epic <verb> --help`)
    .configureHelp({ subcommandTerm: (verb) => verb.name() })
  // our own `help`, as `spell` has:  `epic help add` ~== `epic add --help`
  epic.helpCommand("help [verb]", "show help -- for one verb, e.g. epic help update")

  ////////////////
  // ## Epic-wide:  requests from other sessions
  ////////////////

  epic.commandsGroup("Requests from other sessions:")

  epic
    .command("send")
    .description("send an epic a request:  Owen's words and screenshots;  no epic:  the tooling home")
    .usage('[<epic>] --text "..." | --file <file> [--images <n>] [--context "..."] [--from <session>] [--json]')
    .argument("[args...]")
    .allowUnknownOption()
    .action(handOver)

  epic
    .command("requests")
    .description("every request sent to an epic, and where each went")
    .usage("<epic> [--json]")
    .argument("[args...]")
    .allowUnknownOption()
    .action(handOver)

  epic
    .command("file")
    .description('file a request into a phase (its Requests field), or mark where it went:  "dropped:  done in P3"')
    .usage('<epic> <request id> <phase | "where it went">')
    .argument("[args...]")
    .allowUnknownOption()
    .action(handOver)

  epic
    .command("home")
    .description("the tooling home, the epic dev-tooling requests go to;  with an epic, set it")
    .usage("[<epic>]")
    .argument("[args...]")
    .action(handOver)

  epic
    .command("merge")
    .description("a standing epic's phase onto main at once, fast-forward only;  run in the main checkout")
    .usage("<epic>")
    .argument("[args...]")
    .action(handOver)

  ////////////////
  // ## Epic page:  making and reading
  ////////////////

  epic.commandsGroup("Epic page:  making and reading:")

  page(
    epic.command("new"),
    "make an epic page from the template;  --future:  an idea for later, not planned yet;  --saga:  the saga it serves"
  ).usage('<epic> [--title "Title"] [--prompt "text" | --prompt-file <file>] [--future] [--saga <id>]')
  page(epic.command("list"), "every epic:  in progress, future or done, where it runs, items not reviewed").usage(
    "[--json]"
  )
  page(epic.command("summary"), "an epic's phases, the next one, its open questions, issues, caveats and todos").usage(
    "<epic> [--json]"
  )
  page(epic.command("summaries"), "`summary --json` of each page, by path (worktrees' too), for /epics").usage(
    "<file.html>..."
  )
  page(epic.command("items"), "what a review walks:  sections, counts, items, the queue").usage(
    "<epic> [--section issues] [--filter unreviewed | open | reviewed | queued | all] [--json] [--spec <file>]"
  )
  page(
    epic.command("docs"),
    "the docs an epic wrote besides its page, and its changelog entry (for /docs-check)"
  ).usage("<epic> [--json]")
  page(epic.command("decisions"), "what an epic's page settled:  phases' Done and Updated notes, items' answers").usage(
    "<epic> [--json]"
  )
  page(
    epic.command("open"),
    "show an epic's page in VS Code's side bar:  Spell Docs, or with --review the Review tab"
  ).usage("<epic> [--review]")
  page(epic.command("check"), "ids, #id links, phases, parts;  its links;  then the browser check").usage(
    "<epic> [--no-browser] [--links]"
  )

  ////////////////
  // ## Epic page:  phases
  ////////////////

  epic.commandsGroup("Epic page:  phases:")

  page(epic.command("add-phase"), "add a phase:  what's wrong (symptom), what changes;  --before N inserts it as PN")
    .usage('<epic> "Short Name" --symptom <html> --changes <html> [--goal ...] [--files ...] [--verify ...]')
    .addHelpText("after", "\n  Also:  [--estimate 2h] [--before N]")
  page(epic.command("update"), "set a phase's or an item's fields, or the page's flags")
    .usage("<epic>#P3 | <epic>#J3 | <epic>  --field <value> ...")
    .addHelpText("after", UPDATE_HELP)
  page(epic.command("updated"), "a change to a phase's plan:  an Update block at the end of its description").usage(
    '<epic>#P3 "<html>" | --file <file> [--summary "..."]'
  )
  page(epic.command("phase"), "set a phase's status;  done:  --done writes what was built").usage(
    "<epic>#P3 todo | active | done [--done <html>] [--no-open]"
  )
  page(
    epic.command("add-request"),
    "a request from another session, into a phase's Requests field (epic file runs it)"
  ).usage('<epic>#P7 <request id> --from "..." --file <request.html>')
  page(epic.command("commit"), "list a commit under a phase or an item (replacing its entry there)").usage(
    '<epic>#P3 | <epic>#J3  <sha> "what it did"'
  )
  page(epic.command("commits"), "every phase and item commit in the page's history, into their lists").usage(
    "<epic> --backfill"
  )

  ////////////////
  // ## Epic page:  items
  ////////////////

  epic.commandsGroup("Epic page:  items:")

  page(epic.command("add"), "add an item (J judgement, Q question, I issue, C caveat, T todo, V test, D decision)")
    .usage('<epic>#J "Title" [--details <html>] [--calm]')
    .addHelpText("after", ADD_HELP)
  page(
    epic.command("calm"),
    "items not urgent (yellow), as the page's id chip does;  --loud:  urgent (red) again"
  ).usage("<epic>#J3 [J4 ...] [--loud]")
  page(epic.command("decide"), "answer a question:  the answer goes into it;  --option marks the chosen option").usage(
    '<epic>#Q3 "answer" [--details <html>] [--option A]'
  )
  page(epic.command("close"), "close an item:  done").usage("<epic>#J3")
  page(epic.command("reopen"), "open a closed or canceled item again").usage("<epic>#J3")
  page(epic.command("cancel"), "an item made moot by another decision:  struck through").usage('<epic>#J3 ["why"]')
  page(
    epic.command("details"),
    "write an agent's details or reply into an item;  --append adds it, --more under it"
  ).usage("<epic>#J3 --file <reply.html> [--append | --more]")
  page(epic.command("status"), "Claude's status card on an item:  underway (spinner on), done, or noted").usage(
    '<epic>#J3 underway "<reading>" | done ["<summary>"] | noted "<what was recorded>"'
  )
  page(epic.command("restore"), "put earlier text (from git) into an item's Original Discussion").usage(
    '<epic>#J3 --file <old.html> [--as-of "YYYY-MM-DD HH:MM"]'
  )
  page(epic.command("review"), "mark an item reviewed today;  the outcome goes in the log").usage(
    '<epic>#J3 ["outcome"]'
  )
  page(epic.command("defer"), "put an item off:  still not reviewed, dated").usage("<epic>#J3")
  page(epic.command("queue"), "work a review decided on, waiting to be done").usage('<epic>#J3 "the work"')
  page(epic.command("unqueue"), "off the to-do list:  started, or dropped").usage("<epic>#J3")

  ////////////////
  // ## Epic page:  the review inbox
  ////////////////

  epic.commandsGroup("Epic page:  the review inbox:")

  page(epic.command("inbox"), "the marks and comments Owen sends from the page, and how a review session takes them")
    .usage("<epic> [listen | unlisten | wait | apply]  |  <epic>#J3 working on | off  |  <epic>#J3 done | clear")
    .addHelpText("after", INBOX_HELP)

  ////////////////
  // ## Epic page:  log and upkeep
  ////////////////

  epic.commandsGroup("Epic page:  log and upkeep:")

  page(epic.command("log"), "a timestamped line in the page's log").usage('<epic> "text"')
  page(epic.command("prompt"), 'set the prompt that started the epic ("" removes it)').usage(
    '<epic> "text" | --file <file>'
  )
  page(
    epic.command("bedtime"),
    "a /bedtime run:  start turns bedtime mode on (changes stay green until reviewed), done off"
  ).usage('<epic> start "P3-P6,P9" | done "summary"')
  page(
    epic.command("overnight"),
    "an older page's Overnight report section (before 2026-10-05):  gone, once read"
  ).usage("<epic> remove")
  page(epic.command("backfill"), "items Owen already went through in past sessions:  a dry run unless --apply").usage(
    "<epic> | --all [--apply]"
  )
  page(epic.command("convert"), "rewrite pages from the old markup into <epic-*> markup, into --out only").usage(
    "<epic>... | --all [--dry-run] [--out <folder>] [--verbose]"
  )
  page(epic.command("split"), "store a page as a skeleton plus part files;  --done:  every finished epic").usage(
    "<epic> [--dry-run] | --done [--dry-run]"
  )
  page(epic.command("join"), "a split page back into one file").usage("<epic>")
  page(epic.command("migrate"), "bring pages up to today's markup, every step of their kind;  safe to run again").usage(
    "[<kind>] [<epic>... | --all] [--file <page>] [--step <name>] [--dry-run] [--notify] [--list]"
  )

  ////////////////
  // ## Sagas
  ////////////////

  epic.commandsGroup("Sagas:")

  page(epic.command("saga"), "the sagas (epics of epics):  their list in order, and the saga each epic serves")
    .usage('list [--json] | set <epic> <saga> | set <epic> --none | new <id> "Title" --purpose "..." | page <id> | ...')
    .addHelpText("after", SAGA_HELP)

  ////////////////
  // ## Groups:  the docs tools
  ////////////////

  epic.commandsGroup("Pages Owen answers on, agents, airplane mode:")

  epic
    .command("ask")
    .description("details pages:  a question explained on a page in VS Code's side bar, Owen answering on it")
    .usage(
      "new <slug> [--epic <epic>] [--from <questions.json>] | show <page> [--wait] | wait | answer | draft | list | sweep"
    )
    .argument("[args...]")
    .allowUnknownOption()
    .action(() => runLean(detailsCommand, rawArgs("ask")))

  epic
    .command("choices")
    .description("choice pages:  a table of names Claude recommends, Owen's call on each")
    .usage("new <slug> --rows <rows.json> [--epic <epic>] | show <page> [--wait] | wait | answer | list [<epic>]")
    .argument("[args...]")
    .allowUnknownOption()
    .action(() => runLean(choicesCommand, rawArgs("choices")))

  epic
    .command("comments")
    .description(
      "comments Owen leaves on docs pages:  list them, wait for one, gather them into an epic, mark one, answer it"
    )
    .usage(
      "list [<epic>] [--all] [--json] | wait [<page>...] [--timeout 8h] | gather [<page>... | --all] [--epic <epic>] | " +
        "working <page> <id> on | off | answer <page> <id> --file <reply.html>"
    )
    .argument("[args...]")
    .allowUnknownOption()
    .action(() => runLean(commentsCommand, rawArgs("comments")))

  epic
    .command("notes")
    .description("page notes Owen leaves on docs pages:  list the new ones, answer one, mark it done")
    .usage("list [--all] [--json] | answer <page> <id> --file <reply.html> | done <page> <id>")
    .argument("[args...]")
    .allowUnknownOption()
    .action(() => runLean(notesCommand, rawArgs("notes")))

  epic
    .command("agents")
    .description("the running-agents list of this epic (else this checkout):  what each background agent is doing")
    .usage('[list] [--json] | add <name> "<task>" | set <name> --status ... | done <name> | wait | told <name>')
    .argument("[args...]")
    .allowUnknownOption()
    .action(() => runLean(agentsCommand, rawArgs("agents")))

  epic
    .command("airplane")
    .description("airplane mode:  the docs worked on with no Claude, everything kept for /airplane land")
    .usage("[status] [--json] | on | off | check [--fix] [--json] | inbox [--since <iso>] [--json]")
    .argument("[args...]")
    .allowUnknownOption()
    .action(() => runLean(airplaneCommand, rawArgs("airplane")))

  return epic
}

/**
 * Make `verb` a verb on an epic page:  run by the `epic` tool, after `planDocArgs()`;  returns it, for its usage
 * line and help.
 * - its arguments are taken raw (`rawArgs()`):  `--goal` / `--details` ... are the tool's, not commander's
 * - `epic.command("<name>")` stays at each call:  `commandsCommand` finds the verbs by that text
 */
function page(verb: Command, description: string): Command {
  const name = verb.name()
  return verb
    .description(description)
    .argument("[args...]")
    .allowUnknownOption()
    .action(() => runLean(runPlanDoc, [name, ...rawArgs(name)]))
}

/** Run `epic <verb> <args...>` through the `epic` tool:  each command `planDocArgs()` makes, stopping at a failure. */
async function runPlanDoc([verb, ...args]: string[]): Promise<number> {
  for (const argv of planDocArgs(verb!, args)) {
    const exitCode = await planDocCommand(argv)
    if (exitCode !== EXIT.OK) return exitCode
  }
  return EXIT.OK
}

/**
 * Everything on the command line after verb `verb`, as typed.
 * - Why:  commander would take a tool's own flags (`--all`, `--goal`) as ours
 */
function rawArgs(verb: string): string[] {
  const argv = process.argv
  return argv.slice(argv.indexOf(verb, 2) + 1)
}

/** After `epic --help`'s verbs:  how to name things, and the old spellings. */
const EPIC_HELP = `
Naming what a verb acts on:
  seo         the epic's page, epics/seo/seo.plan.html
  seo#J3      an item:  J3 (a comment, seo#cm3, too)
  seo#P3      a phase:  P3 (seo#3 too), or by its id, seo#p-epic-migrate;  phase, updated and add-request
              take its name too:  seo#epic-migrate, "seo#Epic Migrate"
  seo#J       a new item of that kind, for add:  epic add seo#J "Title"
  SAGA:/epics a saga's page, sagas/epics/epics.saga.html:  epic add SAGA:/epics#T "Title"

Examples:
  epic summary seo
  epic phase seo#3 done --done "<ul><li>...</li></ul>"
  epic update seo#P3 --goal "<p>...</p>" --estimate 2h
  epic status seo#J3 underway "Writing the answer"
  epic inbox seo wait

epic <verb> --help says more about each.
The old spellings still work:  spell dev plan-doc <verb> <epic> <id> ..., spell dev details (now epic ask),
spell dev choices / comments / notes / agents / airplane, and spell epic <verb>.`

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
The sagas' list, in Owen's order:  sagas/sagas.json.  An epic names its saga:  <epic-page saga="<id>">.
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
  epic inbox seo                  what Owen sent from the page:  requests, marks, comments
  epic inbox seo listen           this session waits on the inbox;  unlisten:  stopped
  epic inbox seo wait             block until there's work, print it, exit 0 (run it in the background)
  epic inbox seo apply [ids...]   apply the sent approve / pick / todo marks to the page;  --all:  sent or not
  epic inbox seo#J3 working on    the page's spinner on an item (or a comment, seo#cm3);  off:  stopped
  epic inbox seo#J3 done          an agent finished the item:  its mark and spinner go
  epic inbox seo#J3 clear         drop its marks (a revisit talked over)`
