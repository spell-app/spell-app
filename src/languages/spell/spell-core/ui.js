// ----------------------------
// UI interaction thingers for spell
// TODO: these are maybe not core, since they're tied into particular UI???
// ----------------------------
import React from "react"

import { spellCore } from "."

Object.assign(spellCore, {
  //----------------------------
  // components
  //--------

  /** Create a react element (ala `React.createElement()`) */
  element({ tag, props, children = [] } = {}) {
    // if (!children || !children.length) return <Tag {...props} />
    // return <Tag {...props}>{children}</Tag>
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

// import spell from "."
// Object.assign(spell, {
//   // Notify user about `message` in a non-modal (popup?) interface.
//   // `message` can be a string or a JSX expression.
//   // If `okButton` is specified, they have to click a button to make the notice go away.
//   // Pass `okButton = true` for a simple `(x)` close icon.
//   notify(message, okButton) {},
//
//   // Show `message` in a modal alert.
//   // `message` can be a string or a JSX expression.
//   // Returns a promise which resolves when they click `ok`.
//   alert(message, okButton = "OK") {},
//
//   // Show modal alert to warn user about `message`.
//   // `message` can be a string or a JSX expression.
//   // Returns a promise which resolves when they click `ok`.
//   warn(message, okButton = "OK") {},
//
//   // Show modal alert to confirm whether user approves some `message`.
//   // `message` can be a string or a JSX expression.
//   // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
//   confirm(message, okButton = "OK", cancelButton = "cancel") {},
//
//   // Show modal alert to prompt user for `value` for some `message`.
//   // `message` can be a string or a JSX expression.
//   // Returns a promise which `resolve(value)`s when they `ok`, `reject()`s if they `cancel`.
//   confirm(message, okButton = "OK", cancelButton = "cancel") {},
//
//   // Show modal alert to choose one item from `collection` with `defaultValue`
//   // `message` can be a string or a JSX expression.
//   // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
//   chooseOne(message, collection, defaultValue, okButton = "OK", cancelButton = "cancel") {},
//
//   // Show modal alert to choose one or more items from `collection` with `defaultValues`
//   // `message` can be a string or a JSX expression.
//   // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
//   chooseMultiple(message, collection, defaultValues, okButton = "OK", cancelButton = "cancel") {},
// })
