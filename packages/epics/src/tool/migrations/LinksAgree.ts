import { PlanAnchors } from "../PlanAnchors"
import { PlanItem } from "../PlanItem"
import { PlanMarkup } from "../PlanMarkup"
import type { Migration, MigrationContext } from "./migrations.types"

/****************
 * ### `LinksAgree`
 * The migration `links-agree` (Owen, 2026-10-11, on I7 of epic `epic-workflow`:  "make check all links in a
 * goal/epic agree with new names"):  every link and comment anchor in an epic page checked against today's ids and
 * titles.
 * - `#id` LINKS (but in the log and in Original Discussions, which are history):
 *   - a link to an id that's gone:  REPORTED, never changed, for Claude or Owen to decide
 *   - its words naming a title the target had before (`P6 · Old Name`, or `Old Name` alone):  FIXED to today's
 *     - the titles it had:  the log's `P6 renamed:  "Old" -> "New"` lines, so only a real old title is rewritten
 *   - a phase link whose words name ANOTHER phase's title (`P10 · Doc Review` to `#p10`, while Doc Review is now
 *     P11):  the phase moved (an insert renumbered it):  FIXED, to `#p11` and `P11 · Doc Review`
 *   - a link with markup in its words is reported instead of rewritten
 * - Owen's COMMENTS, in the page's review inbox (`context.inbox`, when the runner read it):
 *   - an anchor whose block only MOVED (found again by its excerpt, `PlanAnchors.find()`):  FIXED, as a move the
 *     runner writes into the inbox (`context.moves`)
 *   - an anchor whose block is gone:  REPORTED
 * - the inbox's MARKS (and drafts, urgency ...) on an id that's gone:  REPORTED
 * - Goals Foundation (P15) adds stable phase ids, `<epic-link>` and `GOAL:/` links:  their checks come with it
 * - IDEMPOTENT:  once everything agrees, it changes nothing (false), though what it only reports stays reported
 * - Runs on command (`migrate`), and after a rename or an insert (`rename`, `add-phase --before`), never on every
 *   edit (`everyEdit` false):  its report would be noise there
 ****************/
export class LinksAgree implements Migration {
  readonly name = "links-agree"
  readonly kind = "epic"
  readonly date = "2026-10-11"
  readonly everyEdit = false
  readonly description =
    "links and comment anchors agree with today's ids and titles:  old titles and moved anchors fixed, links to gone ids reported"

  /** Check `document`'s links (and its inbox's anchors), fixing what it can, IN PLACE;  did it change the page? */
  run(document: Document, context: MigrationContext): boolean {
    const notes = context.notes ?? []
    const was = LinksAgree.pastTitles(document)
    let changed = false
    for (const link of PlanItem.current(document.querySelectorAll('a[href^="#"]'))) {
      if (link.closest(HISTORY)) continue
      const fix = LinksAgree.checkLink(document, link, was)
      if (!fix) continue
      if (fix.note) {
        notes.push(`links-agree:  ${fix.note}`)
        continue
      }
      const before = `#${link.getAttribute("href")!.slice(1)} "${PlanMarkup.squeeze(link.textContent ?? "")}"`
      if (fix.href) link.setAttribute("href", fix.href)
      if (fix.words) link.textContent = fix.words
      notes.push(`links-agree:  ${before} -> ${link.getAttribute("href")} "${link.textContent}"`)
      changed = true
    }
    if (context.inbox) LinksAgree.checkInbox(document, context)
    return changed
  }

