import { E } from "$/ui/core"

/****************
 * ### `MenuOptions`
 * The option model behind dropdown / select / search:  filtering, additions, selection exclusion, keyboard
 * navigation, type-ahead and match highlighting.  Pure data, NO DOM.
 * - Ported from SUI React's `getMenuOptions()` (filter => exclude selected => additions) with Fomantic's
 *   dropdown `match` settings (`match`, `fullTextSearch`, `ignoreDiacritics`, `ignoreSearchCase`, `minCharacters`).
 * - Immutable:  each step returns a NEW `MenuOptions`, so a render can keep the previous list, e.g.
 *   `menu.excludeSelected(values).filter(query).withAdditions(query, { allowAdditions: true })`.
 * - Fast on 1000s of options:  lower-cased (and, on demand, diacritic-stripped) search keys are computed
 *   lazily ONCE per option object and shared by every derived list through a `WeakMap`.
 * - Library-neutral:  no Solid, no element;  of the core (`E`), it uses only the folder's types (`E.MenuOption` ...).
 ****************/
export class MenuOptions {
  /** The options in this list, in order. */
  readonly options: readonly (E.MenuOption | E.MenuAddition)[]

  /**
   * The pending addition from `withAdditions()` -- also set when `hideAdditions` keeps it out of `options`,
   * so Enter can still add it.
   */
  readonly addition: E.MenuAddition | undefined

  /** Search keys per option, shared with derived lists. */
  private readonly keys: WeakMap<E.MenuOption, MenuSearchKeys>

