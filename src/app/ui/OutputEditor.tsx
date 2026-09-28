import { view } from "~/util"
import { editor } from "~/app/editor"
import { MonacoEditor } from "~/app/ui/monaco"

/****************
 * ### `<OutputEditor>`
 * Read-only Monaco showing `editor.file`'s compiled javascript.
 * NOTE: not currently used.
 ****************/
export const OutputEditor = view(function OutputEditor() {
  const { file } = editor
  const compiled = (file && "compiled" in file ? file.compiled : undefined) ?? ""
  return <MonacoEditor value={compiled} language="javascript" options={{ readOnly: true }} />
})
