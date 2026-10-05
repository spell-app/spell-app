import { For, Show, createEffect, createMemo, untrack, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  PartContext,
  proto,
  SOURCE_FAILURE_KEYS,
  SourceBody,
  SourceBodyHost,
  UI,
  UIElement,
  UIT
} from "$/ui/core"

import { accordionVocabulary } from "./ui-accordion.vocabulary.en"
import { AccordionFallback } from "./ui-accordion.fallback"
import { AccordionPanels } from "./AccordionPanels"
import {
  ACTIVE_CONTENT,
  ACTIVE_TITLE,
  ARROW_UP,
  CONTENT_PART,
  CONTENT_TAG,
  CONTROLS,
  DROPDOWN_ICON,
  END,
  GROUP,
  HOME,
  SLOT_ATTRIBUTE,
  SOURCE_ERROR,
  SOURCE_PANEL,
  SUMMARY,
  TITLE,
  TITLE_NOUN,
  TITLE_PART,
  TITLE_SELECTOR,
  UI_WORD
} from "./ui-accordion.types"

import accordionCSS from "./ui-accordion.css?inline"

/****************
 * ### `<ui-accordion>`
 * Panels of content under titles, on NATIVE `<details>`:  the light children come in pairs -- a `<ui-title>` and
 * the element after it (usually a `<ui-content>`), Fomantic's `.title` + `.content` -- and the shadow root wraps
 * each pair in `<details part="panel"><summary class="title">` + `<div class="content">`, handing the two children
 * to that panel's `<slot>`s by hand (`slotAssignment: "manual"`).
 * - Why `<details>`:  the platform does the disclosure -- `<summary>` is a focusable button that announces its
 *   expanded state, Enter / Space toggle it, find-in-page opens a closed panel, and every `<details>` shares ONE
 *   `name` while `exclusive`, so the browser closes the others (all panels live in this one shadow root, the
 *   `name` group's scope).  Plain HTML with the same classes works without JS (see `ui-accordion.css`).
 * - `open` (panel indexes) is auto-controlled:  a click on a title is intercepted (`preventDefault()` stops the
 *   native toggle), the cancelable `ui-open` / `ui-close` go first, then `open` changes and the `<details>` follow.
 *   A change the browser makes itself (find-in-page) is announced after the fact and adopted.
 * - Keyboard:  Tab between titles;  Enter / Space toggle (native);  ArrowDown / ArrowUp / Home / End move between
 *   this accordion's titles (APG's optional keys).
 * - Nested:  a `<ui-accordion>` inside another (`PartContext`, `:state(in-accordion)`) renders Fomantic's
 *   `accordion` without `ui` and inherits its parent's look through the `--_ui-accordion-*` aliases.
 * - Animated when `UI.browser.supports.interpolateSize` (`:state(animated)`):  `::details-content` grows to
 *   `auto` height;  under `prefers-reduced-motion` the CSS drops the transition.
 * - Source (`source`, `select`):  the FIRST panel's content comes from a file the first time it opens (or at once
 *   when it starts open), through `SourceBody`:  into that panel's content child, a `<ui-content>` made after the
 *   title when there's none;  its children are the placeholder.  The `<details>` stays closed while the body is on
 *   its way (`veiled()`, at most `SOURCE_BODY_HOLD_MS`), so it opens on the body.  `load()` / `reload()` on the host
 *   (`SourceBodyHost`);  `:state(loading)`, `:state(loaded)`, `:state(error)`.
 * - SIDE EFFECT:  watches its own child list (a `MutationObserver`) to re-pair titles and contents.
 * - SIDE EFFECT:  with `source`, may add a `<ui-content>` child, and replaces its children with the file's body.
 ****************/
export class UIAccordion extends UIElement<typeof accordionVocabulary> {
  @proto static vocabulary = accordionVocabulary
  @proto static styles = { accordion: accordionCSS }
  @proto static Fallback = AccordionFallback
  @proto static Host = SourceBodyHost
  @proto static slotAssignment: SlotAssignmentMode = "manual"

  /** Owning accordion, when nested. */
  readonly context = new PartContext(this.host, this.vocabulary.noun)

  /** `open` (panel indexes as text):  host-controlled, or internal. */
  readonly openState = this.controlled("open", undefined)

  /** Title + content pairs from the light children. */
  readonly panels = new Cell<readonly UIT.AccordionPanel[]>(AccordionPanels.read(this.host, UIAccordion.isTitle), {
    equals: AccordionPanels.same
  })

  /**
   * `name` of an exclusive accordion's `<details>`.
   * - A server render (`$/ui/server`) puts every accordion in ONE light DOM, where a `name` groups the whole page:
   *   a page-unique name there, so two exclusive accordions don't close each other.
   */
  readonly group = isServer ? UI.ids.next(GROUP) : GROUP

  /** The first panel's content from `source`, loaded when it first opens. */
  readonly body = new SourceBody({
    host: this.host,
    source: () => untrack(() => this.attrs.source) || undefined,
    select: () => untrack(() => this.attrs.select) || undefined,
    target: () => this.bodyTarget(),
    emit: (name, detail) => this.emit(name as never, detail)
  })

  ////////////////
  // ## Derived state
  ////////////////

