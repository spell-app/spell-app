import { E, UIT } from "$/ui/core"
import { sectionVocabulary } from "./ui-section.vocabulary.en"
import { sectionsVocabulary } from "./ui-sections.vocabulary.en"
import {
  ACTIONS,
  BADGE,
  BEFORE_MATCH,
  CONTENT_ID,
  FOLD_ICON_CLASS,
  FOLD_ICON_PART,
  FoldIconPlace,
  HEADING,
  HEADING_TAG,
  HEIGHT_PROPERTY,
  MAX_LEVEL,
  SCROLLING,
  STATIC_TOGGLE_TAG,
  STICK_TOP_PROPERTY,
  SUBHEAD,
  TIP,
  TIP_ID,
  TOGGLE,
  TOOLTIP,
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
export class SectionFallback extends E.NativeFallback<typeof sectionVocabulary> {
  @E.proto static vocabulary = sectionVocabulary
  @E.proto static degraded = [
    "the `icon` glyph and the fold chevron (a `▾` stands in)",
    "nested sticky titles stacking below their parent's",
    "`:state(collapsed)`, `:state(stuck)`, `:state(in-section)`, `:state(animated)` and the fold animation",
    "translated `loading` text and `fold` / `unfold` tooltips (English)",
    "later changes to the host's attributes and slotted children (read once)"
  ]

  /** The fold button, while `collapsible`. */
  private toggle: HTMLButtonElement | undefined

  /** The content box. */
  private content: HTMLElement | undefined

  /**
   * Where the fold chevron sits without a `fold-icon` attribute:  the controller's `defaultFoldIcon` (a subclass's,
   * `<ui-panel>`'s `end`), else `start` (no controller:  its constructor threw).
   */
  private get defaultFoldIcon(): FoldIconPlace {
    const { controller } = this.host as { controller?: { defaultFoldIcon?: FoldIconPlace } }
    return controller?.defaultFoldIcon ?? FoldIconPlace.start
  }

  protected override build() {
    const height = this.attr("height")
    const hasScrolling = this.attr("scrolling") !== null
    const content = this.create(
      "div",
      {
        id: CONTENT_ID,
        class: UIT.CONTENT,
        part: UIT.CONTENT,
        // a scroll box is a tab stop, so the keyboard can scroll it
        tabindex: height || hasScrolling ? "0" : undefined,
        style: height ? `${HEIGHT_PROPERTY}: ${height}` : undefined
      },
      this.slot()
    )
    this.content = content
    // `height` implies `scrolling`, after the noun as the element has it
    const extra = height && !hasScrolling ? SCROLLING : undefined
    const section = this.create("section", { class: this.classes(extra) }, this.title())
    const subhead = this.attr("subhead")
    if (subhead || this.slotted("subhead")) {
      section.append(this.create("div", { class: SUBHEAD, part: SUBHEAD }, this.named("subhead", subhead)))
    }
    section.append(content)
    if (this.flag("loading")) {
      section.append(this.create("span", { class: UIT.VISUALLY_HIDDEN, role: UIT.STATUS }, this.text("loading")))
    }
    if (this.toggle) this.fold(this.toggle, content)
    return [this.decorate(section, "section")]
  }

  ////////////////
  // ## Title bar
  ////////////////

  /** `<header class="title">`:  the heading around the toggle, then the badge and actions boxes when used. */
  private title(): HTMLElement {
    // the host's own attribute wins (`"false"` included), else its group's default
    const isCollapsible =
      this.attr("collapsible") === null ? SectionFallback.isInCollapsing(this.host) : this.flag("collapsible")
    const isAtEnd = (this.attr("fold-icon") ?? this.defaultFoldIcon) === FoldIconPlace.end
    const foldIcon = isCollapsible
      ? this.create("span", { class: FOLD_ICON_CLASS, part: FOLD_ICON_PART, "aria-hidden": UIT.TRUE }, FOLD_GLYPH)
      : undefined
    const info = this.attr("info")
    const hasInfo = !!info || this.slotted("info")
    const inner: Node[] = []
    if (foldIcon && !isAtEnd) inner.push(foldIcon)
    if (this.attr("icon") || this.slotted("icon")) {
      inner.push(this.create("span", { class: UIT.ICON, part: UIT.ICON }, this.named("icon")))
    }
    inner.push(this.create("span", { class: UIT.HEADER, part: UIT.HEADER }, this.named("header", this.attr("header"))))
    const attributes = { class: TOGGLE, part: TOGGLE }
    const described = hasInfo ? TIP_ID : undefined
    if (isCollapsible) {
      this.toggle = this.create(
        UIT.BUTTON,
        {
          ...attributes,
          type: UIT.BUTTON,
          "aria-controls": CONTENT_ID,
          "aria-describedby": described,
          disabled: this.flag("disabled")
        },
        ...inner
      )
    }
    const toggle = this.toggle ?? this.create(STATIC_TOGGLE_TAG, attributes, ...inner)
    const level = SectionFallback.levelFor(this.host)
    const heading = this.create(
      `${HEADING_TAG}${level}` as "h2",
      { class: HEADING, part: HEADING, "aria-describedby": isCollapsible ? undefined : described },
      toggle
    )
    const offset = Number(this.attr("offset")) || 0
    const title = this.create(
      "header",
      { class: UIT.TITLE, part: UIT.TITLE, style: `${STICK_TOP_PROPERTY}: ${offset}px` },
      heading
    )
    const badge = this.attr("badge")
    if (badge || this.slotted("badge")) {
      title.append(this.create("span", { class: BADGE, part: BADGE }, this.named("badge", badge)))
    }
    if (this.slotted("actions")) {
      title.append(this.create("span", { class: ACTIONS, part: ACTIONS }, this.named("actions")))
    }
    if (foldIcon && isAtEnd) {
      title.append(foldIcon)
      this.listen(foldIcon, UIT.CLICK, () => this.toggle?.click())
    }
    if (hasInfo) {
      title.append(this.create("span", { id: TIP_ID, class: TIP, part: TIP, role: TOOLTIP }, this.named("info", info)))
    }
    return title
  }

  /**
   * A named `<slot>`, with `text` shown while nothing is slotted.
   * - Takes `null`:  `text` is often `attr()`'s.
   */
  private named(name: SectionSlot, text?: string | null): HTMLSlotElement {
    const slot = this.slot(text)
    slot.name = name
    return slot
  }

  /** Whether the host has a light-DOM child in slot `name`. */
  private slotted(name: SectionSlot): boolean {
    return [...this.host.children].some((child) => child.slot === name)
  }

  ////////////////
  // ## Folding
  ////////////////

  /**
   * Wire the toggle:  a click (Enter / Space are the button's own) asks first, then folds or unfolds;  find-in-page
   * unfolds a match.
   * - SIDE EFFECT:  sets / removes the host's `collapsed`, so the page reads the state the person chose.
   */
  private fold(button: HTMLButtonElement, content: HTMLElement) {
    this.show({ open: !this.flag("collapsed") })
    this.listen<MouseEvent>(button, UIT.CLICK, (event) => {
      // NOT `content.hidden`:  that reads `"until-found"`, a string
      const open = content.hasAttribute(HIDDEN)
      if (this.announce({ open, originalEvent: event })) this.show({ open })
    })
    this.listen(content, BEFORE_MATCH, () => {
      this.announce({ open: true, isCancelable: false })
      this.show({ open: true })
    })
  }

  /** Show / hide the content, keeping the button's `aria-expanded` and tooltip and the host's `collapsed` in step. */
  private show({ open }: { open: boolean }) {
    const { toggle, content } = this
    if (!toggle || !content) return
    if (open) content.removeAttribute(HIDDEN)
    else content.setAttribute(HIDDEN, UNTIL_FOUND)
    toggle.setAttribute(UIT.ARIA_EXPANDED, String(open))
    toggle.title = this.text(open ? "fold" : "unfold")
    if (this.host.hasAttribute(COLLAPSED) === open) this.host.toggleAttribute(COLLAPSED, !open)
  }

  /** Dispatch `ui-open` / `ui-close` from the host;  `false` when a handler cancelled it. */
  private announce({ open, originalEvent, isCancelable = true }: AnnounceParams): boolean {
    const [opened, closed] = this.vocabulary.events
    const detail: UIT.SectionToggleDetail = { open, section: this.host, originalEvent }
    const init = { bubbles: true, composed: true, cancelable: isCancelable, detail }
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
   * - STATIC:  recurses on owners, not on this fallback's host.
   */
  private static isInCollapsing(host: Element): boolean {
    const match = E.PartContext.ownerFor(host, sectionVocabulary.noun, E.PartContext.noBarrier)
    if (!match) return false
    if (match.ownerNoun !== sectionsVocabulary.noun) return SectionFallback.isInCollapsing(match.owner)
    const [collapsing] = sectionsVocabulary.attributes
    return E.Converters.boolean(match.owner.getAttribute(collapsing.name), collapsing.name)
  }

  ////////////////
  // ## Level
  ////////////////

  /**
   * Heading level of `host`:  its valid `level`, else the enclosing section's level + 1 (at most `h6`), else 2.
   * - An enclosing section is an ancestor with the host's own tag (a translated tag nests in itself).
   * - Light DOM only:  a section slotted through another component's shadow root still counts, one inside a
   *   shadow root doesn't.
   * - STATIC:  recurses on ancestors, not on this fallback's host.
   */
  private static levelFor(host: Element): number {
    const level = Number(host.getAttribute(LEVEL))
    if (Number.isInteger(level) && level >= 1 && level <= MAX_LEVEL) return level
    const parent = host.parentElement?.closest(host.localName)
    return parent ? Math.min(SectionFallback.levelFor(parent) + 1, MAX_LEVEL) : TOP_LEVEL
  }
}

/** What `SectionFallback.announce()` dispatches. */
type AnnounceParams = {
  /** State the section is ABOUT to enter:  `true` unfolding. */
  open: boolean
  /** The click on the toggle;  none for find-in-page. */
  originalEvent?: Event
  /** Can a handler veto it?  Default `true`;  `false` after the fact (find-in-page has already revealed it). */
  isCancelable?: boolean
}

/** One of the section's slot names. */
type SectionSlot = (typeof sectionVocabulary)["slots"][number]["name"]

/** Stands in for the fold chevron's glyph:  no icon packs without the element. */
const FOLD_GLYPH = "▾"

/** Attribute that folds the content box:  `hidden="until-found"`. */
const HIDDEN = "hidden"

/** The host's attribute it keeps in step:  set while folded. */
const COLLAPSED = "collapsed"

/** The host's `level`, read on ancestors too (`levelFor()`). */
const LEVEL = "level"
