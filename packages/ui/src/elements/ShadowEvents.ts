/*! Derived from `@solidjs/element` and `component-register`:  MIT licence, (c) Ryan Carniato. */
import { DelegatedEvents, getDelegatedRoot, registerDelegatedContainer, unregisterDelegatedRoot } from "@solidjs/web"

/****************
 * ### `ShadowEvents`
 * Keeps Solid's event delegation from leaking out of an element's shadow root.
 * - What Solid does:  each element's render root is a delegation container.
 *   - ONE listener per event type on the shadow root runs the component's `onClick` / `onInput` ... handlers,
 *     by walking the event's composed path.
 *   - That walk (dom-expressions `eventHandler`) leaves its state ON THE EVENT OBJECT:
 *   - `target`:  redefined as an own property while walking,
 *     and "restored" to the value it read on entry -- the INNER node (`<input>`), frozen.
 *     - Every listener outside the shadow root that runs later sees it instead of the retargeted host,
 *       e.g. a page `input` listener on `<ui-input>` gets `<input>`.
 *   - `currentTarget`:  an own getter returning wherever the walk stopped (the inner node), for every later listener.
 *   - `_$SOLID_EVENT_OWNER` (the "already walked up to here" marker):  set to the shadow root.
 *     - Every OUTER container (a Solid app's root, an enclosing element's shadow root)
 *       checks `container.contains(marker)`, which does not cross shadow boundaries, and DROPS the event.
 *     - So a Solid app's `<ui-button onClick>`, or any handler above a nested element,
 *       never runs for events from inside that element.
 * - What this class does:  it wraps the render root's delegated listener (`bridge()`):
 *   - after it:
 *     - own `target` / `currentTarget` deleted (the platform's retargeting getters are back)
 *     - the host's own delegated handler run when the next walker would skip it
 *     - the marker moved to the host
 *   - before it:  when an inner element's root already walked part of the path,
 *     Solid resumes right after that part (a one-shot `composedPath()` slice),
 *     instead of dropping the event or walking it twice
 * - Cost:  one wrapper call per delegated event per render root on its path;  no extra listeners.
 *   - A `composedPath()` only for nested roots, or when the host itself has a delegated handler.
 * - HACK:  reads dom-expressions internals, as of `@solidjs/web` rc.13 (`ShadowEvents.test.tsx` fails when they move):
 *   - `registerDelegatedContainer()` returns the container's state (typed `void`):
 *     its `handlers` map tells Solid's listener apart from a component's own
 *   - `_$SOLID_EVENT_OWNER` (the marker) and `_$$<type>` / `_$$<type>Data` (a node's delegated handler)
 * - STATIC and instance-free:  one set of bridged roots per page.
 * - Began as solid-element's fix 10 (numbered in its old `UPSTREAM.md`),
 *   moved here as is (epic `spell-element`, Q10).
 ****************/
export class ShadowEvents {
  /** Register `root` as a delegation root, as `registerDelegatedRoot` does, with the shadow-safe bridge. */
  static register(root: HTMLElement | ShadowRoot) {
    if (!bridged.has(root)) ShadowEvents.bridge(root)
    const state = (registerDelegatedContainer as (root: Node, owner: Node) => unknown)(root, root) as
      | DelegationState
      | undefined
    if (!state) return
    // `registerDelegatedRoot()` ~== this + the `roots` count, which `getDelegatedRoot()` (portals) looks for
    state.roots = (state.roots ?? 0) + 1
    states.set(root, state)
  }

  /** Undo `register()`. */
  static unregister(root: HTMLElement | ShadowRoot) {
    unregisterDelegatedRoot(root)
  }

