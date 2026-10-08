import { Formats, SectionIds } from "$/epics/definitions"

import {
  Chrome,
  COMMITS_LABEL,
  FIELD_NAMES,
  isScriptUpdate,
  META_IDS,
  Old,
  PLAN_DOC_CSS,
  replyTitleParts,
  UPDATED_LABEL
} from "./convert.types"

import { DocReading, type ElementReading } from "./DocReading"

/****************
 * ### `OldReading`
 * A plan doc in TODAY's markup, read for `ConversionProof`:  its ids, links and visible text, minus the chrome the
 * `<epic-*>` elements now draw (`EXCLUSIONS` lists it for a reader).
 * - Reads an ASSEMBLED doc:  a split one with its parts put back.
 * - Every exclusion is narrow:  by WHERE it sits (a card's title only on a card straight in an item's details, not
 *   on the copy of one in an Original Discussion or a reply), and by what it says where it can (a chip only when it
 *   names its own item, an answer's `D7` only when it's its own id, a field label only when the vocabulary has
 *   the field).
 ****************/
export class OldReading extends DocReading {
  constructor(document: Document) {
    super()
    this.read(document)
  }

  protected unitOf(element: Element): string | undefined {
    const parent = element.parentElement
    if (!element.id || !parent) return undefined
    if (element.localName === "ui-section" && parent.localName === "main") return element.id
    if (element.localName === "ui-section" && parent.id === "overview") return element.id
    if (element.localName === "ui-section" && parent.id === "phases" && element.hasAttribute("data-phase"))
      return element.id
    if (element.localName === "ui-item" && parent.matches(Old.items)) return element.id
    return undefined
  }

  protected readingOf(element: Element): ElementReading | undefined {
    if (element.matches(SKIPPED)) return { children: false }
    if (element.matches(`main > ${Old.header}`)) {
      const title = element.querySelector(Old.title)?.textContent ?? ""
      return { pieces: [title.replace(Chrome.titlePrefix, "")], children: false }
    }
    if (element.matches(`main > ${Old.meta}`)) {
      return { pieces: [element.querySelector(':scope > ui-item[icon="book"] a')?.textContent], children: false }
    }
    if (element.localName === "ui-section") return this.sectionReading(element)
    if (element.matches(SLOTTED_HEADER)) {
      return { children: { first: element.closest("#phases") ? Chrome.phasePrefix : Chrome.partNumber } }
    }
    if (element.matches(LABELS) && this.isLabel(element)) return { children: false }
    if (element.matches(CHIP)) {
      const item = element.closest("ui-item")
      if (item && element.textContent?.trim() === item.id.toUpperCase()) return { children: false }
    }
    if (element.matches(UPDATE_LABELS) && /^\d+$/.test(element.getAttribute("data-phase") ?? "")) {
      return { children: false }
    }
    if (element.matches(OPTION_TITLES)) return { children: { first: Chrome.optionLetter, last: Chrome.recommended } }
    if (element.matches(ANSWER_TITLE)) return { children: { first: Chrome.answerSeparator } }
    if (element.matches(REPLY_TITLE)) {
      const parts = replyTitleParts(element)
      if (parts && Formats.time.test(parts.at)) return { pieces: [parts.from, parts.at, parts.re], children: false }
    }
    if (element.matches(UPDATE_MESSAGE) && isScriptUpdate(element)) return {}
    return undefined
  }

  protected idExclusion(element: Element): string | undefined {
    if (element.closest(`main > ${Old.overnight}`)) return OVERNIGHT_WHY
    if (META_IDS.includes(element.id) && element.closest(`main > ${Old.meta}`)) return "meta line, drawn by <epic-page>"
    return undefined
  }

