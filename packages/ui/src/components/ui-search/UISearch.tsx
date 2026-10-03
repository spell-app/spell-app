import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import {
  Cell,
  Converters,
  IconGlyph,
  proto,
  UI,
  type AttributeName,
  type FieldValue,
  type OverlayEntry,
  type ValidationRule,
  UIT
} from "$/ui/core"
import { ControlLabels, FormElement, MenuOptions } from "$/ui/forms"

import { searchVocabulary } from "./ui-search.vocabulary.en"
import { SearchFallback } from "./ui-search.fallback"
import { SearchMatcher } from "./SearchMatcher"

import inputCSS from "$/ui/components/ui-input/ui-input.css?inline"
import searchCSS from "./ui-search.css?inline"
import {
  SEARCH_ICON,
  DEFAULT_FIELDS_TEXT,
  ID_PREFIX,
  INPUT,
  LOADING,
  PROMPT,
  SEARCH_ICON_CLASS,
  RESULTS,
  CATEGORY,
  NAME,
  RESULT,
  PRICE,
  ABORT_ERROR
} from "./ui-search.types"
import type { SearchVocabulary, RemoteAnswer, SearchMessage } from "./ui-search.types"
import {
  REQUIRED_RULE,
  POPOVER_OPEN,
  FLUID,
  DISABLED,
  STATUS,
  ACTIVE,
  IMAGE,
  CONTENT,
  TITLE,
  MESSAGE,
  HEADER,
  CLICK,
  DESCRIPTION
} from "$/ui/components/components.types"

/****************
 * ### `<ui-search>`
 * A combobox + listbox (APG, list autocomplete):  a text `<input>` in Fomantic's `ui icon input`, and an
 * anchor-positioned popover of results, both in the shadow root.
 * - Results:  the `source` PROPERTY searched locally (`SearchMatcher`, Fomantic's matching), or the `url` template
 *   queried through `UI.api` (`{query}`;  `search-delay` debounce, a newer query aborts an older one, answers
 *   cached per query).  `category` groups them.
 * - `value` (the input's text) and `open` are auto-controlled (`Controlled`):  events first, the host may veto /
 *   override.  Choosing a result puts its title in the input and follows its `url`.
 * - Rows render only while shown;  `aria-activedescendant` points at the highlighted one.  A polite live region
 *   announces the result count and messages.  Escape and outside clicks come from `UI.overlays`.
 * - Form-associated (decided 2026-09-30):  Fomantic's search is a wrapper around a REAL `<input class="prompt">`,
 *   which submits its text under its `name`;  so does this element, with `required` => `valueMissing`.
 ****************/
export class UISearch extends FormElement<SearchVocabulary> {
  @proto static vocabulary = searchVocabulary
  @proto static styles = { input: inputCSS, search: searchCSS }
  @proto static Fallback = SearchFallback

  ////////////////
  // ## State
  ////////////////

  /** Host `<label>`s and `aria-label`, as the input's name. */
  readonly labels = new ControlLabels(this.formHost)

  /** Highlighted index into `flat()`;  `-1` for none. */
  readonly active = new Cell(-1)

  /** The last remote answer. */
  readonly remote = new Cell<RemoteAnswer>({ query: "", groups: [], status: "idle" })

  /** A remote query is running. */
  readonly busy = new Cell(false)

  /** Bumped when the input must show the value again (a host veto of typing). */
  readonly revision = new Cell(0)

  /** `value`:  host-controlled, or internal. */
  readonly valueState = this.controlled("value", "" as never)

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled("open", false)

  /** The magnifying glass. */
  readonly glyph = new IconGlyph(this, () => SEARCH_ICON)

  /** Value to restore on form reset:  the `value` attribute. */
  private readonly initialValue = untrack(() => this.attrs.value)

  /** Value when the input took focus, to tell whether leaving it is an edit. */
  private focusValue?: string

  /** Remote answers by query. */
  private readonly cache = new Map<string, readonly UIT.SearchCategory[]>()

