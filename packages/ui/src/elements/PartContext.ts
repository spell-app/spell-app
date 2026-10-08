import { onSettled, untrack } from "solid-js"
import { onConnect } from "@spell-app/solid-element"

import { E } from "$/ui/core"
// Import directly to avoid circular import
import { onChange, state } from "./Reactive"

/**
 * Same owner element, noun and depth:  no state change (`PartContext.owner`'s `equals`).
 * - Above the class:  `@state({ equals })` reads it while the class is defined.
 */
function isSameOwner(a: E.OwnerMatch | undefined, b: E.OwnerMatch | undefined) {
  return a?.owner === b?.owner && a?.ownerNoun === b?.ownerNoun && a?.depth === b?.depth
}

/****************
 * ### `PartContext`
 * The OWNER of one element acting as a generic content part (`<ui-header>` in a card, `<ui-detail>` in a label,
 * `<ui-label>` in a statistic, `<ui-icon>` in `<ui-icons>`), plus the page-wide registry of who owns what.
 * - Resolution is `OwnerContext.find()` over the flat tree, with a `barrier` at every registered NON-part
 *   component:  a header inside a segment inside a card stays standalone, as Fomantic's child combinators have it.
 * - `isDirect` mode (icons):  only the flat-tree parent component counts, skipping its own shadow internals
 *   (`.ui.icons > .icon`).
 * - CONDITIONAL owners (`ConditionalOwner`, a part whose controller has `isOwnerOf()`):  asked during the climb,
 *   transparent while they say no -- `<ui-item>` owns its content parts in the Items view only.
 * - SIDE EFFECT:  keeps `:state(in-<owner>)` on the host in step with `owner` (`onOwnerChanged()`);  NEVER the
 *   static `in-<owner>` class.
 * - Re-resolves on:
 *   - every connect after the first (`keepAlive` keeps the controller across moves, so a part re-parented into
 *     another owner hears it through the fork's `onConnect`), a microtask late:  the hook may run inside a
 *     Solid render, where the signal write would throw
 *   - `slotchange` in any `UIElement`'s shadow root, for the elements entering AND leaving that slot
 *     (`UIElement` calls `PartContext.slotChanged()`), cascading to part descendants
 *   - once after the first settle, for owners whose shadow rendered after this part connected
 * - NOTE: no platform event says "my assigned slot changed";  a FOREIGN component re-slotting a part
 *   isn't seen until the part reconnects.
 * - MUST be created under the element's owner (field initializer / constructor):  it creates an effect.
 * - Knows `UIHost` / `UIElement` by type only:  `UIElement` imports this file (for `define()` and `slotChanged()`).
 ****************/
export class PartContext {
  /** Nearest owner, or `undefined` when standalone;  tracked.  A re-resolve to the same owner changes nothing. */
  @state({ equals: isSameOwner }) accessor owner: E.OwnerMatch | undefined = undefined

  /** The element. */
  readonly host: E.UIHost

  /** Part noun resolved against `ownsParts`, e.g. `header`. */
  readonly noun: string

  /** Only the flat-tree parent component counts (`<ui-icon>` in `<ui-icons>`). */
  private readonly isDirect: boolean

  /** Where the climb stops;  default `PartContext.isBarrier`. */
  private readonly barrier: (element: Element) => boolean

  constructor({ host, noun, isDirect = false, barrier = PartContext.isBarrier }: PartContextProps) {
    this.host = host
    this.noun = noun
    this.isDirect = isDirect
    this.barrier = barrier
    this.owner = this.resolve()
    PartContext.contexts.set(host, this)
    E.Reactive.startEffects(this)
    onSettled(() => {
      this.refresh()
      return () => {
        if (PartContext.contexts.get(host) === this) PartContext.contexts.delete(host)
      }
    })
    let isFirstConnect = true
    onConnect(() => {
      if (isFirstConnect) isFirstConnect = false
      else queueMicrotask(() => this.refresh())
    })
  }

  /** Owner noun (`card`), or `undefined`;  tracked. */
  get ownerNoun(): string | undefined {
    return this.owner?.ownerNoun
  }

