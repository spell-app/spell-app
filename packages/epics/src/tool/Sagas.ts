import { existsSync, readdirSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join, relative } from "node:path"

// By file name, `.ts` and all:  plain `node` loads this file by path (the docs index, `packages/epics/tools/index.js`)
import { PlanDocError } from "./planDoc.types.ts"

/** The sagas' shared folder, from the checkout's root:  `sagas/sagas.json` and each saga's own folder. */
export const SAGAS = "sagas"

/** A saga id:  lower case, hyphenated, one or two words (`drawable-spell`, `epics`). */
const SAGA_ID = /^[a-z][a-z0-9]*(-[a-z0-9]+)?$/

/****************
 * ### `Sagas`
 * The SAGAS:  each an epic of epics, the larger aim its epics serve (epic `epic-workflow` P15;  Owen, 2026-10-13:
 * "saga means roughly epic of epics").
 * - Kept in ONE shared file, `sagas/sagas.json`, in Owen's order:  the Sagas page, the Epics page's saga chips and
 *   the Guides page's sections all list them so.
 * - Each saga:  an `id` Owen can say ("saga drawable-spell"), stable until `rename()`;  a `title`;  a line on what
 *   it's for.
 * - Its page:  `sagas/<id>/<id>.saga.html` (`pageOf()`).
 * - Which epics serve it:  each epic page's `<epic-page saga="<id>">`;  which guides:  each guide's
 *   `<meta name="spell-saga" content="<id>">`.  Neither is kept here.
 * - Node only (`node:fs`):  NOT in the `$/epics` barrel, imported by path.
 * - Its position:  imports only node's own modules and `./planDoc.types.ts` (by file name), so plain `node` loads it
 *   by path, as the docs index does;  NEVER another import, an `enum` or a parameter property.
 ****************/
export class Sagas {
  /** the checkout's root:  its `sagas/` */
  readonly root: string

  constructor(root: string) {
    this.root = root
  }

  /** The list's file:  `<root>/sagas/sagas.json`. */
  get file(): string {
    return join(this.root, SAGAS, "sagas.json")
  }

  /** Every saga, in Owen's order;  `[]` with no list yet. */
  list(): Saga[] {
    if (!existsSync(this.file)) return []
    return (JSON.parse(readFileSync(this.file, "utf8")) as SagaFile).sagas
  }

  /** The saga with id `id`, else `undefined`. */
  find(id: string): Saga | undefined {
    return this.list().find((saga) => saga.id === id)
  }

  /** Saga `id`'s page, from the checkout's root:  `sagas/<id>/<id>.saga.html`. */
  static pageOf(id: string): string {
    return `${SAGAS}/${id}/${id}.saga.html`
  }

  /** Whether `id` is shaped as a saga id:  lower case, hyphenated, one or two words. */
  static isId(id: string): boolean {
    return SAGA_ID.test(id)
  }

  /**
   * The saga with id `id`;  throws when there's none, naming the ones there are.
   * - `verb`:  the command asking, for the message (`saga set`)
   */
  need(id: string, verb = "saga"): Saga {
    const saga = this.find(id)
    if (!saga) throw new SagaError(`${verb}:  no saga "${id}";  the sagas:  ${this.ids().join(", ") || "none yet"}`)
    return saga
  }

  /** Every saga's id, in order. */
  ids(): string[] {
    return this.list().map((saga) => saga.id)
  }

  ////////////////
  // ## Changing the list
  ////////////////

  /**
   * Add `saga` to the list:  last, or right after saga `after`;  saved.
   * - throws for an id that's taken or malformed, or an `after` that isn't a saga
   */
  add(saga: Saga, { after }: { after?: string } = {}): void {
    const sagas = this.list()
    if (sagas.some((each) => each.id === saga.id)) throw new SagaError(`saga new:  "${saga.id}" is a saga already`)
    const at = after === undefined ? sagas.length : this.indexOf(sagas, after, "saga new") + 1
    sagas.splice(at, 0, saga)
    this.save(sagas)
  }

  /**
   * Move saga `id` right before saga `before`, or right after saga `after`;  saved.
   * - throws for a saga that isn't there, neither or both places, or a saga moved next to itself
   */
  move(id: string, { before, after }: { before?: string; after?: string }): void {
    if ((before === undefined) === (after === undefined))
      throw new SagaError("saga move:  --before <saga> or --after <saga>, one of them")
    const next = before ?? after!
    if (next === id) throw new SagaError(`saga move:  ${id} next to itself?`)
    const sagas = this.list()
    const [saga] = sagas.splice(this.indexOf(sagas, id, "saga move"), 1)
    const at = this.indexOf(sagas, next, "saga move") + (after === undefined ? 0 : 1)
    sagas.splice(at, 0, saga!)
    this.save(sagas)
  }

  /**
   * Saga `id`'s title becomes `title`;  saved.
   * - throws for a saga that isn't there, or an empty title
   */
  retitle(id: string, title: string): void {
    this.need(id, "saga title")
    if (!title.trim()) throw new SagaError("saga title:  what title?")
    this.save(this.list().map((saga) => (saga.id === id ? { ...saga, title: title.trim() } : saga)))
  }

  /**
   * Saga `from`'s id becomes `to`, in the list only, its place kept;  saved.
   * - what names the saga elsewhere (epic pages, guides, its folder) is the caller's:  `SagaCommands` `rename`
   * - throws for a saga that isn't there, or a new id that's taken or malformed
   */
  rename(from: string, to: string): void {
    this.need(from, "saga rename")
    if (this.find(to)) throw new SagaError(`saga rename:  "${to}" is a saga already`)
    this.save(this.list().map((saga) => (saga.id === from ? { ...saga, id: to } : saga)))
  }

