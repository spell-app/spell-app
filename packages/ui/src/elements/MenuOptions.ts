import type {
  HighlightRange,
  MenuAddition,
  MenuAdditionOptions,
  MenuFilterOptions,
  MenuNavigateOptions,
  MenuOption
} from "./elements.types"

/**
 * The option model behind dropdown / select / search:  filtering, additions, selection exclusion, keyboard
 * navigation, type-ahead and match highlighting.  Pure data, NO DOM.
 * - Ported from SUI React's `getMenuOptions()` (filter => exclude selected => additions) with Fomantic's
 *   dropdown `match` settings (`match`, `fullTextSearch`, `ignoreDiacritics`, `ignoreSearchCase`, `minCharacters`).
 * - Immutable:  each step returns a NEW `MenuOptions`, so a render can keep the previous list, e.g.
 *   `menu.excludeSelected(values).filter(query).withAdditions(query, { allowAdditions: true })`.
 * - Fast on 1000s of options:  lower-cased (and, on demand, diacritic-stripped) search keys are computed
 *   lazily ONCE per option object and shared by every derived list through a `WeakMap`.
 */
export class MenuOptions {
  /** The options in this list, in order. */
  readonly options: readonly (MenuOption | MenuAddition)[]

  /**
   * The pending addition from `withAdditions()` -- also set when `hideAdditions` keeps it out of `options`,
   * so Enter can still add it.
   */
  readonly addition: MenuAddition | undefined

  /** Search keys per option, shared with derived lists. */
  private readonly keys: WeakMap<MenuOption, SearchKeys>

  constructor(
    options: readonly (MenuOption | MenuAddition)[] = [],
    addition?: MenuAddition,
    keys = new WeakMap<MenuOption, SearchKeys>()
  ) {
    this.options = options
    this.addition = addition
    this.keys = keys
  }

  /** Number of options. */
  get length() {
    return this.options.length
  }

  ////////////////
  // ## Filtering
  ////////////////

  /**
   * Options matching `query`, as Fomantic's `filterItems()`:  prefix match always counts, then
   * `fullTextSearch` widens it (`"exact"` => substring, `true` => fuzzy).
   * - An empty query, or one shorter than `minCharacters`, filters nothing.
   * - `search: "both"` (default) matches text OR value.
   */
  filter(query: string, options: MenuFilterOptions = {}): MenuOptions {
    const { search = "both", fullTextSearch = "exact", ignoreDiacritics = false, ignoreCase = true } = options
    if (!query || query.length < (options.minCharacters ?? 0)) return this
    if (typeof search === "function") return this.derive(search(this.options, query))
    const term = this.normalize(query, ignoreCase, ignoreDiacritics)
    const matchText = search !== "value"
    const matchValue = search !== "text"
    const results: MenuOption[] = []
    for (const option of this.options) {
      const text = this.key(option, "text", ignoreCase, ignoreDiacritics)
      const value = this.key(option, "value", ignoreCase, ignoreDiacritics)
      if (
        (matchText && MenuOptions.matches(text, term, fullTextSearch)) ||
        (matchValue && MenuOptions.matches(value, term, fullTextSearch))
      ) {
        results.push(option)
      }
    }
    return this.derive(results)
  }

  /** Options whose value isn't in `values`, e.g. hide chosen labels in a multiple dropdown. */
  excludeSelected(values: Iterable<string>): MenuOptions {
    const selected = new Set(values)
    if (!selected.size) return this
    return this.derive(this.options.filter((option) => !selected.has(option.value)))
  }

