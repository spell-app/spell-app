import { spawnSync } from "node:child_process"
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { dirname, join, relative, resolve, sep } from "node:path"

import { OPEN_KINDS, PlanDocError, REVIEW_SECTIONS, TITLE_PREFIX, type Phase, type PlanSummary } from "./planDoc.types"

import { EpicDocs, GROUPS, type EpicDecisions, type EpicDocList } from "./EpicDocs"
import { EpicParts } from "./EpicParts"
import { InboxCommands } from "./InboxCommands"
import { ItemPicker } from "./ItemPicker"
import { PlanDoc } from "./PlanDoc"
import { EPIC_STATUSES, PlanDocFiles, type EpicListing } from "./PlanDocFiles"
import { PlanItem } from "./PlanItem"
import { PlanMarkup } from "./PlanMarkup"
import { PART_EXT, PART_FILE, PARTS_DIR } from "./PlanParts"
import type { PlanReader } from "./PlanReader"
import { PlanTime } from "./PlanTime"
import { ReviewBackfill } from "./ReviewBackfill"
import { LISTEN_HEARTBEAT_MS, LISTEN_STALE_MS, ReviewInbox } from "./ReviewInbox"

/****************
 * ### `PlanDocCommands`
 * `spell dev plan-doc <command> <name> ...`:
 * edit the structured parts of a plan doc, `epics/<name>/<name>.plan.html`.
 * Used by the `/epic` skill and its agents.
 * - what's data:  `PLAN-DOC.md` beside this;  the elements:  `$/epics/definitions`
 * - Commands:  `new`, `add-phase`, `phase`, `estimate`, `add`, `calm`, `decide`, `close`, `cancel`, `reopen`, `commit`,
 *   `commits`, `log`, `bedtime`, `overnight`, `prompt`, `summary`, `docs`, `decisions`, `check`, `open`, `convert`,
 *   `split`, `join`, `inbox`, `details`, `status`, `original`
 *   (`spell dev plan-doc` with no command lists them:  `USAGE`).
 * - `docs`, `decisions`:  the docs an epic wrote besides its plan doc, and what its plan doc settled
 *   (`EpicDocs`), for `/docs-check`
 * - the `<epic-*>` markup only:  every command refuses a doc still in the old markup
 *   (one restored from an old backup) before it writes anything:  `convert` it first (`PlanDocFiles.read()`)
 * - `migrate` and `relayout` are gone:  the converter (`convert`, `$/epics/convert`) replaced them
 * - `inbox`:  the marks Owen left on the doc's page, waiting in `<name>.inbox.json` beside it (`ReviewInbox`):
 *   printed, waited on (`wait`, a background command that wakes the `/epic review` session), applied (`apply`),
 *   cleared (`InboxCommands`);  `details` writes an agent's details or reply into one item
 * - an item's text is never dropped:  a rewrite moves it into the item's folded Original Discussion;
 *   `original` puts text recovered from git there
 * - the docs, their files and git:  `PlanDocFiles`, for ONE checkout (the caller's:  `spell dev plan-doc` finds it)
 * - the doc itself:  `PlanDoc`, pure
 * - output goes straight to `process.stdout` / `stderr`, never `console.*`, which the `spell` CLI silences
 *   (`packages/cli/src/consoleGuard.ts`);  `run()` resolves to the exit code instead of exiting
 * - Node only:  NOT in the `$/epics` barrel, imported by path (`$/epics/tool/PlanDocCommands`).
 *   Runs `docs`' tools as children (the docs index, `check-spell.js`, `open.js`), never imports them:
 *   `epics` may not import `docs`.
 * - From `packages/docs/tools/plan-doc.js`'s command line (epic `epic-components`, P7), which now forwards here.
 ****************/
export class PlanDocCommands {
  /** the checkout's plan docs:  STATIC for the object's life */
  readonly files: PlanDocFiles

  /** the `inbox` commands, on this object's files and output */
  readonly inbox: InboxCommands

  constructor({ files = new PlanDocFiles() }: { files?: PlanDocFiles } = {}) {
    this.files = files
    this.inbox = new InboxCommands(this)
  }

  ////////////////
  // ## Running
  ////////////////

  /**
   * Run the command line `argv` (everything after `plan-doc`);  resolves to the exit code.
   * - a `PlanDocError` is a message, `plan-doc:  <message>` on stderr, exit 1;  anything else is a bug, and throws
   * - `2`:  usage (no command, or a bad one), or `inbox wait` timing out;  `1`:  `check` found problems
   */
  async run(argv: string[]): Promise<number> {
    try {
      return (await this.main(argv)) ?? 0
    } catch (error) {
      if (!(error instanceof PlanDocError)) throw error
      this.warn(`plan-doc:  ${error.message}`)
      return 1
    }
  }

