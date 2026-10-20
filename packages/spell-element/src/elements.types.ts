/**
 * Shared types for `$/spell-element`, what makes a custom element on Solid:
 * - how a `ComponentVocabulary` becomes typed, converted property values (`AttributeValues`)
 * - what the pieces of `UIComponent` hand each other:  `ElementSetup`, `ResolvedAttribute`, the owner context's
 * - the settings a component set's runtime hands spell-element as it loads (`SpellSolidSettings`)
 * - Runtime-light:  types, plus a few constants (`AriaNames`, `ERROR_EVENT`, `ERRORED_STATE`, `NO_ANIMATION`).
 * - The BOTTOM of the package's import graph:  `import type` only (the package's types as `E`, erased),
 *   so it NEVER loads a class module, the DOM or Solid.
 */

import type { E } from "$/spell-element"

////////////////
// ## Class builder
////////////////

/**
 * A class builder's `build()` input (`ClassMaker`, Spell UI's `ClassBuilder`):
 * property values keyed by CANONICAL attribute name.
 * - Values are post-conversion:  `true` / `false` for keyOnly, strings / numbers / `true` otherwise.
 * - Unknown keys are ignored, so an element can pass its whole property bag.
 */
export type ClassInput = Readonly<Record<string, unknown>>

/** Options for a class builder's `build()` (`ClassMaker`). */
export type ClassBuildOptions = {
  /** Classes put just before the noun, e.g. a state (`active`) or a caller's own class:  `ui primary icon button`. */
  extra?: string
  /** The last class word;  default the vocabulary's `noun`.  `<ui-tab>`'s pane says `segment`:  `ui tab segment`. */
  noun?: string
}

////////////////
// ## Owner context
////////////////

/**
 * Which elements own generic content parts.
 * - `Set` of tags -- noun is the tag after its prefix (`ui-card` => `card`)
 * - `Map` of tag => noun -- for translated tags (`ie-tarjeta` => `card`)
 * - function of the tag (and the element) --
 *   return the noun, `true` (derive it from the tag) or a falsy value (not an owner);
 *   the element lets an owner decide per instance (`ConditionalOwner`)
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

/** Text keys of `V`, looked up through the runtime's texts (Spell UI's `UI.i18n`). */
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

/**
 * The plain-DOM stand-in a broken element shows (`elementSetup.Fallback`), as `UIComponent.renderFallback()` calls it.
 * - Spell UI's form controls have one each, on its `NativeFallback` (`ButtonFallback` ...).
 */
export type FallbackClass = {
  render(props: FallbackProps): FallbackHandle
}

/** What a fallback is drawn from:  the broken element, where to draw, and why it broke. */
export type FallbackProps = {
  /** the element that broke */
  domElement: HTMLElement
  /** where the fallback draws:  its shadow root */
  root: ShadowRoot | HTMLElement
  /** why the element's own drawing failed */
  error?: unknown
  /** the element's internals:  its `errored` state, its role, its form calls */
  internals?: ElementInternals
}

/** What a drawn fallback hands back:  `dispose()` removes its listeners, as the element is released. */
export type FallbackHandle = {
  dispose(): void
}

/**
 * How a class's custom element is set up:  `UIComponent.elementSetup`, merged down the class chain (`@protoMerged`).
 * - Read once, when the tag is defined,
 *   except `styleSheets`, `cssStates`, `isAFormControl`, `canRenderUnstyled` and `aria`,
 *   which each element reads as it's built.
 */
