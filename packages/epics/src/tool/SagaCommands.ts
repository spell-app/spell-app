import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

import { PlanDocError } from "./planDoc.types"

import type { Flags, PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"
import { SAGAS, Sagas, type Saga } from "./Sagas"

/****************
 * ### `SagaCommands`
 * `epic saga <verb> ...`:  the sagas (epic `epic-workflow` P15) -- their list, in Owen's order (`sagas/sagas.json5`,
 * through `Sagas`), and which saga each epic serves (`<epic-page saga>`).
 * - `list [--json]`:  the sagas in order, each with its epics and how many guides name it;  then the epics with none
 * - `set <epic> <saga>` / `set <epic> --none`:  the epic page's `saga`, logged;  refuses a saga not in the list
 * - `new <id> "Title" --purpose "..." [--after <id>]`, `move <id> --before | --after <id>`, `title <id> "Title"`
 * - `rename <old> <new>`:  the id, and EVERYTHING naming it follows:  each epic page's `saga` (logged), each guide's
 *   saga meta, the saga's folder and its files (`<old>.saga.html` ...), and the `SAGA:/<old>` addresses and
 *   `saga="<old>"` attributes in the shared pages
 * - `epic new <epic> --saga <id>` sets it at birth (`PlanDocCommands`);  `summary --json` and `list --json` carry it
 * - every change rewrites the list pages (`PlanDocFiles.reindex()`):  the Sagas page, the Epics page's chips and
 *   labels, the Guides page's sections
 * - output through its owner's `print()` / `warn()`;  a refusal is a `PlanDocError` (a `SagaError`), printed as one
 ****************/
export class SagaCommands {
  /** the epic-page command line this belongs to:  its files and output.  STATIC */
  readonly owner: PlanDocCommands

  constructor(owner: PlanDocCommands) {
    this.owner = owner
  }

  /** The checkout's epic pages. */
  get files(): PlanDocFiles {
    return this.owner.files
  }

  /** The checkout's sagas:  `sagas/sagas.json5`. */
  get sagas(): Sagas {
    return new Sagas(this.files.root)
  }

  /** `saga <verb> ...`, `positional` after `saga`;  resolves to the exit code, `undefined` for 0. */
  async run([verb, ...rest]: string[], flags: Flags): Promise<number | void> {
    const done = await this.change(verb, rest, flags)
    if (verb !== "list") this.files.reindex()
    return done
  }

  /** Do `saga <verb>`;  resolves to the exit code, `undefined` for 0. */
  private async change(verb: string | undefined, rest: string[], flags: Flags): Promise<number | void> {
    switch (verb) {
      case "list":
        return this.list(Boolean(flags.json))
      case "set":
        return this.set(this.owner.need(rest[0], "an epic"), flags.none ? null : this.owner.need(rest[1], "a saga"))
      case "new":
        return this.add(rest, flags)
      case "move":
        this.sagas.move(this.owner.need(rest[0], "a saga"), {
          before: flagValue(flags.before, "--before"),
          after: flagValue(flags.after, "--after")
        })
        return this.print(`sagas:  ${this.sagas.ids().join(", ")}`)
      case "title": {
        const id = this.owner.need(rest[0], "a saga")
        this.sagas.retitle(id, this.owner.need(rest[1], "the new title"))
        return this.print(`${id}:  ${this.sagas.need(id).title}`)
      }
      case "rename":
        return this.rename(this.owner.need(rest[0], "the saga's id"), this.owner.need(rest[1], "its new id"))
      default:
        throw new PlanDocError(
          `saga ${verb ?? ""}?  list | set <epic> <saga> | new <id> "Title" --purpose "..." | ` +
            `move <id> --before|--after <id> | title <id> "Title" | rename <old> <new>  (epic saga --help)`
        )
    }
  }

  ////////////////
  // ## Verbs
  ////////////////

  /**
   * `list [--json]`:  each saga in order, its title, its epics (by name) and how many guides name it;  then the
   * epics that name no saga, and those naming one that isn't in the list.
   * - `--json`:  `SagaListing[]`, in order
   */
  private list(json: boolean): void {
    const listing = this.listing()
    if (json) return this.print(JSON.stringify(listing, null, 2))
    const lines: string[] = []
    for (const saga of listing) {
      const guides = saga.guides ? `, ${saga.guides} guide${saga.guides === 1 ? "" : "s"}` : ""
      lines.push(`${saga.id.padEnd(16)} ${saga.title}  (${plural(saga.epics.length, "epic")}${guides})`)
      if (saga.epics.length) lines.push(`${" ".repeat(17)}${saga.epics.join(", ")}`)
    }
    const known = new Set(listing.map((saga) => saga.id))
    const epics = this.epicSagas()
    const none = [...epics].filter(([, saga]) => !saga).map(([name]) => name)
    const unknown = [...epics].filter(([, saga]) => saga && !known.has(saga))
    if (none.length) lines.push(`no saga:  ${none.join(", ")}`)
    for (const [name, saga] of unknown) lines.push(`NOTE:  ${name} names saga "${saga}", which isn't in the list`)
    this.print(lines.join("\n"))
  }

  /** Each saga, in order, with its epics and guide count (`list`'s data). */
  listing(): SagaListing[] {
    const epics = [...this.epicSagas()]
    const guides = this.sagas.guides()
    return this.sagas.list().map((saga) => ({
      ...saga,
      page: Sagas.pageOf(saga.id),
      epics: epics.filter(([, id]) => id === saga.id).map(([name]) => name),
      guides: guides.filter((guide) => guide.saga === saga.id).length
    }))
  }

  /**
   * `set <epic> <saga>`:  epic `epic` serves saga `saga` (`null`:  none, `--none`), written into its page and logged.
   * - throws for a saga not in the list, or an epic with no page
   */
  private async set(epic: string, saga: string | null): Promise<void> {
    const title = saga === null ? undefined : this.sagas.need(saga, "saga set").title
    const file = this.files.findDoc(epic)
    const changed = await this.owner.edit(file, (plan) => plan.setSaga(saga))
    const what = saga === null ? "no saga" : `saga ${saga} (${title})`
    this.print(`${epic}:  ${what}${changed ? "" : ", already"}`)
  }

  /** `new <id> "Title" --purpose "..." [--after <id>]`:  a saga, added to the list. */
  private add([id, title]: string[], flags: Flags): void {
    const saga: Saga = {
      id: this.owner.need(id, "the saga's id (one or two words, e.g. drawable-spell)"),
      title: this.owner.need(title, 'its title ("Drawable Spell")'),
      purpose: this.owner.need(flagValue(flags.purpose, "--purpose"), '--purpose "what it\'s for"')
    }
    this.sagas.add(saga, { after: flagValue(flags.after, "--after") })
    this.print(
      `${saga.id}:  ${saga.title}, saga ${this.sagas.ids().indexOf(saga.id) + 1} of ${this.sagas.ids().length}`
    )
  }

  /**
   * `rename <old> <new>`:  saga `from`'s id becomes `to`, and everything naming it follows (`SagaCommands`' header);
   * prints what changed.
   * - the list first:  it refuses an `old` that isn't a saga, a `new` that's taken or malformed, before anything else
   */
  private async rename(from: string, to: string): Promise<void> {
    const { root } = this.files
    this.sagas.rename(from, to)
    const epics = [...this.epicSagas()].filter(([, saga]) => saga === from).map(([name]) => name)
    for (const epic of epics) await this.owner.edit(this.files.findDoc(epic), (plan) => plan.setSaga(to))
    const guides = this.sagas.guides().filter((guide) => guide.saga === from)
    for (const guide of guides) {
      const file = join(root, guide.path)
      writeFileSync(file, Sagas.withSaga(readFileSync(file, "utf8"), to))
    }
    const moved = this.moveFolder(from, to)
    const links = this.rewriteLinks(from, to)
    this.print(
      [
        `${from} -> ${to}`,
        `  epic pages:  ${epics.join(", ") || "none"}`,
        `  guides:  ${guides.map((guide) => guide.path).join(", ") || "none"}`,
        `  folder:  ${moved ? `${SAGAS}/${to}/` : "none yet"}`,
        `  links:  ${links.length ? links.map(([path, count]) => `${path} (${count})`).join(", ") : "none"}`
      ].join("\n")
    )
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Print `text` and a newline, through the owner. */
  private print(text: string): void {
    this.owner.print(text)
  }

  /**
   * Every epic and the saga its page names (`<epic-page saga>`), by name, in folder order;  `null` for none.
   * - from each page's SKELETON alone, by pattern:  quick, and a split page keeps `<epic-page>` there
   */
  private epicSagas(): Map<string, string | null> {
    const found = new Map<string, string | null>()
    const dir = this.files.epics
    if (!existsSync(dir)) return found
    for (const entry of readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
      if (!entry.isDirectory()) continue
      const file = PlanDocFiles.planDocIn(join(dir, entry.name), entry.name)
      if (!file) continue
      const page = EPIC_PAGE.exec(readFileSync(file, "utf8"))?.[0] ?? ""
      found.set(entry.name, SAGA_ATTRIBUTE.exec(page)?.[1] || null)
    }
    return found
  }

  /**
   * Saga `from`'s folder, `sagas/<from>/`, renamed `sagas/<to>/`, and each file in it named for the saga
   * (`<from>.saga.html`, `<from>.saga.inbox.json5` ...) renamed for `to`;  whether there was a folder.
   */
  private moveFolder(from: string, to: string): boolean {
    const old = join(this.files.root, SAGAS, from)
    if (!existsSync(old)) return false
    const folder = join(this.files.root, SAGAS, to)
    renameSync(old, folder)
    for (const name of readdirSync(folder))
      if (name.startsWith(`${from}.`)) renameSync(join(folder, name), join(folder, `${to}${name.slice(from.length)}`))
    return true
  }

  /**
   * Every `SAGA:/<from>` address and `saga="<from>"` attribute in the shared pages (`LINKED_FOLDERS`' `.html`),
   * rewritten for `to`;  returns each page changed, from the root, with how many.
   * - an address only as a whole id:  `SAGA:/epics` never matches `SAGA:/epics-old`
   */
  private rewriteLinks(from: string, to: string): [path: string, count: number][] {
    const id = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
    const pattern = new RegExp(`(SAGA:/)${id}(?![\\w-])|(\\ssaga=")${id}(")`, "g")
    const changed: [string, number][] = []
    const walk = (dir: string) => {
      if (!existsSync(dir)) return
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const path = join(dir, entry.name)
        if (entry.name.startsWith(".") || entry.name === "node_modules") continue
        if (entry.isDirectory()) walk(path)
        else if (entry.name.endsWith(".html")) {
          let count = 0
          const html = readFileSync(path, "utf8")
          const next = html.replace(pattern, (_whole, address?: string, before?: string, after?: string) => {
            count++
            return address ? `${address}${to}` : `${before}${to}${after}`
          })
          if (count) {
            writeFileSync(path, next)
            changed.push([relative(this.files.root, path), count])
          }
        }
      }
    }
    for (const folder of LINKED_FOLDERS) walk(join(this.files.root, folder))
    return changed
  }
}

/** One saga as `saga list --json` gives it:  the list's fields, its page, its epics, how many guides name it. */
export type SagaListing = Saga & {
  /** its page, from the checkout's root:  `sagas/<id>/<id>.saga.html` (it may not be made yet) */
  page: string
  /** the epics whose page names it, by name */
  epics: string[]
  /** how many guides name it (`<meta name="spell-saga">`) */
  guides: number
}

/** The shared folders whose pages may point at a saga (`rename`). */
const LINKED_FOLDERS = ["epics", "guides", SAGAS, "pages", "templates"]

/** An epic page's opening tag. */
const EPIC_PAGE = /<epic-page\b[^>]*>/

/** `saga="<id>"` in a tag:  `$1` the id. */
const SAGA_ATTRIBUTE = /\ssaga="([^"]*)"/

/** A flag's value;  `undefined` without the flag;  throws for the flag bare. */
function flagValue(value: string | true | undefined, flag: string): string | undefined {
  if (value === true) throw new PlanDocError(`${flag} needs a value`)
  return value
}

/** `count` and `noun`, plural unless 1. */
function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}
