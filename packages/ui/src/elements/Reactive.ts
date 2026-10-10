import {
  createEffect,
  createMemo,
  createSignal,
  getObserver,
  getOwner,
  untrack,
  type Accessor,
  type Signal
} from "solid-js"
import { isServer } from "@solidjs/web"

import { afterSolidUpdate, camelCase } from "$/ui/util"
import type { E } from "$/ui/core"

/****************
 * ### `Reactive`
 * The reactive members of a component (or of any class):  decorators over ONE record per instance,
 * so a member reads and writes like a plain property, fresh at once, and Solid still follows it.
 * - `@state accessor isOpen = false`:  the value lives in the instance's record, read and written synchronously
 *   (`this.isOpen = true;  this.isOpen` is `true`, no flush).
 *   - A Solid listener reading it (JSX, an effect, a memo) also reads a NOTIFIER signal,
 *     made on the first tracked read, which every real change sets.
 * - `@controlled("open") accessor isOpen = false`:  the DOM element's property when set, else the starting value.
 *   - Writes go to the DOM element's property (and reflect).
 *   - A user change is `requestChange("isOpen", next, announce)`.
 * - `@derived get rows()`:  a self-tracking cache, NOT a Solid memo
 *   (a memo hears of a change through a staged signal, so a read right after a write would give the OLD value).
 *   - While it computes, every record member it reads registers with the version it saw;
 *     a read checks those versions and recomputes only when one moved.
 *   - It MUST read only record members:
 *     `@state`, `@controlled`, vocabulary getters, `this.attributes`, other `@derived`.
 *     Anything else (a `Cell`, a Solid signal, `UI.browser`, a module global) can't be seen changing outside Solid:
 *     move it into the record, or make the member a plain getter.
 *   - `@derived({ equals })`:  an equal result keeps the old value (`isSameList` for a filtered list).
 * - `@cssState("open")` on a getter or accessor:  `UIComponent` keeps `:state(open)` in step with it.
 *   - `@cssStates("disabled", "loading")` on the CLASS:
 *     `:state(x)` follows attribute `x`, for states that only mirror their attribute (no getter to write).
 * - `@aria("ariaBusy")` on a getter or accessor:  the DOM element's `internals.ariaBusy` follows it
 *   (`true` => `"true"`;  `false`, `undefined` => removed).
 *   - Stacks with `@cssState`.
 *   - A value that never changes is `elementSetup.aria` instead.
 * - `@onChange("a", "b") onXChanged(a, b)`:
 *   an effect reading the named members, calling the method with their values;  a function it returns is the cleanup.
 *   - Created by `Reactive.startEffects()`, after every field exists.
 *   - The method runs only when a member's value changed.
 * - `@whileConnected watchX()`:  runs each time the element connects;
 *   a function it returns is the cleanup, run when it disconnects.  Sugar over `@onChange("isConnected")`.
 * - `@fromContent({ childList: true, subtree: true }) get slotted()`:
 *   a member read from the DOM element's light DOM, recomputed when that changes
 *   (ONE `MutationObserver` per instance, from the member's first read in a browser).
 *   - On a method instead:  the method is called on each change, from `startEffects()` on.
 * - `@on("command") onCommand(event)`:  a listener on the DOM element for the element's whole life,
 *   added by `UIComponent`'s constructor (`Reactive.listenersOf()`);  the method runs untracked.
 * - `@untracked select(option)`:  the method's body runs inside `untrack()`,
 *   so an action or a handler reads members without `untrack(() => this.x)` around each read.
 *   On a getter too (`@untracked get cssDuration()`).
 * - `Reactive.accessorsOf(instance)` (a component's `$`):
 *   `$.isOpen` is an `Accessor` of `this.isOpen`, for Solid APIs that take one.
 * - Vocabulary getters (`installAttributeGetters()`;  their setters write the DOM element's property)
 *   and raw attributes (`attributesOf()`) are record members too:
 *   - their versions are bumped when the DOM element's `attributeValues` or the DOM attribute changes
 *   - they're notified by the DOM element's change callbacks and a `MutationObserver`
 * - Writes never throw:  a notifier set inside an owned scope (a render, a memo), which Solid 2 forbids,
 *   is deferred to a microtask;  the record is written at once either way.
 * - A leaf of the element core:  imports only Solid and `$/ui/util`,
 *   so element-core classes import its decorators directly (their class definitions read them)
 *   without entering the `E` cycle.
 * - Knows components only by shape (`ComponentShape`).
 ****************/
export class Reactive {
  ////////////////
  // ## The record
  ////////////////

  /** `instance`'s record, made on first use. */
  static recordOf(instance: object): ReactiveRecord {
    return ((instance as Recorded)[RECORD] ??= { values: {}, sources: new Map(), caches: new Map() })
  }

  /**
   * A `$` for `instance`:  `$.x` is an `Accessor` of `instance.x` (tracked, as `instance.x` is), made once per name.
   * - For Solid APIs that take an accessor:  `createMemo(this.$.isOpen)`, `new E.IconGlyph({ name: this.$.icon })`.
   */
  static accessorsOf<T extends object>(instance: T): Accessors<T> {
    const record = Reactive.recordOf(instance)
    return (record.accessors ??= new Proxy({} as Record<PropertyKey, Accessor<unknown>>, {
      get: (cache, name) => (cache[name] ??= () => (instance as Record<PropertyKey, unknown>)[name])
    })) as Accessors<T>
  }

  ////////////////
  // ## Attributes
  ////////////////

  /**
   * Give `prototype` a getter and a setter per attribute (keyed by its camelCase canonical `key`):
   * - the getter reads the CONVERTED value fresh from the DOM element's `attributeValues`
   * - the setter writes the DOM ELEMENT's PROPERTY under this tag's name for it
   *   (`el.indeterminate`, a translated tag's own property),
   *   which reflects and converts like any property write;  `undefined` clears it
   * - Skips a name the prototype chain already has (a method, a getter, `isOpen` ...):  the class's own member wins.
   *   - An instance field of that name shadows both instead.
   * - Idempotent per prototype.
   */
  static installAttributeGetters(prototype: object, attributes: readonly AttributeNames[]) {
    if (Reactive.withGetters.has(prototype)) return
    Reactive.withGetters.add(prototype)
    for (const { key, name } of attributes) {
      if (key in prototype) continue
      Object.defineProperty(prototype, key, {
        get(this: ComponentShape) {
          return Reactive.attributeValue(this, key)
        },
        set(this: ComponentShape, value: unknown) {
          ;(this.domElement as unknown as Record<string, unknown>)[this.elementDefinition.attribute(name).property] =
            value
        },
        configurable: true
      })
    }
  }

