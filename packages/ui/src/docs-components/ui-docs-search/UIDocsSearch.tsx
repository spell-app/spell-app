import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import { docsSearchVocabulary } from "./ui-docs-search.vocabulary.en"
import { DocsSearchFallback } from "./ui-docs-search.fallback"
import { DocsSearchHost } from "./DocsSearchHost"
import { PageOutline } from "./PageOutline"
import { SearchData } from "./SearchData"
import { SearchIndex } from "./SearchIndex"
import {
  CLEAR_ICON,
  DEFAULT_PAGE,
  DRAWERS,
  FIELD,
  KIND_ICON,
  KIND_TEXT,
  SEARCH_ICON,
  SHORTCUT_KEYS,
  SUMMON_FRAMES,
  TYPING_SELECTOR,
  type DocsSearchController,
  type DocsSearchVocabulary,
  type SearchEntry,
  type SearchHit,
  type SearchKind,
  type TitleSegment
} from "./ui-docs-search.types"

import searchCSS from "./ui-docs-search.css?inline"

/****************
 * ### `<ui-docs-search>`
 * The docs site's search, the brand's header search pill:  type, and a results card under the field lists what
 * matches -- the page shown's sections, components, pages, other pages' sections, attributes -- grouped, best
 * first, the matched text marked;  pick one to jump there.
 * - Shadow:  `<div class="ui [size] finder" part="search">` holding
 *   - `<div class="field" part="field">` (the pill, the results' anchor):  an icon, `<input role="combobox"
 *     part="input">`, a clear `<button>` while there's text, the shortcut hint `<span part="keys">` of `<kbd>`s
 *   - `<div class="results" part="results" popover="manual">` (the top layer, so no panel or drawer clips it):  a
 *     `<div role="listbox">` of `<div role="group" part="group">`s, each a mono eyebrow (`part="label"`) over
 *     `<a role="option" part="option" href>`s;  a note (no matches, loading);  the keys line (`part="hints"`)
 *   - a visually hidden `role=status`:  how many results
 * - ARIA combobox, list autocomplete:  focus stays in the field;  `aria-activedescendant` names the highlighted
 *   option, the first by default (Enter takes the best match).  ↑ / ↓ move (wrapping), Enter goes (Cmd / Ctrl+Enter:  a
 *   new tab), Tab moves on and closes, Escape closes, then clears (the list beside it unfilters), then leaves the
 *   field.  Leaving the field closes the card;  coming back reopens it.
 * - Results are LINKS (`<a href>`), so a router that takes the page's link clicks takes them too.  Picking one fires a
 *   cancelable `ui-navigate`:  vetoed, a router took it;  else a result on the page shown sets the hash (closing the
 *   drawer the field is in:  the site's landing scrolls), any other loads its page.  The field then empties.
 * - Data:  the page shown's sections live from its DOM on every focus (`PageOutline`, `page`);  the rest from the
 *   site's data, fetched on the FIRST focus or keystroke (`SiteData` + `SearchData`, `SearchIndex`).  Until it's in,
 *   only the page shown is searched;  if it fails, likewise.
 * - Every keystroke fires `ui-input` (`{ value }`):  `<ui-docs-nav>` filters its list by it.
 * - Shortcuts (`shortcuts`, on by default):  `/` (not while typing in a field) and Cmd / Ctrl+K summon the field
 *   (`summon()`):  of several, the visible one, else one in a closed drawer, which opens.  One document listener for
 *   every field, while any is connected.
 * - A doc-only element (`src/docs-components/`):  its shadow composes `<ui-icon>`s, which its barrel imports.
 ****************/
export class UIDocsSearch extends E.UIElement<DocsSearchVocabulary> implements DocsSearchController {
  @E.proto static vocabulary = docsSearchVocabulary
  @E.proto static styles = { "docs-search": searchCSS }
  @E.proto static Fallback = DocsSearchFallback
  @E.proto static Host = DocsSearchHost

