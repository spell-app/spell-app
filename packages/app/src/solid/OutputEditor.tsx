import { Loading } from "solid-js"

import { editor } from "$/app/editor"
import { tracked } from "$/app/solid"
import { LazyMonaco } from "./LazyMonaco"

/****************
 * ### `<OutputEditor>`
 * Read-only Monaco showing `editor.file`'s compiled javascript.
 * NOTE: not currently used.
 ****************/
export function OutputEditor() {
  const compiled = tracked(() => {
    const { file } = editor
    return (file && "compiled" in file ? file.compiled : undefined) ?? ""
  })
  return (
    <Loading fallback={<LazyMonaco.Loading />}>
      <LazyMonaco.MonacoEditor value={compiled()} language="javascript" options={{ readOnly: true }} />
    </Loading>
  )
}
