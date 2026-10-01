import { camelCase } from "$/ui/util"
import {
  Converters,
  ValueSets,
  Vocabulary,
  type ComponentVocabulary,
  type Dictionary,
  type LocalizedVocabulary
} from "$/ui/vocabulary"

import type { PropDefinitions, ResolvedAttribute } from "./elements.types"
import { ClassBuilder } from "./ClassBuilder"

/**
 * Everything ONE registered tag needs from its `ComponentVocabulary` (+ an optional translation `Dictionary`),
 * so a component never spells an attribute, event, slot or part name.
 * - `props`:  the `@spell-app/solid-element` prop definitions, one per vocabulary attribute, keyed by camelCase
 *   CANONICAL name (what the component reads, `attrs.allowAdditions`), with the (localized) attribute and
 *   property names and a `Converters`-based converter.  The fork does the rest:  prototype accessors, the upgrade
 *   step, removals, synchronous reflection.
 * - Values:  localized values (`rojo`) are canonicalized on the way IN, from attributes and property writes
 *   alike (`fromProperty`), so `ClassBuilder` and the component only ever see canonical English (`red`);
 *   reflection writes them localized again.
 * - One instance per tag;  the canonical tag and each translated alias get their own.
 */
export class ElementDefinition {
  /** Canonical vocabulary. */
  readonly vocabulary: ComponentVocabulary

  /** Names under this tag's prefix + dictionary. */
  readonly localized: LocalizedVocabulary

  /** Tag this definition registers, e.g. `ui-button` or `ie-boton`. */
  readonly tag: string

  /** Class-grammar builder for the canonical vocabulary. */
  readonly builder: ClassBuilder

  /** Every attribute, in vocabulary order. */
  readonly attributes: readonly ResolvedAttribute[]

  /** Fork prop definitions, by canonical key. */
  readonly props: PropDefinitions = {}

  /** Resolved attribute by canonical name (`allow-additions`). */
  private readonly byName = new Map<string, ResolvedAttribute>()

  /** Private registry, so `canonicalValue()` can map multi-word values for THIS tag without the runtime. */
  private readonly names = new Vocabulary()

  constructor(vocabulary: ComponentVocabulary, { tag, dictionary }: ElementDefinitionProps = {}) {
    this.vocabulary = vocabulary
    const prefix = tag ? tag.slice(0, tag.indexOf("-")) : undefined
    this.names.register(vocabulary)
    const localized = this.names.define(prefix, dictionary).get(vocabulary.tag)!
    this.localized = localized
    // a tag the dictionary doesn't name (an English alias, `ui-later`) is fine:  names still resolve by prefix;
    // no tag and no dictionary is the vocabulary's OWN tag, whatever its prefix (`x-item-owner` in tests)
    this.tag = tag ?? (dictionary ? localized.tag : vocabulary.tag)
    this.builder = new ClassBuilder(vocabulary)
    this.attributes = vocabulary.attributes.map((spec) => {
      const attribute = localized.names.attributes.get(spec.name) ?? spec.name
      const key = camelCase(spec.name)
      const property = attribute === spec.name ? (spec.property ?? key) : camelCase(attribute)
      const resolved: ResolvedAttribute = {
        spec,
        attribute,
        key,
        property,
        reflect: spec.kind !== "json" && spec.reflect !== false
      }
      this.byName.set(spec.name, resolved)
      this.props[key] = this.prop(resolved)
      return resolved
    })
  }

  ////////////////
  // ## Names
  ////////////////

  /** Attribute resolved from canonical `name`;  throws on a name the vocabulary doesn't have. */
  attribute(name: string): ResolvedAttribute {
    const attribute = this.byName.get(name)
    if (!attribute) throw new Error(`<${this.tag}>: no attribute ${JSON.stringify(name)} in the vocabulary`)
    return attribute
  }

  /** Localized event name, e.g. `ui-change` => `ie-cambio`. */
  event(name: string): string {
    return this.localized.names.events.get(name) ?? name
  }

  /** Localized slot name;  `""` stays the default slot. */
  slot(name: string): string {
    return this.localized.names.slots.get(name) ?? name
  }

  /** `part` attribute value:  the canonical part, plus the localized one when it differs (see `PartSpec`). */
  part(name: string): string {
    const localized = this.localized.names.parts.get(name) ?? name
    return localized === name ? name : `${name} ${localized}`
  }

  ////////////////
  // ## Values
  ////////////////

