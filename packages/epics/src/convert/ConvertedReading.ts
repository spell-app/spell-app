import { Formats } from "$/epics/definitions"
import { ProseShapes } from "$/epics/tool/ProseShapes"

import { Chrome, Drawn, PLAN_DOC_CSS, Prose, replyTitleParts } from "./convert.types"

import type { ElementReading } from "./DocReading"
import { NewReading } from "./NewReading"

/****************
 * ### `ConvertedReading`
 * A CONVERTED plan doc (`<epic-page>` markup, before P14's elements), read for the second pass's `ConversionProof`:
 * as `NewReading` reads it, minus the chrome P14's elements now draw (`UPGRADE_EXCLUSIONS` lists it for a reader).
 * - Every exclusion is the converter's own rule (`ProseShapes`):  a Net effect label only on a paragraph that becomes
 *   `<epic-net-effect>`, an option's `A · ` only on a grid that becomes `<epic-choices>`;  the same words in any
 *   other shape stay compared.
 * - Reads an ASSEMBLED doc (`EpicParts.assemble()`).
 ****************/
export class ConvertedReading extends NewReading {
  protected readingOf(element: Element): ElementReading | undefined {
    const parent = element.parentElement
    if (element.matches(`main > ${Prose.crumbs}`)) return { children: false }
    if (ProseShapes.netEffect(element)?.form === "list") return { children: false }
    if (parent && ProseShapes.netEffect(parent)?.label === element) return { children: false }
    if (ProseShapes.labelledBlock(element)?.form === "block") return { children: false }
    if (parent && ProseShapes.labelledBlock(parent)?.label === element) return { children: false }
    if (element.localName === "ui-title" && parent && ProseShapes.aside(parent)) {
      return { children: { first: Drawn.asidePrefix } }
    }
    if (element.localName === "ui-label" && ProseShapes.optionLabel(element)) {
      return { children: { first: Chrome.optionLetter, last: Drawn.optionSuffix } }
    }
    const note = ProseShapes.note(element)
    if (note) return { pieces: [note.title] }
    const card = parent && ProseShapes.handCard(parent)
    if (card === "epic-answer" && element.matches(Prose.answerTitle)) return { children: { first: ANSWER_LABEL } }
    if (card === "epic-reply" && element.matches(Prose.replyTitle)) {
      const parts = replyTitleParts(element)
      if (parts && Formats.time.test(parts.at)) return { pieces: [parts.from, parts.at, parts.re], children: false }
    }
    if (element.localName === "b" && parent?.matches(Prose.answerTitle) && isAnswerWord(element)) {
      return { children: false }
    }
    return super.readingOf(element)
  }

  protected linkExclusion(element: Element): string | undefined {
    if (element.matches(PLAN_DOC_CSS)) return "plan-doc.css, dropped:  the elements style themselves"
    if (element.closest(`main > ${Prose.crumbs}`)) return "the old crumbs, drawn by <epic-page>"
    return undefined
  }
}

/** A hand-written answer's ` · ` after its `Answer` / `D7`. */
const ANSWER_LABEL = Chrome.answerSeparator

/**
 * Is `bold`, first in a hand-written answer's title line, its `Answer` (or its own id, `D7`), on an answer that
 * becomes `<epic-answer>`?
 */
function isAnswerWord(bold: Element): boolean {
  const title = bold.parentElement!
  const answer = title.parentElement
  if (!answer || ProseShapes.handCard(answer) !== "epic-answer" || title.firstElementChild !== bold) return false
  const word = bold.textContent?.trim() ?? ""
  return word === "Answer" || (Chrome.answerWord.test(word) && word === answer.id.toUpperCase())
}