  /** Aborts the running remote query. */
  private controller?: AbortController

  /** Match highlighting (`MenuOptions.highlights()`). */
  private readonly highlighter = new MenuOptions()

  /** Stable DOM id per result. */
  private readonly resultIds = new WeakMap<UIT.SearchResult, string>()

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { results: "", anchor: "" }

  /** The input and the results popover. */
  private input?: HTMLInputElement
  private resultsBox?: HTMLElement

  /** This element's `UI.overlays` entry. */
  private readonly overlay: OverlayEntry = {
    element: this.host,
    kind: "popover",
    restoreFocus: false,
    onDismiss: () => void this.setOpen(false)
  }

  ////////////////
  // ## Derived
  ////////////////

  /** The input's text. */
  readonly query = createMemo(() => String(this.valueState.get() ?? ""))

  /** Long enough to search? */
  readonly enough = createMemo(() => this.query().trim().length >= Math.max(1, this.attrs.minCharacters ?? 1))

  /** Local matcher, from the matching attributes. */
  readonly matcher = createMemo(
    () =>
      new SearchMatcher({
        fields: Converters.list(this.attrs.searchFields ?? DEFAULT_FIELDS_TEXT),
        match: (this.attrs.fullTextSearch ?? "exact") as UIT.SearchMatch,
        ignoreDiacritics: this.attrs.ignoreDiacritics
      })
  )

  /** Local results of the query, grouped. */
  readonly localGroups = createMemo((): readonly UIT.SearchCategory[] => {
    const source = this.attrs.source
    if (!Array.isArray(source) || !this.enough()) return []
    const max = this.attrs.maxResults ?? 0
    let results = this.matcher().search(source as UIT.SearchResult[], this.query())
    if (max > 0) results = results.slice(0, max)
    return this.attrs.category ? SearchMatcher.categorize(results) : [{ name: "", results }]
  })

  /** Results shown now, grouped:  the last remote answer, or the local ones. */
  readonly groups = createMemo((): readonly UIT.SearchCategory[] =>
    this.attrs.url ? (this.enough() ? this.remote.get().groups : []) : this.localGroups()
  )

  /** Every shown result, in order:  what the arrows move through. */
  readonly flat = createMemo((): readonly UIT.SearchResult[] => this.groups().flatMap((group) => group.results))

  /** Highlighted result. */
  readonly highlighted = createMemo(() => this.flat()[this.active.get()] as UIT.SearchResult | undefined)

  /** What to say instead of results, if anything. */
  readonly message = createMemo((): SearchMessage | undefined => {
    if (!this.enough() || this.flat().length) return undefined
    const remote = this.remote.get()
    const current = !this.attrs.url || (remote.query === this.query().trim() && !this.busy.get())
    if (!current) return undefined
    if (this.attrs.url && remote.status === "error") return { kind: "error", text: this.text("searchServerError") }
    if (this.attrs.url && remote.status !== "done") return undefined
    if (this.attrs.showNoResults === false) return undefined
    return { kind: "empty", header: this.text("searchNoResultsHeader"), text: this.text("searchNoResults") }
  })

  /** Results (or a message) are showing. */
  readonly shown = createMemo(() => this.isOpen() && this.enough() && (!!this.flat().length || !!this.message()))

  /** Open (asked to show results). */
  isOpen(): boolean {
    return this.openState.get()
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.formDisabled.get()
  }

  /** Busy:  the `loading` attribute, or a remote query running. */
  isLoading(): boolean {
    return this.attrs.loading || this.busy.get()
  }

  /** Name for the input:  its `<label>`s / `aria-label`, else `placeholder`, else the translated `label`. */
  private label(): string {
    return this.labels.name() ?? this.attrs.placeholder ?? this.text("searchLabel")
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: AttributeName<SearchVocabulary>): unknown {
    if (name === "disabled") return this.isDisabled()
    if (name === "loading") return this.isLoading()
    return super.classValue(name)
  }

