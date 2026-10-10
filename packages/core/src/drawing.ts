/**
 * Drawing with Solid:  what compiled spell's JSX and `draw` statements call -- `element()`, `drawThing()`,
 * `drawItems()` -- and mounting an app (`mountApp()`).
 * - Compiled JSX is `spellCore.element({ tag, props, children })`, every value that can change written as a
 *   function (`() => this.short_suit`):  Solid calls it, and again when what it read changes, updating only that
 *   node.  Nothing redraws a whole board.
 * - Each drawn thing sits in its own error net (`drawThing()`):  when its `draw()` throws, it shows a small stand-in,
 *   and the rest keeps drawing.
 * - Solid comes from the PAGE:  `spell-runtime.js` imports `solid-js`, `@solidjs/web` and `@solidjs/h` from the
 *   page's one shared Solid (`spell-solid.js`), never a copy of its own.  Spell state reaches Solid through the
 *   host's `bridgeSolid()` (`$/util/reactive`).
 * - Part of `spellCore`:  imported by `$/core`'s barrel for its side effect.
 */

import h from "@solidjs/h"
import { createComponent, render, type JSX } from "@solidjs/web"
import { Errored, For, createMemo, runWithOwner } from "solid-js"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"

/** What a drawing is:  a Solid node, or anything Solid can put on the page (text, a list of them, nothing). */
export type Drawing = JSX.Element

/** Spec accepted by `spellCore.element()`. */
export type ElementSpec = {
  /** HTML or `ui-*` tag, e.g. `"div"`, `"ui-form"`. */
  tag?: string
  /** Attributes, properties and handlers:  a function for each value that can change, as compiled JSX writes. */
  props?: Record<string, unknown> | null
  /** Children:  elements, text, and a function for each value that can change. */
  children?: unknown[]
}

/** Anything that can draw itself, e.g. a `Thing` or a `List`. */
export type Drawable = {
  /** Returns its drawing -- compiled from `to draw (a card)`. */
  draw(): Drawing
}

