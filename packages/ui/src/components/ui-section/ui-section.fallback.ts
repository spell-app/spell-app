import { Converters, NativeFallback, PartContext, proto, UIT } from "$/ui/core"

import { sectionVocabulary } from "./ui-section.vocabulary.en"
import { sectionsVocabulary } from "./ui-sections.vocabulary.en"
import {
  ACTIONS,
  BADGE,
  CONTENT,
  CONTENT_ID,
  FOLD_ICON_CLASS,
  HEADER,
  HEADING,
  HEADING_TAG,
  HEIGHT_PROPERTY,
  MAX_LEVEL,
  SCROLLING,
  STATIC_TOGGLE_TAG,
  STICK_TOP_PROPERTY,
  SUBHEAD,
  TITLE,
  TOGGLE,
  TOP_LEVEL,
  UNTIL_FOUND
} from "./ui-section.types"

/****************
 * ### `SectionFallback`
 * The element's markup, plain DOM:  `<section part="section" class="ui ... section">`, its title bar
 * (`<header class="title">` > `<hN class="heading">` > toggle, then the badge and actions), the subhead, then
 * `<div class="content">` around the slot.
 * - Folding still works:  a collapsible title is a real `<button>` that fires the cancelable `ui-open` /
 *   `ui-close`, then flips `hidden="until-found"` on the content and the host's `collapsed`;  find-in-page unfolds
 *   a match (`beforematch`), announcing `ui-open`.
 * - Sticking still works for a top-level section (CSS, at its `offset`);  nested titles don't stack.
 * - Without its own `collapsible`, folds when its nearest `<ui-sections>` is `collapsing` (read once, as the rest).
 * - Read once:  later attribute or child changes (`collapsed` set by the page, a new badge) don't re-render it.
 ****************/
export class SectionFallback extends NativeFallback<typeof sectionVocabulary> {
  @proto static vocabulary = sectionVocabulary
  @proto static degraded = [
    "the `icon` glyph and the fold chevron (a `▾` stands in)",
    "nested sticky titles stacking below their parent's",
    "`:state(collapsed)`, `:state(stuck)`, `:state(in-section)`, `:state(animated)` and the fold animation",
    "translated `loading` text and `fold` / `unfold` tooltips (English)",
    "later changes to the host's attributes and slotted children (read once)"
  ]

  /** The fold button, while `collapsible`. */
  private toggle: HTMLButtonElement | undefined

  protected override build() {
    const height = this.attr("height")
    const scrolls = !!height || this.host.hasAttribute("scrolling")
    const content = this.create(
      "div",
      {
        id: CONTENT_ID,
        class: CONTENT,
        part: CONTENT,
        // a scroll box is a tab stop, so the keyboard can scroll it
        tabindex: scrolls ? "0" : null,
        style: height ? `${HEIGHT_PROPERTY}: ${height}` : null
      },
      this.slot()
    )
    // `height` implies `scrolling`, after the noun as the element has it
    const extra = height && !this.host.hasAttribute("scrolling") ? SCROLLING : undefined
    const section = this.create("section", { class: this.classes(extra) }, this.title(content))
    const subhead = this.attr("subhead")
    if (subhead || this.slotted("subhead")) {
      section.append(this.create("div", { class: SUBHEAD, part: SUBHEAD }, this.named("subhead", subhead)))
    }
    section.append(content)
    if (this.flag("loading")) {
      section.append(this.create("span", { class: UIT.VISUALLY_HIDDEN, role: UIT.STATUS }, this.text("loading")))
    }
    if (this.toggle) this.fold(this.toggle, content, this.flag("collapsed"))
    return [this.decorate(section, "section")]
  }

  ////////////////
  // ## Title bar
  ////////////////

  /** `<header class="title">`:  the heading around the toggle, then the badge and actions boxes when used. */
  private title(content: HTMLElement): HTMLElement {
    // the host's own attribute wins (`"false"` included), else its group's default
    const collapsible =
      this.attr("collapsible") === null ? SectionFallback.inCollapsing(this.host) : this.flag("collapsible")
    const inner: Node[] = []
    if (collapsible) {
      inner.push(this.create("span", { class: FOLD_ICON_CLASS, part: "fold-icon", "aria-hidden": UIT.TRUE }, "▾"))
    }
    const icon = this.attr("icon")
    if (icon || this.slotted("icon"))
      inner.push(this.create("span", { class: "icon", part: "icon" }, this.named("icon")))
    inner.push(this.create("span", { class: HEADER, part: HEADER }, this.named("header", this.attr("header"))))
    const attributes = { class: TOGGLE, part: TOGGLE }
    if (collapsible) {
      const disabled = this.flag("disabled")
      this.toggle = this.create(
        "button",
        { ...attributes, type: "button", "aria-controls": content.id, disabled },
        ...inner
      )
    }
    const toggle = this.toggle ?? this.create(STATIC_TOGGLE_TAG, attributes, ...inner)
    const level = SectionFallback.levelOf(this.host)
    const heading = this.create(`${HEADING_TAG}${level}` as "h2", { class: HEADING, part: HEADING }, toggle)
    const offset = Number(this.attr("offset")) || 0
    const title = this.create(
      "header",
      { class: TITLE, part: TITLE, style: `${STICK_TOP_PROPERTY}: ${offset}px` },
      heading
    )
    const badge = this.attr("badge")
    if (badge || this.slotted("badge"))
      title.append(this.create("span", { class: BADGE, part: BADGE }, this.named("badge", badge)))
    if (this.slotted("actions"))
      title.append(this.create("span", { class: ACTIONS, part: ACTIONS }, this.named("actions")))
    return title
  }

