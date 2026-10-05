/**
 * Shared types for `$/ui/elements` -- the element core:  class building, validation, menu options, owner context,
 * shorthand, native fallbacks (library-neutral), and the Solid layer:  how a `ComponentVocabulary` becomes typed,
 * converted property values, and what the pieces of `UIElement` hand each other.
 * - Runtime-light:  types, plus a few constants (`ERROR_EVENT`, `ERRORED_STATE`, `StickyWatch`'s thresholds, the
 *   source URL attributes).
 */

import type { PropDefinition } from "@spell-app/solid-element"

import type { SourceErrorKind } from "$/ui/runtime"
import type { AttributeSpec, ComponentVocabulary } from "$/ui/vocabulary"

////////////////
// ## Class builder
////////////////

/**
 * `ClassBuilder.build()` input:  property values keyed by CANONICAL attribute name.
 * - Values are post-conversion:  `true` / `false` for keyOnly, strings / numbers / `true` otherwise.
 * - Unknown keys are ignored, so an element can pass its whole property bag.
 */
export type ClassInput = Readonly<Record<string, unknown>>

/** Options for `ClassBuilder.build()`. */
export type ClassBuildOptions = {
  /** Classes appended after the noun, e.g. a state (`active`) or a caller's own class. */
  extra?: string
}

/** Fomantic's connective words, see `ClassBuilder.grammar`. */
export type ClassGrammar = {
  /** Leading component marker. */
  ui: string
  /** Default size, which emits nothing. */
  medium: string
  /** Suffix for `textAlign` / `verticalAlign`. */
  aligned: string
  /** `textAlign` value emitted alone. */
  justified: string
  /** Default `widthClass`. */
  wide: string
  /** Width value meaning "share equally". */
  equal: string
  /** Class for `equal`. */
  equalWidth: string
}

/** `ClassBuilder.build()` output:  space-separated Fomantic classes, e.g. `"ui small red basic button"`. */
export type ClassString = string

////////////////
// ## Validation
////////////////

/**
 * A form control's value as the validator sees it.
 * - `string[]` for multiple selection (counted like Fomantic's comma-joined value)
 * - `boolean` for checkbox / toggle (`checked` rule)
 * - `null` / `undefined` ~== empty
 */
export type FieldValue = string | readonly string[] | number | boolean | null | undefined

/** Every built-in rule, as Fomantic names them. */
export type RuleType =
  | "notEmpty"
  | "checked"
  | "email"
  | "url"
  | "regExp"
  | "minValue"
  | "maxValue"
  | "integer"
  | "range"
  | "decimal"
  | "number"
  | "is"
  | "isExactly"
  | "not"
  | "notExactly"
  | "contains"
  | "containsExactly"
  | "doesntContain"
  | "doesntContainExactly"
  | "minLength"
  | "exactLength"
  | "maxLength"
  | "size"
  | "match"
  | "different"
  | "creditCard"
  | "minCount"
  | "exactCount"
  | "maxCount"

/** A rule's bracketed argument:  `"6"` in `minLength[6]`, or a real `RegExp` for `regExp`. */
export type RuleValue = string | RegExp | undefined

/**
 * A rule as authors write it:  `"minLength[6]"`, or Fomantic's object form with a custom prompt.
 * - `type` may carry the bracket (`{ type: "minLength[6]" }`) or pass `value` separately.
 */
export type ValidationRule =
  | string
  | {
      type: string
      value?: RuleValue
      /** Custom message;  same `{name}` / `{value}` / `{ruleValue}` placeholders as the defaults. */
      prompt?: string | ((value: string) => string)
    }

/** A rule after `Validator.parseRule()`. */
export type ParsedRule = {
  type: string
  value: RuleValue
  prompt?: string | ((value: string) => string)
}

/** What each rule function receives besides the value. */
export type RuleContext = {
  /** The raw, un-normalized value, e.g. `true` for a checked checkbox. */
  raw: FieldValue
  /** Other fields' values by name, for `match` / `different`. */
  fieldValues?: Readonly<Record<string, FieldValue>>
}

