import { Definitions, type EpicTag } from "$/epics/definitions"
import { MarkupCheck, TEXT_NODE } from "$/epics/markup"

import { Chrome, Drawn, LABELLED_BLOCK, ProseBlocks } from "./planDoc.types"

import { PlanMarkup } from "./PlanMarkup"

/****************
 * ### `ProseShapes`
 * The ONE set of rules for which hand-written prose blocks of the old docs become P14 elements:  a Net effect
 * paragraph, a code or aside accordion, a note, a labelled block, an option grid, an answer or reply card.  Each reader
 * returns the block's parts when it's in the shape the element takes, `undefined` when it isn't (it stays prose).
 * - shared by every reader of those shapes:  `ProseRewrite` (the tool's way in, `IncomingHtml`, and the converter's
 *   second pass, `Upgrader`) and the converter's proof (`ConvertedReading`), so the proof leaves out exactly the
 *   chrome the converter turned into data, and nothing else
 * - the PROOF's rules (epic `epic-components` T23):  strict, so every word of a block is accounted for.  So a code
 *   accordion holding a `<ui-code>` (its text in a `<script>`, which the proof doesn't read) stays prose, and an
 *   aside's title is kept whatever it says, less a leading `Aside: `
 * - reads, never changes:  the proof and the converter call it on documents in the same state (the converter before
 *   it moves a block)
 * - STATIC and instance-free;  plain DOM (linkedom or the browser's)
 ****************/
export class ProseShapes {
  /**
   * Paragraph `p` as `<epic-net-effect>`:  its bold label, and either the list after it (`list`) or the rest of its
   * own text (`inline`).
   * - `list`:  the paragraph is the label alone (`Drawn.netEffect`:  `Net effect (A, recommended):`), then a `<ul>` /
   *   `<ol>`
   * - `inline`:  `<b>Net effect:</b>` then a sentence in the same paragraph
   * - other words in the label (`Net effect (once fixed):`), a paragraph with attributes, a label with markup:
   *   `undefined`
   */
  static netEffect(p: Element): NetEffectShape | undefined {
    if (p.localName !== "p" || p.attributes.length) return undefined
    const label = ProseShapes.boldLead(p)
    if (!label || label.children.length || label.attributes.length) return undefined
    const rest = Array.from(p.childNodes).filter(PlanMarkup.isSignificant).slice(1)
    const match = rest.every((node) => node.nodeType === TEXT_NODE)
      ? Drawn.netEffect.exec(PlanMarkup.squeeze(p.textContent ?? ""))
      : null
    if (match) {
      const list = nextElement(p)
      if (!list || !LIST.test(list.localName)) return undefined
      return { form: "list", label, list, option: match[1], recommended: Boolean(match[2] || match[3]) }
    }
    if (Drawn.netEffectLabel.test(PlanMarkup.squeeze(label.textContent ?? "")) && rest.length) {
      return { form: "inline", label, recommended: false }
    }
    return undefined
  }

  /**
   * `<b>` (or `<strong>`) that paragraph `p` starts with, when its text starts `Net effect`:  in the shape
   * `netEffect()` takes, or in other words.
   */
  static netEffectLead(p: Element): Element | undefined {
    const label = ProseShapes.boldLead(p)
    return label && Drawn.netEffectLead.test(PlanMarkup.squeeze(label.textContent ?? "")) ? label : undefined
  }

  /** The bold element paragraph `p` starts with (nothing significant before it), if any. */
  static boldLead(p: Element): Element | undefined {
    if (p.localName !== "p") return undefined
    const first = Array.from(p.childNodes).find(PlanMarkup.isSignificant)
    return PlanMarkup.isElement(first) && BOLD.test(first.localName) ? first : undefined
  }

  /**
   * Code accordion `accordion` (`ui-accordion.spell-code`) as `<epic-code>`:  a title of plain text, ONE `<pre>`
   * holding plain text or one `<code class="language-x">` of it.
   * - two `<pre>`s, a `<ui-code>`, markup in the code or the title:  `undefined`
   */
  static code(accordion: Element): CodeShape | undefined {
    if (!accordion.matches(ProseBlocks.code) || !hasOnly(accordion, ["class", "styled", "open"])) return undefined
    const panel = panelOf(accordion)
    const [pre, ...more] = panel ? significantChildren(panel.content) : []
    if (!panel || more.length || !PlanMarkup.isElement(pre) || pre.localName !== "pre" || pre.attributes.length)
      return undefined
    const inside = significantChildren(pre)
    const code = inside.length === 1 && PlanMarkup.isElement(inside[0]) ? inside[0] : undefined
    if (code && (code.localName !== "code" || code.children.length || !hasOnly(code, ["class"]))) return undefined
    if (!code && inside.some(PlanMarkup.isElement)) return undefined
    return {
      title: panel.title || undefined,
      language: LANGUAGE.exec(code?.getAttribute("class") ?? "")?.[1],
      open: accordion.hasAttribute("open"),
      text: code ?? pre
    }
  }