  /**
   * Wrap Solid's delegated listeners on `root`.
   * - Every `addEventListener()` of a function for a type Solid may delegate (`DelegatedEvents`)
   *   goes through a wrapper.
   * - At call time, the wrapper recognises Solid's own listener (`states`) and runs `before()` / `after()` around it.
   * - SIDE EFFECT:  own `addEventListener` / `removeEventListener` on the root instance.
   *   Other listeners (a component's `renderRoot.addEventListener(...)`) pass straight through.
   * - Why not a listener of our own:  Solid attaches per event type LAZILY
   *   (the first `onPointerMove` anywhere on the page adds one to every container),
   *   so nothing of ours could be ordered after it.
   */
  private static bridge(root: HTMLElement | ShadowRoot) {
    bridged.add(root)
    const add = root.addEventListener
    const remove = root.removeEventListener
    // one wrapper per listener, whatever the type (it checks `event.type` when called);
    // weak, so the listeners Solid drops on every re-render go with their wrappers
    const wrappers = new WeakMap<EventListener, EventListener>()
    const shadow = root instanceof ShadowRoot
    Object.defineProperties(root, {
      addEventListener: {
        configurable: true,
        value(type: string, listener: EventListenerOrEventListenerObject | null, options?: AddEventListenerOptions) {
          if (typeof listener !== "function" || options !== undefined || !DelegatedEvents.has(type)) {
            return add.call(root, type, listener!, options)
          }
          let wrapper = wrappers.get(listener)
          if (!wrapper) wrappers.set(listener, (wrapper = wrap(listener)))
          return add.call(root, type, wrapper)
        }
      },
      removeEventListener: {
        configurable: true,
        value(type: string, listener: EventListenerOrEventListenerObject | null, options?: EventListenerOptions) {
          const wrapper = options === undefined ? wrappers.get(listener as EventListener) : undefined
          return remove.call(root, type, wrapper ?? listener!, options)
        }
      }
    })

    /** `listener`, with the bridge around it when it is Solid's. */
    function wrap(listener: EventListener): EventListener {
      return function (this: unknown, event: Event) {
        if (states.get(root)?.handlers.get(event.type) !== listener) return listener.call(this, event)
        if (shadow) ShadowEvents.before(event as Walked, root as ShadowRoot)
        try {
          listener.call(this, event)
        } finally {
          ShadowEvents.after(event as Walked, root)
        }
      }
    }
  }

  /**
   * Before Solid walks `root`'s part of the path:
   * when an inner root already walked part of it, resume right after that part.
   * - Solid's own resume can't:
   *   - it drops a marker the container doesn't `contains()`:
   *     every node inside an inner shadow root, and a slotted host
   *   - it resumes at the marker's PARENT when the marker is the target
   * - So:  clear the marker (a fresh walk) and hand Solid's single `composedPath()` call the unwalked rest.
   *   The override removes itself on that call, so handlers see the real path.
   */
  private static before(event: Walked, root: ShadowRoot) {
    const marker = event[OWNER]
    if (!marker || marker === true) return
    const walked = progress.get(event)
    // ours, unless a plain Solid container walked in between:  then its owner is the last walked node
    const last = walked?.marker === marker ? walked.node : marker
    // a container inside this root (a portal target, a nested `render()`):  Solid's resume handles it
    if (last !== walked?.node && root.contains(last)) return
    const path = event.composedPath()
    const index = path.indexOf(last)
    if (index < 0) return
    const rest = path.slice(index + 1)
    delete event[OWNER]
    Object.defineProperty(event, "composedPath", {
      configurable: true,
      value() {
        ShadowEvents.unwalk(event, "composedPath")
        return rest
      }
    })
  }

  /**
   * After Solid walked `root`'s part of the path:
   * put the event back the way the platform had it, and hand the walk on at the host.
   * - `delete` removes only OWN properties, so the prototype's retargeting `target` / `currentTarget` return.
   * - The host's own delegated handler (`<ui-button onClick>` from the enclosing Solid code)
   *   runs HERE when the next walker is a plain Solid container:  that one would resume at the host's PARENT.
   *   - An enclosing element's root walks it itself (`before()` resumes at the host).
   * - The marker becomes the host
   *   (or, when the host ran here and the event came from slotted light content, the host's parent):
   *   a node the enclosing containers DO contain, so they resume instead of dropping.
   */
  private static after(event: Walked, root: HTMLElement | ShadowRoot) {
    ShadowEvents.unwalk(event, "target", "currentTarget", "composedPath")
    if (!(root instanceof ShadowRoot) || event[OWNER] !== root || event.cancelBubble) return
    const host = root.host as unknown as Delegating
    // the platform's `target` here is retargeted to this root's tree:  outside it means slotted light content
    const slotted = !root.contains(event.target as Node)
    let last: Node = root
    if (host[`${HANDLER}${event.type}`] !== undefined && !ShadowEvents.bridgeWalksNext(event, root, host)) {
      ShadowEvents.runHandler(event, host)
      last = host
    }
    const marker = last === host && slotted ? (ShadowEvents.parentOf(host) ?? true) : host
    event[OWNER] = marker
    progress.set(event, { node: last, marker })
  }

