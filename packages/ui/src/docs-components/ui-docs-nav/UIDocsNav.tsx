import { For, Match, Show, Switch, createEffect, createMemo, untrack } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { Cell, HostAttribute, proto, SlotContent, UIElement, type UIHost, UIT } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"

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
  MENU_SELECT_EVENT,
  REVEAL_FRACTION,
  SEARCH_KEY,
  TOP_PAGES,
  TYPING_SELECTOR,
  type DocsNavController,
  type DocsNavVocabulary,
  type NavPage,
  type NavRow,
  type NavTopic,
  type NavView
} from "./ui-docs-nav.types"

import navCSS from "./ui-docs-nav.css?inline"

/****************
 * ### `<ui-docs-nav>`
 * The docs site's left sidebar:  Fomantic's dark `.toc` menu (`<div class="ui big vertical inverted menu">`, its
 * `site-menu` partial), with OUR organization (the Astro site's component browser):
 * - Shadow:  `<div class="ui [size] nav" part="nav">` (the scroll box) around ONE `<ui-menu vertical inverted fluid
 *   part="menu">` (the `<nav>` landmark), whose items are, top to bottom:
 *   - the `header` slot, if any;  the top links (Overview, Getting started, Grammar) in bold
 *   - Components:  an item with the `<ui-header>`, the count `<ui-label>`, the search `<ui-input>` and the A-Z /
 *     Topics `<ui-buttons>`;  then Favourites (an item:  header + sub-menu);  then the list:  A-Z, one item holding a
 *     sub-menu of every tag, or Topics, per topic a toggle item (`link`, `aria-expanded`) and, while open, an item
 *     holding its sub-menu
 *   - Foundation:  header + sub-menu;  the `footer` slot, if any
 * - A row is a link `<ui-item>` (status badge inside) plus its star, a `toggle` `<ui-button>`, side by side in the
 *   sub-menu (laid out in two columns by this sheet).
 * - Data:  `SiteData` (`components.json`), fetched once;  `NavIndex` makes the rows and topics.  Docs-only tags
 *   are never listed.  Links are `base` + the data's `href`.
 * - Search (`ui-input`, every keystroke):  hides what doesn't match;  every topic with a match opens (a toggle closes
 *   it for this query);  clearing restores the viewer's open topics.  The count label shows the matches;  a polite
 *   live region says them.
 * - Remembered per viewer (`NavPreferences`, wrapped `localStorage`):  favourites, the view, the open topics.  On
 *   load, Topics opens the current page's first topic if no open topic holds it (not remembered).
 * - The current page (`current`, default the page's file name) is `selected` (`aria-current="page"`) and scrolled
 *   into view inside the nav's scroll container once the list has rendered (`revealCurrent()`).
 * - Events:  `ui-navigate` (a plain click on a link, cancelable), `ui-change` (`{ view }`), `ui-favorite`.  The inner
 *   menu's `ui-select` is stopped here.  `/` focuses the search box while the nav is visible.
 * - A doc-only element (`src/docs-components/`):  its shadow composes other families' widgets, which its barrel
 *   imports.
 ****************/
export class UIDocsNav extends UIElement<DocsNavVocabulary> implements DocsNavController {
  @proto static vocabulary = docsNavVocabulary
  @proto static styles = { "docs-nav": navCSS }
  @proto static Fallback = DocsNavFallback
  @proto static Host = DocsNavHost
  @proto static delegatesFocus = false

  /** Which slots have content:  the header / footer items show only then. */
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

  /** Topic ids the viewer closed during THIS search;  emptied when the query changes. */
  readonly searchClosed = new Cell<ReadonlySet<string>>(new Set())

  /** The viewer closed the topic opened for the current page:  don't open it again. */
  readonly autoClosed = new Cell(false)

  /** `view`:  the host's when set, else the remembered one. */
  readonly view = this.controlled("view", (isServer ? undefined : NavPreferences.view()) ?? DEFAULT_VIEW)

  /** Resolves once the list (or its error) has rendered;  see `DocsNavHost.listed`. */
  readonly listed: Promise<void>

  /** Resolves `listed`. */
  private resolveListed!: () => void

  /** The scroll box, while rendered. */
  private box: HTMLElement | undefined

