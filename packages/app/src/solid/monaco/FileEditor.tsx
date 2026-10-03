import { createMemo } from "solid-js"

import type { SP } from "$/spell"

import { SpellMonaco } from "$/app/ui/monaco"
import { MonacoEditor, type MonacoEditorProps } from "./MonacoEditor"

/****************
 * ### `<FileEditor>`
 * `<MonacoEditor>` showing `file`'s model -- see `SpellModels`, which keeps it and the file in step.
 * - No `file` yet => a placeholder saying so.
 * - Remount it per file for a fresh editor each, e.g. `<Show when={path()} keyed>`.
 * - The model is a memo:  `modelFor()` has side effects (it may dispose of another project's models), so it runs
 *   once per `file`, not once per read of `model`.
 ****************/
export function FileEditor(props: FileEditorProps) {
  const model = createMemo(() => (props.file ? SpellMonaco.models.modelFor(props.file) : undefined))
  return (
    <MonacoEditor
      model={model()}
      value={props.file ? undefined : "Loading"}
      onMount={props.onMount}
      onUnmount={props.onUnmount}
    />
  )
}

/** Props for `<FileEditor>`. */
export type FileEditorProps = Pick<MonacoEditorProps, "onMount" | "onUnmount"> & {
  /** File to edit, if we have one yet. */
  file: SP.AnySpellFile | undefined
}
