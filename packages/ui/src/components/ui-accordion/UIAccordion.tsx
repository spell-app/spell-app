import { For, Show, untrack, type Accessor } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { accordionVocabulary } from "./UIAccordion.en"
import { AccordionPanels } from "./AccordionPanels"

import accordionCSS from "./UIAccordion.css?inline"

/****************
 * ### `UIAccordion`
 * The component behind `<ui-accordion>`:  panels of content under titles, that open and close,
 * built on the browser's own `<details>`.
 *
 * - The light children come in PAIRS:  a `<ui-title>` and the element after it (usually a `<ui-content>`),
 *   as Fomantic's `.title` + `.content`.
 *   - The shadow DOM wraps each pair in `<details part="panel">`:
 *     `<summary class="title">` + `<div class="content">`, each with a `<slot>` for its child.
 *   - The component hands each child to its slot by hand
 *     (`elementSetup.slotAssignment` `"manual"`, the platform's).
 * - Why `<details>`:  the browser does the disclosure.
 *   - `<summary>` is a focusable button that announces its expanded state;  Enter / Space toggle it.
 *   - Find-in-page opens a closed panel.
 *   - While `exclusive`, every `<details>` shares ONE `name`, so the browser closes the others
 *     (all the panels live in this one shadow root, the `name` group's scope).
 *   - Plain HTML with the same classes works without JS (see `UIAccordion.css`).
 * - `open` (the open panels' indexes) is auto-controlled:
 *   - a click on a title is intercepted (`preventDefault()` stops the native toggle),
 *     the cancelable `ui-open` / `ui-close` go first, then `open` changes and the `<details>` follow
 *   - a change the browser makes itself (find-in-page) is announced after the fact, and adopted.
 * - Keyboard:  Tab between titles;  Enter / Space toggle (native);
 *   ArrowDown / ArrowUp / Home / End move between this accordion's titles (APG's optional keys).
 * - Nested:  a `<ui-accordion>` inside another (`PartContext`,
 *   `:state(in-accordion)`) draws Fomantic's `accordion` without `ui`, and inherits its parent's look through the
 *   `--_ui-accordion-*` aliases.
 * - Animated when `UI.browser.supports.interpolateSize` (`:state(animated)`):
 *   `::details-content` grows to `auto` height;  under `prefers-reduced-motion` the CSS drops the transition.
 * - *Source* (`source`, `select`):  the FIRST panel's content comes from a file
 *   the first time it opens (or at once, when it starts open), through `LoadableBody`.
 *   - It goes into that panel's content child:  a `<ui-content>` made after the title when there's none.
 *     Its children are the placeholder.
 *   - The `<details>` stays closed while the body is on its way (`isVeiled`, at most `SOURCE_BODY_HOLD_MS`),
 *     so it opens on the body.
 *   - The DOM element (`DOMLoadableBodyElement`) has `load()` / `reload()`;  states `loading`, `loaded`, `error`.
 * - SIDE EFFECTS:
 *   - watches its own child list (a `MutationObserver`), to pair the titles and contents again
 *   - with `source`:  may add a `<ui-content>` child, and replaces its children with the file's body.
 ****************/
export class UIAccordion extends E.UIComponent<typeof accordionVocabulary> {
  @E.proto static vocabulary = accordionVocabulary
  @E.proto static styleSheets = { accordion: accordionCSS }
  @E.proto static elementSetup = {
    DOMElement: E.DOMLoadableBodyElement,
    slotAssignment: "manual" as const
  } satisfies Partial<E.ElementSetup>

  constructor(...args: ConstructorParameters<typeof E.UIComponent>) {
    super(...args)
    if (isServer) return
    const { domElement } = this
    const observer = new MutationObserver(() => this.onChildrenChanged())
    observer.observe(domElement, { childList: true })
    domElement.addReleaseCallback(() => observer.disconnect())
  }

  ////////////////
  // ## Nesting
  ////////////////

  /** Owning accordion, when nested. */
  readonly context = new E.PartContext({ domElement: this.domElement, noun: this.vocabulary.noun })

