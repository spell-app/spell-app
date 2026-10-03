/**
 * Loose constants and types of the `ui-emoji` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-emoji.types`.
 */

/**
 * One loader per data chunk (`./data/cldr/a.json` ...), from `import.meta.glob`.
 * - Why not ``import(`./data/${set}/${chunk}.json`)``:  a variable path makes Rolldown add its dynamic-import helper
 *   to this family's chunk (`yarn measure`'s `coreOutsideCore` check);  the glob compiles to one static `import()`
 *   per file, with no helper.
 */
export const LOADERS = import.meta.glob<{ default: Record<string, string> }>("./data/*/*.json")

/** The name sets that ship, from the data folders. */
export const SETS = new Set(Object.keys(LOADERS).map((path) => path.split("/")[2]!))

/** The name set used until told otherwise. */
export const DEFAULT_SET = "cldr"

/** One name set's loaded names (`EmojiData`). */
export type EmojiSetData = {
  /** name => emoji */
  readonly cache: Map<string, string>
  /** `loose()` name => emoji:  the fallback when the exact name misses */
  readonly looseCache: Map<string, string>
  /** chunks loaded */
  readonly loaded: Set<string>
}

/** Fomantic's `:name:` colons. */
export const COLONS = /^:+|:+$/g

/** Runs of whitespace inside a name. */
export const SPACES = /\s+/g

/** A camelCase word boundary:  a lower-case letter or digit, then a capital. */
export const CAMEL = /([a-z0-9])([A-Z])/g

/** Every way a name's words may be joined. */
export const SEPARATORS = /[_-]/g

/** A chunk letter. */
export const LETTER = /^[a-z]$/

/** Chunk of names starting with anything but a letter. */
export const DIGIT_CHUNK = "0"

/**
 * A start tag's `name="..."` attribute, any quoting:  `UIEmoji.preload()` reads the names a page uses from its markup.
 * - Groups 1-3:  the value in double, single or no quotes.
 */
export const NAME_ATTRIBUTE = /(?:^|\s)name\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/i