  /** Run one command;  resolves to its exit code, `undefined` for 0. */
  private async main(argv: string[]): Promise<number | void> {
    const { positional, flags } = parseArgs(argv)
    const [command, name, ...rest] = positional
    if (command === "list") return this.printEpics(this.files.listEpics(), Boolean(flags.json))
    if (command === "backfill") return this.backfill(name, flags)
    if (command === "relayout" || command === "migrate") throw new PlanDocError(replaced(command))
    if (command === "convert") return this.convert(positional.slice(1), flags)
    if (command === "split" && flags.done) return this.splitDone(flags)
    if (!command || !name) return this.usage()
    if (command === "summaries") return this.printSummaries(positional.slice(1))
    // the shared doc, by THIS checkout's path (`findDoc()`);  `--here` meant that before every checkout shared one
    // copy:  accepted and ignored, so old callers keep working (T3 of `review-review`)
    if (flags.here) this.warn("plan-doc:  --here is no longer needed:  every checkout edits the one shared doc")
    const file = command === "new" ? this.files.docPath(name) : this.files.findDoc(name)
    switch (command) {
      case "new":
        return this.create(name, file, flags)
      case "add-phase": {
        const before = phaseNumberFlag(flags.before, "--before")
        const n = await this.edit(file, (plan) => {
          const added = plan.addPhase(need(rest[0], "a short name"), { ...flags, before })
          const moved = before === undefined ? "" : `;  ${movedDown(plan.phases, added)}`
          plan.log(`P${added} added:  ${rest[0]}${moved}`)
          return added
        })
        return this.print(`P${n}`)
      }
      case "phase":
        await this.edit(file, (plan) =>
          plan.setPhase(Number(need(rest[0], "a phase number")), need(rest[1], "a status"), {
            done: flags.done as string | undefined
          })
        )
        this.files.reindex()
        // a new stage:  bring the doc forward, unless told not to.
        // No reload, nor a second one:  the edit reaches the page by the live client
        // (it updates itself in place, `spell-doc-runtime.js` `wireLiveUpdate()`),
        // and showing the page the view already has only reveals it (`packages/vscode/src/DocView.ts`)
        return flags.noOpen ? undefined : this.openInVSCode(file)
      case "phase-body":
        return this.edit(file, (plan) => {
          const n = Number(need(rest[0], "a phase number"))
          const set = plan.setPhaseFields(n, flags)
          if (!set.length)
            throw new PlanDocError(`phase-body what?  --symptom / --changes / --goal / --files / --verify`)
          plan.log(`P${n} ${set.join(", ")} set`)
        })
      case "updated":
        return this.edit(file, (plan) =>
          plan.addPhaseUpdate(
            Number(need(rest[0], "a phase number")),
            flags.file ? readFileSync(flags.file as string, "utf8") : need(rest[1], "what changed (html)")
          )
        )
      case "estimate":
        return this.edit(file, (plan) => {
          const n = Number(need(rest[0], "a phase number"))
          plan.setEstimate(n, need(rest[1], "the estimate"))
          plan.log(`P${n} estimate:  ${rest[1]}`)
        })
      case "add": {
        const id = await this.edit(file, (plan) =>
          plan.addItem(need(rest[0], "a kind"), need(rest[1], "a title"), flags)
        )
        return this.print(id.toUpperCase())
      }
      case "calm": {
        if (!rest.length) need(undefined, "an item id")
        const lines = await this.edit(file, (plan) => rest.map((id) => calmItem(plan, id, !flags.loud)))
        return this.print(lines.join("\n"))
      }
      case "decide": {
        const question = need(rest[0], "a question id")
        const id = await this.edit(file, (plan) => {
          const decided = plan.decide(question, need(rest[1], "the answer"), flags)
          plan.log(`${decided.toUpperCase()} answered:  ${rest[1]}`)
          return decided
        })
        return this.print(id.toUpperCase())
      }
      case "commit":
        return this.commit(file, rest, flags)
      case "commits":
        if (!flags.backfill) throw new PlanDocError(`commits what?  --backfill\n${USAGE}`)
        return this.backfillCommits(file)
      case "close":
      case "reopen":
        return this.edit(file, (plan) => {
          const title = plan.setItem(need(rest[0], "an item id"), command === "close" ? "done" : "open")
          plan.log(`${rest[0].toUpperCase()} ${command === "close" ? "closed" : "reopened"}:  ${title}`)
        })
      case "cancel":
        return this.edit(file, (plan) => {
          const title = plan.setItem(need(rest[0], "an item id"), "canceled")
          plan.log(`${rest[0].toUpperCase()} canceled:  ${rest[1] ?? title}`)
        })
      case "review":
        return this.edit(file, (plan) => {
          const id = need(rest[0], "an item id")
          const title = plan.review(id)
          plan.log(`${id.toUpperCase()} reviewed:  ${rest[1] ?? title}`)
        })
      case "defer":
        return this.edit(file, (plan) => {
          const id = need(rest[0], "an item id")
          plan.log(`${id.toUpperCase()} deferred:  ${plan.defer(id)}`)
        })
      case "queue":
        return this.edit(file, (plan) => {
          const id = need(rest[0], "an item id")
          plan.queue(id, need(rest[1], "the work to do"))
          plan.log(`${id.toUpperCase()} to do:  ${rest[1]}`)
        })
      case "unqueue":
        return this.edit(file, (plan) => {
          const id = need(rest[0], "an item id")
          plan.log(`${id.toUpperCase()} off the to-do list:  ${plan.unqueue(id)}`)
        })
      case "items":
        return this.printItems(this.read(file), file, flags)
      case "log":
        return this.edit(file, (plan) => plan.log(need(rest[0], "the text")))
      case "bedtime":
        return this.edit(file, (plan) => bedtime(plan, rest))
      case "overnight":
        return this.edit(file, (plan) => overnight(plan, rest))
      case "prompt": {
        const prompt = flags.file ? readFileSync(flags.file as string, "utf8") : need(rest[0], "the prompt text")
        return this.edit(file, (plan) => plan.setPrompt(prompt))
      }
      case "split":
        return this.splitDoc(file, flags)
      case "join":
        return this.joinDoc(file)
      case "summary":
        return this.printSummary(this.read(file).summary(), Boolean(flags.json))
      case "docs":
        return this.printDocs(new EpicDocs({ files: this.files, name }).find(), Boolean(flags.json))
      case "decisions":
        return this.printDecisions(new EpicDocs({ files: this.files, name }).decisions(), Boolean(flags.json))
      case "check":
        return this.check(file, flags)
      case "open":
        return this.open(file)
      case "inbox":
        return this.inbox.run(name, file, rest, flags)
      case "details":
        return this.details(name, file, rest, flags)
      case "status":
        return this.status(file, rest, flags)
      case "original":
        return this.original(file, rest, flags)
      default:
        return this.usage()
    }
  }

  ////////////////
  // ## Output
  ////////////////

  /** Print `text` and a newline on stdout:  what `console.log()` printed, which the `spell` CLI silences. */
  print(text: string): void {
    process.stdout.write(`${text}\n`)
  }

  /** Print `text` and a newline on stderr. */
  warn(text: string): void {
    process.stderr.write(`${text}\n`)
  }

  /** `value`, or a usage error naming what's missing (`need()`):  for `InboxCommands`, which can't import it back. */
  need(value: string | undefined, what: string): string {
    return need(value, what)
  }

  /** Print usage on stderr;  exit code 2. */
  private usage(): number {
    this.warn(USAGE)
    return 2
  }

  ////////////////
  // ## Reading and editing
  ////////////////

  /** The plan doc at `file`, whole:  `PlanDocFiles.read()`;  refuses an old-markup doc. */
  read(file: string): PlanDoc {
    return this.files.read(file)
  }

  /** Change the doc at `file` under its lock, and write it:  `PlanDocFiles.edit()`. */
  edit<T>(file: string, change: (plan: PlanDoc) => T, options?: { split?: boolean }): Promise<T> {
    return this.files.edit(file, change, options)
  }

  ////////////////
  // ## Commands
  ////////////////

