import { proto } from "$/ui/util"
import type {
  AttributeSpec,
  ComponentVocabulary,
  Dictionary,
  LocalizedNames,
  LocalizedVocabulary,
  NameMap,
  NamePair
} from "./vocabulary.types"
import { ValueSets } from "./ValueSets"

/****************
 * ### `Vocabulary`
 * Registry of every component's vocabulary, and the resolver that turns canonical names into localized ones.
 * - `register()` collects each `UI<Name>.en.ts` by canonical tag.
 * - `define(prefix, dictionary)` resolves, for every registered component, the names an author types in that
 *   language (`ie-tarjeta`, `color="rojo"`, `ie-cambio`) -- the contract a future translated
 *   `customElements.define()` builds on.  The English identity dictionary is the default.
 * - `canonicalize()` / `localize()` convert single names both ways, for attribute parsing and rendering.
 * - Pure data, NO DOM:  the runtime's `UI.vocabulary` service wraps one of these.  Imports only `$/ui/util` and
 *   its folder's peers, so node can load it too.
 * - See `docs/translation.md`.
 ****************/
export class Vocabulary {
  /**
   * Default tag / event prefix:  `ui-card`, `ui-change`.
   * - `@proto static`:  a subclass, or one instance, may set its own.
   */
  @proto static prefix = "ui"
  /** This instance's prefix (`Vocabulary.prefix` unless set). */
  declare prefix: string

  /**
   * Default dictionary:  English identity, since every missing name falls back to canonical.
   * - `@proto static`:  a subclass, or one instance, may set its own.
   */
  @proto static dictionary: Dictionary = { lang: "en" }
  /** This instance's dictionary (`Vocabulary.dictionary` unless set). */
  declare dictionary: Dictionary

  /** Canonical vocabularies by canonical tag, in registration order. */
  readonly vocabularies = new Map<string, ComponentVocabulary>()

  /** Every localized vocabulary `define()` produced, by LOCALIZED tag. */
  readonly localized = new Map<string, LocalizedVocabulary>()

  /** Dictionary each entry of `localized` was resolved with, so `replace()` can resolve it again. */
  private readonly dictionaries = new Map<string, Dictionary>()

  ////////////////
  // ## Registry
  ////////////////

  /**
   * Add `vocabulary`, keyed by its canonical tag;  returns it.
   * - Registering the same object twice is a no-op (HMR, double imports).
   * - Throws if a DIFFERENT vocabulary already claims the tag:  two components can't share a name.
   */
  register<V extends ComponentVocabulary>(vocabulary: V): V {
    const existing = this.vocabularies.get(vocabulary.tag)
    if (existing && existing !== vocabulary) {
      throw new TypeError(
        `Vocabulary.register():  <${vocabulary.tag}> is already registered by another vocabulary;  give one a new tag`
      )
    }
    this.vocabularies.set(vocabulary.tag, vocabulary)
    return vocabulary
  }

  /**
   * Swap in a NEW version of a registered component's vocabulary (hot module replacement:  its module re-ran and
   * made a new object);  returns it.
   * - Keyed by `vocabulary.tag`;  an unknown tag is simply registered.
   * - Every localized vocabulary resolved from the old version is resolved again from the new one, under the same
   *   prefix and dictionary, so `canonicalize()` / `localize()` see the new names at once.
   * - NOTE: a vocabulary whose tag changed is a NEW component:  the old tag stays registered.
   */
  replace<V extends ComponentVocabulary>(vocabulary: V): V {
    const previous = this.vocabularies.get(vocabulary.tag)
    this.vocabularies.set(vocabulary.tag, vocabulary)
    if (!previous || previous === vocabulary) return vocabulary
    for (const [tag, localized] of this.localized) {
      if (localized.vocabulary !== previous) continue
      const dictionary = this.dictionaries.get(tag) ?? this.dictionary
      this.localized.set(tag, this.resolve(vocabulary, localized.prefix, dictionary))
    }
    return vocabulary
  }

  /** Canonical vocabulary for canonical `tag`, if registered. */
  get(tag: string): ComponentVocabulary | undefined {
    return this.vocabularies.get(tag)
  }

  ////////////////
  // ## Localization
  ////////////////

  /**
   * Resolve every registered vocabulary under `prefix` + `dictionary`;  returns them by CANONICAL tag.
   * - SIDE EFFECT: remembers each result under its localized tag, for `canonicalize()` / `localize()`.
   * - Throws when two components resolve to the same localized tag -- a dictionary bug.
   * - NOTE: vocabularies registered later need another `define()` call.
   */
  define(prefix = this.prefix, dictionary = this.dictionary): Map<string, LocalizedVocabulary> {
    const result = new Map<string, LocalizedVocabulary>()
    for (const vocabulary of this.vocabularies.values()) {
      const localized = this.resolve(vocabulary, prefix, dictionary)
      const existing = this.localized.get(localized.tag)
      if (existing && existing.vocabulary !== vocabulary) {
        throw new TypeError(
          `Vocabulary.define():  <${localized.tag}> would name both <${existing.vocabulary.tag}> and <${vocabulary.tag}>;  ` +
            "give one of them another tag in the dictionary"
        )
      }
      this.localized.set(localized.tag, localized)
      this.dictionaries.set(localized.tag, dictionary)
      result.set(vocabulary.tag, localized)
    }
    return result
  }