  ////////////////
  // ## State
  ////////////////

  /** The text typed, as typed. */
  readonly typed = new E.Cell("")

  /** The card is wanted:  the field has focus (or was typed in) since the last close. */
  readonly isOpen = new E.Cell(false)

  /** Index of the highlighted result (clamped by `active()`). */
  readonly highlight = new E.Cell(0)

  /** The page shown's sections, read on focus and on the first keystroke. */
  readonly outline = new E.Cell<readonly SearchEntry[]>([])

  /** The page shown's path from the site root, e.g. `components/ui-divider.html` (read with `outline`). */
  readonly current = new E.Cell<string | undefined>(undefined)

  /** Everything else, once the site's data is in (or has failed:  an index of what did load). */
  readonly index = new E.Cell<SearchIndex | undefined>(undefined)

  /** The site's data was asked for. */
  readonly isPreparing = new E.Cell(false)

  /** The `<input>`, while rendered. */
  private input: HTMLInputElement | undefined

  /** The results popover, while rendered. */
  private card: HTMLElement | undefined

  /** What had focus before a shortcut summoned the field:  Escape on an empty field returns there. */
  private returnFocus: HTMLElement | undefined

  ////////////////
  // ## Derived state
  ////////////////

  /** The groups found, best first. */
  readonly groups = createMemo(() =>
    (this.index.get() ?? NO_INDEX).search(this.typed.get(), this.outline.get(), this.current.get())
  )

  /** Every result in order, with its group:  what ↑ / ↓ walk. */
  readonly rows = createMemo(() => this.groups().flatMap((group) => group.hits))

  /** The highlighted result's index, within the rows;  -1 with none. */
  readonly active = createMemo(() => Math.min(this.highlight.get(), this.rows().length - 1))

  /** Text is typed (blank isn't). */
  readonly isSearching = createMemo(() => !!this.typed.get().trim())

  /** The card shows. */
  readonly isShown = createMemo(() => this.isOpen.get() && this.isSearching())

  /** The site's data is on its way. */
  readonly isLoading = createMemo(() => this.isPreparing.get() && !this.index.get())

  /** Groups with each row's index among all rows. */
  readonly view = createMemo(() => {
    let index = 0
    return this.groups().map((group) => ({
      kind: group.kind,
      rows: group.hits.map((hit) => ({ hit, index: index++ }))
    }))
  })

  /** The modifier key the hint shows:  `⌘` on Apple platforms, else `Ctrl`. */
  readonly modifier = createMemo(() => (this.isLoaded() && UI.browser.isApple ? "⌘" : "Ctrl"))

