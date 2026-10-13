import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { join, relative, resolve } from "node:path"

import { PlanDocError } from "./planDoc.types"

import { Migrations, PAGE_KINDS, type PageKind } from "./migrations"
import type { Flags, PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles, type MigrateResult } from "./PlanDocFiles"

/****************
 * ### `MigrateCommands`
 * `spell dev plan-doc migrate ...`:  bring pages up to today's markup, by page KIND (epic `epic-workflow`, P8;  J44):
 * every registered step, oldest first, on each page, under its lock, idempotent;  a report per page.
 * - `migrate`:  every kind, every page;  `migrate <kind> [--file <page>]`:  one kind, or one page of it
 * - `migrate <epic>... | --all`:  epic pages:  those, or every one the tool lists
 * - `--step <name>`:  just that step;  `--dry-run`:  the same report, nothing written;  `--list`:  the steps
 * - `--notify` (J39):  epics with a RUNNING session (titled for the epic) are skipped, and printed with the one-line
 *   message to send each:  the CLI can't send a `SendMessage`, so the session that ran it sends them;  idle epics
 *   are migrated there and then
 * - the epic page's steps:  `Migrations` (`PlanDocFiles.migrate()`);  the other kinds':  the docs tools'
 *   `packages/epics/tools/migrate.js`, run as a child `node` as its command line runs it, its output passed on
 * - it takes back the verb `migrate`, which only said "use `convert`" (J38):  `convert` stays the old-markup converter
 * - output through its owner's `print()` / `warn()`;  `run()` resolves to the exit code
 ****************/
export class MigrateCommands {
  /** the plan-doc command line this belongs to:  its files and output.  STATIC */
  readonly owner: PlanDocCommands

  /**
   * The RUNNING sessions working on an epic, by its name:  what `--notify` tells instead of migrating.  STATIC.
   * - given by the `spell` CLI (`spell epic send`'s `epicSessions()`);  none:  `--notify` refuses
   */
  readonly sessionsOf?: SessionFinder

  constructor(owner: PlanDocCommands, sessionsOf?: SessionFinder) {
    this.owner = owner
    this.sessionsOf = sessionsOf
  }

  /** The checkout's plan docs. */
  get files(): PlanDocFiles {
    return this.owner.files
  }

  /** `migrate` with `positional` (after the verb) and `flags`;  resolves to the exit code. */
  async run(positional: string[], flags: Flags): Promise<number> {
    const { kind, names } = MigrateCommands.parse(positional, flags)
    if (flags.list) return this.list(kind)
    const step = typeof flags.step === "string" ? flags.step : undefined
    if (flags.step === true) throw new PlanDocError("--step needs a step's name (migrate --list lists them)")
    const epicStep = step === undefined || Migrations.named(step) !== undefined
    const dryRun = Boolean(flags.dryRun)
    const file = typeof flags.file === "string" ? flags.file : undefined
    const epicFile = file !== undefined && PLAN_DOC.test(file)
    let code = 0
    if ((kind === undefined || kind === "epic") && epicStep && (file === undefined || epicFile)) {
      const docs = file
        ? [{ name: epicName(file), file: this.pagePath(file) }]
        : names.length
          ? names.map((name) => ({ name, file: this.files.findDoc(name) }))
          : this.files.listEpics()
      code = await this.migrateEpics(docs, { step, dryRun, notify: Boolean(flags.notify) })
    } else if (kind === "epic") throw new PlanDocError(`no epic page step "${step}" (migrate --list lists them)`)
    if (kind !== "epic" && !(epicFile && kind === undefined) && !(step && epicStep && kind === undefined))
      code = Math.max(code, this.migrateOthers(kind, { file, step, dryRun }))
    return code
  }

  /**
   * The kind and the epics `migrate`'s words name:  `migrate cheatsheet` a kind, `migrate seo docs` two epics,
   * `migrate epic seo` both;  `--all` or any epic named:  epic pages only.
   */
  static parse(positional: string[], flags: Flags): { kind?: PageKind; names: string[] } {
    const [first, ...rest] = positional
    const named = first !== undefined && (PAGE_KINDS as readonly string[]).includes(first)
    const kind = named ? (first as PageKind) : undefined
    const names = named ? rest : positional
    if (names.length && kind !== undefined && kind !== "epic")
      throw new PlanDocError(`migrate ${kind}:  name a page with --file, not "${names.join(" ")}"`)
    if (flags.notify && kind !== undefined && kind !== "epic")
      throw new PlanDocError("--notify is for epic pages:  only epics have sessions to tell")
    return { kind: kind ?? (names.length || flags.all || flags.notify ? "epic" : undefined), names }
  }

  ////////////////
  // ## Epic pages
  ////////////////

