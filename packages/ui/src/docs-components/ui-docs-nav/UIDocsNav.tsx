import { For, Match, Show, Switch, createEffect, createMemo, untrack } from "solid-js"
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
 *   and while its fold eases shut (`closing`, ended by the fold's `transitionend`).  The motion is the sheet's, only
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
  @E.proto static styles = { "docs-nav": navCSS }
  @E.proto static Fallback = DocsNavFallback
  @E.proto static Host = DocsNavHost
  @E.proto static delegatesFocus = false

  ////////////////
  // ## State
  ////////////////

  /** Which slots have content:  the header / footer boxes show only then. */
  readonly slots = new E.SlotContent(this.host)

  /** Host `aria-label`, naming the landmark in place of "Documentation":  two navs on a page need two names. */
  readonly ariaLabel = new E.HostAttribute({ host: this.host, name: UIT.ARIA_LABEL })

  /** The list, once the data has loaded. */
  readonly index = new E.Cell<NavIndex | undefined>(undefined)

  /** Why the data didn't load, if it didn't. */
  readonly failure = new E.Cell<string | undefined>(undefined)

  /** The search text, normalized (`NavIndex.normalize()`). */
  readonly query = new E.Cell("")

  /** Starred tags, as stored:  unknown ones are dropped by `favorites()`. */
  readonly starred = new E.Cell<ReadonlySet<string>>(new Set(isServer ? [] : NavPreferences.favorites()))

  /** Topic ids the viewer opened (no search typed). */
  readonly openTopics = new E.Cell<ReadonlySet<string>>(new Set(isServer ? [] : NavPreferences.openTopics()))

  /** Groups the viewer folded away (no search typed). */
  readonly closedGroups = new E.Cell<ReadonlySet<NavGroup>>(new Set(isServer ? [] : NavPreferences.closedGroups()))

  /** Topic ids the viewer closed during THIS search;  emptied when the query changes. */
  readonly searchClosed = new E.Cell<ReadonlySet<string>>(new Set())

  /** Groups the viewer folded during THIS search;  emptied when the query changes. */
  readonly searchClosedGroups = new E.Cell<ReadonlySet<NavGroup>>(new Set())

  /** Topics shut by the viewer whose fold is still easing shut:  their rows stay rendered until it has. */
  readonly closing = new E.Cell<ReadonlySet<string>>(new Set())

  /** The viewer closed the topic opened for the current page:  don't open it again. */
  readonly isAutoClosed = new E.Cell(false)

  /** The list's widgets are ready and the current page revealed:  from now on a topic eases open. */
  readonly isSettled = new E.Cell(false)

  /** `view`:  the host's when set, else the remembered one. */
  readonly view = this.controlled("view", (isServer ? undefined : NavPreferences.view()) ?? DEFAULT_VIEW)

  /** Resolves once the list (or its error) has rendered;  see `DocsNavHost.listed`. */
  readonly listed: Promise<void>

  /** Resolves `listed`. */
  private resolveListed!: () => void

  /** The panel, while rendered. */
  private box: HTMLElement | undefined

  /** The search field, while rendered. */
  private search: DocsSearchHost | undefined

  ////////////////
  // ## Derived state
  ////////////////

  /** The page shown:  `current`, else the page's file name. */
  readonly current = createMemo(() => this.attrs.current || (isServer ? INDEX_PAGE : NavIndex.page()))

  /** Prefix of every link:  `base`, else the site root from `SiteData`. */
  readonly base = createMemo(() => this.attrs.base ?? (isServer ? "" : SiteData.root()))

  /** Tags matching the search (every tag without one). */
  readonly matched = createMemo(() => this.index.get()?.matching(this.query.get()) ?? new Set<string>())

  /** Starred tags the list knows. */
  readonly favorites = createMemo(() => {
    const index = this.index.get()
    const starred = this.starred.get()
    return index ? new Set([...starred].filter((tag) => index.row(tag))) : starred
  })

  /** Favourites that match, A-Z. */
  readonly favoriteRows = createMemo(() =>
    (this.index.get()?.rows ?? []).filter((row) => this.favorites().has(row.tag) && this.matched().has(row.tag))
  )

  /** Every matching row, A-Z. */
  readonly azRows = createMemo(() => (this.index.get()?.rows ?? []).filter((row) => this.matched().has(row.tag)))

  /** The current page's row, when it's a component's page. */
  readonly currentRow = createMemo(() => {
    const row = this.index.get()?.row(this.current())
    return row?.page ? row : undefined
  })

  /** The topic Topics opens for the current page:  its first, unless an open topic already holds it. */
  readonly autoTopic = createMemo(() => {
    const row = this.currentRow()
    if (!row || this.isAutoClosed.get()) return undefined
    const open = this.openTopics.get()
    return row.topics.some((topic) => open.has(topic)) ? undefined : row.topics[0]
  })

  /** A search is typed. */
  readonly isSearching = createMemo(() => !!this.query.get())

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    this.listed = new Promise((resolve) => (this.resolveListed = resolve))
    if (isServer) return
    void SiteData.load().then(
      (data) => this.index.set(new NavIndex(data)),
      (error: unknown) => this.failure.set(error instanceof Error ? error.message : String(error))
    )
    // SIDE EFFECT:  once the list (or the error) has rendered, scroll to the current page and resolve `listed`
    createEffect(
      () => !!(this.index.get() || this.failure.get()),
      (isDone) => {
        if (isDone) queueMicrotask(() => void this.afterListed())
      }
    )
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected override hostStates() {
    return {
      searching: this.isSearching(),
      empty: this.isSearching() && this.matched().size === 0,
      listed: !!(this.index.get() || this.failure.get()),
      settled: this.isSettled.get()
    }
  }

  ////////////////
  // ## Script API (`DocsNavHost`)
  ////////////////

  /** Show the search field (opening the drawer the nav is in, if it's hidden there) and focus it. */
  focusSearch() {
    void this.search?.summon()
  }

  /**
   * Scroll the current page's link into view, a third of the way down its scroll container (the panel's list);
   * nothing if it's already in view, or nothing scrolls (never the page itself).
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

  /** The starred tags, A-Z. */
  favoriteTags(): string[] {
    const favorites = untrack(() => this.favorites())
    return untrack(() => this.index.get()?.rows ?? [])
      .filter((row) => favorites.has(row.tag))
      .map((row) => row.tag)
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("nav")} ref={(element: HTMLElement) => this.wire(element)}>
        {this.masthead()}
        <nav part={this.part("menu")} aria-label={this.ariaLabel.get() ?? this.text("navLabel")}>
          {this.group({ group: "start", title: "getStarted", body: this.pages(TOP_PAGES) })}
          <Show when={this.favoriteRows().length}>
            {this.group({
              group: FAVORITES,
              title: "favorites",
              body: (
                <ul class={[ROWS, FAVORITES]}>
                  <For each={this.favoriteRows()}>{(row) => this.row(row)}</For>
                </ul>
              )
            })}
          </Show>
          {this.group({ group: "components", title: "components", body: this.components(), extra: this.count() })}
          {this.group({ group: "foundation", title: "foundation", body: this.pages(FOUNDATION_PAGES) })}
          <Show when={this.slots.has(this.slot("footer"))}>
            <div class={[SLOTTED, FOOTER]}>
              <slot name={this.slot("footer")} />
            </div>
          </Show>
        </nav>
      </div>
    )
  }

  /** The header band:  the `header` slot, the search box beside the A-Z / Topics switch, the live status. */
  private masthead(): JSX.Element {
    return (
      <div class={MASTHEAD} part={this.part("header")}>
        <Show when={this.slots.has(this.slot("header"))}>
          <div class={[SLOTTED, UIT.HEADER]}>
            <slot name={this.slot("header")} />
          </div>
        </Show>
        <div class={TOOLS}>
          <ui-docs-search
            ref={(element: HTMLElement) => (this.search = element as DocsSearchHost)}
            part={this.part("search")}
            base={this.attrs.base}
          />
          <ui-buttons part={this.part("views")} size="small" basic="" icon="" aria-label={this.text("views")}>
            <For each={NavViews}>{(view) => this.viewButton(view)}</For>
          </ui-buttons>
        </div>
        <span class={UIT.VISUALLY_HIDDEN} role={UIT.STATUS}>
          {this.status()}
        </span>
      </div>
    )
  }

  /**
   * One group:  its heading band (a `<button aria-expanded>` in an `<h2>`, the brand's sub-head band), then its fold.
   * - The fold stays rendered while shut:  `inert` keeps its links out of reach, the sheet hides it once folded.
   */
  private group({ group, title, body, extra }: GroupProps): JSX.Element {
    const isOpen = () => this.isGroupOpen(group)
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
            <span class={UIT.TITLE}>{this.text(title)}</span>
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
        <Match when={this.failure.get()}>
          <ui-message class={PROBLEM} size="small" state="negative" header={this.text("loadError")}>
            {this.failure.get()}
          </ui-message>
        </Match>
        <Match when={!this.index.get()}>
          <p class={NOTE}>{this.text("loading")}</p>
        </Match>
        <Match when={true}>
          <Show
            when={this.view.get() === "topics"}
            fallback={
              <ul class={ROWS}>
                <For each={this.azRows()}>{(row) => this.row(row)}</For>
              </ul>
            }
          >
            <For each={this.index.get()!.topics}>{(topic, index) => this.topic(topic, index)}</For>
          </Show>
          <Show when={this.isSearching() && this.matched().size === 0}>
            <p class={[NOTE, EMPTY]}>{this.text("noMatches")}</p>
          </Show>
        </Match>
      </Switch>
    )
  }

  /** The Components band's count:  how many components show. */
  private count(): JSX.Element {
    return (
      <Show when={this.index.get()}>
        <ui-label
          part={this.part("count")}
          size="mini"
          circular=""
          aria-label={this.text("count", { count: this.matched().size })}
        >
          {this.matched().size}
        </ui-label>
      </Show>
    )
  }

  /** One button of the A-Z / Topics switch:  a `toggle`, so it says `aria-pressed`. */
  private viewButton(view: NavView): JSX.Element {
    const label = this.text(view)
    return (
      <ui-button
        data-nav-view={view}
        toggle=""
        active={this.view.get() === view ? "" : undefined}
        icon={ICONS[view]}
        aria-label={label}
        title={label}
      />
    )
  }

  /**
   * One topic:  its band (an `<h3>`), and while open (or easing shut) its fold of matching rows;  nothing when none
   * match.
   */
  private topic(topic: NavTopic, index: () => number): JSX.Element {
    const rows = createMemo(() => topic.rows.filter((row) => this.matched().has(row.tag)))
    const isOpen = () => this.isOpen(topic.id)
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
            <ui-label class={COUNT} size="mini" circular="" aria-label={this.text("count", { count: rows().length })}>
              {rows().length}
            </ui-label>
            {this.chevron()}
          </button>
        </h3>
        <Show when={isOpen() || this.closing.get().has(topic.id)}>
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
    const isStarred = () => this.favorites().has(row.tag)
    const isCurrent = () => this.currentRow() === row
    const label = () => this.text(isStarred() ? "removeFavorite" : "addFavorite", { name: row.name })
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
              {this.text(row.status === "planned" ? "planned" : "inProgress")}
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
    const isCurrent = () => this.current() === page.id
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
          <span class={NAME}>{this.text(page.text)}</span>
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

  /** The live status:  how many match, while searching. */
  private status(): string {
    if (!this.isSearching()) return ""
    const count = this.matched().size
    return count === 1 ? this.text("matchOne") : this.text("matchMany", { count })
  }

  /** `path` (relative to the site root) against `base`. */
  private href(path: string): string {
    return this.base() + path
  }

  /** Is `topic` open now:  every matching topic while searching (unless closed for it), else the viewer's. */
  private isOpen(topic: string): boolean {
    if (this.isSearching()) return !this.searchClosed.get().has(topic)
    return this.openTopics.get().has(topic) || this.autoTopic() === topic
  }

  /**
   * Is `group` open now:  unless the viewer folded it.
   * - While searching, the groups a search filters (Favourites, Components) open, unless folded for this search.
   */
  private isGroupOpen(group: NavGroup): boolean {
    if (this.isSearching() && SEARCHED.has(group)) return !this.searchClosedGroups.get().has(group)
    return !this.closedGroups.get().has(group)
  }

  ////////////////
  // ## Behaviour
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
      this.setView(
        NavViews.find((view) => view === value),
        event
      )
    else if (name === DATA.link) this.navigate(value, event)
  }

  /**
   * A view button flipped itself (`toggle`):  the pressed one stays pressed.
   * - Re-set during the event, so the button's own flip doesn't stand (`Controlled.request()`):  clicking the
   *   pressed button would otherwise un-press it while the view stays.
   */
  private onToggle(event: Event) {
    const button = event.target as HTMLElement & { active?: boolean }
    const view = button.getAttribute(DATA.view)
    if (view) button.active = view === untrack(() => this.view.get())
  }

  /**
   * A topic's fold has eased shut:  stop rendering its rows.
   * - NOT `transitioncancel`:  shutting a topic while it eases open cancels the opening, and the closing that
   *   replaces it ends with its own `transitionend` (or none:  `closeSoon()`).
   */
  private onTransitionEnd(event: TransitionEvent) {
    if (event.propertyName !== FOLD_PROPERTY) return
    const topic = (event.target as Element).getAttribute(DATA.fold)
    if (topic !== null) this.closed(topic)
  }

  /** `topic` no longer eases shut:  its rows go. */
  private closed(topic: string) {
    const closing = untrack(() => this.closing.get())
    if (!closing.has(topic)) return
    const next = new Set(closing)
    next.delete(topic)
    this.closing.set(next)
  }

  /**
   * `topic` was just shut:  if its fold isn't easing shut two frames on, it never will (shut mid-way through easing
   * open, from the same height):  no `transitionend` comes, so end `closing` now.
   */
  private closeSoon(topic: string) {
    requestAnimationFrame(() => requestAnimationFrame(() => this.closeIfStill(topic)))
  }

  /** `topic`'s fold isn't animating:  end its `closing` (`closeSoon()`). */
  private closeIfStill(topic: string) {
    const fold = this.box?.querySelector(`[${DATA.fold}="${CSS.escape(topic)}"]`)
    if (!fold?.getAnimations().length) this.closed(topic)
  }

  /** The search box changed (every keystroke). */
  private onSearch(event: CustomEvent<{ value?: string }>) {
    if (event.target !== this.search) return
    const query = NavIndex.normalize(event.detail.value ?? "")
    if (query === untrack(() => this.query.get())) return
    this.query.set(query)
    this.searchClosed.set(new Set())
    this.searchClosedGroups.set(new Set())
    this.closing.set(new Set())
  }

  /** Switch the view, as the viewer did with `event`;  remembered.  No `view` (not a `NavView`):  nothing. */
  private setView(view: NavView | undefined, event: Event) {
    if (!view || view === untrack(() => this.view.get())) return
    const isApplied = this.view.request(view, () => this.emit("ui-change", { view, originalEvent: event }))
    if (isApplied) NavPreferences.setView(view)
  }

  /** Open or close `topic`;  remembered unless searching.  A topic shut with motion on eases shut (`closing`). */
  private toggleTopic(topic: string) {
    const isOpen = untrack(() => this.isOpen(topic))
    if (isOpen && matchMedia(MOTION_QUERY).matches) {
      this.closing.set(new Set(untrack(() => this.closing.get())).add(topic))
      this.closeSoon(topic)
    }
    if (untrack(() => this.isSearching())) {
      this.searchClosed.set(
        UIDocsNav.copyWith(
          untrack(() => this.searchClosed.get()),
          topic,
          isOpen ? "add" : "delete"
        )
      )
      return
    }
    const topics = UIDocsNav.copyWith(
      untrack(() => this.openTopics.get()),
      topic,
      isOpen ? "delete" : "add"
    )
    if (isOpen && topic === untrack(() => this.autoTopic())) this.isAutoClosed.set(true)
    this.openTopics.set(topics)
    NavPreferences.setOpenTopics(topics)
  }

  /** Fold or unfold `group`;  remembered, unless it's one a search opened.  No `group`:  nothing. */
  private toggleGroup(group: NavGroup | undefined) {
    if (!group) return
    // an open group joins the closed ones;  a closed one leaves them
    const change = untrack(() => this.isGroupOpen(group)) ? "add" : "delete"
    if (untrack(() => this.isSearching()) && SEARCHED.has(group)) {
      this.searchClosedGroups.set(
        UIDocsNav.copyWith(
          untrack(() => this.searchClosedGroups.get()),
          group,
          change
        )
      )
      return
    }
    const groups = UIDocsNav.copyWith(
      untrack(() => this.closedGroups.get()),
      group,
      change
    )
    this.closedGroups.set(groups)
    NavPreferences.setClosedGroups(groups)
  }

  /**
   * Star or un-star `tag`;  remembered, `ui-favorite`.
   * - Un-starring from the Favourites list removes the clicked row:  focus moves to the tag's star in the list
   *   below, else the search box.
   */
  private toggleFavorite({ tag, star, event }: { tag: string; star: Element; event: Event }) {
    const favorites = new Set(untrack(() => this.favorites()))
    const isFavorite = !favorites.has(tag)
    if (isFavorite) favorites.add(tag)
    else favorites.delete(tag)
    this.starred.set(favorites)
    const rows = untrack(() => this.index.get()?.rows ?? [])
    const list = rows.filter((row) => favorites.has(row.tag)).map((row) => row.tag)
    NavPreferences.setFavorites(list)
    this.emit("ui-favorite", { tag, favorite: isFavorite, favorites: list, originalEvent: event })
    if (isFavorite || !star.closest(`.${FAVORITES}`)) return
    queueMicrotask(() => {
      const next = this.box?.querySelector<HTMLElement>(
        `.${ROWS}:not(.${FAVORITES}) [${DATA.star}="${CSS.escape(tag)}"]`
      )
      ;(next ?? this.search)?.focus()
    })
  }

  /** A link was followed:  `ui-navigate` for a plain left click;  vetoed, the browser stays. */
  private navigate(page: string, event: MouseEvent) {
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    const link = event.composedPath().find((target): target is HTMLAnchorElement => target instanceof HTMLAnchorElement)
    if (!link) return
    if (!this.emit("ui-navigate", { href: link.href, page, originalEvent: event })) event.preventDefault()
  }

  /** The list (or its error) has rendered:  wait for its widgets, reveal the current page, resolve `listed`. */
  private async afterListed() {
    const hosts = [...(this.box?.querySelectorAll("*") ?? [])].filter(
      (element): element is E.UIHost => READY in element
    )
    await Promise.all(hosts.map((host) => host.ready))
    this.revealCurrent()
    this.resolveListed()
    this.isSettled.set(true)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** A copy of `set` with `item` added or deleted:  a new value for a `Cell`, which never changes in place. */
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

/** The property a fold eases (the sheet's `grid-template-rows`):  its `transitionend` ends `closing`. */
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