  /**
   * `new`:  copy the tool's template (`templates/plan.html`, `<epic-*>` markup) to `file`, fill in name, title,
   * dates, branch and worktree, then update the index.
   * - `<title>`:  `Epic: <title>` (`TITLE_PREFIX`);  `<epic-page title>` holds the title alone (it draws the h1)
   * - refuses to overwrite:  the skill asks the user whether to reuse an existing doc
   * - a future epic, now planned (`/epic <name>`):  promoted where it is, its prompt and answers kept
   */
  private async create(name: string, file: string, flags: Flags): Promise<void> {
    const { title = titleCase(name), prompt, promptFile, future = false } = flags as CreateFlags
    const { files } = this
    const found = PlanDocFiles.planDocIn(dirname(file), name)
    if (found && !future) {
      const branch = files.git("branch", "--show-current") || "(detached)"
      const worktree = files.git("rev-parse", "--show-toplevel") || files.root
      if (await this.edit(found, (plan) => plan.promote({ branch, worktree }))) {
        files.reindex()
        return this.print(`${relative(process.cwd(), found)}:  was a future epic, now planned here`)
      }
    }
    if (found) throw new PlanDocError(`${relative(files.root, found)} already exists`)
    const now = new Date()
    const today = PlanTime.isoDate(now)
    const fill: Record<string, string> = {
      name,
      title,
      date: today,
      at: PlanTime.isoMinutes(now),
      branch: files.git("branch", "--show-current") || "(detached)",
      worktree: files.git("rev-parse", "--show-toplevel") || files.root
    }
    // `atDepth()`:  the template's asset paths, pack and site header for the doc's own depth (`epics/<name>/`:  2)
    const html = atDepth(readFileSync(files.template, "utf8"), relative(files.root, file).split(sep).length - 1)
      .replace(/\{\{(\w+)\}\}/g, (whole, key: string) => (key in fill ? PlanMarkup.escapeAll(fill[key]) : whole))
      .replace(/\n\s*<!--\s*PLAN DOC TEMPLATE\.[\s\S]*?-->/, "")
    const plan = PlanDoc.parse(html, now)
    plan.document.querySelector("title")!.textContent = `${TITLE_PREFIX}${title}`
    plan.document.querySelector('meta[name="description"]')!.setAttribute("content", `Plan doc:  ${title}.`)
    // the prompt that started the plan, in the Overview's `prompt` slot;  none:  no quote
    plan.setPrompt(promptFile ? readFileSync(promptFile, "utf8") : (prompt ?? ""))
    if (future) plan.makeFuture()
    mkdirSync(dirname(file), { recursive: true })
    // split from the start (J... of `claude-design`):  a doc being planned is the one edited most, so it gains most
    await files.writeDoc(file, plan, true)
    files.reindex()
    this.print(relative(process.cwd(), file))
  }

  /**
   * `commit <name> <sha> --phase N | --item <id> "sentence"`:  list commit `sha` (resolved to its full sha in the
   * doc's checkout) under a phase or an item, replacing its entry there.
   */
  private async commit(file: string, [sha, sentence]: string[], { phase, item }: Flags): Promise<void> {
    need(sha, "a commit sha")
    need(sentence, "a sentence:  what the commit did")
    if ((phase === undefined) === (item === undefined)) throw new PlanDocError(`commit needs --phase N or --item <id>`)
    const checkout = this.files.checkoutOf(file)
    const full = PlanDocFiles.gitIn(checkout, "rev-parse", "--verify", "--quiet", `${sha}^{commit}`)
    if (!full) throw new PlanDocError(`no commit "${sha}" in ${checkout}`)
    const target = phase !== undefined ? { phase: Number(phase) } : { item: String(item) }
    const base = this.files.commitBase(file)
    const done = await this.edit(file, (plan) => plan.addCommit(target, full, sentence, { base }))
    const where = target.phase !== undefined ? `P${target.phase}` : target.item!.toUpperCase()
    this.print(`${where}:  ${full.slice(0, 7)} ${done}`)
  }

  /**
   * `commits <name> --backfill`:  the doc's phase and item commits into its phases' and items' commit lists
   * (`PlanDoc.backfillCommits()`);  prints what it added.
   * - the doc's history:  `PlanDocFiles.docLog()` (git's, or a shared doc's `sharedDocLog()`)
   */
  private async backfillCommits(file: string): Promise<void> {
    const log = this.files.docLog(file)
    const base = this.files.commitBase(file)
    const added = await this.edit(file, (plan) => plan.backfillCommits(log, { base }))
    for (const entry of added) {
      const where = entry.phase !== undefined ? `P${entry.phase}` : entry.item!.toUpperCase()
      this.print(`  ${where.padEnd(4)} ${entry.sha.slice(0, 7)}`)
    }
    this.print(`${added.length} commit${added.length === 1 ? "" : "s"} added (${log.length} in the doc's history)`)
  }

  /**
   * `details <name> <id> --file <html> [--append | --more]`:
   * an agent's details or reply into one item, under the doc's lock.
   * - refused while Owen called the request off on the page ("nevermind", epic `windows-and-review` P2):
   *   nothing lands
   */
  private async details(name: string, file: string, rest: string[], flags: Flags): Promise<void> {
    const id = need(rest[0], "an item id")
    const html = readFileSync(need(flags.file as string | undefined, "--file <html file>"), "utf8")
    if (ReviewInbox.read(ReviewInbox.pathFor(file)).isCanceled(id))
      throw new PlanDocError(
        `${id.toUpperCase()}:  Owen called this request off on the page ("nevermind"):  nothing written.  ` +
          `\`plan-doc inbox ${name} done ${id}\` and stop.`
      )
    if (flags.append && flags.more) throw new PlanDocError("--append or --more, not both")
    return this.edit(file, (plan) => {
      if (flags.more) plan.addMore(id, html)
      else plan.setDetails(id, html, { append: Boolean(flags.append) })
      plan.log(
        `${id.toUpperCase()} ${flags.more ? "more details added" : flags.append ? "reply added" : "details rewritten"}`
      )
    })
  }

  /**
   * `status <name> <id> underway "<reading>"` / `done ["<summary>"]` / `noted "<what>"`:
   * Claude's status card on an item or an Overview sub-section (P13), and the page's spinner on it.
   * - `underway`:  a new blue card (`PlanDoc.addStatus()`), stamped now;  the spinner on (`inbox working`), so
   *   one call does both
   * - `done`:  WORK was done (an answer written, code changed, a phase built):  its latest underway card turns
   *   green (`PlanDoc.finishStatus()`), the summary under its reading when given;  the spinner off.
   *   Refused on an item with no underway card
   * - `noted`:  Claude only RECORDED what Owen chose (Owen, 2026-10-10):  a calm Noted card, `what` saying what was
   *   recorded and what happens next (`PlanDoc.noteStatus()`:  an underway card turns noted, else one born noted);
   *   the spinner off.  `inbox apply` writes these itself for picks, todos and new items (Q19)
   *   - `done --filed "<what>"`, the older spelling, means `noted` too:  what was filed is a record
   * - reading, summary:  HTML, as `updated` takes (plain text works as it is)
   * - NOT logged:  the mark it answers already is (`inbox apply`, `details`)
   */
  private async status(file: string, [id, state, text]: string[], flags: Flags): Promise<void> {
    need(id, "an item id")
    const filed = flags.filed
    if (filed === true) throw new PlanDocError(`--filed needs what was filed ("Chose B · Keep one file per template")`)
    let title: string
    let said = state
    if (state === "underway")
      title = await this.edit(file, (plan) => plan.addStatus(id, need(text, "the reading (html)")))
    else if (state === "noted" || (state === "done" && filed !== undefined)) {
      const what = state === "noted" ? need(text, "what was recorded (html)") : String(filed)
      title = await this.edit(file, (plan) => plan.noteStatus(id, what))
      said = "noted"
    } else if (state === "done") title = await this.edit(file, (plan) => plan.finishStatus(id, text))
    else throw new PlanDocError(`status ${id} underway | done | noted, not '${state ?? ""}'\n${USAGE}`)
    this.inbox.setWorking(file, id, state === "underway")
    this.print(`${id.toUpperCase()} ${said}:  ${title}`)
  }

