import type { ValueSets } from "./ValueSets"

/**
 * Shared types for `$/ui/vocabulary` -- the schema every `ui-<name>.vocabulary.en.ts` follows, the shared value sets,
 * and the translation `Dictionary` contract.
 * - Why a schema:  vocabulary files own EVERY name a component uses (tag, attributes, values, events, slots,
 *   parts, states, texts), so templates and `ClassBuilder` never hold string literals, and a translation can
 *   rename all of them in one place.
 * - Canonical names are English and never change;  CSS, `ClassBuilder` output and `:state()`s always use them.
 *   A `Dictionary` only renames what AUTHORS type:  tags, attribute names, attribute values, events, slots, parts.
 * - The BOTTOM of the folder's import graph:  types only, and `ValueSets` only as a type (`import type`), so it
 *   erases completely.  Node reads it with every vocabulary (`yarn site:data`, `yarn gen:root`):  it MUST NOT reach
 *   the element layer.
 */

////////////////
// ## Attributes
////////////////

/**
 * How an attribute turns into Fomantic classes (see `ClassBuilder`, `docs/grammar.md`) or, for the last six,
 * into a plain property with no class.
 * - `keyOnly` -- `basic` => `basic`
 * - `valueAndKey` -- `floated="left"` => `left floated`;  bare `floated` => nothing
 * - `keyOrValueAndKey` -- `pointing` => `pointing`;  `pointing="left"` => `left pointing`
 * - `width` -- `width="4"` / `"1/4"` / `"25%"` => `four wide`
 * - `multiple` -- `only="mobile tablet"` => `mobile only tablet only`
 * - `textAlign` -- `text-align="left"` => `left aligned`;  `"justified"` => `justified`
 * - `verticalAlign` -- `vertical-align="middle"` => `middle aligned`
 * - `size` -- `size="small"` => `small`;  `medium` => nothing
 * - `color` -- `color="red"` => `red`
 * - `valueOnly` -- `position="left"` => `left`:  a value emitted alone, placed as `color` is, that isn't a colour
 *   (states, positions, speeds ...);  always with its own `values`
 * - `boolean` / `enum` / `string` / `number` / `json` / `icon` -- no class;  typed property only
 * - `icon` -- an icon name;  bare / `"true"` / `"yes"` => `spec.default`, else `""` ("the element's own icon",
 *   none if it has none);  `"false"` / `"no"` => none (`undefined`), even over a default
 * - NOTE: camelCase, not WWOD §9's English values, on purpose:  PUBLISHED data -- `site/_data/components.json`,
 *   `<ui-docs-api>`'s Kind column (`KIND_LABELS`), `tools/ElementManifests.ts`, `docs/grammar.md` and the site's
 *   `grammar.html` read them (epic `wwod-spell-ui`, P4 judgement).
 */
export type AttributeKind =
  | "keyOnly"
  | "valueAndKey"
  | "keyOrValueAndKey"
  | "width"
  | "multiple"
  | "textAlign"
  | "verticalAlign"
  | "size"
  | "color"
  | "valueOnly"
  | "boolean"
  | "enum"
  | "string"
  | "number"
  | "json"
  | "icon"

/** Kinds `ClassBuilder` turns into classes;  the rest are property-only. */
export type ClassAttributeKind = Exclude<AttributeKind, "boolean" | "enum" | "string" | "number" | "json" | "icon">

/**
 * One attribute of a component, as declared in its vocabulary.
 * - Primitive attributes reflect;  rich data (`kind: "json"`) is a property only, see `AGENTS.md`.
 */
