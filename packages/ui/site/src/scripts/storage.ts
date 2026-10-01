/**
 * The site's per-user preferences in `localStorage`, every access wrapped:  private windows and blocked storage
 * throw, and then a preference just doesn't persist.
 * - Keys are `spell-ui-site:<name>`;  each user of a key names it as a `static readonly` on its own class
 *   (`SiteLayout.SCHEME_KEY`, `ComponentBrowser.FAVORITES_KEY`).
 * - For now only;  per-user preferences on a server come later.
 */
export class SiteStorage {
  /** `localStorage.getItem()`, `undefined` if absent or storage is unavailable. */
  static read(key: string): string | undefined {
    try {
      return localStorage.getItem(key) ?? undefined
    } catch {
      return undefined
    }
  }

  /** `localStorage.setItem()`, or `removeItem()` for `undefined`;  silently skipped if unavailable. */
  static write(key: string, value: string | undefined) {
    try {
      if (value === undefined) localStorage.removeItem(key)
      else localStorage.setItem(key, value)
    } catch {
      // private mode / blocked storage:  the preference just doesn't persist
    }
  }

  /** A stored list of strings;  `[]` if absent, unreadable or not a string array (a hand-edited value). */
  static readList(key: string): string[] {
    try {
      const value: unknown = JSON.parse(SiteStorage.read(key) ?? "[]")
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
    } catch {
      return []
    }
  }

  /** Store a list of strings;  an empty list removes the key. */
  static writeList(key: string, list: Iterable<string>) {
    const items = [...list]
    SiteStorage.write(key, items.length ? JSON.stringify(items) : undefined)
  }
}