  /** Converted value of attribute `key` on `component`'s DOM element, fresh;  tracked as a record member. */
  static attributeValue(component: ComponentShape, key: string): unknown {
    if (collecting || getObserver()) {
      const record = Reactive.recordOf(component)
      let source = record.sources.get(ATTRIBUTE_PREFIX + key) as AttributeSource | undefined
      if (!source) {
        record.sources.set(ATTRIBUTE_PREFIX + key, (source = new AttributeSource(component, key)))
        watchAttributeValues(record, component)
      }
      reading(source)
    }
    return attributeValueNow(component, key)
  }

  /**
   * The DOM element's attributes as the DOM has them:  raw strings, `null` when absent (a platform boundary).
   * - Tracked as record members:
   *   a `MutationObserver` watches the DOM element, made on the first tracked read in a browser.
   * - Internal:  for attributes outside the vocabulary (`aria-label`, `title`);  vocabulary attributes have getters.
   * - `rename(name)`:  the attribute to read for `name`, e.g. a translated tag's own name for a canonical one
   *   (`attributes.value` reads `valor`);  default `name` itself.
   * - Watches for the element's whole life (`keepAlive`), until the DOM element is released.
   */
  static attributesOf(
    owner: object,
    domElement: AttributeElement,
    rename: (name: string) => string = sameName
  ): Readonly<Record<string, string | null>> {
    const record = Reactive.recordOf(owner)
    return (record.attributes ??= new Proxy({} as Record<string, string | null>, {
      get: (_target, name) => {
        if (typeof name !== "string") return undefined
        const attribute = rename(name)
        if (collecting || getObserver()) reading(rawAttributeSource(record, domElement, attribute))
        return domElement.getAttribute(attribute)
      }
    }))
  }

  ////////////////
  // ## Effects
  ////////////////

  /**
   * Start `instance`'s effects:
   * 1. its `@onChange` / `@whileConnected` effects, most-derived class first (as `onMount()` overrides ran before)
   * 2. ONE effect for all its `@aria` members
   * 3. the light DOM watch for its `@fromContent` methods
   * - MUST run under the instance's owner, once every field exists:
   *   `UIComponent.onMount()`, or a helper class's constructor (`PartContext`).
   * - Server:  an effect marked `writesDOMElement`, and the `@aria` one, apply once, now
   *   (the server build never runs an effect's apply);  the rest aren't created, and nothing watches the light DOM.
   * - The method runs untracked (inside `untrack()`):
   *   it reacts to the members it names, never to what else it reads.
   * - The method runs only when a member's VALUE changed (`===`, member by member):
   *   a memo with `equals` sits between the reads and the effect.
   *   - Why:  Solid 2 (rc.13) runs an effect's apply on EVERY re-run of its compute, equal value or not,
   *     and a getter or `@derived` member tracks the sources UNDER it,
   *     so its effect re-runs whenever any of them moves.
   *   - Skipping inside the apply would be too late:  Solid has run the previous cleanup by then.
   */
  static startEffects(instance: object) {
    const self = instance as Record<PropertyKey, unknown>
    for (const entry of Reactive.listFor<OnChangeEntry>(instance, ON_CHANGE)) {
      const { method, members, writesDOMElement, defer, whileConnected } = entry
      const compute = () => members.map((member) => self[member])
      const apply = (values: unknown[]) => {
        // `@whileConnected`:  only while connected, and the method takes no values
        if (whileConnected && !values[0]) return undefined
        const call = () => (self[method] as (...values: unknown[]) => unknown)(...(whileConnected ? [] : values))
        const cleanup = untrack(call)
        return typeof cleanup === "function" ? (cleanup as () => void) : undefined
      }
      if (isServer) {
        if (writesDOMElement && !defer) apply(untrack(compute))
      } else createEffect(createMemo(compute, { equals: isSameList }), apply, { defer })
    }
    Reactive.startAriaEffect(instance as ComponentShape, self)
    if (isServer) return
    for (const { method, options } of Reactive.listFor<ContentMethodEntry>(instance, CONTENT_METHODS)) {
      const call = (mutations: MutationRecord[]) => (self[method] as (mutations: MutationRecord[]) => void)(mutations)
      watchContent(instance as ContentShape, options, call)
    }
  }

  /**
   * The `@aria` members' effect:  each member's value, as ARIA text, written to the DOM element's `internals`.
   * - For a property two classes of the chain name, only the subclass's member counts (`listFor()`).
   * - None when the class has no `@aria` member.
   */
  private static startAriaEffect(component: ComponentShape, self: Record<PropertyKey, unknown>) {
    const entries = Reactive.listFor<AriaEntry>(component, ARIA, { claims: (entry) => entry.property })
    if (!entries.length) return
    const compute = () => entries.map(({ member }) => ariaText(self[member] as AriaValue))
    const apply = (texts: (string | null)[]) => {
      const internals = component.domElement.internals as unknown as Record<E.AriaProperty, string | null>
      entries.forEach(({ property }, index) => (internals[property] = texts[index]!))
    }
    if (isServer) apply(untrack(compute))
    else createEffect(createMemo(compute, { equals: isSameList }), apply)
  }

  /**
   * `@cssState` members and `@cssStates` attributes of `instance`'s class chain, most-derived first:
   * `{ member, state }`.
   * - For a state two classes of the chain name, only the subclass's.
   */
  static cssStatesOf(instance: object): readonly CssStateEntry[] {
    return Reactive.listFor<CssStateEntry>(instance, CSS_STATES, { claims: (entry) => entry.state })
  }

  ////////////////
  // ## Listeners
  ////////////////

  /**
   * `@on` methods of `instance`'s class chain (`{ method, type, options }`), BASE class first.
   * - Each class's in declaration order:  the order the listeners are added, as when each constructor added its own.
   * - A method decorated again in a subclass (an override) is listed once, where the base class listed it.
   * - `UIComponent`'s constructor adds them;  a helper class may too, under its own `on()`.
   */
  static listenersOf(instance: object): readonly ListenerEntry[] {
    return Reactive.listFor<ListenerEntry>(instance, LISTENERS, { combine: baseFirstOnce })
  }

  ////////////////
  // ## `@controlled`
  ////////////////

  /** Is the DOM element controlling `@controlled` member `member` right now (its property set)?  Untracked. */
  static isControlledByPage(component: ComponentShape, member: string): boolean {
    const { key } = Reactive.controlledAttribute(component, member)
    return untrack(() => attributeValueNow(component, key)) !== undefined
  }

  /**
   * A user change of `@controlled` member `member` to `next`:  `announce()` dispatches the event first, then
   *   - a vetoed (cancelable) event changes nothing
   *   - if the DOM element set the property DURING the event (re-set the old value in a `ui-change` handler),
   *     the DOM element's value stands
   *   - otherwise `next` is written to the DOM element's property (and reflects)
   * - Returns true when `next` was applied.
   */
  static requestChange(component: ComponentShape, member: string, next: unknown, announce: () => boolean): boolean {
    const { key } = Reactive.controlledAttribute(component, member)
    const writes = watchPropertyWrites(Reactive.recordOf(component), component)
    const before = writes[key] ?? 0
    if (!announce() || (writes[key] ?? 0) !== before) return false
    ;(component as unknown as Record<string, unknown>)[member] = next
    return true
  }

