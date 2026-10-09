import { For, Show, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import { docsSearchVocabulary } from "./UIDocsSearch.en"
import { PageOutline } from "./PageOutline"
import { SearchData } from "./SearchData"
import { SearchIndex } from "./SearchIndex"
import {
  CLEAR_ICON,
  DEFAULT_PAGE,
  DRAWERS,
  KIND_ICON,
  KIND_TEXT,
  SEARCH_ICON,
  SHORTCUT_KEYS,
  SUMMON_FRAMES,
  TYPING_SELECTOR,
  type DocsSearchVocabulary,
  type SearchEntry,
  type SearchGroup,
  type SearchHit,
  type SearchKind,
  type TitleSegment
} from "./UIDocsSearch.types"

import searchCSS from "./UIDocsSearch.css?inline"

/****************
 * ### `DOMDocsSearchElement`
 * The DOM element of `<ui-docs-search>`:  it adds the script API, `summon()` and `query`,
 * which its component (`UIDocsSearch`) carries out.
 * - `focus()` is the DOM element's own:  `delegatesFocus` puts it in the field.
 * - None of these members is named like an attribute:  `DOMElement` refuses a member that is.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMDocsSearchElement extends E.DOMElement {
  /**
   * Show the field and focus it, its text selected:  what `/` and Cmd / Ctrl+K do.
   * - A field that isn't on screen opens the drawer it's in first (a closed `<ui-flyout>` / `<ui-sidebar>`),
   *   e.g. a narrow top bar's search button.
   */
  summon(): Promise<void> {
    return this.search?.summon() ?? this.ready.then(() => this.search?.summon())
  }

  /**
   * The text typed;  `""` before the component exists.
   * - Untracked:  a page's Solid effect reading it doesn't re-run on every keystroke.
   */
  get query(): string {
    return untrack(() => this.search?.query) ?? ""
  }

  /** This element's component, once it has one. */
  private get search(): UIDocsSearch | undefined {
    return this.component as UIDocsSearch | undefined
  }
}

/****************
 * ### `UIDocsSearch`
 * The component behind `<ui-docs-search>`:  the docs site's search, as the brand's header search pill.
 * Type, and a results card under the field lists what matches
 * (the page shown's sections, components, pages, other pages' sections, attributes),
 * grouped, best first, with the matched text marked;  pick one to jump there.
 *
 * - Its shadow DOM:  `<div class="ui [size] finder" part="search">` holding
 *   - `<div class="field" part="field">` (the pill, the results' anchor):  an icon,
 *     `<input role="combobox" part="input">`, a clear `<button>` while there's text,
 *     and the shortcut hint `<span part="keys">` of `<kbd>`s
 *   - `<div class="results" part="results" popover="manual">` (in the top layer, so no panel or drawer clips it):
 *     a `<div role="listbox">` of `<div role="group" part="group">`s, each a mono eyebrow (`part="label"`)
 *     over `<a role="option" part="option" href>`s;  a note (no matches, loading);  the keys line (`part="hints"`)
 *   - a visually hidden `role=status`:  how many results.
 * - An ARIA combobox, with list autocomplete:  focus stays in the field,
 *   and `aria-activedescendant` names the highlighted option (the first by default:  Enter takes the best match).
 *   - ↑ / ↓ move (wrapping);  Enter goes (Cmd / Ctrl+Enter:  a new tab);  Tab moves on, and closes
 *   - Escape closes, then clears (the list beside it unfilters), then leaves the field
 *   - leaving the field closes the card;  coming back reopens it.
 * - Results are LINKS (`<a href>`), so a router that takes the page's link clicks takes them too.
 *   Picking one fires a cancelable `ui-navigate`:
 *   - vetoed:  a router took it
 *   - else a result on the page shown sets the hash (closing the drawer the field is in:  the site's landing scrolls),
 *     and any other loads its page.
 *   The field then empties.
 * - Data:  the page shown's sections are read live from its DOM on every focus (`PageOutline`, `page`);
 *   the rest come from the site's data, fetched on the FIRST focus or keystroke (`SiteData` + `SearchData`,
 *   `SearchIndex`).  Until it's in, or if it fails, only the page shown is searched.
 * - Every keystroke fires `ui-input` (`{ value }`):  `<ui-docs-nav>` filters its list by it.
 * - Shortcuts (`shortcuts`, on by default):  `/` (not while typing in a field) and Cmd / Ctrl+K summon the field
 *   (`summon()`):  of several, the visible one, else one in a closed drawer, which opens.
 *   One document listener serves every field, while any is connected.
 * - A doc-only element (`src/docs-components/`):  its shadow DOM is built of `<ui-icon>`s, which its barrel imports.
 ****************/