  /** Inside another accordion:  no `ui`, the parent's look. */
  get isNested(): boolean {
    return !!this.context.owner
  }

  /** Nested, without `ui` (Fomantic's `.ui.accordion .accordion`). */
  get rootClass(): string {
    const value = super.rootClass
    return this.isNested ? value.replace(UI_WORD, "") : value
  }

  ////////////////
  // ## Panels
  ////////////////

  /** Title + content pairs from the light children. */
  @E.state({ equals: AccordionPanels.isSame })
  accessor panels: readonly UIT.AccordionPanel[] = AccordionPanels.read(this.domElement, UIAccordion.isTitle)

  /**
   * `name` of an exclusive accordion's `<details>`.
   * - A server render (`$/ui/static`) puts every accordion in ONE light DOM, where a `name` groups the whole page:
   *   a page-unique name there, so two exclusive accordions don't close each other.
   */
  readonly group = isServer ? UI.ids.next(DETAILS_GROUP) : DETAILS_GROUP

  /** A child was added, removed or moved:  pair the panels again. */
  private onChildrenChanged() {
    this.panels = AccordionPanels.read(this.domElement, UIAccordion.isTitle, this.panels)
  }

  ////////////////
  // ## Open panels
  ////////////////

  /** `open`:  the open panel indexes as TEXT (`"0 2"`);  the DOM element's attribute when written, else internal. */
  @E.controlled("open") accessor openText: string | undefined = undefined

  /** Open panel indexes (only the first while `exclusive`). */
  @E.derived
  get openIndexes(): number[] {
    return AccordionPanels.parse(this.openText, { exclusive: this.exclusive })
  }

  /** Is panel `index` open?  Tracked. */
  panelIsOpen(index: number): boolean {
    return this.openIndexes.includes(index)
  }

  /** At least one panel is open. */
  @E.cssState("open")
  get hasOpenPanel(): boolean {
    return this.openIndexes.some((index) => index < this.panels.length)
  }

  /**
   * Open or close panel `index` as people do:  the cancelable `ui-open` / `ui-close` first, then `open`.
   * - An `exclusive` open also closes the open panel, announcing it.
   * - A `collapsible="no"` accordion never closes its open panel this way.
   * - Returns true when applied.
   */
  toggle(index: number, originalEvent?: Event): boolean {
    const current = untrack(() => this.openIndexes)
    const exclusive = untrack(() => this.exclusive)
    const opening = !current.includes(index)
    if (!opening && !untrack(() => this.collapsible)) return false
    const closing = opening ? (exclusive ? current : []) : [index]
    const next = opening ? (exclusive ? [index] : [...current, index]) : current.filter((open) => open !== index)
    return this.requestChange("openText", AccordionPanels.format(next.sort((a, b) => a - b)), () => {
      if (opening && !this.send("ui-open", this.detail({ index, open: true, originalEvent }))) return false
      return closing.every((closed) =>
        this.send("ui-close", this.detail({ index: closed, open: false, originalEvent }))
      )
    })
  }

  /** `detail` of `ui-open` / `ui-close` for panel `index`:  its title and content added. */
  private detail({ index, open, originalEvent }: AccordionDetailParams): UIT.AccordionToggleDetail {
    const panel = untrack(() => this.panels)[index]
    return { index, open, title: panel?.title as Element, content: panel?.content, originalEvent }
  }

