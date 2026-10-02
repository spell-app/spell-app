/** @jsxImportSource react */
import React from "react"

import { view } from "$/util"

import { editor } from "$/app/editor"

/****************
 * ### `<ModalRoot>`
 * Root used to display modals shown with `editor.showModal()`.
 * - Only shows the top-most modal at a time.
 * - You should have one of these at the top level of your app, e.g. `<ModalRoot />` -- that's it!
 ****************/
export const ModalRoot = view(() => {
  const { modals } = editor
  if (!modals.length) return null
  const { component, props, resolve, reject } = modals[0]!
  return React.createElement(component, { key: props.id, props, resolve, reject })
})
