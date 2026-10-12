import { createEffect } from "solid-js"
import { insert, type JSX } from "@solidjs/web"

import { E, UI } from "$/ui/core"
import { drawableAttributeFor } from "$/util"
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
 *   - drawn by the program, its `thing` is handed over, and its `id` is that thing's name:
 *     `<solitaire-card id="queen-of-spades">` (J43) -- see `nameAfterHandedThing()`
 *   - written by hand with an `id`, on any page, it's the program's thing the id names,
 *     as the part of a reference after its `#`:  `<solitaire-tableau id="T1">` is `Tableau#T1` (P9, J43) --
 *     see `boundThing`
 *   - written by hand with no `id`:  in a `<spell-app>`'s layout, the program's one thing of its type;
 *     elsewhere it makes its own, a new thing of its type, once mounted
 *   - a property holding a thing shows as the thing's reference, and follows it:  `<solitaire-card pile="Tableau#T1">`
 *     (P18);  setting it sets the property, or moves the card, for the list holding it -- see `writeReference()`
 *   - English names only, for now
 * - ONE tag per drawable type, defined the first time a program defines its elements (`defineFor()`).
 *   What the tag draws with is looked up when it draws (`SPELL_ELEMENTS`), so a program run again takes it over.
 * - Compiled TypeScript writes each type's own class on it, saying only what's the type's (epic `drawable-thing` P10):
 *   `class CardElement extends SpellElement<Card>`, with its attributes, its methods and its sheet.
 *   The page builds the tag on that class (`spellCore.useElement()`), so both targets draw the same element.
 *   - It reaches compiled code as `@spell/elements`:  see `spellElements.ts`.
 * - Part of `spell-runtime.js`:  NEVER value-imports `$/core`.
 *   Each runtime copy hands itself over in `installSpellElements()`.
 * - SEE:  its App UI page, `packages/app/components/spell-element.html` (`/app-ui/spell-element.html`).
 ****************/
export class SpellElement<Thing extends object = object> extends E.UIComponent<typeof spellElementVocabulary> {
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

  /**
   * What we draw:  the thing the program handed us;  else the program's thing our `id` names, or in a layout its one
   * thing of our type (`boundThing`);  else the one we made.
   * - The handed thing always wins:  our `id` is never looked up while we have one,
   *   so the id we take from it (`nameAfterHandedThing()`) can't make us draw another.
   */
  get currentThing(): Thing | undefined {
    const thing = this.handedThing ?? (this.idName || this.isInLayout ? this.boundThing : this.ownThing)
    return thing as Thing | undefined
  }

  /** The thing the program handed us, e.g. `draw the card`:  our `thing` property. */
  private get handedThing(): object | undefined {
    const { thing } = this
    return thing && typeof thing === "object" ? thing : undefined
  }

  /**
   * Our tag's `id`, e.g. `T1` -- `undefined` if it has none.
   * - Watched:  a page changing it makes a tag written by hand draw the thing the new id names.
   */
  @E.watches({ attributes: true, attributeFilter: ["id"] })
  get idName(): string | undefined {
    return this.domElement.id || undefined
  }

  /** What our tag draws with:  its class, and the runtime of the program that defined it last. */
  private get entry(): SpellElementEntry | undefined {
    return SPELL_ELEMENTS.get(this.domElement.localName)
  }

  /** Are we in a `<spell-app>`'s layout, its markup around the program?  See `SpellApp.hasLayout`. */
  get isInLayout(): boolean {
    return !!this.domElement.closest("spell-app")
  }

  /**
   * The program's thing our `id` names, e.g. the tableau named `T1` for `<solitaire-tableau id="T1">` (J43):
   * as the reference `Tableau#T1` finds it, on any page.
   * - A sub-type's thing too (P18):  `<solitaire-pile id="stock">` is the stock, a stock-pile.
   * - Digits are a place:  `<solitaire-tableau id="1">` is the first tableau.
   * - With no `id`, in a layout:  its one thing of our type exactly.
   * - The program asked is the one that defined our tag last.
   * - `undefined` if there's none (yet).
   * - Tracked:  found as soon as the program makes it.  See `spellCore.thingFor()`.
   */
  get boundThing(): object | undefined {
    const { entry, idName } = this
    if (!idName && !this.isInLayout) return undefined
    return entry?.spellCore.thingFor(entry.Class, idName)
  }