  /** `@controlled` member `member`'s attribute, resolved against the component's definition. */
  private static controlledAttribute(component: ComponentShape, member: string): E.ResolvedAttribute {
    const name = Reactive.recordOf(component).controlled?.[member]
    if (!name) {
      throw new TypeError(`Reactive:  \`${member}\` isn't a @controlled member;  declare it @controlled("<attribute>")`)
    }
    return component.elementDefinition.attribute(name)
  }

  ////////////////
  // ## Internals
  ////////////////

  /**
   * Entries under `key` in `instance`'s class metadata, own class first, then each base class.
   * - `combine(lists)`:  joins the classes' own lists (own class first) into one;  default end to end.
   * - Walked once per class and key (`lists`):  each class's metadata object inherits its base class's.
   * - `claims(entry)`:  what an entry is FOR (a state, an ARIA property);
   *   a later entry claiming the same is dropped, so a subclass's entry wins over its base class's.
   */
  private static listFor<T>(
    instance: object,
    key: symbol,
    { combine = ownFirst, claims }: { combine?: (lists: T[][]) => T[]; claims?: (entry: T) => unknown } = {}
  ): readonly T[] {
    const metadata = (instance.constructor as unknown as Record<symbol, Metadata | undefined>)[METADATA]
    if (!metadata) return []
    let byKey = Reactive.lists.get(metadata)
    if (!byKey) Reactive.lists.set(metadata, (byKey = new Map()))
    let list = byKey.get(key)
    if (!list) {
      const lists: T[][] = []
      for (let current: Metadata | null = metadata; current; current = Object.getPrototypeOf(current)) {
        if (Object.hasOwn(current, key)) lists.push(current[key] as T[])
      }
      list = combine(lists)
      if (claims) {
        const claimed = new Set<unknown>()
        list = list.filter((entry) => {
          const claim = claims(entry as T)
          if (claimed.has(claim)) return false
          claimed.add(claim)
          return true
        })
      }
      byKey.set(key, list)
    }
    return list as T[]
  }

  /**
   * `listFor()`'s lists, by class metadata, then key.
   * - Static:  per class, page-wide;  a class's decorators never change after it's defined.
   */
  private static readonly lists = new WeakMap<object, Map<symbol, unknown[]>>()

  /**
   * Prototypes given attribute getters already.
   * - Static:  page-wide, one entry per component class (and per hot-reloaded version of one).
   */
  private static readonly withGetters = new WeakSet<object>()
}

/****************
 * ### Decorators
 ****************/

/**
 * `@state accessor x = v`:  reactive state, in the instance's record -- see `Reactive`.
 * - `@state({ equals, ownedWrite })`:
 *   - `equals(old, next)` true skips the write (default `===`;  `false`:  every write notifies)
 *   - `ownedWrite` lets a write inside an owned scope notify at once instead of a microtask later
 *     (Solid's option, for state written by design while a render runs)
 * - Works on `static accessor` too (`RootSettings.generation`):  the record is the class's.
 */
export function state<This extends object, T>(
  target: ClassAccessorDecoratorTarget<This, T>,
  context: ClassAccessorDecoratorContext<This, T>
): ClassAccessorDecoratorResult<This, T>
export function state(options: StateOptions): typeof state
export function state<This extends object, T>(
  targetOrOptions: ClassAccessorDecoratorTarget<This, T> | StateOptions,
  context?: ClassAccessorDecoratorContext<This, T>
): ClassAccessorDecoratorResult<This, T> | typeof state {
  if (!context) {
    const options = targetOrOptions as StateOptions
    return ((target: ClassAccessorDecoratorTarget<This, T>, inner: ClassAccessorDecoratorContext<This, T>) =>
      stateAccessor(inner, options)) as typeof state
  }
  return stateAccessor(context, {})
}

/**
 * `@controlled("open") accessor isOpen = false`:  auto-controlled state for attribute `open` --
 * the DOM element's property when set (its converted value isn't `undefined`), else the starting value.
 * - A write goes to the DOM element's PROPERTY (and reflects), so `el.open` is always current, like a native control.
 * - A write of `undefined` hands control back to the starting value:  a silent write, e.g. a form reset.
 * - A user change:  `this.requestChange("isOpen", next, () => this.send(...))` (`UIComponent`).
 * - Why watch the property instead of comparing values:  a DOM element re-setting the SAME value is still a decision.
 * - Components only (`ComponentShape`):  it reads the definition and the DOM element.
 */
export function controlled(attribute: string) {
  return function <This extends ComponentShape, T>(
    _target: ClassAccessorDecoratorTarget<This, T>,
    context: ClassAccessorDecoratorContext<This, T>
  ): ClassAccessorDecoratorResult<This, T> {
    const member = context.name as string
    return {
      get(this: This): T {
        const { key } = this.elementDefinition.attribute(attribute)
        const pageValue = Reactive.attributeValue(this, key)
        return (pageValue === undefined ? Reactive.recordOf(this).values[member] : pageValue) as T
      },
      set(this: This, next: T) {
        const { property } = this.elementDefinition.attribute(attribute)
        ;(this.domElement as unknown as Record<string, unknown>)[property] = next
      },
      init(this: This, initial: T): T {
        const record = Reactive.recordOf(this)
        record.values[member] = initial
        ;(record.controlled ??= {})[member] = attribute
        // a BASE class's field starts before its constructor sets `domElement` (`UIComponent.isVisible`):
        // then `requestChange()` starts the count
        if (this.domElement) watchPropertyWrites(record, this)
        return initial
      }
    }
  }
}

/** Count the DOM element's property writes, by key, for `requestChange()`;  once per record.  Returns the counts. */
function watchPropertyWrites(record: ReactiveRecord, component: ComponentShape): Record<string, number> {
  if (record.propertyWrites) return record.propertyWrites
  const writes: Record<string, number> = (record.propertyWrites = {})
  component.domElement.addPropertyChangedCallback((key: string) => {
    writes[key] = (writes[key] ?? 0) + 1
  })
  return writes
}

/**
 * `@derived get x()`:  a self-tracking cache -- see `Reactive`.
 * - For a getter doing real work (loops, parsing, new DOM);  a cheap one stays a plain getter, already fresh.
 * - Recomputes on read when a record member it read last time changed;  else returns the same value (`===`).
 * - `@derived({ equals })`:  `equals(old, next)` true keeps the OLD value,
 *   e.g. `{ equals: E.isSameList }` for a filtered list.
 *   Same identity, so readers (an outer `@derived`, an `@onChange`) see no change.
 */
