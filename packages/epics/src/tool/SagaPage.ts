import { existsSync, mkdirSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { SAGA_PREFIX } from "$/epics/review/review.types"

import { PlanDocError } from "./planDoc.types"

import { PlanDoc } from "./PlanDoc"
import type { PlanDocFiles } from "./PlanDocFiles"
import { PlanMarkup } from "./PlanMarkup"
import { PlanTime } from "./PlanTime"
import { Sagas } from "./Sagas"

/****************
 * ### `SagaPage`
 * A SAGA PAGE (epic `epic-workflow` P15):  one saga's page, `sagas/<id>/<id>.saga.html`, beside its inbox.
 * - An epic page of kind "saga" (`<epic-page kind="saga" saga="<id>">`), so every `epic` verb that edits an epic
 *   page edits it too, named by its short address:  `epic add SAGA:/drawable-spell#T "..."`, `epic inbox
 *   SAGA:/drawable-spell wait` (`PlanDocFiles.findDoc()`)
 * - Made from the tool's template, `templates/saga.html` (`make()`):  its title and purpose from `sagas/sagas.json5`
 *   (`Sagas`), its Overview's "Done so far" and "Ideas not done yet" to fill, its Epics drawn from the page server
 *   (`<epic-cards>`), then Questions, Todos and Log
 * - ONE file, not split:  a saga page is small, and its Overview then reads from disk too
 * - Node only (`node:fs`):  NOT in the `$/epics` barrel, imported by path.
 ****************/
export class SagaPage {
  /** the checkout's epic pages:  its root, linker and writer */
  readonly files: PlanDocFiles

  constructor(files: PlanDocFiles) {
    this.files = files
  }

  /** Saga `id`'s page in this checkout:  `<root>/sagas/<id>/<id>.saga.html`. */
  fileOf(id: string): string {
    return join(this.files.root, Sagas.pageOf(id))
  }

  /**
   * Write saga `id`'s page from the template;  returns its file.
   * - its `<title>` the saga's title, its summary the saga's purpose (`code` spans in backticks)
   * - throws for a saga that isn't in `sagas/sagas.json5`, or a page already there without `force`
   * - SIDE EFFECT:  writes the page (and its folder), formatted and linked as the tool writes every page
   */
  async make(id: string, { force = false, now = new Date() }: { force?: boolean; now?: Date } = {}): Promise<string> {
    const saga = new Sagas(this.files.root).find(id)
    if (!saga) throw new PlanDocError(`saga page:  no saga "${id}" in sagas/sagas.json5 (epic saga list)`)
    const file = this.fileOf(id)
    if (existsSync(file) && !force) throw new PlanDocError(`${Sagas.pageOf(id)} already exists:  --force to remake it`)
    const fill: Record<string, string> = {
      id,
      title: PlanMarkup.escapeAll(saga.title),
      purpose: SagaPage.prose(saga.purpose),
      date: PlanTime.isoDate(now),
      at: PlanTime.isoMinutes(now)
    }
    const html = readFileSync(TEMPLATE, "utf8")
      .replace(/\{\{(\w+)\}\}/g, (whole, key: string) => fill[key] ?? whole)
      .replace(/\n\s*<!--\s*SAGA PAGE TEMPLATE\.[\s\S]*?-->/, "")
    const page = PlanDoc.parse(html, now)
    page.document.querySelector("title")!.textContent = saga.title
    page.document.querySelector('meta[name="description"]')!.setAttribute("content", `Saga page:  ${saga.title}.`)
    mkdirSync(dirname(file), { recursive: true })
    await this.files.writeDoc(file, page, false)
    return file
  }

  /** How `/epic review` and the `epic` tool name saga `id`'s page:  `SAGA:/drawable-spell`. */
  static addressOf(id: string): string {
    return `${SAGA_PREFIX}${id}`
  }

  /** The saga id a short address names (`SAGA:/drawable-spell`, the prefix in any case);  `undefined` for any other name. */
  static idOf(name: string): string | undefined {
    if (name.slice(0, SAGA_PREFIX.length).toUpperCase() !== SAGA_PREFIX) return undefined
    const id = name.slice(SAGA_PREFIX.length).replace(/\/$/, "")
    return Sagas.isId(id) ? id : undefined
  }

  /** `text` as page prose:  escaped, a backticked span as `<code>`. */
  private static prose(text: string): string {
    return PlanMarkup.escapeAll(text).replace(/`([^`]+)`/g, "<code>$1</code>")
  }
}

/** The tool's saga page template, beside this file. */
const TEMPLATE = fileURLToPath(new URL("templates/saga.html", import.meta.url))