  /**
   * Migrate each of `docs` (`{ name, file }`), printing a report per page and a total;  resolves to the exit code
   * (1 when any page refused).
   * - `notify`:  an epic with a running session is only dry-run, and told to migrate itself when it would change
   */
  async migrateEpics(
    docs: { name: string; file: string }[],
    { step, dryRun, notify }: { step?: string; dryRun: boolean; notify: boolean }
  ): Promise<number> {
    if (notify && !this.sessionsOf)
      throw new PlanDocError(
        "--notify needs the running sessions, which only the `epic` command (or `spell dev plan-doc`) can see"
      )
    const only = step ? [step] : undefined
    const counts = new Map<string, number>()
    const tell: { epic: string; sessions: string[]; steps: string[] }[] = []
    let changed = 0
    let refused = 0
    const self = process.env.CLAUDE_CODE_SESSION_ID
    for (const { name, file } of docs) {
      const sessions = notify
        ? (await this.sessionsOf!(name)).filter((session) => session.sessionId !== self).map((each) => each.name)
        : []
      const running = sessions.length > 0
      let result: MigrateResult
      try {
        result = await this.files.migrate(file, { only, dryRun: dryRun || running })
      } catch (error) {
        if (!(error instanceof PlanDocError)) throw error
        this.owner.print(`${name}:  REFUSED:  ${error.message}`)
        refused++
        continue
      }
      const steps = [...result.ran, ...(result.moves.length && !result.ran.includes(LINKS) ? [LINKS] : [])]
      for (const each of steps) counts.set(each, (counts.get(each) ?? 0) + 1)
      if (steps.length) changed++
      if (running && steps.length) tell.push({ epic: name, sessions, steps })
      this.owner.print(MigrateCommands.pageLine(name, steps, { dryRun, running }))
      for (const note of result.notes) this.owner.print(`  ${note}`)
    }
    const byStep = [...counts].map(([each, n]) => `${each} ${n}`).join(", ")
    const verb = dryRun ? "would change" : "changed"
    this.owner.print(`epic pages:  ${changed} of ${docs.length} ${verb}${byStep ? ` (${byStep})` : ""}`)
    if (tell.length) this.printTell(tell)
    return refused ? 1 : 0
  }

  /** One page's report line:  `seo:  up to date`, `seo:  updates-as-epic-update, links-agree` ... */
  static pageLine(name: string, steps: string[], { dryRun, running }: { dryRun: boolean; running: boolean }): string {
    if (!steps.length) return `${name}:  up to date`
    if (running) return `${name}:  its session is running:  told to run ${steps.join(", ")} itself`
    return `${name}:  ${dryRun ? "would run " : ""}${steps.join(", ")}`
  }

  /**
   * The sessions `--notify` couldn't migrate under, each with its one-line message:  for the session that ran it to
   * send (`SendMessage`), since a command can't.
   */
  private printTell(tell: { epic: string; sessions: string[]; steps: string[] }[]): void {
    this.owner.print("TELL:  send each running session its line (SendMessage:  this command can't send them itself)")
    for (const { epic, sessions, steps } of tell) {
      for (const session of sessions) this.owner.print(`  to ${session}:  ${MigrateCommands.message(epic, steps)}`)
    }
  }

  /** The one line a running epic's session is sent (J39):  what to run, when, and that it may commit it. */
  static message(epic: string, steps: string[]): string {
    const what = steps.length === 1 ? `step ${steps[0]}` : `steps ${steps.join(", ")}`
    return (
      `New epic page migration ${what} for your epic page:  run \`epic migrate ${epic}\` at your ` +
      `leisure (now if you're idle or between phases, else at the end of the phase you're in);  you may commit ` +
      `what it changes without asking (\`${epic} migrate ${steps[0]}:  ...\`).`
    )
  }

  ////////////////
  // ## Other kinds
  ////////////////

  /**
   * Run the docs tools' steps (`tools/migrate.js`):  `kind` (every kind but `epic` when none),
   * one page (`file`), one step;  its output printed as it comes back.  Returns its exit code.
   */
  private migrateOthers(
    kind: PageKind | undefined,
    { file, step, dryRun }: { file?: string; step?: string; dryRun: boolean }
  ): number {
    const args = [
      ...(kind ? [kind] : []),
      ...(file ? ["--file", this.pageArgument(file)] : []),
      ...(step ? ["--step", step] : []),
      ...(dryRun ? ["--dry-run"] : [])
    ]
    return this.runDocsTool(args)
  }

  /** `migrate --list`:  every step, oldest first, by kind:  the epic page's, then the docs tool's. */
  private list(kind: PageKind | undefined): number {
    if (kind === undefined || kind === "epic")
      for (const step of Migrations.all)
        this.owner.print(`epic        ${step.date}  ${step.name.padEnd(24)} ${step.description}`)
    if (kind === "epic") return 0
    return this.runDocsTool(["--list", ...(kind ? [kind] : [])])
  }

  /** Run the docs tool with `args`, in `packages/epics`;  its stdout printed, its stderr warned;  its exit code. */
  private runDocsTool(args: string[]): number {
    const { files } = this
    const run = spawnSync(process.execPath, [join(files.docsTools, "migrate.js"), "--root", files.root, ...args], {
      cwd: files.docsPackage,
      encoding: "utf8"
    })
    for (const line of (run.stdout ?? "").split("\n").filter(Boolean)) this.owner.print(line)
    for (const line of (run.stderr ?? "").split("\n").filter(Boolean)) this.owner.warn(line)
    return run.status ?? 1
  }

  /** A page argument as the docs tool takes it:  absolute when it names a file from here, else as given. */
  private pageArgument(page: string): string {
    const here = resolve(page)
    return existsSync(here) ? here : page
  }

  /** An epic page given as `--file`:  from here, else from the checkout's root. */
  private pagePath(page: string): string {
    const here = resolve(page)
    if (existsSync(here)) return here
    const there = resolve(this.files.root, page)
    if (existsSync(there)) return there
    throw new PlanDocError(`no epic page ${relative(this.files.root, there)}`)
  }
}

/** The running sessions of epic `name`:  each one's `name` (the address `SendMessage` takes) and session id. */
export type SessionFinder = (epic: string) => Promise<{ name: string; sessionId: string }[]>

/** The step whose inbox-only fixes count as a change:  comments moved. */
const LINKS = "links-agree"

/** An epic page's path:  `epics/<name>/<name>.plan.html` (or an older `<name>.html`);  `[1]` its name. */
const PLAN_DOC = /(?:^|[\\/])epics[\\/]([^\\/]+)[\\/]\1(?:\.plan)?\.html$/

/** The epic an epic page's path is of. */
function epicName(file: string): string {
  return PLAN_DOC.exec(file)?.[1] ?? file
}
