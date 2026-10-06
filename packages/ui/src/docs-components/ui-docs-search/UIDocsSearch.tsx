import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, closestAcrossShadow, nextFrame, proto, UI, UIElement, Warnings } from "$/ui/core"
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
  type SearchKind
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
export class UIDocsSearch extends UIElement<DocsSearchVocabulary> implements DocsSearchController {
  @proto static vocabulary = docsSearchVocabulary
  @proto static styles = { "docs-search": searchCSS }
  @proto static Fallback = DocsSearchFallback
  @proto static Host = DocsSearchHost

  /** The text typed, as typed. */
  readonly typed = new Cell("")

  /** The card is wanted:  the field has focus (or was typed in) since the last close. */
  readonly open = new Cell(false)

  /** Index of the highlighted result (clamped by `active()`). */
  readonly highlight = new Cell(0)

  /** The page shown's sections, read on focus and on the first keystroke. */
  readonly outline = new Cell<readonly SearchEntry[]>([])

  /** The page shown's path from the site root, e.g. `components/ui-divider.html` (read with `outline`). */
  readonly current = new Cell<string | undefined>(undefined)

  /** Everything else, once the site's data is in (or has failed:  an index of what did load). */
  readonly index = new Cell<SearchIndex | undefined>(undefined)

  /** The site's data was asked for. */
  readonly preparing = new Cell(false)

  /** The `<input>`, while rendered. */
  private input: HTMLInputElement | undefined

  /** The results popover, while rendered. */
  private card: HTMLElement | undefined

  /** What had focus before a shortcut summoned the field:  Escape on an empty field returns there. */
  private returnFocus: HTMLElement | undefined

  /** The index of nothing:  what the page shown is searched with until the data is in. */
  private static readonly EMPTY = new SearchIndex(undefined)

  ////////////////
  // ## Derived state
  ////////////////

  /** The groups found, best first. */
  readonly groups = createMemo(() =>
    (this.index.get() ?? UIDocsSearch.EMPTY).search(this.typed.get(), this.outline.get(), this.current.get())
  )

  /** Every result in order, with its group:  what ↑ / ↓ walk. */
  readonly rows = createMemo(() => this.groups().flatMap((group) => group.hits))

  /** The highlighted result's index, within the rows;  -1 with none. */
  readonly active = createMemo(() => Math.min(this.highlight.get(), this.rows().length - 1))

  /** Text is typed (blank isn't). */
  readonly searching = createMemo(() => !!this.typed.get().trim())

  /** The card shows. */
  readonly shown = createMemo(() => this.open.get() && this.searching())

  /** The site's data is on its way. */
  readonly loading = createMemo(() => this.preparing.get() && !this.index.get())

  /** Groups with each row's index among all rows. */
  readonly view = createMemo(() => {
    let index = 0
    return this.groups().map((group) => ({
      kind: group.kind,
      rows: group.hits.map((hit) => ({ hit, index: index++ }))
    }))
  })

  /** The modifier key the hint shows:  `⌘` on Apple platforms, else `Ctrl`. */
  readonly modifier = createMemo(() => (this.loaded() && UI.browser.isApple ? "⌘" : "Ctrl"))

  protected override hostStates() {
    return {
      open: this.shown(),
      searching: this.searching(),
      empty: this.searching() && !this.rows().length && !this.loading(),
      loading: this.loading()
    }
  }

