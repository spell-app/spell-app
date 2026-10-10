/**
 * Drawing with Solid:  what compiled spell's `draw` statements call -- `drawThing()`, `drawItems()`, `@drawn` --
 * and mounting an app (`mountApp()`).
 * - Compiled JSX is Solid's own `h()`, exported here as core's `h`, as a person writing Solid without JSX would:
 *   `h("span", { class: "suit" }, () => this.shortSuit)`.
 *   - Every value that can change is written as a function.
 *     Solid calls it, and again when what it read changes, updating only that node:  nothing redraws a whole board.
 *   - Since epic `output-targets` P20.
 *     Before it, compiled spell called `spellCore.element()`, now in `deprecated.ts`.
 * - Each drawn thing sits in its own error net (`drawInNet()`):
 *   when its `draw()` throws, it shows a small stand-in, and the rest keeps drawing.
 *   ONE net, for both targets:
 *   - compiled JavaScript draws a thing with `spellCore.drawThing(card)`, which puts its `draw()` in the net
 *   - compiled TypeScript (and hand-written code) writes `@drawn draw() { ... }`, which puts it there itself,
 *     so a parent draws a child with a plain call, `{card.draw()}`
 *   - `h()` returns a THUNK, a function that makes the element:  the net makes it, once (`madeOnce()`)
 * - Solid comes from the PAGE, never a copy of its own:
 *   `spell-runtime.js` imports `solid-js`, `@solidjs/web` and `@solidjs/h` from the page's one shared Solid,
 *   `spell-solid.js`.
 *   - Spell state reaches Solid through the host's `bridgeSolid()` (`$/util/reactive`).
 * - Part of `spellCore`:  imported by `$/core`'s barrel for its side effect.
 */

import h from "@solidjs/h"
import { createComponent, render, type JSX } from "@solidjs/web"
import { Errored, For, createMemo, runWithOwner } from "solid-js"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./spellCore.types"

/**
 * Solid's own `h()`, what compiled JavaScript draws with:  `import { h } from "@spell/core"`.
 * - The SAME copy core draws with, so the net knows its thunks (`isElementThunk()`).
 * - Epic `output-targets` P20, Q57.
 */
export { h }

/** What a drawing is:  a Solid node, or anything Solid can put on the page (text, a list of them, nothing). */
export type Drawing = JSX.Element

/** Anything that can draw itself, e.g. a `Thing` or a `List`. */
export type Drawable = {
  /** Returns its drawing -- compiled from `to draw (a card)`. */
  draw(): Drawing
}

