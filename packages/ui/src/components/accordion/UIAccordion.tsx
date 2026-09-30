import { For, createMemo, untrack, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, PartContext, proto, UI, UIElement, type AccordionPanel, type AccordionToggleDetail } from "$/core"

import { accordionVocabulary } from "./accordion.vocabulary.en"
import { AccordionFallback } from "./accordion.fallback"
import { AccordionPanels } from "./AccordionPanels"

import accordionCSS from "./accordion.css?inline"

/****************
 * ### `<ui-accordion>`
 * Panels of content under titles, on NATIVE `<details>`:  the light children come in pairs -- a `<ui-title>` and
 * the element after it (usually a `<ui-content>`), Fomantic's `.title` + `.content` -- and the shadow root wraps
 * each pair in `<details part="panel"><summary class="title">` + `<div class="content">`, handing the two children
 * to that panel's `<slot>`s by hand (`slotAssignment: "manual"`).
 * - Why `<details>`:  the platform does the disclosure -- `<summary>` is a focusable button that announces its
 *   expanded state, Enter / Space toggle it, find-in-page opens a closed panel, and every `<details>` shares ONE
 *   `name` while `exclusive`, so the browser closes the others (all panels live in this one shadow root, the
 *   `name` group's scope).  Plain HTML with the same classes works without JS (see `accordion.css`).
 * - `open` (panel indexes) is auto-controlled:  a click on a title is intercepted (`preventDefault()` stops the
 *   native toggle), the cancelable `ui-open` / `ui-close` go first, then `open` changes and the `<details>` follow.
 *   A change the browser makes itself (find-in-page) is announced after the fact and adopted.
 * - Keyboard:  Tab between titles;  Enter / Space toggle (native);  ArrowDown / ArrowUp / Home / End move between
 *   this accordion's titles (APG's optional keys).
 * - Nested:  a `<ui-accordion>` inside another (`PartContext`, `:state(in-accordion)`) renders Fomantic's
 *   `accordion` without `ui` and inherits its parent's look through the `--_ui-accordion-*` aliases.
 * - Animated when `UI.browser.supports.interpolateSize` (`:state(animated)`):  `::details-content` grows to
 *   `auto` height;  under `prefers-reduced-motion` the CSS drops the transition.
 * - SIDE EFFECT:  watches its own child list (a `MutationObserver`) to re-pair titles and contents.
 ****************/
export class UIAccordion extends UIElement<typeof accordionVocabulary> {
  @proto static vocabulary = accordionVocabulary
  @proto static styles = { accordion: accordionCSS }
  @proto static Fallback = AccordionFallback
  @proto static slotAssignment: SlotAssignmentMode = "manual"

  /** Owning accordion, when nested. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  /** `open` (panel indexes as text):  host-controlled, or internal. */
  readonly openState = this.controlled("open", undefined)

  /** Title + content pairs from the light children. */
  readonly panels = new Cell<readonly AccordionPanel[]>(
    isServer ? [] : AccordionPanels.read(this.host, UIAccordion.isTitle),
    { equals: AccordionPanels.same }
  )

  ////////////////
  // ## Derived state
  ////////////////

  /** Inside another accordion:  no `ui`, the parent's look. */
  readonly nested = createMemo(() => !!this.context.owner.get())