  /**
   * A click on a title (Enter / Space on the focused `<summary>` click it too):  stop the native toggle and go
   * through `toggle()`.
   * - A click on something interactive INSIDE the title (a link, a button) is left alone, as the native `<summary>`
   *   would.
   */
  private onTitleClick(index: number, event: MouseEvent) {
    if (UIT.TitleControls.isClicked(event, "summary")) return
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
    const before = untrack(() => this.openIndexes)
    // the `source` panel held closed for its body (`isVeiled`) is open all the same
    const held = (index: number) => index === SOURCE_PANEL && before.includes(index) && untrack(() => this.isVeiled)
    const now = panels.flatMap((details, index) => (details.open || held(index) ? [index] : []))
    if (AccordionPanels.format(now) === AccordionPanels.format(before)) return
    for (const index of now) {
      if (!before.includes(index)) this.send("ui-open", this.detail({ index, open: true, originalEvent: event }))
    }
    for (const index of before) {
      if (!now.includes(index)) this.send("ui-close", this.detail({ index, open: false, originalEvent: event }))
    }
    this.openText = AccordionPanels.format(now)
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
      event.key === UIT.Key.arrowDown
        ? (from + 1) % titles.length
        : event.key === UIT.Key.arrowUp
          ? (from + last) % titles.length
          : event.key === UIT.Key.home
            ? 0
            : event.key === UIT.Key.end
              ? last
              : undefined
    if (to === undefined) return
    event.preventDefault()
    titles[to]!.focus()
  }

  ////////////////
  // ## Source (`DOMLoadableBodyElement`)
  ////////////////

  /** The first panel's content from `source`, loaded when it first opens. */
  readonly body = new E.LoadableBody({
    domElement: this.domElement,
    source: () => untrack(() => this.source) || undefined,
    select: () => untrack(() => this.select) || undefined,
    target: () => this.bodyTarget(),
    send: (name, detail) => this.send(name as never, detail)
  })

  /** The `source` panel's `<details>` held closed while its body is on its way (never in a server render). */
  get isVeiled(): boolean {
    return !isServer && !!this.source && this.body.isVeiled
  }

  /** Fetching the `source` body. */
  @E.cssState("loading")
  get bodyIsLoading(): boolean {
    return this.body.loadStatus === "loading"
  }

  /** The `source` body arrived. */
  @E.cssState("loaded")
  get bodyIsLoaded(): boolean {
    return this.body.loadStatus === "loaded"
  }

  /** The `source` body failed. */
  @E.cssState("error")
  get bodyFailed(): boolean {
    return this.body.loadStatus === "error"
  }

  /** The error line's text, when the `source` body failed;  else `undefined`. */
  get bodyFailureText(): string | undefined {
    const failure = this.body.loadError
    if (!failure) return undefined
    const key = E.SOURCE_FAILURE_KEYS[failure.kind] ?? E.SOURCE_FAILURE_KEYS.load
    return this.translationForKey(key as never, { source: this.source ?? "" })
  }

  /** Load the `source` body whenever its panel is open and the accordion connected. */
  @E.onChange("source", "openIndexes", "isConnected")
  protected onBodyWanted(source: string | undefined, openIndexes: number[], isConnected: boolean) {
    if (source && openIndexes.includes(SOURCE_PANEL) && isConnected) this.body.load().catch(() => undefined)
  }

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
   * - No title at all:  the DOM element itself (nothing shows it:  only pairs are shown).
   */
  private bodyTarget(): Element {
    const title = [...this.domElement.children].find(UIAccordion.isTitle)
    if (!title) return this.domElement
    const next = title.nextElementSibling
    if (next && !UIAccordion.isTitle(next)) return next
    const content = this.domElement.ownerDocument.createElement(CONTENT_TAG)
    title.after(content)
    return content
  }

  ////////////////
  // ## Looks
  ////////////////