  /**
   * Our thing's drawing -- nothing before our tag's runtime is known.
   * - In a layout, or with an `id`, and no thing of ours in the program:  a stand-in saying so, not a blank (Q9).
   */
  get drawing(): JSX.Element {
    const thing = this.currentThing
    const { entry } = this
    if (!entry) return null
    if (thing) return entry.spellCore.drawOwn(thing) as JSX.Element
    const isMissing = this.isInLayout || this.idName
    return isMissing ? <span class="spell-draw-error">{this.missingText(entry)}</span> : null
  }

  /**
   * What our stand-in says, when the program has no thing for us:
   * e.g. `⚠ no Tableau named "T9"`, or `⚠ no Tableau, or more than one:  give it an id`.
   */
  private missingText(entry: SpellElementEntry): string {
    const { idName } = this
    const { name } = entry.Class
    return idName ? `⚠ no ${name} named "${idName}"` : `⚠ no ${name}, or more than one:  give it an id`
  }

  /**
   * Once on the page:  find or make our thing, and keep it and the element agreeing.
   * - Written by hand, handed no thing and with no `id`, outside a layout:  make a thing of our type, once.
   * - Handed a thing:  our `id` is its name (`nameAfterHandedThing()`).
   * - Each of our type's properties stays the same on our thing and our element:  `keepThingAndElementAgreeing()`.
   * - A drawable list the page wrote puts its own items in, as its children:  in a layout, nothing else draws it.
   */
  onMount() {
    createEffect(
      () => !this.handedThing && !this.idName && !this.isInLayout,
      (isOnItsOwn) => {
        const { entry } = this
        // named by an id, or in a layout, the program's thing is ours:  never one of our own
        if (isOnItsOwn && !this.ownThing && entry) this.ownThing = new (entry.Class as new () => object)()
      }
    )
    this.nameAfterHandedThing()
    // a drawable list the PAGE wrote (its thing found in a layout, or made here):
    // nobody draws it, so it puts its own items in, as its children -- after any the page gave it.
    // The program's own draw puts them in itself.
    insert(
      this.domElement,
      () => {
        const list = this.handedThing ? undefined : this.currentThing
        const { entry } = this
        return list && entry && "items" in list ? (entry.spellCore.drawItems(list) as JSX.Element) : null
      },
      null
    )
    this.keepThingAndElementAgreeing()
    return super.onMount()
  }

  /**
   * Handed a thing by the program:  our `id` is its name, so the browser's inspector says which thing we draw,
   * `<solitaire-card id="queen-of-spades">` (J43).
   * - A second of the program's things with that name, e.g. from a second deck:  `queen-of-spades-2`.
   *   Which is which is the program's to say:  see `spellCore.elementIdFor()`.
   * - It follows the thing's name:  a card whose rank changes changes its id.
   * - A thing with no name:  no id.
   * - An id the page gave the tag itself is kept.
   * - Never read back:  while we have a handed thing, our `id` is never looked up (`currentThing`).
   *   Spell UI doesn't hear `id` either:  it's none of our vocabulary's attributes.
   */
  private nameAfterHandedThing() {
    let written: string | undefined
    createEffect(
      () => {
        const thing = this.handedThing
        return thing && this.entry?.spellCore.elementIdFor(thing)
      },
      (id) => {
        const element = this.domElement
        if (element.id && element.id !== written) return
        if (id) element.id = id
        else element.removeAttribute("id")
        written = id
      }
    )
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
          const thing = this.currentThing
          return [thing, thing && this.shownValueOf(property, thing)] as const
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
    if (this.handedThing) return false
    if (property.spec.kind === "json") return this.elementValueOf(property) != null
    return this.domElement.hasAttribute(property.spec.name)
  }

  /** Write the element's `value` of `property` to `thing`, as `thing` takes it -- nothing when they agree already. */
  private writeThing(property: TypeProperty, thing: object, value: unknown) {
    if (this.agree(property, value, this.shownValueOf(property, thing))) return
    if (property.reference) return this.writeReference(property, thing, value)
    ;(thing as Record<string, unknown>)[property.name] = SpellElement.valueFor(property, value)
  }