  /**
   * The owner changed:  `:state(in-<owner noun>)` on the host, undone when it changes again.
   * - `writesHost`:  a server render sets it too.
   */
  @onChange("ownerNoun", { writesHost: true })
  protected onOwnerChanged(ownerNoun: string | undefined) {
    if (!ownerNoun) return
    const name = E.OwnerContext.stateName(ownerNoun)
    this.host.setState(name, true)
    return () => this.host.setState(name, false)
  }

  /**
   * The owner's CONTROLLER (a card's `UICards`, an item's list), or `undefined` when standalone;  tracked.
   * - `C` is the caller's word for what the owner is, NOT checked:  owners are registered by tag, not class.
   * - A method, not a getter:  a getter can't take the type parameter.
   */
  ownerController<C extends object = E.UIElement>(): C | undefined {
    return PartContext.controllerFor<C>(this.owner)
  }

  /**
   * Resolve again, e.g. after re-slotting;  cascades to part descendants in the light DOM, which climb through
   * this element.
   * - Writes `owner`:  call it from a handler, `onSettled` or a microtask, not a render.
   */
  refresh() {
    this.update()
    for (const element of this.host.querySelectorAll("*")) PartContext.contexts.get(element)?.update()
  }

  /**
   * Nearest owner, read from the DOM now (untracked), without updating `owner`.
   * - For a `ConditionalOwner` deciding whether it owns:  its own `owner` signal may not have landed yet.
   */
  resolve(): E.OwnerMatch | undefined {
    if (!this.isDirect) return PartContext.ownerFor(this.host, this.noun, this.barrier)
    const root = this.host.getRootNode()
    // `localName`, not `instanceof HTMLSlotElement`:  no such global in node (the server render)
    return PartContext.ownerFor(
      this.host,
      this.noun,
      (element) => element.localName !== "slot" && element.getRootNode() === root
    )
  }

  /** Resolve again, this element only. */
  private update() {
    this.owner = this.resolve()
  }

  ////////////////
  // ## Registry
  ////////////////

  /**
   * Record a defined element:  its owner nouns (from `ownsParts`, under the tag it was defined as) and whether
   * it is a part, which makes it transparent to other parts' climbs.
   * - `isConditionalOwner`:  its controller decides per instance (`ConditionalOwner`).
   * - Called by `UIElement.register()` for every tag, translated aliases included.
   * - Static:  the registry is page-wide, filled before any instance exists.
   */
  static define({ vocabulary, tag, isAPart, isConditionalOwner = false }: E.PartDefinition) {
    PartContext.definedTags.add(tag)
    if (isAPart) PartContext.partTags.add(tag)
    if (isConditionalOwner) PartContext.conditionalTags.add(tag)
    for (const noun of vocabulary.ownsParts ?? []) {
      let owners = PartContext.owners.get(noun)
      if (!owners) PartContext.owners.set(noun, (owners = new Map()))
      owners.set(tag, vocabulary.noun)
    }
  }

  /**
   * Nearest owner of `element` as part `noun`, from the page-wide registry, read from the DOM now (untracked).
   * - The climb every `PartContext` makes (barriers, conditional owners), for code without one:  a native
   *   fallback (`ContentPartFallback`) knows every defined owner, translated tags included.
   * - `barrier`:  default `isBarrier()`.
   * - Static:  needs no instance, only the registry.
   */
  static ownerFor(
    element: Element,
    noun: string,
    barrier: (element: Element) => boolean = PartContext.isBarrier
  ): E.OwnerMatch | undefined {
    const owners = PartContext.owners.get(noun)
    if (!owners?.size) return undefined
    return untrack(() => E.OwnerContext.find(element, PartContext.lookupFor(noun, owners), { barrier }))
  }

  /**
   * Controller of `match`'s owner element, or `undefined`;  `C` unchecked, as `ownerController()`'s.
   * - Static:  also for a match `resolve()` just read, untracked (`<ui-item>` deciding whether it owns its parts).
   */
  static controllerFor<C extends object = E.UIElement>(match: E.OwnerMatch | undefined): C | undefined {
    return (match?.owner as E.UIHost | undefined)?.controller as C | undefined
  }

