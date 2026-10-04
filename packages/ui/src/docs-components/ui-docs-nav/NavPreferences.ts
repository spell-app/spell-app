import { STORAGE_KEYS, type NavView } from "./ui-docs-nav.types"

/****************
 * ### `NavPreferences`
 * The viewer's nav preferences in `localStorage`:  favourites, the view, the open topics, the folded groups.  Replaces
 * the Astro site's `SiteStorage` (same keys, `STORAGE_KEYS`, so a viewer keeps theirs).
 * - Every access is wrapped:  private windows and blocked storage THROW, and then a preference just doesn't persist.
 * - Per viewer and browser only;  NOT the search text.
 ****************/
export class NavPreferences {
  /** Starred tags, as stored (a hand-edited or stale entry included:  the element drops unknown tags). */
  static favorites(): string[] {
    return NavPreferences.readList(STORAGE_KEYS.favorites)
  }

  /** Store the starred tags;  none removes the key. */
  static setFavorites(tags: Iterable<string>) {
    NavPreferences.writeList(STORAGE_KEYS.favorites, tags)
  }

  /** The remembered view, or `undefined`. */
  static view(): NavView | undefined {
    const view = NavPreferences.read(STORAGE_KEYS.view)
    return view === "topics" || view === "az" ? view : undefined
  }

  /**
   * Remember `view`, either one:  the default is Topics (`DEFAULT_VIEW`), so A-Z must be stored too.
   * - NOTE:  the Astro site stored only `topics` (A-Z was its default), so its A-Z viewers now start on Topics.
   */
  static setView(view: NavView) {
    NavPreferences.write(STORAGE_KEYS.view, view)
  }

  /** Topic ids the viewer opened. */
  static openTopics(): string[] {
    return NavPreferences.readList(STORAGE_KEYS.openTopics)
  }

  /** Store the open topic ids;  none removes the key. */
  static setOpenTopics(ids: Iterable<string>) {
    NavPreferences.writeList(STORAGE_KEYS.openTopics, ids)
  }

  /** Groups the viewer folded away (unknown names included:  the element only asks about its own). */
  static closedGroups(): string[] {
    return NavPreferences.readList(STORAGE_KEYS.closedGroups)
  }

  /** Store the folded groups;  none removes the key. */
  static setClosedGroups(groups: Iterable<string>) {
    NavPreferences.writeList(STORAGE_KEYS.closedGroups, groups)
  }

  ////////////////
  // ## Storage
  ////////////////

  /** `localStorage.getItem()`;  `undefined` if absent or storage is unavailable. */
  private static read(key: string): string | undefined {
    try {
      return localStorage.getItem(key) ?? undefined
    } catch {
      return undefined
    }
  }

  /** `localStorage.setItem()`, or `removeItem()` for `undefined`;  skipped if unavailable. */
  private static write(key: string, value: string | undefined) {
    try {
      if (value === undefined) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch {
      // private mode / blocked storage:  the preference just doesn't persist
    }
  }

  /** A stored list of strings;  `[]` if absent, unreadable or not a string array (a hand-edited value). */
  private static readList(key: string): string[] {
    try {
      const value: unknown = JSON.parse(NavPreferences.read(key) ?? "[]")
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
    } catch {
      return []
    }
  }

  /** Store a list of strings;  an empty list removes the key. */
  private static writeList(key: string, list: Iterable<string>) {
    const items = [...list]
    NavPreferences.write(key, items.length ? JSON.stringify(items) : undefined)
  }
}