/**
 * A rule implementation.
 * - `value` is normalized:  a trimmed string, arrays comma-joined, as Fomantic's `validate.rule()` does.
 * - `this` is the `Validator`, so rules share `range()` / `regExp`, and a subclass can override them.
 */
export type RuleFunction = (this: RuleHost, value: string, ruleValue: RuleValue, context: RuleContext) => boolean

/** What a `RuleFunction` may use from its `Validator`. */
export type RuleHost = {
  regExp: ValidatorRegExps
  cards: Readonly<Record<string, CreditCardSpec>>
  range(value: string, range: RuleValue, regExp: RegExp, testLength?: boolean): boolean
  normalize(value: FieldValue, trim?: boolean): string
  count(value: string, raw: FieldValue): number
}

/** Fomantic's `settings.regExp` entries the rules use. */
export type ValidatorRegExps = {
  decimal: RegExp
  email: RegExp
  integer: RegExp
  number: RegExp
  url: RegExp
  /** Splits `/pattern/flags` for the `regExp` rule. */
  flags: RegExp
}

/** A card brand for the `creditCard` rule:  number prefix and allowed lengths. */
export type CreditCardSpec = {
  pattern: RegExp
  length: readonly number[]
}

/** Fomantic's `settings.text` entries prompts use. */
export type ValidatorText = {
  /** Joins a type prompt to its range suffix:  "must be an integer and must be ...". */
  and: string
  /** Prompt for a rule with no prompt of its own. */
  unspecifiedRule: string
  /** `{name}` when the field has no label or name. */
  unspecifiedField: string
}

/**
 * Constraint Validation flag per rule type, or `"auto"` when it depends on the value,
 * e.g. `exactLength` is `tooShort` or `tooLong`.
 */
export type ValidityFlagMap = Readonly<Record<string, ValidityFlag | "auto">>

/** Constraint Validation API flag a failed rule sets -- the keys of `ValidityStateFlags`. */
export type ValidityFlag = keyof ValidityStateFlags

/** Options for `Validator.validate()`. */
export type ValidateOptions = {
  /** Field identifier (`name` / `id`);  `{identifier}` in prompts. */
  name?: string
  /** Human label;  `{name}` in prompts.  Defaults to `name`, else "This field". */
  label?: string
  /** Other fields' values by name, for `match` / `different`. */
  fieldValues?: Readonly<Record<string, FieldValue>>
  /** Other fields' labels by name, so `match[password]` says "must match Password field". */
  fieldLabels?: Readonly<Record<string, string>>
  /** Skip every rule when the value is blank (Fomantic's `optional: true`). */
  optional?: boolean
  /** Trim string values before testing.  Default true (Fomantic's `shouldTrim`). */
  trim?: boolean
}

/** One failed rule. */
export type ValidationError = {
  /** Rule type, e.g. `minLength`. */
  type: string
  /** Rule argument, e.g. `"6"`. */
  ruleValue: RuleValue
  /** Interpolated prompt. */
  message: string
  /** Constraint Validation flag it maps to. */
  flag: ValidityFlag
}

/**
 * `Validator.validate()` result, shaped so `ElementInternals.setValidity(flags, message)` can take it directly.
 * - `flags` is `{}` and `message` `""` when valid, which `setValidity()` reads as "valid".
 */
export type ValidationResult = {
  valid: boolean
  errors: ValidationError[]
  /** Union of every error's flag. */
  flags: ValidityStateFlags
  /** First error's message. */
  message: string
}

////////////////
// ## Menu options
////////////////

/**
 * One dropdown / search / select option.
 * - `icon` / `image` / `flag` are shorthand (`Shorthand.resolve()`), e.g. `icon: "check"`.
 */
export type MenuOption = {
  value: string
  text: string
  description?: string
  icon?: unknown
  image?: unknown
  flag?: unknown
  disabled?: boolean
  selected?: boolean
}

/** The synthesized "Add ..." option `MenuOptions.withAdditions()` inserts. */
export type MenuAddition = MenuOption & {
  /** Marks the synthesized option. */
  addition: true
  /** Label shown before the query, e.g. `"Add "`. */
  label: string
}

/** Custom search:  return the options matching `query`. */
export type MenuSearchFunction = (options: readonly MenuOption[], query: string) => MenuOption[]

