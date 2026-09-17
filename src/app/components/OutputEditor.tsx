import { view } from "~/util"
import { store } from "~/app/store"
import { CodeMirror, outputOptions } from "./CodeMirror"

/**
 * Use CodeMirror to display `store.file` output.
 * NOTE: not currently used.
 */
export const OutputEditor = view(function OutputEditor() {
  const { file } = store
  const compiled = (file && "compiled" in file ? file.compiled : undefined) ?? ""
  // console.info("OutputEditor", { file, compiled })
  return (
    <div className="CodeMirrorContainer">
      <CodeMirror value={compiled} options={outputOptions} onBeforeChange={() => {}} />
    </div>
  )
})