  /**
   * Localized names of one `vocabulary` under `prefix` + `dictionary`.  Pure:  doesn't touch the registry.
   * - Lookup order per name:  `dictionary.components[tag]` > dictionary-wide map > canonical.
   * - Canonical attribute aliases (`checked` for `selected`) are kept untranslated, unless a localized
   *   name already uses the word.
   * - Throws on a collision within the component, e.g. two attributes translated to the same word.
   */
  resolve(vocabulary: ComponentVocabulary, prefix = this.prefix, dictionary = this.dictionary): LocalizedVocabulary {
    const component = dictionary.components?.[vocabulary.tag] ?? {}
    const names: LocalizedNames = {
      attributes: new Map(),
      values: new Map(),
      events: new Map(),
      slots: new Map(),
      parts: new Map()
    }
    const localized: LocalizedVocabulary = {
      lang: dictionary.lang,
      prefix,
      vocabulary,
      tag: `${prefix}-${dictionary.tags?.[vocabulary.tag] ?? Vocabulary.stem(vocabulary.tag)}`,
      attributes: new Map(),
      values: new Map(),
      events: new Map(),
      slots: new Map(),
      parts: new Map(),
      names
    }
    const where = `<${localized.tag}>`

    for (const spec of vocabulary.attributes) {
      const name = component.attributes?.[spec.name] ?? dictionary.attributes?.[spec.name] ?? spec.name
      Vocabulary.claim({ map: localized.attributes, name, value: spec, what: `${where} attribute` })
      names.attributes.set(spec.name, name)
      const values = Vocabulary.resolveValues(spec, vocabulary.tag, dictionary)
      if (values) {
        localized.values.set(spec.name, values.forward)
        names.values.set(spec.name, values.inverse)
      }
    }
    for (const spec of vocabulary.attributes) {
      for (const alias of spec.aliases ?? []) {
        if (!localized.attributes.has(alias)) localized.attributes.set(alias, spec)
      }
    }
    for (const spec of vocabulary.events) {
      const translated = component.events?.[spec.name] ?? dictionary.events?.[spec.name]
      const name = Vocabulary.eventName(spec.name, prefix, translated)
      Vocabulary.claim({ map: localized.events, name, value: spec, what: `${where} event` })
      names.events.set(spec.name, name)
    }
    for (const spec of vocabulary.slots) {
      const name = spec.name && (component.slots?.[spec.name] ?? dictionary.slots?.[spec.name] ?? spec.name)
      Vocabulary.claim({ map: localized.slots, name, value: spec, what: `${where} slot` })
      names.slots.set(spec.name, name)
    }
    for (const spec of vocabulary.parts) {
      const name = component.parts?.[spec.name] ?? dictionary.parts?.[spec.name] ?? spec.name
      Vocabulary.claim({ map: localized.parts, name, value: spec, what: `${where} part` })
      names.parts.set(spec.name, name)
    }
    return localized
  }

  ////////////////
  // ## Single names
  ////////////////

  /**
   * Localized `attribute` (and `value`) on localized `tag` => canonical names.
   * - `canonicalize("ie-tarjeta", "color", "rojo")` => `{ attribute: "color", value: "red" }`
   * - `multiple` values map token by token (`"movil tableta"` => `"mobile tablet"`).
   * - Unknown values pass through unchanged, so the enum converter can warn about them in context.
   * - `undefined` for an unknown tag or attribute.
   * - Canonical tags resolve even before `define()`, via the default prefix and dictionary.
   */
  canonicalize(tag: string, attribute: string, value?: string): NamePair | undefined {
    const localized = this.localizedFor(tag)
    const spec = localized?.attributes.get(attribute)
    if (!localized || !spec) return undefined
    return { attribute: spec.name, value: Vocabulary.mapValue(spec, localized.values.get(spec.name), value) }
  }

  /**
   * Canonical `attribute` (and `value`) => the names an author writes on localized `tag`.
   * - `localize("ie-tarjeta", "color", "red")` => `{ attribute: "color", value: "rojo" }`
   * - Exact inverse of `canonicalize()` for names the dictionary covers.
   * - `undefined` for an unknown tag or attribute.
   */
  localize(tag: string, attribute: string, value?: string): NamePair | undefined {
    const localized = this.localizedFor(tag)
    const name = localized?.names.attributes.get(attribute)
    const spec = localized?.attributes.get(name ?? "")
    if (!localized || !name || !spec) return undefined
    return { attribute: name, value: Vocabulary.mapValue(spec, localized.names.values.get(attribute), value) }
  }