  /** Open panel indexes (only the first while `exclusive`). */
  readonly openIndexes = createMemo(() => AccordionPanels.parse(this.openState.get(), this.attrs.exclusive))

  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    if (isServer) return
    const { host } = this
    const observer = new MutationObserver(() => this.readPanels())
    observer.observe(host, { childList: true })
    host.addReleaseCallback(() => observer.disconnect())
  }

  /** Is panel `index` open?  Tracked. */
  isOpen(index: number): boolean {
    return this.openIndexes().includes(index)
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected hostStates() {
    return {
      open: this.openIndexes().some((index) => index < this.panels.get().length),
      animated: this.loaded() && UI.browser.supports.interpolateSize
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass()} part={this.part("accordion")} onKeyDown={this.onKeyDown}>
        <For each={this.panels.get()}>{(panel, index) => this.renderPanel(panel, index)}</For>
      </div>
    )
  }

  /** Root classes:  the class grammar;  nested, without `ui` (Fomantic's `.ui.accordion .accordion`). */
  private rootClass(): string {
    const classes = this.classes()
    return this.nested() ? classes.replace(UI_WORD, "") : classes
  }

  /** One panel:  `<details>` > `<summary class="title">` + `<div class="content">`, each around its child. */
  private renderPanel(panel: AccordionPanel, index: Accessor<number>): JSX.Element {
    const open = () => this.isOpen(index())
    return (
      <details
        part={this.part("panel")}
        name={this.attrs.exclusive ? GROUP : undefined}
        open={open()}
        onToggle={(event: Event) => this.onToggle(event)}
      >
        <summary
          class={open() ? ACTIVE_TITLE : TITLE}
          part={this.part("title")}
          onClick={(event: MouseEvent) => this.onTitleClick(index(), event)}
        >
          <span class={ICON} part={this.part("icon")} aria-hidden="true" />
          <slot ref={(slot: HTMLSlotElement) => slot.assign(panel.title)} />
        </summary>
        <div class={open() ? ACTIVE_CONTENT : CONTENT} part={this.part("content")}>
          {panel.content ? <slot ref={(slot: HTMLSlotElement) => slot.assign(panel.content!)} /> : undefined}
        </div>
      </details>
    )
  }

  ////////////////
  // ## Transitions
  ////////////////

  /**
   * Open or close panel `index` as the user would:  the cancelable `ui-open` / `ui-close` first (an `exclusive`
   * open also closes the open panel, announcing it), then `open`.  True when applied.
   * - A `collapsible="no"` accordion never closes its open panel this way.
   */
  toggle(index: number, originalEvent?: Event): boolean {
    const current = untrack(this.openIndexes)
    const exclusive = untrack(() => this.attrs.exclusive)
    const opening = !current.includes(index)
    if (!opening && !untrack(() => this.attrs.collapsible)) return false
    const closing = opening ? (exclusive ? current : []) : [index]
    const next = opening ? (exclusive ? [index] : [...current, index]) : current.filter((open) => open !== index)
    return this.openState.request(AccordionPanels.format(next.sort((a, b) => a - b)), () => {
      if (opening && !this.emit("ui-open", this.detail(index, true, originalEvent))) return false
      return closing.every((closed) => this.emit("ui-close", this.detail(closed, false, originalEvent)))
    })
  }

  /** `detail` of `ui-open` / `ui-close` for panel `index`. */
  private detail(index: number, open: boolean, originalEvent?: Event): AccordionToggleDetail {
    const panel = untrack(this.panels.get)[index]
    return { index, open, title: panel?.title as Element, content: panel?.content, originalEvent }
  }

  ////////////////
  // ## Handlers
  ////////////////

  /**
   * A click on a title (Enter / Space on the focused `<summary>` click it too):  stop the native toggle and go
   * through `toggle()`.
   * - A click on something interactive INSIDE the title (a link, a button) is left alone, as the native `<summary>`
   *   would.
   */
  private onTitleClick(index: number, event: MouseEvent) {
    if (UIAccordion.fromControl(event)) return
    event.preventDefault()
    this.toggle(index, event)
  }

  /**
   * A `<details>` toggled:  when the browser did it (find-in-page opening a closed panel, the `name` group closing
   * one), announce and adopt the DOM's open set;  our own writes already match it.
   */
  private onToggle(event: Event) {
    const root = (event.currentTarget as Element).parentElement
    if (!root) return
    const panels = [...root.children].filter(
      (child): child is HTMLDetailsElement => child instanceof HTMLDetailsElement
    )
    const now = panels.flatMap((details, index) => (details.open ? [index] : []))
    const before = untrack(this.openIndexes)
    if (AccordionPanels.format(now) === AccordionPanels.format(before)) return
    for (const index of now) if (!before.includes(index)) this.emit("ui-open", this.detail(index, true, event))
    for (const index of before) if (!now.includes(index)) this.emit("ui-close", this.detail(index, false, event))
    this.openState.set(AccordionPanels.format(now))
  }

  /** ArrowDown / ArrowUp / Home / End on a title:  focus another title of THIS accordion. */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.defaultPrevented) return
    const root = event.currentTarget as HTMLElement
    const titles = [...root.querySelectorAll<HTMLElement>(TITLE_SELECTOR)]
    const from = titles.indexOf(event.composedPath()[0] as HTMLElement)
    if (from < 0) return
    const last = titles.length - 1
    const to =
      event.key === ARROW_DOWN
        ? (from + 1) % titles.length
        : event.key === ARROW_UP
          ? (from + last) % titles.length
          : event.key === HOME
            ? 0
            : event.key === END
              ? last
              : undefined
    if (to === undefined) return
    event.preventDefault()
    titles[to]!.focus()
  }

  /** Panels come from the children again (a child was added, removed or moved). */
  private readPanels() {
    this.panels.set(AccordionPanels.read(this.host, UIAccordion.isTitle, untrack(this.panels.get)))
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A title child:  an element DEFINED with the `title` part noun (`<ui-title>`, or its translated tag). */
  private static isTitle(element: Element): boolean {
    return UIElement.definitions.get(element.localName)?.vocabulary.noun === TITLE_NOUN
  }

  /** Did the click land on a control inside the title (before reaching the `<summary>`)? */
  private static fromControl(event: Event): boolean {
    for (const target of event.composedPath()) {
      if (!(target instanceof Element)) continue
      if (target.localName === SUMMARY) return false
      if (target.matches(CONTROLS)) return true
    }
    return false
  }
}

/** Noun a title child is defined with (`parts.vocabulary.en.ts`:  another family, not imported). */
const TITLE_NOUN = "title"

/** The shared `name` of an exclusive accordion's `<details>`:  scoped to this shadow root, so a constant. */
const GROUP = "panels"

/** Class words (Fomantic's grammar). */
const TITLE = "title"
const ACTIVE_TITLE = "active title"
const CONTENT = "content"
const ACTIVE_CONTENT = "active content"
const ICON = "dropdown icon"

/** Leading `ui` of the class string, dropped when nested. */
const UI_WORD = /^ui /

/** The title elements, for arrow-key moves. */
const SUMMARY = "summary"
const TITLE_SELECTOR = ":scope > details > summary"

/** What counts as a control inside a title. */
const CONTROLS = "a[href], button, input, select, textarea, label, [contenteditable], [tabindex]"

/** Keys. */
const ARROW_DOWN = "ArrowDown"
const ARROW_UP = "ArrowUp"
const HOME = "Home"
const END = "End"