  /**
   * Add `query` as a new option when additions are allowed and no option's text or value equals it.
   * - `additionPosition: "top"` (default) puts it first;  `"bottom"` last.
   * - `hideAdditions` keeps it out of `options` but sets `addition`.
   * - NOTE: text / value equality is case-insensitive by default, so `Red` isn't offered next to `red`.
   */
  withAdditions(query: string, options: MenuAdditionOptions = {}): MenuOptions {
    const { allowAdditions = false, additionLabel = "Add ", additionPosition = "top", hideAdditions = false } = options
    const term = query.trim()
    if (!allowAdditions || !term) return this
    const ignoreCase = options.ignoreCase ?? true
    const wanted = ignoreCase ? term.toLowerCase() : term
    const exists = this.options.some((option) => {
      const keys = this.keysOf(option)
      return ignoreCase
        ? keys.text === wanted || keys.value === wanted
        : option.text === wanted || option.value === wanted
    })
    if (exists) return this
    const addition: MenuAddition = { value: term, text: term, addition: true, label: additionLabel }
    if (hideAdditions) return new MenuOptions(this.options, addition, this.keys)
    const list = additionPosition === "bottom" ? [...this.options, addition] : [addition, ...this.options]
    return new MenuOptions(list, addition, this.keys)
  }

  ////////////////
  // ## Navigation
  ////////////////

  /**
   * Index of the enabled option `delta` steps from `from`, skipping disabled ones -- arrow keys, PageUp / Down.
   * - `from` may be `-1` (nothing active):  `+1` lands on the first enabled option, `-1` on the last.
   * - Without `wrap`, stops at the ends:  returns the last enabled option in that direction, or `from` if
   *   there is none.
   * - `-1` when no option is enabled.
   */
  nextEnabledIndex(from: number, delta: number, options: MenuNavigateOptions = {}): number {
    const { options: list } = this
    const { length } = list
    const wrap = options.wrap ?? false
    if (!list.some((option) => !option.disabled)) return -1
    if (!delta) return from
    const step = delta > 0 ? 1 : -1
    const origin = from < 0 || from >= length ? (step > 0 ? -1 : length) : from
    const target = wrap ? MenuOptions.wrap(origin + delta, length) : Math.max(0, Math.min(length - 1, origin + delta))
    for (let index = target, tries = 0; tries < length; tries++) {
      if (!list[index].disabled) return index
      index += step
      if (wrap) index = MenuOptions.wrap(index, length)
      else if (index < 0 || index >= length) break
    }
    // Ran off an end without wrapping:  take the furthest enabled option between `from` and that end.
    for (let index = target - step; index !== origin && index >= 0 && index < length; index -= step) {
      if (!list[index].disabled) return index
    }
    return from
  }

  /**
   * Type-ahead:  index of the next enabled option after `from` whose text starts with `prefix`, wrapping.
   * - Case- and diacritic-insensitive.
   * - Repeating one character (`"aaa"`) cycles through options starting with it, per the APG listbox pattern.
   * - `-1` when nothing matches.  The element owns the keystroke buffer and its timeout.
   */
  selectionForKey(prefix: string, from = -1): number {
    const { length } = this.options
    if (!prefix || !length) return -1
    let term = this.normalize(prefix, true, true)
    const repeated = REPEATED_CHARACTER.exec(term)
    if (repeated) term = repeated[1]
    // A multi-character buffer refines the CURRENT match, so start there;  one character moves on.
    const start = term.length > 1 ? Math.max(from, 0) : from + 1
    for (let offset = 0; offset < length; offset++) {
      const index = (start + offset + length) % length
      const option = this.options[index]
      if (!option.disabled && this.key(option, "text", true, true).startsWith(term)) return index
    }
    return -1
  }

  ////////////////
  // ## Highlighting
  ////////////////

  /**
   * Ranges of `option.text` matching `query`, for `highlightMatches`:  one range for a contiguous match,
   * else one per fuzzy-matched character (adjacent ones merged).
   * - Indices are into the ORIGINAL text, even when diacritics or case were ignored.
   * - `[]` when nothing matches.
   */
  highlights(option: MenuOption, query: string, options: MenuFilterOptions = {}): HighlightRange[] {
    const { ignoreDiacritics = false, ignoreCase = true } = options
    if (!query) return []
    const term = this.normalize(query, ignoreCase, ignoreDiacritics)
    const { folded, origins } = this.fold(option.text, ignoreCase, ignoreDiacritics)
    const at = folded.indexOf(term)
    if (at >= 0) return [[origins[at], origins[at + term.length]]]
    const ranges: [number, number][] = []
    let position = 0
    for (const char of term) {
      const found = folded.indexOf(char, position)
      if (found < 0) return []
      const start = origins[found]
      const end = origins[found + char.length]
      const last = ranges.at(-1)
      if (last && last[1] === start) last[1] = end
      else ranges.push([start, end])
      position = found + char.length
    }
    return ranges
  }

