// ----------------------------
// UI interaction thingers for spell
// TODO: these are maybe not core, since they're tied into particular UI???
// ----------------------------
import React from "react"
import _get from "lodash/get"

import { spellCore } from "."

Object.assign(spellCore, {
  //----------------------------
  // time
  //--------

  /** Convert time units into milliseconds. */
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
  },

  /** Return promise which resolves after certain amount of time. */
  pauseFor(number, units = "seconds") {
    const multiplier = spellCore.TIME_UNITS_MAP[units] || 1000
    // default to 0 if `isNaN`
    const delay = Math.round(number * multiplier) || 0
    return new Promise((resolve) => setTimeout(resolve, delay))
  },

  //----------------------------
  // components
  //--------

  /** Map of `{ <key>: <elements map> }` for known elements. */
  knownElements: {},

  /** Register a suite of React elements so they can be used in Spell Projects by name. */
  registerElements(componentMap) {
    Object.assign(spellCore.knownElements, componentMap)
  },

  /** Create a react element (ala `React.createElement()`) */
  element({ tag, props, children = [] } = {}) {
    if (typeof tag === "string") tag = _get(spellCore.knownElements, tag) || tag
    return React.createElement(tag, props, ...children)
  },

  /**
   * Create/initialize a `name`d stylesheet with specified `css` text.
   * If you call this a second time, it'll replace element with the specified `name`.
   */
  installStyles(name = "anonymous-css", safeCSS = "") {
    // UN-munge `¬` back to return character
    const css = safeCSS.replace(/¬/g, "\n")

    const id = `--spell-styles--${name}--`
    const newElement = document.createElement("style")
    newElement.id = id
    newElement.type = "text/css"
    newElement.appendChild(document.createTextNode(css))
    const oldElement = document.getElementById(id)
    if (oldElement) {
      oldElement.parentNode.replaceChild(newElement, oldElement)
    } else {
      const head = document.getElementsByTagName("head")[0] || document.getElementsByTagName("body")[0]
      head.appendChild(newElement)
    }
  }
})