/** Options for `MenuOptions.filter()`, named as Fomantic's dropdown settings. */
export type MenuFilterOptions = {
  /**
   * What to match:  `"text"`, `"value"`, `"both"` (default, as Fomantic's `match`), or a custom function
   * (SUI React's `search` prop).
   */
  search?: "text" | "value" | "both" | MenuSearchFunction
  /**
   * `"exact"` (default) -- substring anywhere
   * `true` -- fuzzy:  query characters in order, gaps allowed
   * `false` -- prefix only
   */
  fullTextSearch?: "exact" | boolean
  /** Match `a` against `á`.  Default false. */
  ignoreDiacritics?: boolean
  /** Case-insensitive.  Default true (Fomantic's `ignoreSearchCase`). */
  ignoreCase?: boolean
  /** Below this many characters the query doesn't filter.  Default 0. */
  minCharacters?: number
}

/** Options for `MenuOptions.withAdditions()`. */
export type MenuAdditionOptions = {
  /** Offer the query as a new option when nothing matches it exactly. */
  allowAdditions?: boolean
  /** Label before the query.  Default `"Add "`;  pass `UI.i18n` text. */
  additionLabel?: string
  /** `"top"` (default, as Fomantic) or `"bottom"`. */
  additionPosition?: "top" | "bottom"
  /**
   * Don't show the addition in the list, but keep it on `.addition` so Enter can still add it.
   * - Default false here (SUI React shows it);  Fomantic defaults to true.
   */
  hideAdditions?: boolean
  /** Case-insensitive exact-match check.  Default true. */
  ignoreCase?: boolean
}

/** Options for `MenuOptions.nextEnabledIndex()`. */
export type MenuNavigateOptions = {
  /** Wrap past either end.  Default false (listbox pattern). */
  wrap?: boolean
}

/** Half-open `[start, end)` range of `option.text` that matched, for `<mark>`-style highlighting. */
export type HighlightRange = readonly [start: number, end: number]

////////////////
// ## Owner context
////////////////

/**
 * Which elements own generic content parts.
 * - `Set` of tags -- noun is the tag after its prefix (`ui-card` => `card`)
 * - `Map` of tag => noun -- for translated tags (`ie-tarjeta` => `card`)
 * - function of the tag (and the element) -- return the noun, `true` (derive it from the tag) or a falsy value (not
 *   an owner);  the element lets an owner decide per instance (`ConditionalOwner`)
 */
export type OwnerLookup =
  | ReadonlySet<string>
  | ReadonlyMap<string, string>
  | ((tag: string, element: Element) => string | boolean | undefined | null)

/**
 * A PART that owns parts only in some contexts, implemented on its CONTROLLER:  `<ui-item>` owns its content parts
 * in the Items view (`:state(in-item)`), but in a list or menu they see through it to the list / menu.
 * - `PartContext` registers such a class (it has `ownsPart()`) as a conditional owner of its vocabulary's
 *   `ownsParts`, and asks it during every climb;  while it says no, it's transparent like any part.
 * - MUST read the DOM now, not signals:  it runs inside other parts' re-resolution, right after moves, before
 *   Solid's writes land.
 * - An element with no controller yet (not upgraded) owns nothing;  its own settle re-resolves its parts.
 */
export type ConditionalOwner = {
  ownsPart(noun: string): boolean
}

/** Options for `OwnerContext.find()`. */
export type OwnerFindOptions = {
  /**
   * Stop climbing at an element for which this returns true, e.g. a component that isn't a part and
   * doesn't own this one, so a header inside a segment inside a card isn't styled as the card's.
   */
  barrier?: (element: Element) => boolean
}

/** `OwnerContext.find()` result. */
export type OwnerMatch = {
  /** The owning component element. */
  owner: Element
  /** Its class-grammar noun, e.g. `card`;  becomes `:state(in-card)`. */
  ownerNoun: string
  /**
   * Custom elements between the part and its owner:  `0` for `card > header`,
   * `1` for `card > content > header`.
   * - Mirrors Fomantic's `.ui.card > .content > .header` vs `.ui.card > .header`;  native wrappers and
   *   slots don't count.
   */
  depth: number
}