  /** A named `<slot>`, with `text` shown while nothing is slotted. */
  private named(name: string, text?: string | null): HTMLSlotElement {
    const slot = this.slot(text)
    slot.name = name
    return slot
  }

  /** Whether the host has a light-DOM child in slot `name`. */
  private slotted(name: string): boolean {
    return [...this.host.children].some((child) => child.slot === name)
  }

  ////////////////
  // ## Folding
  ////////////////

  /**
   * Wire the toggle:  a click (Enter / Space are the button's own) asks first, then folds or unfolds.
   * - SIDE EFFECT:  sets / removes the host's `collapsed`, so the page reads the state the user chose.
   */
  private fold(button: HTMLButtonElement, content: HTMLElement, collapsed: boolean) {
    this.show(button, content, !collapsed)
    this.listen<MouseEvent>(button, "click", (event) => {
      // NOT `content.hidden`:  that reads `"until-found"`, a string
      const open = content.hasAttribute("hidden")
      if (this.announce(open, event, true)) this.show(button, content, open)
    })
    this.listen(content, "beforematch", () => {
      this.announce(true, undefined, false)
      this.show(button, content, true)
    })
  }

  /** Show / hide the content, keeping the button's `aria-expanded` and tooltip and the host's `collapsed` in step. */
  private show(button: HTMLButtonElement, content: HTMLElement, open: boolean) {
    if (open) content.removeAttribute("hidden")
    else content.setAttribute("hidden", UNTIL_FOUND)
    button.setAttribute("aria-expanded", String(open))
    button.title = this.text(open ? "fold" : "unfold")
    if (this.host.hasAttribute("collapsed") === open) this.host.toggleAttribute("collapsed", !open)
  }

  /** Dispatch `ui-open` / `ui-close` from the host;  `false` when a handler cancelled it. */
  private announce(open: boolean, originalEvent: Event | undefined, cancelable: boolean): boolean {
    const [opened, closed] = this.vocabulary.events
    const detail: UIT.SectionToggleDetail = { open, section: this.host, originalEvent }
    const init = { bubbles: true, composed: true, cancelable, detail }
    return this.host.dispatchEvent(new CustomEvent((open ? opened : closed).name, init))
  }

  /** The vocabulary's English text for `key`. */
  private text(key: (typeof sectionVocabulary)["texts"][number]["key"]): string {
    return this.vocabulary.texts.find((text) => text.key === key)!.text
  }

  ////////////////
  // ## Group
  ////////////////

  /**
   * Is `host`'s nearest `<ui-sections>` group (around it, or around an enclosing section) `collapsing`?
   * - The climb every section's `PartContext` makes (defined owners of `section` parts, by tag, translated tags
   *   included), read once:  a group answers, an enclosing section passes the question up.
   * - The group's `collapsing` is read by its English name, as every fallback reads attributes.
   */
  private static inCollapsing(host: Element): boolean {
    const match = PartContext.ownerOf(host, sectionVocabulary.noun, PartContext.noBarrier)
    if (!match) return false
    if (match.ownerNoun !== sectionsVocabulary.noun) return SectionFallback.inCollapsing(match.owner)
    const [collapsing] = sectionsVocabulary.attributes
    return Converters.boolean(match.owner.getAttribute(collapsing.name), collapsing.name)
  }

  ////////////////
  // ## Level
  ////////////////

  /**
   * Heading level of `host`:  its valid `level`, else the enclosing section's level + 1 (at most `h6`), else 2.
   * - An enclosing section is an ancestor with the host's own tag (a translated tag nests in itself).
   * - Light DOM only:  a section slotted through another component's shadow root still counts, one inside a
   *   shadow root doesn't.
   */
  private static levelOf(host: Element): number {
    const level = Number(host.getAttribute("level"))
    if (Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL) return level
    const parent = host.parentElement?.closest(host.localName)
    return parent ? Math.min(SectionFallback.levelOf(parent) + 1, MAX_LEVEL) : TOP_LEVEL
  }
}