  /** A list of `options`;  `addition` and `keys` are how a derived list carries its source's on. */
  constructor({ options = [], addition, keys = new WeakMap() }: MenuOptionsProps = {}) {
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
  filter(query: string, options: E.MenuFilterOptions = {}): MenuOptions {
    const { search = "both", fullTextSearch = "exact", ignoreDiacritics = false, ignoreCase = true } = options
    if (!query || query.length < (options.minCharacters ?? 0)) return this
    if (typeof search === "function") return this.derive(search(this.options, query))
    const folding = { ignoreCase, ignoreDiacritics }
    const term = this.normalize(query, folding)
    // `"both"` (or anything else) matches every field
    const fields: readonly E.MenuSearchField[] = search === "text" || search === "value" ? [search] : E.MenuSearchFields
    return this.derive(
      this.options.filter((option) =>
        fields.some((field) => MenuOptions.matches(this.key(option, field, folding), term, fullTextSearch))
      )
    )
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
  withAdditions(query: string, options: E.MenuAdditionOptions = {}): MenuOptions {
    const { allowAdditions = false, additionLabel = "Add ", additionPosition = "top", hideAdditions = false } = options
    const term = query.trim()
    if (!allowAdditions || !term) return this
    const ignoreCase = options.ignoreCase ?? true
    const wanted = ignoreCase ? term.toLowerCase() : term
    const exists = this.options.some((option) => {
      const keys = this.keysFor(option)
      return ignoreCase
        ? keys.text === wanted || keys.value === wanted
        : option.text === wanted || option.value === wanted
    })
    if (exists) return this
    const addition: E.MenuAddition = { value: term, text: term, addition: true, label: additionLabel }
    if (hideAdditions) return new MenuOptions({ options: this.options, addition, keys: this.keys })
    const list = additionPosition === "bottom" ? [...this.options, addition] : [addition, ...this.options]
    return new MenuOptions({ options: list, addition, keys: this.keys })
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
  nextEnabledIndex(from: number, delta: number, options: E.MenuNavigateOptions = {}): number {
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
    let term = this.normalize(prefix, TYPE_AHEAD)
    const repeated = REPEATED_CHARACTER.exec(term)
    if (repeated) term = repeated[1]
    // A multi-character buffer refines the CURRENT match, so start there;  one character moves on.
    const start = term.length > 1 ? Math.max(from, 0) : from + 1
    for (let offset = 0; offset < length; offset++) {
      const index = (start + offset + length) % length
      const option = this.options[index]
      if (!option.disabled && this.key(option, "text", TYPE_AHEAD).startsWith(term)) return index
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
  highlights(option: E.MenuOption, query: string, options: E.MenuFilterOptions = {}): E.HighlightRange[] {
    const { ignoreDiacritics = false, ignoreCase = true } = options
    if (!query) return []
    const folding = { ignoreCase, ignoreDiacritics }
    const term = this.normalize(query, folding)
    const { folded, origins } = this.fold(option.text, folding)
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
  private derive(options: readonly E.MenuOption[]) {
    return new MenuOptions({ options, keys: this.keys })
  }

  /** Cached keys for `option`, created on first use. */
  private keysFor(option: E.MenuOption): MenuSearchKeys {
    let keys = this.keys.get(option)
    if (!keys) {
      keys = { text: option.text.toLowerCase(), value: String(option.value).toLowerCase() }
      this.keys.set(option, keys)
    }
    return keys
  }

  /** `query` folded the same way as the keys it's compared with. */
  private normalize(query: string, { ignoreCase, ignoreDiacritics }: Folding) {
    const text = ignoreDiacritics ? MenuOptions.deburr(query) : query
    return ignoreCase ? text.toLowerCase() : text
  }

  /**
   * `text` folded char by char, with each folded index's origin in `text`, so highlight ranges map back.
   * - `origins` has one extra entry (`text.length`) so `origins[end]` works for a match at the very end.
   */
  private fold(text: string, { ignoreCase, ignoreDiacritics }: Folding) {
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
  private key(option: E.MenuOption, field: E.MenuSearchField, { ignoreCase, ignoreDiacritics }: Folding) {
    if (!ignoreCase) {
      const raw = field === "text" ? option.text : String(option.value)
      return ignoreDiacritics ? MenuOptions.deburr(raw) : raw
    }
    const keys = this.keysFor(option)
    if (!ignoreDiacritics) return keys[field]
    if (field === "text") return (keys.plainText ??= MenuOptions.deburr(keys.text))
    return (keys.plainValue ??= MenuOptions.deburr(keys.value))
  }

  ////////////////
  // ## Statics
  ////////////////

  /** `index` wrapped into `0 .. length - 1`.  Static:  pure arithmetic. */
  private static wrap(index: number, length: number) {
    return ((index % length) + length) % length
  }

  /**
   * Fomantic's match:  prefix, else substring (`"exact"`) or in-order characters (`true`).
   * - Static:  pure.  `fullTextSearch` keeps Fomantic's shape (`MenuFilterOptions.fullTextSearch`).
   */
  private static matches(key: string, term: string, fullTextSearch: E.MenuFilterOptions["fullTextSearch"]) {
    if (key.startsWith(term)) return true
    if (fullTextSearch === "exact") return key.includes(term)
    if (fullTextSearch === true) return MenuOptions.fuzzy(key, term)
    return false
  }

  /** Fomantic's `fuzzySearch()`:  every character of `term` appears in `key`, in order.  Static:  pure. */
  private static fuzzy(key: string, term: string) {
    if (term.length > key.length) return false
    let position = 0
    for (let index = 0; index < term.length; index++) {
      position = key.indexOf(term[index], position) + 1
      if (!position) return false
    }
    return true
  }

  /** Strip combining marks after NFD, as Fomantic's `remove.diacritics()`:  `Café` => `Cafe`.  Static:  pure. */
  private static deburr(text: string) {
    return text.normalize("NFD").replace(COMBINING_MARKS, "")
  }
}

/** Constructor props of `MenuOptions`. */
export type MenuOptionsProps = {
  /** the options, in order;  default none */
  options?: readonly (E.MenuOption | E.MenuAddition)[]
  /** the pending addition (`withAdditions()`) */
  addition?: E.MenuAddition
  /** search keys per option, shared with derived lists;  pass one to share it across lists made apart */
  keys?: WeakMap<E.MenuOption, MenuSearchKeys>
}

/** How a query and the keys it's compared with are folded (`MenuFilterOptions`' two switches, settled). */
type Folding = {
  /** lower-case both sides */
  ignoreCase: boolean
  /** strip diacritics from both sides */
  ignoreDiacritics: boolean
}

/** Lazily-filled search keys for one option (`MenuOptionsProps.keys`). */
export type MenuSearchKeys = {
  /** Lower-cased text. */
  text: string
  /** Lower-cased value. */
  value: string
  /** Lower-cased, diacritic-free text;  computed on first `ignoreDiacritics` search. */
  plainText?: string
  /** Lower-cased, diacritic-free value. */
  plainValue?: string
}

/** How type-ahead folds:  case- and diacritic-insensitive, whatever the filter says. */
const TYPE_AHEAD: Folding = { ignoreCase: true, ignoreDiacritics: true }

/** One character typed more than once, e.g. `aaa`. */
const REPEATED_CHARACTER = /^(.)\1+$/su

/** Unicode combining diacritical marks. */
const COMBINING_MARKS = /[\u0300-\u036f]/g