export function derived<This extends object, T>(
  getter: (this: This) => T,
  context: ClassGetterDecoratorContext<This, T>
): (this: This) => T
export function derived(options: DerivedOptions): typeof derived
export function derived<This extends object, T>(
  getterOrOptions: ((this: This) => T) | DerivedOptions,
  context?: ClassGetterDecoratorContext<This, T>
): ((this: This) => T) | typeof derived {
  if (!context) {
    const { equals } = getterOrOptions as DerivedOptions
    return ((getter: (this: This) => T, inner: ClassGetterDecoratorContext<This, T>) =>
      derivedGetter(getter, inner.name, equals)) as typeof derived
  }
  return derivedGetter(getterOrOptions as (this: This) => T, context.name)
}

/** `@derived`'s getter for member `name`. */
function derivedGetter<This extends object, T>(
  getter: (this: This) => T,
  name: PropertyKey,
  equals: (a: any, b: any) => boolean = isSame
): (this: This) => T {
  return function (this: This): T {
    const record = Reactive.recordOf(this)
    let cache = record.caches.get(name)
    if (!cache) record.caches.set(name, (cache = new DerivedCache(() => getter.call(this), equals)))
    return cache.read() as T
  }
}

/**
 * `@cssState("open")` on a getter or an accessor:  `:state(open)` on the DOM element follows its truthiness.
 * - `UIComponent.onMount()` sets them all in ONE render effect (a throw reaches the error boundary).
 * - A state that only mirrors its attribute:  `@cssStates(...)` on the class, no getter.
 * - A dynamic set of states:  the `cssStates()` hook (a method of `UIComponent`, not this decorator).
 */
export function cssState(stateName: string) {
  return function (_target: unknown, context: ClassGetterDecoratorContext | ClassAccessorDecoratorContext) {
    ownList<CssStateEntry>(context.metadata, CSS_STATES).push({ member: context.name, state: stateName })
  }
}

/**
 * `@cssStates("disabled", "loading")` on a CLASS:
 * `:state(disabled)` follows attribute `disabled` (truthy), and so on.
 * - For a state that only mirrors its attribute, under the attribute's name:
 *   it saves a getter whose whole body would be `return !!this.disabled`.
 * - Reads the class's member of that name, camelCase (`"read-only"` reads `this.readOnly`):
 *   the attribute's getter, unless the class has its own member by that name.
 * - Each name MUST be a member of the class (an attribute):  TypeScript flags a typo.
 * - A state with logic, or a member something else reads (`isDisabled`), stays a getter with `@cssState`.
 */
export function cssStates<const N extends string>(...attributes: N[]) {
  return function <C extends abstract new (...args: any[]) => object>(
    _class: C & (E.CamelCase<N> extends keyof InstanceType<C> ? unknown : "@cssStates:  not a member of this class"),
    context: ClassDecoratorContext<C>
  ) {
    const list = ownList<CssStateEntry>(context.metadata, CSS_STATES)
    for (const attribute of attributes) list.push({ member: camelCase(attribute), state: attribute })
  }
}

/**
 * `@aria("ariaBusy")` on a getter or an accessor:  the DOM element's `internals.ariaBusy` follows it.
 * - The value, as ARIA text:  `true` => `"true"`;  `false`, `undefined`, `null` => `null` (removed);
 *   a string as is;  a number as text.
 *   - A state whose "off" is spoken (`aria-checked="false"`) returns the string.
 * - Any text property of `ElementInternals`:  `@aria("role")`, `@aria("ariaLabel")`, `@aria("ariaCurrent")` ...
 * - Stacks with `@cssState` on the same getter:
 *   `@cssState("loading") @aria("ariaBusy") get isLoading()` (one decorator a line).
 * - ONE effect per element writes them all (`Reactive.startEffects()`);
 *   a server render applies it once, as `@onChange(..., { writesDOMElement: true })` does.
 * - A value that never changes:  `elementSetup.aria` (`{ role: "listitem" }`), set once, with no effect.
 */
export function aria(property: E.AriaProperty) {
  return function (
    _target: unknown,
    context: ClassGetterDecoratorContext<object, AriaValue> | ClassAccessorDecoratorContext<object, AriaValue>
  ) {
    ownList<AriaEntry>(context.metadata, ARIA).push({ member: context.name, property })
  }
}

/** `@aria`'s value as ARIA text:  `true` => `"true"`;  `false`, `undefined`, `null` => `null`;  else its text. */
function ariaText(value: AriaValue): string | null {
  if (value === true) return "true"
  if (value === false || value === undefined || value === null) return null
  return String(value)
}

/**
 * `@onChange("a", "b") onXChanged(a, b)`:  an effect reading members `a` and `b`,
 * calling the method with their values on start and on every change.
 * - A function it returns is the cleanup, run before the next call and on disposal.
 * - The method runs untracked:  only the named members re-run it, so other reads need no `untrack()`.
 * - A trailing `{ writesDOMElement: true }`:  the method writes the DOM element (`:state()`, `tabindex`, ARIA),
 *   so a server render applies it once, now (the server never runs an effect).
 *   ARIA alone is `@aria`.
 * - A trailing `{ defer: true }`:  NOT called at the start, only on a change
 *   (an event the first draw mustn't send:  `<ui-progress>`'s `ui-change`).
 * - Created by `Reactive.startEffects()` (`UIComponent.onMount()`), after every subclass field exists.
 */
export function onChange(...members: (string | OnChangeOptions)[]) {
  const last = members[members.length - 1]
  const options = typeof last === "object" ? (members.pop() as OnChangeOptions) : {}
  return function (_method: unknown, context: ClassMethodDecoratorContext) {
    ownList<OnChangeEntry>(context.metadata, ON_CHANGE).push({
      method: context.name,
      members: members as string[],
      writesDOMElement: !!options.writesDOMElement,
      defer: !!options.defer
    })
  }
}

/**
 * `@whileConnected watchX()`:  called each time the element connects;
 * a function it returns is the cleanup, run when it disconnects (and when the element is released).
 * - For a listener or an observer on something outside the element (`window`, the document)
 *   that must stop while the element is out of the page.
 * - Sugar over `@onChange("isConnected")`, without the `if (!isConnected) return` line:
 *   created by `Reactive.startEffects()` in the same list, so it keeps its place among a class's `@onChange` methods.
 * - Never on a server:  nothing connects there.
 */
export function whileConnected<This extends object>(
  _method: (this: This) => (() => void) | void,
  context: ClassMethodDecoratorContext<This>
) {
  ownList<OnChangeEntry>(context.metadata, ON_CHANGE).push({
    method: context.name,
    members: ["isConnected"],
    writesDOMElement: false,
    whileConnected: true
  })
}

