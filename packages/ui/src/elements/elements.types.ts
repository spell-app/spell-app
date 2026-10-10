/**
 * Shared types for `$/ui/elements` -- the element core:
 * - the parts with no Solid:  class building, validation, menu options, owner context, shorthand, native fallbacks
 * - the Solid layer:  how a `ComponentVocabulary` becomes typed, converted property values,
 *   and what the pieces of `UIComponent` hand each other
 * - Runtime-light:  types, plus a few constants
 *   (`WHITESPACE`, `ERROR_EVENT`, `ERRORED_STATE`, `StickyWatchEdges` and `StickyWatch`'s thresholds,
 *   the source URL attributes).
 * - The BOTTOM of the folder's import graph:  `import type` only (the core's types as `E`, erased),
 *   so it NEVER loads a class module of its folder, the DOM or Solid.
 *   - `core.ts` re-exports it,
 *     and a static initializer that reads one of its constants imports it directly (`LoadableComponent`).
 */

import type { E } from "$/ui/core"

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
  /** Classes put just before the noun, e.g. a state (`active`) or a caller's own class:  `ui primary icon button`. */
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

/** Runs of whitespace:  how class lists split (`ClassBuilder`'s `multiple` words, `Shorthand.mergeClasses()`). */
export const WHITESPACE = /\s+/

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
export type RuleFunction = (this: RuleValidator, value: string, ruleValue: RuleValue, context: RuleContext) => boolean

/**
 * What a `RuleFunction` may use from its `Validator`.
 * - OURS, not Fomantic's:  its rules reach each other through `$.fn.form.settings.rules`, and its `range()` is a
 *   rule taking `(value, range, regExp, testLength)`.  Here the shared steps are `Validator` methods.
 */