  /**
   * Does the climb stop at `element`?  Yes for a registered component that isn't a part.
   * - Static:  a default `barrier`, passed around as a value (`this: void`).
   */
  static isBarrier(this: void, element: Element): boolean {
    return PartContext.definedTags.has(element.localName) && !PartContext.partTags.has(element.localName)
  }

  /**
   * A climb that never stops before the root:  for owners nesting through any component (`<ui-section>`).
   * - Static:  a `barrier` passed around as a value (`this: void`).
   */
  static noBarrier(this: void, _element: Element): boolean {
    return false
  }

  /**
   * A slot's assignment changed:  re-resolve every element that entered or left it, and their part descendants.
   * - The registry keeps what each slot held before (`lastAssigned`), since leavers aren't in
   *   `assignedElements()` any more.
   * - Static:  `UIElement` calls it for any slot in its shadow root, whichever parts it holds.
   */
  static slotChanged(slot: HTMLSlotElement) {
    const now = slot.assignedElements({ flatten: true })
    const before = PartContext.lastAssigned.get(slot) ?? []
    PartContext.lastAssigned.set(slot, now)
    for (const element of new Set([...before, ...now])) {
      const context = PartContext.contexts.get(element)
      if (context) context.refresh()
      else for (const inner of element.querySelectorAll("*")) PartContext.contexts.get(inner)?.refresh()
    }
  }

  /** Forget every defined tag and live context, for tests. */
  static reset() {
    PartContext.owners.clear()
    PartContext.definedTags.clear()
    PartContext.partTags.clear()
    PartContext.conditionalTags.clear()
    PartContext.contexts = new WeakMap()
    PartContext.lastAssigned = new WeakMap()
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * What `OwnerContext.find()` asks about each element of the climb, for part `noun`:  `owners` itself, or -- once
   * any conditional owner is defined -- a function asking a conditional owner whether it owns `noun` now.
   */
  private static lookupFor(noun: string, owners: ReadonlyMap<string, string>): E.OwnerLookup {
    if (!PartContext.conditionalTags.size) return owners
    return (tag, element) => {
      const ownerNoun = owners.get(tag)
      if (!ownerNoun || !PartContext.conditionalTags.has(tag)) return ownerNoun
      const controller = (element as E.UIHost).controller as Partial<E.ConditionalOwner> | undefined
      return controller?.isOwnerOf?.(noun) ? ownerNoun : undefined
    }
  }

  ////////////////
  // ## Page-wide registry
  ////////////////

  /** Part noun => (tag => owner noun). */
  private static readonly owners = new Map<string, Map<string, string>>()

  /** Every tag a `UIElement` was defined as. */
  private static readonly definedTags = new Set<string>()

  /** Tags of elements that resolve an owner as a generic part (transparent to other parts). */
  private static readonly partTags = new Set<string>()

  /** Tags of conditional owners (`ConditionalOwner`):  owners only while their controller says so. */
  private static readonly conditionalTags = new Set<string>()

  /**
   * Live context per host, for `slotChanged()` / cascades.
   * - Not `readonly`:  a `WeakMap` can't be cleared, so `reset()` replaces it.
   */
  private static contexts = new WeakMap<Element, PartContext>()

  /**
   * Last assignment seen per slot, so leavers are refreshed too.
   * - Not `readonly`, as `contexts`.
   */
  private static lastAssigned = new WeakMap<HTMLSlotElement, Element[]>()
}

/** Constructor props for `PartContext`. */
export type PartContextProps = {
  /** The element acting as a part. */
  host: E.UIHost
  /** Its part noun, resolved against `ownsParts`, e.g. `header`. */
  noun: string
  /** Only the flat-tree parent component counts (`<ui-icon>` in `<ui-icons>`). */
  isDirect?: boolean
  /**
   * Where the climb stops, ignored with `isDirect`;  default `PartContext.isBarrier` (any registered non-part
   * component).
   * - `<ui-section>` passes `PartContext.noBarrier`:  a section inside a segment inside a section is still nested.
   */
  barrier?: (element: Element) => boolean
}