  /** Panels open and close with a height transition:  styled, in a browser that animates to `auto` heights. */
  @E.cssState("animated")
  get isAnimated(): boolean {
    return this.isReady && UI.browser.supports.interpolateSize
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("accordion")} onKeyDown={this.onKeyDown}>
        <For each={this.panels}>{(panel, index) => this.panel(panel, index)}</For>
      </div>
    )
  }

  /** One panel:  `<details>` > `<summary class="title">` + `<div class="content">`, each around its child. */
  private panel(panel: UIT.AccordionPanel, index: Accessor<number>): JSX.Element {
    const open = () => this.panelIsOpen(index())
    const source = () => index() === SOURCE_PANEL && !!this.source
    return (
      <details
        part={this.partForName("panel")}
        name={this.exclusive ? this.group : undefined}
        open={open() && !(source() && this.isVeiled)}
        onToggle={(event: Event) => this.onToggle(event)}
      >
        <summary
          class={open() ? ACTIVE_TITLE : UIT.TITLE}
          part={this.partForName("title")}
          onClick={(event: MouseEvent) => this.onTitleClick(index(), event)}
        >
          <span class={DROPDOWN_ICON} part={this.partForName("icon")} aria-hidden="true" />
          {this.panelSlot(panel.title, index, TITLE_PART)}
        </summary>
        <div class={open() ? ACTIVE_CONTENT : UIT.CONTENT} part={this.partForName("content")}>
          <Show when={source() && this.bodyFailureText}>
            <p class={SOURCE_ERROR} part={this.partForName("error")} role="alert">
              {this.bodyFailureText}
            </p>
          </Show>
          {panel.content ? this.panelSlot(panel.content, index, CONTENT_PART) : undefined}
        </div>
      </details>
    )
  }

  /**
   * The `<slot>` showing `child` (a panel's title or content):  assigned by hand in a browser.
   * - A server render can't assign by hand (no refs run, no shadow root):  the slot gets a NAME,
   *   and so does `child` (its `slot` attribute), which the flattener (`$/ui/static`) matches and then drops.
   * - SIDE EFFECT, server only:  sets `child`'s `slot` attribute (the render's own parsed copy of the page).
   */
  private panelSlot(
    child: Element,
    index: Accessor<number>,
    part: typeof TITLE_PART | typeof CONTENT_PART
  ): JSX.Element {
    if (!isServer) return <slot ref={(slot: HTMLSlotElement) => slot.assign(child)} />
    const name = `${part}-${untrack(index)}`
    child.setAttribute("slot", name)
    return <slot name={name} />
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * A title child:  an element DEFINED with the `title` part noun (`<ui-title>`, or its translated tag).
   * - STATIC:  pure, and handed to `AccordionPanels.read()` as a plain callback, no `this`.
   */
  private static isTitle(element: Element): boolean {
    return E.UIComponent.registry.definitions.get(element.localName)?.vocabulary.noun === TITLE_NOUN
  }
}

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIAccordion extends E.AttributeValues<typeof accordionVocabulary> {}

/** What `UIAccordion.detail()` builds a `ui-open` / `ui-close` detail from. */
type AccordionDetailParams = {
  /** Panel index (0-based). */
  index: number
  /** State the panel is ABOUT to enter:  `true` opening. */
  open: boolean
  /** The click / key / toggle event behind it. */
  originalEvent?: Event
}

/** Noun a title child is defined with (`ui-parts/UITitle.en.ts`:  another family, not imported). */
const TITLE_NOUN = "title"

/** Tag of the content child a `source` accordion makes when its title has none (`ui-parts`). */
const CONTENT_TAG = "ui-content"

/** Leading `ui` of the class string, dropped when nested. */
const UI_WORD = /^ui /

/** This accordion's own titles, for arrow-key moves. */
const TITLE_SELECTOR = ":scope > details > summary"

/** Index of the panel a `source` body fills:  the first. */
const SOURCE_PANEL = 0

/** Class words of the line saying a `source` body failed (`part="error"`, in the panel's content box). */
const SOURCE_ERROR = "source error"

/**
 * The shared `name` of an exclusive accordion's `<details>`, so the browser closes the others.
 * - Scoped to the accordion's own shadow root, so one constant serves every accordion;  a server render,
 *   with no shadow root, makes it page-unique (`UIAccordion.group`).
 */
const DETAILS_GROUP = "panels"

/** An open panel's `<summary>`. */
const ACTIVE_TITLE = "active title"

/** An open panel's content box. */
const ACTIVE_CONTENT = "active content"

/** The arrow in a title. */
const DROPDOWN_ICON = "dropdown icon"

/** Part of a panel's `<summary>`;  also the prefix of its slot's name in a server render. */
const TITLE_PART = "title"

/** Part of a panel's content box;  also the prefix of its slot's name in a server render. */
const CONTENT_PART = "content"
