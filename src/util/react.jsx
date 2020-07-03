import React from "react"
import global from "global"

/**
 * Return a React functional component which will show as `name` in a rendering error, etc.
 * TODOC
 */
export function getNamedComponent(name, renderFn) {
  Object.defineProperty(renderFn, "name", { value: name })
  return renderFn
}

/**
 * Draw a React.Fragment which encompasses the arguments.
 * Simpler implementations seem to have problems in babel.
 */
// Helper to draw a fragment from a bunch of children
// Much more concise due to spammy prettier formatting.
export function Fragment() {
  const args = [React.Fragment, null]
  for (var i = 0; i < arguments.length; i++) args.push(arguments[i])
  return React.createElement.apply(React, args)
}
global.Fragment = Fragment