  /** The search box, while rendered. */
  private search: UIHost | undefined

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
    // SIDE EFFECT:  `/` focuses the search box, while connected
    createEffect(
      () => this.connected.get(),
      (connected) => {
        if (!connected) return
        const onKeyDown = (event: KeyboardEvent) => this.onKeyDown(event)
        document.addEventListener("keydown", onKeyDown)
        return () => document.removeEventListener("keydown", onKeyDown)
      }
    )
  }

  protected override hostStates() {
    return {
      searching: this.searching(),
      empty: this.searching() && this.matched().size === 0,
      listed: !!(this.index.get() || this.failure.get())
    }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("nav")} ref={(element: HTMLElement) => this.wire(element)}>
        <ui-menu
          part={this.part("menu")}
          vertical=""
          inverted=""
          fluid=""
          size={this.attrs.size}
          aria-label={this.ariaLabel.get() ?? this.text("navLabel")}
        >
          <Show when={this.slots.has(this.slot("header"))}>
            <ui-item class="slotted">
              <slot name={this.slot("header")} />
            </ui-item>
          </Show>
          <For each={TOP_PAGES}>{(page) => this.pageItem(page, true)}</For>
          {this.tools()}
          <Switch>
            <Match when={this.failure.get()}>
              <ui-item>
                <ui-message size="small" state="negative" header={this.text("loadError")}>
                  {this.failure.get()}
                </ui-message>
              </ui-item>
            </Match>
            <Match when={!this.index.get()}>
              <ui-item>{this.text("loading")}</ui-item>
            </Match>
            <Match when={true}>
              <Show when={this.favoriteRows().length}>
                <ui-item class="group">
                  <ui-header>{this.text("favorites")}</ui-header>
                  <ui-menu class="rows favorites">
                    <For each={this.favoriteRows()}>{(row) => this.row(row)}</For>
                  </ui-menu>
                </ui-item>
              </Show>
              <Show when={this.view.get() === "topics"} fallback={this.azList()}>
                <For each={this.index.get()!.topics}>{(topic) => this.topic(topic)}</For>
              </Show>
              <Show when={this.searching() && this.matched().size === 0}>
                <ui-item class="empty">{this.text("noMatches")}</ui-item>
              </Show>
            </Match>
          </Switch>
          <ui-item class="group">
            <ui-header>{this.text("foundation")}</ui-header>
            <ui-menu>
              <For each={FOUNDATION_PAGES}>{(page) => this.pageItem(page, false)}</For>
            </ui-menu>
          </ui-item>
          <Show when={this.slots.has(this.slot("footer"))}>
            <ui-item class="slotted">
              <slot name={this.slot("footer")} />
            </ui-item>
          </Show>
        </ui-menu>
      </div>
    )
  }

  /** The Components item:  header + count, search box, A-Z / Topics switch, live status. */
  private tools(): JSX.Element {
    return (
      <ui-item class="tools">
        <div class="heading">
          <ui-header>
            {this.text("components")}
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
          </ui-header>
          <ui-buttons
            part={this.part("views")}
            size="mini"
            inverted=""
            basic=""
            icon=""
            aria-label={this.text("views")}
          >
            {this.viewButton("az")}
            {this.viewButton("topics")}
          </ui-buttons>
        </div>
        <ui-input
          ref={(element: HTMLElement) => (this.search = element as UIHost)}
          part={this.part("search")}
          type="search"
          icon={ICONS.search}
          icon-position="left"
          size="small"
          fluid=""
          placeholder={this.text("searchPlaceholder")}
          aria-label={this.text("search")}
          autocomplete="off"
        />
        <span class="ui-visually-hidden-force" role="status">
          {this.status()}
        </span>
      </ui-item>
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

  /** A-Z:  one item holding every matching row. */
  private azList(): JSX.Element {
    return (
      <Show when={this.azRows().length}>
        <ui-item class="group">
          <ui-menu class="rows">
            <For each={this.azRows()}>{(row) => this.row(row)}</For>
          </ui-menu>
        </ui-item>
      </Show>
    )
  }

  /** One topic:  its toggle, and while open, its matching rows;  nothing when none match. */
  private topic(topic: NavTopic): JSX.Element {
    const rows = createMemo(() => topic.rows.filter((row) => this.matched().has(row.tag)))
    const open = () => this.isOpen(topic.id)
    return (
      <Show when={rows().length}>
        <ui-item
          class="topic"
          data-nav-topic={topic.id}
          link=""
          icon={open() ? ICONS.open : ICONS.closed}
          aria-expanded={open() ? "true" : "false"}
        >
          {topic.title}
          <ui-label class="count" size="mini" circular="" aria-label={this.text("count", { count: rows().length })}>
            {rows().length}
          </ui-label>
        </ui-item>
        <Show when={open()}>
          <ui-item class="group topic-rows" fitted="vertically">
            <ui-menu class="rows">
              <For each={rows()}>{(row) => this.row(row)}</For>
            </ui-menu>
          </ui-item>
        </Show>
      </Show>
    )
  }

  /** One component:  its link item (with a status badge) and its star. */
  private row(row: NavRow): JSX.Element {
    const starred = () => this.favorites().has(row.tag)
    const current = () => this.currentRow() === row
    const label = () => this.text(starred() ? "removeFavorite" : "addFavorite", { name: row.name })
    return (
      <>
        <ui-item
          href={this.href(row.href)}
          selected={current() ? "" : undefined}
          data-nav-link={row.tag}
          data-nav-current={current() ? "" : undefined}
        >
          {row.name}
          {row.status && (
            <ui-label class="status" size="mini" color="yellow" basic="">
              {this.text(row.status === "planned" ? "planned" : "inProgress")}
            </ui-label>
          )}
        </ui-item>
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
      </>
    )
  }

  /** A hand-written page's link item;  `bold` for the top links (Fomantic's `<b>`). */
  private pageItem(page: NavPage, bold: boolean): JSX.Element {
    const current = () => this.current() === page.id
    return (
      <ui-item
        href={this.href(page.file)}
        selected={current() ? "" : undefined}
        data-nav-link={page.id}
        data-nav-current={current() ? "" : undefined}
      >
        {bold ? <b>{this.text(page.text)}</b> : this.text(page.text)}
      </ui-item>
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

  ////////////////
  // ## Behaviour
  ////////////////

  /** Listeners on the scroll box:  clicks (delegated), the search box, the view switch, the inner menu's selects. */
  private wire(box: HTMLElement) {
    this.box = box
    box.addEventListener("click", (event) => this.onClick(event))
    box.addEventListener("ui-input", (event) => this.onSearch(event as CustomEvent<{ value?: string }>))
    box.addEventListener("ui-toggle", (event) => this.onToggle(event))
    box.addEventListener(MENU_SELECT_EVENT, (event) => event.stopPropagation())
  }

  /** A click:  a star, a topic toggle, a view button, or a link (delegated, by `data-nav-*`). */
  private onClick(event: MouseEvent) {
    const target = UIDocsNav.dataTarget(event)
    if (!target) return
    const { element, name, value } = target
    if (name === DATA.star) this.toggleFavorite(value, element, event)
    else if (name === DATA.topic) this.toggleTopic(value)
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

  /** The search box changed (every keystroke). */
  private onSearch(event: CustomEvent<{ value?: string }>) {
    if (event.target !== this.search) return
    const query = NavIndex.normalize(event.detail.value ?? "")
    if (query === untrack(() => this.query.get())) return
    this.query.set(query)
    this.searchClosed.set(new Set())
  }

  /** Switch the view, as the viewer did with `event`;  remembered. */
  private setView(view: NavView, event: Event) {
    if (view === untrack(() => this.view.get())) return
    const applied = this.view.request(view, () => this.emit("ui-change", { view, originalEvent: event }))
    if (applied) NavPreferences.setView(view)
  }

  /** Open or close `topic`;  remembered unless searching. */
  private toggleTopic(topic: string) {
    const open = untrack(() => this.isOpen(topic))
    if (untrack(() => this.searching())) {
      const closed = new Set(untrack(() => this.searchClosed.get()))
      if (open) closed.add(topic)
      else closed.delete(topic)
      this.searchClosed.set(closed)
      return
    }
    const topics = new Set(untrack(() => this.openTopics.get()))
    if (open) {
      topics.delete(topic)
      if (topic === untrack(() => this.autoTopic())) this.autoClosed.set(true)
    } else topics.add(topic)
    this.openTopics.set(topics)
    NavPreferences.setOpenTopics(topics)
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
      const next = this.box?.querySelector<HTMLElement>(`.rows:not(.favorites) > [${DATA.star}="${CSS.escape(tag)}"]`)
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

  /** `/` focuses the search box, unless the viewer is typing in a field or the nav isn't on screen. */
  private onKeyDown(event: KeyboardEvent) {
    if (event.key !== SEARCH_KEY || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return
    const origin = event.composedPath()[0]
    if (origin instanceof HTMLElement && (origin.isContentEditable || origin.matches(TYPING_SELECTOR))) return
    if (!this.search || !this.host.checkVisibility()) return
    event.preventDefault()
    this.focusSearch()
  }

  ////////////////
  // ## Script API (`DocsNavHost`)
  ////////////////

  /** Focus the search box. */
  focusSearch() {
    this.search?.focus()
  }

  /**
   * Scroll the current page's item into view, a third of the way down its scroll container;  nothing if it's
   * already in view, or nothing scrolls (never the page itself).
   * - The item in the main list, not its copy in Favourites.
   */
  revealCurrent() {
    const item =
      this.box?.querySelector<UIHost>(`.rows:not(.favorites) > [${DATA.current}]`) ??
      this.box?.querySelector<UIHost>(`[${DATA.current}]`)
    const target = (item?.controller as { focusTarget?: HTMLElement } | undefined)?.focusTarget
    if (!target) return
    const scroller = UIDocsNav.scroller(target)
    if (!scroller) return
    const box = target.getBoundingClientRect()
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

  /** The list (or its error) has rendered:  wait for its items, reveal the current page, resolve `listed`. */
  private async afterListed() {
    const hosts = [...(this.box?.querySelectorAll("*") ?? [])].filter(
      (element): element is UIHost => "ready" in element
    )
    await Promise.all(hosts.map((host) => host.ready))
    this.revealCurrent()
    this.resolveListed()
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** The nearest element on `event`'s path with one of the `DATA` attributes:  it, the attribute, its value. */
  private static dataTarget(event: Event): { element: Element; name: string; value: string } | undefined {
    for (const target of event.composedPath()) {
      if (!(target instanceof Element)) continue
      for (const name of [DATA.star, DATA.topic, DATA.view, DATA.link]) {
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
