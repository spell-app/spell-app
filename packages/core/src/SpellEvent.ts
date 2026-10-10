/**
 * SpellCore `Events` -- bridge between generic spellCore base and UIs.
 *
 * TODO: event heiarchy
 * TODO: pass/etc events
 */

import _remove from "lodash/remove"
import { spellCore } from "./core"

/**
 * Callback registered via `on`/`off`/`once`/`trigger`.
 * - `Payload`:  what the event brings, as the handler expects it, e.g. `{ card: Card }` for compiled spell's
 *   `on card-click with a card`.  Types only:  nothing checks it.
 */
export type EventCallback<Payload extends object = object> = (event: SpellEvent & Payload, target: object) => unknown

/** Methods added to a target (or its prototype) to make it "eventful". */
export type EventfulMethods = {
  /**
   * Register `callback` for `eventType` on this target -- see `SpellEvent.on()`.
   * - `Payload` comes from the callback's own type, e.g. `(event: { card: Card }) => ...`.
   */
  on<Payload extends object = object>(eventType: string, callback: EventCallback<Payload>): void
  /** Un-register `callback` from `eventType` on this target -- see `SpellEvent.off()`. */
  off<Payload extends object = object>(eventType: string, callback: EventCallback<Payload>): void
  /** Register `callback` to fire once for `eventType` on this target -- see `SpellEvent.once()`. */
  once<Payload extends object = object>(eventType: string, callback: EventCallback<Payload>): void
  /** Fire `event` on this target -- see `SpellEvent.trigger()`. */
  trigger(event: SpellEvent | string, props?: object): unknown[]
}

/**
 * Target with an optional `eventParent` to delegate events to.
 * - Walked recursively, e.g. `SpellRuntime.eventParent` ~== `spellCore`.
 */
type EventfulTarget = { eventParent?: object }

/**
 * Constructor for an immutable `SpellEvent`.
 * - You MUST pass at least a string `type`, you can pass any other properties you like.
 * - NOTE: you should consider these objects immutable! ???
 */
export class SpellEvent {
  /** Event's `type` name -- always present, constructor throws if missing. */
  declare type: string;
  /** Whatever else it was made or triggered with, e.g. `card` for `spellCore.RUNTIME.trigger('card-click', { card })`. */
  [key: string]: unknown

  /** Accepts a bare `type` string, or full `SpellEventProps` (which MUST include `type`). */
  constructor(props: string | SpellEventProps) {
    if (typeof props === "string") this.type = props
    else Object.assign(this, props)
    if (typeof this.type !== "string") throw new TypeError(`SpellEvents must be initiallized with a 'type'.`)
  }

  /**
   * Register `callback` to execute when event is triggered on `target`.
   * - `eventType` is name of event to watch (case-insensitive).
   * - `callback` is code to execute when triggered, as `callback(<spellEvent>, <target>)`.
   * - `target` can be any object -- handlers are tracked in a private `WeakMap` keyed by `target`
   *   identity (see `getEventList()`), so `target` needs no special shape.
   */
  static on(target: object, eventType: string, callback: EventCallback): void {
    if (!callback) return
    const list = SpellEvent.getEventList(target, eventType, true)
    list!.push(callback)
  }

  /**
   * UN-register `callback` from `target` set up with `SpellEvent.on()`.
   * - `eventType` is name of event in question (case-insensitive).
   * - `callback` is previously watched callback.
   * - `target` can be any object -- see `on()` for how handlers are tracked.
   */
  static off(target: object, eventType: string, callback: EventCallback): void {
    if (!callback) return
    const list = SpellEvent.getEventList(target, eventType)
    if (list) _remove(list, (next) => next === callback)
  }

  /**
   * Register `callback` to execute ONCE when event is triggered on `target`
   * and then unregister itself.  Same semantics as `on()`.
   */
  static once(target: object, eventType: string, callback: EventCallback): void {
    if (!callback) return
    function callOnce(event: SpellEvent, callOnceTarget: object): unknown {
      // remove the event handler FIRST, in case callback errors
      SpellEvent.off(target, eventType, callOnce)
      return callback(event, callOnceTarget)
    }
    SpellEvent.on(target, eventType, callOnce)
  }