  /**
   * What's wrong with `link`, if anything:  `{ href, words }` to set, or a `note` to report;  `undefined` when it
   * agrees.  `was`:  every titled element's past titles (`pastTitles()`).
   */
  private static checkLink(document: Document, link: Element, was: Map<string, Set<string>>): LinkFix | undefined {
    const id = link.getAttribute("href")!.slice(1)
    if (!id) return undefined
    const words = PlanMarkup.squeeze(link.textContent ?? "")
    const target = document.getElementById(id)
    if (!target) return { note: `#${id} is gone (a link saying "${words}"):  left for you` }
    if (!TITLED.includes(target.localName)) return undefined
    const label = id.toUpperCase()
    const labelled = /^([A-Za-z]+\d+)\s*·\s*(.+)$/.exec(words)
    const said = labelled ? labelled[2]! : words
    const title = PlanItem.titleOf(target)
    const phaseLabel = labelled && target.localName === "epic-phase" && /^P\d+$/i.test(labelled[1]!)
    if (phaseLabel && said !== title) {
      // a phase link naming another phase's title:  the phase moved
      const moved = Array.from(document.querySelectorAll("epic-phase")).filter(
        (phase) => PlanItem.titleOf(phase) === said
      )
      if (moved.length === 1)
        return LinksAgree.rewritten(link, `#${moved[0]!.id}`, `${moved[0]!.id.toUpperCase()} · ${said}`)
    }
    // the right phase by its title, but an old number in the words
    if (phaseLabel && said === title && labelled[1]!.toUpperCase() !== label)
      return LinksAgree.rewritten(link, undefined, `${label} · ${title}`)
    if (labelled && labelled[1]!.toUpperCase() !== label) return undefined
    if (said === title || !was.get(id)?.has(said)) return undefined
    return LinksAgree.rewritten(link, undefined, labelled ? `${label} · ${title}` : title)
  }

  /** The fix that gives `link` `href` and `words`;  a note instead when its words hold markup. */
  private static rewritten(link: Element, href: string | undefined, words: string): LinkFix {
    if (link.children.length)
      return { note: `#${link.getAttribute("href")!.slice(1)} should say "${words}", but its words hold markup:  left` }
    return { href, words }
  }

  /**
   * Every id's titles before today's, from the log's rename lines (`P6 renamed:  "Old" -> "New"`, as
   * `PlanDoc.renameEntry()` writes them):  `{ p6 => { "Old" } }`.
   */
  private static pastTitles(document: Document): Map<string, Set<string>> {
    const was = new Map<string, Set<string>>()
    for (const event of document.querySelectorAll("epic-event")) {
      const m = /^([A-Za-z]+\d+) renamed:\s+"(.*)" -> "(.*)"/.exec(PlanMarkup.squeeze(event.textContent ?? ""))
      if (!m) continue
      const id = m[1]!.toLowerCase()
      if (!was.has(id)) was.set(id, new Set())
      was.get(id)!.add(m[2]!)
    }
    return was
  }

  /** The inbox's comments and marks against `document`:  moves for comments whose block moved, notes for the rest. */
  private static checkInbox(document: Document, context: MigrationContext): void {
    const { inbox } = context
    const notes = context.notes ?? []
    const moves = context.moves ?? []
    for (const [id, comment] of Object.entries(inbox!.comments)) {
      const found = PlanAnchors.find(document, comment.anchor, comment.excerpt)
      if (found.how === "moved") {
        const to = PlanAnchors.anchorOf(found.block!)
        moves.push({ id, from: comment.anchor, to })
        notes.push(`links-agree:  comment ${id}:  ${comment.anchor} -> ${to} (its block moved)`)
      } else if (found.how === "gone") {
        notes.push(`links-agree:  comment ${id} is on ${comment.anchor}, which is gone:  left for you`)
      } else if (found.how === "changed") {
        notes.push(
          `links-agree:  comment ${id} is on ${comment.anchor}, whose words changed (or several blocks start the same):  ` +
            "it may be about something else now;  left for you"
        )
      }
    }
    for (const [what, entries] of Object.entries(inbox!.keyed)) {
      for (const key of Object.keys(entries)) {
        if (key === "summary" || /^new\d+$/.test(key) || document.getElementById(key)) continue
        notes.push(`links-agree:  ${what} on #${key}, which is gone:  left for you`)
      }
    }
  }
}

/** A link's fix:  its new `href` and `words`, or a `note` to report instead. */
type LinkFix = { href?: string; words?: string; note?: string }

/** What a link's words may name by title:  a phase, an item, an Overview part. */
const TITLED = ["epic-phase", "epic-item", "epic-section"]

/** Where links are history, left as written:  the log. */
const HISTORY = "epic-event"
