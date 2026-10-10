import { createEffect } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import type { ElementApi, SpellCore } from "$/core"
import { spellElementVocabulary } from "./SpellElement.en"

/****************
 * ### `SpellElement`
 * The component behind a drawable thing's own element, e.g. `<solitaire-card>` for `a card is a drawable thing`.
 *
 * - A Spell UI component like any `ui-*` one:  its own shadow root, with the page's theme and base styles.
 *   Then its type's own `<css>`, its class's `static css`, after its super-types' (`cssOf()`).
 * - It draws its `thing`, through the program's runtime:  `spellCore.drawOwn()`, in the thing's error net.
 * - Its outside is its type's (epic `drawable-thing` P8), named as Spell UI names its own elements' API:
 *   - each property its type declares is an attribute and a property:  `<game-card rank="1">`, `card.rank = 12`,
 *     which the element writes to its thing
 *   - each method of its type is a method:  `card.turnOver()` calls its thing's `turn_over()`
 *   - written by hand, with no `thing` set, it makes its own:  a new thing of its type, once mounted
 *   - English names only, for now
 * - ONE tag per drawable type, defined the first time a program defines its elements (`defineFor()`).
 *   What the tag draws with is looked up when it draws (`SPELL_ELEMENTS`), so a program run again takes it over.
 * - Part of `spell-runtime.js`:  NEVER value-imports `$/core`.
 *   Each runtime copy hands itself over in `installSpellElements()`.
 ****************/
export class SpellElement extends E.UIComponent<typeof spellElementVocabulary> {
  @E.proto static vocabulary = spellElementVocabulary
  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = { delegatesFocus: false }

  /** Each property its type declares, as an attribute -- set per tag, see `defineFor()`. */
  @E.proto static typeProperties: TypeProperty[] = []
  declare typeProperties: TypeProperty[]

  /** The thing a tag written by hand made for itself, with no `thing` set -- see `onMount()`. */
  @E.state private accessor ownThing: object | undefined = undefined

  render(): JSX.Element {
    return <>{this.drawing}</>
  }

  /** What we draw:  our `thing`, else the one we made. */
  get currentThing(): object | undefined {
    return (this.thing as object | undefined) ?? this.ownThing
  }

  /** Our thing's drawing -- nothing until we have a thing, or before our tag's runtime is known. */
  get drawing(): JSX.Element {
    const thing = this.currentThing
    const entry = SPELL_ELEMENTS.get(this.domElement.localName)
    if (!thing || !entry) return null
    return entry.spellCore.drawOwn(thing) as JSX.Element
  }

  /**
   * - Written by hand (no `thing` set):  make a thing of our type, once.
   * - Each of our type's attributes, when it's set, is written to our thing's property:  `rank="1"` => `card.rank = 1`.
   */
  onMount() {
    createEffect(
      () => this.thing,
      (thing) => {
        const entry = SPELL_ELEMENTS.get(this.domElement.localName)
        if (!thing && !this.ownThing && entry) this.ownThing = new (entry.Class as new () => object)()
      }
    )
    for (const property of this.typeProperties) {
      createEffect(
        () => [this.currentThing, (this as unknown as Record<string, unknown>)[property.property]] as const,
        ([thing, value]) => {
          if (thing && value !== undefined && value !== null) {
            ;(thing as Record<string, unknown>)[property.name] = SpellElement.valueFor(property, value)
          }
        }
      )
    }
    return super.onMount()
  }

  /** `value`, as an attribute gave it, as property `property` takes it:  `"2"` => `2`, when 2 is a legal value. */
  static valueFor(property: TypeProperty, value: unknown): unknown {
    if (typeof value !== "string" || !property.values) return value
    const number = Number(value)
    return !property.values.includes(value) && property.values.includes(number) ? number : value
  }

  /**
   * Make `tag` the element of drawable class `Class`, from `spellCore`'s program, e.g. `solitaire-card` for `Card`.
   * - The first time:  a component class for the tag, its vocabulary ours under that tag, defined on the page.
   * - Again (a program run again after an edit, or another `<spell-app>` running the same project):
   *   the platform can't define a tag twice, so it stays, and what's behind it is swapped (epic `drawable-thing` P7):
   *   - it draws with the latest `spellCore` from then on (`SPELL_ELEMENTS`)
   *   - its type's CSS is replaced in every element of the tag on the page, at once (`restyle()`)
   *   - what it draws comes from its `thing`, so a program run again draws its new things with their new `draw()`
   */
  static defineFor(tag: string, Class: Function, spellCore: SpellCore): void {
    SPELL_ELEMENTS.set(tag, { Class, spellCore })
    // never "":  `UI.styles.register()` takes that as "unregister", and the tag's elements would lose the sheet
    const css = SpellElement.cssOf(Class) || `/* <${tag}>:  no styles of its own */`
    if (customElements.get(tag)) return SpellElement.restyle(tag, css)
    const api = spellCore.elementApiOf(Class)
    const properties = SpellElement.typePropertiesOf(api)
    // our names under its tag, then its type's:  typed as ours, whose tag is a literal
    const vocabulary = {
      ...spellElementVocabulary,
      tag,
      noun: Class.name,
      attributes: [...spellElementVocabulary.attributes, ...properties.map((property) => property.spec)]
    } as unknown as typeof spellElementVocabulary
    const Component = class extends SpellElement {
      @E.proto static vocabulary = vocabulary
      @E.proto static typeProperties = properties
      // the sheet is named for the tag, so `restyle()` can replace it
      @E.protoMerged static elementSetup: Partial<E.ElementSetup> = { styleSheets: { [tag]: css } }
    }
    SpellElement.addMethods(Component.define(), api.methods)
  }

