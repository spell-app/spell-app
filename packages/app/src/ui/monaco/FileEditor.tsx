/** @jsxImportSource react */
import type { SP } from "$/spell"
import { MonacoEditor, type MonacoEditorProps } from "./MonacoEditor"
import { SpellMonaco } from "./SpellMonaco"

/****************
 * ### `<FileEditor>`
 * `<MonacoEditor>` showing `file`'s model -- see `SpellModels`, which keeps it and the file in step.
 * - No `file` yet => a placeholder saying so.
 * - Give it a `key` per file for a fresh editor each.
 ****************/
export function FileEditor({ file, onMount, onUnmount }: FileEditorProps) {
  return (
    <MonacoEditor
      model={file && SpellMonaco.models.modelFor(file)}
      value={file ? undefined : "Loading"}
      onMount={onMount}
      onUnmount={onUnmount}
    />
  )
}

/** Props for `<FileEditor>`. */
export type FileEditorProps = Pick<MonacoEditorProps, "onMount" | "onUnmount"> & {
  /** File to edit, if we have one yet. */
  file: SP.AnySpellFile | undefined
}
