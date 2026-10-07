import { basename, dirname, relative, resolve } from "node:path"

import { STATE_COLORS, type ReviewItem, type ReviewSection, type ReviewStatus } from "./planDoc.types"

import type { PlanReader } from "./PlanReader"
import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `ItemPicker`
 * `/epic review`'s item picker (`spell dev plan-doc items --section <s> --spec <file>`):  a details page spec, for
 * `spell dev details new --from`, that asks Owen which of a section's items to go through.
 * - STATIC and instance-free on purpose:  one pure function of a parsed doc, with its two helpers
 * - knows the details page's SPEC shape (`packages/docs/tools/details.js` `DetailsSpec`) as data only:  `epics` may
 *   not import `docs`
 * - From `packages/docs/tools/plan-doc.js` `pickerSpec()` (epic `epic-components`, P7).
 ****************/
export class ItemPicker {
  /**
   * The picker for `section` of `plan` (the doc at `file`):  one checkbox per open item of the section
   * (`reviewSections()`'s, filter `open`), the not-reviewed ones ticked.
   * - each option's letter is the item's id (`I4`), so the answer names the ids
   * - written for Owen coming cold ("Writing for Owen" in the details skill):  where reviews stand, and each item's
   *   WHOLE text, as the plan doc has it (the page clamps long ones, "Show more"), its state a badge
   * - the page:  no site header (`bare`), "Select all / none", "Open | All" (Open:  only the not-reviewed)
   * - `pageDir`:  where the page will live (the scratch `pages/details/`), so the item's links still work from there
   */
  static spec(plan: PlanReader, file: string, section: ReviewSection, status: ReviewStatus, pageDir: string) {
    // `seo.plan.html` (an old doc:  `seo.html`) -> `seo`
    const name = basename(file).replace(/(?:\.plan)?\.html$/, "")
    const title = plan.title || name
    const label = section.label.toLowerCase()
    const last = status.last
      ? `You last reviewed this epic on ${status.last}${status.queued.length ? `;  ${status.queued.length} decided to do, not done yet` : ""}.`
      : "This epic hasn't been reviewed before."
    return {
      bare: true,
      lede: `Tick the ${label} to go through.  Each comes up in chat, one at a time, and what you decide goes into the plan doc.`,
      askedBy: `<code>/epic review ${name}</code>`,
      where: {
        epic: `${PlanMarkup.text(title)} (<code>${name}</code>)`,
        justNow: `${last}  ${section.label}:  ${section.notReviewed} of ${section.total} not reviewed yet;  those are ticked.`,
        decides: `Which ${label} to go through now.  Unticked ones stay as they are, for another review.`
      },
      questions: [
        {
          id: "items",
          title: `${section.label} (${section.notReviewed}/${section.total})`,
          multiple: true,
          selectAll: true,
          filter: true,
          moreDetails: true,
          options: section.items.map((item) => ({
            letter: item.id,
            // "Review:  ..." is how some docs file their review notes;  on a review page it says nothing
            title: item.title.replace(/^review:\s*/i, ""),
            body: ItemPicker.rehome(item.detailsHtml, file, pageDir) || "<p><i>No details in the plan doc.</i></p>",
            state: ItemPicker.stateOf(item),
            checked: item.state === "outstanding" || item.state === "deferred",
            done: item.state === "reviewed" || item.state === "queued"
          }))
        }
      ]
    }
  }

  /**
   * A picker option's review state, as the icon under its tick box:  `{ icon, color, label }` (`label` on hover).
   * - the icon says the review state:  not reviewed, an empty circle;  deferred, a pause;  reviewed, a check;  to
   *   do, a list
   * - the color is the item's on the plan doc (`docState`, `STATE_COLORS`):  red waits on Owen, orange in progress,
   *   blue open, green recent, grey older
   * - every icon in `bundle-spell-ui.js` `ICONS`
   */
  private static stateOf(item: ReviewItem): { icon: string; color: string; label: string } {
    const color = STATE_COLORS[item.docState] ?? STATE_COLORS.open
    if (item.state === "deferred") return { icon: "circle pause", color, label: `Deferred ${item.deferred}` }
    if (item.state === "queued") return { icon: "list check", color, label: `To do:  ${item.work}` }
    if (item.state === "reviewed") {
      const label = item.reviewed ? `Reviewed ${item.reviewed}` : "Settled:  closed, decided, or a decision links it"
      return { icon: "circle check", color, label }
    }
    return { icon: "circle outline", color, label: "Not reviewed yet" }
  }

  /**
   * `html` from the plan doc at `file`, its links made to work from `pageDir` instead:
   * - `#c3` -> the plan doc's `#c3`
   * - a relative `href` / `src` -> the same file, relative to `pageDir`
   * - absolute ones (`https:`, `/x`) as they are
   */
  private static rehome(html: string, file: string, pageDir: string): string {
    const docDir = dirname(file)
    return html.replace(/\b(href|src)="([^"]*)"/g, (whole, name, value: string) => {
      if (/^([a-z][a-z0-9+.-]*:|\/)/i.test(value)) return whole
      const [path, hash = ""] = value.split("#")
      const target = path ? resolve(docDir, path) : file
      return `${name}="${relative(pageDir, target)}${hash ? `#${hash}` : ""}"`
    })
  }
}

/** The details page spec `ItemPicker.spec()` makes. */
export type ItemPickerSpec = ReturnType<typeof ItemPicker.spec>