////////////////
// ## Shorthand
////////////////

/** Props a shorthand resolves to;  the renderer turns them into an element. */
export type ShorthandProps = Record<string, unknown> & {
  /** Space-separated classes;  de-duplicated when merged. */
  class?: string
  /** Inline style;  objects merge key by key. */
  style?: string | Readonly<Record<string, string>>
}

/**
 * Anything a shorthand property accepts.
 * - `undefined` / `null` / `false` / `true` => nothing
 * - string / number / array => `mapPrimitive(value)`
 * - plain object => props
 */
export type ShorthandValue = string | number | boolean | null | undefined | readonly unknown[] | ShorthandProps

/** Maps a primitive shorthand to props, e.g. `(name) => ({ name })` for an icon. */
export type ShorthandMapper = (value: string | number | readonly unknown[]) => ShorthandProps

/** Options for `Shorthand.resolve()`. */
export type ShorthandOptions = {
  /** Lowest priority props. */
  defaults?: ShorthandProps
  /** Highest priority props, or a function of the merged defaults + value props. */
  overrides?: ShorthandProps | ((props: ShorthandProps) => ShorthandProps)
}

////////////////
// ## Native fallback
////////////////

/** Where `NativeFallback.render()` builds:  a component's shadow root, or (light-DOM hosts) the element itself. */
export type NativeFallbackRoot = ShadowRoot | HTMLElement

/**
 * What `NativeFallback.render()` returns.
 * - `dispose()` removes listeners only;  the DOM stays, so a later re-render can replace it.
 */
export type NativeFallbackHandle = {
  /** Removes the fallback's listeners and observers. */
  dispose(): void
  /** Features of the real component this fallback does NOT keep, for the console error and docs. */
  readonly degraded: readonly string[]
}

/**
 * Attributes for `NativeFallback.create()`.
 * - `true` => bare attribute (`""`)
 * - `false` / `null` / `undefined` => omitted
 */
export type NativeFallbackAttributes = Readonly<Record<string, string | boolean | null | undefined>>

/** Canonical attribute names of vocabulary `V`, so a fallback can't misspell one. */
export type AttributeNameOf<V extends { attributes: readonly { name: string }[] }> = V["attributes"][number]["name"]

////////////////
// ## Names
////////////////

/** `allow-additions` => `allowAdditions`, at the type level (property names follow the vocabulary). */
export type CamelCase<S extends string> = S extends `${infer Head}-${infer Tail}`
  ? `${Head}${Capitalize<CamelCase<Tail>>}`
  : S

/** Canonical attribute names of `V`. */
export type AttributeName<V extends ComponentVocabulary> = V["attributes"][number]["name"]

/** Canonical event names of `V`, e.g. `ui-change`. */
export type EventName<V extends ComponentVocabulary> = V["events"][number]["name"]

/** Canonical slot names of `V`;  `""` is the default slot. */
export type SlotName<V extends ComponentVocabulary> = V["slots"][number]["name"]

/** Canonical part names of `V`. */
export type PartName<V extends ComponentVocabulary> = V["parts"][number]["name"]

/** Custom state names of `V` (`:state(open)`). */
export type StateName<V extends ComponentVocabulary> = V["states"][number]["name"]

/** Text keys of `V`, looked up through `UI.i18n`. */
export type TextKey<V extends ComponentVocabulary> = V["texts"][number]["key"]

////////////////
// ## Converted values
////////////////

/**
 * Property type after conversion, per attribute spec.
 * - keyOnly / boolean => `boolean`  (`"no"` / `"false"` ~== false)
 * - keyOrValueAndKey => `true` (bare), `false`, or the validated value
 * - enumerated kinds => the validated value, `undefined` when absent or unknown;  an INLINE value list
 *   narrows to its literal union, so `attrs.type === "submit"` is checked against the vocabulary
 * - json => `unknown`:  the component casts to its own shape
 */
export type SpecValue<S extends AttributeSpec> = S["kind"] extends "keyOnly" | "boolean"
  ? boolean
  : S["kind"] extends "keyOrValueAndKey"
    ? InlineValues<S> | boolean
    : S["kind"] extends "number"
      ? number | undefined
      : S["kind"] extends "width" | "multiple"
        ? string | number | undefined
        : S["kind"] extends "json"
          ? unknown
          : InlineValues<S> | undefined