export type AttributeSpec = {
  /** Canonical English attribute name, kebab-case, e.g. `text-align`, `allow-additions`. */
  name: string
  /** How the attribute becomes a class / property. */
  kind: AttributeKind
  /**
   * Allowed values:  a shared set by key (`"hues"`, `"sizes"` ...) or an inline list for component-specific enums.
   * - `color` / `size` default to `"hues"` / `"sizes"` when omitted.
   * - NOTE: translations map shared sets once (`Dictionary.values`), inline lists per component.
   */
  values?: ValueSetName | readonly string[]
  /**
   * CSS word for `keyOnly` / `valueAndKey` / `keyOrValueAndKey` / `multiple`, e.g. `pointing`, `only`.
   * - Defaults to `name` with `-` => space, so `very-basic` emits `very basic`.
   */
  key?: string
  /**
   * Word(s) after the number for `kind: "width"`, e.g. `"wide"` (default), `"column"`, `"wide computer"`.
   * - Mirrors SUI React's `useWidthProp(val, widthClass)`.
   */
  widthClass?: string
  /** `kind: "width"` only:  accept `"equal"` => `equal width`. */
  canEqual?: boolean
  /** Reflect property changes back to the attribute.  Default:  true for primitives, never for `json`. */
  reflect?: boolean
  /** JS property name, when it isn't `camelCase(name)`. */
  property?: string
  /** Value when the attribute is absent. */
  default?: string | number | boolean
  /**
   * Other canonical attribute names accepted for this one, e.g. `checked` for `selected` on checkbox / radio.
   * - NOTE: aliases are English muscle memory;  translations don't rename them.
   * - NOTE: DECLARATIVE only:  `Vocabulary` keeps them reachable by name (translation, docs), but
   *   `ElementDefinition` makes no observed attribute or property for an alias -- the family reads it itself
   *   (`<ui-item active>`, checkbox `checked`, `<ui-tab active>` through a `HostAttribute`).
   */
  aliases?: readonly string[]
  /** What it does, for docs and the custom-elements manifest. */
  description: string
}

////////////////
// ## Events, slots, parts, states, texts
////////////////

/** A `CustomEvent` the component dispatches (`bubbles: true, composed: true`). */
export type EventSpec = {
  /** Canonical lowercase kebab name, e.g. `ui-change`. */
  name: string
  /** Shape of `event.detail`, as a type description for docs, e.g. `"{ value: string, originalEvent?: Event }"`. */
  detail: string
  /** `preventDefault()` vetoes the transition, e.g. `ui-close`. */
  cancelable?: boolean
  /** When it fires and what it means, for docs and the custom-elements manifest. */
  description: string
}

/** A named slot;  `""` is the default slot, which has no name to translate. */
export type SlotSpec = {
  /** Canonical slot name, e.g. `header`;  `""` for the default slot. */
  name: string
  /** What goes in it, for docs and the custom-elements manifest. */
  description: string
}

/**
 * A `::part()` exposed for styling.
 * - NOTE: a translated part is ADDED next to the canonical one (`part="header encabezado"`), so a canonical
 *   app stylesheet keeps working under any translation.
 */
export type PartSpec = {
  /** Canonical part name, e.g. `header`. */
  name: string
  /** Which box it is, for docs and the custom-elements manifest. */
  description: string
}

/** A custom state, `:state(open)`.  NEVER translated:  states are a CSS contract. */
export type StateSpec = {
  /** State name, as CSS writes it in `:state()`, e.g. `open`. */
  name: string
  /** When the element has it, for docs and the custom-elements manifest. */
  description: string
}

/** Text people read, looked up through `UI.i18n`, e.g. `{ key: "noResults", text: "No results found." }`. */
export type TextSpec = {
  /** Lookup key, camelCase, unique within the component. */
  key: string
  /** English text;  may contain `{placeholders}`. */
  text: string
  /** Where it shows, for translators and docs. */
  description?: string
}

////////////////
// ## Component vocabulary
////////////////

/**
 * Everything a component names -- the contents of `ui-<name>.vocabulary.en.ts`.
 * - Write it as `export const cardVocabulary = { ... } as const satisfies ComponentVocabulary`,
 *   so templates get literal types.
 */
