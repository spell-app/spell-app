import { E } from "$/spell-element"

/****************
 * ### `TestSettings`
 * Stand-in settings for spell-element's own tests (`SpellSolid.install()`):
 * just enough of a component set's runtime for test elements to be defined and drawn, with no Spell UI on the page.
 * - What each one does here:
 *   - `runtime`:  always loaded, so an element draws as it connects
 *   - `words`:
 *     - English names;  a dictionary renames only tags and attributes (no values, events, slots or parts)
 *     - the four shared attributes every element takes:  `disabled`, `loading`, `visible`, `animation`
 *     - a converter for each kind of attribute;  only a list of values written in the vocabulary is checked
 *     - no class words, and every text is its key
 *   - `styles`, `focus`:  nothing, so elements draw unstyled
 *   - `motion`:  `fade` by default, never reduced;  every animation ends at once
 *   - `warn()`:  `console.warn()`
 * - SIDE EFFECT:  installs them.
 *   The package's Vitest config runs this file before every test file (`setupFiles`).
 * - Spell UI's real settings are its `SpellUISettings`.
 *   Tests that need them (`<ui-root>`, Spell UI's translations, its form controls) are Spell UI's, in `tests/ui/`.
 ****************/
export class TestSettings {
  /** The settings, as spell-element reads them. */
  static readonly settings: E.SpellSolidSettings = {
    runtime: {
      isLoaded: true,
      load: () => Promise.resolve()
    },
    words: {
      names: () => new TestNames(),
      classes: () => ({ build: () => "" }),
      attributesFor: (vocabulary) => withShared(vocabulary).attributes,
      takesShared: (vocabulary, name) => withShared(vocabulary).shared.has(name),
      converters: {
        boolean: (value) => isTrue(value),
        booleanToAttribute: (value) => (value ? "" : null),
        keyOrValue(value, set) {
          if (value == null || typeof value === "boolean") return value ?? false
          const text = value.trim().toLowerCase()
          if (text === "" || text === "true" || text === "yes") return true
          if (!isTrue(text)) return false
          return Array.isArray(set) && !set.includes(text) ? true : text
        },
        enumValue(value, set) {
          const text = value?.trim().toLowerCase().replace(/\s+/g, " ")
          if (!text) return undefined
          return !Array.isArray(set) || set.includes(text) ? text : undefined
        },
        number(value) {
          if (value == null || (typeof value === "string" && value.trim() === "")) return undefined
          const number = Number(value)
          return Number.isNaN(number) ? undefined : number
        },
        json(value) {
          if (typeof value !== "string") return value
          const text = value.trim()
          if (!text) return undefined
          return JSON_START.includes(text[0]!) ? JSON.parse(text) : value
        },
        icon: (value) => (typeof value === "string" ? value.trim() : undefined)
      },
      valuesFor: (spec) => (Array.isArray(spec.values) ? spec.values : undefined),
      text: (key) => key,
      registerVocabulary: () => {},
      registerTexts: () => {}
    },
    styles: {
      registerOnce: () => {},
      register: () => {},
      adoptInto: () => {}
    },
    focus: {
      moveOutOf: () => {}
    },
    motion: {
      defaultAnimation: "fade",
      property: "--test-motion",
      isReduced: false,
      isAttention: () => false,
      reveal: () => {},
      animate: () => Promise.resolve()
    },
    warn: (source, message, ...data) => console.warn(`[spell-element tests] ${source}:  ${message}`, ...data)
  }
}

/**
 * The stand-in registry of names (`words.names()`):  each vocabulary under its English names.
 * - A dictionary renames its tag (`dictionary.tags`) and its attributes (`dictionary.attributes`), and nothing else.
 */
class TestNames implements E.NameRegistry {
  register(vocabulary: E.ComponentVocabulary) {
    this.vocabularies.push(vocabulary)
  }

  define(prefix?: string, dictionary?: E.Dictionary): Map<string, E.LocalizedVocabulary> {
    return new Map(this.vocabularies.map((vocabulary) => [vocabulary.tag, localize(vocabulary, prefix, dictionary)]))
  }

  /** No translated values, so nothing to turn back into English. */
  canonicalize(): E.NamePair | undefined {
    return undefined
  }

  /** What `register()` was handed. */
  private readonly vocabularies: E.ComponentVocabulary[] = []
}

/** `vocabulary`'s names under `prefix` (default its own tag's) and `dictionary`. */
function localize(
  vocabulary: E.ComponentVocabulary,
  prefix = vocabulary.tag.slice(0, vocabulary.tag.indexOf("-")),
  dictionary?: E.Dictionary
): E.LocalizedVocabulary {
  const stem = vocabulary.tag.slice(vocabulary.tag.indexOf("-") + 1)
  const { attributes } = withShared(vocabulary)
  const nameOf = (name: string) => dictionary?.attributes?.[name] ?? name
  return {
    lang: dictionary?.lang ?? "en",
    prefix,
    vocabulary,
    tag: `${prefix}-${dictionary?.tags?.[vocabulary.tag] ?? stem}`,
    attributes: new Map(attributes.map((spec) => [nameOf(spec.name), spec])),
    values: new Map(),
    events: new Map(vocabulary.events.map((spec) => [spec.name, spec])),
    slots: new Map(vocabulary.slots.map((spec) => [spec.name, spec])),
    parts: new Map(vocabulary.parts.map((spec) => [spec.name, spec])),
    names: {
      attributes: new Map(attributes.map(({ name }) => [name, nameOf(name)])),
      values: new Map(),
      events: new Map(vocabulary.events.map(({ name }) => [name, name])),
      slots: new Map(vocabulary.slots.map(({ name }) => [name, name])),
      parts: new Map(vocabulary.parts.map(({ name }) => [name, name]))
    }
  }
}

/** `vocabulary`'s attributes, then each shared one it doesn't declare;  and the names of the shared ones it takes. */
function withShared(vocabulary: E.ComponentVocabulary) {
  const declared = new Set(vocabulary.attributes.map(({ name }) => name))
  const added = SHARED_ATTRIBUTES.filter(({ name }) => !declared.has(name))
  return { attributes: [...vocabulary.attributes, ...added], shared: new Set(added.map(({ name }) => name)) }
}

/** Text => boolean, as Spell UI reads it:  absent, `"false"`, `"no"` and `"0"` are false;  any other text, true. */
function isTrue(value: string | boolean | null | undefined): boolean {
  if (value == null || typeof value === "boolean") return value ?? false
  return !FALSE_WORDS.has(value.trim().toLowerCase())
}

/** The attributes every element takes, as Spell UI's `SharedVocabulary` has them, in its order. */
const SHARED_ATTRIBUTES: readonly E.AttributeSpec[] = [
  { name: "disabled", kind: "boolean", description: "Can't be used." },
  { name: "loading", kind: "boolean", description: "Busy." },
  { name: "visible", kind: "boolean", description: "Shown:  the platform's `hidden`, turned round." },
  { name: "animation", kind: "string", description: "How it shows and hides;  `none` for no motion." }
]

/** Spellings of false;  everything else present is true. */
const FALSE_WORDS = new Set(["false", "no", "0"])

/** First characters of the JSON text `json` parses:  arrays, objects, quoted strings. */
const JSON_START = '[{"'

/** The test settings' own animation, `fade`, named as a set names its animations (`ElementAnimations`). */
declare module "$/spell-element/elements.types" {
  interface ElementAnimations {
    fade: true
  }
}

E.SpellSolid.install(TestSettings.settings)