export class UIDocsSearch extends E.UIComponent<DocsSearchVocabulary> {
  @E.proto static vocabulary = docsSearchVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { "docs-search": searchCSS },
    DOMElement: DOMDocsSearchElement
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## The text typed
  ////////////////

  /** The text typed, as typed;  the script API's `query` (`DOMDocsSearchElement`). */
  @E.state accessor query = ""

  /** Text is typed (blank isn't).  `:state(searching)`. */
  @E.cssState("searching")
  get isSearching(): boolean {
    return !!this.query.trim()
  }

  /** The `<input>`, while rendered. */
  private input: HTMLInputElement | undefined

  /** A keystroke changed the text:  search again from the top;  `ui-input`. */
  private onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    if (!this.query.trim() && value.trim()) this.readPageShown()
    this.loadSiteData()
    this.query = value
    this.highlightedIndex = 0
    this.cardIsWanted = true
    this.send("ui-input", { value, originalEvent: event })
  }

  /** The clear button:  empty the field, and give it focus back. */
  private onClearClick(event: MouseEvent) {
    this.clear(event)
    this.input?.focus()
  }

  /** Empty the field;  `ui-input`. */
  private clear(event: Event) {
    if (this.input) this.input.value = ""
    this.query = ""
    this.highlightedIndex = 0
    this.send("ui-input", { value: "", originalEvent: event })
  }

  ////////////////
  // ## What's searched
  ////////////////

  /** The page shown's sections, read on focus and on the first keystroke. */
  @E.state accessor pageOutline: readonly SearchEntry[] = []

  /** The page shown's path from the site root, e.g. `components/ui-divider.html` (read with `pageOutline`). */
  @E.state accessor currentPagePath: string | undefined = undefined

  /** Everything else, once the site's data is in (or has failed:  an index of what did load). */
  @E.state accessor searchIndex: SearchIndex | undefined = undefined

  /** The site's data was asked for (never cleared). */
  @E.state accessor dataWasRequested = false

  /** The site's data is on its way.  `:state(loading)`. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return this.dataWasRequested && !this.searchIndex
  }

  /** Read the page shown:  its sections and its path. */
  private readPageShown() {
    const page = this.page || DEFAULT_PAGE
    this.pageOutline = PageOutline.read(document.querySelector(page) ?? undefined)
    this.currentPagePath = this.pagePath()
  }

  /** Start fetching the site's data, once:  `searchIndex` gets what loads (both, one, or neither). */
  private loadSiteData() {
    if (this.dataWasRequested) return
    this.dataWasRequested = true
    void Promise.allSettled([SiteData.load(), SearchData.load()]).then(([data, search]) => {
      for (const result of [data, search]) {
        if (result.status === "rejected") E.Warnings.warn("<ui-docs-search>", "the index didn't load:", result.reason)
      }
      this.searchIndex = new SearchIndex({
        data: data.status === "fulfilled" ? data.value : undefined,
        search: search.status === "fulfilled" ? search.value : undefined
      })
    })
  }

  /** The page shown's path from the site root (`components/ui-divider.html`;  a folder is its `index.html`). */
  private pagePath(): string | undefined {
    try {
      const root = new URL(this.linkBase || "./", location.href).pathname
      if (!location.pathname.startsWith(root)) return undefined
      const rest = location.pathname.slice(root.length)
      return rest === "" || rest.endsWith("/") ? `${rest}index.html` : rest
    } catch {
      return undefined
    }
  }

  ////////////////
  // ## The results
  ////////////////

  /** The groups found, best first.  `@derived`:  the search itself (scoring, sorting). */
  @E.derived
  get groups(): SearchGroup[] {
    return (this.searchIndex ?? NO_INDEX).search(this.query, this.pageOutline, this.currentPagePath)
  }

  /** Every result in order, with its group:  what ↑ / ↓ walk.  `@derived`:  read on every key and render. */
  @E.derived
  get rows(): SearchHit[] {
    return this.groups.flatMap((group) => group.hits)
  }

  /**
   * Groups with each row's index among all rows.
   * - `@derived`:  the `<For>` relies on the same objects until the groups change.
   */
  @E.derived
  get groupedRows(): { kind: SearchKind; rows: { hit: SearchHit; index: number }[] }[] {
    let index = 0
    return this.groups.map((group) => ({
      kind: group.kind,
      rows: group.hits.map((hit) => ({ hit, index: index++ }))
    }))
  }

  /** The text matches nothing (the data in).  `:state(empty)`. */
  @E.cssState("empty")
  get hasNoResults(): boolean {
    return this.isSearching && !this.rows.length && !this.isLoading
  }

  /** The live status:  how many results, while the card shows. */
  private get statusText(): string {
    if (!this.isOpen || this.isLoading) return ""
    const count = this.rows.length
    if (!count) return this.translationForKey("noMatches", { query: this.query.trim() })
    return count === 1 ? this.translationForKey("resultOne") : this.translationForKey("resultMany", { count })
  }

  ////////////////
  // ## The highlight
  ////////////////

  /** Index of the highlighted result, as asked for (clamped by `activeIndex`). */
  @E.state accessor highlightedIndex = 0

  /** The highlighted result's index, within the rows;  -1 with none. */
  get activeIndex(): number {
    return Math.min(this.highlightedIndex, this.rows.length - 1)
  }

  /** SIDE EFFECT:  the highlighted option stays in the card's view. */
  @E.onChange("isOpen", "activeIndex")
  protected onActiveIndexChanged(isOpen: boolean, activeIndex: number) {
    if (isOpen && activeIndex >= 0) this.optionFor(activeIndex)?.scrollIntoView({ block: "nearest" })
  }

  /** The pointer moved over an option:  highlight it. */
  private onHover(event: PointerEvent) {
    const index = UIDocsSearch.indexFor(event)
    if (index !== undefined && index !== this.activeIndex) this.highlightedIndex = index
  }

  /** The option at `index`, while rendered. */
  private optionFor(index: number): HTMLAnchorElement | undefined {
    return this.card?.querySelector<HTMLAnchorElement>(`#${UIDocsSearch.optionIdFor(index)}`) ?? undefined
  }

  ////////////////
  // ## The card
  ////////////////

  /** The card is wanted:  the field has focus (or was typed in) since the last close. */
  @E.state accessor cardIsWanted = false

  /** The card shows.  `:state(open)`. */
  @E.cssState("open")
  get isOpen(): boolean {
    return this.cardIsWanted && this.isSearching
  }

  /** The results popover, while rendered. */
  private card: HTMLElement | undefined

  /** SIDE EFFECT:  the popover opens and shuts with `isOpen`. */
  @E.onChange("isOpen")
  protected onOpenChanged(isOpen: boolean) {
    if (isOpen) this.openCard()
    else this.closeCard()
  }

  /** Show the popover (unless it's gone, or already open). */
  private openCard() {
    if (this.card?.isConnected && !this.card.matches(":popover-open")) this.card.showPopover()
  }

  /** Hide the popover (unless it's gone, or already shut). */
  private closeCard() {
    if (this.card?.isConnected && this.card.matches(":popover-open")) this.card.hidePopover()
  }

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

  /** The field has focus:  read the page, start the data, reopen the card. */
  private onFocus() {
    this.readPageShown()
    this.loadSiteData()
    this.cardIsWanted = true
  }

  /** Focus left the box (and its card):  close. */
  private onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (next && (this.domElement.shadowRoot?.contains(next) || next === this.domElement)) return
    this.cardIsWanted = false
  }

  ////////////////
  // ## Keys
  ////////////////

  /** What had focus before a shortcut summoned the field:  Escape on an empty field returns there. */
  private returnFocus: HTMLElement | undefined

  /** ↑ / ↓ / Enter / Escape / Tab (see the class). */
  private onKeyDown(event: KeyboardEvent) {
    const count = this.rows.length
    const isOpen = this.isOpen
    switch (event.key) {
      case UIT.Key.arrowDown:
      case UIT.Key.arrowUp: {
        if (!this.isSearching) return
        event.preventDefault()
        if (!isOpen) {
          this.cardIsWanted = true
          return
        }
        if (!count) return
        const step = event.key === UIT.Key.arrowDown ? 1 : -1
        this.highlightedIndex = (this.activeIndex + step + count) % count
        return
      }
      case UIT.Key.enter: {
        if (event.isComposing || !this.isSearching) return
        event.preventDefault()
        const active = this.activeIndex
        if (active >= 0) this.choose(active, event)
        return
      }
      case UIT.Key.escape:
        return this.onEscape(event)
      case UIT.Key.tab:
        this.cardIsWanted = false
        return
    }
  }

  /** Escape:  close the card;  else clear the text;  else leave the field, to where a shortcut came from. */
  private onEscape(event: KeyboardEvent) {
    if (this.isOpen) {
      event.preventDefault()
      event.stopPropagation()
      this.cardIsWanted = false
    } else if (this.query) {
      event.preventDefault()
      event.stopPropagation()
      this.clear(event)
    } else if (this.returnFocus?.isConnected) {
      event.preventDefault()
      this.returnFocus.focus()
      this.returnFocus = undefined
    }
  }

  ////////////////
  // ## Picking a result
  ////////////////

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
    const hit = this.rows[index]
    const link = this.optionFor(index)
    if (!hit || !link) return
    const href = link.href
    if (event.type === "keydown" && (event.metaKey || event.ctrlKey)) {
      window.open(href, "_blank", "noopener")
      return
    }
    const shouldFollow = this.send("ui-navigate", { href, kind: hit.entry.kind, originalEvent: event })
    E.soon(() => this.finishPick())
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
   * Land on `hash` on the page shown:  close the drawer the field is in (the landing measures the page),
   * then set the hash;  the same hash again re-announces it (`hashchange`), so the page lands once more.
   */
  private jumpHere(hash: string) {
    const drawer = E.closestAcrossShadow(this.domElement, DRAWERS)
    if (drawer?.hasAttribute(OPEN)) drawer.removeAttribute(OPEN)
    if (location.hash === hash) {
      window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: location.href, newURL: location.href }))
    } else location.hash = hash
  }

  /** After a pick:  close the card, empty the field (the list beside it unfilters). */
  private finishPick() {
    this.cardIsWanted = false
    if (this.input?.value) this.clear(new Event("input"))
  }

  ////////////////
  // ## Links
  ////////////////

  /** `path` (from the site root, or `#id`) as a link:  against `linkBase`;  a hash stays a hash. */
  private href(path: string): string {
    return path.startsWith("#") ? path : this.linkBase + path
  }

  /** Prefix of every link:  `base`, else the site root from `SiteData`. */
  private get linkBase(): string {
    if (this.base !== undefined) return this.base
    try {
      return SiteData.root()
    } catch {
      return ""
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("search")} ref={(element: HTMLElement) => this.wire(element)}>
        <div class={FIELD} part={this.partForName("field")}>
          <span class={GLYPH} aria-hidden="true">
            <ui-icon name={SEARCH_ICON} />
          </span>
          <input
            ref={(element: HTMLInputElement) => (this.input = element)}
            part={this.partForName("input")}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={this.isOpen && this.rows.length ? "true" : "false"}
            aria-controls={this.rows.length ? LISTBOX_ID : undefined}
            aria-activedescendant={
              this.isOpen && this.activeIndex >= 0 ? UIDocsSearch.optionIdFor(this.activeIndex) : undefined
            }
            aria-label={this.translationForKey("label")}
            aria-keyshortcuts={this.hasShortcuts ? KEY_SHORTCUTS : undefined}
            placeholder={this.placeholder ?? this.translationForKey("placeholder")}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            enterkeyhint="go"
            onInput={(event) => this.onInput(event)}
            onKeyDown={(event) => this.onKeyDown(event)}
            onFocus={() => this.onFocus()}
          />
          <Show when={this.isSearching}>
            <button
              type="button"
              class={CLEAR}
              tabindex="-1"
              aria-label={this.translationForKey("clear")}
              title={this.translationForKey("clear")}
              onClick={(event) => this.onClearClick(event)}
            >
              <ui-icon name={CLEAR_ICON} />
            </button>
          </Show>
          <Show when={this.hasShortcuts}>
            <span class={KEYS} part={this.partForName("keys")} aria-hidden="true">
              <kbd>{this.modifierKeyLabel}</kbd>
              <kbd>K</kbd>
            </span>
          </Show>
        </div>
        <div
          class={RESULTS}
          part={this.partForName("results")}
          popover="manual"
          ref={(element: HTMLElement) => this.wireCard(element)}
        >
          <Show when={this.rows.length}>
            <div role="listbox" id={LISTBOX_ID} class={LIST} aria-label={this.translationForKey("results")}>
              <For each={this.groupedRows}>{(group) => this.group(group.kind, group.rows)}</For>
            </div>
          </Show>
          <Show when={this.hasNoResults}>
            <p class={[NOTE, EMPTY]}>{this.translationForKey("noMatches", { query: this.query.trim() })}</p>
          </Show>
          <Show when={this.isLoading}>
            <p class={NOTE}>{this.translationForKey("loading")}</p>
          </Show>
          <div class={HINTS} part={this.partForName("hints")} aria-hidden="true">
            <span>
              <kbd>↑</kbd>
              <kbd>↓</kbd> {this.translationForKey("move")}
            </span>
            <span>
              <kbd>↵</kbd> {this.translationForKey("go")}
            </span>
            <span>
              <kbd>esc</kbd> {this.translationForKey("close")}
            </span>
          </div>
        </div>
        <span class={UIT.VISUALLY_HIDDEN} role="status">
          {this.statusText}
        </span>
      </div>
    )
  }

  /** One group:  its eyebrow, then its options. */
  private group(kind: SearchKind, rows: readonly { hit: SearchHit; index: number }[]): JSX.Element {
    const label = GROUP_ID + kind
    return (
      <div role="group" class="group" part={this.partForName("group")} aria-labelledby={label}>
        <div class={UIT.LABEL} part={this.partForName("label")} id={label}>
          {this.translationForKey(KIND_TEXT[kind])}
        </div>
        <For each={rows}>{(row) => this.option(row.hit, row.index)}</For>
      </div>
    )
  }

  /** One result:  a link with its icon, its title (matches marked, a tag in mono) and where it is. */
  private option(hit: SearchHit, index: number): JSX.Element {
    const entry = hit.entry
    const isActive = () => this.activeIndex === index
    return (
      <a
        role="option"
        id={UIDocsSearch.optionIdFor(index)}
        class={["option", entry.kind, { [UIT.ACTIVE]: isActive() }]}
        part={this.partForName("option")}
        href={this.href(entry.href)}
        tabindex="-1"
        aria-selected={isActive() ? "true" : "false"}
        data-index={String(index)}
      >
        <span class={GLYPH} aria-hidden="true">
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
        <span class={ENTER} aria-hidden="true">
          ↵
        </span>
      </a>
    )
  }

  ////////////////
  // ## Shortcuts
  ////////////////

  /** `/` and Cmd / Ctrl+K summon this field:  `shortcuts` isn't off. */
  private get hasShortcuts(): boolean {
    return this.shortcuts !== false
  }

  /** The modifier key the hint shows:  `⌘` on Apple platforms, else `Ctrl`. */
  get modifierKeyLabel(): string {
    return this.isReady && UI.browser.isApple ? "⌘" : "Ctrl"
  }

  /** Show the field (opening its drawer if it's hidden in one) and focus it, its text selected. */
  async summon(): Promise<void> {
    const before = UIDocsSearch.deepActive()
    if (before && !this.domElement.shadowRoot?.contains(before)) this.returnFocus = before
    if (!this.domElement.checkVisibility()) {
      const drawer = E.closestAcrossShadow(this.domElement, DRAWERS)
      if (drawer && !drawer.hasAttribute(OPEN)) drawer.setAttribute(OPEN, "")
      for (let frame = 0; frame < SUMMON_FRAMES && !this.domElement.checkVisibility(); frame++) await E.nextFrame()
      // the drawer moves focus into itself as it opens:  take it after
      await E.nextFrame()
    }
    this.input?.focus()
    this.input?.select()
  }

  /** SIDE EFFECT:  `/` and Cmd / Ctrl+K, while connected;  the cleanup stops listening. */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (!isConnected) return undefined
    UIDocsSearch.listen(this)
    return () => UIDocsSearch.unlisten(this)
  }

  /** Every connected field:  the shortcut picks one.  Page-wide, as the one document listener is. */
  private static readonly fields = new Set<UIDocsSearch>()

  /**
   * The one document listener, while any field is connected (static, so adding and removing it match):
   * `/` (unless typing in a field) or Cmd / Ctrl+K summons a field that takes shortcuts, the visible one,
   * else one in a drawer.
   */
  private static readonly onDocumentKey = (event: KeyboardEvent) => {
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
      fields.find((each) => each.domElement.checkVisibility()) ??
      fields.find((each) => E.closestAcrossShadow(each.domElement, DRAWERS))
    if (!field) return
    event.preventDefault()
    void field.summon()
  }

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

/** The vocabulary getters, typed (`UIComponent`'s doc). */
export interface UIDocsSearch extends E.AttributeValues<DocsSearchVocabulary> {}

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

/** Class word of the pill around the input. */
const FIELD = "field"
