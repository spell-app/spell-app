import React from "react"
import { view } from "~/util"
import { store } from "./store"
import { CodeMirror, outputOptions } from "./CodeMirror"

/**
 * Use CodeMirror to display `store.file` output.
 * NOTE: not currently used.
 */
export const OutputEditor = view(function OutputEditor() {
  const { file } = store
  const compiled = file?.compiled
  // console.info("OutputEditor", { file, compiled })
  return (
    <div className="CodeMirrorContainer">
      <CodeMirror value={compiled} disabled options={outputOptions} onChange={Function.prototype} />
    </div>
  )
})
