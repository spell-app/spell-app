import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { parseHTML } from "linkedom"

// Import directly:  the `$/server/site` barrel is browser code (the site header);  this file imports nothing
import { URGENT_SELECTOR } from "$/server/site/EpicState"

import type { SagaEpic, SagaEpicsAnswer } from "$/epics/components/epic-cards/EpicCards.types"

import { PlanDocFiles } from "./PlanDocFiles"

/****************
 * ### `SagaEpics`
 * The epics serving a saga, as a saga page's Epics draws them (`<epic-cards>`, epic `epic-workflow` P15):
 * every epic page whose `<epic-page saga>` names it.
 * - GATHERED when asked, from each epic page's SKELETON (no parts):  its title, summary, phases' statuses, `updated`,
 *   `future`, `standing` and the items that need Owen -- what `$/server/site/EpicState` reads an epic's state from
 * - nothing kept:  an epic that joins or leaves the saga, or finishes a phase, shows on the next ask
 * - read by the page server (`GET /api/epics/saga?saga=<id>`, `epicRoutes.ts`), which `<epic-cards>` asks
 * - Node only (`node:fs`, linkedom):  NOT in the `$/epics` barrel, imported by path.
 ****************/
export class SagaEpics {
  /** the checkout's root:  its `epics/` (the shared copy every checkout reads) */
  readonly root: string

  constructor(root: string) {
    this.root = root
  }

  /**
   * Saga `saga`'s epics, by title:  each with its link from the saga page's folder (`sagas/<id>/`), its summary,
   * and the facts its state is read from.
   * - an epic page that won't parse is left out
   */
  of(saga: string): SagaEpicsAnswer {
    const epics = join(this.root, "epics")
    const names = existsSync(epics)
      ? readdirSync(epics, { withFileTypes: true })
          .filter((entry) => entry.isDirectory())
          .map((entry) => entry.name)
      : []
    const found = names.flatMap((name): SagaEpic[] => {
      const file = PlanDocFiles.planDocIn(join(epics, name), name)
      if (!file) return []
      const epic = SagaEpics.read(name, readFileSync(file, "utf8"), file.endsWith(".plan.html"))
      return epic?.saga === saga ? [epic.card] : []
    })
    found.sort((a, b) => a.title.localeCompare(b.title, undefined, { numeric: true, sensitivity: "base" }))
    return { saga, epics: found }
  }

  /**
   * Epic `name`'s card from its skeleton `html`, with the saga it names;  `undefined` when it holds no `<epic-page>`.
   * - `planName`:  its file is `<name>.plan.html` (else the older `<name>.html`), for its link
   */
  static read(name: string, html: string, planName = true): { saga: string | null; card: SagaEpic } | undefined {
    const { document } = parseHTML(html)
    const page = document.querySelector("epic-page")
    if (!page) return undefined
    const phases = Array.from(document.querySelectorAll('epic-section[kind="phases"] > epic-phase'))
    const active = phases.find((phase) => phase.getAttribute("status") === "active")
    const activeTitle = active?.getAttribute("title") ?? active?.querySelector(":scope > [slot=title]")?.textContent
    return {
      saga: page.getAttribute("saga"),
      card: {
        name,
        title: page.getAttribute("title") ?? name,
        href: `../../epics/${name}/${name}${planName ? ".plan" : ""}.html`,
        summary: (document.querySelector("epic-summary")?.textContent ?? "").replace(/\s+/g, " ").trim(),
        facts: {
          phases: phases.map((phase) => phase.getAttribute("status") ?? "todo"),
          updated: page.getAttribute("updated"),
          future: page.hasAttribute("future"),
          standing: page.hasAttribute("standing"),
          urgent: Array.from(document.querySelectorAll(URGENT_SELECTOR), (item) => item.id),
          // its number by its place, never its id:  phase ids may be words (P15's stable ids)
          active: active ? `P${phases.indexOf(active) + 1} · ${(activeTitle ?? "").trim()}` : undefined
        }
      }
    }
  }
}