  /** `original <name> <id> --file <html> [--as-of "YYYY-MM-DD HH:MM"]`:  earlier text into an item's Original Discussion. */
  private async original(file: string, rest: string[], flags: Flags): Promise<void> {
    const id = need(rest[0], "an item id")
    const html = readFileSync(need(flags.file as string | undefined, "--file <html file>"), "utf8")
    const asOf = flags.asOf
    if (asOf !== undefined && !/^\d{4}-\d\d-\d\d(?: \d\d:\d\d)?$/.test(String(asOf)))
      throw new PlanDocError(`--as-of must be "YYYY-MM-DD HH:MM" (or "YYYY-MM-DD"), not "${asOf}"`)
    const result = await this.edit(file, (plan) => {
      const done = plan.restoreOriginal(id, html, { asOf: asOf as string | undefined })
      if (done === "added")
        plan.log(`${id.toUpperCase()} original discussion restored${asOf ? ` (as of ${asOf})` : ""}`)
      return done
    })
    this.print(`${id.toUpperCase()}:  ${result}`)
  }

  /**
   * `backfill`:  for epic `name` (or every epic, `--all`), the items not reviewed that Owen named in a past session
   * of it (`ReviewBackfill`);  prints each with its first evidence, and with `--apply` marks them reviewed, dated
   * that day, logging the evidence.
   */
  private async backfill(name: string | undefined, { all, apply }: Flags): Promise<void> {
    if (!name && !all) throw new PlanDocError(`backfill needs a name, or --all\n${USAGE}`)
    const { files } = this
    const epics = all ? files.listEpics() : [{ name: name!, file: files.findDoc(name!) }]
    const main = files.mainRoot()
    const sessionFinder = new ReviewBackfill()
    let total = 0
    for (const epic of epics) {
      const plan = this.read(epic.file)
      const ids = plan.reviewSections().flatMap((section) => section.items.map((item) => item.id))
      if (!ids.length) continue
      const sessions = sessionFinder.sessionsOf(epic.name, main)
      const evidence = ReviewBackfill.findEvidence(sessions, ids)
      const found = ids.filter((id) => evidence[id])
      this.print(
        `${epic.name}:  ${found.length} of ${ids.length} not reviewed have evidence  (${sessions.length} sessions)`
      )
      for (const id of found) {
        const [first] = evidence[id]
        const more = evidence[id].length > 1 ? `  (+${evidence[id].length - 1} more)` : ""
        this.print(`  ${id.padEnd(4)} ${first.date} ${first.kind.padEnd(7)} ${first.quote}${more}`)
      }
      total += found.length
      if (!apply || !found.length) continue
      await this.edit(epic.file, (doc) => {
        for (const id of found) {
          const [first] = evidence[id]
          doc.review(id, { date: first.date ?? doc.today })
          doc.log(
            `${id} reviewed:  backfill, ${first.kind} ${first.date} (session ${first.session.slice(0, 8)}):  ${first.quote}`
          )
        }
      })
    }
    this.print(apply ? `marked ${total} reviewed` : `dry run:  ${total} to mark;  --apply marks them`)
  }

  /**
   * `convert <name> ... | --all [--dry-run] [--out <folder>] [--verbose]`:  rewrite docs from the old markup into
   * `<epic-*>` markup, and prove nothing was lost (`$/epics/convert` `ConvertRun`);  prints its report;
   * exit code 1 when any doc fails.
   * - writes ONLY under `--out` (copies):  every live doc was converted at P12;
   *   a doc restored from an old backup is converted to `--out`, then copied back by hand
   * - loaded on first use:  the converter is big, and no other command needs it
   */
  private async convert(names: string[], { all, dryRun, out, verbose }: Flags): Promise<number | void> {
    if (!all && !names.length) throw new PlanDocError(`convert which docs?  <name> ... | --all\n${USAGE}`)
    const { ConvertRun } = await import("$/epics/convert/ConvertRun")
    const run = new ConvertRun({ root: this.files.root })
    const results = await run.run({
      names: all ? run.names : names,
      out: dryRun || typeof out !== "string" ? undefined : out
    })
    for (const line of ConvertRun.report(results, { verbose: Boolean(verbose), root: this.files.root }))
      this.print(line)
    const failed = results.filter(({ conversion }) => !conversion?.proof.clean || conversion.problems.length)
    this.print(`${results.length - failed.length} of ${results.length} docs converted cleanly`)
    if (failed.length) return 1
  }

  /**
   * `split <name> [--dry-run]`:  store the doc at `file` as a skeleton plus part files (`EpicParts`), logged;
   * prints how many parts.  Already split:  says so, writes nothing.
   * - `dryRun`:  what it would make, nothing written
   */
  private async splitDoc(file: string, { dryRun }: Flags = {}): Promise<void> {
    const { files } = this
    const name = relative(files.root, file)
    const plan = this.read(file)
    if (plan.parts!.split) return this.print(`${name}:  already split (${plan.parts!.hosts.length} parts)`)
    const count = new EpicParts(plan.document).hosts.length
    if (dryRun) return this.print(`${name}:  would split into a skeleton and up to ${count} parts`)
    await this.edit(
      file,
      (doc) => doc.log(`split into a skeleton and parts (${PARTS_DIR}/):  bodies load when opened`),
      { split: true }
    )
    this.print(
      `${name}:  split, ${this.read(file).parts!.hosts.length} parts in ${relative(files.root, join(dirname(file), PARTS_DIR))}/`
    )
  }

