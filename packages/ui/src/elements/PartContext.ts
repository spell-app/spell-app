import { createEffect, onSettled, untrack } from "solid-js"
import { isServer } from "@solidjs/web"
import { onConnect } from "@spell-app/solid-element"

import type { ComponentVocabulary } from "$/ui/vocabulary"

import type { ConditionalOwner, OwnerMatch } from "./elements.types"
import { OwnerContext } from "./OwnerContext"
import { Cell } from "./Cell"
import type { UIHost } from "./UIHost"

/**
 * The OWNER of one element acting as a generic content part (`<ui-header>` in a card, `<ui-detail>` in a label,
 * `<ui-label>` in a statistic, `<ui-icon>` in `<ui-icons>`), plus the page-wide registry of who owns what.
 * - Resolution is `OwnerContext.find()` over the flat tree, with a `barrier` at every registered NON-part
 *   component:  a header inside a segment inside a card stays standalone, as Fomantic's child combinators have it.
 * - `direct` mode (icons):  only the flat-tree parent component counts, skipping its own shadow internals
 *   (`.ui.icons > .icon`).
 * - CONDITIONAL owners (`ConditionalOwner`, a part whose controller has `ownsPart()`):  asked during the climb,
 *   transparent while they say no -- `<ui-item>` owns its content parts in the Items view only.
 * - SIDE EFFECT:  keeps `:state(in-<owner>)` on the host in step with `owner`, via an effect;  NEVER the static
 *   `in-<owner>` class.
 * - Re-resolves on:
 *   - every connect after the first (`keepAlive` keeps the controller across moves, so a part re-parented into
 *     another owner hears it through the fork's `onConnect`), a microtask late:  the hook may run inside a
 *     Solid render, where the signal write would throw
 *   - `slotchange` in any `UIElement`'s shadow root, for the elements entering AND leaving that slot
 *     (`UIElement` calls `PartContext.slotChanged()`), cascading to part descendants
 *   - once after the first settle, for owners whose shadow rendered after this part connected
 * - NOTE: no platform event says "my assigned slot changed";  a FOREIGN component re-slotting a part
 *   isn't seen until the part reconnects.
 * - MUST be created under the element's owner (field initializer / constructor):  it creates a signal and an effect.
 */
export class PartContext {
  /** Nearest owner, or `undefined` when standalone;  tracked. */
  readonly owner: Cell<OwnerMatch | undefined>

  /** The element. */
  readonly host: UIHost

  /** Part noun resolved against `ownsParts`, e.g. `header`. */
  readonly noun: string

  /** Only the flat-tree parent component counts. */
  private readonly direct: boolean

  /** Where the climb stops;  default `PartContext.isBarrier`. */
  private readonly barrier: (element: Element) => boolean

  constructor(host: UIHost, noun: string, { direct = false, barrier = PartContext.isBarrier }: PartContextProps = {}) {
    this.host = host
    this.noun = noun
    this.direct = direct
    this.barrier = barrier
    this.owner = new Cell(this.find(), { equals: PartContext.sameOwner })
    CONTEXTS.set(host, this)
    // the server build runs an effect's compute only, never its apply:  set the state now
    if (isServer) {
      const ownerNoun = untrack(() => this.ownerNoun())
      if (ownerNoun) host.setState(OwnerContext.stateName(ownerNoun), true)
    }
    createEffect(
      () => this.owner.get()?.ownerNoun,
      (ownerNoun) => {
        if (!ownerNoun) return
        const state = OwnerContext.stateName(ownerNoun)
        host.setState(state, true)
        return () => host.setState(state, false)
      }
    )
    onSettled(() => {
      this.refresh()
      return () => {
        if (CONTEXTS.get(host) === this) CONTEXTS.delete(host)
      }
    })
    let first = true
    onConnect(() => {
      if (first) first = false
      else queueMicrotask(() => this.refresh())
    })
  }

  /** Owner noun (`card`), or `undefined`;  tracked. */
  ownerNoun(): string | undefined {
    return this.owner.get()?.ownerNoun
  }

  /**
   * Resolve again, e.g. after re-slotting;  cascades to part descendants in the light DOM, which climb through
   * this element.
   * - MUST NOT run in an owned scope (it writes a signal).
   */
  refresh() {
    this.update()
    for (const element of this.host.querySelectorAll("*")) CONTEXTS.get(element)?.update()
  }

  /** Resolve again, this element only. */
  private update() {
    this.owner.set(this.find())
  }

  /**
   * Nearest owner, read from the DOM now (untracked), without updating `owner`.
   * - For a `ConditionalOwner` deciding whether it owns:  its own `owner` signal may not have landed yet.
   */
  resolve(): OwnerMatch | undefined {
    return this.find()
  }

  /** Nearest owner, read from the DOM now. */
  private find(): OwnerMatch | undefined {
    if (!this.direct) return PartContext.ownerOf(this.host, this.noun, this.barrier)
    const root = this.host.getRootNode()
    // `localName`, not `instanceof HTMLSlotElement`:  no such global in node (the server render)
    return PartContext.ownerOf(
      this.host,
      this.noun,
      (element) => element.localName !== "slot" && element.getRootNode() === root
    )
  }