export type ElementSetup = {
  /**
   * The component's own style sheets, as `name => CSS text`, in order:  `{ button: buttonCSS }`.
   * - Default none.
   * - Every element of the class uses the same sheets:
   *   registered with the runtime (Spell UI's `UI.styles`) once per class,
   *   then adopted into each element's shadow root, after the shared foundation sheets.
   * - A subclass's REPLACE its base's whole (only the top level of `elementSetup` is inherited key by key);
   *   spread the base's to add to them:
   *   `styleSheets: { ...UISection.prototype.elementSetup.styleSheets, panel: panelCSS }`.
   * - Which of them apply right now:  `UIComponent.styleSheetNames`.
   * - NOTE: a name is PAGE-WIDE:  one sheet per name, and the first class to register it wins,
   *   so a second class with the same name and other CSS silently draws with the first one's.
   *   - A component pack's sheets carry its prefix (`{ "epic-item": itemCSS }`),
   *     never a bare noun one of ours may have (`item`).
   */
  styleSheets: Readonly<Record<string, string>>

  /**
   * The `:state()`s that only mirror an attribute of the same name:  `["active", "fluid"]`.
   * - `<ui-label active>` gets `:state(active)`, read through the component's member `active`
   *   (camelCase:  `"read-only"` reads `readOnly`), the attribute's getter unless the class has its own.
   * - Default none.
   * - A subclass that ADDS states spreads its base's, as for `styleSheets`:
   *   `cssStates: [...TextControl.prototype.elementSetup.cssStates, "inline"]`.
   * - A state with logic, or one whose member something else reads (`isDisabled`), is a getter with `@cssState`;
   *   for a state both name, the `@cssState` member wins.
   * - `define()` throws on a name the tag has no attribute or member for (a typo).
   * - NOT the `cssStates()` hook, which works out a set of states in code.
   * - `disabled`, `loading` and the other shared states need no entry:  `UIComponent` sets them for every element.
   */
  cssStates: readonly string[]

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
  DOMElement: E.AnyDOMElementClass

  /**
   * The plain-DOM stand-in this element shows when it breaks (`UI<Name>.fallback.ts`).
   * - Default none:  a broken element shows a bare `<slot>`, so its children stay visible.
   * - Only form controls have one, so a broken control still submits, validates and resets
   *   (Spell UI's `packages/ui/notes/fallback.md`).
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
   * Is this element a ROOT:  the top of a page or app, which the elements inside look up to?
   * - Default `false`.
   * - `true` for `UIRoot`, and so for every subclass of it, whatever its tag (`<spell-app>`).
   * - What looks for a root by it:  `UIComponent.appContext` (the nearest root's `appContext`).
   * - Read once, when the tag is defined.
   */
  root: boolean

  /**
   * ARIA the DOM element ALWAYS has, set once on its `internals` when the component is built:
   * `{ role: "listitem" }`, `{ role: "status", live: "polite" }`.
   * - Keys are short names (`AriaNames`), as `@aria` takes them.
   * - Default none.
   * - For a value that never changes;  one that follows state is an `@aria` getter, which wins once its effect runs
   *   (`<ui-card>`'s role follows its group).
   * - A server render (`$/ui/static`) gets it too:  a `listitem` becomes an `<li>`.
   */
  aria: Readonly<Partial<Record<AriaName, string>>>

  /**
   * What `disabled` means for this family (every element takes it:  `SharedVocabulary`).
   * - `"unusable"` (the default):  the base class does it all, as `<fieldset disabled>` does to its controls:
   *   - `isDisabled`, so the DOM element swallows clicks
   *   - everything inside is inert (its shadow content, and the children slotted into it):
   *     nothing there can be clicked, focused or typed in, and it's dimmed
   *   - `aria-disabled="true"`;  if focus was inside, it moves on to the next focusable element
   *   - e.g. `<ui-card disabled>`, `<ui-segment disabled>`:  their buttons can't be used either
   * - `"its own"`:  the base class only sets `:state(disabled)`;  the family's code and sheet say what it means:
   *   - unusable its own way:  a form control disables its native control (`FormComponent`), a button its `<button>`
   *   - only a look, so text stays findable:  `<ui-icon>`, `<ui-text>` dim, and clicks still go through
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
   * What the element shows when the page writes neither `visible` nor `hidden`.
   * - Every element takes both (`SharedVocabulary`):  one fact, two names (`DOMElement`, "Shown or hidden").
   * - `"shown"` (the default):  a message, a segment, a menu ...
   * - `"hidden"`:  a modal, flyout, popup, sidebar, dimmer, loader, transition:
   *   the element writes `hidden` on itself when it first connects.
   * - Read once, when the tag is defined.
   */
  visible: StartsVisible

  /**
   * How the element shows and hides when its own `animation` attribute names none:
   * an animation the page's runtime runs (Spell UI's are Fomantic's, `"fade"`, `"scale"`, `"fly down"` ...),
   * or `"none"`.
   * - Default the runtime's own (`SpellSolid.settings.motion.defaultAnimation`;  Spell UI's is `"fade"`).
   * - The element's own `animation` wins over it.
   * - `none` from around it, or reduced motion, wins over both (`UIComponent.animationToRun`).
   * - Run by the `onVisibleChange()` hook:  by default on the boxes at the top of the shadow root.
   */
  animation: ElementAnimation
}