  protected hostStates() {
    return {
      open: this.shown(),
      disabled: this.isDisabled(),
      loading: this.isLoading(),
      fluid: this.attrs.fluid
    }
  }

  formValue(): FieldValue {
    return this.query()
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  formReset() {
    this.valueState.set(this.initialValue as never)
    this.revision.set(untrack(() => this.revision.get()) + 1)
    this.active.set(-1)
  }

  protected rules(): ValidationRule[] {
    return this.attrs.required ? [REQUIRED_RULE] : []
  }

  protected validationLabel(): string | undefined {
    return this.label()
  }

  protected validationAnchor(): HTMLElement | undefined {
    return this.input
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Adds the input sync, the popover / overlay, scrolling and the label refresh to `FormElement.mount()`. */
  mount() {
    createEffect(
      () => [this.query(), this.revision.get(), this.loaded()],
      () => {
        const value = untrack(() => this.query())
        if (this.input && this.input.value !== value) this.input.value = value
      }
    )
    createEffect(
      () => this.shown() && this.connected.get(),
      (shown) => {
        const box = this.resultsBox
        if (!shown || !box) return
        if (!box.matches(POPOVER_OPEN)) box.showPopover()
        UI.overlays.open(this.overlay)
        return () => {
          if (box.matches(POPOVER_OPEN)) box.hidePopover()
          UI.overlays.close(this.overlay)
        }
      }
    )
    createEffect(
      () => (this.shown() ? this.highlighted() : undefined),
      (result) => {
        if (result) this.host.renderRoot.getElementById(this.resultId(result))?.scrollIntoView({ block: "nearest" })
      }
    )
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (connected) this.labels.refresh()
      }
    )
    return super.mount()
  }

  render(): JSX.Element {
    this.ids = { results: UI.ids.next(ID_PREFIX), anchor: `--${UI.ids.next(ID_PREFIX)}` }
    return (
      <div class={this.classes()} part={this.part("search")} style={{ [UIT.SEARCH_ANCHOR_PROPERTY]: this.ids.anchor }}>
        <div
          class={[INPUT, { [LOADING]: this.isLoading(), [FLUID]: this.attrs.fluid, [DISABLED]: this.isDisabled() }]}
          part={this.part("input")}
        >
          <input
            ref={(element) => (this.input = element)}
            class={PROMPT}
            part={this.part("prompt")}
            type="text"
            role="combobox"
            autocomplete="off"
            spellcheck={false}
            enterkeyhint="search"
            value={untrack(() => this.query())}
            placeholder={this.attrs.placeholder}
            disabled={this.isDisabled()}
            aria-autocomplete="list"
            aria-haspopup="listbox"
            aria-expanded={this.shown() && this.flat().length ? "true" : "false"}
            aria-controls={this.ids.results}
            aria-activedescendant={this.shown() && this.highlighted() ? this.resultId(this.highlighted()!) : undefined}
            aria-label={this.label()}
            aria-busy={this.isLoading() ? "true" : undefined}
            aria-required={this.attrs.required ? "true" : undefined}
            aria-invalid={this.validation().valid ? undefined : "true"}
            {...this.staticControl()}
            onInput={this.onInput}
            onKeyDown={this.onKeyDown}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onClick={this.onClick}
          />
          <span class={SEARCH_ICON_CLASS} part={this.part("icon")}>
            <slot name={this.slot("icon")}>{this.glyph.svg()}</slot>
          </span>
        </div>
        {this.resultsElement()}
        <span class={STATUS} role="status">
          {this.status()}
        </span>
      </div>
    )
  }

  /**
   * Server render only (`$/ui/server`):  the input's `name` (it holds the query, the value) and the `STATIC_CONTROL`
   * mark, so a static form submits it;  `{}` in a browser, where the HOST submits (`ElementInternals`).
   */
  private staticControl(): Record<string, unknown> {
    return isServer ? { [UIT.STATIC_CONTROL]: "", name: this.attrs.name } : {}
  }