  /**
   * Raw attribute text / property value => canonical, typed value, per `spec.kind`.
   * - absent => `spec.default` (converted), else the kind's empty value
   * - SIDE EFFECT (dev only):  enum converters warn about unknown values, with a suggestion
   */
  convert(attribute: ResolvedAttribute, raw: unknown): unknown {
    const { spec } = attribute
    const value = this.canonicalValue(attribute, raw ?? spec.default ?? undefined)
    const where = { attribute: attribute.attribute, tag: this.tag }
    switch (spec.kind) {
      case "keyOnly":
      case "boolean":
        return Converters.boolean(value as string | boolean | null | undefined, attribute.attribute)
      case "keyOrValueAndKey":
        return Converters.keyOrValue(value as string | boolean | null | undefined, ValueSets.of(spec), where)
      case "size":
      case "color":
      case "valueOnly":
      case "enum":
      case "valueAndKey":
      case "textAlign":
      case "verticalAlign": {
        const set = ValueSets.of(spec)
        if (value == null || value === "") return undefined
        return set ? Converters.enumValue(ElementDefinition.text(value), set, where) : ElementDefinition.text(value)
      }
      case "number":
        return Converters.number(value as string | number | null | undefined)
      case "json":
        return Converters.json(value)
      case "icon":
        return Converters.icon(value, spec.default)
      case "width":
      case "multiple":
        return value == null || value === "" ? undefined : (value as string | number)
      default:
        return value == null ? undefined : Array.isArray(value) ? value : ElementDefinition.text(value)
    }
  }

  /** Localized value => canonical (`rojo` => `red`, `movil tableta` => `mobile tablet`);  others unchanged. */
  private canonicalValue(attribute: ResolvedAttribute, value: unknown): unknown {
    if (typeof value !== "string" || !this.localized.values.has(attribute.spec.name)) return value
    return this.names.canonicalize(this.localized.tag, attribute.attribute, value)?.value ?? value
  }

  /**
   * Attribute text for a canonical `value`, or `null` to remove it.
   * - Booleans:  `""` or removed (NEVER `"true"` / `"false"`);  `keyOrValueAndKey`:  `""` for bare, else the
   *   value;  arrays:  comma-joined.
   * - Canonical values are written LOCALIZED (`red` => `rojo` on `<ie-boton>`).
   */
  private attributeText(attribute: ResolvedAttribute, value: unknown): string | null {
    const { spec } = attribute
    if (spec.kind === "keyOnly" || spec.kind === "boolean") {
      return Converters.booleanToAttribute(Converters.boolean(value as string | boolean | null | undefined))
    }
    // an `icon` turned off over its default reflects as `"false"`:  removing it would bring the default back
    if (spec.kind === "icon" && value == null && typeof spec.default === "string") return FALSE
    if (value == null || value === false) return null
    if (value === true) return ""
    if (Array.isArray(value)) return value.join(",")
    const text = ElementDefinition.text(value)
    return this.localized.names.values.get(spec.name)?.get(text) ?? text
  }

  ////////////////
  // ## Prop definitions
  ////////////////

  /**
   * The fork's definition for one attribute.
   * - `property` only when it differs from the key (a vocabulary rename, a translated name):  a key the fork
   *   finds on `HTMLElement` (`hidden`, `title`) then throws at definition instead of silently shadowing it.
   * - `json` kinds (`options`) keep observing their attribute (first paint MUST NOT need the property), but
   *   never reflect.
   */
  private prop(attribute: ResolvedAttribute): PropDefinitions[string] {
    return {
      value: this.convert(attribute, undefined),
      attribute: attribute.attribute,
      ...(attribute.property === attribute.key ? {} : { property: attribute.property }),
      reflect: attribute.reflect,
      converter: {
        fromAttribute: (text) => this.convert(attribute, text),
        fromProperty: (value) => this.convert(attribute, value),
        toAttribute: (value) => this.attributeText(attribute, value)
      }
    }
  }

  /** A primitive as attribute / class text;  anything else as JSON (never `[object Object]`). */
  private static text(value: unknown): string {
    if (typeof value === "string") return value
    if (typeof value === "number" || typeof value === "boolean") return String(value)
    return JSON.stringify(value)
  }
}

/** Constructor props for `ElementDefinition`. */
export type ElementDefinitionProps = {
  /** Tag to register;  default the vocabulary's.  Its prefix (`ie`) also prefixes events. */
  tag?: string
  /** Translation;  default English identity. */
  dictionary?: Dictionary
}

/** Attribute text of an `icon` turned off. */
const FALSE = "false"
