import { PhaseIds } from "$/epics/phases"

import { PlanItem } from "../PlanItem"
import type { Migration, MigrationContext } from "./migrations.types"

/****************
 * ### `StablePhaseIds`
 * The migration `stable-phase-ids` (epic `epic-workflow` P15, I7 and J49):  every phase's OLD id, its number (`p7`),
 * becomes a STABLE one made from its name (`p-epic-migrate`:  `PhaseIds`), and everything that uses it follows.
 * - why:  an insert used to renumber every later phase's id, and what's kept OUTSIDE the page (Owen's comments, marks
 *   and drafts in the inbox) stayed on the old numbers, so a comment showed on the wrong phase (I7)
 * - the page:
 *   - each `<epic-phase id="p7">` -> `id="p-<its name>"` (a clash gets `-2`);  its number is still its place
 *   - every link to it, `href="#p7"`, and to it by the page's own file (`<epic>.plan.html#p7`):  the new id.  The
 *     log's and Original Discussions' links too:  their words stay as written (history), but they still land.
 *   - a link `#p7` to no element (written by hand since, or kept from before):  the 7th phase's id
 *   - a split doc's part files follow by themselves:  each phase's is written under its new id
 *     (`parts/p-epic-migrate.html`), and the old file goes (`PlanDocFiles.writeDoc()`)
 * - the inbox (`context.renames`, which the runner writes after the page, `PlanDocFiles.migrate()`):  marks, drafts,
 *   urgency, agents at work, called-off and immediate requests keyed `p7`, a new item about it (`near`), and comment
 *   anchors (`p7`, `p7#field-1`)
 * - links INTO the page from other pages (guides, details pages, other epics, the changelog) are left:  an old
 *   address still lands on the phase at that place (`PhaseIds.landing()`, the docs runtime)
 * - IDEMPOTENT:  once no phase has an old id and no link names one, it changes nothing
 * - Runs on command (`migrate`), never on every edit:  it rewrites the inbox and the part files too
 ****************/
export class StablePhaseIds implements Migration {
  readonly name = "stable-phase-ids"
  readonly kind = "epic"
  readonly date = "2026-10-14"
  readonly everyEdit = false
  readonly description =
    "each phase's id is stable, made from its name (p7 -> p-epic-migrate), with its links, part file and inbox entries"

  /** Give `document`'s phases stable ids and repoint their links, IN PLACE;  the inbox's renames into `context`. */
  run(document: Document, context: MigrationContext): boolean {
    const phases = PhaseIds.phasesIn(document)
    const taken = PhaseIds.idsIn(document)
    const renames: Record<string, string> = {}
    for (const phase of phases) {
      if (PhaseIds.oldNumber(phase.id) === undefined) continue
      const id = PhaseIds.make(PlanItem.titleOf(phase), taken)
      taken.add(id)
      renames[phase.id] = id
      phase.id = id
    }
    const own = context.epic ?? document.querySelector("epic-page")?.getAttribute("epic")
    let links = 0
    for (const link of document.querySelectorAll("a[href]")) {
      const href = link.getAttribute("href")!
      const hash = href.indexOf("#")
      if (hash === -1) continue
      const path = href.slice(0, hash)
      if (path && !(own && OWN_FILE(own).test(path))) continue
      const old = href.slice(hash + 1)
      const n = PhaseIds.oldNumber(old)
      if (n === undefined || document.getElementById(old)) continue
      const id = renames[old] ?? phases[n - 1]?.id
      if (!id) continue
      link.setAttribute("href", `${path}#${id}`)
      links++
    }
    const renamed = Object.keys(renames).length
    if (!renamed && !links) return false
    if (renamed) context.renames = { ...context.renames, ...renames }
    const each = Object.entries(renames).map(([from, to]) => `${from} -> ${to}`)
    context.notes?.push(
      `stable-phase-ids:  ${renamed} phase id${renamed === 1 ? "" : "s"}${each.length ? ` (${each.join(", ")})` : ""}, ` +
        `${links} link${links === 1 ? "" : "s"}${renamed ? `, ${inboxCount(context, renames)} in the inbox` : ""}`
    )
    return true
  }
}

/** How many of the inbox's entries and comment anchors `renames` moves (`context.inbox`, as the runner read it). */
function inboxCount({ inbox }: MigrationContext, renames: Record<string, string>): number {
  if (!inbox) return 0
  const keys = Object.values(inbox.keyed).flatMap((entries) => Object.keys(entries))
  const anchors = Object.values(inbox.comments).map((comment) => comment.anchor.split("#")[0]!)
  return [...keys, ...anchors].filter((key) => key in renames).length
}

/** A link to the page by its own file:  `seo.plan.html`, `../seo/seo.plan.html`. */
const OWN_FILE = (epic: string) => new RegExp(`(^|/)${epic.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\.plan\\.html$`)
