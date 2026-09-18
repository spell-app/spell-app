import React from "react"

import { view } from "~/util"

import { store } from "~/app/store"

/****************
 * ### `<ModalRoot>`
 * Root used to display modals shown with `store.showModal()`.
 * - Only shows the top-most modal at a time.
 * - You should have one of these at the top level of your app, e.g. `<ModalRoot />` -- that's it!
 ****************/
export const ModalRoot = view(() => {
  const { modals } = store
  if (!modals.length) return null
  const { component, props, resolve, reject } = modals[0]!
  return React.createElement(component, { key: props.id, props, resolve, reject })
})

/**
 * Props `<ModalRoot>` hands to whichever modal component it is showing.
 * - `P` is the modal's own prop bag, `Result` what its `resolve()` yields.
 * - NOTE: lives here rather than beside each modal since `Alert`/`Confirm`/`Prompt`/`Chooser`
 *   all share it -- and `store.ts` type-erases it to stack heterogeneous modals.
 */
export type ModalComponentProps<P, Result = unknown> = {
  id?: string | number
  props: P
  resolve: (value?: Result) => void
  reject?: (reason?: unknown) => void
}