  /** The results popover:  a listbox while there are results, else the message. */
  private resultsElement(): JSX.Element {
    return (
      <div
        ref={(element) => (this.resultsBox = element)}
        id={this.ids.results}
        class={RESULTS}
        popover="manual"
        part={this.part("results")}
        role={this.flat().length ? "listbox" : undefined}
        aria-label={this.flat().length ? this.label() : undefined}
        onMouseDown={UISearch.preventDefault}
      >
        <Show when={this.shown()}>
          <Show when={this.flat().length} fallback={this.messageElement()}>
            <Show when={this.attrs.category} fallback={<For each={this.flat()}>{(result) => this.row(result)}</For>}>
              <For each={this.groups()}>{(group, index) => this.categoryElement(group, index)}</For>
            </Show>
          </Show>
        </Show>
      </div>
    )
  }

  /** One category:  its name, then its results, as a named `group`. */
  private categoryElement(group: UIT.SearchCategory, index: () => number): JSX.Element {
    // a function:  `index` is `<For>`'s accessor, so it's read in JSX (tracked), never in the callback body
    const nameId = () => `${this.ids.results}-category-${index()}`
    return (
      <div
        class={[CATEGORY, { [ACTIVE]: group.results.includes(this.highlighted()!) }]}
        role="group"
        aria-labelledby={nameId()}
        part={this.part("category")}
      >
        <div id={nameId()} class={NAME} part={this.part("name")}>
          {group.name}
        </div>
        <div class={RESULTS} role="none">
          <For each={group.results}>{(result) => this.row(result)}</For>
        </div>
      </div>
    )
  }

  /**
   * One result:  a link when it has a `url` (Fomantic's `<a class="result">`, `tabindex=-1`:  focus stays in the
   * input), else a `<div>`.
   */
  private row(result: UIT.SearchResult): JSX.Element {
    const url = typeof result.url === "string" && result.url ? result.url : undefined
    const classes = () => [RESULT, { [ACTIVE]: this.highlighted() === result }]
    const selected = () => (this.highlighted() === result ? "true" : "false")
    const onPointerMove = () => this.highlight(result)
    const onClick = (event: MouseEvent) => this.select(result, event)
    if (url) {
      return (
        <a
          id={this.resultId(result)}
          class={classes()}
          href={url}
          tabindex="-1"
          role="option"
          part={this.part("result")}
          aria-selected={selected()}
          onPointerMove={onPointerMove}
          onClick={onClick}
        >
          {this.resultContent(result)}
        </a>
      )
    }
    return (
      <div
        id={this.resultId(result)}
        class={classes()}
        role="option"
        part={this.part("result")}
        aria-selected={selected()}
        onPointerMove={onPointerMove}
        onClick={onClick}
      >
        {this.resultContent(result)}
      </div>
    )
  }

  /** Image, price, title, description:  Fomantic's result template. */
  private resultContent(result: UIT.SearchResult): JSX.Element {
    return (
      <>
        <Show when={typeof result.image === "string"}>
          <div class={IMAGE}>
            <img src={result.image as string} alt={typeof result.alt === "string" ? result.alt : ""} />
          </div>
        </Show>
        <div class={CONTENT}>
          <Show when={result.price !== undefined && result.price !== null}>
            <div class={PRICE}>{String(result.price)}</div>
          </Show>
          <div class={TITLE}>{this.marked(String(result.title ?? ""))}</div>
          <Show when={result.description}>
            <div class={DESCRIPTION}>{this.marked(String(result.description))}</div>
          </Show>
        </div>
      </>
    )
  }

  /** The no-results or error message. */
  private messageElement(): JSX.Element {
    return (
      <Show when={this.message()}>
        {(message) => (
          <div class={[MESSAGE, message().kind]} part={this.part("message")}>
            <Show when={message().header}>
              <div class={HEADER}>{message().header}</div>
            </Show>
            <div class={DESCRIPTION}>{message().text}</div>
          </div>
        )}
      </Show>
    )
  }

