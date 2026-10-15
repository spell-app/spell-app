import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs"
import { join } from "node:path"

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
   * Write `sagas`, in that order, as the whole list.
   * - atomic:  a whole file, renamed over the old one
   * - throws for a malformed or repeated id
   */
  save(sagas: readonly Saga[]): void {
    const seen = new Set<string>()
    for (const { id } of sagas) {
      if (!Sagas.isId(id)) throw new Error(`saga id "${id}":  lower case, one or two words, e.g. drawable-spell`)
      if (seen.has(id)) throw new Error(`saga id "${id}" twice`)
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

/** `sagas/sagas.json`:  a note for whoever opens it, then the sagas in order. */
type SagaFile = { "//"?: string; sagas: Saga[] }