/** `spellCore`'s drawing methods, on Solid. */
export const drawingMethods = defineSpellCoreModule({
  ////////////////
  // ## Elements
  ////////////////

  /**
   * An element, drawn with Solid (`@solidjs/h`) -- compiled from spell's JSX, e.g. `<div foo=1>{expr}</div>` =>
   * `spellCore.element({ tag: "div", props: { foo: 1 }, children: [() => expr] })` (see `JSX.ts`).
   * - Props and children that are functions are LIVE:  called while drawing, and again when what they read changes.
   *   Handlers (`onClick`) are the exception:  called on the event.
   * - React's spellings, as spell programs write them, become the page's:  `className` => `class`, `htmlFor` =>
   *   `for`, and a camelCase attribute on an HTML tag lowercased (`colSpan` => `colspan`).
   * - On a `ui-*` tag (or any tag with a dash), a live value or an object is a PROPERTY (`prop:value`):  an
   *   attribute can only hold text.  See `isPropertyOf()`.
   * - throws for a dotted tag, e.g. `<UI.Form>`:  the React kits spell programs once named are gone (epic
   *   `output-targets` P11), and Spell UI's elements go by their own tags, `<ui-form>`.  The error net of the thing
   *   drawing it shows a stand-in instead (`drawThing()`).
   */
  element({ tag = "div", props, children = [] }: ElementSpec = {}): Drawing {
    if (!TAG.test(tag)) throw new Error(`<${tag}> isn't an element:  write Spell UI's own tag, e.g. <ui-form>`)
    // made NOW, not left a thunk:  a thunk would be made again each time the net around it re-reads its children
    const thunk = h(tag, solidProps(tag, props), ...children) as unknown as () => Drawing
    return thunk()
  },

  ////////////////
  // ## Drawing things
  ////////////////

  /**
   * `drawable`'s drawing, in its own error net -- `null` if it can't draw (no `draw()`).
   * - Compiles from `draw the card` -- see `draw.ts`.  Takes ANYTHING, as it checks:  compiled spell draws what
   *   TypeScript can't type, e.g. the last card of a pile.
   * - Its `draw()` re-runs when something it read OUTSIDE its live values changes, e.g. the `is face down` an
   *   `if` chose by:  the card's node is drawn again, nothing else.  Its live values update on their own.
   * - The error net:  when `draw()` (or a live value in it) throws -- one line on the program's console, a
   *   cancelable `ui-error` from the app's element (`{ error, thing }`), and a small stand-in, unless that event was
   *   cancelled.  The rest of the drawing keeps working.  The net heals when the thing draws again.
   */
  drawThing(drawable?: unknown): Drawing | null {
    const thing = drawable as Partial<Drawable> | undefined
    if (typeof thing?.draw !== "function") return null
    // through `createComponent()`, as Solid's JSX does:  untracked, so what it reads is its own, not the caller's
    return createComponent(Errored, {
      fallback: (error: () => unknown) => drawingFailed(thing as Drawable, error()),
      // `draw()` in a memo, inside the net:  it runs again only for what IT read, never because the net re-reads
      // its children (it does, whenever anything under it changes:  a list grows, a card flips)
      get children() {
        return createMemo(() => drawOrStandIn(thing as Drawable)) as unknown as Drawing
      }
    })
  },

  /**
   * Each item of `list`, drawn in its own error net -- `null` if `list` has no items to draw.
   * - Compiles from `draw each card in the deck` / `draw cards of the deck` -- see `draw.ts`.
   * - Kept by IDENTITY (`<For>`):  an item added, removed or moved changes only its own node.
   */
  drawItems(list: unknown): Drawing | null {
    // NOT `list.items` here:  read in the caller's drawing, every change to the list would draw it all again
    if (!list || typeof list !== "object" || !("items" in list)) return null
    return createComponent(For as unknown as ForByIdentity, {
      get each() {
        return (list as { items: unknown[] }).items
      },
      children: (item: unknown) => spellCore.drawThing(item)
    })
  },

  ////////////////
  // ## Mounting
  ////////////////

  /**
   * Mount `app`'s drawing into `element` -- replacing what was there -- and return how to take it down again.
   * - What `App.start()` does, into `spellCore.appElement()`.
   * - SIDE EFFECT:  `element.spellRoot` is the mounted app, so a runner can `unmount()` it before running a program
   *   again (`runCompiled()`).
   */
  mountApp(app: Drawable, element: HTMLElement): MountedApp {
    ;(element as AppElement).spellRoot?.unmount()
    // a root of its own:  `start the game` may run inside the host's drawing (a runner's effect), whose owner would
    // otherwise own the app's drawing -- and hold or re-run it with the host's
    const dispose = runWithOwner(null, () => render(() => spellCore.drawThing(app), element))
    const mounted: MountedApp = {
      unmount() {
        dispose()
        if ((element as AppElement).spellRoot === mounted) delete (element as AppElement).spellRoot
      }
    }
    ;(element as AppElement).spellRoot = mounted
    return mounted
  }
})
Object.assign(spellCore, drawingMethods)

/** A mounted app, as `mountApp()` returns it and leaves on its element (`spellRoot`). */
export type MountedApp = {
  /** Take the app's drawing down, emptying its element. */
  unmount(): void
}

/** The element an app is mounted into. */
export type AppElement = HTMLElement & { spellRoot?: MountedApp }

/** `<For>` keyed by identity (its first overload):  `createComponent()` would pick its last. */
type ForByIdentity = (props: { readonly each: unknown[]; children: (item: unknown) => Drawing }) => Drawing

/** The DOM event a drawing that failed sends -- the same name as Spell UI's. */
const ERROR_EVENT = "ui-error"