  /** `/` and Cmd / Ctrl+K summon this field:  `shortcuts` isn't off. */
  private get hasShortcuts(): boolean {
    return this.attrs.shortcuts !== false
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected override hostStates() {
    return {
      open: this.isShown(),
      searching: this.isSearching(),
      empty: this.isSearching() && !this.rows().length && !this.isLoading(),
      loading: this.isLoading()
    }
  }

  /** Base `mount()`, plus the effects:  the popover follows `isShown`, the highlight scrolls into view, shortcuts. */
  override mount(): JSX.Element {
    const content = super.mount()
    if (isServer) return content
    // SIDE EFFECT:  the popover opens and shuts with `isShown`
    createEffect(
      () => this.isShown(),
      (isShown) => {
        if (isShown) this.openCard()
        else this.closeCard()
      }
    )
    // SIDE EFFECT:  the highlighted option stays in the card's view
    createEffect(
      () => (this.isShown() ? this.active() : -1),
      (active) => {
        if (active >= 0) this.optionFor(active)?.scrollIntoView({ block: "nearest" })
      }
    )
    // SIDE EFFECT:  `/` and Cmd / Ctrl+K, while connected
    createEffect(
      () => this.isConnected.get(),
      (isConnected) => {
        if (!isConnected) return undefined
        UIDocsSearch.listen(this)
        return () => UIDocsSearch.unlisten(this)
      }
    )
    return content
  }

  ////////////////
  // ## Script API (`DocsSearchHost`)
  ////////////////

  /** The text typed. */
  get query(): string {
    return untrack(() => this.typed.get())
  }

  /** Show the field (opening its drawer if it's hidden in one) and focus it, its text selected. */
  async summon(): Promise<void> {
    const before = UIDocsSearch.deepActive()
    if (before && !this.host.shadowRoot?.contains(before)) this.returnFocus = before
    if (!this.host.checkVisibility()) {
      const drawer = E.closestAcrossShadow(this.host, DRAWERS)
      if (drawer && !drawer.hasAttribute(OPEN)) drawer.setAttribute(OPEN, "")
      for (let frame = 0; frame < SUMMON_FRAMES && !this.host.checkVisibility(); frame++) await E.nextFrame()
      // the drawer moves focus into itself as it opens:  take it after
      await E.nextFrame()
    }
    this.input?.focus()
    this.input?.select()
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("search")} ref={(element: HTMLElement) => this.wire(element)}>
        <div class={FIELD} part={this.part("field")}>
          <span class={GLYPH} aria-hidden={UIT.TRUE}>
            <ui-icon name={SEARCH_ICON} />
          </span>
          <input
            ref={(element: HTMLInputElement) => (this.input = element)}
            part={this.part("input")}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={this.isShown() && this.rows().length ? UIT.TRUE : UIT.FALSE}
            aria-controls={this.rows().length ? LISTBOX_ID : undefined}
            aria-activedescendant={
              this.isShown() && this.active() >= 0 ? UIDocsSearch.optionIdFor(this.active()) : undefined
            }
            aria-label={this.text("label")}
            aria-keyshortcuts={this.hasShortcuts ? KEY_SHORTCUTS : undefined}
            placeholder={this.attrs.placeholder ?? this.text("placeholder")}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            enterkeyhint="go"
            onInput={(event) => this.onInput(event)}
            onKeyDown={(event) => this.onKeyDown(event)}
            onFocus={() => this.onFocus()}
          />
          <Show when={this.isSearching()}>
            <button
              type="button"
              class={CLEAR}
              tabindex="-1"
              aria-label={this.text("clear")}
              title={this.text("clear")}
              onClick={(event) => this.onClearClick(event)}
            >
              <ui-icon name={CLEAR_ICON} />
            </button>
          </Show>
          <Show when={this.hasShortcuts}>
            <span class={KEYS} part={this.part("keys")} aria-hidden={UIT.TRUE}>
              <kbd>{this.modifier()}</kbd>
              <kbd>K</kbd>
            </span>
          </Show>
        </div>
        <div
          class={RESULTS}
          part={this.part("results")}
          popover={UIT.MANUAL}
          ref={(element: HTMLElement) => this.wireCard(element)}
        >
          <Show when={this.rows().length}>
            <div role="listbox" id={LISTBOX_ID} class={LIST} aria-label={this.text("results")}>
              <For each={this.view()}>{(group) => this.group(group.kind, group.rows)}</For>
            </div>
          </Show>
          <Show when={this.isSearching() && !this.rows().length && !this.isLoading()}>
            <p class={[NOTE, EMPTY]}>{this.text("noMatches", { query: this.typed.get().trim() })}</p>
          </Show>
          <Show when={this.isLoading()}>
            <p class={NOTE}>{this.text("loading")}</p>
          </Show>
          <div class={HINTS} part={this.part("hints")} aria-hidden={UIT.TRUE}>
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> {this.text("move")}
            </span>
            <span>
              <kbd>↵</kbd> {this.text("go")}
            </span>
            <span>
              <kbd>esc</kbd> {this.text("close")}
            </span>
          </div>
        </div>
        <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
          {this.status()}
        </span>
      </div>
    )
  }

  /** One group:  its eyebrow, then its options. */
  private group(kind: SearchKind, rows: readonly { hit: SearchHit; index: number }[]): JSX.Element {
    const label = GROUP_ID + kind
    return (
      <div role={UIT.GROUP} class={UIT.GROUP} part={this.part("group")} aria-labelledby={label}>
        <div class={UIT.LABEL} part={this.part("label")} id={label}>
          {this.text(KIND_TEXT[kind])}
        </div>
        <For each={rows}>{(row) => this.option(row.hit, row.index)}</For>
      </div>
    )
  }

  /** One result:  a link with its icon, its title (matches marked, a tag in mono) and where it is. */
  private option(hit: SearchHit, index: number): JSX.Element {
    const entry = hit.entry
    const isActive = () => this.active() === index
    return (
      <a
        role={OPTION}
        id={UIDocsSearch.optionIdFor(index)}
        class={[OPTION, entry.kind, { [UIT.ACTIVE]: isActive() }]}
        part={this.part("option")}
        href={this.href(entry.href)}
        tabindex="-1"
        aria-selected={isActive() ? UIT.TRUE : UIT.FALSE}
        data-index={String(index)}
      >
        <span class={GLYPH} aria-hidden={UIT.TRUE}>
          <ui-icon name={KIND_ICON[entry.kind]} />
        </span>
        <span class={UIT.TEXT}>
          <span class={UIT.TITLE}>
            <span class={NAME}>
              <For each={UIDocsSearch.segments(entry.title, hit.marks)}>
                {(piece) => (piece.isMarked ? <mark>{piece.text}</mark> : piece.text)}
              </For>
            </span>
            <Show when={entry.code}>
              <code>{entry.code}</code>
            </Show>
          </span>
          <Show when={entry.context}>
            <span class={CONTEXT}>{entry.context}</span>
          </Show>
        </span>
        <span class={ENTER} aria-hidden={UIT.TRUE}>
          ↵
        </span>
      </a>
    )
  }

  /** The live status:  how many results, while the card shows. */
  private status(): string {
    if (!this.isShown() || this.isLoading()) return ""
    const count = this.rows().length
    if (!count) return this.text("noMatches", { query: this.typed.get().trim() })
    return count === 1 ? this.text("resultOne") : this.text("resultMany", { count })
  }

  /** `path` (from the site root, or `#id`) as a link:  against `base`;  a hash stays a hash. */
  private href(path: string): string {
    return path.startsWith("#") ? path : this.base() + path
  }

  /** Prefix of every link:  `base`, else the site root from `SiteData`. */
  private base(): string {
    if (this.attrs.base !== undefined) return this.attrs.base
    try {
      return SiteData.root()
    } catch {
      return ""
    }
  }

  ////////////////
  // ## Behaviour
  ////////////////

  /** Listeners on the box:  leaving it closes the card. */
  private wire(box: HTMLElement) {
    box.addEventListener("focusout", (event) => this.onFocusOut(event))
  }

  /** Listeners on the card:  a press keeps focus in the field;  hover highlights;  a click picks. */
  private wireCard(card: HTMLElement) {
    this.card = card
    card.addEventListener("pointerdown", (event) => event.preventDefault())
    card.addEventListener("pointermove", (event) => this.onHover(event))
    card.addEventListener("click", (event) => this.onClick(event))
  }

  /** Show the popover (unless it's gone, or already open). */
  private openCard() {
    if (this.card?.isConnected && !this.card.matches(UIT.POPOVER_OPEN)) this.card.showPopover()
  }

  /** Hide the popover (unless it's gone, or already shut). */
  private closeCard() {
    if (this.card?.isConnected && this.card.matches(UIT.POPOVER_OPEN)) this.card.hidePopover()
  }

  /** The field has focus:  read the page, start the data, reopen the card. */
  private onFocus() {
    this.refresh()
    this.prepare()
    this.isOpen.set(true)
  }

  /** Focus left the box (and its card):  close. */
  private onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (next && (this.host.shadowRoot?.contains(next) || next === this.host)) return
    this.isOpen.set(false)
  }

  /** A keystroke changed the text:  search again from the top;  `ui-input`. */
  private onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    if (!untrack(() => this.typed.get()).trim() && value.trim()) this.refresh()
    this.prepare()
    this.typed.set(value)
    this.highlight.set(0)
    this.isOpen.set(true)
    this.emit("ui-input", { value, originalEvent: event })
  }

  /** ↑ / ↓ / Enter / Escape / Tab (see the class). */
  private onKeyDown(event: KeyboardEvent) {
    const count = untrack(() => this.rows().length)
    const isShown = untrack(() => this.isShown())
    switch (event.key) {
      case UIT.Key.arrowDown:
      case UIT.Key.arrowUp: {
        if (!untrack(() => this.isSearching())) return
        event.preventDefault()
        if (!isShown) {
          this.isOpen.set(true)
          return
        }
        if (!count) return
        const step = event.key === UIT.Key.arrowDown ? 1 : -1
        this.highlight.set((untrack(() => this.active()) + step + count) % count)
        return
      }
      case UIT.Key.enter: {
        if (event.isComposing || !untrack(() => this.isSearching())) return
        event.preventDefault()
        const active = untrack(() => this.active())
        if (active >= 0) this.choose(active, event)
        return
      }
      case UIT.Key.escape:
        return this.onEscape(event)
      case UIT.Key.tab:
        this.isOpen.set(false)
        return
    }
  }

  /** Escape:  close the card;  else clear the text;  else leave the field, to where a shortcut came from. */
  private onEscape(event: KeyboardEvent) {
    if (untrack(() => this.isShown())) {
      event.preventDefault()
      event.stopPropagation()
      this.isOpen.set(false)
    } else if (untrack(() => this.typed.get())) {
      event.preventDefault()
      event.stopPropagation()
      this.clear(event)
    } else if (this.returnFocus?.isConnected) {
      event.preventDefault()
      this.returnFocus.focus()
      this.returnFocus = undefined
    }
  }

  /** The clear button:  empty the field, and give it focus back. */
  private onClearClick(event: MouseEvent) {
    this.clear(event)
    this.input?.focus()
  }

  /** The pointer moved over an option:  highlight it. */
  private onHover(event: PointerEvent) {
    const index = UIDocsSearch.indexFor(event)
    if (index !== undefined && index !== untrack(() => this.active())) this.highlight.set(index)
  }

  /** A click on an option:  pick it (a modified click is the browser's:  a new tab, a download ...). */
  private onClick(event: MouseEvent) {
    const index = UIDocsSearch.indexFor(event)
    if (index === undefined) return
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    this.choose(index, event)
  }

  /**
   * Go to the result at `index`, as `event` (Enter, a click) asked:  see the class.
   * - The card closes and the text clears on the NEXT task:  a click's link must still be in the page when the
   *   browser follows it.
   */
  private choose(index: number, event: KeyboardEvent | MouseEvent) {
    const hit = untrack(() => this.rows()[index])
    const link = this.optionFor(index)
    if (!hit || !link) return
    const href = link.href
    if (event.type === "keydown" && (event.metaKey || event.ctrlKey)) {
      window.open(href, "_blank", "noopener")
      return
    }
    const shouldFollow = this.emit("ui-navigate", { href, kind: hit.entry.kind, originalEvent: event })
    setTimeout(() => this.finish())
    if (!shouldFollow) {
      event.preventDefault()
      return
    }
    const url = new URL(href)
    if (url.pathname === location.pathname && url.search === location.search) {
      event.preventDefault()
      this.jumpHere(url.hash)
    } else if (event.type === "keydown") location.assign(href)
    // a plain click on another page's link:  the browser follows it
  }

  /**
   * Land on `hash` on the page shown:  close the drawer the field is in (the landing measures the page), then set
   * the hash;  the same hash again re-announces it (`hashchange`), so the page lands once more.
   */
  private jumpHere(hash: string) {
    const drawer = E.closestAcrossShadow(this.host, DRAWERS)
    if (drawer?.hasAttribute(OPEN)) drawer.removeAttribute(OPEN)
    if (location.hash === hash) {
      window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: location.href, newURL: location.href }))
    } else location.hash = hash
  }

  /** After a pick:  close the card, empty the field (the list beside it unfilters). */
  private finish() {
    this.isOpen.set(false)
    if (this.input?.value) this.clear(new Event("input"))
  }

  /** Empty the field;  `ui-input`. */
  private clear(event: Event) {
    if (this.input) this.input.value = ""
    this.typed.set("")
    this.highlight.set(0)
    this.emit("ui-input", { value: "", originalEvent: event })
  }

  /** Read the page shown:  its sections and its path. */
  private refresh() {
    const page = this.attrs.page || DEFAULT_PAGE
    this.outline.set(PageOutline.read(document.querySelector(page) ?? undefined))
    this.current.set(this.pagePath())
  }

  /** Start fetching the site's data, once:  `index` gets what loads (both, one, or neither). */
  private prepare() {
    if (untrack(() => this.isPreparing.get())) return
    this.isPreparing.set(true)
    void Promise.allSettled([SiteData.load(), SearchData.load()]).then(([data, search]) => {
      for (const result of [data, search]) {
        if (result.status === "rejected") E.Warnings.warn("<ui-docs-search>", "the index didn't load:", result.reason)
      }
      this.index.set(
        new SearchIndex({
          data: data.status === "fulfilled" ? data.value : undefined,
          search: search.status === "fulfilled" ? search.value : undefined
        })
      )
    })
  }

  /** The page shown's path from the site root (`components/ui-divider.html`;  a folder is its `index.html`). */
  private pagePath(): string | undefined {
    try {
      const root = new URL(this.base() || "./", location.href).pathname
      if (!location.pathname.startsWith(root)) return undefined
      const rest = location.pathname.slice(root.length)
      return rest === "" || rest.endsWith("/") ? `${rest}index.html` : rest
    } catch {
      return undefined
    }
  }

  /** The option at `index`, while rendered. */
  private optionFor(index: number): HTMLAnchorElement | undefined {
    return this.card?.querySelector<HTMLAnchorElement>(`#${UIDocsSearch.optionIdFor(index)}`) ?? undefined
  }

  ////////////////
  // ## Shortcuts
  ////////////////

  /** Every connected field:  the shortcut picks one.  Page-wide, as the one document listener is. */
  private static readonly fields = new Set<UIDocsSearch>()

  /** The one document listener, while any field is connected:  static, so adding and removing it match. */
  private static readonly onDocumentKey = (event: KeyboardEvent) => UIDocsSearch.shortcut(event)

  /** `field` is connected:  listen (the first one adds the listener). */
  private static listen(field: UIDocsSearch) {
    if (!UIDocsSearch.fields.size) document.addEventListener("keydown", UIDocsSearch.onDocumentKey)
    UIDocsSearch.fields.add(field)
  }

  /** `field` is gone:  the last one removes the listener. */
  private static unlisten(field: UIDocsSearch) {
    UIDocsSearch.fields.delete(field)
    if (!UIDocsSearch.fields.size) document.removeEventListener("keydown", UIDocsSearch.onDocumentKey)
  }

  /**
   * `/` (unless typing in a field) or Cmd / Ctrl+K:  summon a field that takes shortcuts, the visible one, else one in
   * a drawer.
   */
  private static shortcut(event: KeyboardEvent) {
    if (event.defaultPrevented || event.altKey || event.isComposing) return
    const isPalette = event.key.toLowerCase() === SHORTCUT_KEYS.palette && (event.metaKey || event.ctrlKey)
    const isSlash = event.key === SHORTCUT_KEYS.slash && !event.metaKey && !event.ctrlKey
    if (!isPalette && !isSlash) return
    if (isSlash) {
      const origin = event.composedPath()[0]
      if (origin instanceof HTMLElement && (origin.isContentEditable || origin.matches(TYPING_SELECTOR))) return
    }
    const fields = [...UIDocsSearch.fields].filter((field) => field.hasShortcuts)
    const field =
      fields.find((each) => each.host.checkVisibility()) ??
      fields.find((each) => E.closestAcrossShadow(each.host, DRAWERS))
    if (!field) return
    event.preventDefault()
    void field.summon()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Id of the option at `index`. */
  private static optionIdFor(index: number): string {
    return OPTION_ID + index
  }

  /** The option index on `event`'s path, if any. */
  private static indexFor(event: Event): number | undefined {
    for (const target of event.composedPath()) {
      if (target instanceof Element && target.hasAttribute(INDEX_ATTRIBUTE))
        return Number(target.getAttribute(INDEX_ATTRIBUTE))
    }
    return undefined
  }

  /** The focused element, through shadow roots. */
  private static deepActive(): HTMLElement | undefined {
    let active = document.activeElement
    while (active?.shadowRoot?.activeElement) active = active.shadowRoot.activeElement
    return active instanceof HTMLElement && active !== document.body ? active : undefined
  }

  /** `title` cut at `marks`:  the pieces to show, the marked ones flagged. */
  static segments(title: string, marks: readonly (readonly [number, number])[]): TitleSegment[] {
    const pieces: TitleSegment[] = []
    let at = 0
    for (const [start, end] of marks) {
      if (start > at) pieces.push({ text: title.slice(at, start), isMarked: false })
      pieces.push({ text: title.slice(start, end), isMarked: true })
      at = end
    }
    if (at < title.length) pieces.push({ text: title.slice(at), isMarked: false })
    return pieces
  }
}

