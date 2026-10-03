import { Loading, Show, createEffect, createMemo } from "solid-js"

import { editor } from "$/app/editor"
import type { monaco } from "$/app/solid/monaco"
import { Actions, ErrorBoundary, FileActionsDropdown, PanelMenu, Submenu, tracked } from "$/app/solid"
import { FileDropdown } from "./FileDropdown"
import { LazyMonaco } from "./LazyMonaco"

import "./InputEditor.css"

/****************
 * ### `<InputRoot>`
 * Root element to show the `<InputEditor/>` in `SpellEditor`.
 ****************/
export function InputRoot(props: InputRootProps) {
  return (
    <div class="InputRoot">
      <Show when={props.showToolbar ?? true}>
        <InputToolbar />
      </Show>
      <InputEditor showError={editor.showError} />
    </div>
  )
}

/** Props for `<InputRoot>`. */
export type InputRootProps = {
  /** Show `<InputToolbar>` above editor.  Default:  `true`. */
  showToolbar?: boolean
}

/****************
 * ### `<InputToolbar>`
 * Toolbar above `<InputEditor>`: file dropdown, `compileApp`/`saveFile`/`reloadFile`/`createFile`
 * actions and the file-actions dropdown.
 ****************/
export function InputToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <FileDropdown />
      </Submenu>
      <Submenu right spring>
        <Actions.compileApp />
        <Actions.saveFile />
        <Actions.reloadFile />
        <Actions.createFile />
        <FileActionsDropdown />
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<InputEditor>`
 * The Monaco source editor on `editor.file`, guarded by an `<ErrorBoundary>`.
 * - `<FileEditor>` -- Monaco, loaded on first use (see `LazyMonaco`) -- remade per file:  keyed by its path.
 * - `editor.onInputDidMount()` wires save/reload/compile keys, and cursor/scroll events back into `editor`.
 * - `editor.onInputEffect()` (scroll to and select `file.initialSelection`) runs once the editor's made, and again
 *   whenever `editor.file`, its `isLoaded` or its `initialSelection` change.
 * - On an error:  `showError()` is told, and a plain-text `<FallbackEditor>` takes over.  It heals by itself when
 *   what threw changes (see `<ErrorBoundary>`).
 * - NOTE: React's `match` prop (never passed, it reset the error on change) is gone:  the boundary heals itself.
 ****************/
export function InputEditor(props: InputEditorProps) {
  return (
    <div class="InputEditor">
      <ErrorBoundary onError={(error) => props.showError?.(error)} fallback={() => <FallbackEditor />}>
        <FileInputEditor />
      </ErrorBoundary>
    </div>
  )
}

/** Props for `<InputEditor>`. */
export type InputEditorProps = {
  /** Called with each error caught. */
  showError?: (error: unknown) => void
}

/****************
 * ### `<FileInputEditor>`
 * `<InputEditor>`'s normal editor:  `<FileEditor>` on `editor.file`, a fresh one per file.
 ****************/
function FileInputEditor() {
  const file = tracked(() => editor.file)
  /** Remakes the editor when it changes:  the file's path, or `"loading"` before there's a file. */
  const key = createMemo(() => file()?.path || "loading")
  followInitialSelection()
  return (
    <Loading fallback={<LazyMonaco.Loading />}>
      <Show when={key()} keyed>
        {(_key) => <LazyMonaco.FileEditor file={file()} onMount={didMount} onUnmount={editor.onInputWillUnmount} />}
      </Show>
    </Loading>
  )
}

/****************
 * ### `<FallbackEditor>`
 * `<InputEditor>`'s editor after a caught error:  plain text, NO spell colouring, in case colouring is what
 * threw -- re-attaching it would just throw again.  It has no model, so edits go in through
 * `editor.onInputChanged()`.
 ****************/
function FallbackEditor() {
  const contents = tracked(() => editor.file?.contents ?? "Loading")
  followInitialSelection()
  return (
    <Loading fallback={<LazyMonaco.Loading />}>
      <LazyMonaco.MonacoEditor
        value={contents()}
        language="plaintext"
        onMount={didMount}
        onUnmount={editor.onInputWillUnmount}
        onChange={editor.onInputChanged}
      />
    </Loading>
  )
}

/**
 * The input editor is made:  hand it to `editor`, then select `file.initialSelection`, if any.
 * - Why the second step:  the editor arrives after the file did (Monaco loads lazily, and makes its editor once
 *   settled), so the `followInitialSelection()` run for that file came too early.
 */
function didMount(inputEditor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) {
  editor.onInputDidMount(inputEditor, api)
  editor.onInputEffect()
}

/**
 * Call `editor.onInputEffect()` whenever `editor.file`, its `isLoaded` or its `initialSelection` change, to
 * scroll to and select that.
 * - Call in a component body:  the effect and its `tracked()` go with the component.
 * - React ran it after every render, i.e. when `editor.file` changed;  this also catches the file loading later.
 */
function followInitialSelection() {
  const wanted = tracked(() => {
    const { file } = editor
    return [file, file?.isLoaded, file?.initialSelection] as const
  })
  createEffect(wanted, () => {
    editor.onInputEffect()
  })
}