/**
 * The animations an element can show and hide with:  `elementSetup.animation`, `UIComponent.animationToRun`.
 * - The names are the RUNTIME's:  a component set adds its own by augmenting this interface, so
 *   `elementSetup.animation` is checked against them.
 *   - Spell UI's are Fomantic's (`UIT.Animations`, `components.types.ts`):
 *     `declare module "$/spell-element/elements.types" { interface ElementAnimations extends Record<UIT.Animation, true> {} }`
 * - `none` is every set's:  no motion.
 */
export interface ElementAnimations {
  none: true
}

/** An animation's name, a key of `ElementAnimations`:  `"none"`, and the runtime's (`"fade"`, `"scale"` ...). */
export type ElementAnimation = Extract<keyof ElementAnimations, string>

/** No motion:  shown or hidden at once (`animation="none"`, `--ui-motion: none`, reduced motion). */
export const NO_ANIMATION = "none" satisfies ElementAnimation

/** `elementSetup.visible`:  what an element shows when the page writes neither `visible` nor `hidden`. */
export type StartsVisible = "shown" | "hidden"

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

/**
 * ARIA by short name => the `ElementInternals` property `@aria` and `elementSetup.aria` write.
 * - Each is the attribute in its comment, set on the element's hidden ARIA (never a visible attribute).
 * - Only the names in use:  a name not here fails TypeScript, so add it here (one line).
 * - Keys follow the attribute, camelCased after `aria-`:  `aria-valuemin` is `valueMin`.
 */
export const AriaNames = {
  role: "role", // role
  busy: "ariaBusy", // aria-busy
  checked: "ariaChecked", // aria-checked
  current: "ariaCurrent", // aria-current
  disabled: "ariaDisabled", // aria-disabled
  hidden: "ariaHidden", // aria-hidden
  label: "ariaLabel", // aria-label
  level: "ariaLevel", // aria-level
  live: "ariaLive", // aria-live
  roleDescription: "ariaRoleDescription", // aria-roledescription
  selected: "ariaSelected", // aria-selected
  valueMin: "ariaValueMin" // aria-valuemin
} as const satisfies Record<string, AriaProperty>

/** A short ARIA name, a key of `AriaNames`:  `"busy"`, `"label"`, `"role"` ... */
export type AriaName = keyof typeof AriaNames

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
  /** element property, e.g. `allowAdditions`, `permitirAdiciones`, or a vocabulary rename (`inputMode`) */
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
 * set by the error boundary (`UIComponent.onError()`) and by the fallback.
 */
export const ERRORED_STATE = "errored"

////////////////
// ## Settings
////////////////

/**
 * What a component set's runtime hands spell-element as it loads (`SpellSolid.install()`):
 * the services the element bases call, so spell-element never imports the set that draws with them.
 * - Spell UI's:  `packages/ui/src/elements/SpellUISettings.ts`, installed as `$/ui/core` loads.
 * - Every element of the page uses the same ones:  a page has one spell-element.
 */
export type SpellSolidSettings = {
  /** the page's runtime, which styles and texts wait for */
  runtime: RuntimeSettings
  /** the vocabulary layer:  names, conversions, classes, texts */
  words: WordSettings
  /** the elements' style sheets */
  styles: StyleSettings
  /** where focus goes */
  focus: FocusSettings
  /** showing and hiding */
  motion: MotionSettings
  /** warn the page's author:  something to fix (Spell UI's `Warnings.warn()`) */
  warn(source: string, message: string, ...data: unknown[]): void
}

/** `SpellSolidSettings.runtime`:  the page's runtime, which an element waits for before it shows. */
export type RuntimeSettings = {
  /** Has it loaded?  Read as each element is built:  one built after it has shows at once. */
  readonly isLoaded: boolean
  /** Load it, once;  resolves when it's ready. */
  load(): Promise<unknown>
}

/** `SpellSolidSettings.words`:  the vocabulary layer, which `ElementDefinition` and `UIComponent` read through. */
export type WordSettings = {
  /** A new, empty registry of names:  each `ElementDefinition`'s own, to resolve its tag's translated names. */
  names(): NameRegistry
  /** The class builder for `vocabulary`'s class words:  `UIComponent.rootClass`. */
  classes(vocabulary: E.ComponentVocabulary): ClassMaker
  /** `vocabulary`'s attributes, then the shared ones every element takes that it doesn't declare (`disabled` ...). */
  attributesFor(vocabulary: E.ComponentVocabulary): readonly E.AttributeSpec[]
  /** Does `vocabulary` take the shared attribute `name`, rather than declare its own? */
  takesShared(vocabulary: E.ComponentVocabulary, name: string): boolean
  /** How an attribute's text becomes a value, kind by kind. */
  converters: ValueConverters
  /** The values `spec` allows:  its own list, the name of a shared set, or none. */
  valuesFor(spec: E.AttributeSpec): E.ValueSetName | readonly string[] | undefined
  /** The text for `key` in the page's language, as tag `tag` says it, with `params` filled in. */
  text(key: string, params: Record<string, string | number> | undefined, tag: string): string
  /**
   * Hand a defined tag's vocabulary to the runtime.
   * - `"register"` the first time
   * - `"replace"` for a new version of it (hot reload, a server render)
   */
  registerVocabulary(vocabulary: E.ComponentVocabulary, how: "register" | "replace"): void
  /** Hand the runtime tag `tag`'s English texts, as defaults:  a translation's, or an app's own, win. */
  registerTexts(texts: Record<string, string>, tag: string): void
}