  ////////////////
  // ## Guides
  ////////////////

  /**
   * Every guide (`guides/**.html`, from the checkout's root) and the saga its meta names (`sagaOf()`), by path.
   * - skips the folders that hold no pages:  `experiments/`, `examples/`, `details/`, `parts/`, `node_modules/`
   *   (the docs tools' `SKIP_DIRS`), and the Guides list page itself
   */
  guides(): GuideSaga[] {
    const found: GuideSaga[] = []
    const walk = (dir: string) => {
      if (!existsSync(dir)) return
      for (const entry of readdirSync(dir, { withFileTypes: true })) {
        if (entry.name.startsWith(".")) continue
        const path = join(dir, entry.name)
        if (entry.isDirectory()) {
          if (!NO_PAGES.has(entry.name)) walk(path)
        } else if (entry.name.endsWith(".html")) {
          const from = relative(this.root, path)
          if (from !== GUIDES_LIST) found.push({ path: from, saga: Sagas.sagaOf(readFileSync(path, "utf8")) })
        }
      }
    }
    walk(join(this.root, GUIDES))
    return found.sort((a, b) => a.path.localeCompare(b.path))
  }

  /** The saga page `html` names in its head:  `<meta name="spell-saga" content="<id>">`;  `null` for none. */
  static sagaOf(html: string): string | null {
    return SAGA_META.exec(html)?.[2]?.trim() || null
  }

  /**
   * Page `html` naming saga `saga` in its head, or none (`null`);  every other byte kept.
   * - a page naming one already:  its `content` changed, or its line removed
   * - else ONE line spliced in right after the description meta (else the `<title>`), indented as it is
   * - throws for a page with neither to put it after
   */
  static withSaga(html: string, saga: string | null): string {
    const meta = SAGA_META.exec(html)
    if (meta) {
      if (saga === null) return html.replace(SAGA_META_LINE, "")
      return html.replace(SAGA_META, `$1${saga}$3`)
    }
    if (saga === null) return html
    const after = DESCRIPTION_LINE.exec(html) ?? TITLE_LINE.exec(html)
    if (!after) throw new SagaError("a page with no description meta or <title> to put its saga after")
    const at = after.index + after[0].length
    return `${html.slice(0, at)}\n${after[1]}<meta name="spell-saga" content="${saga}" />${html.slice(at)}`
  }

  /** Where saga `id` is in `sagas`;  throws when it's not there. */
  private indexOf(sagas: readonly Saga[], id: string, verb: string): number {
    const at = sagas.findIndex((saga) => saga.id === id)
    if (at < 0) throw new SagaError(`${verb}:  no saga "${id}";  the sagas:  ${this.ids().join(", ") || "none yet"}`)
    return at
  }

  /**
   * Write `sagas`, in that order, as the whole list.
   * - atomic:  a whole file, renamed over the old one
   * - throws for a malformed or repeated id
   */
  save(sagas: readonly Saga[]): void {
    const seen = new Set<string>()
    for (const { id } of sagas) {
      if (!Sagas.isId(id)) throw new SagaError(`saga id "${id}":  lower case, one or two words, e.g. drawable-spell`)
      if (seen.has(id)) throw new SagaError(`saga id "${id}" twice`)
      seen.add(id)
    }
    const old = existsSync(this.file) ? (JSON.parse(readFileSync(this.file, "utf8")) as SagaFile) : undefined
    const next: SagaFile = { ...(old?.["//"] ? { "//": old["//"] } : {}), sagas: [...sagas] }
    const temp = `${this.file}.${process.pid}.tmp`
    writeFileSync(temp, `${JSON.stringify(next, null, 2)}\n`)
    renameSync(temp, this.file)
  }
}

/** One saga, as `sagas/sagas.json` holds it. */
export type Saga = {
  /** what Owen says:  `drawable-spell`;  stable until renamed */
  id: string
  /** "Drawable Spell" */
  title: string
  /** one line:  what it's for */
  purpose: string
}

/** One guide, and the saga it names (`Sagas.guides()`). */
export type GuideSaga = {
  /** from the checkout's root:  `guides/solid/solid-2.html` */
  path: string
  /** the saga its meta names;  `null` for none (the Guides page's Misc) */
  saga: string | null
}

/** The guides' shared folder, from the checkout's root. */
const GUIDES = "guides"

/** The Guides list page (`spell dev docs index` writes it):  not a guide. */
const GUIDES_LIST = "guides/index.html"

/** Folders that hold no pages (the docs tools' `SKIP_DIRS`). */
const NO_PAGES = new Set(["node_modules", "experiments", "examples", "details", "parts"])

/** A page's saga meta, either attribute order:  `$2` the id;  `$1` / `$3` around it. */
const SAGA_META = /(<meta\s+name="spell-saga"\s+content=")([^"]*)("[^>]*>)/

/** The saga meta's whole line, its line break with it. */
const SAGA_META_LINE = /\n[ \t]*<meta\s+name="spell-saga"[^>]*>/

/** The description meta's line:  `$1` its indent. */
const DESCRIPTION_LINE = /^([ \t]*)<meta\s+name="description"[^>]*>/m

/** The `<title>` line:  `$1` its indent. */
const TITLE_LINE = /^([ \t]*)<title>[^<]*<\/title>/m

/** `sagas/sagas.json`:  a note for whoever opens it, then the sagas in order. */
type SagaFile = { "//"?: string; sagas: Saga[] }

/**
 * A change to the sagas refused:  a saga that isn't there, an id taken or malformed.
 * - a `PlanDocError`:  the `epic` tool prints it as a message (`epic:  ...`, exit 1), never as a bug
 */
export class SagaError extends PlanDocError {}
SagaError.prototype.name = "SagaError"
