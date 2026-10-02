/** @jsxImportSource react */
import React from "react"

import { view } from "$/util"
import { editor } from "$/app/editor"
import { LazyMonaco } from "./LazyMonaco"

/****************
 * ### `<OutputEditor>`
 * Read-only Monaco showing `editor.file`'s compiled javascript.
 * NOTE: not currently used.
 ****************/
export const OutputEditor = view(function OutputEditor() {
  const { file } = editor
  const compiled = (file && "compiled" in file ? file.compiled : undefined) ?? ""
  return (
    <React.Suspense fallback={<LazyMonaco.Loading />}>
      <LazyMonaco.MonacoEditor value={compiled} language="javascript" options={{ readOnly: true }} />
    </React.Suspense>
  )
})
