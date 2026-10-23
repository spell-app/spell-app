import { createEffect } from "solid-js"
import { insert, type JSX } from "@solidjs/web"

import { drawableAttributeFor, kebabCase } from "spell-kit/util"
import { E, UI } from "spell-ui/core"
import { RootLoader } from "spell-ui/components/ui-root"
import type { ElementApi, Core } from "spell-lang/core"
import { spellElementVocabulary } from "./SpellElement.en"
import { Glides } from "./Glides"
import { Dragging } from "./Dragging"

// Above the class:  its `elementSetup` reads it while the class is defined
/**
 * What a draggable thing looks like:  the browser's grab cursor, grabbing while it's dragged -- over its drawing's own
 * `cursor`, e.g. a clickable card's pointer;  and a finger drags it rather than scrolling the page.
 * - A list that will take what's dragged over it glows:  `--spell-drop-glow` (a `box-shadow`) and
 *   `--spell-drop-glow-radius` change it.
 */
const DRAGGING_CSS = `
  :host(:state(draggable)) { touch-action: none; }
  :host(:state(draggable)), :host(:state(draggable)) * { cursor: grab !important; }
  :host(:state(dragging)), :host(:state(dragging)) * { cursor: grabbing !important; }
  :host(:state(accepting-drop)) {
    border-radius: var(--spell-drop-glow-radius, 0.5em);
    box-shadow: var(--spell-drop-glow, 0 0 0 0.2em rgb(255 196 0 / 0.9), 0 0 1.2em 0.4em rgb(255 196 0 / 0.6));
    transition: box-shadow 120ms;
  }
`

/****************
 * ### `SpellElement`
 * The component behind a drawable thing's own element, e.g. `<solitaire-card>` for `a card is a drawable thing`.
 *
 * - A Spell UI component like any `ui-*` one:  its own shadow root, with the page's theme and base styles.
 *   Then its type's own `<css>`, its class's `static css`, after its super-types' (`cssOf()`).
 * - It draws its `thing`, through the program's runtime:  `core.drawOwn()`, in the thing's error boundary.
 * - Its outside is its type's (epic `drawable-thing` P8), named as Spell UI names its own elements' API:
 *   - each property its type declares is an attribute and a property:  `<game-card rank="1">`, `card.rank = 12`
 *   - each property stays the same on the element and its thing, both ways (P13):
 *     - the page's change is written to the thing
 *     - the thing's change is written to the element's attribute, so the inspector shows it
 *     - see `keepThingAndElementAgreeing()`
 *   - each method of its type is a method:  `card.turnOver()` calls its thing's `turn_over()`
 *   - a property holding a thing shows as the thing's reference, and follows it (P18):
 *     `<solitaire-card pile="Tableau#T1">`
 *     - setting it sets the property, or, for the list holding it, moves the card -- see `writeReference()`
 *   - English names only, for now
 * - Which thing it draws (P9, J43):
 *   - drawn by the program:  the thing it's handed, and its `id` is that thing's name --
 *     `<solitaire-card id="queen-of-spades">`, see `nameAfterHandedThing()`
 *   - written by hand with an `id`, on any page:  the program's thing the id names,
 *     as the part of a reference after its `#` -- see `boundThing`
 *     - `<solitaire-tableau id="T1">` is `Tableau#T1`
 *   - written by hand with no `id`:  in a `<spell-app>`'s layout, the program's one thing of its type;
 *     elsewhere it makes its own, a new thing of its type, once mounted
 * - ONE tag per drawable type, defined the first time a program defines its elements (`defineFor()`).
 *   What the tag draws with is looked up when it draws (`SPELL_ELEMENTS`), so a program run again takes it over.
 * - Compiled TypeScript writes each type's own class on it, saying only what's the type's (epic `drawable-thing` P10):
 *   `class CardElement extends SpellElement<Card>`, with its attributes, its methods and its sheet.
 *   - The page builds the tag on that class (`core.useElement()`), so both targets draw the same element.
 *   - It reaches compiled code as `@spell/elements`:  see `spellElements.ts`.
 * - Dragging is opt-in, by the program's own words (epic `outline-spell` P28):
 *   - `a card can be dragged`:  a card its list will give up can be dragged, with a mouse or a finger;
 *     it, and its list's items after it, follow the pointer
 *   - `a pile can be dropped on`:  a pile that will take the card glows as it comes over (`:state(accepting-drop)`),
 *     and on the drop the program hears `<thing>-drop`, e.g. `on card drop with a card and a pile` -- see `dropOn()`
 *   - The web's own drag events say so as it goes:  `dragstart`, `dragenter`, `drop` ... (`Dragging`).
 *   - It shows the browser's grab cursor while it can be dragged, grabbing while it is (`DRAGGING_CSS`).
 * - Part of `spell-runtime.js`:  NEVER value-imports `spell-lang/core`.
 *   Each runtime copy hands itself over in `installSpellElements()`.
 * - SEE:  its App UI components page, `app/docs/spell-element.html` (`/components/app/spell-element.html`).
 ****************/