  /** `join <name>`:  a split doc back into ONE file (its parts folder removed), logged:  the way back from `split`. */
  private async joinDoc(file: string): Promise<void> {
    const name = relative(this.files.root, file)
    if (!this.read(file).parts!.split) return this.print(`${name}:  one file already`)
    await this.edit(file, (doc) => doc.log("joined into one file:  every body back in the page"), { split: false })
    this.print(`${name}:  one file`)
  }

  /**
   * `split --done [--dry-run]`:  split every FINISHED epic's doc (Q12 of `claude-design`):  every phase done, and no
   * worktree of its own (`list`'s `checkout` is `main`:  a worktree may still edit it with older code);
   * prints what it split and what it skipped, and why.
   */
  private async splitDone({ dryRun }: Flags): Promise<void> {
    for (const epic of this.files.listEpics()) {
      if (epic.status !== "done") continue
      if (epic.checkout !== "main") {
        this.print(`${epic.name}:  skipped, still has a worktree (${epic.checkout})`)
        continue
      }
      try {
        await this.splitDoc(epic.file, { dryRun })
      } catch (error) {
        if (!(error instanceof PlanDocError)) throw error
        this.print(`${epic.name}:  skipped, ${error.message}`)
      }
    }
  }

  /**
   * `check`:  structural problems, then the browser check;  exit code 1 on any.
   * - a split doc is checked WHOLE (`read()` assembles it):  ids and `#id` links across skeleton and parts
   * - links:  `AS.Linker.check()` on the whole doc, at the page's folder (a part's links are written relative to
   *   `parts/`, and rebased when assembled), so the parts' links are checked too;
   *   printed (`LINK:`), failing only with `--links`
   * - a split doc's parts:  a missing one is a problem;  a host with content of its own besides its part (moved
   *   into the part on the next edit), or a part file nothing loads, is a note
   * - the browser check:  `packages/docs/tools/check-spell.js`, a child `node` (its stderr passed on)
   */
  private check(file: string, { noBrowser, links: strictLinks }: Flags): number | void {
    const { files } = this
    const plan = this.read(file)
    const parts = plan.parts!
    const problems = plan.check()
    const links = files.linker.check(plan.toString(), dirname(file)).problems.map((problem) => `link:  ${problem}`)
    // printed, but failing only with `--links`:  older docs hold broken links from the docs' moves (I... of
    // `claude-design`), which `check` never looked at before
    if (strictLinks) problems.push(...links)
    else for (const link of links) this.print(`LINK:  ${link}`)
    problems.push(...parts.missing.map((id) => `part ${PARTS_DIR}/${id}${PART_EXT} is missing`))
    for (const id of parts.inline)
      this.print(`NOTE:  #${id} has content beside its part:  the next edit moves it into the part`)
    const dir = join(dirname(file), PARTS_DIR)
    const orphans = existsSync(dir)
      ? readdirSync(dir).filter((each) => {
          const id = PART_FILE.exec(each)?.[1]
          return id !== undefined && !parts.hosts.includes(id)
        })
      : []
    for (const orphan of orphans) this.print(`NOTE:  ${PARTS_DIR}/${orphan}:  nothing loads it`)
    for (const problem of problems) this.warn(`PROBLEM:  ${problem}`)
    if (!problems.length)
      this.print(`${relative(files.root, file)}:  structure ok${parts.split ? ` (${parts.hosts.length} parts)` : ""}`)
    let browserOk = true
    if (!noBrowser) {
      const run = spawnSync("node", [join(files.docsTools, "check-spell.js"), relative(files.docsPackage, file)], {
        cwd: files.docsPackage,
        encoding: "utf8"
      })
      browserOk = run.status === 0
      process.stderr.write(run.stderr ?? "")
      this.print(browserOk ? "check-spell:  ok" : "check-spell:  FAILED (problems above)")
    }
    if (problems.length || !browserOk) return 1
  }

  /** `open`:  show the doc in VS Code's Review tab (Owen's rule, 2026-10-07), reusing it (`openInVSCode()`). */
  private open(file: string): void {
    this.read(file)
    this.openInVSCode(file)
  }

  /**
   * Show `file` in VS Code's doc preview, in the right side bar's Review tab (a plan doc's place, Owen's rule
   * 2026-10-07), or Chrome when not run from VS Code:  `packages/docs/tools/open.js --review <file>`, a child `node` with this terminal attached, which starts the page
   * server and asks the session's window (`pages.js` `openInVSCode()`).
   * - a child, not an import:  `epics` may not import `docs`, nor the repo root's `scripts/window.mjs`
   * - NEVER throws, nor fails the command:  as before, a doc not shown is no error
   */
  openInVSCode(file: string): void {
    const { files } = this
    spawnSync(process.execPath, [join(files.docsTools, "open.js"), "--review", resolve(file)], {
      cwd: files.docsPackage,
      stdio: "inherit"
    })
  }

  ////////////////
  // ## Listing
  ////////////////

  /** `list`:  every epic, grouped in progress / future / done, its worktree when it has one (or JSON). */
  private printEpics(epics: EpicListing[], json: boolean): void {
    if (json) return this.print(JSON.stringify(epics, null, 2))
    const lines: string[] = []
    for (const status of EPIC_STATUSES) {
      const group = epics.filter((epic) => epic.status === status)
      if (!group.length) continue
      lines.push(`${status}:  (not reviewed / items)`)
      for (const epic of group) {
        const where = epic.checkout === "main" ? "" : `  (${epic.checkout})`
        lines.push(`  ${epic.name.padEnd(24)} ${String(epic.notReviewed).padStart(3)} / ${epic.total}${where}`)
      }
    }
    this.print(lines.join("\n"))
  }

  /** `summary`:  bullets for a reply (or JSON for a script). */
  private printSummary(summary: PlanSummary, json: boolean): void {
    if (json) return this.print(JSON.stringify(summary, null, 2))
    const lines = [`${summary.title}`]
    for (const phase of summary.phases) {
      const mark = PHASE_MARKS[phase.status as keyof typeof PHASE_MARKS] ?? "[?]"
      lines.push(`  ${mark} P${phase.n} · ${phase.name}${phase.estimate ? `  (${phase.estimate})` : ""}`)
    }
    if (summary.estimate) lines.push(`estimate:  ${summary.estimate}`)
    if (summary.next) lines.push(`next:  P${summary.next.n} · ${summary.next.name}`)
    for (const kind of OPEN_KINDS) {
      const open = summary.open[kind]
      if (!open.length) continue
      lines.push(`open ${kind}s:`)
      for (const item of open) lines.push(`  - ${item.id.toUpperCase()}  ${item.title}`)
    }
    this.print(lines.join("\n"))
  }

