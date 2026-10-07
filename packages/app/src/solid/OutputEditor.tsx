import { Loading, Show } from "solid-js"

import { editor } from "$/app/editor"
import { ErrorBoundary, MenuHeader, MoreMenu, PanelMenu, Submenu, tracked } from "$/app/solid"
import { LazyMonaco } from "./LazyMonaco"

import "./OutputEditor.css"

/****************
 * ### `<OutputRoot>`
 * Root element to show the `<OutputEditor/>` in `SpellEditor`:  the "Javascript Output" pane.
 ****************/
export function OutputRoot(props: OutputRootProps) {
  return (
    <div class="OutputRoot">
      <Show when={props.showToolbar ?? true}>
        <OutputToolbar />
      </Show>
      <OutputEditor showError={editor.showError} />
    </div>
  )
}

/** Props for `<OutputRoot>`. */
export type OutputRootProps = {
  /** Show `<OutputToolbar>` above editor.  Default:  `true`. */
  showToolbar?: boolean
}

/****************
 * ### `<OutputToolbar>`
 * Toolbar above `<OutputEditor>`:  just a header today (no actions).
 ****************/
export function OutputToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <MenuHeader>Javascript Output</MenuHeader>
      </Submenu>
      <Submenu right spring>
        <MoreMenu stub />
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<OutputEditor>`
 * Read-only Monaco showing `editor.file`'s compiled javascript, guarded by an `<ErrorBoundary>`.
 * - Coloured by Monaco's own javascript highlighting;  it doesn't follow the cursor in `<InputEditor>`.
 ****************/
export function OutputEditor(props: OutputEditorProps) {
  const compiled = tracked(() => {
    const { file } = editor
    return (file && "compiled" in file ? file.compiled : undefined) ?? ""
  })
  return (
    <div class="OutputEditor">
      <ErrorBoundary onError={(error) => props.showError?.(error)}>
        <Loading fallback={<LazyMonaco.Loading />}>
          <LazyMonaco.MonacoEditor value={compiled()} language="javascript" options={{ readOnly: true }} />
        </Loading>
      </ErrorBoundary>
    </div>
  )
}

/** Props for `<OutputEditor>`. */
export type OutputEditorProps = {
  /** Called with each error caught. */
  showError?: (error: unknown) => void
}
