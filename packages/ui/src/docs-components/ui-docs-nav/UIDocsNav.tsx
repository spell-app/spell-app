import { For, Match, Show, Switch, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, HostAttribute, proto, SlotContent, UIElement, type UIHost, UIT } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import type { DocsSearchHost } from "$/ui/docs-components/ui-docs-search/DocsSearchHost"

import { docsNavVocabulary } from "./ui-docs-nav.vocabulary.en"
import { DocsNavFallback } from "./ui-docs-nav.fallback"
import { DocsNavHost } from "./DocsNavHost"
import { NavIndex } from "./NavIndex"
import { NavPreferences } from "./NavPreferences"
import {
  DATA,
  DEFAULT_VIEW,
  FOUNDATION_PAGES,
  ICONS,
  INDEX_PAGE,
  MOTION_QUERY,
  REVEAL_FRACTION,
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
export class UIDocsNav extends UIElement<DocsNavVocabulary> implements DocsNavController {
  @proto static vocabulary = docsNavVocabulary
  @proto static styles = { "docs-nav": navCSS }
  @proto static Fallback = DocsNavFallback
  @proto static Host = DocsNavHost
  @proto static delegatesFocus = false

  /** Which slots have content:  the header / footer boxes show only then. */
  readonly slots = new SlotContent(this.host)

  /** Host `aria-label`, naming the landmark in place of "Documentation":  two navs on a page need two names. */
  readonly ariaLabel = new HostAttribute(this.host, UIT.ARIA_LABEL)

  /** The list, once the data has loaded. */
  readonly index = new Cell<NavIndex | undefined>(undefined)

  /** Why the data didn't load, if it didn't. */
  readonly failure = new Cell<string | undefined>(undefined)

  /** The search text, normalized (`NavIndex.normalize()`). */
  readonly query = new Cell("")

  /** Starred tags, as stored:  unknown ones are dropped by `favorites()`. */
  readonly starred = new Cell<ReadonlySet<string>>(new Set(isServer ? [] : NavPreferences.favorites()))

  /** Topic ids the viewer opened (no search typed). */
  readonly openTopics = new Cell<ReadonlySet<string>>(new Set(isServer ? [] : NavPreferences.openTopics()))

  /** Groups the viewer folded away (no search typed). */
  readonly closedGroups = new Cell<ReadonlySet<string>>(new Set(isServer ? [] : NavPreferences.closedGroups()))

  /** Topic ids the viewer closed during THIS search;  emptied when the query changes. */
  readonly searchClosed = new Cell<ReadonlySet<string>>(new Set())

  /** Groups the viewer folded during THIS search;  emptied when the query changes. */
  readonly searchClosedGroups = new Cell<ReadonlySet<string>>(new Set())

  /** Topics shut by the viewer whose fold is still easing shut:  their rows stay rendered until it has. */
  readonly closing = new Cell<ReadonlySet<string>>(new Set())

  /** The viewer closed the topic opened for the current page:  don't open it again. */
  readonly autoClosed = new Cell(false)

  /** The list's widgets are ready and the current page revealed:  from now on a topic eases open. */
  readonly settled = new Cell(false)

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
    return row?.main ? row : undefined
  })

  /** The topic Topics opens for the current page:  its first, unless an open topic already holds it. */
  readonly autoTopic = createMemo(() => {
    const row = this.currentRow()
    if (!row || this.autoClosed.get()) return undefined
    const open = this.openTopics.get()
    return row.topics.some((topic) => open.has(topic)) ? undefined : row.topics[0]
  })

  /** A search is typed. */
  readonly searching = createMemo(() => !!this.query.get())

  constructor(...args: ConstructorParameters<typeof UIElement>) {
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
      (done) => {
        if (done) queueMicrotask(() => void this.afterListed())
      }
    )
  }

  protected override hostStates() {
    return {
      searching: this.searching(),
      empty: this.searching() && this.matched().size === 0,
      listed: !!(this.index.get() || this.failure.get()),
      settled: this.settled.get()
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("nav")} ref={(element: HTMLElement) => this.wire(element)}>
        {this.masthead()}
        <nav part={this.part("menu")} aria-label={this.ariaLabel.get() ?? this.text("navLabel")}>
          {this.group("start", "getStarted", this.pages(TOP_PAGES))}
          <Show when={this.favoriteRows().length}>
            {this.group(
              "favorites",
              "favorites",
              <ul class="rows favorites">
                <For each={this.favoriteRows()}>{(row) => this.row(row)}</For>
              </ul>
            )}
          </Show>
          {this.group("components", "components", this.components(), this.count())}
          {this.group("foundation", "foundation", this.pages(FOUNDATION_PAGES))}
          <Show when={this.slots.has(this.slot("footer"))}>
            <div class="slotted footer">
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
      <div class="masthead" part={this.part("header")}>
        <Show when={this.slots.has(this.slot("header"))}>
          <div class="slotted header">
            <slot name={this.slot("header")} />
          </div>
        </Show>
        <div class="tools">
          <ui-docs-search
            ref={(element: HTMLElement) => (this.search = element as DocsSearchHost)}
            part={this.part("search")}
            base={this.attrs.base}
          />
          <ui-buttons part={this.part("views")} size="small" basic="" icon="" aria-label={this.text("views")}>
            {this.viewButton("az")}
            {this.viewButton("topics")}
          </ui-buttons>
        </div>
        <span class="ui-visually-hidden-force" role="status">
          {this.status()}
        </span>
      </div>
    )
  }

  /**
   * One group:  its heading band (a `<button aria-expanded>` in an `<h2>`, the brand's sub-head band), then its fold.
   * - The fold stays rendered while shut:  `inert` keeps its links out of reach, the sheet hides it once folded.
   */
  private group(group: NavGroup, title: DocsNavText, body: JSX.Element, extra?: JSX.Element): JSX.Element {
    const open = () => this.isGroupOpen(group)
    const fold = `nav-group-${group}`
    return (
      <section class={["group", group]}>
        <h2 class="heading">
          <button
            type="button"
            class="band"
            data-nav-group={group}
            aria-expanded={open() ? "true" : "false"}
            aria-controls={fold}
          >
            <span class="title">{this.text(title)}</span>
            {extra}
            {this.chevron()}
          </button>
        </h2>
        <div id={fold} class={["fold", { open: open() }]} inert={open() ? undefined : ""}>
          <div class="folded">{body}</div>
        </div>
      </section>
    )
  }

  /** The Components group's body:  loading, the error, or the list (A-Z rows or the topics) and "no matches". */
  private components(): JSX.Element {
    return (
      <Switch>
        <Match when={this.failure.get()}>
          <ui-message class="problem" size="small" state="negative" header={this.text("loadError")}>
            {this.failure.get()}
          </ui-message>
        </Match>
        <Match when={!this.index.get()}>
          <p class="note">{this.text("loading")}</p>
        </Match>
        <Match when={true}>
          <Show
            when={this.view.get() === "topics"}
            fallback={
              <ul class="rows">
                <For each={this.azRows()}>{(row) => this.row(row)}</For>
              </ul>
            }
          >
            <For each={this.index.get()!.topics}>{(topic, index) => this.topic(topic, index)}</For>
          </Show>
          <Show when={this.searching() && this.matched().size === 0}>
            <p class="note empty">{this.text("noMatches")}</p>
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
    const open = () => this.isOpen(topic.id)
    const fold = () => `nav-topic-${index()}`
    return (
      <Show when={rows().length}>
        <h3 class="heading">
          <button
            type="button"
            class="band topic"
            data-nav-topic={topic.id}
            aria-expanded={open() ? "true" : "false"}
            aria-controls={open() ? fold() : undefined}
          >
            <span class="title">{topic.title}</span>
            <ui-label class="count" size="mini" circular="" aria-label={this.text("count", { count: rows().length })}>
              {rows().length}
            </ui-label>
            {this.chevron()}
          </button>
        </h3>
        <Show when={open() || this.closing.get().has(topic.id)}>
          <div
            id={fold()}
            class={["fold", "topic-rows", { open: open() }]}
            data-nav-fold={topic.id}
            inert={open() ? undefined : ""}
          >
            <div class="folded">
              <ul class="rows">
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
    const starred = () => this.favorites().has(row.tag)
    const current = () => this.currentRow() === row
    const label = () => this.text(starred() ? "removeFavorite" : "addFavorite", { name: row.name })
    return (
      <li class="row">
        <a
          class="item"
          href={this.href(row.href)}
          aria-current={current() ? "page" : undefined}
          data-nav-link={row.tag}
          data-nav-current={current() ? "" : undefined}
        >
          <span class="name">{row.name}</span>
          {row.status && (
            <ui-label class="status" size="mini" color="yellow" basic="">
              {this.text(row.status === "planned" ? "planned" : "inProgress")}
            </ui-label>
          )}
        </a>
        <ui-button
          class="star"
          data-nav-star={row.tag}
          toggle=""
          active={starred() ? "" : undefined}
          icon={starred() ? ICONS.star : ICONS.starOutline}
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
      <ul class="rows pages">
        <For each={pages}>{(page) => this.pageRow(page)}</For>
      </ul>
    )
  }

  /** A hand-written page's row:  its icon and name. */
  private pageRow(page: NavPage): JSX.Element {
    const current = () => this.current() === page.id
    return (
      <li class="row">
        <a
          class="item"
          href={this.href(page.file)}
          aria-current={current() ? "page" : undefined}
          data-nav-link={page.id}
          data-nav-current={current() ? "" : undefined}
        >
          <span class="icon">
            <ui-icon name={page.icon} />
          </span>
          <span class="name">{this.text(page.text)}</span>
        </a>
      </li>
    )
  }

  /** A band's chevron (a box round the icon, whose host is `display: contents`):  the sheet turns it while shut. */
  private chevron(): JSX.Element {
    return (
      <span class="chevron">
        <ui-icon name={ICONS.chevron} />
      </span>
    )
  }

  /** The live status:  how many match, while searching. */
  private status(): string {
    if (!this.searching()) return ""
    const count = this.matched().size
    return count === 1 ? this.text("matchOne") : this.text("matchMany", { count })
  }

  /** `path` (relative to the site root) against `base`. */
  private href(path: string): string {
    return this.base() + path
  }

  /** Is `topic` open now:  every matching topic while searching (unless closed for it), else the viewer's. */
  private isOpen(topic: string): boolean {
    if (this.searching()) return !this.searchClosed.get().has(topic)
    return this.openTopics.get().has(topic) || this.autoTopic() === topic
  }

  /**
   * Is `group` open now:  unless the viewer folded it.
   * - While searching, the groups a search filters (Favourites, Components) open, unless folded for this search.
   */
  private isGroupOpen(group: NavGroup): boolean {
    if (this.searching() && UIDocsNav.SEARCHED.has(group)) return !this.searchClosedGroups.get().has(group)
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
    const target = UIDocsNav.dataTarget(event)
    if (!target) return
    const { element, name, value } = target
    if (name === DATA.star) this.toggleFavorite(value, element, event)
    else if (name === DATA.topic) this.toggleTopic(value)
    else if (name === DATA.group) this.toggleGroup(value as NavGroup)
    else if (name === DATA.view) this.setView(value as NavView, event)
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
    if (event.propertyName !== "grid-template-rows") return
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
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const fold = this.box?.querySelector(`[${DATA.fold}="${CSS.escape(topic)}"]`)
        if (!fold?.getAnimations().length) this.closed(topic)
      })
    )
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

  /** Switch the view, as the viewer did with `event`;  remembered. */
  private setView(view: NavView, event: Event) {
    if (view === untrack(() => this.view.get())) return
    const applied = this.view.request(view, () => this.emit("ui-change", { view, originalEvent: event }))
    if (applied) NavPreferences.setView(view)
  }

  /** Open or close `topic`;  remembered unless searching.  A topic shut with motion on eases shut (`closing`). */
  private toggleTopic(topic: string) {
    const open = untrack(() => this.isOpen(topic))
    if (open && matchMedia(MOTION_QUERY).matches) {
      this.closing.set(new Set(untrack(() => this.closing.get())).add(topic))
      this.closeSoon(topic)
    }
    if (untrack(() => this.searching())) {
      this.searchClosed.set(
        UIDocsNav.flip(
          untrack(() => this.searchClosed.get()),
          topic,
          open
        )
      )
      return
    }
    const topics = UIDocsNav.flip(
      untrack(() => this.openTopics.get()),
      topic,
      !open
    )
    if (open && topic === untrack(() => this.autoTopic())) this.autoClosed.set(true)
    this.openTopics.set(topics)
    NavPreferences.setOpenTopics(topics)
  }

  /** Fold or unfold `group`;  remembered, unless it's one a search opened. */
  private toggleGroup(group: NavGroup) {
    const open = untrack(() => this.isGroupOpen(group))
    if (untrack(() => this.searching()) && UIDocsNav.SEARCHED.has(group)) {
      this.searchClosedGroups.set(
        UIDocsNav.flip(
          untrack(() => this.searchClosedGroups.get()),
          group,
          open
        )
      )
      return
    }
    const groups = UIDocsNav.flip(
      untrack(() => this.closedGroups.get()),
      group,
      open
    )
    this.closedGroups.set(groups)
    NavPreferences.setClosedGroups(groups)
  }

  /**
   * Star or un-star `tag`;  remembered, `ui-favorite`.
   * - Un-starring from the Favourites list removes the clicked row:  focus moves to the tag's star in the list
   *   below, else the search box.
   */
  private toggleFavorite(tag: string, star: Element, event: Event) {
    const favorites = new Set(untrack(() => this.favorites()))
    const favorite = !favorites.has(tag)
    if (favorite) favorites.add(tag)
    else favorites.delete(tag)
    this.starred.set(favorites)
    const rows = untrack(() => this.index.get()?.rows ?? [])
    const list = rows.filter((row) => favorites.has(row.tag)).map((row) => row.tag)
    NavPreferences.setFavorites(list)
    this.emit("ui-favorite", { tag, favorite, favorites: list, originalEvent: event })
    if (favorite || !star.closest(".favorites")) return
    queueMicrotask(() => {
      const next = this.box?.querySelector<HTMLElement>(`.rows:not(.favorites) [${DATA.star}="${CSS.escape(tag)}"]`)
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
      this.box?.querySelector<HTMLElement>(`.rows:not(.favorites) ${shown}`) ??
      this.box?.querySelector<HTMLElement>(shown)
    if (!item) return
    const scroller = UIDocsNav.scroller(item)
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

  /** The list (or its error) has rendered:  wait for its widgets, reveal the current page, resolve `listed`. */
  private async afterListed() {
    const hosts = [...(this.box?.querySelectorAll("*") ?? [])].filter(
      (element): element is UIHost => "ready" in element
    )
    await Promise.all(hosts.map((host) => host.ready))
    this.revealCurrent()
    this.resolveListed()
    this.settled.set(true)
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Groups a search filters:  they open while searching. */
  private static readonly SEARCHED: ReadonlySet<NavGroup> = new Set(["favorites", "components"])

  /** A copy of `set` with `item` in it (`present`) or not. */
  private static flip(set: ReadonlySet<string>, item: string, present: boolean): Set<string> {
    const next = new Set(set)
    if (present) next.add(item)
    else next.delete(item)
    return next
  }

  /** The nearest element on `event`'s path with one of the `DATA` attributes:  it, the attribute, its value. */
  private static dataTarget(event: Event): { element: Element; name: string; value: string } | undefined {
    for (const target of event.composedPath()) {
      if (!(target instanceof Element)) continue
      for (const name of [DATA.star, DATA.topic, DATA.group, DATA.view, DATA.link]) {
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
  private static scroller(element: Element): HTMLElement | undefined {
    const page = document.scrollingElement
    let node: Element | null = UIDocsNav.flatParent(element)
    while (node && node !== page && node !== document.body) {
      if (node instanceof HTMLElement && node.scrollHeight > node.clientHeight) {
        const overflow = getComputedStyle(node).overflowY
        if (overflow === "auto" || overflow === "scroll") return node
      }
      node = UIDocsNav.flatParent(node)
    }
    return undefined
  }

  /** `element`'s parent in the flat tree:  its slot, its parent, or its shadow root's host. */
  private static flatParent(element: Element): Element | null {
    if (element.assignedSlot) return element.assignedSlot
    if (element.parentElement) return element.parentElement
    const root = element.getRootNode()
    return root instanceof ShadowRoot ? root.host : null
  }
}