export type ComponentVocabulary = {
  /** Canonical tag, e.g. `ui-card`. */
  tag: string
  /** Class-grammar noun, emitted last by `ClassBuilder`, e.g. `card` (`ui red card`). */
  noun: string
  /** Group noun, e.g. `cards` for `<ui-cards>`. */
  plural?: string
  /**
   * Emit the leading `ui` class.  Default true.
   * - `false` for parts which Fomantic styles by context only, e.g. `column` (`four wide column`, no `ui`).
   */
  ui?: boolean
  /** Its attributes, in docs order. */
  attributes: readonly AttributeSpec[]
  /** The events it dispatches. */
  events: readonly EventSpec[]
  /** Its slots;  `""` is the default one. */
  slots: readonly SlotSpec[]
  /** The `::part()`s it exposes. */
  parts: readonly PartSpec[]
  /** The custom states it sets. */
  states: readonly StateSpec[]
  /** Text it shows people (`UI.i18n`). */
  texts: readonly TextSpec[]
  /**
   * Nouns of the generic content parts this component styles by context, e.g. card:
   * `header`, `meta`, `description`, `content`, `extra`.
   * - `OwnerContext` uses this to find a part's owner:  `<ui-header>` inside a card gets `:state(in-card)`.
   */
  ownsParts?: readonly string[]
  /** One-line summary for docs. */
  description?: string
  /**
   * What the tag is filed under, so people find it however they look:  `ValueSets.topics` ids, several per tag
   * (`ui-button`:  `buttons`, `basic`, `controls`, `forms`, `elements`).  Rolled up in
   * `src/components/ComponentDefinitions.ts`;  a translation maps them (`Dictionary.values.topics`).
   */
  topics?: readonly ComponentTopic[]
  /**
   * Other names people search for:  other libraries' and everyday words (`ui-modal`:  `dialog`, `lightbox`;
   * `ui-label`:  `badge`, `chip`, `tag`).  Searched like the tag's own name;  a translation replaces them
   * (`ComponentDictionary.aka`).
   */
  aka?: readonly string[]
  /**
   * What `<ui-root display="skeleton">` draws in this tag's place while its family loads:  a `<ui-placeholder>`
   * built from this description (`SkeletonSpec`), or `false` for none of its own.
   * - `false`:  a part covered by its owner's skeleton (`ui-column` in a grid, `ui-item` in a list), or a tag with
   *   nothing to show (`ui-popup`).  NOT `undefined`:  that's "not said yet", which `test/vocabularies.test.ts`
   *   rejects, since every tag MUST say which.
   * - NEVER translated:  drawing data, like `states`.
   */
  skeleton?: SkeletonSpec | false
}

/**
 * A tag's skeleton:  the `<ui-placeholder>` shapes that stand in for it until it loads (`ComponentVocabulary.skeleton`).
 * - Sizes are CSS lengths in `em`, so the element's `size` still scales them;  `fluid` on the element fills the width.
 * - No `parts`:  one block, `width` x `height` (a button, an input).
 */
export type SkeletonSpec = {
  /** `inline`:  sits beside the next inline skeleton (buttons, labels);  default `block`. */
  readonly display?: "block" | "inline"
  /** Width, e.g. `"18em"`;  default the placeholder's own (up to 30em). */
  readonly width?: string
  /** Height of a part-less block, e.g. `"2.5em"`;  default the placeholder image's (6.25em). */
  readonly height?: string
  /** Shapes, top to bottom. */
  readonly parts?: readonly SkeletonPart[]
}

/** One shape of a skeleton, as `ui-placeholder` draws it. */
export type SkeletonPart =
  /** An image block:  `square` (1:1), `rectangular` (4:3), else 6.25em tall. */
  | { readonly shape: "image"; readonly ratio?: "square" | "rectangular" }
  /** A header:  two short bars, with a square `image` beside them. */
  | { readonly shape: "header"; readonly image?: boolean }
  /** A paragraph of `lines` bars (default 3). */
  | { readonly shape: "paragraph"; readonly lines?: number }
  /** One bar, `length` as `<ui-placeholder-line>`'s (default full). */
  | {
      readonly shape: "line"
      readonly length?: "full" | "very long" | "long" | "medium" | "short" | "very short"
    }

/** A topic id (`ValueSets.topics`):  `"forms"`, `"notifications"`, `"date & time"` ... */
export type ComponentTopic = (typeof ValueSets.topics)[number]

////////////////
// ## Value sets
////////////////

/**
 * Names of the shared English value sets in `ValueSets`:  the sets its instances declare, so the class is the ONE list.
 * - `hues` -- Fomantic's `@variationAllColors`;  extensible
 * - `sizes` -- `mini` ... `massive`;  `medium` is the no-op default
 * - `positions` -- popup / tooltip positions (`top left` ... `right center`)
 * - `attachments` -- `attached` positions (`top`, `bottom left` ...)
 * - `alignments` -- text alignment (`left`, `center`, `right`, `justified`)
 * - `verticalAlignments` -- `top`, `middle`, `bottom`
 * - `floats` -- `left`, `right`
 * - `widths` -- columns `1`..`16`;  `ValueSets.has()` also accepts words, fractions and percentages
 * - `devices` -- responsive targets for `only` / `reversed` (`mobile`, `large screen` ...)
 * - `booleans` -- spellings the boolean converter understands, so a translation can map `sí` => `yes`
 * - `topics` -- what a component is filed under (a vocabulary's `topics`), so a translation maps them once
 */
export type ValueSetName = keyof ValueSets

////////////////
// ## Translation
////////////////

/** Canonical name => localized name. */
export type NameMap = Readonly<Record<string, string>>