  /**
   * `docs`:  the docs an epic wrote besides its plan doc, by group, each with why it's listed;
   * its changelog entry last (or JSON for `/docs-check`).
   * - `swept` pages (`EpicDocs.groupOf()`):  counted, listed only by `--json`
   */
  private printDocs(list: EpicDocList, json: boolean): void {
    if (json) return this.print(JSON.stringify(list, null, 2))
    const { counts } = list
    const lines = [
      `${list.epic}:  ${list.docs.length - counts.swept} docs  ` +
        `(${counts.wrote} wrote, ${counts.related} related, ${counts.linked} linked;  ${counts.swept} swept:  --json)`
    ]
    for (const group of GROUPS) {
      const docs = list.docs.filter((doc) => doc.group === group)
      if (!docs.length || group === "swept") continue
      lines.push(`${group}:`)
      const width = Math.max(...docs.map((doc) => doc.path.length))
      for (const doc of docs) {
        const commits = doc.commits.length
          ? ` ${doc.commits.slice(0, 3).join(" ")}${doc.commits.length > 3 ? " ..." : ""}`
          : ""
        lines.push(`  ${doc.path.padEnd(width)}  ${doc.reasons.join(", ")}${commits}`)
      }
    }
    const { changelog } = list
    lines.push(`changelog:  ${changelog.path}#${changelog.anchor}${changelog.found ? "" : "  (no entry yet)"}`)
    this.print(lines.join("\n"))
  }

  /**
   * `decisions`:  what an epic's plan doc settled, for checking its docs against:  each phase and its Done list,
   * then the items, their status, chosen option and answer (or JSON, with every item's text, for `/docs-check`).
   */
  private printDecisions(decisions: EpicDecisions, json: boolean): void {
    if (json) return this.print(JSON.stringify(decisions, null, 2))
    const lines = [`${decisions.epic}:  ${decisions.planDoc}`]
    for (const phase of decisions.phases) {
      lines.push(`P${phase.n} · ${phase.name}  [${phase.status}]`)
      if (phase.done) lines.push(`    done:  ${phase.done}`)
      for (const update of phase.updates) lines.push(`    updated ${update.at}:  ${update.text}`)
    }
    for (const item of decisions.items) {
      lines.push(`${item.id.padEnd(4)} [${item.status}]  ${item.title}`)
      if (item.chosen) lines.push(`    chose:  ${item.chosen}`)
      if (item.answer) lines.push(`    answer:  ${item.answer}`)
    }
    this.print(lines.join("\n"))
  }

  /**
   * `items`:  where reviews stand, then each section with items (or `--section <kind or label>` only), its counts
   * and the items `--filter` picks;  `--json`:  `{ file, status, sections }`.
   * - `--spec <file>`:  the review's item picker instead (`ItemPicker.spec()`), written to that file
   */
  private printItems(plan: PlanReader, file: string, { section, filter = "unreviewed", json, spec }: Flags): void {
    let sections = plan.reviewSections({ filter: spec ? "open" : (filter as string) })
    if (section) {
      const wanted = String(section).toLowerCase().replace(/s$/, "")
      sections = sections.filter((s) => s.kind === wanted || s.label.toLowerCase().replace(/s$/, "") === wanted)
      if (!sections.length) {
        throw new PlanDocError(`no section "${section}":  ${REVIEW_SECTIONS.map((s) => s.label).join(", ")}`)
      }
    }
    const status = plan.reviewStatus()
    if (spec) {
      if (sections.length !== 1) throw new PlanDocError("--spec needs one --section")
      const picker = ItemPicker.spec(plan, file, sections[0], status, this.files.details)
      writeFileSync(spec as string, JSON.stringify(picker, null, 2))
      return this.print(spec as string)
    }
    if (json) return this.print(JSON.stringify({ file, status, sections }, null, 2))
    const lines = [
      status.last
        ? `last reviewed ${status.last}:  ${status.reviewedThen} item${status.reviewedThen === 1 ? "" : "s"};  ${status.deferred} deferred`
        : "never reviewed"
    ]
    if (status.queued.length) {
      lines.push("to do:")
      for (const item of status.queued) lines.push(`  - ${item.id}  ${item.work}  (${item.title})`)
    }
    for (const s of sections) {
      if (!s.total) continue
      lines.push(`${s.label} · ${s.notReviewed}/${s.total} not reviewed  (showing:  ${filter})`)
      for (const item of s.items) {
        const mark =
          item.state === "deferred" ? `  (deferred ${item.deferred})` : item.state === "queued" ? "  (to do)" : ""
        lines.push(`  - ${item.id}  ${item.title}${mark}`)
      }
    }
    this.print(lines.join("\n"))
  }

  /**
   * `summaries`:  `summary` of each doc at `files`, as one JSON object keyed by file.
   * - by PATH, so it reads a worktree's copy too, with no `node_modules/` there;  one run for every epic
   * - a doc that won't read gets `{ error }`, and the rest still print
   */
  private printSummaries(files: string[]): void {
    const found: Record<string, PlanSummary | { error: string }> = {}
    for (const file of files) {
      try {
        found[file] = this.read(resolve(file)).summary()
      } catch (error) {
        if (!(error instanceof PlanDocError)) throw error
        found[file] = { error: error.message }
      }
    }
    this.print(JSON.stringify(found, null, 2))
  }
}

/** Command-line flags (`parseArgs()`):  `--key value` is the value, a bare `--key` is `true`;  keys camel-cased. */
export type Flags = Record<string, string | true>

/** `new`'s flags. */
type CreateFlags = { title?: string; prompt?: string; promptFile?: string; future?: boolean }

