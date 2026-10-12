import { Markup } from "$/epics/markup"

import { PlanMarkup } from "../PlanMarkup"
import { PlanTime } from "../PlanTime"
import { UpdateSummary } from "../UpdateSummary"
import type { Migration, MigrationContext } from "./migrations.types"

/****************
 * ### `UpdatesAsEpicUpdate`
 * The migration `updates-as-epic-update` (epic `epic-workflow`;  Owen, 2026-10-11:  "lose the "Plan changes"
 * surround.  The updated blocks themselves go at the end of the phase description, or after the section which they
 * updated"):  every older shape of an update becomes ONE element, `<epic-update at summary>`.
 * - a phase's plan change, `<epic-updated at phase>` (in its `changes` slot since P6, in no slot before):
 *   an `<epic-update at phase summary>` at the END of its phase's description, after Goal (`Markup.place()`),
 *   oldest first, its children kept
 * - an older doc's COPIES in the Phases section (`<epic-updated slot="changes" of="N">`, T14):  removed
 * - an UPDATE note (`<epic-update phase>` with children, no `at`, which stood BEFORE the prose it was about):
 *   moved right AFTER that block, given `at` (its item's `changed`, else the page's `updated`, else now) and a
 *   `summary`
 *   - "that block":  the next sibling that is prose (any element but an `<epic-*>`, or a prose element:  code,
 *     aside, note, Net effect);  none, or another `<epic-*>` card next:  it stays where it is
 *   - several notes before one block keep their order after it
 * - the summary, where there was none:  the first sentence of what changed (`UpdateSummary`)
 * - a bare UPDATE label (no children) is left alone:  it isn't an update block
 * - IDEMPOTENT:  a doc with none of those shapes is left as it is (false)
 * - One instance, registered in `Migrations`;  no state of its own
 ****************/
export class UpdatesAsEpicUpdate implements Migration {
  readonly name = "updates-as-epic-update"
  readonly kind = "epic"
  readonly date = "2026-10-11"
  readonly everyEdit = true
  readonly description =
    "a phase's <epic-updated> lines and the UPDATE notes become <epic-update at summary> blocks, after what they changed"

  /** Migrate `document`, IN PLACE;  did it change anything? */
  run(document: Document, { now }: MigrationContext): boolean {
    let changed = false
    for (const copy of Array.from(document.querySelectorAll("epic-section > epic-updated"))) {
      copy.remove()
      changed = true
    }
    for (const phase of document.querySelectorAll("epic-phase")) {
      for (const line of Array.from(phase.querySelectorAll(":scope > epic-updated"))) {
        UpdatesAsEpicUpdate.lineToUpdate(phase, line)
        changed = true
      }
    }
    for (const note of Array.from(document.querySelectorAll("epic-update"))) {
      if (!UpdatesAsEpicUpdate.isOldNote(note)) continue
      UpdatesAsEpicUpdate.dateNote(note, now)
      UpdatesAsEpicUpdate.moveAfterItsBlock(note)
      changed = true
    }
    return changed
  }

  /** Phase `phase`'s plan change `line` (`<epic-updated>`) as an `<epic-update>` at the end of its description. */
  private static lineToUpdate(phase: Element, line: Element): void {
    const { at, phase: during } = Markup.read<"epic-updated">(line)
    const children = PlanMarkup.takeChildren(line)
    const summary = UpdateSummary.of(children) || undefined
    line.remove()
    const update = Markup.element(phase.ownerDocument, "epic-update", { at, phase: during, summary }, children)
    Markup.place(phase, update)
  }

  /** Is `update` an older UPDATE note:  children, but no `at` and no `summary`? */
  private static isOldNote(update: Element): boolean {
    if (update.hasAttribute("at") || update.hasAttribute("summary")) return false
    return Array.from(update.childNodes).some((node) => PlanMarkup.isSignificant(node))
  }

  /** `note`'s `at` (its item's `changed`, else the page's `updated`, else `now`) and `summary`. */
  private static dateNote(note: Element, now: Date): void {
    const item = note.closest("epic-item[changed]")
    const page = note.ownerDocument.querySelector("epic-page[updated]")
    const at = item?.getAttribute("changed") ?? page?.getAttribute("updated") ?? PlanTime.clockTime(now)
    const summary = UpdateSummary.of(note.childNodes) || undefined
    Markup.set<"epic-update">(note, { at, summary })
  }

  /** `note`, which stood before the block it's about, moved right after it (after the updates already there). */
  private static moveAfterItsBlock(note: Element): void {
    let block = note.nextElementSibling
    while (block?.localName === UPDATE_TAG) block = block.nextElementSibling
    if (!block || !isProse(block)) return
    let after: Element = block
    while (after.nextElementSibling?.localName === UPDATE_TAG && after.nextElementSibling.hasAttribute("at"))
      after = after.nextElementSibling
    after.after(note)
  }
}

/** The element it writes. */
const UPDATE_TAG = "epic-update"

/** The `<epic-*>` elements that are prose, so an update may follow them (the rest are cards with a fixed place). */
const PROSE_ELEMENTS = new Set(["epic-code", "epic-aside", "epic-note", "epic-net-effect"])

/** Is `element` prose:  any element but an `<epic-*>`, or one of `PROSE_ELEMENTS`? */
function isProse(element: Element): boolean {
  return !element.localName.startsWith("epic-") || PROSE_ELEMENTS.has(element.localName)
}