  /** `text` with the query in `<mark>`, when `highlight-matches`. */
  private marked(text: string): JSX.Element {
    const query = this.query().trim()
    if (!this.attrs.highlightMatches || !query) return text
    const ranges = this.highlighter.highlights({ value: "", text }, query, {
      ignoreDiacritics: this.attrs.ignoreDiacritics
    })
    const parts: JSX.Element[] = []
    let at = 0
    for (const [start, end] of ranges) {
      if (start > at) parts.push(text.slice(at, start))
      parts.push(<mark>{text.slice(start, end)}</mark>)
      at = end
    }
    if (at < text.length) parts.push(text.slice(at))
    return parts
  }

  /** What the live region says:  the result count, or the message. */
  private status(): string {
    if (!this.shown()) return ""
    const count = this.flat().length
    if (count === 1) return this.text("searchOneResult")
    if (count) return this.text("searchResultCount", { count })
    return this.message()?.text ?? ""
  }

  /** Stable id for `result`'s row. */
  private resultId(result: UIT.SearchResult): string {
    let id = this.resultIds.get(result)
    if (!id) this.resultIds.set(result, (id = `${this.ids.results}-${++UISearch.resultCounter}`))
    return id
  }

  ////////////////
  // ## Transitions
  ////////////////

  /** Show or hide the results, dispatching the cancelable `ui-open` / `ui-close` first. */
  setOpen(open: boolean, originalEvent?: Event): boolean {
    if (open === untrack(() => this.isOpen())) return false
    if (open && this.isDisabled()) return false
    const done = this.openState.request(open, () => this.emit(open ? "ui-open" : "ui-close", { open, originalEvent }))
    if (done && open) this.active.set(this.attrs.selectFirstResult ? 0 : -1)
    return done
  }

  /**
   * Choose `result`, as the user did with `originalEvent`:  the cancelable `ui-select` first, then its title in the
   * input (`ui-change`), the results hidden, and its `url` followed.
   * - A click on a result LINK follows it natively (new tabs work);  other ways follow it with `location.assign()`.
   */
  select(result: UIT.SearchResult, originalEvent?: Event) {
    if (!this.emit("ui-select", { result, originalEvent })) {
      originalEvent?.preventDefault()
      return
    }
    this.commit(String(result.title ?? ""), originalEvent)
    this.setOpen(false, originalEvent)
    const url = typeof result.url === "string" ? result.url : undefined
    if (url && originalEvent?.type !== CLICK) location.assign(url)
  }

  /** Commit `value` as the input's text, with `ui-change`;  the input shows the host's value if it vetoed. */
  private commit(value: string, originalEvent?: Event) {
    this.valueState.request(value as never, () => {
      this.emit("ui-change", { value, originalEvent })
      return true
    })
    this.focusValue = value
    this.revision.set(untrack(() => this.revision.get()) + 1)
  }

  /** Run the query in `text` (typed, or on focus):  open, and ask the server when there's a `url`. */
  private run(text: string, originalEvent?: Event) {
    const query = text.trim()
    if (query.length < Math.max(1, this.attrs.minCharacters ?? 1)) return
    this.setOpen(true, originalEvent)
    if (this.attrs.url) this.fetch(query)
  }