  /**
   * Write the thing reference `text`, e.g. `"Tableau#T1"`, to `thing`'s property `property` (P18):
   * - a property holding a thing:  set to the thing the reference finds;  no attribute is nothing
   * - the list holding it, e.g. a card's `pile`:  moved to the list the reference finds, as a move in spell is --
   *   so the lists' rules are asked (`spellCore.move()`)
   *   - a move they refuse, or no attribute:  it stays where it is, and the attribute shows that list again
   * - A reference that finds nothing (yet) changes nothing, and the attribute stays as written.
   */
  private writeReference(property: TypeProperty, thing: object, text: unknown) {
    const { entry } = this
    if (!entry) return
    const reference = typeof text === "string" ? text.trim() : ""
    const target = reference ? entry.spellCore.thingForReference(reference) : undefined
    if (reference && !target) return
    if (property.reference === "thing") {
      ;(thing as Record<string, unknown>)[property.name] = target
      return
    }
    if (target) entry.spellCore.move(thing, target)
    this.writeElement(property, thing)
  }

  /**
   * `thing`'s value of `property`, as its element shows it:
   * its own value, or for a property holding a thing, the thing's reference, e.g. `"Tableau#T1"` (P18).
   * - Reads the thing's property:  a reader follows it.
   */
  private shownValueOf(property: TypeProperty, thing: object): unknown {
    const value = (thing as Record<string, unknown>)[property.name]
    return property.reference ? this.entry?.spellCore.referenceFor(value) : value
  }