  ////////////////
  // ## Registry
  ////////////////

  /**
   * Record a defined element:  its owner nouns (from `ownsParts`, under the tag it was defined as) and whether
   * it is a part, which makes it transparent to other parts' climbs.
   * - `conditional`:  its controller decides per instance (`ConditionalOwner`).
   * - Called by `UIElement.define()` for every tag, translated aliases included.
   */
  static define(vocabulary: ComponentVocabulary, tag: string, isPart: boolean, conditional = false) {
    TAGS.add(tag)
    if (isPart) PART_TAGS.add(tag)
    if (conditional) CONDITIONAL.add(tag)
    for (const noun of vocabulary.ownsParts ?? []) {
      let owners = OWNERS.get(noun)
      if (!owners) OWNERS.set(noun, (owners = new Map()))
      owners.set(tag, vocabulary.noun)
    }
  }

  /** Tag => owner noun of every element owning `noun`. */
  static ownersOf(noun: string): ReadonlyMap<string, string> {
    return OWNERS.get(noun) ?? EMPTY
  }

  /**
   * Nearest owner of `element` as part `noun`, from the page-wide registry, read from the DOM now (untracked).
   * - The climb every `PartContext` makes (barriers, conditional owners), for code without one:  a native
   *   fallback (`ContentPartFallback`) knows every defined owner, translated tags included.
   * - `barrier`:  default `isBarrier()`.
   */
  static ownerOf(
    element: Element,
    noun: string,
    barrier: (element: Element) => boolean = PartContext.isBarrier
  ): OwnerMatch | undefined {
    const owners = PartContext.ownersOf(noun)
    if (!owners.size) return undefined
    const lookup = CONDITIONAL.size
      ? (tag: string, owner: Element) => PartContext.ownerNoun(owners, tag, owner, noun)
      : owners
    return untrack(() => OwnerContext.find(element, lookup, { barrier }))
  }

  /** Does the climb stop at `element`?  Yes for a registered component that isn't a part. */
  static isBarrier(this: void, element: Element): boolean {
    return TAGS.has(element.localName) && !PART_TAGS.has(element.localName)
  }

  /** A climb that never stops before the root:  for owners nesting through any component (`<ui-section>`). */
  static noBarrier(this: void, _element: Element): boolean {
    return false
  }

  /**
   * A slot's assignment changed:  re-resolve every element that entered or left it, and their part descendants.
   * - `previous` is what the slot held before, since leavers aren't in `assignedElements()` any more.
   */
  static slotChanged(slot: HTMLSlotElement) {
    const now = slot.assignedElements({ flatten: true })
    const before = ASSIGNED.get(slot) ?? []
    ASSIGNED.set(slot, now)
    for (const element of new Set([...before, ...now])) {
      const context = CONTEXTS.get(element)
      if (context) context.refresh()
      else for (const inner of element.querySelectorAll("*")) CONTEXTS.get(inner)?.refresh()
    }
  }

  /** Owner noun of `element` (tag `tag`) per `owners`;  a conditional owner is asked whether it owns `noun` now. */
  private static ownerNoun(
    owners: ReadonlyMap<string, string>,
    tag: string,
    element: Element,
    noun: string
  ): string | undefined {
    const ownerNoun = owners.get(tag)
    if (!ownerNoun || !CONDITIONAL.has(tag)) return ownerNoun
    const controller = (element as UIHost).controller as Partial<ConditionalOwner> | undefined
    return controller?.ownsPart?.(noun) ? ownerNoun : undefined
  }

  /** Same owner element and noun:  no state change. */
  private static sameOwner(a: OwnerMatch | undefined, b: OwnerMatch | undefined) {
    return a?.owner === b?.owner && a?.ownerNoun === b?.ownerNoun && a?.depth === b?.depth
  }
}

/** Constructor props for `PartContext`. */
export type PartContextProps = {
  /** Only the flat-tree parent component counts (`<ui-icon>` in `<ui-icons>`). */
  direct?: boolean
  /**
   * Where the climb stops, ignored with `direct`;  default `PartContext.isBarrier` (any registered non-part
   * component).
   * - `<ui-section>` passes `PartContext.noBarrier`:  a section inside a segment inside a section is still nested.
   */
  barrier?: (element: Element) => boolean
}

/** Part noun => (tag => owner noun). */
const OWNERS = new Map<string, Map<string, string>>()

/** Every tag a `UIElement` was defined as. */
const TAGS = new Set<string>()

/** Tags of elements that resolve an owner as a generic part (transparent to other parts). */
const PART_TAGS = new Set<string>()

/** Tags of conditional owners (`ConditionalOwner`):  owners only while their controller says so. */
const CONDITIONAL = new Set<string>()

/** Live context per host, for `slotChanged()` / cascades. */
const CONTEXTS = new WeakMap<Element, PartContext>()

/** Last assignment seen per slot, so leavers are refreshed too. */
const ASSIGNED = new WeakMap<HTMLSlotElement, Element[]>()

/** Shared empty lookup. */
const EMPTY: ReadonlyMap<string, string> = new Map()