/** A registry of names, as `WordSettings.names()` makes one:  Spell UI's `Vocabulary`. */
export type NameRegistry = {
  /** Add `vocabulary`, by its canonical tag. */
  register(vocabulary: E.ComponentVocabulary): unknown
  /** Every registered vocabulary under `prefix` and `dictionary`, by canonical tag;  left out, the defaults. */
  define(prefix?: string, dictionary?: E.Dictionary): Map<string, E.LocalizedVocabulary>
  /** A translated tag's attribute and value, in canonical English. */
  canonicalize(tag: string, attribute: string, value?: string): E.NamePair | undefined
}

/** A vocabulary's class builder, as `WordSettings.classes()` makes one:  Spell UI's `ClassBuilder`. */
export type ClassMaker = {
  /** The class words for `values`, by canonical attribute name:  `"ui small primary button"`. */
  build(values: ClassInput, options?: ClassBuildOptions): string
}

/** How an attribute's text becomes a value, kind by kind (`ElementDefinition.convert()`):  Spell UI's `Converters`. */
export type ValueConverters = {
  /** text => boolean:  absent, `"false"`, `"no"` are false */
  boolean(value: string | boolean | null | undefined, attribute?: string): boolean
  /** boolean => attribute text:  `""`, or `null` to remove it */
  booleanToAttribute(value: boolean | null | undefined): "" | null
  /** a word that may also stand bare:  `true`, `false`, or one of `set` */
  keyOrValue(
    value: string | boolean | null | undefined,
    set: E.ValueSetName | readonly string[] | undefined,
    options?: E.EnumOptions
  ): string | boolean
  /** one of `set`, else `undefined` */
  enumValue(
    value: string | null | undefined,
    set: E.ValueSetName | readonly string[],
    options?: E.EnumOptions
  ): string | undefined
  /** text => number, else `undefined` */
  number(value: string | number | null | undefined): number | undefined
  /** JSON text => its value */
  json(value: unknown): unknown
  /** an icon's name, `""` for the element's own, `undefined` for none */
  icon(value: unknown, fallback?: unknown): string | undefined
}

/** `SpellSolidSettings.styles`:  the elements' style sheets, page-wide. */
export type StyleSettings = {
  /** Register the sheets the page doesn't have yet, by name. */
  registerOnce(sheets: Readonly<Record<string, string>>): void
  /** Register one sheet, or replace it (hot reload). */
  register(name: string, css: string): void
  /** Adopt the shared sheets, then the named ones, into `root`. */
  adoptInto(root: ShadowRoot, names: string[]): void
}

/** `SpellSolidSettings.focus`:  where focus goes. */
export type FocusSettings = {
  /** Move focus out of `container` (it's being disabled), on to the next thing that takes it. */
  moveOutOf(container: Element): void
}

/** `SpellSolidSettings.motion`:  how an element shows and hides (`UIComponent`, "Shown or hidden"). */
export type MotionSettings = {
  /** The animation a family runs when it names none (`elementSetup.animation`). */
  readonly defaultAnimation: ElementAnimation
  /** The CSS property that turns motion off around an element when it's `none`:  Spell UI's `--ui-motion`. */
  readonly property: string
  /** Has the person asked for less motion (`prefers-reduced-motion`)?  Read fresh each time. */
  readonly isReduced: boolean
  /** Does `animation` draw attention (a shake), rather than show or hide? */
  isAttention(animation: ElementAnimation): boolean
  /** Show `box` at once, undoing an animation that hid it. */
  reveal(box: HTMLElement): void
  /** Run `animation` on `box`, showing it (`visible`) or hiding it;  resolves when it ends. */
  animate(box: HTMLElement, animation: ElementAnimation, visible: boolean): Promise<unknown>
}