  /** Inside another accordion:  no `ui`, the parent's look. */
  readonly nested = createMemo(() => !!this.context.owner.get())

  /** Open panel indexes (only the first while `exclusive`). */
  readonly openIndexes = createMemo(() => AccordionPanels.parse(this.openState.get(), this.attrs.exclusive))

  /** The `source` panel's `<details>` held closed while its body is on its way (never in a server render). */
  readonly veiled = createMemo(() => !isServer && !!this.attrs.source && this.body.veiled())

  /** The error line's text, when the `source` body failed;  else `undefined`. */
  readonly bodyFailureText = createMemo(() => {
    const failure = this.body.failure.get()
    if (!failure) return undefined
    const key = SOURCE_FAILURE_KEYS[failure.kind] ?? SOURCE_FAILURE_KEYS.load
    return this.text(key as never, { source: this.attrs.source ?? "" })
  })

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
    const status = this.body.status.get()
    return {
      open: this.openIndexes().some((index) => index < this.panels.get().length),
      animated: this.loaded() && UI.browser.supports.interpolateSize,
      loading: status === "loading",
      loaded: status === "loaded",
      error: status === "error"
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Load the `source` body whenever its panel is open and the accordion connected, then render. */
  mount(): JSX.Element {
    if (!isServer) {
      createEffect(
        () => ({ source: this.attrs.source, open: this.isOpen(SOURCE_PANEL), connected: this.connected.get() }),
        ({ source, open, connected }) => {
          if (source && open && connected) this.body.load().catch(() => undefined)
        }
      )
    }
    return super.mount()
  }

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
  private renderPanel(panel: UIT.AccordionPanel, index: Accessor<number>): JSX.Element {
    const open = () => this.isOpen(index())
    const source = () => index() === SOURCE_PANEL && !!this.attrs.source
    return (
      <details
        part={this.part("panel")}
        name={this.attrs.exclusive ? this.group : undefined}
        open={open() && !(source() && this.veiled())}
        onToggle={(event: Event) => this.onToggle(event)}
      >
        <summary
          class={open() ? ACTIVE_TITLE : TITLE}
          part={this.part("title")}
          onClick={(event: MouseEvent) => this.onTitleClick(index(), event)}
        >
          <span class={DROPDOWN_ICON} part={this.part("icon")} aria-hidden="true" />
          {this.panelSlot(panel.title, index, TITLE_PART)}
        </summary>
        <div class={open() ? ACTIVE_CONTENT : UIT.CONTENT} part={this.part("content")}>
          <Show when={source() && this.bodyFailureText()}>
            <p class={SOURCE_ERROR} part={this.part("error")} role={UIT.ALERT}>
              {this.bodyFailureText()}
            </p>
          </Show>
          {panel.content ? this.panelSlot(panel.content, index, CONTENT_PART) : undefined}
        </div>
      </details>
    )
  }

  /**
   * The `<slot>` showing `child` (a panel's title or content):  assigned by hand in a browser.
   * - A server render can't assign by hand (no refs run, no shadow root):  the slot gets a NAME, and so does
   *   `child` (its `slot` attribute), which the flattener (`$/ui/server`) matches and then drops.
   * - SIDE EFFECT, server only:  sets `child`'s `slot` attribute (the render's own parsed copy of the page).
   */
  private panelSlot(child: Element, index: Accessor<number>, part: string): JSX.Element {
    if (!isServer) return <slot ref={(slot: HTMLSlotElement) => slot.assign(child)} />
    const name = `${part}-${untrack(index)}`
    child.setAttribute(SLOT_ATTRIBUTE, name)
    return <slot name={name} />
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
  private detail(index: number, open: boolean, originalEvent?: Event): UIT.AccordionToggleDetail {
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
    const before = untrack(this.openIndexes)
    // the `source` panel held closed for its body (`veiled()`) is open all the same
    const held = (index: number) => index === SOURCE_PANEL && before.includes(index) && untrack(this.veiled)
    const now = panels.flatMap((details, index) => (details.open || held(index) ? [index] : []))
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
      event.key === UIT.ARROW_DOWN
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

  ////////////////
  // ## Source (`SourceBodyHost`)
  ////////////////

  /** Fetch and insert the `source` body now, open or not;  once per `source` + `select`. */
  loadBody(): Promise<void> {
    return this.body.load()
  }

  /** Fetch the `source` body again past the cache, and replace it. */
  reloadBody(): Promise<void> {
    return this.body.reload()
  }

  /**
   * Where the `source` body goes:  the first title's content child, made (a `<ui-content>` right after the title)
   * when there's none.
   * - Read from the DOM, not `panels`:  the `MutationObserver` re-pairs on a microtask.
   * - Made only now, when the body arrives:  on first connect the parser may not have added the children yet.
   * - No title at all:  the host itself (nothing shows it:  only pairs are shown).
   */
  private bodyTarget(): Element {
    const title = [...this.host.children].find(UIAccordion.isTitle)
    if (!title) return this.host
    const next = title.nextElementSibling
    if (next && !UIAccordion.isTitle(next)) return next
    const content = this.host.ownerDocument.createElement(CONTENT_TAG)
    title.after(content)
    return content
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