  /**
   * Ask the `url` for `query`'s results through `UI.api`:  debounced by `search-delay`, the previous query
   * aborted, the answer cached per query.  An aborted query is ignored;  a failed one shows `serverError`.
   */
  private fetch(query: string) {
    const url = this.attrs.url!
    const cached = this.cache.get(query)
    this.controller?.abort()
    if (cached) {
      this.controller = undefined
      this.busy.set(false)
      this.remote.set({ query, groups: cached, status: "done" })
      return
    }
    const controller = (this.controller = new AbortController())
    this.busy.set(true)
    const max = this.attrs.maxResults ?? 0
    UI.api
      .request<UIT.SearchResponse>({
        url,
        urlData: { query },
        throttle: this.attrs.searchDelay ?? 0,
        key: this.ids.results,
        signal: controller.signal
      })
      .then((response) => {
        const groups = SearchMatcher.groups(response, max)
        this.cache.set(query, groups)
        // superseded while the answer was on its way (a transport that ignores the signal still delivers it):  cached,
        // not shown
        if (controller.signal.aborted) return
        this.remote.set({ query, groups, status: "done" })
        this.emit("ui-results", { query, results: groups.flatMap((group) => group.results) })
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted || (error as Error)?.name === ABORT_ERROR) return
        this.remote.set({ query, groups: [], status: "error" })
      })
      .finally(() => {
        if (this.controller !== controller) return
        this.controller = undefined
        this.busy.set(false)
      })
  }

  /** Highlight `result` if it's shown. */
  private highlight(result: UIT.SearchResult) {
    const index = untrack(() => this.flat()).indexOf(result)
    if (index >= 0 && index !== untrack(() => this.active.get())) this.active.set(index)
  }

  /** Move the highlight by `delta`, stopping at the ends (Fomantic's arrows). */
  private move(delta: number) {
    const count = untrack(() => this.flat()).length
    if (!count) return
    const from = untrack(() => this.active.get())
    this.active.set(from < 0 ? (delta > 0 ? 0 : count - 1) : Math.max(0, Math.min(count - 1, from + delta)))
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Typing:  the value (with `ui-search` once long enough), then the query. */
  private readonly onInput = (event: Event) => {
    const text = (event.currentTarget as HTMLInputElement).value
    const long = text.trim().length >= Math.max(1, this.attrs.minCharacters ?? 1)
    this.valueState.request(text as never, () => {
      if (long) this.emit("ui-search", { query: text.trim(), originalEvent: event })
      return true
    })
    this.revision.set(untrack(() => this.revision.get()) + 1)
    this.active.set(this.attrs.selectFirstResult ? 0 : -1)
    this.run(text, event)
  }

  /** Focus:  remember the value;  show the results of what's there (Fomantic's `searchOnFocus`). */
  private readonly onFocus = (event: FocusEvent) => {
    this.focusValue = untrack(() => this.query())
    this.run(this.focusValue, event)
  }

  /** A click in the input reopens results the user closed. */
  private readonly onClick = (event: MouseEvent) => {
    if (!untrack(() => this.isOpen()))
      this.run(
        untrack(() => this.query()),
        event
      )
  }

  /** Leaving:  close (unless focus stays inside);  an edited text commits with `ui-change`. */
  private readonly onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (next && (this.host.contains(next) || this.host.renderRoot.contains(next))) return
    this.setOpen(false, event)
    const value = untrack(() => this.query())
    if (this.focusValue !== undefined && value !== this.focusValue)
      this.emit("ui-change", { value, originalEvent: event })
    this.focusValue = undefined
  }

  /** Combobox keys:  arrows move, Enter chooses, Escape clears a closed search (an open one closes, overlays). */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled() || event.defaultPrevented || event.isComposing) return
    const open = untrack(() => this.shown())
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        if (!open)
          this.run(
            untrack(() => this.query()),
            event
          )
        else this.move(1)
        return
      case "ArrowUp":
        if (!open) return
        event.preventDefault()
        this.move(-1)
        return
      case "Enter": {
        const result = open ? untrack(() => this.highlighted()) : undefined
        if (result) {
          event.preventDefault()
          this.select(result, event)
        } else this.formHost.form?.requestSubmit()
        return
      }
      case "Escape":
        // showing:  `UI.overlays` closes it;  else Escape clears (APG)
        if (open || !untrack(() => this.query())) return
        event.preventDefault()
        this.setOpen(false, event)
        this.commit("", event)
        return
      case "Tab":
        if (untrack(() => this.isOpen())) this.setOpen(false, event)
        return
    }
  }

  /** `preventDefault()`:  presses in the results must not take focus from the input. */
  private static preventDefault(event: Event) {
    event.preventDefault()
  }

  /** Counter behind result ids. */
  private static resultCounter = 0
}