/** Usage, printed with no command or a bad one. */
export const USAGE = `usage:  yarn plan-doc <command> <name> ...    (doc:  epics/<name>/<name>.plan.html)
  new <name> [--title "Title"] [--prompt "text" | --prompt-file path] [--future]
                                                   copy the template, fill it in, update the docs index;
                                                   --future:  an epic not planned yet (/epic future);  new on
                                                   a future epic's doc plans it:  promoted where it is
  add-phase <name> "Short Name" --symptom html --changes html [--goal html] [--files html] [--verify html]
            [--estimate 2h] [--before N]           a phase:  Symptom (one line), Changes (two or three), then
                                                   the details (goal, files, verify);  --before N:  inserted as
                                                   PN, the to-do phases from N on (and links to them) move down
  phase-body <name> <N> [--symptom html] [--changes html] [--goal html] [--files html] [--verify html]
                                                   set (or "" removes) a phase's body fields
  updated <name> <N> "html" | --file path          a change to phase N's plan, in its fenced Updated block
                                                   (kept;  listed atop the phases while N is to do)
  estimate <name> <N> "1-2h"                       set a phase's estimate;  the Overview's total follows
  phase <name> <N> todo|active|done [--done html] [--no-open]
                                                   set a phase's status;  done drops its UPDATE markers, and
                                                   --done writes its Done field (a <ul> of what was built);
                                                   brings the doc forward in VS Code (it updates itself)
  add <name> question|judgement|caveat|issue|todo|test|decision "title" [--details html] [--calm]
                                                   prints the new id (a decision:  a question born answered,
                                                   Q7);  --calm (last):  a judgement call or issue that
                                                   wouldn't surprise Owen, yellow (open) rather than red
  calm <name> <id>... [--loud]                     calls / issues not urgent (yellow, open), as the page's
                                                   id chip does;  --loud (last):  urgent (red) again
  decide <name> <Q id> "answer" [--details html] [--option A]
                                                   answer a question:  the answer goes INTO it (an ivory card);
                                                   --option marks the chosen option card;  prints its id
  close <name> <id>  /  reopen <name> <id>         close an item (done) / open it again
  cancel <name> <id> ["why"]                       an item made moot by another decision:  struck through;
                                                   reopen undoes it
  commit <name> <sha> --phase N | --item <id> "sentence"
                                                   list a commit under a phase or an item (replaces its entry)
  commits <name> --backfill                        list every phase / item commit in the doc's git history
                                                   (subjects "P3:  Name -- summary", "Fix I3:  ...")
  log <name> "text"                                timestamped line in the log
  bedtime <name> start "P3-P6"  /  done "summary"  a /bedtime run:  bedtime mode on (every change stays green
                                                   until reviewed) / off;  both logged
  overnight <name> remove                          an older doc's Overnight report section (before 2026-10-05):
                                                   gone, once read
  prompt <name> "text" | --file path               set the prompt that started the plan ("" removes it)
  summary <name> [--json]                          open questions, issues, caveats, todos;  the next phase
  docs <name> [--json]                             the docs the epic wrote besides its plan doc:  its durable
                                                   doc, what its commits changed (wrote), docs that name it
                                                   (related), docs it only links to (linked);  its
                                                   changelog entry;  the shared pages its turns swept up
                                                   (swept):  counted, --json lists them.  For /docs-check
  decisions <name> [--json]                        what the plan doc settled:  phases (Done, Updated notes),
                                                   items (status, chosen option, answer;  --json:  their
                                                   text).  For /docs-check
  review <name> <id> ["outcome"]                   mark an item reviewed today;  the outcome goes in the log
  defer <name> <id>                                put an item off:  still not reviewed, dated
  queue <name> <id> "work"  /  unqueue <name> <id> work a review decided on, waiting  /  started or dropped
  items <name> [--section issues] [--filter unreviewed|open|reviewed|queued|all] [--json]
                                                   what a review walks:  sections, counts, items, the queue
  items <name> --section issues --spec <file>      the review's item picker, a details page spec:
                                                   \`yarn details new <slug> --from <file>\`
  list [--json]                                    every epic:  status, where it runs, not reviewed / all
  backfill <name> | --all [--apply]                items Owen already went through, from past sessions;
                                                   a dry run unless --apply (review-backfill.js)
  summaries <file.html> ...                        \`summary --json\` of each doc, by path (worktrees' too):
                                                   JSON \`{ <file>: summary | { error } }\`;  for \`/epics\`
  check <name> [--no-browser] [--links]            ids, #id links, phases, parts (a split doc whole);  its
                                                   links (doc-links), failing only with --links;  then
                                                   check-spell.js
  open <name>                                      show in VS Code's doc preview (right side bar)
  convert <name> ... | --all [--dry-run] [--out <folder>] [--verbose]
                                                   rewrite docs from the old markup into <epic-*> markup and
                                                   prove nothing was lost;  writes ONLY under --out (copies)
  split <name> [--dry-run]  /  split --done        store a doc as a skeleton plus part files (parts/<id>.html,
                                                   loaded when opened);  --done:  every finished epic without
                                                   a worktree.  New docs start split;  every command reads and
                                                   writes either shape
  join <name>                                      a split doc back into one file
  inbox <name> [--json]                            the marks Owen left on the page (<name>.inbox.json), by
                                                   action, sent or not;  requests for now, agents at work,
                                                   the session listening
  inbox <name> listen [--session <id>]  /  unlisten
                                                   a session waits on the inbox (default:  this one,
                                                   $CLAUDE_CODE_SESSION_ID) / stopped:  the page says which
  inbox <name> wait [--timeout <s>] [--json]       block (default 3300s) until there's work, print it, exit 0:
                                                   requests for now (taken;  their items marked working) and a
                                                   send not yet handed over (its marks by action);  timeout:  exit 2;
                                                   stamps the session's heartbeat every ${LISTEN_HEARTBEAT_MS / 1000}s (silent ${LISTEN_STALE_MS / 1000}s:  gone)
  inbox <name> apply [ids...] [--all]              apply the sent approve / pick / todo marks, and the sent
                                                   urgency (an id chip clicked:  calm or not), to the doc, clear
                                                   them;  prints each, and what it left (revisits, a pick with a
                                                   revisit:  to talk over);  --all:  sent or not (/airplane land)
  inbox <name> working <id> on|off                 the page's spinner on an item
  inbox <name> done <id>...                        an agent finished an item:  its mark and spinner go (a mark
                                                   Owen changed meanwhile stays)
  inbox <name> clear <id>...                       drop marks (a revisit talked over)
  details <name> <id> --file <html> [--append | --more]
                                                   replace an item's details with the file's HTML, or (--append)
                                                   add it, e.g. a reply:  between the answer card and commits;
                                                   replacing moves the old text into its Original Discussion;
                                                   --more (Add Details):  the text stays on top as "Original
                                                   Reply", the file's HTML in a "More Details" card under it
  status <name> <id> underway "html"              Claude took Owen's mark on an item (or an Overview section):
                                                   a blue "Claude • Underway" card with Claude's reading of
                                                   the task (a sentence or two, no file names);  spinner on
  status <name> <id> done ["html"]                 WORK was done (an answer written, code changed):  that card
                                                   turns green "Claude • Done", the reading kept, the summary
                                                   under it when there's something worth saying;  spinner off.
                                                   Refused with no underway card
  status <name> <id> noted "html"                  Claude only RECORDED Owen's choice:  a calm "Claude • Noted"
                                                   card saying what was recorded and what happens next ("Chose
                                                   B · ...:  recorded;  waiting for the next phase, P9 · ...");
                                                   an underway card turns noted;  spinner off.  inbox apply
                                                   writes these for picks, todos and new items itself
                                                   (done --filed "html":  the older spelling, the same)
  original <name> <id> --file <html> [--as-of "YYYY-MM-DD HH:MM"]
                                                   put earlier text (from git) into an item's Original
                                                   Discussion:  as first written, or dated --as-of (when it was
                                                   replaced);  prints added / unchanged / empty
Every checkout shares ONE copy of each doc (the epics link):  any checkout edits the same file.
Every command reads <epic-*> markup only, and refuses a doc in the old markup (one restored from an old backup):
convert it first (convert <name> --out <folder>, then copy the converted doc back).
--here is no longer needed:  accepted and ignored.`

