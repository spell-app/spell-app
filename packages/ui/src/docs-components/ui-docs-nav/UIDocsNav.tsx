import { For, Match, Show, Switch, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { DocsSearchHost } from "$/ui/docs-components/ui-docs-search/DocsSearchHost"
import { docsNavVocabulary } from "./ui-docs-nav.vocabulary.en"
import { DocsNavFallback } from "./ui-docs-nav.fallback"
import { DocsNavHost } from "./DocsNavHost"
import { NavIndex } from "./NavIndex"
import { NavPreferences } from "./NavPreferences"
import {
  BAND,
  DATA,
  DEFAULT_VIEW,
  FOUNDATION_PAGES,
  HEADING,
  ICONS,
  INDEX_PAGE,
  MOTION_QUERY,
  NavGroups,
  NavViews,
  REVEAL_FRACTION,
  ROW,
  ROWS,
  TOP_PAGES,
  type DocsNavController,
  type DocsNavText,
  type DocsNavVocabulary,
  type NavGroup,
  type NavPage,
  type NavRow,
  type NavTopic,
  type NavView
} from "./ui-docs-nav.types"

import navCSS from "./ui-docs-nav.css?inline"

/****************
 * ### `<ui-docs-nav>`
 * The docs site's left sidebar:  a docked PANEL in the Spell brand's look (the design system's "Color Set Chooser"
 * panel, its `.sp-nav` rows), with OUR organization (the Astro site's component browser):
 * - Shadow:  `<div class="ui [size] nav" part="nav">` (the panel) holding
 *   - `<div class="masthead" part="header">`:  the `header` slot (a logo), then the site search `<ui-docs-search>`
 *     beside the A-Z / Topics `<ui-buttons>`, and a visually hidden live status
 *   - `<nav part="menu">` (the landmark, the panel's scroll box) of GROUPS, each a heading band (`<h2><button
 *     aria-expanded>`) over a fold:  Get started (the intro pages), Favourites, Components (A-Z rows, or a lighter
 *     `<h3>` band per TOPIC, each folding its rows), Foundation;  then the `footer` slot
 * - A row is `<li>`:  a native link `<a>` (an icon, or a status badge) plus, for a component, its star, a `toggle`
 *   `<ui-button>`.  Links are native:  ~100 rows needn't be ~100 more widgets.
 * - Folding:  every group stays rendered (its fold goes `inert` when shut);  a topic renders its rows only while open,
 *   and while its fold eases shut (`closingTopics`, ended by the fold's `transitionend`).  The motion is the sheet's, only
 *   under `prefers-reduced-motion: no-preference`;  a topic opened after `:state(settled)` eases open too.
 * - Data:  `SiteData` (`components.json`), fetched once;  `NavIndex` makes the rows and topics.  Docs-only tags
 *   are never listed.  Links are `base` + the data's `href`.
 * - Search:  the field is `<ui-docs-search>`, the SITE's search (its results card jumps anywhere:  sections,
 *   components, attributes, pages);  its text also FILTERS this list (its `ui-input`, every keystroke):  hides what
 *   doesn't match;  Favourites, Components and every topic with a match open (a band closes one for this query);
 *   clearing restores the viewer's folds.  The Components band's count shows the matches;  a polite live region says
 *   them.  The card covers the list while it shows;  Enter jumps through the card, never the list.
 * - Remembered per viewer (`NavPreferences`, wrapped `localStorage`):  favourites, the view, the open topics, the
 *   folded groups.  On load, Topics opens the current page's first topic if no open topic holds it (not remembered).
 * - The current page (`current`, default the page's file name) is `aria-current="page"` and scrolled into view
 *   inside the panel once the list has rendered (`revealCurrent()`).
 * - Events:  `ui-navigate` (a plain click on a link, cancelable;  the search field fires its own), `ui-change`
 *   (`{ view }`), `ui-favorite`.  `/` and Cmd / Ctrl+K focus the search field:  `<ui-docs-search>`'s shortcuts.
 * - A doc-only element (`src/docs-components/`):  its shadow composes other families' widgets, which its barrel
 *   imports.
 ****************/
export class UIDocsNav extends E.UIElement<DocsNavVocabulary> implements DocsNavController {
  @E.proto static vocabulary = docsNavVocabulary
  @E.proto static styleSheets = { "docs-nav": navCSS }
  @E.proto static elementSetup = { Fallback: DocsNavFallback, Host: DocsNavHost, delegatesFocus: false }

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    this.listed = new Promise((resolve) => (this.resolveListed = resolve))
    if (isServer) return
    void SiteData.load().then(
      (data) => (this.navIndex = new NavIndex(data)),
      (error: unknown) => (this.loadError = error instanceof Error ? error.message : String(error))
    )
  }

  ////////////////
  // ## The list
  ////////////////

  /** The list, once the data has loaded. */
  @E.state accessor navIndex: NavIndex | undefined = undefined

  /** Why the data didn't load, if it didn't. */
  @E.state accessor loadError: string | undefined = undefined

  /** The data has loaded, or failed to:  the list (or its error) renders.  `:state(listed)`. */
  @E.cssState("listed")
  get isListed(): boolean {
    return !!(this.navIndex || this.loadError)
  }

  /** The list's widgets are ready and the current page revealed:  from now on a topic eases open.  `:state(settled)`. */
  @E.cssState("settled")
  @E.state
  accessor isSettled = false

  /** Resolves once the list (or its error) has rendered;  see `DocsNavHost.listed`. */
  readonly listed: Promise<void>

  /** Resolves `listed`. */
  private resolveListed!: () => void

  /** SIDE EFFECT:  once the list (or the error) has rendered, scroll to the current page and resolve `listed`. */
  @E.onChange("isListed")
  protected onListedChanged(isListed: boolean) {
    if (isListed) queueMicrotask(() => void this.onListRendered())
  }

  /** The list (or its error) has rendered:  wait for its widgets, reveal the current page, resolve `listed`. */
  private async onListRendered() {
    const hosts = [...(this.box?.querySelectorAll("*") ?? [])].filter(
      (element): element is E.UIHost => READY in element
    )
    await Promise.all(hosts.map((host) => host.ready))
    this.revealCurrent()
    this.resolveListed()
    this.isSettled = true
  }

  ////////////////
  // ## The current page
  ////////////////

  /** The page shown:  `current`, else the page's file name. */
  get currentPage(): string {
    return this.current || (isServer ? INDEX_PAGE : NavIndex.page())
  }

  /** Prefix of every link:  `base`, else the site root from `SiteData`. */
  get linkBase(): string {
    return this.base ?? (isServer ? "" : SiteData.root())
  }

  /** The current page's row, when it's a component's page. */
  get currentRow(): NavRow | undefined {
    const row = this.navIndex?.row(this.currentPage)
    return row?.page ? row : undefined
  }

  /** `path` (relative to the site root) against `linkBase`. */
  private href(path: string): string {
    return this.linkBase + path
  }

  /**
   * Scroll the current page's link into view, a third of the way down its scroll container (the panel's list);
   * nothing if it's already in view, or nothing scrolls (never the page itself).  Script API (`DocsNavHost`).
   * - The link in the main list, not its copy in Favourites;  none in a shut fold.
   */
  revealCurrent() {
    const shown = `[${DATA.current}]:not([inert] *)`
    const item =
      this.box?.querySelector<HTMLElement>(`.${ROWS}:not(.${FAVORITES}) ${shown}`) ??
      this.box?.querySelector<HTMLElement>(shown)
    if (!item) return
    const scroller = UIDocsNav.scrollerFor(item)
    if (!scroller) return
    const box = item.getBoundingClientRect()
    const port = scroller.getBoundingClientRect()
    if (box.top >= port.top && box.bottom <= port.bottom) return
    scroller.scrollTop += box.top - port.top - port.height * REVEAL_FRACTION
  }

  ////////////////
  // ## Search
  ////////////////

  /** The search text, normalized (`NavIndex.normalize()`). */
  @E.state accessor searchQuery = ""

  /** The search field, while rendered. */
  private search: DocsSearchHost | undefined

  /** A search is typed.  `:state(searching)`. */
  @E.cssState("searching")
  get isSearching(): boolean {
    return !!this.searchQuery
  }

  /** Tags matching the search (every tag without one). */
  @E.derived
  get matchingTags(): ReadonlySet<string> {
    return this.navIndex?.matching(this.searchQuery) ?? new Set<string>()
  }

  /** A search matches nothing.  `:state(empty)`. */
  @E.cssState("empty")
  get hasNoMatches(): boolean {
    return this.isSearching && !this.matchingTags.size
  }

  /** The live status:  how many match, while searching. */
  private get statusText(): string {
    if (!this.isSearching) return ""
    const count = this.matchingTags.size
    return count === 1 ? this.translationForKey("matchOne") : this.translationForKey("matchMany", { count })
  }

  /** Show the search field (opening the drawer the nav is in, if it's hidden there) and focus it.  Script API. */
  focusSearch() {
    void this.search?.summon()
  }

  /** The search box changed (every keystroke). */
  private onSearch(event: CustomEvent<{ value?: string }>) {
    if (event.target !== this.search) return
    const query = NavIndex.normalize(event.detail.value ?? "")
    if (query === this.searchQuery) return
    this.searchQuery = query
    this.topicsClosedForSearch = new Set()
    this.groupsClosedForSearch = new Set()
    this.closingTopics = new Set()
  }

  ////////////////
  // ## Favourites
  ////////////////

  /** Starred tags, as stored:  unknown ones are dropped by `favorites`. */
  @E.state accessor starredTags: ReadonlySet<string> = new Set(isServer ? [] : NavPreferences.favorites())

  /** Starred tags the list knows. */
  @E.derived
  get favorites(): ReadonlySet<string> {
    const index = this.navIndex
    const starred = this.starredTags
    return index ? new Set([...starred].filter((tag) => index.row(tag))) : starred
  }

  /** Favourites that match, A-Z. */
  @E.derived
  get favoriteRows(): NavRow[] {
    const favorites = this.favorites
    const matching = this.matchingTags
    return (this.navIndex?.rows ?? []).filter((row) => favorites.has(row.tag) && matching.has(row.tag))
  }

  /** The starred tags, A-Z.  Untracked:  script API (`DocsNavHost.favorites`). */
  get favoriteTags(): string[] {
    return untrack(() => {
      const favorites = this.favorites
      return (this.navIndex?.rows ?? []).filter((row) => favorites.has(row.tag)).map((row) => row.tag)
    })
  }

  /**
   * Star or un-star `tag`;  remembered, `ui-favorite`.
   * - Un-starring from the Favourites list removes the clicked row:  focus moves to the tag's star in the list
   *   below, else the search box.
   */
  private toggleFavorite({ tag, star, event }: { tag: string; star: Element; event: Event }) {
    const favorites = new Set(this.favorites)
    const isFavorite = !favorites.has(tag)
    if (isFavorite) favorites.add(tag)
    else favorites.delete(tag)
    this.starredTags = favorites
    const rows = this.navIndex?.rows ?? []
    const list = rows.filter((row) => favorites.has(row.tag)).map((row) => row.tag)
    NavPreferences.setFavorites(list)
    this.send("ui-favorite", { tag, favorite: isFavorite, favorites: list, originalEvent: event })
    if (isFavorite || !star.closest(`.${FAVORITES}`)) return
    queueMicrotask(() => {
      const next = this.box?.querySelector<HTMLElement>(
        `.${ROWS}:not(.${FAVORITES}) [${DATA.star}="${CSS.escape(tag)}"]`
      )
      ;(next ?? this.search)?.focus()
    })
  }

  ////////////////
  // ## The view (A-Z / Topics)
  ////////////////

  /** `view`:  the host's when set, else the remembered one. */
  @E.controlled("view") accessor view: NavView = (isServer ? undefined : NavPreferences.view()) ?? DEFAULT_VIEW

  /** Every matching row, A-Z. */
  @E.derived
  get azRows(): NavRow[] {
    const matching = this.matchingTags
    return (this.navIndex?.rows ?? []).filter((row) => matching.has(row.tag))
  }

  /** Switch the view, as the viewer did with `event`;  remembered.  No `view` (not a `NavView`):  nothing. */
  private switchView(view: NavView | undefined, event: Event) {
    if (!view || view === this.view) return
    const isApplied = this.requestChange("view", view, () => this.send("ui-change", { view, originalEvent: event }))
    if (isApplied) NavPreferences.setView(view)
  }

  /**
   * A view button flipped itself (`toggle`):  the pressed one stays pressed.
   * - Re-set during the event, so the button's own flip doesn't stand (`requestChange()`):  clicking the pressed
   *   button would otherwise un-press it while the view stays.
   */
  private onToggle(event: Event) {
    const button = event.target as HTMLElement & { active?: boolean }
    const view = button.getAttribute(DATA.view)
    if (view) button.active = view === untrack(() => this.view)
  }

  ////////////////
  // ## Topics
  ////////////////

  /** Topic ids the viewer opened (no search typed). */
  @E.state accessor openTopics: ReadonlySet<string> = new Set(isServer ? [] : NavPreferences.openTopics())

  /** Topic ids the viewer closed during THIS search;  emptied when the query changes. */
  @E.state accessor topicsClosedForSearch: ReadonlySet<string> = new Set()

  /** Topics shut by the viewer whose fold is still easing shut:  their rows stay rendered until it has. */
  @E.state accessor closingTopics: ReadonlySet<string> = new Set()

  /** The viewer closed the topic opened for the current page:  don't open it again. */
  @E.state accessor autoTopicWasClosed = false

  /** The topic Topics opens for the current page:  its first, unless an open topic already holds it. */
  get autoTopic(): string | undefined {
    const row = this.currentRow
    if (!row || this.autoTopicWasClosed) return undefined
    const open = this.openTopics
    return row.topics.some((topic) => open.has(topic)) ? undefined : row.topics[0]
  }

  /** Is `topic` open now:  every matching topic while searching (unless closed for it), else the viewer's. */
  private topicIsOpen(topic: string): boolean {
    if (this.isSearching) return !this.topicsClosedForSearch.has(topic)
    return this.openTopics.has(topic) || this.autoTopic === topic
  }

  /** Open or close `topic`;  remembered unless searching.  A topic shut with motion on eases shut (`closingTopics`). */
  private toggleTopic(topic: string) {
    const isOpen = this.topicIsOpen(topic)
    if (isOpen && matchMedia(MOTION_QUERY).matches) {
      this.closingTopics = new Set(this.closingTopics).add(topic)
      this.closeSoon(topic)
    }
    if (this.isSearching) {
      this.topicsClosedForSearch = UIDocsNav.copyWith(this.topicsClosedForSearch, topic, isOpen ? "add" : "delete")
      return
    }
    const topics = UIDocsNav.copyWith(this.openTopics, topic, isOpen ? "delete" : "add")
    if (isOpen && topic === this.autoTopic) this.autoTopicWasClosed = true
    this.openTopics = topics
    NavPreferences.setOpenTopics(topics)
  }

  /**
   * A topic's fold has eased shut:  stop rendering its rows.
   * - NOT `transitioncancel`:  shutting a topic while it eases open cancels the opening, and the closing that
   *   replaces it ends with its own `transitionend` (or none:  `closeSoon()`).
   */
  private onTransitionEnd(event: TransitionEvent) {
    if (event.propertyName !== FOLD_PROPERTY) return
    const topic = (event.target as Element).getAttribute(DATA.fold)
    if (topic !== null) this.finishClosing(topic)
  }

  /** `topic` no longer eases shut:  its rows go. */
  private finishClosing(topic: string) {
    const closing = this.closingTopics
    if (!closing.has(topic)) return
    const next = new Set(closing)
    next.delete(topic)
    this.closingTopics = next
  }

  /**
   * `topic` was just shut:  if its fold isn't easing shut two frames on, it never will (shut mid-way through easing
   * open, from the same height):  no `transitionend` comes, so end its closing now.
   */
  private closeSoon(topic: string) {
    requestAnimationFrame(() => requestAnimationFrame(() => this.closeIfStill(topic)))
  }

  /** `topic`'s fold isn't animating:  end its closing (`closeSoon()`). */
  private closeIfStill(topic: string) {
    const fold = this.box?.querySelector(`[${DATA.fold}="${CSS.escape(topic)}"]`)
    if (!fold?.getAnimations().length) this.finishClosing(topic)
  }

  ////////////////
  // ## Groups
  ////////////////

  /** Groups the viewer folded away (no search typed). */
  @E.state accessor closedGroups: ReadonlySet<NavGroup> = new Set(isServer ? [] : NavPreferences.closedGroups())

  /** Groups the viewer folded during THIS search;  emptied when the query changes. */
  @E.state accessor groupsClosedForSearch: ReadonlySet<NavGroup> = new Set()

  /**
   * Is `group` open now:  unless the viewer folded it.
   * - While searching, the groups a search filters (Favourites, Components) open, unless folded for this search.
   */
  private groupIsOpen(group: NavGroup): boolean {
    if (this.isSearching && SEARCHED.has(group)) return !this.groupsClosedForSearch.has(group)
    return !this.closedGroups.has(group)
  }

  /** Fold or unfold `group`;  remembered, unless it's one a search opened.  No `group`:  nothing. */
  private toggleGroup(group: NavGroup | undefined) {
    if (!group) return
    // an open group joins the closed ones;  a closed one leaves them
    const change = this.groupIsOpen(group) ? "add" : "delete"
    if (this.isSearching && SEARCHED.has(group)) {
      this.groupsClosedForSearch = UIDocsNav.copyWith(this.groupsClosedForSearch, group, change)
      return
    }
    const groups = UIDocsNav.copyWith(this.closedGroups, group, change)
    this.closedGroups = groups
    NavPreferences.setClosedGroups(groups)
  }

  ////////////////
  // ## Rendering
  ////////////////

  /** Which slots have content:  the header / footer boxes show only then. */
  readonly slots = new E.SlotContent(this.host)

  /** The panel, while rendered. */
  private box: HTMLElement | undefined

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("nav")} ref={(element: HTMLElement) => this.wire(element)}>
        {this.masthead()}
        <nav
          part={this.partForName("menu")}
          aria-label={this.attributes[UIT.ARIA_LABEL] ?? this.translationForKey("navLabel")}
        >
          {this.group({ group: "start", title: "getStarted", body: this.pages(TOP_PAGES) })}
          <Show when={this.favoriteRows.length}>
            {this.group({
              group: FAVORITES,
              title: "favorites",
              body: (
                <ul class={[ROWS, FAVORITES]}>
                  <For each={this.favoriteRows}>{(row) => this.row(row)}</For>
                </ul>
              )
            })}
          </Show>
          {this.group({ group: "components", title: "components", body: this.components(), extra: this.count() })}
          {this.group({ group: "foundation", title: "foundation", body: this.pages(FOUNDATION_PAGES) })}
          <Show when={this.slots.hasContent(this.slotForName("footer"))}>
            <div class={[SLOTTED, FOOTER]}>
              <slot name={this.slotForName("footer")} />
            </div>
          </Show>
        </nav>
      </div>
    )
  }

  /** The header band:  the `header` slot, the search box beside the A-Z / Topics switch, the live status. */
  private masthead(): JSX.Element {
    return (
      <div class={MASTHEAD} part={this.partForName("header")}>
        <Show when={this.slots.hasContent(this.slotForName("header"))}>
          <div class={[SLOTTED, UIT.HEADER]}>
            <slot name={this.slotForName("header")} />
          </div>
        </Show>
        <div class={TOOLS}>
          <ui-docs-search
            ref={(element: HTMLElement) => (this.search = element as DocsSearchHost)}
            part={this.partForName("search")}
            base={this.base}
          />
          <ui-buttons
            part={this.partForName("views")}
            size="small"
            basic=""
            icon=""
            aria-label={this.translationForKey("views")}
          >
            <For each={NavViews}>{(view) => this.viewButton(view)}</For>
          </ui-buttons>
        </div>
        <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
          {this.statusText}
        </span>
      </div>
    )
  }

  /**
   * One group:  its heading band (a `<button aria-expanded>` in an `<h2>`, the brand's sub-head band), then its fold.
   * - The fold stays rendered while shut:  `inert` keeps its links out of reach, the sheet hides it once folded.
   */
  private group({ group, title, body, extra }: GroupProps): JSX.Element {
    const isOpen = () => this.groupIsOpen(group)
    const fold = GROUP_FOLD_ID + group
    return (
      <section class={[GROUP, group]}>
        <h2 class={HEADING}>
          <button
            type="button"
            class={BAND}
            data-nav-group={group}
            aria-expanded={isOpen() ? UIT.TRUE : UIT.FALSE}
            aria-controls={fold}
          >
            <span class={UIT.TITLE}>{this.translationForKey(title)}</span>
            {extra}
            {this.chevron()}
          </button>
        </h2>
        <div id={fold} class={[FOLD, { [OPEN]: isOpen() }]} inert={isOpen() ? undefined : ""}>
          <div class={FOLDED}>{body}</div>
        </div>
      </section>
    )
  }

  /** The Components group's body:  loading, the error, or the list (A-Z rows or the topics) and "no matches". */
  private components(): JSX.Element {
    return (
      <Switch>
        <Match when={this.loadError}>
          <ui-message class={PROBLEM} size="small" state="negative" header={this.translationForKey("loadError")}>
            {this.loadError}
          </ui-message>
        </Match>
        <Match when={!this.navIndex}>
          <p class={NOTE}>{this.translationForKey("loading")}</p>
        </Match>
        <Match when={true}>
          <Show
            when={this.view === "topics"}
            fallback={
              <ul class={ROWS}>
                <For each={this.azRows}>{(row) => this.row(row)}</For>
              </ul>
            }
          >
            <For each={this.navIndex!.topics}>{(topic, index) => this.topic(topic, index)}</For>
          </Show>
          <Show when={this.hasNoMatches}>
            <p class={[NOTE, EMPTY]}>{this.translationForKey("noMatches")}</p>
          </Show>
        </Match>
      </Switch>
    )
  }

  /** The Components band's count:  how many components show. */
  private count(): JSX.Element {
    return (
      <Show when={this.navIndex}>
        <ui-label
          part={this.partForName("count")}
          size="mini"
          circular=""
          aria-label={this.translationForKey("count", { count: this.matchingTags.size })}
        >
          {this.matchingTags.size}
        </ui-label>
      </Show>
    )
  }

  /** One button of the A-Z / Topics switch:  a `toggle`, so it says `aria-pressed`. */
  private viewButton(view: NavView): JSX.Element {
    const label = this.translationForKey(view)
    return (
      <ui-button
        data-nav-view={view}
        toggle=""
        active={this.view === view ? "" : undefined}
        icon={ICONS[view]}
        aria-label={label}
        title={label}
      />
    )
  }

  /**
   * One topic:  its band (an `<h3>`), and while open (or easing shut) its fold of matching rows;  nothing when none
   * match.
   * - `rows` stays an explicit memo:  one per topic, made here for each item of a `<For>`.
   */
  private topic(topic: NavTopic, index: () => number): JSX.Element {
    const rows = createMemo(() => topic.rows.filter((row) => this.matchingTags.has(row.tag)))
    const isOpen = () => this.topicIsOpen(topic.id)
    const fold = () => TOPIC_FOLD_ID + index()
    return (
      <Show when={rows().length}>
        <h3 class={HEADING}>
          <button
            type="button"
            class={[BAND, TOPIC]}
            data-nav-topic={topic.id}
            aria-expanded={isOpen() ? UIT.TRUE : UIT.FALSE}
            aria-controls={isOpen() ? fold() : undefined}
          >
            <span class={UIT.TITLE}>{topic.title}</span>
            <ui-label
              class={COUNT}
              size="mini"
              circular=""
              aria-label={this.translationForKey("count", { count: rows().length })}
            >
              {rows().length}
            </ui-label>
            {this.chevron()}
          </button>
        </h3>
        <Show when={isOpen() || this.closingTopics.has(topic.id)}>
          <div
            id={fold()}
            class={[FOLD, TOPIC_ROWS, { [OPEN]: isOpen() }]}
            data-nav-fold={topic.id}
            inert={isOpen() ? undefined : ""}
          >
            <div class={FOLDED}>
              <ul class={ROWS}>
                <For each={rows()}>{(row) => this.row(row)}</For>
              </ul>
            </div>
          </div>
        </Show>
      </Show>
    )
  }

  /** One component:  its link (with a status badge) and its star. */
  private row(row: NavRow): JSX.Element {
    const isStarred = () => this.favorites.has(row.tag)
    const isCurrent = () => this.currentRow === row
    const label = () => this.translationForKey(isStarred() ? "removeFavorite" : "addFavorite", { name: row.name })
    return (
      <li class={ROW}>
        <a
          class={UIT.ITEM}
          href={this.href(row.href)}
          aria-current={isCurrent() ? UIT.PAGE : undefined}
          data-nav-link={row.tag}
          data-nav-current={isCurrent() ? "" : undefined}
        >
          <span class={NAME}>{row.name}</span>
          {row.status && (
            <ui-label class={STATUS_BADGE} size="mini" color="yellow" basic="">
              {this.translationForKey(row.status === "planned" ? "planned" : "inProgress")}
            </ui-label>
          )}
        </a>
        <ui-button
          class={STAR}
          data-nav-star={row.tag}
          toggle=""
          active={isStarred() ? "" : undefined}
          icon={isStarred() ? ICONS.star : ICONS.starOutline}
          size="mini"
          tertiary=""
          aria-label={label()}
          title={label()}
        />
      </li>
    )
  }

  /** A list of hand-written pages' rows. */
  private pages(pages: readonly NavPage[]): JSX.Element {
    return (
      <ul class={[ROWS, PAGES]}>
        <For each={pages}>{(page) => this.pageRow(page)}</For>
      </ul>
    )
  }

  /** A hand-written page's row:  its icon and name. */
  private pageRow(page: NavPage): JSX.Element {
    const isCurrent = () => this.currentPage === page.id
    return (
      <li class={ROW}>
        <a
          class={UIT.ITEM}
          href={this.href(page.file)}
          aria-current={isCurrent() ? UIT.PAGE : undefined}
          data-nav-link={page.id}
          data-nav-current={isCurrent() ? "" : undefined}
        >
          <span class={UIT.ICON}>
            <ui-icon name={page.icon} />
          </span>
          <span class={NAME}>{this.translationForKey(page.text)}</span>
        </a>
      </li>
    )
  }

  /** A band's chevron (a box round the icon, whose host is `display: contents`):  the sheet turns it while shut. */
  private chevron(): JSX.Element {
    return (
      <span class={CHEVRON}>
        <ui-icon name={ICONS.chevron} />
      </span>
    )
  }

  ////////////////
  // ## Events
  ////////////////

  /** Listeners on the panel:  clicks (delegated), the search box, the view switch, folds easing shut. */
  private wire(box: HTMLElement) {
    this.box = box
    box.addEventListener("click", (event) => this.onClick(event))
    box.addEventListener("ui-input", (event) => this.onSearch(event as CustomEvent<{ value?: string }>))
    box.addEventListener("ui-toggle", (event) => this.onToggle(event))
    box.addEventListener("transitionend", (event) => this.onTransitionEnd(event))
  }

  /** A click:  a star, a band, a view button, or a link (delegated, by `data-nav-*`). */
  private onClick(event: MouseEvent) {
    const target = UIDocsNav.dataTargetFor(event)
    if (!target) return
    const { element, name, value } = target
    if (name === DATA.star) this.toggleFavorite({ tag: value, star: element, event })
    else if (name === DATA.topic) this.toggleTopic(value)
    else if (name === DATA.group) this.toggleGroup(NavGroups.find((group) => group === value))
    else if (name === DATA.view)
      this.switchView(
        NavViews.find((view) => view === value),
        event
      )
    else if (name === DATA.link) this.navigate(value, event)
  }

  /** A link was followed:  `ui-navigate` for a plain left click;  vetoed, the browser stays. */
  private navigate(page: string, event: MouseEvent) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const link = event.composedPath().find((target): target is HTMLAnchorElement => target instanceof HTMLAnchorElement)
    if (!link) return
    if (!this.send("ui-navigate", { href: link.href, page, originalEvent: event })) event.preventDefault()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A copy of `set` with `item` added or deleted:  a new value for a `@state` set, which never changes in place. */
  private static copyWith<T extends string>(set: ReadonlySet<T>, item: T, change: "add" | "delete"): Set<T> {
    const next = new Set(set)
    if (change === "add") next.add(item)
    else next.delete(item)
    return next
  }

  /** The nearest element on `event`'s path with one of the `DATA` attributes:  it, the attribute, its value. */
  private static dataTargetFor(event: Event): { element: Element; name: string; value: string } | undefined {
    for (const target of event.composedPath()) {
      if (!(target instanceof Element)) continue
      for (const name of CLICK_TARGETS) {
        const value = target.getAttribute(name)
        if (value !== null) return { element: target, name, value }
      }
    }
    return undefined
  }

  /**
   * The nearest scroll container of `element`, up the FLAT tree (slots, shadow hosts):  one whose content overflows
   * and may scroll.  Never the page's own scroller.
   */
  private static scrollerFor(element: Element): HTMLElement | undefined {
    const page = document.scrollingElement
    for (let node = E.flatParentFor(element); node && node !== page && node !== document.body;) {
      if (node instanceof HTMLElement && node.scrollHeight > node.clientHeight) {
        const overflow = getComputedStyle(node).overflowY
        if (SCROLLING.has(overflow)) return node
      }
      node = E.flatParentFor(node)
    }
    return undefined
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIDocsNav extends E.AttributeValues<DocsNavVocabulary> {}

/** What `UIDocsNav.group()` draws:  one group's band and fold. */
type GroupProps = {
  /** which group:  its class word, its fold's id, its `data-nav-group` */
  group: NavGroup
  /** the vocabulary text of its band's title */
  title: DocsNavText
  /** what folds away under the band */
  body: JSX.Element
  /** what the band shows after its title (the Components count) */
  extra?: JSX.Element
}

/** The Favourites group:  also the class word of its list, which `revealCurrent()` skips. */
const FAVORITES: NavGroup = "favorites"

/** Groups a search filters:  they open while searching. */
const SEARCHED: ReadonlySet<NavGroup> = new Set([FAVORITES, "components"])

/** The `DATA` attributes a click acts on, nearest first per element. */
const CLICK_TARGETS = [DATA.star, DATA.topic, DATA.group, DATA.view, DATA.link]

/** Id prefix of a group's fold, + the group:  its band's `aria-controls`. */
const GROUP_FOLD_ID = "nav-group-"

/** Id prefix of a topic's fold, + the topic's index. */
const TOPIC_FOLD_ID = "nav-topic-"

/** The property a fold eases (the sheet's `grid-template-rows`):  its `transitionend` ends `finishClosing()`. */
const FOLD_PROPERTY = "grid-template-rows"

/** `overflow-y` values that make a box a scroll container. */
const SCROLLING: ReadonlySet<string> = new Set(["auto", "scroll"])

/** What every `ui-*` host has, and plain elements don't:  its `ready` promise. */
const READY = "ready"

/** Class word of the header band. */
const MASTHEAD = "masthead"

/** Class word of a box round a slot (with `header` / `footer`). */
const SLOTTED = "slotted"

/** Class word of the footer slot's box. */
const FOOTER = "footer"

/** Class word of the box holding the search field and the view switch. */
const TOOLS = "tools"

/** Class word of a group (with its `NavGroup`). */
const GROUP = "group"

/** Class word of a fold (with `open` while open). */
const FOLD = "fold"

/** Class word of a fold's inner box, the one that clips. */
const FOLDED = "folded"

/** Class word of an open fold. */
const OPEN = "open"

/** Class word of a topic's band. */
const TOPIC = "topic"

/** Class word of a topic's fold. */
const TOPIC_ROWS = "topic-rows"

/** Class word of a topic band's count. */
const COUNT = "count"

/** Class word of the hand-written pages' lists. */
const PAGES = "pages"

/** Class word of a row's name. */
const NAME = "name"

/** Class word of a row's status badge. */
const STATUS_BADGE = "status"

/** Class word of a component's star. */
const STAR = "star"

/** Class word of a band's chevron box. */
const CHEVRON = "chevron"

/** Class word of a note in the list (loading, no matches). */
const NOTE = "note"

/** Class word of the "no matches" note. */
const EMPTY = "empty"

/** Class word of the load error's message. */
const PROBLEM = "problem"