/** Literal union of an inline `values` list, else `string`. */
export type InlineValues<S extends AttributeSpec> = S["values"] extends readonly string[] ? S["values"][number] : string

/**
 * Every attribute of `V` as a converted, read-only property, keyed by camelCase canonical name:
 * `attrs.allowAdditions`, `attrs.size`.
 * - These ARE the fork's props:  one signal each, converted on the way in (attribute AND property writes), so
 *   reading one inside JSX, a memo or an effect TRACKS it with no memo layer of our own.
 */
export type AttributeValues<V extends ComponentVocabulary> = {
  readonly [S in V["attributes"][number] as CamelCase<S["name"]>]: SpecValue<S>
}

////////////////
// ## Element definition
////////////////

/** One attribute as the definition resolved it:  canonical spec, localized attribute name, property names. */
export type ResolvedAttribute = {
  spec: AttributeSpec
  /** attribute name authors write, e.g. `primario` */
  attribute: string
  /** camelCase CANONICAL name:  the key in `AttributeValues` and in the fork's props (`props.allowAdditions`) */
  key: string
  /** element property, e.g. `allowAdditions`, `permitirAdiciones`, or a vocabulary rename (`dividerHidden`) */
  property: string
  /** reflect property changes to the attribute */
  reflect: boolean
}

/** The fork's prop definitions for one tag, by `ResolvedAttribute.key`. */
export type PropDefinitions = Record<string, PropDefinition>

////////////////
// ## Errors
////////////////

/**
 * Event an element dispatches when its render fails, before showing its native fallback.
 * - Cancelable, `bubbles`, `composed`, `detail: { error }`;  `preventDefault()` keeps the fallback out (the
 *   page takes over).
 * - NOTE: no vocabulary names it yet (every element has it).
 */
export const ERROR_EVENT = "ui-error"

/** Custom state of a failed element (`:state(errored)`), set by the fork's boundary and by the fallback. */
export const ERRORED_STATE = "errored"

////////////////
// ## Source elements
////////////////

/** Where a `SourceElement` is with its content. */
export type SourceStatus = "idle" | "loading" | "loaded" | "error"

/** A failure a `SourceElement` shows as its error message. */
export type SourceFailure = {
  /** why, see `SourceErrorKind` */
  kind: SourceErrorKind
  /** what was thrown */
  error: unknown
}

/** What `SourceHost` asks of its controller (`SourceElement`). */
export type SourceController = {
  /** the text now shown, edits included */
  getContent(): string
  /** show `text` instead, `dirty` until saved */
  setContent(text: string): void
  /** version of the last load / save */
  getEtag(): string | undefined
  /** changed since loaded / saved? */
  isDirty(): boolean
  /** save, see `SourceElement.save()` */
  save(text?: string): Promise<boolean>
  /** fetch again past the cache, dropping edits */
  reload(): Promise<string>
}

/** Element names a `SourceElement` builds with the DOM (Solid's JSX has no types for our tags). */
export const SOURCE_LOADER_TAG = "ui-loader"
export const SOURCE_MESSAGE_TAG = "ui-message"

/**
 * Attributes holding a URL, rewritten against `source` (`SourceMarkup.rewriteUrls()`), so fetched links, images
 * and nested sources point where they did there.
 */
export const URL_ATTRIBUTES = ["href", "src", "action", "poster", "source"] as const

/** Elements carrying one of `URL_ATTRIBUTES`. */
export const URL_SELECTOR = URL_ATTRIBUTES.map((name) => `[${name}]`).join(",")

/**
 * Prefix of the attribute keeping a rewritten URL's ORIGINAL value (`data-ui-include-href`), so the markup can be
 * given back as it was written (`<ui-include>`'s `content`, a docs example's source).
 * - Named for `<ui-include>`, which came first;  `<ui-section source>` / `<ui-accordion source>` write it too.
 */
export const ORIGINAL_PREFIX = "data-ui-include-"

/** Sources nested deeper than this refuse to load:  a cycle through different URLs, or a runaway. */
export const MAX_DEPTH = 8