  /**
   * The attributes of a type's properties, from its `api`, e.g. `short-rank` for `short_rank`.
   * - Text, a number or a choice:  an attribute and a property;  anything else, e.g. a card, a property only.
   * - A name the page or Spell UI already means something by (`id`, `hidden`, `disabled` ...) is left out.
   */
  static typePropertiesOf(api: ElementApi): TypeProperty[] {
    const properties: TypeProperty[] = []
    for (const { name, type, values } of api.properties) {
      const attribute = E.kebabCase(name.replace(/_/g, "-"))
      if (TAKEN_ATTRIBUTES.has(attribute)) continue
      const kind = ATTRIBUTE_KINDS[type ?? "text"] ?? "json"
      properties.push({
        name,
        property: E.camelCase(attribute),
        values,
        spec: { name: attribute, kind, description: `Its ${name.replace(/_/g, " ")}.` }
      })
    }
    return properties
  }

  /**
   * Give `TagClass`'s elements a method for each of `methods`, calling its thing's:  `turnOver()` => `turn_over()`.
   * - A name the element already has (`remove`, `click` ...) is left out.
   */
  static addMethods(TagClass: CustomElementConstructor, methods: string[]): void {
    const { prototype } = TagClass as unknown as { prototype: Record<string, unknown> }
    for (const method of methods) {
      const name = E.camelCase(method.replace(/_/g, "-"))
      if (name in prototype) continue
      Object.defineProperty(prototype, name, {
        configurable: true,
        value(this: { component?: SpellElement }, ...args: unknown[]) {
          const thing = this.component?.currentThing as Record<string, (...args: unknown[]) => unknown> | undefined
          return thing?.[method]?.(...args)
        }
      })
    }
  }

  /**
   * Replace `tag`'s own sheet with `css`, in every shadow root that adopted it:  no element is drawn again.
   * - Spell UI's own way to swap a sheet (`UI.styles.register()`), as its hot reload does.
   * - Waits for the runtime, if it hasn't loaded yet.
   */
  static restyle(tag: string, css: string): void {
    const register = () => void UI.styles.register(tag, css)
    if ((globalThis as E.RuntimeGlobal)[E.RUNTIME_KEY]) register()
    else void UI.load().then(register)
  }

  /**
   * The CSS of drawable class `Class`:  each class's own `static css` (its type's `<css>`), its super-types' first --
   * `""` if none has any.
   */
  static cssOf(Class: Function): string {
    const sheets: string[] = []
    for (let at: unknown = Class; typeof at === "function"; at = Object.getPrototypeOf(at)) {
      if (Object.hasOwn(at, "css")) sheets.unshift(String((at as unknown as { css: unknown }).css))
    }
    return sheets.join("\n")
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface SpellElement extends E.AttributeValues<typeof spellElementVocabulary> {}

/**
 * Let `spellCore` define its drawable classes' elements:  sets `spellCore.elementDefiner`.
 * - Called once per runtime copy, by `spellRuntime.ts`.
 */
export function installSpellElements(spellCore: SpellCore): void {
  spellCore.elementDefiner = (tag, Class) => SpellElement.defineFor(tag, Class, spellCore)
}

/** One of a type's properties, as its element shows it -- see `SpellElement.typePropertiesOf()`. */
type TypeProperty = {
  /** Its name, as compiled, e.g. `short_rank`. */
  name: string
  /** Its element's property, e.g. `shortRank`. */
  property: string
  /** Its legal values, if it has some. */
  values?: unknown[]
  /** Its attribute, as a vocabulary declares it. */
  spec: E.AttributeSpec
}

/** The kind of attribute for each type a property is declared as;  any other type, e.g. a card:  `json`. */
const ATTRIBUTE_KINDS: Record<string, E.AttributeKind> = {
  text: "string",
  character: "string",
  date: "string",
  number: "number",
  integer: "number",
  choice: "boolean"
}

/** Attributes the page or Spell UI already means something by:  never a type's. */
const TAKEN_ATTRIBUTES = new Set([
  "thing",
  "id",
  "class",
  "style",
  "slot",
  "part",
  "is",
  "lang",
  "dir",
  "title",
  "hidden",
  "inert",
  "disabled",
  "loading",
  "visible",
  "animation"
])

/** What a drawable type's tag draws with:  its class, and the runtime of the program that defined it last. */
type SpellElementEntry = {
  /** The drawable class, e.g. `Card`. */
  Class: Function
  /** The runtime its program runs on:  draws its things. */
  spellCore: SpellCore
}

/**
 * Each drawable type's tag, and what it draws with -- ONE map per page, on `globalThis`:
 * every runtime copy (each `<spell-app>` has its own) shares the page's custom elements.
 */
const SPELL_ELEMENTS: Map<string, SpellElementEntry> = ((globalThis as SpellElementsGlobal)[
  Symbol.for("@spell-app/spell-elements")
] ??= new Map())

/** `globalThis`, holding `SPELL_ELEMENTS`. */
type SpellElementsGlobal = typeof globalThis & { [key: symbol]: Map<string, SpellElementEntry> | undefined }