/**
 * `@fromContent({ childList: true, subtree: true }) get slotted()`:
 * a member read from the DOM element's light DOM, recomputed when that changes.
 * - Options:
 *   - what to watch, as a `MutationObserver` takes it:
 *     `childList`, `subtree`, `characterData`, `attributes`, `attributeFilter`
 *   - `equals(old, next)` true keeps the old value, as `@derived({ equals })`
 * - A getter:  a `@derived` whose sources include the light DOM.
 *   - A change it watches recomputes it at once;
 *     readers (JSX, an effect, an outer `@derived`) hear of it only when the VALUE changed.
 *   - It may read record members too (`this.kind`):  a change to one recomputes it, as `@derived`.
 *   - Watching starts on its first read in a browser, so a value read once is never stale;
 *     on a server it's computed once.
 * - A method:  called with the `MutationRecord`s on each change it watches (not at the start),
 *   from `Reactive.startEffects()` (`UIComponent.onMount()`) on.
 *   For a change that writes other members.
 * - ONE `MutationObserver` per instance for all of them, on `this.domElement`,
 *   disconnected when the DOM element is released (NOT on disconnect:  a moved element keeps up to date).
 * - Needs `this.domElement` (`ContentShape`):  components, not helper classes with their own element.
 */
export function fromContent(options: FromContentOptions) {
  function decorate<This extends ContentShape, T>(
    getter: (this: This) => T,
    context: ClassGetterDecoratorContext<This, T>
  ): (this: This) => T
  function decorate<This extends ContentShape>(
    method: (this: This, mutations: MutationRecord[]) => void,
    context: ClassMethodDecoratorContext<This>
  ): void
  function decorate<This extends ContentShape, T>(
    member: (this: This, ...args: any[]) => T,
    context: ClassGetterDecoratorContext<This, T> | ClassMethodDecoratorContext<This>
  ): ((this: This) => T) | void {
    if (context.kind === "method") {
      ownList<ContentMethodEntry>(context.metadata, CONTENT_METHODS).push({ method: context.name, options })
      return
    }
    const name = context.name
    const { equals = isSame } = options
    return function (this: This): T {
      const record = Reactive.recordOf(this)
      let cache = record.caches.get(name) as ContentCache | undefined
      if (!cache) {
        const created = (cache = new ContentCache(() => member.call(this), equals))
        record.caches.set(name, created)
        if (!isServer) watchContent(this, options, () => created.contentChanged())
      }
      return cache.read() as T
    }
  }
  return decorate
}

/**
 * `@on("command") onCommand(event)`:
 * listen for event `type` on the DOM element, for the element's whole life, as `UIComponent.on()` does.
 * - The method runs UNTRACKED (inside `untrack()`):  a handler reads members to decide what to do,
 *   never to be followed, even when the event was sent from inside a Solid computation.
 * - A plain method, not an arrow-function field:  the listener calls it on its instance.
 * - `protected`, not `private`:  TypeScript can't see the listener call it, and reports a `private` one unused.
 * - `@on("slotchange", { target: "renderRoot" })`:  listen on the shadow root instead.
 *   The other options are `addEventListener()`'s:  `{ capture, passive, once }`.
 * - Added by `UIComponent`'s constructor (`Reactive.listenersOf()`), in a browser only:
 *   a server render sends no events.
 * - Removed when the DOM element is released, NOT when it's moved or disconnected.
 * - A subclass overriding the method keeps the listener (it calls the override);
 *   decorating the override too adds no second one.
 * - A listener that starts later or stops sooner (an effect's) stays a `this.on()` call with its own `AbortController`.
 */
export function on<K extends keyof HTMLElementEventMap>(
  type: K,
  options?: ListenerOptions
): <This>(method: (this: This, event: HTMLElementEventMap[K]) => unknown, context: ClassMethodDecoratorContext) => void
export function on(
  type: string,
  options?: ListenerOptions
): <This>(method: (this: This, event: never) => unknown, context: ClassMethodDecoratorContext) => void
export function on(type: string, options: ListenerOptions = {}) {
  return function (_method: unknown, context: ClassMethodDecoratorContext) {
    if (context.kind !== "method" || context.static) {
      throw new TypeError(`@on ${String(context.name)}:  only works on instance methods;  make it a method`)
    }
    ownList<ListenerEntry>(context.metadata, LISTENERS).push({ method: context.name, type, options })
  }
}

/**
 * `@untracked` on a method:  its body runs inside `untrack()`, so what it reads is never followed by the Solid
 * computation that called it.
 * - For actions and handlers, which read members to decide what to do:
 *   `@E.untracked select(option) { if (!this.hasRoomForMore) return ... }`,
 *   with no `untrack(() => this.hasRoomForMore)` around each read.
 * - On an arrow-function field too, for a handler passed around (`onClick={this.onDimmerClick}`):
 *   `@E.untracked private readonly onDimmerClick = (event: MouseEvent) => { ... }`.
 * - On a getter, for a value read to ACT on, never to follow:
 *   - a setting an animation reads as it starts (`@E.untracked private get cssDuration()`)
 *   - a DOM element's script API over its component (`@E.untracked get errors() { return this.component?.errors ?? [] }`),
 *     so a page's Solid effect reading it doesn't re-run each time it changes.
 *     The whole getter is untracked, a subclass's override of what it calls included.
 * - Writes are the same either way:  `untrack()` changes reads only.
 * - NEVER on a method a computation calls so it updates
 *   (a helper of a getter, of JSX or of an effect's first function):
 *   the computation would stop following those reads.
 * - An `@on` method needs none:  its listener already runs it untracked.
 * - An override in a subclass is untracked only when it's decorated too.
 * - NOT needed in a component's constructor or field initializers:  every component is built inside `untrack()`
 *   (`UIComponent.mount()`, and the static render's `StaticRender`).
 */
export function untracked<This, Args extends unknown[], Result>(
  method: (this: This, ...args: Args) => Result,
  context: ClassMethodDecoratorContext<This, (this: This, ...args: Args) => Result>
): (this: This, ...args: Args) => Result
export function untracked<This, Value>(
  getter: (this: This) => Value,
  context: ClassGetterDecoratorContext<This, Value>
): (this: This) => Value
export function untracked<This, Handler extends (...args: any[]) => unknown>(
  field: undefined,
  context: ClassFieldDecoratorContext<This, Handler>
): (handler: Handler) => Handler
export function untracked(
  method: AnyFunction | undefined,
  context: ClassMethodDecoratorContext | ClassGetterDecoratorContext | ClassFieldDecoratorContext
): AnyFunction {
  const name = String(context.name)
  if (context.kind === "method" || context.kind === "getter") return untrackedCall(method!)
  if (context.kind !== "field" || context.static) {
    throw new TypeError(
      `@untracked ${name}:  only works on methods, getters and arrow-function fields;  untrack() its reads`
    )
  }
  return (handler: unknown) => {
    if (typeof handler !== "function") {
      throw new TypeError(`@untracked ${name}:  the field holds no function;  untrack() its reads instead`)
    }
    return untrackedCall(handler as AnyFunction)
  }
}

/** `fn`, called inside `untrack()`, with the same `this` and arguments. */
function untrackedCall(fn: AnyFunction): AnyFunction {
  return function (this: unknown, ...args: unknown[]) {
    return untrack(() => fn.apply(this, args))
  }
}

/****************
 * ### Sources and caches
 ****************/