/** A camelCase name:  a lowercase letter, then an uppercase one. */
const CAMEL_CASE = /[a-z][A-Z]/

/**
 * A tag `element()` draws:  a name, with dashes for a custom element (`div`, `ui-form`) -- no dots.
 * - `@solidjs/h` would read `UI.Form` as a `<UI>` with class `Form`.
 */
const TAG = /^[a-zA-Z][\w-]*$/

/**
 * `props` as Solid takes them, for `tag` -- see `element()`.
 * - Returns a NEW object;  `null` stays `null`.
 * - Getters are kept as getters:  `@solidjs/h` reads them as live values too.
 */
function solidProps(tag: string, props: Record<string, unknown> | null | undefined) {
  if (!props) return props
  const isCustomElement = tag.includes("-")
  const result: Record<string, unknown> = {}
  for (const [name, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(props))) {
    let key = name
    if (name === "className") key = "class"
    else if (name === "htmlFor") key = "for"
    else if (isCustomElement) {
      if (isPropertyOf(name, descriptor.value)) key = `prop:${name}`
    } else if (!name.startsWith("on") && CAMEL_CASE.test(name)) key = name.toLowerCase()
    Object.defineProperty(result, key, { ...descriptor, enumerable: true })
  }
  return result
}

/**
 * On a tag with a dash, is prop `name` with `value` set as a PROPERTY (`prop:name`), rather than an attribute?
 * - A live value (a function):  yes -- it may be an object at any time, e.g. `<ui-form value={the app}>`, and an
 *   attribute holds only text.  Spell UI's elements have a property for every attribute, and keep one set before
 *   they're defined.
 * - An object:  yes, the same reason.
 * - Text, a number or a choice written as is (`position="right"`), a handler (`onClick`), and what the page reads
 *   as an attribute (`class`, `style`, `id`, `slot`, `part`, a dashed name like `aria-label`):  no.
 */
function isPropertyOf(name: string, value: unknown): boolean {
  if (name.startsWith("on") || name.includes("-") || ATTRIBUTES_ONLY.has(name)) return false
  return typeof value === "function" || (value !== null && typeof value === "object")
}

/** What stays an attribute on a tag with a dash, whatever its value:  see `isPropertyOf()`. */
const ATTRIBUTES_ONLY = new Set(["class", "className", "style", "id", "slot", "part"])

/**
 * `thing.draw()`, or its stand-in if that throws -- `drawThing()`'s net, for a `draw()` that fails.
 * - Caught HERE, not by `<Errored>`:  `<Errored>` makes its fallback again each time the drawing around it changes
 *   (measured, rc.13:  a card added to a pile made a new stand-in for the pile's broken card).  Here, the stand-in
 *   is the memo's value, made once.  `<Errored>` still catches what a live value throws later.
 */
function drawOrStandIn(thing: Drawable): Drawing | null {
  try {
    return thing.draw()
  } catch (error) {
    return drawingFailed(thing, error)
  }
}

/**
 * What a drawing that failed shows:  a stand-in naming the thing, after telling the program and the page.
 * - SIDE EFFECTS:  one line on the program's console;  a cancelable `ui-error` from the app's element.
 * - `null`, drawing nothing, when the page cancelled that event.
 */
function drawingFailed(thing: Drawable, error: unknown): Drawing | null {
  const type = (thing as { type?: string }).type ?? thing.constructor?.name ?? "thing"
  spellCore.console.error(`${type}:  draw() failed`, error)
  const event = new CustomEvent(ERROR_EVENT, {
    bubbles: true,
    composed: true,
    cancelable: true,
    detail: { error, thing }
  })
  const target = spellCore.appElement()
  if (target && !target.dispatchEvent(event)) return null
  const message = error instanceof Error ? error.message : String(error)
  return h("span.spell-draw-error", { title: message, role: "alert" }, `⚠ ${type} can't draw`) as unknown as Drawing
}
