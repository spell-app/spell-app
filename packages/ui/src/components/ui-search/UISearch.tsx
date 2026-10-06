import { For, Show, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UI, UIT } from "$/ui/core"
import { F } from "$/ui/forms"
import { searchVocabulary } from "./ui-search.vocabulary.en"
import { SearchFallback } from "./ui-search.fallback"
import { SearchMatcher } from "./SearchMatcher"
import {
  INPUT,
  PROMPT,
  RemoteStatus,
  SearchMessageKind,
  type RemoteAnswer,
  type SearchMessage,
  type Vocabulary
} from "./ui-search.types"

import inputCSS from "$/ui/components/ui-input/ui-input.css?inline"
import searchCSS from "./ui-search.css?inline"

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
export class UISearch extends F.FormElement<Vocabulary> {
  @E.proto static vocabulary = searchVocabulary
  @E.proto static styles = { input: inputCSS, search: searchCSS }
  @E.proto static Fallback = SearchFallback

  ////////////////
  // ## State
  ////////////////

  /** Host `<label>`s and `aria-label`, as the input's name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** Highlighted index into `flat()`;  `-1` for none. */
  readonly active = new E.Cell(-1)

  /** The last remote answer. */
  readonly remote = new E.Cell<RemoteAnswer>({ query: "", groups: [], status: RemoteStatus.idle })

  /** A remote query is running. */
  readonly isFetching = new E.Cell(false)

  /** Bumped when the input must show the value again (a host veto of typing). */
  readonly revision = new E.Cell(0)

  /** `value`:  host-controlled, or internal. */
  readonly valueState = this.controlled("value", "" as never)

  /** `open`:  host-controlled, or internal. */
  readonly openState = this.controlled("open", false)

  /** The magnifying glass. */
  readonly glyph = new E.IconGlyph(this, () => SEARCH_ICON)

  /** Value to restore on form reset:  the `value` attribute. */
  private readonly initialValue = untrack(() => this.attrs.value)

  /** Value when the input took focus, to tell whether leaving it is an edit. */
  private focusValue?: string

  /** Remote answers by query. */
  private readonly cache = new Map<string, readonly UIT.SearchCategory[]>()

  /** Aborts the running remote query. */
  private abortController?: AbortController

  /** Match highlighting (`MenuOptions.highlights()`). */
  private readonly highlighter = new F.MenuOptions()

  /** Stable DOM id per result. */
  private readonly resultIds = new WeakMap<UIT.SearchResult, string>()

  /** Ids / anchor name, from `UI.ids` once rendering. */
  private ids = { results: "", anchor: "" }

  /** The text input. */
  private input?: HTMLInputElement

  /** The results popover. */
  private resultsBox?: HTMLElement