/** A member's change source:  a version a cache compares, and the Solid signal a listener reads. */
type Source = {
  /** Bumped on every real change. */
  version: number
  /** Bring `version` up to date first, for sources read from outside (attributes, caches). */
  refresh?(): void
  /** Have the current Solid listener (if any) follow it. */
  track(): void
}

/** A `@state` / `@controlled` member's source:  `changed()` on every real write. */
class Notifier implements Source {
  version = 0

  /** Made on the first tracked read;  nobody listened before it. */
  private signal?: Signal<undefined>

  /** Solid's `ownedWrite`:  see `StateOptions`. */
  private readonly ownedWrite: boolean

  constructor(ownedWrite: boolean) {
    this.ownedWrite = ownedWrite
  }

  track() {
    if (!getObserver()) return
    ;(this.signal ??= createSignal<undefined>(undefined, { equals: false, ownedWrite: this.ownedWrite }))[0]()
  }

  /** The value changed:  bump, and tell Solid. */
  changed() {
    this.version++
    this.tell()
  }

  /** Tell Solid's listeners (if any) to read again. */
  protected tell() {
    const signal = this.signal
    if (signal) notify(() => signal[1]())
  }
}

/**
 * A vocabulary attribute's source:  its version follows the converted value in the DOM element's `attributeValues`,
 * and the DOM element's change callbacks tell Solid (`watchAttributeValues()`).
 * - `ownedWrite`:  the DOM element's property setters write it,
 *   and anyone may call those from anywhere, inside a Solid computation included.
 */
class AttributeSource extends Notifier {
  /** The component whose DOM element has the attribute. */
  private readonly component: ComponentShape

  /** The attribute's key (camelCase canonical). */
  private readonly key: string

  /** Value at the last refresh. */
  private last: unknown

  constructor(component: ComponentShape, key: string) {
    super(true)
    this.component = component
    this.key = key
    this.last = attributeValueNow(component, key)
  }

  refresh() {
    this.hasMoved()
  }

  /** The DOM element wrote the value (equal or not):  if it moved, bump and tell Solid. */
  written() {
    if (this.hasMoved()) this.tell()
  }

  /** Bring `version` up to date;  true when the value moved since the last look. */
  private hasMoved(): boolean {
    const value = attributeValueNow(this.component, this.key)
    if (value === this.last) return false
    this.last = value
    this.version++
    return true
  }
}

/**
 * A raw attribute's source:  its version follows `getAttribute()`;  its signal is set by the DOM element's observer.
 */
class RawAttributeSource extends Notifier {
  /** The element. */
  private readonly domElement: AttributeElement

  /** The attribute. */
  private readonly name: string

  /** Starts the DOM element's observer (once). */
  private readonly startWatching: () => void

  /** Text at the last refresh. */
  private last: string | null

  constructor(domElement: AttributeElement, name: string, startWatching: () => void) {
    super(false)
    this.domElement = domElement
    this.name = name
    this.startWatching = startWatching
    this.last = domElement.getAttribute(name)
  }

  refresh() {
    const text = this.domElement.getAttribute(this.name)
    if (text === this.last) return
    this.last = text
    this.changed()
  }

  track() {
    if (!getObserver()) return
    this.startWatching()
    super.track()
  }
}

/**
 * A `@derived` member's cache:  its value, and the version each source had when it was computed.
 * - A source too:  an outer `@derived` reading it depends on it, through its `version`.
 */
class DerivedCache implements Source {
  version = 0

  /** Last computed value. */
  private value: unknown

  /** Computed at least once? */
  private isComputed = false

  /** What the last compute read, with the version it saw. */
  private dependencies = new Map<Source, number>()

  /** The getter's body, bound to its instance. */
  private readonly compute: () => unknown

  /** `equals(old, next)` true keeps the old value. */
  private readonly equals: (a: unknown, b: unknown) => boolean

  constructor(compute: () => unknown, equals: (a: unknown, b: unknown) => boolean) {
    this.compute = compute
    this.equals = equals
  }

  /** The value, recomputed first when a dependency changed;  registers with an outer cache and Solid. */
  read(): unknown {
    this.refresh()
    collecting?.set(this, this.version)
    if (getObserver()) this.track()
    return this.value
  }

  refresh() {
    if (this.isComputed && !this.isStale()) return
    const outer = collecting
    const dependencies = new Map<Source, number>()
    collecting = dependencies
    let next: unknown
    try {
      next = this.compute()
    } finally {
      collecting = outer
    }
    this.dependencies = dependencies
    if (!this.isComputed || !this.equals(this.value, next)) {
      this.value = next
      this.version++
    }
    this.isComputed = true
  }

  track() {
    for (const source of this.dependencies.keys()) source.track()
  }

  /** Did a dependency move since the last compute? */
  private isStale(): boolean {
    for (const [source, seen] of this.dependencies) {
      source.refresh?.()
      if (source.version !== seen) return true
    }
    return false
  }
}

/**
 * A `@fromContent` getter's cache:  a `DerivedCache` with one more source, the light DOM.
 * - The light DOM's source has a version and no Solid signal:
 *   `contentChanged()` recomputes at once instead, and tells Solid only when the value moved.
 * - Why:  a rescan finding the same thing (a chip's `selected` written back, text re-set)
 *   must not re-run every reader, or a reader writing the light DOM would loop.
 */
class ContentCache extends DerivedCache {
  /** The light DOM's source:  bumped on each change the observer reports. */
  private readonly content: Source

  /** Tells Solid's listeners the value moved. */
  private readonly changes = new Notifier(false)

  constructor(compute: () => unknown, equals: (a: unknown, b: unknown) => boolean) {
    const content: Source = { version: 0, track: () => undefined }
    super(() => {
      reading(content)
      return compute()
    }, equals)
    this.content = content
  }

  track() {
    super.track()
    this.changes.track()
  }

  /** The observer saw a change it watches:  recompute now;  tell Solid if the value moved. */
  contentChanged() {
    this.content.version++
    const before = this.version
    this.refresh()
    if (this.version !== before) this.changes.changed()
  }
}

/** The dependencies the `@derived` computing right now collects, if any. */
let collecting: Map<Source, number> | undefined

/** `source` was read:  bring it up to date, register it with the computing cache, and with Solid's listener. */
function reading(source: Source) {
  source.refresh?.()
  collecting?.set(source, source.version)
  source.track()
}

/**
 * Run a Solid signal write now;
 * inside an owned scope, where Solid 2 throws (`REACTIVE_WRITE_IN_OWNED_SCOPE`), a microtask later.
 * - NEVER throws:  the record is already written, only the notification waits.
 */
function notify(write: () => void) {
  if (!getOwner()) return write()
  try {
    write()
  } catch {
    afterSolidUpdate(write)
  }
}