/**
 * A translation of the vocabulary, e.g. Spanish, so `<ie-tarjeta color="rojo">` ~== `<ui-card color="red">`.
 * - Keys are ALWAYS canonical English names;  values are the localized names.
 * - Anything missing falls back to canonical, so the English identity dictionary is just `{ lang: "en" }`.
 * - Tags and events are keyed by their full canonical name (`ui-card`, `ui-change`) and map to a localized
 *   STEM (`tarjeta`, `cambio`) -- `Vocabulary.define(prefix, dictionary)` adds the prefix (`ie-tarjeta`).
 * - Attribute, slot and part names map name to name (`header` => `encabezado`).
 * - NOT here:  states (a CSS contract), CSS classes, text strings (owned by `UI.i18n`).
 * - See `docs/translation.md`.
 */
export type Dictionary = {
  /** BCP 47 language tag, e.g. `es`. */
  lang: string
  /** Canonical tag => localized stem, e.g. `{ "ui-card": "tarjeta" }`. */
  tags?: NameMap
  /** Canonical attribute name => localized, for every component, e.g. `{ size: "tamano" }`. */
  attributes?: NameMap
  /** Per shared value set, canonical value => localized, e.g. `{ hues: { red: "rojo" } }`. */
  values?: Readonly<Partial<Record<ValueSetName, NameMap>>>
  /** Canonical event name => localized stem, e.g. `{ "ui-change": "cambio" }`. */
  events?: NameMap
  /** Canonical slot name => localized. */
  slots?: NameMap
  /** Canonical part name => localized (added alongside the canonical part). */
  parts?: NameMap
  /** Per-component overrides and inline enum values, keyed by canonical tag. */
  components?: Readonly<Record<string, ComponentDictionary>>
}

/** Per-component part of a `Dictionary`:  wins over the dictionary-wide maps for that component only. */
export type ComponentDictionary = {
  /** Canonical attribute name => localized, for this component only. */
  attributes?: NameMap
  /** Canonical attribute name => (canonical value => localized), for inline enums or to override a shared set. */
  values?: Readonly<Record<string, NameMap>>
  /** Canonical event name => localized stem, for this component only. */
  events?: NameMap
  /** Canonical slot name => localized, for this component only. */
  slots?: NameMap
  /** Canonical part name => localized, for this component only. */
  parts?: NameMap
  /** The tag's other names in this language (replacing the English `aka`), e.g. `["diálogo", "ventana"]`. */
  aka?: readonly string[]
}

/**
 * One component's names after `Vocabulary.define(prefix, dictionary)` -- what a translated element class reads.
 * - Forward maps (localized => canonical spec) serve attribute parsing;  `names` holds the inverse
 *   (canonical => localized) for rendering and `Vocabulary.localize()`.
 */
export type LocalizedVocabulary = {
  /** Language of the dictionary it came from. */
  lang: string
  /** Prefix it was defined with, e.g. `ie`. */
  prefix: string
  /** The canonical vocabulary. */
  vocabulary: ComponentVocabulary
  /** Localized tag, e.g. `ie-tarjeta`. */
  tag: string
  /** Localized attribute name (and canonical aliases) => spec. */
  attributes: Map<string, AttributeSpec>
  /** Canonical attribute name => (localized value => canonical value).  Only attributes with values. */
  values: Map<string, Map<string, string>>
  /** Localized event name => spec. */
  events: Map<string, EventSpec>
  /** Localized slot name => spec. */
  slots: Map<string, SlotSpec>
  /** Localized part name => spec. */
  parts: Map<string, PartSpec>
  /** Inverse maps, canonical => localized. */
  names: LocalizedNames
}

/** Canonical => localized name maps for one component. */
export type LocalizedNames = {
  /** Canonical attribute name => localized. */
  attributes: Map<string, string>
  /** Canonical attribute name => (canonical value => localized value). */
  values: Map<string, Map<string, string>>
  /** Canonical event name => localized, prefix included (`ie-cambio`). */
  events: Map<string, string>
  /** Canonical slot name => localized. */
  slots: Map<string, string>
  /** Canonical part name => localized. */
  parts: Map<string, string>
}

/** Result of `Vocabulary.canonicalize()` / `localize()`. */
export type NamePair = {
  /** The attribute's name, in the language asked for. */
  attribute: string
  /** Its value in that language;  `undefined` when no value was passed. */
  value: string | undefined
}

////////////////
// ## Converters
////////////////

/** Options for `Converters.enumValue()`. */
export type EnumOptions = {
  /** Attribute name, for the dev-time warning. */
  attribute?: string
  /** Tag, for the dev-time warning. */
  tag?: string
}
