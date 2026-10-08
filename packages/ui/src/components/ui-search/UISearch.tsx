import { For, Show, untrack } from "solid-js"
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
 * - `value` (the input's text) and `open` are auto-controlled (`@controlled`):  events first, the host may veto /
 *   override.  Choosing a result puts its title in the input and follows its `url`.
 * - Rows render only while shown;  `aria-activedescendant` points at the highlighted one.  A polite live region
 *   announces the result count and messages.  Escape and outside clicks come from `UI.overlays`.
 * - Form-associated (decided 2026-09-30):  Fomantic's search is a wrapper around a REAL `<input class="prompt">`,
 *   which submits its text under its `name`;  so does this element, with `required` => `valueMissing`.
 ****************/
export class UISearch extends F.FormElement<Vocabulary> {
  @E.proto static vocabulary = searchVocabulary
  @E.proto static styleSheets = { input: inputCSS, search: searchCSS }
  @E.proto static elementSetup = { Fallback: SearchFallback }

  ////////////////
  // ## The text
  ////////////////

  /** `value`, the input's text:  the host's property, else internal. */
  @E.controlled("value") accessor value: string | undefined = ""

  /** The input's text, as a string. */
  get query(): string {
    return String(this.value ?? "")
  }

  /** Is the query long enough to search? */
  get queryIsLongEnough(): boolean {
    return this.isLongEnough(this.query)
  }

  /** Is `text`, trimmed, at least `min-characters` long (never under 1)? */
  private isLongEnough(text: string): boolean {
    return text.trim().length >= Math.max(1, this.minCharacters ?? 1)
  }

  /** Bumped when the input must show the value again (a host veto of typing). */
  @E.state accessor inputRevision = 0

  /** Value to restore on form reset:  the host's `value` (its attribute), `undefined` when it has none. */
  private readonly initialValue = untrack(() => (this.isHostControlled("value") ? this.value : undefined))

  /** Value when the input took focus, to tell whether leaving it is an edit. */
  private valueAtFocus?: string

  /** The input shows the value:  again after a host veto (`inputRevision`), and once rendered. */
  @E.onChange("query", "inputRevision", "isReady")
  protected onQueryChanged(query: string) {
    if (this.input && this.input.value !== query) this.input.value = query
  }

  /** Commit `value` as the input's text, with `ui-change`;  the input shows the host's value if it vetoed. */
  private commit(value: string, originalEvent?: Event) {
    this.requestChange("value", value, () => {
      this.send("ui-change", { value, originalEvent })
      return true
    })
    this.valueAtFocus = value
    this.inputRevision++
  }

  ////////////////
  // ## Results
  ////////////////

  /** Local matcher, from the matching attributes. */
  @E.derived
  get matcher(): SearchMatcher {
    const fields = this.searchFields
    return new SearchMatcher({
      fields: fields === undefined ? undefined : E.Converters.list(fields),
      match: this.fullTextSearch as UIT.SearchMatch | undefined,
      ignoreDiacritics: this.ignoreDiacritics
    })
  }

  /** Local results of the query, grouped. */
  @E.derived
  get localGroups(): readonly UIT.SearchCategory[] {
    const source = this.source
    if (!Array.isArray(source) || !this.queryIsLongEnough) return []
    const max = this.maxResults ?? 0
    let results = this.matcher.search(source as UIT.SearchResult[], this.query)
    if (max > 0) results = results.slice(0, max)
    return this.category ? SearchMatcher.categorize(results) : [{ name: "", results }]
  }

  /** The last remote answer. */
  @E.state accessor remoteAnswer: RemoteAnswer = { query: "", groups: [], status: RemoteStatus.idle }

  /** The remote query running now (aborts it), if any. */
  @E.state accessor runningQuery: AbortController | undefined = undefined

  /** Is a remote query running? */
  get isFetching(): boolean {
    return this.runningQuery !== undefined
  }

  /** Remote answers by query. */
  private readonly answersByQuery = new Map<string, readonly UIT.SearchCategory[]>()

  /** Results shown now, grouped:  the last remote answer, or the local ones. */
  get groups(): readonly UIT.SearchCategory[] {
    if (!this.url) return this.localGroups
    return this.queryIsLongEnough ? this.remoteAnswer.groups : []
  }

  /** Every shown result, in order:  what the arrows move through. */
  @E.derived
  get shownResults(): readonly UIT.SearchResult[] {
    return this.groups.flatMap((group) => group.results)
  }

  /** What to say instead of results, if anything. */
  @E.derived
  get message(): SearchMessage | undefined {
    if (!this.queryIsLongEnough || this.shownResults.length) return undefined
    const remote = this.remoteAnswer
    const isCurrent = !this.url || (remote.query === this.query.trim() && !this.isFetching)
    if (!isCurrent) return undefined
    if (this.url && remote.status === RemoteStatus.error) {
      return { kind: SearchMessageKind.error, text: this.translationForKey("searchServerError") }
    }
    if (this.url && remote.status !== RemoteStatus.done) return undefined
    if (this.showNoResults === false) return undefined
    return {
      kind: SearchMessageKind.empty,
      header: this.translationForKey("searchNoResultsHeader"),
      text: this.translationForKey("searchNoResults")
    }
  }

  /** Run the query in `text` (typed, or on focus):  open, and ask the server when there's a `url`. */
  private runQuery(text: string, originalEvent?: Event) {
    if (!this.isLongEnough(text)) return
    this.requestOpen(true, originalEvent)
    if (this.url) this.fetch(text.trim())
  }

  /** Run the query already in the input, as `originalEvent` asked (a click, ArrowDown). */
  private rerunQuery(originalEvent: Event) {
    this.runQuery(
      untrack(() => this.query),
      originalEvent
    )
  }

  /**
   * Ask the `url` for `query`'s results through `UI.api`:  debounced by `search-delay`, the previous query
   * aborted, the answer cached per query.  An aborted query is ignored;  a failed one shows `searchServerError`.
   */
  private fetch(query: string) {
    const url = this.url!
    const cached = this.answersByQuery.get(query)
    this.runningQuery?.abort()
    if (cached) {
      this.runningQuery = undefined
      this.remoteAnswer = { query, groups: cached, status: RemoteStatus.done }
      return
    }
    const running = (this.runningQuery = new AbortController())
    const max = this.maxResults ?? 0
    UI.api
      .request<UIT.SearchResponse>({
        url,
        urlData: { query },
        throttle: this.searchDelay ?? 0,
        key: this.ids.results,
        signal: running.signal
      })
      .then((response) => {
        const groups = SearchMatcher.groupsFor(response, max)
        this.answersByQuery.set(query, groups)
        // superseded while the answer was on its way (a transport that ignores the signal still delivers it):  cached,
        // not shown
        if (running.signal.aborted) return
        this.remoteAnswer = { query, groups, status: RemoteStatus.done }
        this.send("ui-results", { query, results: groups.flatMap((group) => group.results) })
      })
      .catch((error: unknown) => {
        if (running.signal.aborted || (error as Error)?.name === ABORT_ERROR) return
        this.remoteAnswer = { query, groups: [], status: RemoteStatus.error }
      })
      .finally(() => {
        if (this.runningQuery === running) this.runningQuery = undefined
      })
  }

  ////////////////
  // ## Highlight
  ////////////////

  /** Highlighted index into `shownResults`;  `-1` for none. */
  @E.state accessor highlightedIndex = -1

  /** Highlighted result. */
  get highlightedResult(): UIT.SearchResult | undefined {
    return this.shownResults[this.highlightedIndex]
  }

  /** A newly highlighted result scrolls into view, while results show. */
  @E.onChange("resultsAreShowing", "highlightedResult")
  protected onHighlightChanged(resultsAreShowing: boolean, result: UIT.SearchResult | undefined) {
    if (resultsAreShowing && result)
      this.host.renderRoot.getElementById(this.idFor(result))?.scrollIntoView({ block: "nearest" })
  }

  /** Highlight `result` if it's shown. */
  private highlight(result: UIT.SearchResult) {
    const index = untrack(() => this.shownResults).indexOf(result)
    if (index >= 0 && index !== untrack(() => this.highlightedIndex)) this.highlightedIndex = index
  }

  /** Move the highlight by `delta`, stopping at the ends (Fomantic's arrows). */
  private move(delta: number) {
    const count = untrack(() => this.shownResults).length
    if (!count) return
    const from = untrack(() => this.highlightedIndex)
    this.highlightedIndex = from < 0 ? (delta > 0 ? 0 : count - 1) : Math.max(0, Math.min(count - 1, from + delta))
  }

  ////////////////
  // ## Open
  ////////////////

  /** `open`, asked to show results:  the host's property, else internal. */
  @E.controlled("open") accessor isOpen = false

  /** Results (or a message) are showing:  `:state(open)` follows SHOWING results, not `open`. */
  @E.cssState("open")
  get resultsAreShowing(): boolean {
    return this.isOpen && this.queryIsLongEnough && (!!this.shownResults.length || !!this.message)
  }

  /** This element's `UI.overlays` entry. */
  private readonly overlay: E.OverlayEntry = {
    element: this.host,
    kind: "popover",
    restoreFocus: false,
    onDismiss: () => void this.requestOpen(false)
  }

  /** Show the popover and open the overlay entry while results show in the page;  undone when they stop. */
  @E.onChange("resultsAreShowing", "isConnected")
  protected onPopoverChanged(resultsAreShowing: boolean, isConnected: boolean) {
    const box = this.resultsBox
    if (!resultsAreShowing || !isConnected || !box) return
    if (!box.matches(UIT.POPOVER_OPEN)) box.showPopover()
    UI.overlays.open(this.overlay)
    return () => {
      if (box.matches(UIT.POPOVER_OPEN)) box.hidePopover()
      UI.overlays.close(this.overlay)
    }
  }

  /**
   * Show or hide the results, dispatching the cancelable `ui-open` / `ui-close` first.
   * - Not `open()` / `close()`:  `open` is the attribute's.
   */
  requestOpen(open: boolean, originalEvent?: Event): boolean {
    if (open === untrack(() => this.isOpen)) return false
    if (open && this.isDisabled) return false
    const isDone = this.requestChange("isOpen", open, () =>
      this.send(open ? "ui-open" : "ui-close", { open, originalEvent })
    )
    if (isDone && open) this.highlightedIndex = this.selectFirstResult ? 0 : -1
    return isDone
  }

  /**
   * Choose `result`, as someone did with `originalEvent`:  the cancelable `ui-select` first, then its title in the
   * input (`ui-change`), the results hidden, and its `url` followed.
   * - A click on a result LINK follows it natively (new tabs work);  other ways follow it with `location.assign()`,
   *   the host's own document's.
   */
  select(result: UIT.SearchResult, originalEvent?: Event) {
    if (!this.send("ui-select", { result, originalEvent })) {
      originalEvent?.preventDefault()
      return
    }
    this.commit(String(result.title ?? ""), originalEvent)
    this.requestOpen(false, originalEvent)
    const url = typeof result.url === "string" ? result.url : undefined
    if (url && originalEvent?.type !== UIT.CLICK) this.host.ownerDocument.location.assign(url)
  }

  ////////////////
  // ## Disabled, busy, fluid
  ////////////////

  /** Disabled by its attribute, or by a disabled fieldset. */
  @E.cssState("disabled")
  get isDisabled(): boolean {
    return this.disabled || this.formIsDisabled
  }

  /** Busy:  the `loading` attribute, or a remote query running. */
  @E.cssState("loading")
  get isLoading(): boolean {
    return this.loading || this.isFetching
  }

  /** `fluid`, as `:state(fluid)`. */
  @E.cssState("fluid")
  get isFluid(): boolean {
    return this.fluid
  }

  /** `disabled` / `loading` classes:  also by a disabled fieldset / a running remote query. */
  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "disabled") return this.isDisabled
    if (name === "loading") return this.isLoading
    return super.classValue(name)
  }

  ////////////////
  // ## Name
  ////////////////

  /** Host `<label>`s and `aria-label`, as the input's name. */
  readonly labels = new F.ControlLabels(this.formHost)

  /** Name for the input:  its `<label>`s / `aria-label`, else `placeholder`, else the translated `label`. */
  private get label(): string {
    return this.labels.accessibleName ?? this.placeholder ?? this.translationForKey("searchLabel")
  }

  /** Connected:  read the labels again (they may have changed while it was away). */
  @E.onChange("isConnected")
  protected onConnectedChanged(isConnected: boolean) {
    if (isConnected) this.labels.refresh()
  }

  ////////////////
  // ## Form
  ////////////////

  get formValue(): E.FieldValue {
    return this.query
  }

  protected get formName(): string | undefined {
    return this.name
  }

  /** Back to the `value` attribute;  the input shows it, nothing is highlighted. */
  onFormReset() {
    this.value = this.initialValue
    this.inputRevision++
    this.highlightedIndex = -1
  }

  protected get validationRules(): E.ValidationRule[] {
    return this.required ? [UIT.REQUIRED_RULE] : []
  }

  /**
   * The label in validation messages.
   * - Only once `isReady`:  `label` may fall back to a translated text, and validation can run before the runtime
   *   arrives (seen on the docs kitchen sink:  `UI.i18n ... isn't loaded yet`).  Tracked, so it recomputes.
   */
  protected get validationLabel(): string | undefined {
    return this.isReady ? this.label : undefined
  }

  protected get validationAnchor(): HTMLElement | undefined {
    return this.input
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** The magnifying glass. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => SEARCH_ICON })

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

  render(): JSX.Element {
    this.ids = { results: UI.ids.next(ID_PREFIX), anchor: `--${UI.ids.next(ID_PREFIX)}` }
    return (
      <div
        class={this.rootClasses}
        part={this.partForName("search")}
        style={{ [UIT.SEARCH_ANCHOR_PROPERTY]: this.ids.anchor }}
      >
        <div
          class={[INPUT, { [LOADING]: this.isLoading, [UIT.FLUID]: this.fluid, [UIT.DISABLED]: this.isDisabled }]}
          part={this.partForName("input")}
        >
          <input
            ref={(element) => (this.input = element)}
            class={PROMPT}
            part={this.partForName("prompt")}
            type="text"
            role={COMBOBOX_ROLE}
            autocomplete="off"
            spellcheck={false}
            enterkeyhint="search"
            value={untrack(() => this.query)}
            placeholder={this.placeholder}
            disabled={this.isDisabled}
            aria-autocomplete="list"
            aria-haspopup={LISTBOX_ROLE}
            aria-expanded={this.resultsAreShowing && this.shownResults.length ? UIT.TRUE : UIT.FALSE}
            aria-controls={this.ids.results}
            aria-activedescendant={
              this.resultsAreShowing && this.highlightedResult ? this.idFor(this.highlightedResult) : undefined
            }
            aria-label={this.label}
            aria-busy={this.isLoading ? UIT.TRUE : undefined}
            aria-required={this.required ? UIT.TRUE : undefined}
            aria-invalid={this.validation.valid ? undefined : UIT.TRUE}
            {...this.staticControl}
            onInput={this.onInput}
            onKeyDown={this.onKeyDown}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            onClick={this.onClick}
          />
          <span class={SEARCH_ICON_CLASS} part={this.partForName("icon")}>
            <slot name={this.slotForName("icon")}>{this.iconGlyph.svg}</slot>
          </span>
        </div>
        {this.results()}
        <span class={UIT.STATUS} role={UIT.STATUS}>
          {this.statusText}
        </span>
      </div>
    )
  }

  /**
   * Server render only (`$/ui/static`):  the input's `name` (it holds the query, the value) and the `STATIC_CONTROL`
   * mark, so a static form submits it;  `{}` in a browser, where the HOST submits (`ElementInternals`).
   */
  private get staticControl(): Record<string, unknown> {
    return isServer ? { [UIT.STATIC_CONTROL]: "", name: this.name } : {}
  }

  /** The results popover:  a listbox while there are results, else the message. */
  private results(): JSX.Element {
    return (
      <div
        ref={(element) => (this.resultsBox = element)}
        id={this.ids.results}
        class={RESULTS}
        popover={UIT.MANUAL}
        part={this.partForName("results")}
        role={this.shownResults.length ? LISTBOX_ROLE : undefined}
        aria-label={this.shownResults.length ? this.label : undefined}
        onMouseDown={UISearch.preventDefault}
      >
        <Show when={this.resultsAreShowing}>
          <Show when={this.shownResults.length} fallback={this.messageBox()}>
            <Show when={this.category} fallback={<For each={this.shownResults}>{(result) => this.row(result)}</For>}>
              <For each={this.groups}>{(group, index) => this.resultCategory(group, index)}</For>
            </Show>
          </Show>
        </Show>
      </div>
    )
  }

  /**
   * One category:  its name, then its results, as a named `group`.
   * - Not `category()`:  `category` is the attribute's.
   */
  private resultCategory(group: UIT.SearchCategory, index: () => number): JSX.Element {
    // a function:  `index` is `<For>`'s accessor, so it's read in JSX (tracked), never in the callback body
    const nameId = () => `${this.ids.results}${CATEGORY_ID_INFIX}${index()}`
    return (
      <div
        class={[CATEGORY, { [UIT.ACTIVE]: group.results.includes(this.highlightedResult!) }]}
        role={UIT.GROUP}
        aria-labelledby={nameId()}
        part={this.partForName("category")}
      >
        <div id={nameId()} class={NAME} part={this.partForName("name")}>
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
    const classes = () => [RESULT, { [UIT.ACTIVE]: this.highlightedResult === result }]
    const selected = () => (this.highlightedResult === result ? UIT.TRUE : UIT.FALSE)
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
          part={this.partForName("result")}
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
        part={this.partForName("result")}
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
      <Show when={this.message}>
        {(message) => (
          <div class={[UIT.MESSAGE, message().kind]} part={this.partForName("message")}>
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
    const query = this.query.trim()
    if (!this.highlightMatches || !query) return text
    const ranges = this.highlighter.highlights({ value: "", text }, query, {
      ignoreDiacritics: this.ignoreDiacritics
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
  private get statusText(): string {
    if (!this.resultsAreShowing) return ""
    const count = this.shownResults.length
    if (count === 1) return this.translationForKey("searchOneResult")
    if (count) return this.translationForKey("searchResultCount", { count })
    return this.message?.text ?? ""
  }

  /** Stable id for `result`'s row. */
  private idFor(result: UIT.SearchResult): string {
    let id = this.resultIds.get(result)
    if (!id) this.resultIds.set(result, (id = `${this.ids.results}-${++UISearch.resultCounter}`))
    return id
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** Typing:  the value (with `ui-search` once long enough), then the query. */
  private readonly onInput = (event: Event) => {
    const text = (event.currentTarget as HTMLInputElement).value
    const isLong = this.isLongEnough(text)
    this.requestChange("value", text, () => {
      if (isLong) this.send("ui-search", { query: text.trim(), originalEvent: event })
      return true
    })
    this.inputRevision++
    this.highlightedIndex = this.selectFirstResult ? 0 : -1
    this.runQuery(text, event)
  }

  /** Focus:  remember the value;  show the results of what's there (Fomantic's `searchOnFocus`). */
  private readonly onFocus = (event: FocusEvent) => {
    this.valueAtFocus = this.query
    this.runQuery(this.valueAtFocus, event)
  }

  /** A click in the input reopens results someone closed. */
  private readonly onClick = (event: MouseEvent) => {
    if (!untrack(() => this.isOpen)) this.rerunQuery(event)
  }

  /** Leaving:  close (unless focus stays inside);  an edited text commits with `ui-change`. */
  private readonly onBlur = (event: FocusEvent) => {
    const next = event.relatedTarget as Node | null
    if (next && (this.host.contains(next) || this.host.renderRoot.contains(next))) return
    this.requestOpen(false, event)
    const value = untrack(() => this.query)
    if (this.valueAtFocus !== undefined && value !== this.valueAtFocus) {
      this.send("ui-change", { value, originalEvent: event })
    }
    this.valueAtFocus = undefined
  }

  /** Combobox keys:  arrows move, Enter chooses, Escape clears a closed search (an open one closes, overlays). */
  private readonly onKeyDown = (event: KeyboardEvent) => {
    if (this.isDisabled || event.defaultPrevented || event.isComposing) return
    const isShowing = untrack(() => this.resultsAreShowing)
    switch (event.key) {
      case UIT.Key.arrowDown:
        event.preventDefault()
        if (isShowing) this.move(1)
        else this.rerunQuery(event)
        return
      case UIT.Key.arrowUp:
        if (!isShowing) return
        event.preventDefault()
        this.move(-1)
        return
      case UIT.Key.enter: {
        const result = isShowing ? untrack(() => this.highlightedResult) : undefined
        if (result) {
          event.preventDefault()
          this.select(result, event)
        } else this.formHost.form?.requestSubmit()
        return
      }
      case UIT.Key.escape:
        // showing:  `UI.overlays` closes it;  else Escape clears (APG)
        if (isShowing || !untrack(() => this.query)) return
        event.preventDefault()
        this.requestOpen(false, event)
        this.commit("", event)
        return
      case UIT.Key.tab:
        if (untrack(() => this.isOpen)) this.requestOpen(false, event)
        return
    }
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

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UISearch extends E.AttributeValues<Vocabulary> {}

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