  protected linkExclusion(element: Element): string | undefined {
    if (element.matches(PLAN_DOC_CSS)) return "plan-doc.css, dropped:  the elements style themselves"
    if (element.closest(`main > ${Old.overnight}`)) return OVERNIGHT_WHY
    if (element.closest(`main > ${Old.header}`)) return "step label, drawn by <epic-page>"
    if (element.closest(`main > ${Old.meta} > ui-item[icon="folder"]`))
      return "worktree meta line, drawn by <epic-page>"
    if (element.closest(`main > ${Old.future}`)) return "future-epic notice, drawn by <epic-page future>"
    if (element.closest(`main > ${Old.hung}`)) return "Plan hung? notice, drawn by <epic-page>"
    if (element.closest(`#phases > ${Old.planChanges}`))
      return "Plan changes box, drawn from the phases' <epic-updated> lines"
    return undefined
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A main section's title is chrome;  an Overview sub-section's and a phase's, all but their number. */
  private sectionReading(element: Element): ElementReading | undefined {
    const parent = element.parentElement
    const header = element.getAttribute("header") ?? ""
    if (parent?.localName === "main" && STRUCTURAL.has(element.id)) return {}
    if (parent?.id === "overview") return { pieces: [header.replace(Chrome.partNumber, "")] }
    if (parent?.id === "phases" && element.hasAttribute("data-phase")) {
      return { pieces: [header.replace(Chrome.phasePrefix, ""), element.getAttribute("badge")] }
    }
    return undefined
  }

  /**
   * Is `bold` (a `LABELS` `<b>`) a label the elements draw:  a phase field the vocabulary names (`Goal:`),
   * `Updated:` / `Commits:`, `Estimate:`, an answer's `Answer` / its own id?
   */
  private isLabel(bold: Element): boolean {
    const parent = bold.parentElement!
    const text = bold.textContent?.trim() ?? ""
    if (parent.matches(Old.answerTitle)) {
      const answer = parent.parentElement
      return text === "Answer" || (Chrome.answerWord.test(text) && text === answer?.id.toUpperCase())
    }
    if (parent.matches(Old.estimate)) return text === "Estimate:"
    if (parent.matches(Old.commits)) return text === `${COMMITS_LABEL}:`
    const label = Chrome.fieldLabel.exec(text)?.[1]
    return Boolean(label && (Object.hasOwn(FIELD_NAMES, label) || label === UPDATED_LABEL || label === COMMITS_LABEL))
  }
}

/** The ids of the page's own sections (the Overview, Phases ... Log):  their titles are drawn. */
const STRUCTURAL = new Set<string>(["overview", ...Object.values(SectionIds)])

/** Why an older doc's Overnight report isn't compared:  dropped (I3). */
const OVERNIGHT_WHY = "Overnight report, dropped:  its items are `overnight`"

/** An item's line:  its panel's title, or the item itself when it has no details. */
const LINE = [`${Old.items} > ui-item > ${Old.itemPanel} > ui-title`, `${Old.items} > ui-item`]

/** Where an item's cards sit:  straight in its details (NOT in a reply, or an Original Discussion's copy). */
const CARD = `${Old.items} > ui-item > ${Old.itemPanel} > ui-content`

/** A phase body's field. */
const FIELD = `#phases > ui-section > ${Old.phaseBody} > ui-item`

/** Chrome read as nothing at all. */
const SKIPPED = [
  "ui-icon[slot='icon']",
  `main > ${Old.hung}`,
  `main > ${Old.future}`,
  `main > ${Old.overnight}`,
  `#phases > ${Old.progress}`,
  `#phases > ${Old.planChanges}`,
  Old.partNote,
  ...LINE.map((line) => `${line} > ${Old.reviewLabel}`),
  `#overview > ${Old.promptPanel} > ui-title`,
  `${CARD} > ${Old.choices} > ui-title`,
  `${CARD} > ${Old.more} > ui-title`,
  `${CARD} > ${Old.original} > ui-title`,
  `${CARD} > ${Old.original} > ui-content > ${Old.version} > h5:first-child`,
  `${CARD} > ${Old.commits} > ${Old.commitList} > li > ${Old.commitLink}`,
  `${FIELD} > ${Old.commitList} > li > ${Old.commitLink}`
].join(", ")

/** An item's chip, on its line. */
const CHIP = LINE.map((line) => `${line} > ${Old.chip}`).join(", ")

/** UPDATE labels the converter makes `<epic-update>`s of:  on an item's line, or straight in its details. */
const UPDATE_LABELS = [...LINE, CARD].map((place) => `${place} > ${Old.updateLabel}`).join(", ")

/** The script's UPDATE notes the converter makes `<epic-update>`s of:  straight in an item's details. */
const UPDATE_MESSAGE = `${CARD} > ${Old.updateMessage}`

/** A title with markup, in place of a section's `header`. */
const SLOTTED_HEADER = "#overview > ui-section > span[slot='header'], #phases > ui-section > span[slot='header']"

/** `<b>`s that may be labels:  a field's, an answer card's title's, the estimate's, an item's commits'. */
const LABELS = [
  `${FIELD} > b:first-child`,
  `${CARD} > ${Old.answer} > ${Old.answerTitle} > b:first-child`,
  `#overview > ${Old.estimate} > b:first-child`,
  `${CARD} > ${Old.commits} > b:first-child`
].join(", ")

/**
 * Option titles the converter makes `<epic-option>`s of:  the Choices accordion's, and the option cards of a
 * QUESTION's own grid (a grid elsewhere is prose, kept as it is).
 */
const OPTION_TITLES = [
  `${CARD} > ${Old.choices} > ui-content > ${Old.options} > ui-title`,
  `${Old.items} > ui-item[id^='q'] > ${Old.itemPanel} > ui-content > ${Old.grid} > ui-column > ui-segment > ui-label:first-child`
].join(", ")

/** An answer card's title line, on a card straight in an item's details:  `<b>D7</b> · title`. */
const ANSWER_TITLE = `${CARD} > ${Old.answer} > ${Old.answerTitle}`

/** A reply's title line, on a reply straight in an item's details. */
const REPLY_TITLE = `${CARD} > ${Old.reply} > ${Old.replyTitle}`