export class SpellElement<Thing extends object = object> extends E.UIComponent<typeof spellElementVocabulary> {
  @E.proto static vocabulary = spellElementVocabulary
  @E.protoMerged static elementSetup: Partial<E.ElementSetup> = {
    delegatesFocus: false,
    styleSheets: { "spell-element": DRAGGING_CSS }
  }

  /** Each property its type declares, as an attribute -- set per tag, see `defineFor()`. */
  @E.proto static typeProperties: TypeProperty[] = []
  declare typeProperties: TypeProperty[]

  /** The thing a tag written by hand made for itself, with no `thing` set -- see `onMount()`. */
  @E.state private accessor ownThing: object | undefined = undefined

  render(): JSX.Element {
    return <>{this.drawing}</>
  }

  /**
   * What we draw, the first of these there is:
   * - the thing the program handed us
   * - the program's thing our `id` names, or in a layout its one thing of our type (`boundThing`)
   * - the one we made
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
   * - Tracked:  found as soon as the program makes it.  See `core.thingFor()`.
   */
  get boundThing(): object | undefined {
    const { entry, idName } = this
    if (!idName && !this.isInLayout) return undefined
    return entry?.core.thingFor(entry.Class, idName)
  }

  /**
   * Our thing's drawing -- nothing before our tag's runtime is known.
   * - In a layout, or with an `id`, and no thing of ours in the program:  a stand-in saying so, not a blank (Q9).
   */
  get drawing(): JSX.Element {
    const thing = this.currentThing
    const { entry } = this
    if (!entry) return null
    if (thing) return entry.core.drawOwn(thing) as JSX.Element
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
   *   Each is what its `to draw each item` draws (`core.drawItems()`), by default the item's own element.
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
        return list && entry && "items" in list ? (entry.core.drawItems(list) as JSX.Element) : null
      },
      null
    )
    this.keepThingAndElementAgreeing()
    this.loadSpellUIFamilies()
    this.numberItems()
    return super.onMount()
  }

  /** The thing we draw is drawn HERE now:  if it was moving, it glides here (`Glides`). */
  @E.onChange("currentThing")
  protected onThingDrawn(thing: Thing | undefined) {
    if (thing) Glides.drawn(thing, this.domElement)
  }

  ////////////////
  // ## Dragging (epic `outline-spell` P28)
  ////////////////

  /** The list holding our thing, e.g. a card's pile -- `undefined` if none holds it. */
  private get ownerList(): object | undefined {
    const thing = this.currentThing as Record<string, unknown> | undefined
    const owner = this.typeProperties.find((property) => property.reference === "owner")
    const list = owner && thing?.[owner.name]
    return list && typeof list === "object" ? list : undefined
  }

  /**
   * Can our thing be dragged?  Only when its type says so (`a card can be dragged`),
   * and its list will give it up, by the list's own rules (`can give up`):
   * e.g. a tableau's face-up card, the discards' last card -- never a card of a list that never lets go.
   * - Followed:  a card turned face up becomes draggable at once.
   */
  @E.cssState("draggable")
  get isDraggable(): boolean {
    const thing = this.currentThing
    const list = this.ownerList
    if (!thing || !list || !SpellElement.flag(thing, "canBeDragged")) return false
    return !!this.entry?.core.canGiveUp(list, thing)
  }

  /** Is it being dragged now?  Its cursor is grabbing meanwhile. */
  @E.cssState("dragging")
  @E.state
  accessor isDragging = false

  /** A press on a draggable thing:  a drag, if it moves -- see `Dragging`. */
  @E.on("pointerdown")
  protected onPointerDown(event: PointerEvent) {
    if (!this.isDraggable || event.button !== 0) return
    new Dragging(this.domElement, event, (target) => this.dropOn(target))
  }

  @E.on("dragstart")
  protected onDragStart(event: DragEvent) {
    // ours, not a card's within us:  the events bubble
    if (event.target === this.domElement) this.isDragging = true
  }

  @E.on("dragend")
  protected onDragEnd(event: DragEvent) {
    if (event.target === this.domElement) this.isDragging = false
  }

  ////////////////
  // ## Dropping (epic `outline-spell` P28)
  ////////////////

  /** Will we take what's being dragged over us now?  We glow while we will (`DRAGGING_CSS`). */
  @E.cssState("accepting-drop")
  @E.state
  accessor isAcceptingDrop = false

  @E.on("dragenter")
  protected onDragEnter(event: DragEvent) {
    if (event.target === this.domElement) this.isAcceptingDrop = this.takesDrag()
  }

  @E.on("dragleave")
  protected onDragLeave(event: DragEvent) {
    if (event.target === this.domElement) this.isAcceptingDrop = false
  }

  @E.on("drop")
  protected onDrop(event: DragEvent) {
    if (event.target === this.domElement) this.isAcceptingDrop = false
  }

  /**
   * Would we take the thing being dragged (`Dragging.current`)?
   * - Only a list whose type says `can be dropped on`, and not the one it came from.
   * - Then by our own rules:  `can take a card if: ...` (`core.canTake()`).
   */
  takesDrag(): boolean {
    const dragged = Dragging.current?.element
    const thing = dragged && SpellElement.thingOf(dragged)
    const list = this.currentThing
    if (!thing || !list || !("items" in list) || !SpellElement.flag(list, "canBeDroppedOn")) return false
    const component = (dragged as Partial<E.DOMElement>).component
    if (component instanceof SpellElement && component.ownerList === list) return false
    return !!this.entry?.core.canTake(list, thing)
  }

  /**
   * Our thing, dropped on `target`, a drawable list's element:  the program hears `<thing>-drop`, e.g. `card-drop`.
   * - Only when the list takes it (`takesDrag()`):  else it slides back, and the program hears nothing.
   * - In the program's language (core's `drop-event` message):  a Spanish program hears `soltar-carta`.
   * - Its details name the thing by its type, and the list by each of its types up to its family's:
   *   `{ card, tableau, pile }`, so `on card drop with a card and a pile` gets both.
   * - Nobody listening:  it moves there, if the lists' rules let it (`core.move()`).
   */
  private dropOn(target: HTMLElement | undefined) {
    const component = (target as Partial<E.DOMElement> | undefined)?.component
    const list = component instanceof SpellElement && component.takesDrag() ? component.currentThing : undefined
    const thing = this.currentThing
    const { entry } = this
    if (!list || !thing || !entry) return
    const name = SpellElement.instanceName(thing.constructor)
    const details: Record<string, object> = { [name]: thing }
    for (
      let Class = list.constructor;
      Class && !BASE_LIST_NAMES.has(Class.name);
      Class = Object.getPrototypeOf(Class)
    ) {
      details[SpellElement.instanceName(Class)] ??= list
    }
    const heard = entry.core.trigger(entry.core.message("drop-event", { thing: kebabCase(name) }), details)
    if (!heard.length) entry.core.move(thing, list)
  }

  /** The list `element` draws, if it's a drawable list's element -- `undefined` if not. */
  static listOf(element: Element): object | undefined {
    const component = (element as Partial<E.DOMElement>).component
    const thing = component instanceof SpellElement ? component.currentThing : undefined
    return thing && "items" in thing ? thing : undefined
  }

  /** Does `thing`'s type say yes to `flag`, e.g. `canBeDragged` for `a card can be dragged`? */
  private static flag(thing: object, flag: "canBeDragged" | "canBeDroppedOn"): boolean {
    return (thing.constructor as Partial<Record<typeof flag, boolean>>)[flag] === true
  }

  /** What a program calls a thing of `Class`, e.g. `card` for `Card`, `stockPile` for `StockPile`. */
  private static instanceName(Class: Function): string {
    return Class.name.charAt(0).toLowerCase() + Class.name.slice(1)
  }

  /**
   * Number our children, so CSS alone can lay out a drawable list's items:
   * each child's `--index` (from 0), and our `--count`.
   * - e.g. a pile's cards, each 10% lower than the one before:  `top: calc(var(--index) * 10%)`.
   * - Again whenever they change:  a card added, taken away, or moved within the list.
   * - Every child element, the page's too:  `<solitaire-tableau>` written by hand, with cards inside.
   * - A drawable LIST's element only:  a card numbering its own (no) children would hide its pile's `--count`.
   * - SIDE EFFECT:  writes the custom properties into each child's `style` and ours.
   */
  @E.watches({ childList: true })
  protected numberItems() {
    const thing = this.currentThing
    if (!thing || !("items" in thing)) return
    const children = [...this.domElement.children] as HTMLElement[]
    children.forEach((child, index) => child.style.setProperty("--index", String(index)))
    this.domElement.style.setProperty("--count", String(children.length))
  }

  /**
   * Load each Spell UI family our drawing uses, the first time one of its tags shows in our shadow root:
   * a card drawn as `<ui-text>`, or as `<es-texto>` in a Spanish program.
   * - Why here:  a root (`<spell-app>`, `<ui-root>`) loads the tags in its own content and shadow root,
   *   never inside another element's shadow root, where our drawing is.
   * - A page language's tags load once the runner has turned the language on (`RootLoader.useLanguage()`).
   * - Watches until we're released:  a drawing that changes may draw a tag of another family.
   * - NEVER throws:  a family that won't load leaves its tags undrawn, and says so in the console.
   */
  private loadSpellUIFamilies() {
    const shadowRoot = this.domElement.renderRoot
    const loadNew = () => {
      for (const tag of RootLoader.undefinedTags(shadowRoot)) {
        RootLoader.loadTag(tag)?.catch((error: unknown) =>
          E.Warnings.warn(`<${this.domElement.localName}>`, `can't load the Spell UI family of <${tag}>`, error)
        )
      }
    }
    loadNew()
    // our SHADOW root:  `@E.watches` watches the light DOM
    const observer = new MutationObserver(loadNew)
    observer.observe(shadowRoot, { childList: true, subtree: true })
    this.domElement.addReleaseCallback(() => observer.disconnect())
  }

  /**
   * Handed a thing by the program:  our `id` is its name (J43),
   * so the browser's inspector says which thing we draw:  `<solitaire-card id="queen-of-spades">`.
   * - A second of the program's things with that name, e.g. from a second deck:  `queen-of-spades-2`.
   *   Which is which is the program's to say:  see `core.elementIdFor()`.
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
        return thing && this.entry?.core.elementIdFor(thing)
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

  /**
   * Write the element's `value` of `property` to `thing`, as `thing` takes it -- nothing when they agree already.
   * - A property its type always gives the same value can't be set, e.g. a tableau's `layout`
   *   (`- its layout is vertical`, a getter):  the element shows the thing's value again.
   */
  private writeThing(property: TypeProperty, thing: object, value: unknown) {
    if (this.agree(property, value, this.shownValueOf(property, thing))) return
    if (property.reference) return this.writeReference(property, thing, value)
    if (SpellElement.isReadOnly(thing, property.name)) return this.writeElement(property, thing)
    ;(thing as Record<string, unknown>)[property.name] = SpellElement.valueFor(property, value)
  }

  /** Is `thing`'s property `name` a getter with no setter, e.g. one its type always gives the same value? */
  private static isReadOnly(thing: object, name: string): boolean {
    for (let at: object | null = thing; at; at = Object.getPrototypeOf(at)) {
      const descriptor = Object.getOwnPropertyDescriptor(at, name)
      if (descriptor) return !!descriptor.get && !descriptor.set
    }
    return false
  }

  /**
   * Write the thing reference `text`, e.g. `"Tableau#T1"`, to `thing`'s property `property` (P18):
   * - a property holding a thing:  set to the thing the reference finds;  no attribute is nothing
   * - the list holding it, e.g. a card's `pile`:  moved to the list the reference finds,
   *   as a move in spell is, so the lists' rules are asked (`core.move()`)
   *   - a move they refuse, or no attribute:  it stays where it is, and the attribute shows that list again
   * - A reference that finds nothing (yet) changes nothing, and the attribute stays as written.
   */
  private writeReference(property: TypeProperty, thing: object, text: unknown) {
    const { entry } = this
    if (!entry) return
    const reference = typeof text === "string" ? text.trim() : ""
    const target = reference ? entry.core.thingForReference(reference) : undefined
    if (reference && !target) return
    if (property.reference === "thing") {
      ;(thing as Record<string, unknown>)[property.name] = target
      return
    }
    if (target) entry.core.move(thing, target)
    this.writeElement(property, thing)
  }

  /**
   * `thing`'s value of `property`, as its element shows it:
   * its own value, or for a property holding a thing, the thing's reference, e.g. `"Tableau#T1"` (P18).
   * - Reads the thing's property:  a reader follows it.
   */
  private shownValueOf(property: TypeProperty, thing: object): unknown {
    const value = (thing as Record<string, unknown>)[property.name]
    return property.reference ? this.entry?.core.referenceFor(value) : value
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
   * - A property holding a thing (P18):
   *   - reads as its reference:  `card.pile` is `"Tableau#T1"`
   *   - takes a reference or the thing itself:  `card.pile = tableau` is `card.pile = "Tableau#T1"`
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
          const core = property.reference && SPELL_ELEMENTS.get(this.localName)?.core
          const isThing = core && value && typeof value === "object"
          setElementValue.call(this, isThing ? core.referenceFor(value) : value)
        }
      })
    }
  }

  /**
   * Make `tag` the element of drawable class `Class`, from `core`'s program, e.g. `solitaire-card` for `Card`.
   * - The first time:  a component class for the tag, defined on the page, built on:
   *   - the element class compiled TypeScript handed for `Class`, e.g. `CardElement` (`core.useElement()`, P10)
   *   - else a bare `SpellElement`, as for compiled javascript
   * - Its vocabulary is ours under that tag, plus an attribute per property its type declares (`typePropertiesOf()`):
   *   - an attribute the handed class names is its own, as written
   *   - one it doesn't, e.g. a super-type's property or the list holding it, is added as for javascript
   *   - so both targets' tags have the same attributes, and behave the same
   * - Its methods are its type's (`addMethods()`).
   * - Its sheet is its type's (`sheetFor()`).
   * - Again (a program run again after an edit, or another `<spell-app>` running the same project):
   *   the platform can't define a tag twice, so it stays, and what's behind it is swapped (epic `drawable-thing` P7):
   *   - it draws with the latest `core` from then on (`SPELL_ELEMENTS`)
   *   - its type's CSS is replaced in every element of the tag on the page, at once (`restyle()`)
   *   - what it draws comes from its `thing`, so a program run again draws its new things with their new `draw()`
   */
  static defineFor(tag: string, Class: Function, core: Core): void {
    SPELL_ELEMENTS.set(tag, { Class, core })
    const Base = (core.elementClassOf(Class) ?? SpellElement) as typeof SpellElement
    // never "":  `UI.styles.register()` takes that as "unregister", and the tag's elements would lose the sheet
    const css = SpellElement.sheetFor(tag, Class, Base) || `/* <${tag}>:  no styles of its own */`
    if (customElements.get(tag)) return SpellElement.restyle(tag, css)
    const api = core.elementApiOf(Class)
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
    // the page's runtime has installed its settings by now (a program runs on it), so the tag is defined at once
    if (!TagClass) throw new Error(`SpellElement:  <${tag}> isn't defined:  no runtime for its elements yet`)
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
   * - `Base`'s own sheet under `tag`, if it has one, after its super-types' (`cssOf()`):
   *   compiled TypeScript's `styleSheets: { "solitaire-card": Card.css }`
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
   * see `drawableAttributeFor()` in `spell-kit/util`.
   * - Text, a number or a choice:  an attribute and a property.
   * - A thing, e.g. a pile:  an attribute holding its reference, `pile="Tableau#T1"` (P18).
   *   So is the list holding it, for `a card belongs to one pile`.
   * - Anything else, e.g. a list:  a property only.
   * - A name the page or Spell UI already means something by (`id`, `hidden`, `disabled` ...) is left out.
   * - `written`:  attributes an element class names itself (`writtenAttributesOf()`), each used as written.
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
 * Let `core` define its drawable classes' elements:  sets `core.elementDefiner`.
 * - And `core.beforeMove`:  a thing that moves glides to where it lands (`Glides`).
 * - Called once per runtime copy, by `spellRuntime.ts`.
 */
export function installSpellElements(core: Core): void {
  core.elementDefiner = (tag, Class) => SpellElement.defineFor(tag, Class, core)
  core.beforeMove = (things) => Glides.noteWhereThingsAre(things)
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
  core: Core
}

/**
 * Each drawable type's tag, and what it draws with -- ONE map per page, on `globalThis`:
 * every runtime copy (each `<spell-app>` has its own) shares the page's custom elements.
 */
const SPELL_ELEMENTS: Map<string, SpellElementEntry> = ((globalThis as SpellElementsGlobal)[
  Symbol.for("spell-app:spell-elements")
] ??= new Map())

/** `globalThis`, holding `SPELL_ELEMENTS`. */
type SpellElementsGlobal = typeof globalThis & { [key: symbol]: Map<string, SpellElementEntry> | undefined }

// a drop lands on the element of a drawable list its type says can be dropped on:  `Dragging` knows only what we tell it
Dragging.isDropTarget = (element) => {
  const list = SpellElement.listOf(element)
  return !!list && (list.constructor as { canBeDroppedOn?: boolean }).canBeDroppedOn === true
}

/** The core's own list classes:  a dropped-on list's details stop at its family's type, below them. */
const BASE_LIST_NAMES = new Set(["DrawableList", "List", "Observable", "Object"])
