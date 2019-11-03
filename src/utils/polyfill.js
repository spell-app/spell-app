//
//  Polyfills to make node/browser environmens consistent.
//
/* eslint-disable no-extend-native */

// GRRR... will SOMEONE on the node team please implement console.group ???
if (!console.group) console.group = console.log
if (!console.groupCollapsed) console.groupCollapsed = console.group
if (!console.groupEnd) console.groupEnd = console.log

// GRRR... node doesn't include this???
if (!Array.prototype.includes) {
  Object.defineProperty(Array.prototype, "includes", {
    value(value, start) {
      return this.indexOf(value, start) !== -1
    }
  })
}
