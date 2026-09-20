import React from "react"
import _get from "lodash/get"

import { spellCore } from "./core"
import { defineSpellCoreModule } from "./SpellCore"

/** Registry of known React elements, addressable by (possibly dotted) name. */
export type KnownElementsMap = Record<string, unknown>

/** Spec accepted by `spellCore.element()`. */
export type ElementSpec = {
  /** Component/HTML tag, or a `knownElements` key (possibly dotted, e.g. `"UI.Button"`) to look one up. */
  tag?: ReactComponentType | string
  /** Passed through to `React.createElement()` as-is. */
  props?: Record<string, unknown> | null
  /** Child elements/values, spread as `React.createElement()`'s rest args. */
  children?: ReactNode[]
}

/**
 * Assembled `spellCore` UI-interaction methods -- time (`pauseFor`), React element creation
 * (`element`/`registerElements`) and stylesheet installation (`installStyles`).
 * TODO: these are maybe not core, since they're tied into particular UI???
 * NOTE: sibling user-facing I/O statements `notify`/`alert`/`confirm`/`prompt` (see `UI.ts` rules)
 * compile to `spellCore.notify()`/`.alert()`/`.confirm()`/`.prompt()`, but none of those methods are
 * implemented anywhere in `spellCore` yet.
 * TODO: implement them, or drop the rules?
 */
export const uiMethods = defineSpellCoreModule({
  ////////////////
  // ## Time
  ////////////////

  /** Multiplier from a unit name to milliseconds, e.g. `spellCore.TIME_UNITS_MAP.tick`. */
  TIME_UNITS_MAP: {
    second: 1000,
    seconds: 1000,
    sec: 1000,

    millisecond: 1,
    milliseconds: 1,
    msec: 1,
    // a "tick" (from hypercard) is 1/60th of a second
    tick: 1000 / 60,
    ticks: 1000 / 60
  } as Record<string, number>,

  /**
   * Return promise which resolves after `number` `units` have elapsed.
   * - `units` looked up in `TIME_UNITS_MAP`; unrecognized `units` fall back to seconds.
   * - Compiles from spell `pause for {number} {units}` (see `async.ts`); caller `await`s it.
   */
  pauseFor(number: number, units = "seconds"): Promise<void> {
    const multiplier = spellCore.TIME_UNITS_MAP[units] || 1000
    // default to 0 if `isNaN`
    const delay = Math.round(number * multiplier) || 0
    return new Promise((resolve) => setTimeout(resolve, delay))
  },

  ////////////////
  // ## Components
  ////////////////

  /** Map of `{ <key>: <elements map> }` for known elements. */
  knownElements: {} as KnownElementsMap,

  /** Register a suite of React elements so they can be used in Spell Projects by name. */
  registerElements(componentMap: KnownElementsMap): void {
    Object.assign(spellCore.knownElements, componentMap)
  },

  /**
   * Create a react element (ala `React.createElement()`).
   * - String `tag` first tries `knownElements` (registered via `registerElements()`) by name --
   *   falls back to `tag` itself (e.g. a plain HTML tag like `"div"`) if not found there.
   * - Compiles from spell JSX, e.g. `<div foo=1>{expr}</div>` =>
   *   `spellCore.element({ tag: "div", props: { foo: 1 }, children: [expr] })` (see `JSX.ts`).
   */
  element({ tag, props, children = [] }: ElementSpec = {}): ReactElement {
    if (typeof tag === "string") {
      tag = (_get(spellCore.knownElements, tag) as ReactComponentType | string | undefined) || tag
      if (typeof tag === "string" && tag.includes(".")) {
        console.warn(`spellCore.element(): Don't recognize tag '${tag}'`)
      }
    }
    return React.createElement(tag as ReactComponentType | string, props, ...children)
  },

  /**
   * Create/initialize a `name`d stylesheet with specified `css` text.
   * - If you call this a second time with same `name`, it'll replace the element with that `name`.
   * - Compiles from a bare (unquoted) CSS text literal, e.g. a spell `.css` file's contents; newlines
   *   in `css` arrive escaped as `¬` (see `css` rule in `UI.ts`), since they survived being embedded
   *   in a backtick template literal -- unmunged back to `\n` here before use.
   */
  installStyles(name = "anonymous-css", safeCSS = ""): void {
    // UN-munge `¬` back to return character
    const css = safeCSS.replace(/¬/g, "\n")

    const id = `--spell-styles--${name}--`
    const newElement = document.createElement("style")
    newElement.id = id
    newElement.type = "text/css"
    newElement.appendChild(document.createTextNode(css))
    const oldElement = document.getElementById(id)
    if (oldElement) {
      oldElement.parentNode!.replaceChild(newElement, oldElement)
    } else {
      const head = (document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0])!
      head.appendChild(newElement)
    }
  }
})
Object.assign(spellCore, uiMethods)