  /** This element's `UI.overlays` entry. */
  private readonly overlay: E.OverlayEntry = {
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
  readonly isLongEnough = createMemo(() => this.isLongEnoughQuery(this.query()))

  /** Local matcher, from the matching attributes. */
  readonly matcher = createMemo(() => {
    const fields = this.attrs.searchFields
    return new SearchMatcher({
      fields: fields === undefined ? undefined : E.Converters.list(fields),
      match: this.attrs.fullTextSearch as UIT.SearchMatch | undefined,
      ignoreDiacritics: this.attrs.ignoreDiacritics
    })
  })

  /** Local results of the query, grouped. */
  readonly localGroups = createMemo((): readonly UIT.SearchCategory[] => {
    const source = this.attrs.source
    if (!Array.isArray(source) || !this.isLongEnough()) return []
    const max = this.attrs.maxResults ?? 0
    let results = this.matcher().search(source as UIT.SearchResult[], this.query())
    if (max > 0) results = results.slice(0, max)
    return this.attrs.category ? SearchMatcher.categorize(results) : [{ name: "", results }]
  })

  /** Results shown now, grouped:  the last remote answer, or the local ones. */
  readonly groups = createMemo((): readonly UIT.SearchCategory[] =>
    this.attrs.url ? (this.isLongEnough() ? this.remote.get().groups : []) : this.localGroups()
  )

  /** Every shown result, in order:  what the arrows move through. */
  readonly flat = createMemo((): readonly UIT.SearchResult[] => this.groups().flatMap((group) => group.results))

  /** Highlighted result. */
  readonly highlighted = createMemo(() => this.flat()[this.active.get()] as UIT.SearchResult | undefined)

  /** What to say instead of results, if anything. */
  readonly message = createMemo((): SearchMessage | undefined => {
    if (!this.isLongEnough() || this.flat().length) return undefined
    const remote = this.remote.get()
    const isCurrent = !this.attrs.url || (remote.query === this.query().trim() && !this.isFetching.get())
    if (!isCurrent) return undefined
    if (this.attrs.url && remote.status === RemoteStatus.error) {
      return { kind: SearchMessageKind.error, text: this.text("searchServerError") }
    }
    if (this.attrs.url && remote.status !== RemoteStatus.done) return undefined
    if (this.attrs.showNoResults === false) return undefined
    return {
      kind: SearchMessageKind.empty,
      header: this.text("searchNoResultsHeader"),
      text: this.text("searchNoResults")
    }
  })

  /** Results (or a message) are showing. */
  readonly isShowing = createMemo(
    () => this.isOpen() && this.isLongEnough() && (!!this.flat().length || !!this.message())
  )

  /** Open (asked to show results). */
  isOpen(): boolean {
    return this.openState.get()
  }

  isDisabled(): boolean {
    return this.attrs.disabled || this.formDisabled.get()
  }

  /** Busy:  the `loading` attribute, or a remote query running. */
  isLoading(): boolean {
    return this.attrs.loading || this.isFetching.get()
  }

  /** Name for the input:  its `<label>`s / `aria-label`, else `placeholder`, else the translated `label`. */
  private label(): string {
    return this.labels.name() ?? this.attrs.placeholder ?? this.text("searchLabel")
  }

  /** Is `text`, trimmed, at least `min-characters` long (never under 1)? */
  private isLongEnoughQuery(text: string): boolean {
    return text.trim().length >= Math.max(1, this.attrs.minCharacters ?? 1)
  }

  ////////////////
  // ## Element hooks
  ////////////////

  /** `disabled` / `loading` classes:  also by a disabled fieldset / a running remote query. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "disabled") return this.isDisabled()
    if (name === "loading") return this.isLoading()
    return super.classValue(name)
  }

  protected hostStates() {
    return {
      open: this.isShowing(),
      disabled: this.isDisabled(),
      loading: this.isLoading(),
      fluid: this.attrs.fluid
    }
  }

  formValue(): E.FieldValue {
    return this.query()
  }

  protected formName(): string | undefined {
    return this.attrs.name
  }

  /** Back to the `value` attribute;  the input shows it, nothing is highlighted. */
  formReset() {
    this.valueState.set(this.initialValue as never)
    this.revision.set(untrack(() => this.revision.get()) + 1)
    this.active.set(-1)
  }

  protected rules(): E.ValidationRule[] {
    return this.attrs.required ? [UIT.REQUIRED_RULE] : []
  }

  /**
   * The label in validation messages.
   * - Only once `loaded()`:  `label()` may fall back to a translated text, and the validity memo can run before the
   *   runtime arrives (seen on the docs kitchen sink:  `UI.i18n ... isn't loaded yet`).  Tracked, so it recomputes.
   */
  protected validationLabel(): string | undefined {
    return this.loaded() ? this.label() : undefined
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
      () => this.isShowing() && this.connected.get(),
      (isShowing) => {
        const box = this.resultsBox
        if (!isShowing || !box) return
        if (!box.matches(UIT.POPOVER_OPEN)) box.showPopover()
        UI.overlays.open(this.overlay)
        return () => {
          if (box.matches(UIT.POPOVER_OPEN)) box.hidePopover()
          UI.overlays.close(this.overlay)
        }
      }
    )
    createEffect(
      () => (this.isShowing() ? this.highlighted() : undefined),
      (result) => {
        if (result) this.host.renderRoot.getElementById(this.idFor(result))?.scrollIntoView({ block: "nearest" })
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
          class={[
            INPUT,
            { [LOADING]: this.isLoading(), [UIT.FLUID]: this.attrs.fluid, [UIT.DISABLED]: this.isDisabled() }
          ]}
          part={this.part("input")}
        >
          <input
            ref={(element) => (this.input = element)}
            class={PROMPT}
            part={this.part("prompt")}
            type="text"
            role={COMBOBOX_ROLE}
            autocomplete="off"
            spellcheck={false}
            enterkeyhint="search"
            value={untrack(() => this.query())}
            placeholder={this.attrs.placeholder}
            disabled={this.isDisabled()}
            aria-autocomplete="list"
            aria-haspopup={LISTBOX_ROLE}
            aria-expanded={this.isShowing() && this.flat().length ? UIT.TRUE : UIT.FALSE}
            aria-controls={this.ids.results}
            aria-activedescendant={this.isShowing() && this.highlighted() ? this.idFor(this.highlighted()!) : undefined}
            aria-label={this.label()}
            aria-busy={this.isLoading() ? UIT.TRUE : undefined}
            aria-required={this.attrs.required ? UIT.TRUE : undefined}
            aria-invalid={this.validation().valid ? undefined : UIT.TRUE}
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
        {this.results()}
        <span class={UIT.STATUS} role={UIT.STATUS}>
          {this.status()}
        </span>
      </div>
    )
  }

  /**
   * Server render only (`$/ui/static`):  the input's `name` (it holds the query, the value) and the `STATIC_CONTROL`
   * mark, so a static form submits it;  `{}` in a browser, where the HOST submits (`ElementInternals`).
   */
  private staticControl(): Record<string, unknown> {
    return isServer ? { [UIT.STATIC_CONTROL]: "", name: this.attrs.name } : {}
  }

  /** The results popover:  a listbox while there are results, else the message. */
  private results(): JSX.Element {
    return (
      <div
        ref={(element) => (this.resultsBox = element)}
        id={this.ids.results}
        class={RESULTS}
        popover={UIT.MANUAL}
        part={this.part("results")}
        role={this.flat().length ? LISTBOX_ROLE : undefined}
        aria-label={this.flat().length ? this.label() : undefined}
        onMouseDown={UISearch.preventDefault}
      >
        <Show when={this.isShowing()}>
          <Show when={this.flat().length} fallback={this.messageBox()}>
            <Show when={this.attrs.category} fallback={<For each={this.flat()}>{(result) => this.row(result)}</For>}>
              <For each={this.groups()}>{(group, index) => this.category(group, index)}</For>
            </Show>
          </Show>
        </Show>
      </div>
    )
  }

  /** One category:  its name, then its results, as a named `group`. */
  private category(group: UIT.SearchCategory, index: () => number): JSX.Element {
    // a function:  `index` is `<For>`'s accessor, so it's read in JSX (tracked), never in the callback body
    const nameId = () => `${this.ids.results}${CATEGORY_ID_INFIX}${index()}`
    return (
      <div
        class={[CATEGORY, { [UIT.ACTIVE]: group.results.includes(this.highlighted()!) }]}
        role={UIT.GROUP}
        aria-labelledby={nameId()}
        part={this.part("category")}
      >
        <div id={nameId()} class={NAME} part={this.part("name")}>
          {group.name}
        </div>
        <div class={RESULTS} role={UIT.NONE}>
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
    const classes = () => [RESULT, { [UIT.ACTIVE]: this.highlighted() === result }]
    const selected = () => (this.highlighted() === result ? UIT.TRUE : UIT.FALSE)
    const onPointerMove = () => this.highlight(result)
    const onClick = (event: MouseEvent) => this.select(result, event)
    if (url) {
      return (
        <a
          id={this.idFor(result)}
          class={classes()}
          href={url}
          tabindex="-1"
          role={OPTION_ROLE}
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
        id={this.idFor(result)}
        class={classes()}
        role={OPTION_ROLE}
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
          <div class={UIT.IMAGE}>
            <img src={result.image as string} alt={typeof result.alt === "string" ? result.alt : ""} />
          </div>
        </Show>
        <div class={UIT.CONTENT}>
          <Show when={result.price !== undefined && result.price !== null}>
            <div class={PRICE}>{String(result.price)}</div>
          </Show>
          <div class={UIT.TITLE}>{this.markedText(String(result.title ?? ""))}</div>
          <Show when={result.description}>
            <div class={UIT.DESCRIPTION}>{this.markedText(String(result.description))}</div>
          </Show>
        </div>
      </>
    )
  }

  /** The no-results or error message. */
  private messageBox(): JSX.Element {
    return (
      <Show when={this.message()}>
        {(message) => (
          <div class={[UIT.MESSAGE, message().kind]} part={this.part("message")}>
            <Show when={message().header}>
              <div class={UIT.HEADER}>{message().header}</div>
            </Show>
            <div class={UIT.DESCRIPTION}>{message().text}</div>
          </div>
        )}
      </Show>
    )
  }

  /** `text` with the query in `<mark>`, when `highlight-matches`. */
  private markedText(text: string): JSX.Element {
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
    if (!this.isShowing()) return ""
    const count = this.flat().length
    if (count === 1) return this.text("searchOneResult")
    if (count) return this.text("searchResultCount", { count })
    return this.message()?.text ?? ""
  }

  /** Stable id for `result`'s row. */
  private idFor(result: UIT.SearchResult): string {
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
    const isDone = this.openState.request(open, () => this.emit(open ? "ui-open" : "ui-close", { open, originalEvent }))
    if (isDone && open) this.active.set(this.attrs.selectFirstResult ? 0 : -1)
    return isDone
  }

  /**
   * Choose `result`, as someone did with `originalEvent`:  the cancelable `ui-select` first, then its title in the
   * input (`ui-change`), the results hidden, and its `url` followed.
   * - A click on a result LINK follows it natively (new tabs work);  other ways follow it with `location.assign()`,
   *   the host's own document's.
   */
  select(result: UIT.SearchResult, originalEvent?: Event) {
    if (!this.emit("ui-select", { result, originalEvent })) {
      originalEvent?.preventDefault()
      return
    }
    this.commit(String(result.title ?? ""), originalEvent)
    this.setOpen(false, originalEvent)
    const url = typeof result.url === "string" ? result.url : undefined
    if (url && originalEvent?.type !== UIT.CLICK) this.host.ownerDocument.location.assign(url)
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
    if (!this.isLongEnoughQuery(text)) return
    this.setOpen(true, originalEvent)
    if (this.attrs.url) this.fetch(text.trim())
  }

  /**
   * Ask the `url` for `query`'s results through `UI.api`:  debounced by `search-delay`, the previous query
   * aborted, the answer cached per query.  An aborted query is ignored;  a failed one shows `searchServerError`.
   */
  private fetch(query: string) {
    const url = this.attrs.url!
    const cached = this.cache.get(query)
    this.abortController?.abort()
    if (cached) {
      this.abortController = undefined
      this.isFetching.set(false)
      this.remote.set({ query, groups: cached, status: RemoteStatus.done })
      return
    }
    const abortController = (this.abortController = new AbortController())
    this.isFetching.set(true)
    const max = this.attrs.maxResults ?? 0
    UI.api
      .request<UIT.SearchResponse>({
        url,
        urlData: { query },
        throttle: this.attrs.searchDelay ?? 0,
        key: this.ids.results,
        signal: abortController.signal
      })
      .then((response) => {
        const groups = SearchMatcher.groupsFor(response, max)
        this.cache.set(query, groups)
        // superseded while the answer was on its way (a transport that ignores the signal still delivers it):  cached,
        // not shown
        if (abortController.signal.aborted) return
        this.remote.set({ query, groups, status: RemoteStatus.done })
        this.emit("ui-results", { query, results: groups.flatMap((group) => group.results) })
      })
      .catch((error: unknown) => {
        if (abortController.signal.aborted || (error as Error)?.name === ABORT_ERROR) return
        this.remote.set({ query, groups: [], status: RemoteStatus.error })
      })
      .finally(() => {
        if (this.abortController !== abortController) return
        this.abortController = undefined
        this.isFetching.set(false)
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
    const isLong = this.isLongEnoughQuery(text)
    this.valueState.request(text as never, () => {
      if (isLong) this.emit("ui-search", { query: text.trim(), originalEvent: event })
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

  /** A click in the input reopens results someone closed. */
  private readonly onClick = (event: MouseEvent) => {
    if (!untrack(() => this.isOpen())) this.runCurrent(event)
  }

  /** Leaving:  close (unless focus stays inside);  an edited text commits with `ui-change`. */
  private readonly onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (next && (this.host.contains(next) || this.host.renderRoot.contains(next))) return
    this.setOpen(false, event)
    const value = untrack(() => this.query())
    if (this.focusValue !== undefined && value !== this.focusValue) {
      this.emit("ui-change", { value, originalEvent: event })
    }
    this.focusValue = undefined
  }

  /** Combobox keys:  arrows move, Enter chooses, Escape clears a closed search (an open one closes, overlays). */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled() || event.defaultPrevented || event.isComposing) return
    const isShowing = untrack(() => this.isShowing())
    switch (event.key) {
      case UIT.Key.arrowDown:
        event.preventDefault()
        if (isShowing) this.move(1)
        else this.runCurrent(event)
        return
      case UIT.Key.arrowUp:
        if (!isShowing) return
        event.preventDefault()
        this.move(-1)
        return
      case UIT.Key.enter: {
        const result = isShowing ? untrack(() => this.highlighted()) : undefined
        if (result) {
          event.preventDefault()
          this.select(result, event)
        } else this.formHost.form?.requestSubmit()
        return
      }
      case UIT.Key.escape:
        // showing:  `UI.overlays` closes it;  else Escape clears (APG)
        if (isShowing || !untrack(() => this.query())) return
        event.preventDefault()
        this.setOpen(false, event)
        this.commit("", event)
        return
      case UIT.Key.tab:
        if (untrack(() => this.isOpen())) this.setOpen(false, event)
        return
    }
  }

  /** Run the query already in the input, as `originalEvent` asked (a click, ArrowDown). */
  private runCurrent(originalEvent: Event) {
    this.run(
      untrack(() => this.query()),
      originalEvent
    )
  }

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Counter behind result ids.
   * - STATIC:  page-wide, so two searches never share an id (results of the same `source` are the same objects).
   */
  private static resultCounter = 0

  /**
   * `preventDefault()`:  presses in the results must not take focus from the input.
   * - STATIC:  one handler for every instance.
   */
  private static preventDefault(event: Event) {
    event.preventDefault()
  }
}

////////////////
// ## Constants
////////////////

/** `UI.ids` prefix. */
const ID_PREFIX = "ui-search"

/** Infix of a category name's id, between the results id and the category's index. */
const CATEGORY_ID_INFIX = "-category-"

/** The input's icon:  FA's magnifying glass. */
const SEARCH_ICON = "magnifying-glass"

/** `name` of the error a fetch aborted by a newer query rejects with. */
const ABORT_ERROR = "AbortError"

/** `role` of the input. */
const COMBOBOX_ROLE = "combobox"

/** `role` of the results while there are some, and the input's `aria-haspopup`. */
const LISTBOX_ROLE = "listbox"

/** `role` of each result. */
const OPTION_ROLE = "option"

/**
 * Class word of the input box while busy.  Class words are the markup contract (`ui-search.css`) -- grammar, not
 * attributes, so not in the vocabulary.
 * - NOTE: `active` (`UIT.ACTIVE`) === the HIGHLIGHTED result (and its category):  Fomantic's meaning.
 */
const LOADING = "loading"

/** Class words of the icon box. */
const SEARCH_ICON_CLASS = "search icon"

/** Class word of the results popover, and of a category's results. */
const RESULTS = "results"

/** Class word of each result. */
const RESULT = "result"

/** Class word of each category. */
const CATEGORY = "category"

/** Class word of a category's name. */
const NAME = "name"

/** Class word of a result's price. */
const PRICE = "price"