/** What `migrate` and `relayout` say now:  the converter replaced them. */
function replaced(command: string): string {
  return `${command} is gone:  the converter replaced it, \`spell dev plan-doc convert <name>\` (old markup -> <epic-*>)`
}

/** `summary`'s mark for a phase's status. */
const PHASE_MARKS = { todo: "[ ]", active: "[~]", done: "[x]" }

/**
 * `bedtime <name> start|done ...`:  a `/bedtime` run's mode (`PlanDoc.startBedtime()`), logged.
 * - throws a `PlanDocError` for any other action
 */
function bedtime(plan: PlanDoc, [action, ...args]: string[]): void {
  switch (action) {
    case "start": {
      const phases = need(args[0], "the phases, e.g. P3-P6")
      plan.startBedtime(phases)
      return plan.log(`Bedtime started:  ${phases}`)
    }
    case "done": {
      const summary = need(args[0], "a one-line summary")
      plan.finishBedtime()
      return plan.log(`Bedtime done:  ${summary}`)
    }
    default:
      throw new PlanDocError(`bedtime what?  start | done (not '${action ?? ""}')`)
  }
}

/**
 * `overnight <name> remove`:  clear an older doc's Overnight report section (`PlanDoc.removeOvernight()`).
 * - its other actions are gone with the section (D5 of `review-review`):  `bedtime` turns bedtime mode on and off
 */
function overnight(plan: PlanDoc, [action]: string[]): void {
  if (action !== "remove")
    throw new PlanDocError(
      `overnight's report is gone:  \`bedtime <name> start|done\` for a /bedtime run;  only \`overnight <name> remove\` is left, for an older doc's section (not '${action ?? ""}')`
    )
  if (plan.removeOvernight()) plan.log("Overnight report gone through:  section removed")
}

/** `--key value` flags and `--key` switches, plus everything else in order. */
export function parseArgs(argv: string[]): { positional: string[]; flags: Flags } {
  const positional: string[] = []
  const flags: Flags = {}
  for (let i = 0; i < argv.length; i++) {
    const match = argv[i].match(/^--([\w-]+)$/)
    if (!match) positional.push(argv[i])
    else if (i + 1 < argv.length && !argv[i + 1].startsWith("--")) flags[camel(match[1])] = argv[++i]
    else flags[camel(match[1])] = true
  }
  return { positional, flags }
}

/**
 * Item `id` not urgent (`calm`) or urgent again, as the page's id chip does (`PlanDoc.setCalm()`), logged;
 * returns the line to print:  `J11 not urgent:  <title>`, or `J11 not urgent already:  <title>` (not logged).
 */
function calmItem(plan: PlanDoc, id: string, calm: boolean): string {
  const did = plan.setCalm(id, calm)
  const state = did ?? `${calm ? "not urgent" : "urgent"} already`
  const line = `${id.toUpperCase()} ${state}:  ${PlanItem.titleOf(plan.item(id))}`
  if (did) plan.log(line)
  return line
}

/** `no-browser` -> `noBrowser`. */
function camel(flag: string): string {
  return flag.replace(/-(\w)/g, (_, letter: string) => letter.toUpperCase())
}

/** `value`, or a usage error naming what's missing. */
function need(value: string | undefined, what: string): string {
  if (value === undefined || value === "") throw new PlanDocError(`missing ${what}\n${USAGE}`)
  return value
}

/**
 * A flag's phase number (`--before 3` is 3);  `undefined` without the flag.
 * - throws a `PlanDocError` for the flag bare, or with a value that isn't a whole number
 */
function phaseNumberFlag(value: string | true | undefined, flag: string): number | undefined {
  if (value === undefined) return undefined
  const n = value === true ? Number.NaN : Number(value)
  if (!Number.isInteger(n))
    throw new PlanDocError(`${flag} needs a phase number${value === true ? "" : `, not "${value}"`}`)
  return n
}

/**
 * What an insert before phase `added` moved, for the log, by their old numbers and new:
 * `P6 · Doc Review moved down to P7`, or `P5-P6 moved down to P6-P7` for several (I6 of `skillz`).
 */
export function movedDown(phases: Phase[], added: number): string {
  const moved = phases.filter((phase) => phase.n > added)
  if (moved.length === 1) return `P${added} · ${moved[0]!.name} moved down to P${added + 1}`
  const last = moved.at(-1)!.n
  return `P${added}-P${last - 1} moved down to P${added + 1}-P${last}`
}

/** `kebab-name` -> `Kebab Name`. */
function titleCase(name: string): string {
  return name.replace(/(^|-)(\w)/g, (_, dash: string, letter: string) => `${dash ? " " : ""}${letter.toUpperCase()}`)
}

/**
 * A template's `html` fixed for a page `depth` folders below the checkout's root (`epics/a/a.plan.html` is 2).
 * - rewrites whatever depth the template assumed:  `_assets` paths (`<up>packages/docs/tools/_assets/`), the docs
 *   home's paths (`<up>pages/index.html`), the areas' list pages (`<up>epics/index.html` ...), the site
 *   header's `root` (`<up>`:  the path up to the root), and the epics pack (`<up>packages/epics/pack/`)
 * - drops the template's `TEMPLATE:` how-to comment
 * - a private copy of `packages/docs/tools/pages.js` `atDepth()` (plus the pack):  `epics` may not import `docs`
 */
function atDepth(html: string, depth: number): string {
  const up = "../".repeat(depth)
  return html
    .replace(/(source=")(?:\.\.\/)*packages\/epics\/pack\//g, `$1${up}packages/epics/pack/`)
    .replace(
      /((?:href|src)=")(?:\.\.\/)*(?:packages\/docs\/)?(?:tools\/)?_assets\//g,
      `$1${up}packages/docs/tools/_assets/`
    )
    .replace(/((?:href|src)=")(?:\.\.\/)*(?:pages\/)?index\.html/g, `$1${up}pages/index.html`)
    .replace(/((?:href|src)=")(?:\.\.\/)*(epics|guides|templates|brand)\/index\.html/g, `$1${up}$2/index.html`)
    .replace(/(<spell-site-header\b[^>]*?\broot=")[^"]*"/, `$1${up.replace(/\/$/, "") || "."}"`)
    .replace(/\n\s*<!--\s*TEMPLATE:[\s\S]*?-->/, "")
}