/** `@state`'s accessor for member `context.name`. */
function stateAccessor<This extends object, T>(
  context: ClassAccessorDecoratorContext<This, T>,
  { equals = isSame, ownedWrite = false }: StateOptions
): ClassAccessorDecoratorResult<This, T> {
  const name = context.name
  const isEqual = equals === false ? isNever : equals
  return {
    get(this: This): T {
      const record = Reactive.recordOf(this)
      if (collecting || getObserver()) reading(notifierFor(record, name, ownedWrite))
      return record.values[name] as T
    },
    set(this: This, next: T) {
      const record = Reactive.recordOf(this)
      if (isEqual(record.values[name], next)) return
      record.values[name] = next
      ;(record.sources.get(name) as Notifier | undefined)?.changed()
    },
    init(this: This, initial: T): T {
      Reactive.recordOf(this).values[name] = initial
      return initial
    }
  }
}

/** Member `name`'s notifier in `record`, made on first use. */
function notifierFor(record: ReactiveRecord, name: PropertyKey, ownedWrite: boolean): Notifier {
  let source = record.sources.get(name) as Notifier | undefined
  if (!source) record.sources.set(name, (source = new Notifier(ownedWrite)))
  return source
}

/**
 * Raw attribute `name`'s source in `record`, made on first use;
 * the DOM element's observer starts on the first tracked read.
 */
function rawAttributeSource(record: ReactiveRecord, domElement: AttributeElement, name: string): RawAttributeSource {
  const key = RAW_PREFIX + name
  let source = record.sources.get(key) as RawAttributeSource | undefined
  if (!source)
    record.sources.set(
      key,
      (source = new RawAttributeSource(domElement, name, () => watchAttributes(record, domElement)))
    )
  return source
}

/** Watch `domElement`'s attributes for `record`'s raw sources, once, until the DOM element is released.  Browser only. */
function watchAttributes(record: ReactiveRecord, domElement: AttributeElement) {
  if (isServer || record.attributeObserver) return
  const observer = (record.attributeObserver = new MutationObserver((mutations) => {
    for (const { attributeName } of mutations) {
      ;(record.sources.get(RAW_PREFIX + attributeName) as RawAttributeSource | undefined)?.refresh()
    }
  }))
  observer.observe(domElement as unknown as Node, { attributes: true })
  domElement.addReleaseCallback?.(() => observer.disconnect())
}

/**
 * Hear every write to `component`'s DOM element's attribute values, once per record,
 * so its attribute sources tell Solid (`AttributeSource.written()`).
 * - Released with the DOM element.
 */
function watchAttributeValues(record: ReactiveRecord, component: ComponentShape) {
  if (record.isWatchingValues) return
  record.isWatchingValues = true
  component.domElement.addPropertyChangedCallback((key: string) => {
    ;(record.sources.get(ATTRIBUTE_PREFIX + key) as AttributeSource | undefined)?.written()
  })
}

/**
 * Call `changed` on each change to `owner.domElement`'s light DOM that `options` watches (`@fromContent`).  Browser only.
 * - ONE `MutationObserver` per owner:
 *   each new watch widens what it observes to the union of every watch's options,
 *   and each mutation batch goes to the watches it matches.
 * - Disconnected when the DOM element is released.
 */
function watchContent(
  owner: ContentShape,
  options: FromContentOptions,
  changed: (mutations: MutationRecord[]) => void
) {
  const record = Reactive.recordOf(owner)
  const { domElement } = owner
  let content = record.content
  if (!content) {
    const watches: ContentWatch[] = []
    const observer = new MutationObserver((mutations) => {
      for (const watch of watches) {
        const matched = mutations.filter((mutation) => isWatched(watch.options, mutation, domElement))
        if (matched.length) watch.changed(matched)
      }
    })
    content = record.content = { observer, watches }
    domElement.addReleaseCallback?.(() => observer.disconnect())
  }
  content.watches.push({ options, changed })
  content.observer.observe(domElement, observedUnion(content.watches))
}

/** Does `mutation` (under `root`) concern a watch with `options`? */
function isWatched(options: FromContentOptions, mutation: MutationRecord, root: Node): boolean {
  if (!options.subtree && mutation.target !== root) return false
  if (mutation.type === "childList") return !!options.childList
  if (mutation.type === "characterData") return !!options.characterData
  const { attributeFilter } = options
  if (attributeFilter) return attributeFilter.includes(mutation.attributeName!)
  return !!options.attributes
}

/** One `MutationObserverInit` covering every watch:  an attribute filter only when every attribute watch has one. */
function observedUnion(watches: readonly ContentWatch[]): MutationObserverInit {
  const all = watches.map((watch) => watch.options)
  const init: MutationObserverInit = {
    childList: all.some((options) => options.childList),
    subtree: all.some((options) => options.subtree),
    characterData: all.some((options) => options.characterData)
  }
  const onAttributes = all.filter((options) => options.attributes || options.attributeFilter)
  if (!onAttributes.length) return init
  if (onAttributes.some((options) => !options.attributeFilter)) return { ...init, attributes: true }
  return { ...init, attributeFilter: [...new Set(onAttributes.flatMap((options) => options.attributeFilter!))] }
}

/** Converted value of attribute `key`:  the DOM element's `attributeValues`, always fresh. */
function attributeValueNow(component: ComponentShape, key: string): unknown {
  return component.domElement.attributeValues[key]
}

/**
 * The class's own list under `key` in decorator `metadata`, made on first use (a subclass never adds to its base's).
 */
function ownList<T>(metadata: DecoratorMetadataObject | undefined, key: symbol): T[] {
  const own = metadata as Metadata
  if (!Object.hasOwn(own, key)) own[key] = []
  return own[key] as T[]
}

/** `listFor()`'s default join:  own class's entries first, then each base class's. */
function ownFirst<T>(lists: T[][]): T[] {
  return lists.flat()
}

/**
 * `listenersOf()`'s join:  base class's entries first;  a method's listener for a type once, at its first place.
 * - Why once:  the listener calls the most-derived method, so an override decorated again would run twice.
 */
