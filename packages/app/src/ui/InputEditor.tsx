/** @jsxImportSource react */
import React from "react"

import { view } from "$/util"

import { editor } from "$/app/editor"

import { UI } from "$/app/ui"
import { Actions } from "./Actions"
import { ErrorHandler, type ErrorHandlerState, type ErrorHandlerWrapperProps } from "./ErrorHandler"
import { LazyMonaco } from "./LazyMonaco"

import "./InputEditor.css"

/****************
 * ### `<InputRoot>`
 * Root element to show the `<InputEditor/>` in `SpellEditor`.
 ****************/
export const InputRoot = React.memo(function InputRoot({ showToolbar = true }: InputRootProps) {
  return (
    <div className="InputRoot">
      {!!showToolbar && <InputToolbar />}
      <InputEditor showError={editor.showError} />
    </div>
  )
})

/** Props for `<InputRoot>`. */
export type InputRootProps = {
  /** Show `<InputToolbar>` above editor. */
  showToolbar?: boolean
}

/****************
 * ### `<InputToolbar>`
 * Toolbar above `<InputEditor>`: file dropdown, `compileApp`/`saveFile`/`reloadFile`/`createFile`
 * actions and the file-actions dropdown.
 ****************/
export function InputToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.FileDropdown />
      </UI.Submenu>
      <UI.Submenu right spring>
        <Actions.compileApp />
        <Actions.saveFile />
        <Actions.reloadFile />
        <Actions.createFile />
        <UI.FileActionsDropdown />
      </UI.Submenu>
    </UI.PanelMenu>
  )
}

/****************
 * ### `<InputEditor>`
 * Top-level error-handling wrapper around the Monaco source editor.
 ****************/
export class InputEditor extends ErrorHandler<InputEditorProps> {
  /** Clear `state.error` if `props.match` changes. */
  static getDerivedStateFromProps(props: InputEditorProps, oldState: InputEditorState): Partial<InputEditorState> {
    const newState: Partial<InputEditorState> = { match: props.match }
    if (oldState.match !== newState.match) newState.error = undefined
    return newState
  }

  /** Show error in UI when caught. */
  componentDidCatch(error: Error) {
    this.props.showError?.(error)
  }

  /**
   * Wrapper class to manage scrolling.
   * This is automatically drawn by `ErrorHandler`,
   * and will be passed `Component` for actual `InputEditor`.
   */
  Wrapper = ({ component, error }: ErrorHandlerWrapperProps<InputEditorProps>) => {
    return (
      <div key={error ? "error" : "noerror"} className="InputEditor">
        {component}
      </div>
    )
  }

  /**
   * `<FileEditor>` on `editor.file` -- Monaco, loaded on first use (see `LazyMonaco`).
   * - A fresh editor per file (`key`).
   * - `editor.onInputDidMount()` wires save/reload/compile keys, and cursor/scroll events back into `editor`.
   */
  Component = view(function InputEditorInner() {
    const { file } = editor
    // Call `editor.onInputEffect()` after each render to adjust selection.
    // NOTE: wrapped in an inline function rather than passed directly -- `editor.onInputEffect` is an
    // opaque `editor` method, so the hooks lint rule can't see what it depends on.
    // NOTE: intentionally no dep array -- selection must be re-applied on every render.
    React.useEffect(() => {
      editor.onInputEffect()
    })
    return (
      <React.Suspense fallback={<LazyMonaco.Loading />}>
        <LazyMonaco.FileEditor
          key={file?.path || "loading"}
          file={file}
          onMount={editor.onInputDidMount}
          onUnmount={editor.onInputWillUnmount}
        />
      </React.Suspense>
    )
  })

  /**
   * Fallback `<MonacoEditor>` rendered after a caught error:  plain text, NO spell colouring,
   * in case colouring is what threw -- re-attaching it would just throw again.
   */
  ErrorComponent = view(function InputEditorInner(_props: InputEditorProps & { error: Error }) {
    const { file } = editor

    // Call `editor.onInputEffect()` after each render to adjust selection.
    // NOTE: wrapped in an inline function rather than passed directly -- `editor.onInputEffect` is an
    // opaque `editor` method, so the hooks lint rule can't see what it depends on.
    // NOTE: intentionally no dep array -- selection must be re-applied on every render.
    React.useEffect(() => {
      editor.onInputEffect()
    })

    return (
      <React.Suspense fallback={<LazyMonaco.Loading />}>
        <LazyMonaco.MonacoEditor
          key="error"
          value={file?.contents ?? "Loading"}
          language="plaintext"
          onMount={editor.onInputDidMount}
          onUnmount={editor.onInputWillUnmount}
          onChange={editor.onInputChanged}
        />
      </React.Suspense>
    )
  })
}

/** State for `<InputEditor>`: `ErrorHandlerState` plus the (currently always-`undefined`) `match`. */
type InputEditorState = ErrorHandlerState & { match?: unknown }

/** Props for `<InputEditor>`. */
export type InputEditorProps = {
  /** Called with caught render error. */
  showError?: (error: unknown) => void
  /** Never actually passed by `<InputRoot>` today; kept so `getDerivedStateFromProps` below still compiles/works. */
  match?: unknown
}