  /**
   * Trigger `event` on some `target`.
   * - `event` is a `SpellEvent` or a `string` (which we'll use to create a `SpellEvent`).
   * - `target` can be any object -- see `on()` for how handlers are tracked.
   * - Returns array of results from callbacks, or empty array if no callback registered.
   *   If those results are `Promise`s, you could `Promise.all()` the results.
   * - SIDE EFFECT: also triggers on `target.eventParent` (recursively, if present), appending its
   *   results to the returned array.
   */
  static trigger(target: object, event: SpellEvent | string, props?: object): unknown[] {
    if (typeof event === "string") event = new SpellEvent(event)
    if (props) Object.assign(event, props)
    const callbacks = SpellEvent.getEventList(target, event.type)
    let results: unknown[] = []
    if (callbacks) {
      console.info("triggering", event, " on ", target)
      results = [...callbacks].map((callback) => {
        try {
          return callback(event as SpellEvent, target)
        } catch (error) {
          // TODO: surface as an `eventError` event?
          console.warn(
            `Error calling event '${(event as SpellEvent).type}': `,
            error,
            "\ntarget:",
            target,
            "\nevent:",
            event,
            "\ncallback:",
            callback
          )
        }
      })
    }
    // Delegate to `eventParent` if defined
    const { eventParent } = target as EventfulTarget
    if (eventParent) {
      console.info("delegating to parent", eventParent)
      const parentResults = SpellEvent.trigger(eventParent, event)
      if (parentResults.length) results.push(...parentResults)
    }
    return results
  }

  /** Per-target event-handler storage, keyed by `target` identity -- `target` needs no special shape. */
  static EVENT_OBJECT_REGISTRY = new WeakMap<object, Record<string, EventCallback[]>>()
  /**
   * Given an event `target`, return a list of events for `eventType`.
   * If `createIfNecessary` is `true`, we'll create one if it doesn't exist.
   * Otherwise we'll return `undefined`.
   *
   * NOTE: we use a `WeakMap` to store the event handlers here, by `target`.
   * In theory, this should maybe avoid memory leaks. ???
   */
  static getEventList(target: object, eventType: string, createIfNecessary = false): EventCallback[] | undefined {
    eventType = eventType.toLowerCase()
    let map = SpellEvent.EVENT_OBJECT_REGISTRY.get(target)
    if (!map) {
      if (!createIfNecessary) return undefined
      map = {}
      SpellEvent.EVENT_OBJECT_REGISTRY.set(target, map)
    }
    let list = map[eventType]
    if (!list && createIfNecessary) {
      list = []
      map[eventType] = list
    }
    return list
  }

  /** Property descriptors for `on`/`off`/`once`/`trigger`, applied to a target by `makeEventful()`. */
  static instanceMethods: PropertyDescriptorMap = {
    on: {
      value(this: object, eventType: string, callback: EventCallback) {
        SpellEvent.on(this, eventType, callback)
      }
    },
    off: {
      value(this: object, eventType: string, callback: EventCallback) {
        SpellEvent.off(this, eventType, callback)
      }
    },
    once: {
      value(this: object, eventType: string, callback: EventCallback) {
        SpellEvent.once(this, eventType, callback)
      }
    },
    trigger: {
      value(this: object, event: SpellEvent | string, props?: object) {
        SpellEvent.trigger(this, event, props)
      }
    }
  }
  /**
   * Make some arbitrary `target` able to deal with events by monkey-patching
   * `on`, `off`, `once` and `trigger` methods.
   * NOTE: To apply for all instances of a class, use `Eventful` HOC below:
   *
   * To apply to a singleton or statically to a class:
   *    `SpellEvent.makeEventful(SingletonOrClass)`
   */
  static makeEventful(target: object): void {
    Object.defineProperties(target, SpellEvent.instanceMethods)
  }
}

/** Extra properties that can be passed when constructing/triggering a `SpellEvent`. */
export type SpellEventProps = Record<string, unknown> & { type?: string }
// Make spellCore itself eventful.
SpellEvent.makeEventful(spellCore)

/**
 * Higher-order "mixin" class to allow instances of a class to work with SpellEvents.
 * - Usage: `class MyClass extends Eventful(SomeBaseClass) {...}`
 */
export function Eventful<B extends new (...args: any[]) => object>(
  Base: B
): B & (new (...args: any[]) => EventfulMethods)
export function Eventful(): new (...args: any[]) => EventfulMethods
export function Eventful<B extends new (...args: any[]) => object>(BaseClass?: B) {
  const newClass = BaseClass ? class Eventful extends BaseClass {} : class Eventful {}
  SpellEvent.makeEventful(newClass.prototype)
  return newClass
}