function baseFirstOnce(lists: ListenerEntry[][]): ListenerEntry[] {
  const seen = new Set<string>()
  return lists
    .toReversed()
    .flat()
    .filter(({ method, type, options }) => {
      const key = `${String(method)} ${type} ${options.target ?? ""}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
}

/** Default `equals`. */
function isSame(a: unknown, b: unknown): boolean {
  return a === b
}

/** `attributesOf()`'s default `rename`. */
function sameName(name: string): string {
  return name
}

/** `equals: false`:  never equal. */
function isNever(): boolean {
  return false
}

/** Same items (`===`), in the same order:  `startEffects()`'s cut-off, and `@derived`'s `isSameList`. */
export function isSameList(a: readonly unknown[], b: readonly unknown[]): boolean {
  return a.length === b.length && a.every((item, index) => item === b[index])
}

/****************
 * ### Types
 ****************/

/** Options of `@state`. */
export type StateOptions = {
  /** `equals(old, next)` true skips the write;  `false`:  every write notifies.  Default `===`. */
  equals?: false | ((a: any, b: any) => boolean)
  /** Notify at once even inside an owned scope (Solid's `ownedWrite`).  Default:  a microtask later there. */
  ownedWrite?: boolean
}

/** Options of `@derived`. */
export type DerivedOptions = {
  /** `equals(old, next)` true keeps the old value.  Default `===`. */
  equals?: (a: any, b: any) => boolean
}

/** Options of `@onChange`, after the member names. */
export type OnChangeOptions = {
  /** The method writes the DOM element:  a server render applies it once. */
  writesDOMElement?: boolean
  /** Not called at the start, only on a change:  an event the first draw mustn't send.  Never on a server. */
  defer?: boolean
}

/** Options of `@fromContent`:  what to watch, as `MutationObserver.observe()` takes it, and `equals`. */
export type FromContentOptions = {
  /** children added or removed */
  childList?: boolean
  /** anywhere below, not only the DOM element's own children / attributes */
  subtree?: boolean
  /** text changed */
  characterData?: boolean
  /** any attribute changed */
  attributes?: boolean
  /** only these attributes changed (implies `attributes`) */
  attributeFilter?: readonly string[]
  /** a getter's:  `equals(old, next)` true keeps the old value.  Default `===`. */
  equals?: (a: any, b: any) => boolean
}

/** What `@fromContent` asks of its class:  the element whose light DOM it watches. */
export type ContentShape = {
  /** the element;  `addReleaseCallback` when it's a `DOMElement`, to stop watching */
  readonly domElement: Node & { addReleaseCallback?(callback: () => void): void }
}

/** Options of `@on`:  `addEventListener()`'s, plus where to listen. */
export type ListenerOptions = Omit<AddEventListenerOptions, "signal"> & {
  /** what to listen on, a part of the DOM element;  default the DOM element itself */
  target?: ListenerTarget
}

/** What an `@on` listener may listen on, other than the DOM element:  its shadow root (`DOMElement.renderRoot`). */
export type ListenerTarget = "renderRoot"

/** One `@on` method. */
export type ListenerEntry = {
  /** the method called */
  method: PropertyKey
  /** the event type */
  type: string
  /** `addEventListener()`'s options, and the target */
  options: ListenerOptions
}

/** `$`:  an `Accessor` per member, same name and type. */
export type Accessors<T> = { readonly [K in keyof T]: Accessor<T[K]> }

/** What the decorators and helpers ask of a component. */
export type ComponentShape = {
  /** the element */
  readonly domElement: E.DOMElement
  /** its names:  `attribute(name)` resolves `@controlled`'s */
  readonly elementDefinition: E.ElementDefinition
}

/** An attribute's two canonical names, for `installAttributeGetters()`. */
export type AttributeNames = {
  /** camelCase:  the member's name */
  key: string
  /** kebab-case, as the vocabulary has it:  resolved against each instance's definition */
  name: string
}

/** The DOM element `attributesOf()` reads:  any element;  `addReleaseCallback` when it's a `DOMElement`. */
export type AttributeElement = {
  getAttribute(name: string): string | null
  addReleaseCallback?(callback: () => void): void
}

/** One instance's reactive record -- see `Reactive`. */
export type ReactiveRecord = {
  /** `@state` / `@controlled` values by member name:  the truth, read and written synchronously */
  readonly values: Record<PropertyKey, unknown>
  /** each member's source, made on its first tracked read */
  readonly sources: Map<PropertyKey, Source>
  /** each `@derived` member's cache */
  readonly caches: Map<PropertyKey, DerivedCache>
  /** `@controlled` member => its canonical attribute name */
  controlled?: Record<PropertyKey, string>
  /** DOM element's property writes per attribute key, for `requestChange()` */
  propertyWrites?: Record<string, number>
  /** `$` */
  accessors?: object
  /** `attributes` */
  attributes?: Readonly<Record<string, string | null>>
  /** the DOM element's attribute observer, for `attributes` */
  attributeObserver?: MutationObserver
  /** the DOM element's change callback for the attribute sources is in (`watchAttributeValues()`) */
  isWatchingValues?: boolean
  /** the light DOM's observer and its watches, for `@fromContent` (`watchContent()`) */
  content?: { readonly observer: MutationObserver; readonly watches: ContentWatch[] }
}

/** One `@cssState` member. */
export type CssStateEntry = {
  /** the getter / accessor */
  member: PropertyKey
  /** the `:state()` name */
  state: string
}

/** What an `@aria` member may hold:  turned into ARIA text by `ariaText()`. */
export type AriaValue = string | number | boolean | null | undefined

/** One `@aria` member. */
type AriaEntry = {
  /** the getter / accessor */
  member: PropertyKey
  /** the `internals` property it writes */
  property: E.AriaProperty
}

/** One `@onChange` method. */
type OnChangeEntry = {
  /** the method called */
  method: PropertyKey
  /** the members its effect reads */
  members: string[]
  /** apply once on a server */
  writesDOMElement: boolean
  /** not called at the start, only on a change */
  defer?: boolean
  /** `@whileConnected`:  called (without values) only while `isConnected` */
  whileConnected?: boolean
}

/** One `@fromContent` method. */
type ContentMethodEntry = {
  /** the method called on each change */
  method: PropertyKey
  /** what it watches */
  options: FromContentOptions
}

/** One `@fromContent` member's watch on the light DOM. */
type ContentWatch = {
  /** what it watches */
  options: FromContentOptions
  /** called with the mutations it watches */
  changed(mutations: MutationRecord[]): void
}

/** Any function, for `@untracked`'s wrapper. */
type AnyFunction = (this: unknown, ...args: unknown[]) => unknown

/** Decorator metadata, as we use it. */
type Metadata = Record<PropertyKey, unknown>

/** An instance holding a record. */
type Recorded = { [RECORD]?: ReactiveRecord }

/** Key of an instance's record. */
const RECORD = Symbol("reactive")

/** Metadata key of the `@cssState` list. */
const CSS_STATES = Symbol("cssStates")

/** Metadata key of the `@aria` list. */
const ARIA = Symbol("aria")

/** Metadata key of the `@onChange` (and `@whileConnected`) list. */
const ON_CHANGE = Symbol("onChange")

/** Metadata key of the `@fromContent` methods' list. */
const CONTENT_METHODS = Symbol("contentMethods")

/** Metadata key of the `@on` list. */
const LISTENERS = Symbol("listeners")

/**
 * Where lowered decorators keep a class's metadata:
 * `Symbol.metadata`, or esbuild's fallback when the engine has none
 * (`$/util`'s `Schema.ts` polyfills it with the same symbol).
 */
const METADATA: symbol = (Symbol as { metadata?: symbol }).metadata ?? Symbol.for("Symbol.metadata")

/** Prefix of a vocabulary attribute's key in `ReactiveRecord.sources`. */
const ATTRIBUTE_PREFIX = "attribute:"

/** Prefix of a raw attribute's key in `ReactiveRecord.sources`. */
const RAW_PREFIX = "raw:"