/**
 * Text key (`UIT.SOURCE_FAILURE_TEXTS`) of the message per failure kind;  save kinds never show one.
 * - `SourceElement` and the owners of a `SourceBody` show it.
 */
export const SOURCE_FAILURE_KEYS: Partial<Record<SourceErrorKind, string>> & { load: string } = {
  load: "sourceLoadError",
  "cross-origin": "sourceCrossOrigin",
  "file-protocol": "sourceFileProtocol",
  render: "sourceRenderError"
}

/**
 * Milliseconds an opening section / panel waits for its source body before it opens on the placeholder instead
 * (`SourceBody.veiled()`).
 * - Why wait at all:  the body arrives in one piece, so the fold animates once, to the real height;  a same-origin
 *   fetch usually takes a few milliseconds.
 */
export const SOURCE_BODY_HOLD_MS = 300

/** What `SourceBody` asks of the element whose body it loads (`<ui-section source>`, `<ui-accordion source>`). */
export type SourceBodyOwner = {
  /** the host:  its `source` / `select` attributes, its events */
  host: HTMLElement
  /** `source`, as written;  `undefined` when absent or empty */
  source(): string | undefined
  /** `select`, as written;  `undefined` when absent or empty */
  select(): string | undefined
  /** where the body goes:  the host (a section), or a panel's `<ui-content>` (an accordion) */
  target(): Element
  /** dispatch vocabulary event `name` (`ui-load`, `ui-error`);  false when a cancelable one was vetoed */
  emit(name: string, detail: object): boolean
}

/** What `SourceBodyHost` asks of its controller (`<ui-section>`, `<ui-accordion>`). */
export type SourceBodyController = {
  /** fetch and insert the body now, once */
  loadBody(): Promise<void>
  /** fetch the body again past the cache, and replace it */
  reloadBody(): Promise<void>
}

////////////////
// ## Dropdown
////////////////

/** A header or divider row of a dropdown menu (from `<ui-item type="header|divider">`). */
export type MenuSeparator = {
  type: "header" | "divider"
  /** header text */
  text: string
}

/** One row of a dropdown menu, in order:  an option or a separator. */
export type MenuEntry = MenuOption | MenuSeparator

////////////////
// ## Sticky watch
////////////////

/** Edge a watched sticky box is stuck to (`StickyWatch`);  ~== `UIT.StickyEdge`. */
export type StickyWatchEdge = "top" | "bottom"

/** What `StickyWatch.observe()` watches:  elements the caller renders. */
export type StickyWatchTargets = {
  /** element whose ancestors decide the scroll container (the custom element's host) */
  host: Element
  /** 1px sentinel where the box's top would be, unstuck */
  top: Element
  /** 1px sentinel where the box's bottom would be;  only read with `pushing` */
  bottom?: Element
  /** the `position: sticky` box */
  box: Element
}

/** Offsets one observation measures against;  a change means a new `observe()`. */
export type StickyWatchOptions = {
  /** pixels between the scroll container's top edge and the stuck box (CSS `top`) */
  offset: number
  /** pixels between the bottom edge and a box stuck there (CSS `bottom`) */
  bottomOffset?: number
  /** also sticks to the bottom edge */
  pushing?: boolean
}

/** What a `StickyWatch` reports after every measurement. */
export type StickyWatchState = {
  /** edge stuck to now, or `null` */
  edge: StickyWatchEdge | null
  /** pushed out by the end of its container */
  bound: boolean
  /** edge stuck to before this report;  `edge !== previous` ~== the stuck state changed */
  previous: StickyWatchEdge | null
}

/** `overflow-y` values that make a scroll container. */
export const STICKY_SCROLLING: ReadonlySet<string> = new Set(["auto", "scroll", "overlay", "hidden"])

/**
 * A stuck box taller than this share of the visible area, or narrower than this share of its width, reserves no
 * scroll padding:  it's a sticky column (a sidebar), and reserving its height would make Page Down barely move.
 */
export const STICKY_MAX_RESERVE = 0.5

/** Sub-pixel slack when comparing edges. */
export const STICKY_SLACK = 0.5