  /** Base `mount()`, plus the effects:  the popover follows `shown`, the highlight scrolls into view, shortcuts. */
  override mount(): JSX.Element {
    const content = super.mount()
    if (isServer) return content
    // SIDE EFFECT:  the popover opens and shuts with `shown`
    createEffect(
      () => this.shown(),
      (shown) => {
        this.showCard(shown)
      }
    )
    // SIDE EFFECT:  the highlighted option stays in the card's view
    createEffect(
      () => (this.shown() ? this.active() : -1),
      (active) => {
        if (active >= 0) this.option(active)?.scrollIntoView({ block: "nearest" })
      }
    )
    // SIDE EFFECT:  `/` and Cmd / Ctrl+K, while connected
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (!connected) return undefined
        UIDocsSearch.listen(this)
        return () => UIDocsSearch.unlisten(this)
      }
    )
    return content
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("search")} ref={(element: HTMLElement) => this.wire(element)}>
        <div class="field" part={this.part("field")}>
          <span class="glyph" aria-hidden="true">
            <ui-icon name={SEARCH_ICON} />
          </span>
          <input
            ref={(element: HTMLInputElement) => (this.input = element)}
            part={this.part("input")}
            type="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={this.shown() && this.rows().length ? "true" : "false"}
            aria-controls={this.rows().length ? UIDocsSearch.LISTBOX : undefined}
            aria-activedescendant={
              this.shown() && this.active() >= 0 ? UIDocsSearch.optionId(this.active()) : undefined
            }
            aria-label={this.text("label")}
            aria-keyshortcuts={this.attrs.shortcuts === false ? undefined : "/ Meta+K Control+K"}
            placeholder={this.attrs.placeholder ?? this.text("placeholder")}
            autocomplete="off"
            autocapitalize="off"
            spellcheck="false"
            enterkeyhint="go"
            onInput={(event) => this.onInput(event)}
            onKeyDown={(event) => this.onKeyDown(event)}
            onFocus={() => this.onFocus()}
          />
          <Show when={this.searching()}>
            <button
              type="button"
              class="clear"
              tabindex="-1"
              aria-label={this.text("clear")}
              title={this.text("clear")}
              onClick={(event) => this.clear(event, true)}
            >
              <ui-icon name={CLEAR_ICON} />
            </button>
          </Show>
          <Show when={this.attrs.shortcuts !== false}>
            <span class="keys" part={this.part("keys")} aria-hidden="true">
              <kbd>{this.modifier()}</kbd>
              <kbd>K</kbd>
            </span>
          </Show>
        </div>
        <div
          class="results"
          part={this.part("results")}
          popover="manual"
          ref={(element: HTMLElement) => this.wireCard(element)}
        >
          <Show when={this.rows().length}>
            <div role="listbox" id={UIDocsSearch.LISTBOX} class="list" aria-label={this.text("results")}>
              <For each={this.view()}>{(group) => this.group(group.kind, group.rows)}</For>
            </div>
          </Show>
          <Show when={this.searching() && !this.rows().length && !this.loading()}>
            <p class="note empty">{this.text("noMatches", { query: this.typed.get().trim() })}</p>
          </Show>
          <Show when={this.loading()}>
            <p class="note">{this.text("loading")}</p>
          </Show>
          <div class="hints" part={this.part("hints")} aria-hidden="true">
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
        <span class="ui-visually-hidden-force" role="status">
          {this.status()}
        </span>
      </div>
    )
  }

  /** One group:  its eyebrow, then its options. */
  private group(kind: SearchKind, rows: readonly { hit: SearchHit; index: number }[]): JSX.Element {
    const label = `docs-search-group-${kind}`
    return (
      <div role="group" class="group" part={this.part("group")} aria-labelledby={label}>
        <div class="label" part={this.part("label")} id={label}>
          {this.text(KIND_TEXT[kind])}
        </div>
        <For each={rows}>{(row) => this.renderOption(row.hit, row.index)}</For>
      </div>
    )
  }

  /** One result:  a link with its icon, its title (matches marked, a tag in mono) and where it is. */
  private renderOption(hit: SearchHit, index: number): JSX.Element {
    const entry = hit.entry
    const active = () => this.active() === index
    return (
      <a
        role="option"
        id={UIDocsSearch.optionId(index)}
        class={["option", entry.kind, { active: active() }]}
        part={this.part("option")}
        href={this.href(entry.href)}
        tabindex="-1"
        aria-selected={active() ? "true" : "false"}
        data-index={String(index)}
      >
        <span class="glyph" aria-hidden="true">
          <ui-icon name={KIND_ICON[entry.kind]} />
        </span>
        <span class="text">
          <span class="title">
            <span class="name">
              <For each={UIDocsSearch.segments(entry.title, hit.marks)}>
                {(piece) => (piece.mark ? <mark>{piece.text}</mark> : piece.text)}
              </For>
            </span>
            <Show when={entry.code}>
              <code>{entry.code}</code>
            </Show>
          </span>
          <Show when={entry.context}>
            <span class="context">{entry.context}</span>
          </Show>
        </span>
        <span class="enter" aria-hidden="true">
          ↵
        </span>
      </a>
    )
  }

  /** The live status:  how many results, while the card shows. */
  private status(): string {
    if (!this.shown() || this.loading()) return ""
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

  /** Show or hide the popover (it may be gone, or already so). */
  private showCard(shown: boolean) {
    const card = this.card
    if (!card?.isConnected) return
    const open = card.matches(":popover-open")
    if (shown && !open) card.showPopover()
    else if (!shown && open) card.hidePopover()
  }

  /** The field has focus:  read the page, start the data, reopen the card. */
  private onFocus() {
    this.refresh()
    this.prepare()
    this.open.set(true)
  }

  /** Focus left the box (and its card):  close. */
  private onFocusOut(event: FocusEvent) {
    const next = event.relatedTarget as Node | null
    if (next && (this.host.shadowRoot?.contains(next) || next === this.host)) return
    this.open.set(false)
  }

  /** A keystroke changed the text:  search again from the top;  `ui-input`. */
  private onInput(event: Event) {
    const value = (event.target as HTMLInputElement).value
    if (!untrack(() => this.typed.get()).trim() && value.trim()) this.refresh()
    this.prepare()
    this.typed.set(value)
    this.highlight.set(0)
    this.open.set(true)
    this.emit("ui-input", { value, originalEvent: event })
  }

  /** ↑ / ↓ / Enter / Escape / Tab (see the class). */
  private onKeyDown(event: KeyboardEvent) {
    const count = untrack(() => this.rows().length)
    const shown = untrack(() => this.shown())
    switch (event.key) {
      case "ArrowDown":
      case "ArrowUp": {
        if (!untrack(() => this.searching())) return
        event.preventDefault()
        if (!shown) {
          this.open.set(true)
          return
        }
        if (!count) return
        const step = event.key === "ArrowDown" ? 1 : -1
        this.highlight.set((untrack(() => this.active()) + step + count) % count)
        return
      }
      case "Enter": {
        if (event.isComposing || !untrack(() => this.searching())) return
        event.preventDefault()
        const active = untrack(() => this.active())
        if (active >= 0) this.choose(active, event)
        return
      }
      case "Escape":
        return this.onEscape(event)
      case "Tab":
        this.open.set(false)
        return
    }
  }

  /** Escape:  close the card;  else clear the text;  else leave the field, to where a shortcut came from. */
  private onEscape(event: KeyboardEvent) {
    if (untrack(() => this.shown())) {
      event.preventDefault()
      event.stopPropagation()
      this.open.set(false)
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

  /** The pointer moved over an option:  highlight it. */
  private onHover(event: PointerEvent) {
    const index = UIDocsSearch.indexOf(event)
    if (index !== undefined && index !== untrack(() => this.active())) this.highlight.set(index)
  }

  /** A click on an option:  pick it (a modified click is the browser's:  a new tab, a download ...). */
  private onClick(event: MouseEvent) {
    const index = UIDocsSearch.indexOf(event)
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
    const link = this.option(index)
    if (!hit || !link) return
    const href = link.href
    if (event.type === "keydown" && (event.metaKey || event.ctrlKey)) {
      window.open(href, "_blank", "noopener")
      return
    }
    const follow = this.emit("ui-navigate", { href, kind: hit.entry.kind, originalEvent: event })
    setTimeout(() => this.finish())
    if (!follow) {
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
    const drawer = closestAcrossShadow(this.host, DRAWERS)
    if (drawer?.hasAttribute("open")) drawer.removeAttribute("open")
    if (location.hash === hash) {
      window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL: location.href, newURL: location.href }))
    } else location.hash = hash
  }

  /** After a pick:  close the card, empty the field (the list beside it unfilters). */
  private finish() {
    this.open.set(false)
    if (this.input?.value) this.clear(new Event("input"))
  }

  /** Empty the field;  `ui-input`.  `refocus`:  the clear button was clicked, so focus goes back to the field. */
  private clear(event: Event, refocus = false) {
    if (this.input) this.input.value = ""
    this.typed.set("")
    this.highlight.set(0)
    this.emit("ui-input", { value: "", originalEvent: event })
    if (refocus) this.input?.focus()
  }

  /** Read the page shown:  its sections and its path. */
  private refresh() {
    const page = this.attrs.page || DEFAULT_PAGE
    this.outline.set(PageOutline.read(document.querySelector(page)))
    this.current.set(this.pagePath())
  }

  /** Start fetching the site's data, once:  `index` gets what loads (both, one, or neither). */
  private prepare() {
    if (untrack(() => this.preparing.get())) return
    this.preparing.set(true)
    void Promise.allSettled([SiteData.load(), SearchData.load()]).then(([data, search]) => {
      for (const result of [data, search]) {
        if (result.status === "rejected") Warnings.warn("<ui-docs-search>", "the index didn't load:", result.reason)
      }
      const site = data.status === "fulfilled" ? data.value : undefined
      this.index.set(new SearchIndex(site, search.status === "fulfilled" ? search.value : undefined))
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
  private option(index: number): HTMLAnchorElement | undefined {
    return this.card?.querySelector<HTMLAnchorElement>(`#${UIDocsSearch.optionId(index)}`) ?? undefined
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
      const drawer = closestAcrossShadow(this.host, DRAWERS)
      if (drawer && !drawer.hasAttribute("open")) drawer.setAttribute("open", "")
      for (let frame = 0; frame < SUMMON_FRAMES && !this.host.checkVisibility(); frame++) await nextFrame()
      // the drawer moves focus into itself as it opens:  take it after
      await nextFrame()
    }
    this.input?.focus()
    this.input?.select()
  }

  ////////////////
  // ## Shortcuts
  ////////////////

  /** Id of the listbox in the shadow root. */
  private static readonly LISTBOX = "docs-search-results"

  /** Every connected field:  the shortcut picks one. */
  private static readonly fields = new Set<UIDocsSearch>()

  /** The one document listener, while any field is connected. */
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
    const palette = event.key.toLowerCase() === SHORTCUT_KEYS.palette && (event.metaKey || event.ctrlKey)
    const slash = event.key === SHORTCUT_KEYS.slash && !event.metaKey && !event.ctrlKey
    if (!palette && !slash) return
    if (slash) {
      const origin = event.composedPath()[0]
      if (origin instanceof HTMLElement && (origin.isContentEditable || origin.matches(TYPING_SELECTOR))) return
    }
    const fields = [...UIDocsSearch.fields].filter((field) => field.attrs.shortcuts !== false)
    const field =
      fields.find((each) => each.host.checkVisibility()) ??
      fields.find((each) => closestAcrossShadow(each.host, DRAWERS))
    if (!field) return
    event.preventDefault()
    void field.summon()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Id of the option at `index`. */
  private static optionId(index: number): string {
    return `docs-search-option-${index}`
  }

  /** The option index on `event`'s path, if any. */
  private static indexOf(event: Event): number | undefined {
    for (const target of event.composedPath()) {
      if (target instanceof Element && target.hasAttribute("data-index"))
        return Number(target.getAttribute("data-index"))
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
  static segments(title: string, marks: readonly (readonly [number, number])[]): { text: string; mark: boolean }[] {
    const pieces: { text: string; mark: boolean }[] = []
    let at = 0
    for (const [start, end] of marks) {
      if (start > at) pieces.push({ text: title.slice(at, start), mark: false })
      pieces.push({ text: title.slice(start, end), mark: true })
      at = end
    }
    if (at < title.length) pieces.push({ text: title.slice(at), mark: false })
    return pieces
  }
}
