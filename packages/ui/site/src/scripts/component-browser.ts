import { SearchText } from "../lib/SearchText"
import { ComponentPageIndex } from "./component-page-index"
import { SiteStorage } from "./storage"

/**
 * Behaviour for the sidebar's component browser (`components/ComponentBrowser.astro`):  A-Z / Topics views, search,
 * favorites.  Started by `SiteLayout.start()`.
 * - Works on the build-time markup:  both views are already in the page;  this shows one, filters rows (`hidden`),
 *   and clones A-Z rows into Favorites.
 * - Search matches each tag's key from the page's component index (`ComponentPageIndex`:  name, tag, topics, other
 *   names), case / spacing / dash blind (`SearchText`).  While searching, every topic with a match opens;  clearing
 *   the search restores the topics the user had open.
 * - Persists (`SiteStorage`):  favorites (tags), the view, the open topics.  NOT the search text.
 * - Every star of a tag (A-Z, each topic, Favorites) is kept in step through `data-tag`.
 */
export class ComponentBrowser {
  /** `localStorage` key for favorite tags, a JSON list. */
  static readonly FAVORITES_KEY = "spell-ui-site:favorites"
  /** `localStorage` key for the view:  `az` (default, absent) or `topics`. */
  static readonly VIEW_KEY = "spell-ui-site:components-view"
  /** `localStorage` key for the open topic ids, a JSON list. */
  static readonly OPEN_TOPICS_KEY = "spell-ui-site:open-topics"

  private readonly index = ComponentPageIndex.read()
  private readonly favorites: Set<string>
  /** topics open outside a search;  a search opens matches without touching this */
  private readonly openTopics: Set<string>
  /** normalized search text */
  private query = ""

  private readonly search: HTMLElement
  private readonly status: HTMLElement
  private readonly empty: HTMLElement
  private readonly favoritesSection: HTMLElement
  private readonly favoritesList: HTMLElement
  private readonly azPanel: HTMLElement
  private readonly topics: HTMLDetailsElement[]

  /** Start the browser in the page's sidebar, if it has one. */
  static start(): ComponentBrowser | undefined {
    const root = document.querySelector<HTMLDetailsElement>("[data-browser]")
    return root ? new ComponentBrowser(root) : undefined
  }

  private constructor(private readonly root: HTMLDetailsElement) {
    this.search = root.querySelector("[data-browser-search]")!
    this.status = root.querySelector("[data-browser-status]")!
    this.empty = root.querySelector("[data-browser-empty]")!
    this.favoritesSection = root.querySelector("[data-favorites]")!
    this.favoritesList = root.querySelector("[data-favorites-list]")!
    this.azPanel = root.querySelector('[data-panel="az"]')!
    this.topics = [...root.querySelectorAll<HTMLDetailsElement>("[data-topic]")]

    // a tag the index no longer has (renamed, removed) is dropped
    this.favorites = new Set(SiteStorage.readList(ComponentBrowser.FAVORITES_KEY).filter((tag) => tag in this.index))
    this.openTopics = new Set(SiteStorage.readList(ComponentBrowser.OPEN_TOPICS_KEY))
    for (const topic of this.topics) topic.open = this.openTopics.has(topic.dataset.topic!)
    this.setView(SiteStorage.read(ComponentBrowser.VIEW_KEY) === "topics" ? "topics" : "az", false)
    for (const tag of this.favorites) this.syncStars(tag)
    this.renderFavorites()

    root.addEventListener("click", this.onClick)
    this.search.addEventListener("ui-input", this.onSearch)
    document.addEventListener("keydown", this.onKeyDown)

    root.querySelector<HTMLElement>("[data-browser-tools]")!.hidden = false
    root.toggleAttribute("data-ready", true)
  }

  ////////////////
  // ## Views
  ////////////////

  /** Show the A-Z list or the topics;  `persist` saves the choice. */
  private setView(view: BrowserView, persist = true) {
    for (const button of this.root.querySelectorAll<HTMLElement>("[data-view]")) {
      button.setAttribute("aria-pressed", String(button.dataset.view === view))
    }
    for (const panel of this.root.querySelectorAll<HTMLElement>("[data-panel]")) {
      panel.hidden = panel.dataset.panel !== view
    }
    if (persist) SiteStorage.write(ComponentBrowser.VIEW_KEY, view === "az" ? undefined : view)
  }

  /**
   * The user is opening or closing `topic` (a click on its summary, which Enter / Space also fire):  remember it.
   * - From the click, not the `toggle` event:  `toggle` fires a task later, also for the topics a search opens, and
   *   can't tell the two apart once the search text has changed in between.
   */
  private toggleTopic(topic: HTMLDetailsElement) {
    const id = topic.dataset.topic!
    // the click's default action hasn't toggled it yet
    if (topic.open) this.openTopics.delete(id)
    else this.openTopics.add(id)
    SiteStorage.writeList(ComponentBrowser.OPEN_TOPICS_KEY, this.openTopics)
  }

  ////////////////
  // ## Favorites
  ////////////////

