import React from "react"

/**
 * Return a React functional component which will show as `name` in a rendering error, etc.
 * TODOC
 */
export function getNamedComponent(name, renderFn) {
  Object.defineProperty(renderFn, "name", { value: name })
  return renderFn
}