  /**
   * Localized vocabulary for localized `tag`.
   * - Falls back to resolving a registered CANONICAL tag with the defaults, so English works without `define()`.
   */
  localizedFor(tag: string): LocalizedVocabulary | undefined {
    const known = this.localized.get(tag)
    if (known) return known
    const vocabulary = this.vocabularies.get(tag)
    if (!vocabulary) return undefined
    const localized = this.resolve(vocabulary)
    if (localized.tag === tag) this.localized.set(tag, localized)
    return localized
  }

  ////////////////
  // ## Internals
  ////////////////

  // Static, not instance methods:  pure functions of their arguments, shared by every registry.

  /**
   * Localized value maps for one attribute, or `undefined` if it has no value set.
   * - `keyOrValueAndKey` attributes also take the boolean words (`pointing="yes"`).
   */
  private static resolveValues(spec: AttributeSpec, tag: string, dictionary: Dictionary) {
    const set = ValueSets.setFor(spec)
    if (!set) return undefined
    const forward = new Map<string, string>()
    const inverse = new Map<string, string>()
    const shared: NameMap | undefined = typeof set === "string" ? dictionary.values?.[set] : undefined
    const own = dictionary.components?.[tag]?.values?.[spec.name]
    add(ValueSets.get(set), shared)
    if (spec.kind === "keyOrValueAndKey") add(ValueSets.get("booleans"), dictionary.values?.booleans)
    return { forward, inverse }

    /** Map each of `values` through `own` > `map` > itself, into both directions. */
    function add(values: readonly string[], map: NameMap | undefined) {
      for (const value of values) {
        if (inverse.has(value)) continue
        const name = own?.[value] ?? map?.[value] ?? value
        Vocabulary.claim({ map: forward, name, value, what: `<${tag} ${spec.name}> value` })
        inverse.set(value, name)
      }
    }
  }

  /**
   * Set `map[name] = value`, throwing if `name` is already taken by something else.
   * - Why throw:  a collision means one of two canonical names became unreachable in that language.
   * - `what` names the kind of name for the error, e.g. `<ie-tarjeta> attribute`.
   */
  private static claim<T>({ map, name, value, what }: { map: Map<string, T>; name: string; value: T; what: string }) {
    const existing = map.get(name)
    if (existing !== undefined && existing !== value) {
      throw new TypeError(
        `Vocabulary.resolve():  ${what} ${JSON.stringify(name)} is used twice;  translate one of them differently`
      )
    }
    map.set(name, value)
  }

  /**
   * Map `value` through `values`;  `multiple` attributes token by token, longest phrase first,
   * so `large screen` stays one token.
   */
  private static mapValue(spec: AttributeSpec, values: Map<string, string> | undefined, value: string | undefined) {
    if (value === undefined || !values) return value
    const text = value.trim()
    if (spec.kind !== "multiple") return values.get(text) ?? value
    const words = text.split(/\s+/)
    const tokens: string[] = []
    for (let index = 0; index < words.length;) {
      let length = Math.min(MAX_PHRASE_WORDS, words.length - index)
      for (; length > 1; length--) {
        if (values.has(words.slice(index, index + length).join(" "))) break
      }
      const phrase = words.slice(index, index + length).join(" ")
      tokens.push(values.get(phrase) ?? phrase)
      index += length
    }
    return tokens.join(" ")
  }

  /** Name without its prefix:  `ui-card` => `card`, `ui-change` => `change`. */
  private static stem(name: string) {
    const dash = name.indexOf("-")
    return dash < 0 ? name : name.slice(dash + 1)
  }

  /**
   * Event `name`'s name under `prefix`, `translated` when the dictionary names it.
   * - One of Spell UI's own (`ui-change`) takes the prefix:  `ie-change`, or `ie-cambio` translated.
   * - Another package's (`spell-open`, of the `<spell-app>` component pack) keeps its name, unless translated:  a
   *   tag outside Spell UI names its events as it likes, and the page listens for them by that name.
   */
  private static eventName(name: string, prefix: string, translated: string | undefined): string {
    if (translated !== undefined) return `${prefix}-${translated}`
    return name.startsWith(UI_EVENT_PREFIX) ? `${prefix}-${Vocabulary.stem(name)}` : name
  }
}

/** What Spell UI's own event names start with (`ui-change`):  they take a translated tag's prefix. */
const UI_EVENT_PREFIX = "ui-"

/** Longest multi-word value `mapValue()` looks for, e.g. `large screen` (2) with room to spare. */
const MAX_PHRASE_WORDS = 3