  /** Stars, view buttons, topic titles (delegated). */
  private onClick = (event: MouseEvent) => {
    const target = event.target as Element
    const star = target.closest<HTMLElement>("[data-star]")
    if (star) return this.toggleFavorite(star.closest<HTMLElement>("[data-tag]")!.dataset.tag!, star)
    const view = target.closest<HTMLElement>("[data-view]")?.dataset.view
    if (view === "az" || view === "topics") return this.setView(view)
    const topic = target.closest("[data-topic] > summary")?.parentElement
    if (topic instanceof HTMLDetailsElement) this.toggleTopic(topic)
  }

  /**
   * Add or remove `tag`, then rebuild Favorites.
   * - Focus stays on a star that's still there;  un-starring from the Favorites list moves it to that tag's A-Z star,
   *   since the clicked row is gone.
   */
  private toggleFavorite(tag: string, star: HTMLElement) {
    if (this.favorites.has(tag)) this.favorites.delete(tag)
    else this.favorites.add(tag)
    SiteStorage.writeList(ComponentBrowser.FAVORITES_KEY, this.favorites)
    this.syncStars(tag)
    const fromFavorites = this.favoritesList.contains(star)
    this.renderFavorites()
    if (fromFavorites && !this.favorites.has(tag)) this.starOf(this.azPanel, tag)?.focus()
  }

  /** Every star of `tag`:  pressed state, label, icon. */
  private syncStars(tag: string) {
    const on = this.favorites.has(tag)
    const name = this.azPanel.querySelector(`[data-tag="${tag}"] a`)?.textContent?.trim() ?? tag
    for (const star of this.root.querySelectorAll<HTMLElement>(`[data-tag="${tag}"] [data-star]`)) {
      star.setAttribute("aria-pressed", String(on))
      star.setAttribute("aria-label", on ? `Remove ${name} from favorites` : `Add ${name} to favorites`)
      star.querySelector("use")?.setAttribute("href", on ? "#site-icon-star" : "#site-icon-star-outline")
    }
  }

  /** Favorites:  a clone of each favorite's A-Z row, in A-Z order;  then re-apply the search. */
  private renderFavorites() {
    const rows = [...this.azPanel.querySelectorAll<HTMLElement>("[data-tag]")]
      .filter((row) => this.favorites.has(row.dataset.tag!))
      .map((row) => row.cloneNode(true) as HTMLElement)
    this.favoritesList.replaceChildren(...rows)
    this.applyQuery()
  }

  /** `tag`'s star inside `container`. */
  private starOf(container: Element, tag: string): HTMLElement | null {
    return container.querySelector<HTMLElement>(`[data-tag="${tag}"] [data-star]`)
  }

  ////////////////
  // ## Search
  ////////////////

  /** The search box changed (every keystroke). */
  private onSearch = (event: Event) => {
    const { value } = (event as CustomEvent<{ value: string }>).detail
    const query = SearchText.normalize(value ?? "")
    if (query === this.query) return
    this.query = query
    this.applyQuery()
  }

  /**
   * Hide rows that don't match, topics and Favorites left empty;  update counts, "No components match" and the
   * live status.  While searching, topics with a match open;  without a search, the saved ones.
   */
  private applyQuery() {
    const matched = new Set<string>()
    for (const row of this.root.querySelectorAll<HTMLElement>("[data-tag]")) {
      const tag = row.dataset.tag!
      const match = SearchText.matches(this.index[tag]?.search ?? "", this.query)
      row.hidden = !match
      if (match) matched.add(tag)
    }
    for (const topic of this.topics) {
      const visible = topic.querySelectorAll("[data-tag]:not([hidden])").length
      topic.hidden = visible === 0
      topic.querySelector("[data-count]")!.textContent = String(visible)
      topic.open = this.query ? visible > 0 : this.openTopics.has(topic.dataset.topic!)
    }
    this.favoritesSection.hidden = !this.favoritesList.querySelector("[data-tag]:not([hidden])")
    this.empty.hidden = matched.size > 0
    this.status.textContent = this.query
      ? `${matched.size} ${matched.size === 1 ? "component matches" : "components match"}`
      : ""
  }

  /** `/` focuses the search box, unless the user is typing in a field. */
  private onKeyDown = (event: KeyboardEvent) => {
    if (event.key !== "/" || event.ctrlKey || event.metaKey || event.altKey || event.defaultPrevented) return
    if (ComponentBrowser.isTyping(event)) return
    // the mobile menu closed:  the box isn't on screen, so `/` stays an ordinary key
    if (!this.root.parentElement?.checkVisibility()) return
    event.preventDefault()
    this.root.open = true
    this.search.focus()
  }

  /** Did `event` come from a text field, `<select>` or editable content (inside a shadow root too)? */
  private static isTyping(event: Event): boolean {
    const origin = event.composedPath()[0]
    if (!(origin instanceof HTMLElement)) return false
    return origin.isContentEditable || origin.matches(ComponentBrowser.TYPING)
  }

  /** Where `/` is a character, not a shortcut:  text-like inputs, text areas, selects. */
  private static readonly TYPING =
    "textarea, select, input:not([type=checkbox], [type=radio], [type=button], [type=submit], [type=reset], " +
    "[type=range], [type=color], [type=file], [type=image])"
}

/** The browser's two lists. */
type BrowserView = "az" | "topics"
