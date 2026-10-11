import { createEffect } from "solid-js"
import { insert, type JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import type { ElementApi, SpellCore } from "$/core"
import { spellElementVocabulary } from "./SpellElement.en"

/****************
 * ### `SpellElement`
 * The component behind a drawable thing's own element, e.g. `<solitaire-card>` for `a card is a drawable thing`.
 *
 * - A Spell UI component like any `ui-*` one:  its own shadow root, with the page's theme and base styles.
 *   Then its type's own `<css>`, its class's `static css`, after its super-types' (`cssOf()`).
 * - It draws its `thing`, through the program's runtime:  `spellCore.drawOwn()`, in the thing's error boundary.
 * - Its outside is its type's (epic `drawable-thing` P8), named as Spell UI names its own elements' API:
 *   - each property its type declares is an attribute and a property:  `<game-card rank="1">`, `card.rank = 12`
 *   - the element and its thing agree, both ways (P13):
 *     the page's change is written to the thing, and the thing's change to the element's attribute,
 *     so the inspector shows it -- see `keepThingAndElementAgreeing()`
 *   - each method of its type is a method:  `card.turnOver()` calls its thing's `turn_over()`
 *   - written by hand, with no `thing` set, it makes its own:  a new thing of its type, once mounted
 *   - in a `<spell-app>`'s layout, it's the program's thing of its type with its `id` as its name instead:
 *     `<solitaire-tableau id="T1">` (P9, Q9) -- see `boundThing`
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

  /** What we draw:  our `thing`;  else, in a layout, the program's (`boundThing`);  else the one we made. */
  get currentThing(): object | undefined {
    return (this.thing as object | undefined) ?? this.boundThing ?? this.ownThing
  }

  /** Are we in a `<spell-app>`'s layout, its markup around the program?  See `SpellApp.hasLayout`. */
  get isInLayout(): boolean {
    return !!this.domElement.closest("spell-app")
  }

  /**
   * In a layout:  the program's thing of our type named by our `id`, e.g. the tableau named `T1`.
   * - With no `id`:  its one thing of our type.
   * - `undefined` if there's none (yet).
   * - Tracked:  found as soon as the program makes it.  See `spellCore.thingFor()`.
   */
  get boundThing(): object | undefined {
    if (!this.isInLayout) return undefined
    const entry = SPELL_ELEMENTS.get(this.domElement.localName)
    return entry?.spellCore.thingFor(entry.Class, this.domElement.id || undefined)
  }

  /**
   * Our thing's drawing -- nothing before our tag's runtime is known.
   * - In a layout, with no thing of ours in the program:  a stand-in saying so, not a blank (Q9).
   */
  get drawing(): JSX.Element {
    const thing = this.currentThing
    const entry = SPELL_ELEMENTS.get(this.domElement.localName)
    if (!entry) return null
    if (!thing) return this.isInLayout ? <span class="spell-draw-error">{this.missingText(entry)}</span> : null
    return entry.spellCore.drawOwn(thing) as JSX.Element
  }

  /** What our stand-in says, when the program has no thing for us:  e.g. `⚠ no Tableau named "T9"`. */
  private missingText(entry: SpellElementEntry): string {
    const { id } = this.domElement
    return id ? `⚠ no ${entry.Class.name} named "${id}"` : `⚠ no ${entry.Class.name}, or more than one:  give it an id`
  }

  /**
   * Once on the page:  find or make our thing, and keep it and the element agreeing.
   * - Written by hand (no `thing` set):  make a thing of our type, once.
   * - Each of our type's properties stays the same on our thing and our element:  `keepThingAndElementAgreeing()`.
   * - A drawable list the page wrote puts its own items in, as its children:  in a layout, nothing else draws it.
   */
  onMount() {
    createEffect(
      () => this.thing,
      (thing) => {
        const entry = SPELL_ELEMENTS.get(this.domElement.localName)
        // in a layout, the program's thing is ours:  never one of our own
        if (!thing && !this.ownThing && entry && !this.isInLayout) {
          this.ownThing = new (entry.Class as new () => object)()
        }
      }
    )
    // a drawable list the PAGE wrote (its thing found in a layout, or made here):
    // nobody draws it, so it puts its own items in, as its children -- after any the page gave it.
    // The program's own draw puts them in itself.
    insert(
      this.domElement,
      () => {
        const list = this.thing ? undefined : this.currentThing
        const entry = SPELL_ELEMENTS.get(this.domElement.localName)
        return list && entry && "items" in list ? (entry.spellCore.drawItems(list) as JSX.Element) : null
      },
      null
    )
    this.keepThingAndElementAgreeing()
    return super.onMount()
  }

  ////////////////
  // ## The element and its thing agree (P13)
  ////////////////

  /**
   * Keep each of our type's properties the same on our thing and on our element, both ways (epic `drawable-thing` P13):
   * - the page changes the element (`setAttribute("rank", "2")`, `card.rank = 2`):  the thing's property follows, at once
   * - the thing changes (`card.turnOver()`):  the element's attribute follows, so the browser's inspector shows it
   * - a new thing:  its own values win, written onto the element --
   *   except a thing made for a tag the PAGE wrote (by hand, or in a layout):
   *   each attribute the page gave the tag is written to the thing first
   * - No loops:  a value the other side already has is never written to it,
   *   and Spell UI's elements never hear their own attribute writes as a page change.
   */
  private keepThingAndElementAgreeing() {
    const byKey = new Map(this.typeProperties.map((property) => [E.camelCase(property.spec.name), property]))
    // the page's changes, as they happen:  attribute or property, it's one store (`DOMElement.setValue()`)
    this.domElement.addPropertyChangedCallback((key, value) => {
      const property = byKey.get(key)
      const thing = property && this.currentThing
      if (thing) this.writeThing(property, thing, value)
    })
    for (const property of this.typeProperties) {
      // the thing this property last agreed with:  a new one may take the page's attributes first
      let agreedWith: object | undefined
      createEffect(
        () => {
          const thing = this.currentThing as Record<string, unknown> | undefined
          return [thing, thing?.[property.name]] as const
        },
        ([thing]) => {
          if (!thing) return
          const isNew = thing !== agreedWith
          agreedWith = thing
          if (isNew && this.pageWrote(property)) this.writeThing(property, thing, this.elementValueOf(property))
          else this.writeElement(property, thing)
        }
      )
    }
  }

  /**
   * Did the page give our tag property `property` itself, so a thing made for the tag takes it?
   * - Never when the program handed us our `thing`:  then the element only shows the thing's values.
   */
  private pageWrote(property: TypeProperty): boolean {
    if (this.thing) return false
    if (property.spec.kind === "json") return this.elementValueOf(property) != null
    return this.domElement.hasAttribute(property.spec.name)
  }

  /** Write the element's `value` of `property` to `thing`, as `thing` takes it -- nothing when they agree already. */
  private writeThing(property: TypeProperty, thing: object, value: unknown) {
    const record = thing as Record<string, unknown>
    if (this.agree(property, value, record[property.name])) return
    record[property.name] = SpellElement.valueFor(property, value)
  }

  /**
   * Write `thing`'s value of `property` to the element's property, so its attribute shows it.
   * - Nothing when they agree already.
   * - A property holding a thing or a list has no attribute:  its element property reads the thing's (`readThroughThing()`).
   * - Through the element's own property, which Spell UI writes back to the attribute:
   *   `rank="2"`, `face-up` when yes and gone when no, no attribute for nothing.
   */
  private writeElement(property: TypeProperty, thing: object) {
    if (property.spec.kind === "json") return
    const value = (thing as Record<string, unknown>)[property.name]
    if (this.agree(property, this.elementValueOf(property), value)) return
    ;(this.domElement as unknown as Record<string, unknown>)[property.property] = value
  }

  /** The element's own value of `property`, as its attribute converted it, e.g. `"2"` for `rank="2"`. */
  private elementValueOf(property: TypeProperty): unknown {
    return this.domElement.attributeValues[E.camelCase(property.spec.name)]
  }

  /** Do the element's `elementValue` and the thing's `thingValue` of `property` say the same, e.g. `"2"` and `2`? */
  private agree(property: TypeProperty, elementValue: unknown, thingValue: unknown): boolean {
    if (property.spec.kind === "json") return Object.is(elementValue, thingValue)
    const attribute = this.elementDefinition.attribute(property.spec.name)
    return Object.is(this.elementDefinition.convert(attribute, thingValue), elementValue)
  }

  /** `value`, as an attribute gave it, as property `property` takes it:  `"2"` => `2`, when 2 is a legal value. */
  static valueFor(property: TypeProperty, value: unknown): unknown {
    if (typeof value !== "string" || !property.values) return value
    const number = Number(value)
    return !property.values.includes(value) && property.values.includes(number) ? number : value
  }

  /**
   * Make reading each of `properties` on `TagClass`'s elements give the thing's own value, never a stale one:
   * `card.rank` is the number `2`, read right after `card.turnOver()` or `card.setAttribute("rank", "2")`.
   * - With no thing yet, the element's own value, as Spell UI keeps it.
   * - Writing one is Spell UI's own setter:  it converts, stores and writes the attribute back,
   *   and the thing hears of it (`keepThingAndElementAgreeing()`).
   */
  static readThroughThing(TagClass: CustomElementConstructor, properties: TypeProperty[]): void {
    const { prototype } = TagClass as unknown as { prototype: object }
    for (const { name, property } of properties) {
      const own = Object.getOwnPropertyDescriptor(prototype, property)
      if (!own?.get) continue
      const elementValue = own.get
      Object.defineProperty(prototype, property, {
        ...own,
        get(this: { component?: SpellElement }) {
          const thing = this.component?.currentThing as Record<string, unknown> | undefined
          return thing ? thing[name] : elementValue.call(this)
        }
      })
    }
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
    const TagClass = Component.define()
    SpellElement.readThroughThing(TagClass, properties)
    SpellElement.addMethods(TagClass, api.methods)
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

  /** The drawable class `element`'s tag is for, e.g. `Card` for `<solitaire-card>` -- `undefined` for any other tag. */
  static classOf(element: Element): Function | undefined {
    return SPELL_ELEMENTS.get(element.localName)?.Class
  }

  /** The thing drawable tag `element` draws, if any -- see `currentThing`. */
  static thingOf(element: Element): object | undefined {
    return (element as Element & { component?: SpellElement }).component?.currentThing
  }

  /** `element`, or its nearest ancestor, that's a drawable type's tag -- `undefined` if none is. */
  static closestDrawable(element: Element): Element | undefined {
    for (let at: Element | null = element; at; at = at.parentElement) {
      if (SPELL_ELEMENTS.has(at.localName)) return at
    }
    return undefined
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
   * The CSS of drawable class `Class`:  each class's own `static css` (its type's `<css>`), its super-types' first.
   * - `""` if none has any.
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