/** The index of nothing:  what the page shown is searched with until the data is in. */
const NO_INDEX = new SearchIndex()

/** Id of the listbox in the shadow root. */
const LISTBOX_ID = "docs-search-results"

/** Id prefix of an option, + its index among all rows. */
const OPTION_ID = "docs-search-option-"

/** Id prefix of a group's eyebrow, + its kind. */
const GROUP_ID = "docs-search-group-"

/**
 * Attribute holding an option's index among all rows:  what hover and click find it by.
 * - NOTE: the JSX writes it literally (`data-index={...}`):  a spread to use this key there would make each option's
 *   attributes one object Solid sets as a whole.  Keep the two in step.
 */
const INDEX_ATTRIBUTE = "data-index"

/** The input's `aria-keyshortcuts`, while shortcuts are on. */
const KEY_SHORTCUTS = "/ Meta+K Control+K"

/** A drawer's `open` attribute:  `summon()` opens one, a jump to the page shown closes it. */
const OPEN = "open"

/** Role and class word of a result. */
const OPTION = "option"

/** Class word of an icon's box (the field's, a result's). */
const GLYPH = "glyph"

/** Class word of the clear button. */
const CLEAR = "clear"

/** Class word of the shortcut hint. */
const KEYS = "keys"

/** Class word of the results card. */
const RESULTS = "results"

/** Class word of the listbox. */
const LIST = "list"

/** Class word of a result's title text. */
const NAME = "name"

/** Class word of a result's context (where it is). */
const CONTEXT = "context"

/** Class word of a result's Enter hint. */
const ENTER = "enter"

/** Class word of a note in the card (loading, no matches). */
const NOTE = "note"

/** Class word of the "no matches" note. */
const EMPTY = "empty"

/** Class word of the keys line at the card's foot. */
const HINTS = "hints"