  /** Whether the next container on the path after `host` is another element's render root (not plain Solid). */
  private static bridgeWalksNext(event: Event, root: ShadowRoot, host: Node): boolean {
    const path = event.composedPath()
    const start = path.indexOf(root) + 1
    const next = path.findIndex((node, index) => index > start && bridged.has(node as Node))
    if (next < 0) return false
    const parent = ShadowEvents.parentOf(host)
    const plain = parent ? getDelegatedRoot(parent as HTMLElement) : undefined
    const index = plain ? path.indexOf(plain) : -1
    return index < 0 || next <= index
  }

  /** Run `node`'s delegated handler for `event`, as dom-expressions' `handleNode()` does. */
  private static runHandler(event: Walked, node: Delegating) {
    const key = `${HANDLER}${event.type}`
    const handler = node[key] as EventListener | EventListenerObject | undefined
    if (!handler || (node as { disabled?: boolean }).disabled) return
    const data = node[`${key}Data`]
    Object.defineProperty(event, "target", { configurable: true, value: node })
    Object.defineProperty(event, "currentTarget", { configurable: true, value: node })
    try {
      if (data !== undefined) (handler as unknown as (data: unknown, event: Event) => void).call(node, data, event)
      else if (typeof handler === "function") handler.call(node, event)
      else handler.handleEvent(event)
    } finally {
      ShadowEvents.unwalk(event, "target", "currentTarget")
    }
  }

  /** Delete OWN properties `keys` of `event`:  the prototype's (the platform's) getters show through again. */
  private static unwalk(event: Event, ...keys: string[]) {
    for (const key of keys) delete (event as unknown as Record<string, unknown>)[key]
  }

  /** The node Solid's walk visits after `node`. */
  private static parentOf(node: Node): Node | null {
    return (node as Delegating)._$host ?? node.parentNode ?? (node as { host?: Node }).host ?? null
  }
}

////////////////
// ## State
////////////////

/** dom-expressions' `$$EVENT_OWNER`:  the owner (container) whose walk last handled the event. */
const OWNER = "_$SOLID_EVENT_OWNER"

/** dom-expressions' `EVENT_KEY`:  `node._$$click` is a node's delegated `click` handler. */
const HANDLER = "_$$"

/** Render roots with the bridge installed. */
const bridged = new WeakSet<Node>()

/** Each registered root's delegation state (from `registerDelegatedContainer()`). */
const states = new WeakMap<Node, DelegationState>()

/**
 * Per event in flight, what the last bridged root did.
 * - `node`:  last composed-path node walked (the root, or its host when the bridge ran the host's handler)
 * - `marker`:  the marker it left;  a different marker later means a plain Solid container walked since
 */
const progress = new WeakMap<Event, { node: Node; marker: Node | true }>()

////////////////
// ## Types
////////////////

/** dom-expressions' per-container state (the parts used here). */
type DelegationState = {
  /** event type => Solid's listener on the container */
  handlers: Map<string, EventListener>
  /** registered as a root (`registerDelegatedRoot`), counted */
  roots?: number
}

/** An event as Solid's walk leaves it. */
type Walked = Event & { [OWNER]?: Node | true; composedPath: () => EventTarget[] }

/** A node that may carry delegated handlers, `_$$<type>` / `_$$<type>Data`, or a `_$host` redirect. */
type Delegating = Node & Record<string, unknown> & { _$host?: Node }