  ////////////////
  // ## Internals
  ////////////////

  /** New list sharing this one's key cache. */
  private derive(options: readonly MenuOption[]) {
    return new MenuOptions(options, undefined, this.keys)
  }

  /** Cached keys for `option`, created on first use. */
  private keysOf(option: MenuOption): SearchKeys {
    let keys = this.keys.get(option)
    if (!keys) {
      keys = { text: option.text.toLowerCase(), value: String(option.value).toLowerCase() }
      this.keys.set(option, keys)
    }
    return keys
  }

  /** `query` folded the same way as the keys it's compared with. */
  private normalize(query: string, ignoreCase: boolean, ignoreDiacritics: boolean) {
    const text = ignoreDiacritics ? MenuOptions.deburr(query) : query
    return ignoreCase ? text.toLowerCase() : text
  }

  /**
   * `text` folded char by char, with each folded index's origin in `text`, so highlight ranges map back.
   * - `origins` has one extra entry (`text.length`) so `origins[end]` works for a match at the very end.
   */
  private fold(text: string, ignoreCase: boolean, ignoreDiacritics: boolean) {
    let folded = ""
    const origins: number[] = []
    let index = 0
    for (const char of text) {
      let piece = ignoreDiacritics ? MenuOptions.deburr(char) : char
      if (ignoreCase) piece = piece.toLowerCase()
      for (let unit = 0; unit < piece.length; unit++) origins.push(index)
      folded += piece
      index += char.length
    }
    origins.push(index)
    return { folded, origins }
  }

  /**
   * `option`'s folded text or value for comparing with a folded query;  the diacritic-free variant
   * is computed on first need and cached.
   */
  private key(option: MenuOption, field: "text" | "value", ignoreCase: boolean, ignoreDiacritics: boolean) {
    if (!ignoreCase) {
      const raw = field === "text" ? option.text : String(option.value)
      return ignoreDiacritics ? MenuOptions.deburr(raw) : raw
    }
    const keys = this.keysOf(option)
    if (!ignoreDiacritics) return keys[field]
    if (field === "text") return (keys.plainText ??= MenuOptions.deburr(keys.text))
    return (keys.plainValue ??= MenuOptions.deburr(keys.value))
  }

  /** `index` wrapped into `0 .. length - 1`. */
  private static wrap(index: number, length: number) {
    return ((index % length) + length) % length
  }

  /** Fomantic's match:  prefix, else substring (`"exact"`) or in-order characters (`true`). */
  private static matches(key: string, term: string, fullTextSearch: "exact" | boolean) {
    if (key.startsWith(term)) return true
    if (fullTextSearch === "exact") return key.includes(term)
    if (fullTextSearch === true) return MenuOptions.fuzzy(key, term)
    return false
  }

  /** Fomantic's `fuzzySearch()`:  every character of `term` appears in `key`, in order. */
  private static fuzzy(key: string, term: string) {
    if (term.length > key.length) return false
    let position = 0
    for (let index = 0; index < term.length; index++) {
      position = key.indexOf(term[index], position) + 1
      if (!position) return false
    }
    return true
  }

  /** Strip combining marks after NFD, as Fomantic's `remove.diacritics()`:  `Café` => `Cafe`. */
  private static deburr(text: string) {
    return text.normalize("NFD").replace(COMBINING_MARKS, "")
  }
}

/** Lazily-filled search keys for one option. */
type SearchKeys = {
  /** Lower-cased text. */
  text: string
  /** Lower-cased value. */
  value: string
  /** Lower-cased, diacritic-free text;  computed on first `ignoreDiacritics` search. */
  plainText?: string
  /** Lower-cased, diacritic-free value. */
  plainValue?: string
}

/** One character typed more than once, e.g. `aaa`. */
const REPEATED_CHARACTER = /^(.)\1+$/su

/** Unicode combining diacritical marks. */
const COMBINING_MARKS = /[̀-ͯ]/g