  /** Aside accordion `accordion` (`ui-accordion.spell-aside`) as `<epic-aside>`:  its title without `Aside: `. */
  static aside(accordion: Element): AsideShape | undefined {
    if (!accordion.matches(ProseBlocks.aside) || !hasOnly(accordion, ["class", "styled"])) return undefined
    const panel = panelOf(accordion)
    if (!panel) return undefined
    return {
      title: panel.title.replace(Drawn.asidePrefix, "") || undefined,
      titleBox: panel.titleBox,
      body: panel.content
    }
  }

  /**
   * Note `message` (`ui-message.plan-update`) as `<epic-note>`:  `UPDATE` / `DONE` its state, what follows ` · ` its
   * title.
   * - a bare `UPDATE` the script wrote for a phase (`data-phase="7"`, no title):  `phase`, for `<epic-update>`, the
   *   phase's marker (as the first pass maps it:  `isScriptUpdate()`)
   * - other headers (`DEFERRED`, `DECIDED`):  `undefined`
   */
  static note(message: Element): NoteShape | undefined {
    if (!message.matches(ProseBlocks.note) || !hasOnly(message, ["class", "state", "size", "header", "data-phase"]))
      return undefined
    if (Array.from(message.children).some((child) => child.hasAttribute("slot"))) return undefined
    const match = Drawn.noteHeader.exec(PlanMarkup.squeeze(message.getAttribute("header") ?? ""))
    if (!match) return undefined
    const state = match[1] === "DONE" ? "done" : "update"
    const phase = Number(message.getAttribute("data-phase") ?? NaN)
    if (state === "update" && !match[2] && Number.isInteger(phase) && phase > 0) return { state, phase }
    return { state, title: match[2] }
  }

  /**
   * Paragraph `p` as `<epic-field label>`:  its bold lead a labelled block's (`Where:`, `What should happen:`,
   * `Step 2:`), then either a sentence (`inline`) or, the label alone, the block after it (`block`).
   * - only while `<epic-field>` takes a `label` (p14-writers' content model):  else `undefined`, kept as prose
   */
  static labelledBlock(p: Element): LabelledShape | undefined {
    if (!Definitions.attribute("epic-field", "label") || p.attributes.length) return undefined
    const label = ProseShapes.boldLead(p)
    if (!label || label.children.length || label.attributes.length) return undefined
    const match = LABELLED_BLOCK.exec(PlanMarkup.squeeze(label.textContent ?? ""))
    if (!match) return undefined
    if (Array.from(p.childNodes).filter(PlanMarkup.isSignificant).length > 1)
      return { form: "inline", label, name: match[1]! }
    const block = nextElement(p)
    return block && BLOCK.test(block.localName) ? { form: "block", label, name: match[1]!, block } : undefined
  }

  /**
   * Option grid `grid` (`ui-grid.spell-pros-cons`) as `<epic-choices>`:  one card per column (`ui-column >
   * ui-segment`, or a bare `ui-segment`), each starting with its label, lettered (`A · Title (recommended)`).
   * - a card without a letter (a pros / cons grid), letters twice, two `(chosen)`:  `undefined`
   */
  static options(grid: Element): OptionCardShape[] | undefined {
    if (!grid.matches(ProseBlocks.grid)) return undefined
    const cards: OptionCardShape[] = []
    for (const column of significantChildren(grid)) {
      if (!PlanMarkup.isElement(column)) return undefined
      const [segment, ...more] = column.localName === "ui-segment" ? [column] : significantChildren(column)
      if (more.length || !PlanMarkup.isElement(segment) || segment.localName !== "ui-segment") return undefined
      const [label] = significantChildren(segment)
      if (!PlanMarkup.isElement(label) || label.localName !== "ui-label") return undefined
      const letter = Chrome.optionLetter.exec(edgeText(label, "first"))?.[1]
      if (!letter) return undefined
      const suffix = Drawn.optionSuffix.exec(edgeText(label, "last"))?.[1]?.toLowerCase()
      const chosen = suffix === "chosen" || column.hasAttribute("data-chosen")
      cards.push({ segment, label, letter, recommended: suffix === "recommended", chosen })
    }
    const letters = new Set(cards.map((card) => card.letter))
    if (!cards.length || letters.size !== cards.length || cards.filter((card) => card.chosen).length > 1)
      return undefined
    return cards
  }

  /** The card of `grid` (`options()`) whose label is `label`, if `label` is one. */
  static optionLabel(label: Element): OptionCardShape | undefined {
    const segment = label.parentElement
    const grid = segment?.parentElement?.matches(ProseBlocks.grid)
      ? segment.parentElement
      : segment?.parentElement?.parentElement
    if (!grid?.matches(ProseBlocks.grid)) return undefined
    return ProseShapes.options(grid)?.find((card) => card.label === label)
  }

