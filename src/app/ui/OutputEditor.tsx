import { view } from "~/util"
import { editor } from "~/app/editor"
import { CodeMirror, outputOptions } from "./CodeMirror"

/****************
 * ### `<OutputEditor>`
 * Use CodeMirror to display `editor.file` output.
 * NOTE: not currently used.
 ****************/
export const OutputEditor = view(function OutputEditor() {
  const { file } = editor
  const compiled = (file && "compiled" in file ? file.compiled : undefined) ?? ""
  // console.info("OutputEditor", { file, compiled })
  return (
    <div className="CodeMirrorContainer">
      <CodeMirror value={compiled} options={outputOptions} onBeforeChange={() => {}} />
    </div>
  )
})