/** `spellCore`'s drawing methods, on Solid. */
export const drawingMethods = defineSpellCoreModule({
  ////////////////
  // ## Drawing things
  ////////////////

  /**
   * `drawable`'s drawing, in its own error net -- `null` if it can't draw (no `draw()`).
   * - Compiles from `draw the card` -- see `rules/draw/DrawThing.ts`.
   *   Takes ANYTHING, as it checks:
   *   compiled spell draws what TypeScript can't type, e.g. the last card of a pile.
   * - Its `draw()` re-runs when something it read OUTSIDE its live values changes,
   *   e.g. the `is face down` an `if` chose by:  the card's node is drawn again, nothing else.
   *   Its live values update on their own.
   * - The error net is `drawInNet()`'s.
   *   A thing whose `draw()` is `@drawn` brings its own:  it's called straight.
   */
  drawThing(drawable?: unknown): Drawing | null {
    const thing = drawable as Partial<Drawable> | undefined
    if (typeof thing?.draw !== "function") return null
    // a second net around `@drawn`'s own would catch nothing more
    if (isDrawn(thing.draw)) return thing.draw()
    return drawInNet(thing, () => (thing as Drawable).draw())
  },

  /**
   * Each item of `list`, drawn in its own error net -- `null` if `list` has no items to draw.
   * - Compiles from `draw each card in the deck` / `draw cards of the deck` -- see `rules/draw/DrawItems.ts`.
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

////////////////
// ## `@drawn`
////////////////

/**
 * `@drawn draw() { ... }`:  the drawing in its own error net, the same net `spellCore.drawThing()` gives.
 * - So a parent draws a child with a plain call, `{card.draw()}`:
 *   it neither re-runs when the card's reads change, nor dies with the card's errors.
 *   The card's drawing re-runs by itself, inside its net.
 * - What compiled TypeScript (`ts/solid`) and hand-written classes write.
 *   - Compiled JavaScript has no decorators:
 *     it draws a thing with `spellCore.drawThing(card)`, which puts a `draw()` in the same net.
 *   - ONE net, `drawInNet()`, for both targets.
 * - SIDE EFFECT:  marks the method it returns (`isDrawn()`), so `drawThing()` calls it straight:
 *   no second net around it.
 * - A standard (TC39) method decorator, `@spell/core`'s like `@prop`.
 *   NOTE: lowered by esbuild (`vite.decorators.ts`), so it MUST start its line.
 */
export function drawn<This extends object, Draw extends (this: This) => Drawing>(
  draw: Draw,
  _context: ClassMethodDecoratorContext<This, Draw>
): Draw {
  const drawInItsNet = function (this: This): Drawing {
    return drawInNet(this, () => draw.call(this))
  }
  Object.defineProperty(drawInItsNet, DRAWN, { value: true })
  return drawInItsNet as Draw
}

/**
 * `draw()`'s drawing, for `thing`, in its own error net:
 * `drawThing()`'s and `@drawn`'s, the ONE net both targets draw in.
 * - Through `createComponent()`, as Solid's JSX does:  untracked, so what `draw()` reads is its own, not the caller's.
 * - `draw()` runs in a memo, inside the net:
 *   again only for what IT read, never because the net re-reads its children
 *   (it does, whenever anything under it changes:  a list grows, a card flips).
 * - When `draw()` (or a live value in it) throws:
 *   - one line on the program's console
 *   - a cancelable `ui-error` from the app's element (`{ error, thing }`)
 *   - a small stand-in, unless that event was cancelled
 *   - The rest of the drawing keeps working;  the net heals when the thing draws again.
 */
function drawInNet(thing: object, draw: () => Drawing): Drawing {
  return createComponent(Errored, {
    fallback: (error: () => unknown) => drawingFailed(thing, error()),
    get children() {
      return createMemo(() => drawOrStandIn(thing, draw)) as unknown as Drawing
    }
  })
}

/** Is `draw` a method `@drawn` made, which draws in its own net? */
function isDrawn(draw: Function): boolean {
  return (draw as { [DRAWN]?: boolean })[DRAWN] === true
}

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

/** Marks a method `@drawn` made -- see `isDrawn()`. */
const DRAWN = Symbol("drawn")

/**
 * `draw()`, or `thing`'s stand-in if that throws -- `drawInNet()`'s, for a `draw()` that fails.
 * - Caught HERE, not by `<Errored>`:
 *   - `<Errored>` makes its fallback again each time the drawing around it changes
 *     (measured, rc.13:  a card added to a pile made a new stand-in for the pile's broken card)
 *   - here, the stand-in is the memo's value, made once
 *   - `<Errored>` still catches what a live value throws later
 * - What `draw()` returns is made here too, inside the try:  see `madeOnce()`.
 */
function drawOrStandIn(thing: object, draw: () => Drawing): Drawing | null {
  try {
    return madeOnce(draw())
  } catch (error) {
    return drawingFailed(thing, error)
  }
}

/**
 * `drawing` MADE, if it's `h()`'s thunk (a function that makes the element) -- else `drawing` as it is.
 * - Compiled JavaScript's `draw()` returns `h("div", ...)`, a thunk.  Made here, inside the net's memo:
 *   - ONCE:  left a thunk, Solid would make the element again each time the net re-reads its children, which it
 *     does whenever anything under it changes (a card added to a pile)
 *   - inside the net's `try`:  a tag or child that throws while it's made shows the stand-in
 *   - elements INSIDE it need nothing:  `h()` makes them as it makes their parent
 * - ONLY `h()`'s thunks:  any other function is a live value, which Solid calls itself, again when it changes.
 *   `h()` marks its thunks with a symbol it keeps to itself, so it's read off a thunk of our own, `H_THUNK`.
 */
function madeOnce(drawing: Drawing): Drawing {
  return isElementThunk(drawing) ? madeOnce(drawing()) : drawing
}

/** Is `value` a thunk core's `h()` made -- see `madeOnce()`? */
export function isElementThunk(value: unknown): value is () => Drawing {
  return typeof value === "function" && !!H_THUNK && (value as unknown as Record<symbol, unknown>)[H_THUNK] === true
}

/**
 * The symbol `h()` marks its thunks with (`$ELEMENT`, "hyper-element" in `@solidjs/h`).
 * - Not exported, so read off a thunk it made.
 *   `h("i")` only wraps its arguments:  nothing is made, and nothing touches the page.
 * - `undefined` if an `@solidjs/h` to come stops marking them:  `drawing.test.ts` pins it.
 */
const H_THUNK: symbol | undefined = Object.getOwnPropertySymbols(h("i"))[0]

/**
 * What a drawing that failed shows:  a stand-in naming the thing, after telling the program and the page.
 * - SIDE EFFECTS:  one line on the program's console;  a cancelable `ui-error` from the app's element.
 * - `null`, drawing nothing, when the page cancelled that event.
 */
function drawingFailed(thing: object, error: unknown): Drawing | null {
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
  // made NOW, as `madeOnce()` makes a drawing:  the stand-in is made once, as the memo's value
  return madeOnce(h("span.spell-draw-error", { title: message, role: "alert" }, `⚠ ${type} can't draw`) as Drawing)
}