export type RuleValidator = {
  /** the patterns, `Validator.regExp` */
  regExp: ValidatorRegExps
  /** the card brands, `Validator.cards` */
  cards: Readonly<Record<string, CreditCardSpec>>
  /** `value` (or its length) matches `test.pattern` and lies in `test.range`, `Validator.range()` */
  range(value: string, test: RangeTest): boolean
  /** a field value as the rules see it, `Validator.normalize()` */
  normalize(value: FieldValue, options?: Pick<ValidateOptions, "trim">): string
  /** number of choices, `Validator.count()` */
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

/**
 * When a form control shows `:state(invalid)` (`FormComponent.invalidShows`):
 * - `"at once"`:  whenever it's invalid, as `:invalid` does
 * - `"once touched"`:  only after someone has interacted with it (`isTouched`), as `:user-invalid` does
 */
export type InvalidTiming = "at once" | "once touched"

/** What `Validator.range()` tests:  the value itself, or its length (`minLength`, `size` ...). */
export const RangeMeasures = ["value", "length"] as const
/** One of `RangeMeasures`. */
export type RangeMeasure = (typeof RangeMeasures)[number]

/** What `Validator.range()` checks a value against. */
export type RangeTest = {
  /** the bracket:  `"min..max"`, `"n"` (exactly), `"min.."`, `"..max"`;  empty ~== no bounds */
  range: RuleValue
  /** what the tested text MUST match (`Validator.regExp.integer` ...);  bounds that don't are ignored */
  pattern: RegExp
  /** test the value (default) or its length */
  measure?: RangeMeasure
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
  search?: MenuSearchField | "both" | MenuSearchFunction
  /**
   * Fomantic's `fullTextSearch` setting, its shape kept (a boolean plus `"exact"`) so its docs apply:
   * - `"exact"` (default) -- substring anywhere
   * - `true` -- fuzzy:  query characters in order, gaps allowed
   * - `false` -- prefix only
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

/** The option fields a query is matched against (`MenuFilterOptions.search`;  `"both"` ~== all of them). */
export const MenuSearchFields = ["text", "value"] as const
/** One of `MenuSearchFields`. */
export type MenuSearchField = (typeof MenuSearchFields)[number]

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
  | ((tag: string, element: Element) => string | boolean | undefined)

/**
 * A PART that owns parts only in some contexts, implemented on its COMPONENT:
 * `<ui-item>` owns its content parts in the Items view (`:state(in-item)`),
 * but in a list or menu they see through it to the list / menu.
 * - `PartContext` registers such a class (it has `isOwnerOf()`) as a conditional owner of its vocabulary's `ownsParts`,
 *   and asks it during every climb;  while it says no, it's transparent like any part.
 * - MUST read the DOM now, not signals:
 *   it runs inside other parts' re-resolution, right after moves, before Solid's writes land.
 * - An element with no component yet (not upgraded) owns nothing;  its own settle re-resolves its parts.
 */
export type ConditionalOwner = {
  /** Does this element own part `noun` right now?  Read from the DOM. */
  isOwnerOf(noun: string): boolean
}

/** What `PartContext.define()` records for one defined tag. */
export type PartDefinition = {
  /** the element's vocabulary:  its `noun`, and the part nouns it `ownsParts` */
  vocabulary: E.ComponentVocabulary
  /** the tag it was defined as, canonical or translated */
  tag: string
  /** a generic content part:  transparent to other parts' climbs (`UIComponent`'s `elementSetup.isAPart`) */
  isAPart: boolean
  /** owns its parts only while its component says so (`ConditionalOwner`) */
  isConditionalOwner?: boolean
}

/** Options for `OwnerContext.find()`. */
export type OwnerFindOptions = {
  /**
   * Stop climbing at an element for which this returns true,
   * e.g. a component that isn't a part and doesn't own this one,
   * so a header inside a segment inside a card isn't styled as the card's.
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
   * Custom elements between the part and its owner:
   * `0` for `card > header`, `1` for `card > content > header`.
   * - Mirrors Fomantic's `.ui.card > .content > .header` vs `.ui.card > .header`.
   * - Native wrappers and slots don't count.
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

/**
 * Where `NativeFallback.render()` builds:  a component's shadow root, or (light-DOM DOM elements) the element itself.
 */
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
export type AttributeName<V extends E.ComponentVocabulary> = V["attributes"][number]["name"]

/** Canonical event names of `V`, e.g. `ui-change`. */
export type EventName<V extends E.ComponentVocabulary> = V["events"][number]["name"]

/** Canonical slot names of `V`;  `""` is the default slot. */
export type SlotName<V extends E.ComponentVocabulary> = V["slots"][number]["name"]

/** Canonical part names of `V`. */
export type PartName<V extends E.ComponentVocabulary> = V["parts"][number]["name"]

/** Custom state names of `V` (`:state(open)`). */
export type StateName<V extends E.ComponentVocabulary> = V["states"][number]["name"]

/** Text keys of `V`, looked up through `UI.i18n`. */
export type TextKey<V extends E.ComponentVocabulary> = V["texts"][number]["key"]

////////////////
// ## Converted values
////////////////

/**
 * Property type after conversion, per attribute spec.
 * - keyOnly / boolean => `boolean`  (`"no"` / `"false"` ~== false)
 * - keyOrValueAndKey => `true` (bare), `false`, or the validated value
 * - enumerated kinds => the validated value, `undefined` when absent or unknown;
 *   an INLINE value list narrows to its literal union, so `this.type === "submit"` is checked against the vocabulary
 * - json => `unknown`:  the component casts to its own shape
 */
export type SpecValue<S extends E.AttributeSpec> = S["kind"] extends "keyOnly" | "boolean"
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
export type InlineValues<S extends E.AttributeSpec> = S["values"] extends readonly string[]
  ? S["values"][number]
  : string

/**
 * Every attribute of `V` as a converted property, keyed by camelCase canonical name:  `allowAdditions`, `size`.
 * - A component's vocabulary members (`export interface UIButton extends E.AttributeValues<...> {}`):
 *   reading one is fresh and tracked;
 *   writing one writes the DOM element's PROPERTY (`Reactive.installAttributeGetters()`).
 */
export type AttributeValues<V extends E.ComponentVocabulary> = {
  [S in V["attributes"][number] as CamelCase<S["name"]>]: SpecValue<S>
}

////////////////
// ## Components
////////////////

/** A concrete `UIComponent` subclass, as `define()` sees it. */
export type UIComponentClass = {
  new (domElement: E.DOMElement, definition: E.ElementDefinition): E.UIComponent<any>
  prototype: E.UIComponent<any>
}

/** `UIComponent.registry`:  what the whole page has defined. */
export type ComponentRegistry = {
  /**
   * The `ElementDefinition` of every defined tag, English and translated, by tag.
   * - A component uses it to tell what kind of element a child is:
   *   `UIComponent.registry.definitions.get(child.localName)?.vocabulary.noun`.
   */
  readonly definitions: Map<string, E.ElementDefinition>
  /** The vocabularies already handed to the runtime (`UIComponent.register()`), so each is handed over once. */
  readonly vocabularies: WeakSet<E.ComponentVocabulary>
}

/** The options of `UIComponent.on()`:  `addEventListener()`'s, plus where to listen. */
export type OnOptions = Omit<AddEventListenerOptions, "signal"> & {
  /** what to listen on;  default the element itself.  E.g. its shadow root, for `slotchange` */
  target?: EventTarget
  /** remove the listener after it runs once (DOM API `addEventListener()`'s own `once`) */
  once?: boolean
}

/** A form control's plain-DOM fallback class (`ButtonFallback` ...), as `renderFallback()` calls it. */
export type FallbackClass = {
  render(props: E.NativeFallbackProps): E.NativeFallbackHandle
}

/**
 * How a class's custom element is set up:  `UIComponent.elementSetup`, merged down the class chain (`@protoMerged`).
 * - Read once, when the tag is defined,
 *   except `styleSheets`, `isAFormControl`, `canRenderUnstyled` and `aria`, which each element reads as it's built.
 */
export type ElementSetup = {
  /**
   * The component's own style sheets, as `name => CSS text`, in order:  `{ button: buttonCSS }`.
   * - Default none.
   * - Every element of the class uses the same sheets:
   *   registered with the runtime (`UI.styles`) once per class,
   *   then adopted into each element's shadow root, after the shared foundation sheets.
   * - A subclass's REPLACE its base's whole (keys merge one level deep only);
   *   spread the base's to add to them:
   *   `styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }`.
   * - Which of them apply right now:  `UIComponent.styleSheetNames`.
   * - NOTE: a name is PAGE-WIDE:  one sheet per name, and the first class to register it wins,
   *   so a second class with the same name and other CSS silently draws with the first one's.
   *   A component pack's sheets carry its prefix (`{ "epic-item": itemCSS }`),
   *   never a bare noun one of ours may have (`item`).
   */
  styleSheets: Readonly<Record<string, string>>

  /**
   * Does this element act as a control in an HTML `<form>`?
   * - If so, browser treats the element like an `<input>`:
   *    - its value is sent with the form,
   *    - it takes part in the form's validation and reset, and
   *    - a `<fieldset disabled>` around it disables it (`formIsDisabled`).
   *
   * - `false` by default
   * - `true` for `FormComponent` (inputs, checkboxes, dropdowns ...) and `UIButton`s for submit / reset.
   * - It's the platform's "form-associated custom element" (`static formAssociated`),
   *   which the browser reads once, when the tag is defined.
   */
  isAFormControl: boolean

  /**
   * Does clicking the element move focus to the first focusable thing in its shadow DOM?
   * - Default yes.
   * - An element with nothing focusable inside (`<ui-flag>`) says no.
   * - The platform's `delegatesFocus`, read once, when the tag is defined.
   */
  delegatesFocus: boolean

  /**
   * How the element's children land in the `<slot>`s of its shadow DOM (DOM API `slotAssignment`).
   * - `"named"` (the default):  each child goes to the slot its `slot` attribute names.
   * - `"manual"`:  the element itself hands chosen children to chosen slots (`slot.assign()`).
   *   - `<ui-accordion>` does, to wrap each title + content pair in its own `<details>`.
   *   - A slot it hasn't assigned stays empty.
   * - Read once, when the tag is defined.
   */
  slotAssignment: SlotAssignmentMode

  /**
   * Is this one of the generic parts other elements are built from?  (`<ui-header>`, `<ui-content>` ...)
   * - A part looks for the element it belongs to by walking up past other parts:
   *   a `<ui-header>` inside a `<ui-content>` inside a `<ui-card>` belongs to the card (`PartContext`).
   * - Default no.
   * - `true` for `PartComponent` (every tag of `ui-parts`),
   *   and for `<ui-item>`, `<ui-list>`, `<ui-menu>` and a feed's `<ui-event>`.
   * - Said, not worked out from `ownsParts`:  `<ui-label>` is owned by a statistic, but isn't a part.
   */
  isAPart: boolean

  /**
   * The class the DOM element itself is made from.
   * - Default `DOMElement`.
   * - `FormComponent` uses `DOMFormControl`, which adds what a form control needs:
   *   `value`, `form`, `checkValidity()` ...
   * - A family with a script API of its own names its `DOM<Name>Element` here (`DOMNagElement`).
   * - Read once, when the tag is defined.
   */
  DOMElement: E.DOMElementBaseClass

  /**
   * The plain-DOM stand-in this element shows when it breaks (`UI<Name>.fallback.ts`).
   * - Default none:  a broken element shows a bare `<slot>`, so its children stay visible.
   * - Only form controls have one, so a broken control still submits, validates and resets (`docs/fallback.md`).
   * - It can't use the component:  it runs after the component is gone.
   */
  Fallback: FallbackClass | undefined

  /**
   * Show the content at once, without waiting for the runtime and the style sheets.
   * - Default `false`:  wait until `isReady`, so nothing shows unstyled.
   * - For an element whose content must never wait:  `<ui-root>`, which holds the whole page.
   *   Its `render()` MUST look right unstyled (inline styles only) until `isReady`.
   */
  canRenderUnstyled: boolean

  /**
   * ARIA the DOM element ALWAYS has, set once on its `internals` when the component is built:
   * `{ role: "listitem" }`, `{ role: "status", ariaLive: "polite" }`.
   * - Default none.
   * - For a value that never changes;  one that follows state is an `@aria` getter, which wins once its effect runs
   *   (`<ui-card>`'s role follows its group).
   * - A server render (`$/ui/static`) gets it too:  a `listitem` becomes an `<li>`.
   */
  aria: Readonly<Partial<Record<AriaProperty, string>>>

  /**
   * What `disabled` means for this family (every element takes it:  `SharedVocabulary`).
   * - `"unusable"` (the default):  the base class does it all, as `<fieldset disabled>` does to its controls:
   *   - `isDisabled`, so the DOM element swallows clicks
   *   - everything inside is inert (its shadow content, and the children slotted into it):
   *     nothing there can be clicked, focused or typed in, and it's dimmed
   *   - `aria-disabled="true"`;  if focus was inside, it moves on to the next focusable element
   *   - e.g. `<ui-card disabled>`:  its buttons can't be used either
   * - `"its own"`:  the base class only sets `:state(disabled)`;  the family's code and sheet say what it means:
   *   - unusable its own way:  a form control disables its native control (`FormComponent`), a button its `<button>`
   *   - only a look:  `<ui-icon>`, `<ui-segment>` dim, and clicks still go through
   *   - something else:  `<ui-transition>` pauses, `<ui-dimmer>` never shows
   */
  disabled: DisabledMeaning

  /**
   * What `loading` does for this family (every element takes it:  `SharedVocabulary`).
   * - `"loader"` (the default):  the base class dims everything inside and makes it inert,
   *   draws a spinner over it, and sets `aria-busy="true"`.
   * - `"its own"`:  the base class only sets `:state(loading)`;
   *   the family draws its own loader (`<ui-button>`'s spinner, `<ui-segment>`'s veil),
   *   or `loading` means something else (`<ui-root>`'s message).
   */
  loading: LoadingMeaning

  /**
   * The `<ui-transition>` animation `visible="false"` hides the element with, and `visible` shows it again:
   * a name from `animations.css` (`"fade"`, `"scale"`, `"fade-down"` ...:  `AnimationNames`).
   * - Default `"fade"`.
   * - Not read where the family's vocabulary has a `visible` of its own (`<ui-sidebar>`, `<ui-transition>`,
   *   `<ui-reveal>`):  `SharedVocabulary`.
   */
  visibleAnimation: E.AnimationName
}

/** `elementSetup.disabled`:  what `disabled` means for a family. */
export type DisabledMeaning = "unusable" | "its own"

/** `elementSetup.loading`:  what `loading` does for a family. */
export type LoadingMeaning = "loader" | "its own"

/**
 * A text property of `ElementInternals`' ARIA (DOM API `ARIAMixin`):  `role`, `ariaBusy`, `ariaLabel` ...
 * - NOT the element-reference ones (`ariaLabelledByElements` ...):  `@aria` and `elementSetup.aria` write text.
 */
export type AriaProperty = {
  [K in keyof ARIAMixin]-?: ARIAMixin[K] extends string | null ? K : never
}[keyof ARIAMixin]

////////////////
// ## Element definition
////////////////

/** One attribute as the definition resolved it:  canonical spec, localized attribute name, property names. */
export type ResolvedAttribute = {
  /** the vocabulary's spec:  canonical name, kind, values, default */
  spec: E.AttributeSpec
  /** attribute name authors write, e.g. `primario` */
  attribute: string
  /** camelCase CANONICAL name:  the key in `AttributeValues` and `DOMElement.attributeValues` (`allowAdditions`) */
  key: string
  /** element property, e.g. `allowAdditions`, `permitirAdiciones`, or a vocabulary rename (`dividerHidden`) */
  property: string
  /**
   * write a property change back to the attribute;
   * never for `json` kinds (`options`), which still observe their attribute (first paint MUST NOT need the property)
   */
  reflect: boolean
}

////////////////
// ## Errors
////////////////

/**
 * Event an element dispatches when its render fails, before showing its native fallback.
 * - Cancelable, `bubbles`, `composed`, `detail: { error }`.
 * - `preventDefault()` keeps the fallback out (the page takes over).
 * - NOTE: no vocabulary names it yet (every element has it).
 */
export const ERROR_EVENT = "ui-error"

/**
 * Custom state of a failed element (`:state(errored)`),
 * set by the error net (`UIComponent.onError()`) and by the fallback.
 */
export const ERRORED_STATE = "errored"

////////////////
// ## Source elements
////////////////

/**
 * Where a `LoadableComponent` (or a `LoadableBody`) is with its content:  `status.set(SourceStatus.loading)`.
 * - Ours alone, never published:  `:state(loading)` / `:state(error)` are the vocabulary's (`UIT.SourceStates`).
 */
export const SourceStatus = {
  idle: "idle",
  loading: "loading",
  loaded: "loaded",
  error: "error"
} as const
/** One of `SourceStatus`'s values, e.g. `"loading"`. */
export type SourceStatus = (typeof SourceStatus)[keyof typeof SourceStatus]

/** A failure a `LoadableComponent` shows as its error message. */
export type SourceFailure = {
  /** why, see `SourceErrorKind` */
  kind: E.SourceErrorKind
  /** what was thrown */
  error: unknown
}

/**
 * A URL as written in markup (`source="docs/intro.md"`):
 * maybe relative, resolved against the page by whoever fetches it.
 */
export type URLString = string

/** What `DOMLoadableElement` asks of its component (`LoadableComponent`). */
export type LoadableComponentShape = {
  /** the text now shown, edits included;  set it to show other text, `dirty` until saved */
  content: string
  /** version of the last load / save */
  readonly lastETag: string | undefined
  /** changed since loaded / saved? */
  readonly isDirty: boolean
  /** save, see `LoadableComponent.save()` */
  save(text?: string): Promise<boolean>
  /** fetch again past the cache, dropping edits */
  reload(): Promise<string>
}

/** The loader a `LoadableComponent` builds with the DOM (Solid's JSX has no types for our tags). */
export const SOURCE_LOADER_TAG = "ui-loader"
/** The error message a `LoadableComponent` builds with the DOM, as `SOURCE_LOADER_TAG`. */
export const SOURCE_MESSAGE_TAG = "ui-message"

/**
 * Attributes holding a URL, rewritten against `source` (`SourceMarkup.rewriteUrls()`),
 * so fetched links, images and nested sources point where they did there.
 */
export const URL_ATTRIBUTES = ["href", "src", "action", "poster", "source"] as const

/** Elements carrying one of `URL_ATTRIBUTES`. */
export const URL_SELECTOR = URL_ATTRIBUTES.map((name) => `[${name}]`).join(",")

/**
 * Prefix of the attribute keeping a rewritten URL's ORIGINAL value (`data-ui-include-href`),
 * so the markup can be given back as it was written (`<ui-include>`'s `content`, a docs example's source).
 * - Named for `<ui-include>`, which came first;  `<ui-section source>` / `<ui-accordion source>` write it too.
 */
export const ORIGINAL_PREFIX = "data-ui-include-"

/** Sources nested deeper than this refuse to load:  a cycle through different URLs, or a runaway. */
export const MAX_DEPTH = 8

/**
 * Text key (`UIT.SourceFailureTexts`) of the message per failure kind;  save kinds never show one.
 * - `LoadableComponent` and the owners of a `LoadableBody` show it.
 */
export const SOURCE_FAILURE_KEYS: Partial<Record<E.SourceErrorKind, string>> & { load: string } = {
  load: "sourceLoadError",
  "cross-origin": "sourceCrossOrigin",
  "file-protocol": "sourceFileProtocol",
  render: "sourceRenderError"
}

/**
 * Milliseconds an opening section / panel waits for its source body,
 * before it opens on the placeholder instead (`LoadableBody.isVeiled`).
 * - Why wait at all:  the body arrives in one piece, so the fold animates once, to the real height.
 *   A same-origin fetch usually takes a few milliseconds.
 */
export const SOURCE_BODY_HOLD_MS = 300

/** What `LoadableBody` asks of the element whose body it loads (`<ui-section source>`, `<ui-accordion source>`). */
export type LoadableBodyOwner = {
  /** the DOM element:  its `source` / `select` attributes, its events */
  domElement: HTMLElement
  /** `source`, as written;  `undefined` when absent or empty.  Read untracked (`LoadableBody.load()`). */
  source(): string | undefined
  /** `select`, as written;  `undefined` when absent or empty */
  select(): string | undefined
  /** where the body goes:  the DOM element (a section), or a panel's `<ui-content>` (an accordion) */
  target(): Element
  /** dispatch vocabulary event `name` (`ui-load`, `ui-error`);  false when a cancelable one was vetoed */
  send(name: string, detail: object): boolean
}

/** What `DOMLoadableBodyElement` asks of its component (`<ui-section>`, `<ui-accordion>`). */
export type LoadableBodyComponentShape = {
  /** fetch and insert the body now, once */
  loadBody(): Promise<void>
  /** fetch the body again past the cache, and replace it */
  reloadBody(): Promise<void>
}

/** The attribute naming an element's file:  what makes an ancestor an enclosing source (`SourceMarkup`). */
export const SOURCE_ATTRIBUTE = "source"

/**
 * Events the source layer dispatches through its owner:  `SourceEvent.load`.
 * - The owner's vocabulary MUST name them:
 *   `UIT.SourceEvents` (`LoadableComponent`), `UIT.SourceBodyEvents` (`LoadableBody`:  `load` and `error` only).
 */
export const SourceEvent = {
  load: "ui-load",
  change: "ui-change",
  save: "ui-save",
  saved: "ui-saved",
  error: ERROR_EVENT
} as const
/** One of `SourceEvent`'s names, e.g. `"ui-load"`. */
export type SourceEventName = (typeof SourceEvent)[keyof typeof SourceEvent]

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

/** Edges a watched sticky box can be stuck to (`StickyWatch`);  ~== `UIT.StickyEdge`. */
export const StickyWatchEdges = ["top", "bottom"] as const
/** One of `StickyWatchEdges`. */
export type StickyWatchEdge = (typeof StickyWatchEdges)[number]

/** What `StickyWatch.observe()` watches:  elements the caller renders. */
export type StickyWatchTargets = {
  /** element whose ancestors decide the scroll container (the custom element's DOM element) */
  domElement: Element
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
  /** edge stuck to now;  `undefined` when not stuck */
  edge: StickyWatchEdge | undefined
  /** pushed out by the end of its container */
  isBound: boolean
  /** edge stuck to before this report;  `edge !== previous` ~== the stuck state changed */
  previous: StickyWatchEdge | undefined
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