  /**
   * Hand-written card `card` (`div.plan-answer-block`, `div.plan-reply`) as its element's tag, when its parent's
   * content model takes that element (`allows()`);  `undefined` where it doesn't (an `<epic-version>`).
   */
  static handCard(card: Element): "epic-answer" | "epic-reply" | undefined {
    const tag = card.matches(ProseBlocks.answer)
      ? "epic-answer"
      : card.matches(ProseBlocks.reply)
        ? "epic-reply"
        : undefined
    return tag && card.parentElement && ProseShapes.allows(card.parentElement, tag) ? tag : undefined
  }

  /** Does `parent`'s content model take a `<tag>` child (in its default slot)? */
  static allows(parent: Element, tag: EpicTag): boolean {
    const vocabulary = Definitions.of(parent.localName)
    return !!vocabulary && MarkupCheck.childSpecs(vocabulary, parent).some((spec) => spec.tag === tag && !spec.slot)
  }
}

/** A Net effect paragraph, read (`ProseShapes.netEffect()`). */
export type NetEffectShape = {
  /** `list`:  the label alone, its list after it;  `inline`:  the label, then the rest of the paragraph. */
  form: "list" | "inline"
  /** The bold label. */
  label: Element
  /** `list`:  the list after the paragraph. */
  list?: Element
  /** The option it's the net effect of (`A`). */
  option?: string
  /** That option is the recommended one (or, with no option, it's the recommended one's). */
  recommended: boolean
}

/** A code accordion, read (`ProseShapes.code()`). */
export type CodeShape = {
  title?: string
  /** From the `<code>`'s `language-x` class. */
  language?: string
  /** The accordion started open (`open="0"`). */
  open: boolean
  /** The element whose children are the code's text:  the `<code>`, or the `<pre>`. */
  text: Element
}

/** An aside accordion, read (`ProseShapes.aside()`). */
export type AsideShape = { title?: string; titleBox: Element; body: Element }

/** A hand-written note, read (`ProseShapes.note()`). */
export type NoteShape = { state: "update" | "done"; title?: string; phase?: number }

/** A labelled block, read (`ProseShapes.labelledBlock()`). */
export type LabelledShape = {
  /** `inline`:  the label, then the rest of the paragraph;  `block`:  the label alone, its block after it. */
  form: "inline" | "block"
  /** The bold label. */
  label: Element
  /** The label's text without its colon:  `<epic-field label>`. */
  name: string
  /** `block`:  the block after the paragraph. */
  block?: Element
}

/** One card of an option grid, read (`ProseShapes.options()`). */
export type OptionCardShape = {
  /** The card:  its label, then its body. */
  segment: Element
  /** Its top label:  `A · Title (recommended)`. */
  label: Element
  letter: string
  recommended: boolean
  /** ` (chosen)` after its title, or `data-chosen` on its column. */
  chosen: boolean
}

/** Bold elements a label is written in. */
const BOLD = /^(b|strong)$/

/** List elements a Net effect's list is. */
const LIST = /^(ul|ol)$/

/** The block a labelled block's label stands over, alone on its line. */
const BLOCK = /^(ul|ol|p|pre)$/

/** A `<code>`'s language class:  `language-ts`. */
const LANGUAGE = /(?:^|\s)language-(\S+)/

/** `element`'s children that are elements or non-blank text. */
function significantChildren(element: Element): ChildNode[] {
  return Array.from(element.childNodes).filter(PlanMarkup.isSignificant)
}

/** Does `element` carry no attribute but `names`? */
function hasOnly(element: Element, names: string[]): boolean {
  return Array.from(element.attributes).every((attribute) => names.includes(attribute.name))
}

/** The element after `node`, past blank text and comments;  `undefined` when text comes first, or nothing. */
function nextElement(node: Node): Element | undefined {
  for (let next = node.nextSibling; next; next = next.nextSibling) {
    if (PlanMarkup.isElement(next)) return next
    if (next.nodeType === TEXT_NODE && !PlanMarkup.isBlank(next)) return undefined
  }
  return undefined
}

/**
 * An accordion's one panel:  its `<ui-title>` of plain text, then its `<ui-content>`, neither with attributes;
 * `undefined` for any other shape.
 */
function panelOf(accordion: Element): { titleBox: Element; title: string; content: Element } | undefined {
  const [titleBox, content, ...more] = significantChildren(accordion)
  if (more.length || !PlanMarkup.isElement(titleBox) || !PlanMarkup.isElement(content)) return undefined
  if (titleBox.localName !== "ui-title" || content.localName !== "ui-content") return undefined
  if (titleBox.attributes.length || titleBox.children.length || content.attributes.length) return undefined
  return { titleBox, title: PlanMarkup.squeeze(titleBox.textContent ?? ""), content }
}

/**
 * The text run at `element`'s `first` or `last` edge:  its leading (trailing) text children, joined;  `""` when an
 * element sits at that edge.  As the proof's reading strips chrome from those runs.
 */
function edgeText(element: Element, edge: "first" | "last"): string {
  const nodes = Array.from(element.childNodes)
  if (edge === "last") nodes.reverse()
  const run: string[] = []
  for (const node of nodes) {
    if (node.nodeType !== TEXT_NODE) break
    run.push((node as Text).data)
  }
  if (edge === "last") run.reverse()
  return run.join("")
}