  /**
   * Write `thing`'s value of `property` to the element's property, so its attribute shows it.
   * - Nothing when they agree already.
   * - A property holding a list has no attribute:  its element property reads the thing's (`readThroughThing()`).
   * - Through the element's own property, which Spell UI writes back to the attribute:
   *   `rank="2"`, `face-up` when yes and gone when no, no attribute for nothing,
   *   `pile="Tableau#T1"` for a thing (P18).
   */
  private writeElement(property: TypeProperty, thing: object) {
    if (property.spec.kind === "json") return
    const value = this.shownValueOf(property, thing)
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
   * - A property holding a thing reads as its reference, `card.pile` is `"Tableau#T1"`,
   *   and takes a reference or the thing itself:  `card.pile = tableau` is `card.pile = "Tableau#T1"` (P18).
   */
  static readThroughThing(TagClass: CustomElementConstructor, properties: TypeProperty[]): void {
    const { prototype } = TagClass as unknown as { prototype: object }
    for (const property of properties) {
      const own = Object.getOwnPropertyDescriptor(prototype, property.property)
      if (!own?.get || !own.set) continue
      const { get: elementValue, set: setElementValue } = own
      Object.defineProperty(prototype, property.property, {
        ...own,
        get(this: { component?: SpellElement }) {
          const { component } = this
          const thing = component?.currentThing
          return thing ? component!.shownValueOf(property, thing) : elementValue.call(this)
        },
        set(this: HTMLElement & { component?: SpellElement }, value: unknown) {
          const spellCore = property.reference && SPELL_ELEMENTS.get(this.localName)?.spellCore
          const isThing = spellCore && value && typeof value === "object"
          setElementValue.call(this, isThing ? spellCore.referenceFor(value) : value)
        }
      })
    }
  }

  /**
   * Make `tag` the element of drawable class `Class`, from `spellCore`'s program, e.g. `solitaire-card` for `Card`.
   * - The first time:  a component class for the tag, defined on the page, built on:
   *   - the element class compiled TypeScript handed for `Class`, e.g. `CardElement` (`spellCore.useElement()`, P10)
   *   - else a bare `SpellElement`, as for compiled javascript
   * - Its vocabulary is ours under that tag, plus an attribute per property its type declares (`typePropertiesOf()`):
   *   - an attribute the handed class names is its own, as written
   *   - one it doesn't, e.g. a super-type's property or the list holding it, is added as for javascript
   *   - so both targets' tags have the same attributes, and behave the same
   * - Its methods are its type's (`addMethods()`).
   * - Its sheet is its type's (`sheetFor()`).
   * - Again (a program run again after an edit, or another `<spell-app>` running the same project):
   *   the platform can't define a tag twice, so it stays, and what's behind it is swapped (epic `drawable-thing` P7):
   *   - it draws with the latest `spellCore` from then on (`SPELL_ELEMENTS`)
   *   - its type's CSS is replaced in every element of the tag on the page, at once (`restyle()`)
   *   - what it draws comes from its `thing`, so a program run again draws its new things with their new `draw()`
   */
  static defineFor(tag: string, Class: Function, spellCore: SpellCore): void {
    SPELL_ELEMENTS.set(tag, { Class, spellCore })
    const Base = (spellCore.elementClassOf(Class) ?? SpellElement) as typeof SpellElement
    // never "":  `UI.styles.register()` takes that as "unregister", and the tag's elements would lose the sheet
    const css = SpellElement.sheetFor(tag, Class, Base) || `/* <${tag}>:  no styles of its own */`
    if (customElements.get(tag)) return SpellElement.restyle(tag, css)
    const api = spellCore.elementApiOf(Class)
    const written = SpellElement.writtenAttributesOf(Base)
    const properties = SpellElement.typePropertiesOf(api, written)
    const derived = new Set(properties.map((property) => property.spec.name))
    // our names under its tag, then its type's:  typed as ours, whose tag is a literal
    const vocabulary = {
      ...spellElementVocabulary,
      tag,
      noun: Object.hasOwn(Base, "vocabulary") ? Base.vocabulary.noun : Class.name,
      attributes: [
        ...spellElementVocabulary.attributes,
        ...properties.map((property) => property.spec),
        // one the handed class adds that's none of its type's properties:  a plain attribute
        ...written.filter((attribute) => !derived.has(attribute.name))
      ]
    } as unknown as typeof spellElementVocabulary
    const Component = class extends Base {
      @E.proto static vocabulary = vocabulary
      @E.proto static typeProperties = properties
      // the sheet is named for the tag, so `restyle()` can replace it
      @E.protoMerged static elementSetup: Partial<E.ElementSetup> = {
        styleSheets: { ...Base.prototype.elementSetup.styleSheets, [tag]: css }
      }
    }
    const TagClass = Component.define()
    SpellElement.readThroughThing(TagClass, properties)
    SpellElement.addMethods(TagClass, api.methods, Base)
  }

  /**
   * The vocabulary of a drawable type's element class, as compiled TypeScript writes it (P10):
   * ours under its `tag`, called by its `noun`, with `attributes` after ours.
   *
   * ```ts
   * @E.proto static vocabulary = SpellElement.vocabularyFor("solitaire-card", "card", [
   *   { name: "rank", kind: "string", description: "Its rank." }
   * ])
   * ```
   * - The page defines the tag with it, adding each attribute it leaves out:  see `defineFor()`.
   * - Typed as ours, whose tag is a literal.
   */
  static vocabularyFor(tag: string, noun: string, attributes: E.AttributeSpec[]): typeof spellElementVocabulary {
    const vocabulary = {
      ...spellElementVocabulary,
      tag,
      noun,
      attributes: [...spellElementVocabulary.attributes, ...attributes]
    }
    return vocabulary as unknown as typeof spellElementVocabulary
  }

  /**
   * The attributes element class `Base`'s own vocabulary adds to ours, e.g. `rank` for `CardElement`:
   * none for ours, or for a class that names none.
   */
  static writtenAttributesOf(Base: typeof SpellElement): E.AttributeSpec[] {
    if (Base === SpellElement || !Object.hasOwn(Base, "vocabulary")) return []
    const ours = new Set<string>(spellElementVocabulary.attributes.map((attribute) => attribute.name))
    return (Base.vocabulary.attributes as readonly E.AttributeSpec[]).filter((attribute) => !ours.has(attribute.name))
  }

  /**
   * The sheet of `tag`, drawable class `Class`'s element built on element class `Base`:
   * - `Base`'s own sheet under `tag`, if it has one (compiled TypeScript's `styleSheets: { "solitaire-card": Card.css }`),
   *   after its super-types' (`cssOf()`)
   * - else `Class`'s, its super-types' first (`cssOf()`), as for javascript
   * - `""` if neither has any.
   */
  static sheetFor(tag: string, Class: Function, Base: typeof SpellElement): string {
    const written = Base.prototype.elementSetup.styleSheets?.[tag]
    if (written === undefined) return SpellElement.cssOf(Class)
    return [SpellElement.cssOf(Object.getPrototypeOf(Class)), written].filter(Boolean).join("\n")
  }

  /**
   * The attributes of a type's properties, from its `api`, e.g. `short-rank` for `short_rank`:
   * see `drawableAttributeFor()` in `$/util`.
   * - Text, a number or a choice:  an attribute and a property.
   * - A thing, e.g. a pile:  an attribute holding its reference, `pile="Tableau#T1"` (P18).
   *   So is the list holding it, for `a card belongs to one pile`.
   * - Anything else, e.g. a list:  a property only.
   * - A name the page or Spell UI already means something by (`id`, `hidden`, `disabled` ...) is left out.
   * - `written`:  attributes an element class names itself (`writtenAttributesOf()`):  one of them is used as written.
   */
  static typePropertiesOf(api: ElementApi, written: E.AttributeSpec[] = []): TypeProperty[] {
    const properties: TypeProperty[] = []
    for (const { name, type, values, owner } of api.properties) {
      const attribute = drawableAttributeFor(name, type, owner)
      if (!attribute) continue
      const { kind, description, reference } = attribute
      properties.push({
        name,
        property: attribute.property,
        values,
        ...(reference ? { reference } : {}),
        spec: written.find((spec) => spec.name === attribute.name) ?? { name: attribute.name, kind, description }
      })
    }
    return properties
  }

  /**
   * Give `TagClass`'s elements a method for each of `methods`, calling its thing's:  `turnOver()` => `turn_over()`.
   * - One element class `Base` has itself, e.g. compiled TypeScript's `CardElement.turnOver()`, is called instead:
   *   so a method written there runs, for a page's `card.turnOver()`.
   * - A name the element already has (`remove`, `click` ...) is left out.
   */
  static addMethods(TagClass: CustomElementConstructor, methods: string[], Base = SpellElement): void {
    const { prototype } = TagClass as unknown as { prototype: Record<string, unknown> }
    for (const method of methods) {
      const name = E.camelCase(method.replace(/_/g, "-"))
      if (name in prototype) continue
      const isWritten = SpellElement.hasOwnMethod(Base, name)
      Object.defineProperty(prototype, name, {
        configurable: true,
        value(this: { component?: SpellElement }, ...args: unknown[]) {
          const { component } = this
          if (isWritten)
            return (component as unknown as Record<string, (...args: unknown[]) => unknown>)?.[name]?.(...args)
          const thing = component?.currentThing as Record<string, (...args: unknown[]) => unknown> | undefined
          return thing?.[method]?.(...args)
        }
      })
    }
  }

  /** Does element class `Base`, or a class between it and us, have a method `name` of its own? */
  private static hasOwnMethod(Base: typeof SpellElement, name: string): boolean {
    for (let at = Base.prototype; at && at !== SpellElement.prototype; at = Object.getPrototypeOf(at)) {
      if (typeof Object.getOwnPropertyDescriptor(at, name)?.value === "function") return true
    }
    return false
  }

  /** The drawable class `element`'s tag is for, e.g. `Card` for `<solitaire-card>` -- `undefined` for any other tag. */
  static classOf(element: Element): Function | undefined {
    return SPELL_ELEMENTS.get(element.localName)?.Class
  }

  /**
   * Was drawable tag `element` handed its thing by the program, e.g. by `draw the card`, rather than written by hand?
   * - Its `id` then is its thing's name, not a name the page gave it (`nameAfterHandedThing()`).
   */
  static isHandedAThing(element: Element): boolean {
    const { thing } = element as Element & { thing?: unknown }
    return !!thing && typeof thing === "object"
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
export interface SpellElement<Thing extends object = object> extends E.AttributeValues<typeof spellElementVocabulary> {}

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
  /**
   * Does it hold a thing, shown as the thing's reference (P18)?
   * - `thing`:  a property declared as a thing, e.g. `a card has a home as a pile`
   * - `owner`:  the list holding it, e.g. a card's `pile`, for `a card belongs to one pile`:  set by a move
   */
  reference?: "thing" | "owner"
  /** Its attribute, as a vocabulary declares it. */
  spec: E.AttributeSpec
}

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
