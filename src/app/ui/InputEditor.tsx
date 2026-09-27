import React from "react"

import { view } from "~/util"

import { editor } from "~/app/editor"

import { UI } from "~/app/ui"
import { Actions } from "./Actions"
import { ErrorHandler, type ErrorHandlerState, type ErrorHandlerWrapperProps } from "./ErrorHandler"
import { CodeMirror, inputOptions } from "./CodeMirror"

import "./InputEditor.less"

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
 * Top-level error-handling wrapper around the CodeMirror `spell` source editor.
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
   * `<CodeMirror>` bound to `editor.file`'s contents, wired to save/reload/compile keys and to
   * push cursor/scroll/change events back into `editor`.
   * NOTE: was previously worded as if for a `spellFile.match` producing `<MatchView>`/`<TokenView>`
   * elements -- stale, copy-pasted from `MatchViewer`'s equivalent field.  Corrected here.
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
      <CodeMirror
        key={file?.path || "loading"}
        value={file?.contents ?? "Loading"}
        options={inputOptions}
        editorDidMount={editor.onInputDidMount}
        editorWillUnmount={editor.onInputWillUnmount}
        onBeforeChange={editor.onInputChanged}
        onCursorActivity={editor.onInputCursor}
        onScroll={editor.onInputCursor}
      />
    )
  })

  /**
   * Fallback `<CodeMirror>` rendered after a caught error.
   * - SIDE EFFECT: strips `mode` from `inputOptions` -- re-attaching the `spell` mode after an
   *   error previously caused an endless loop of pain (see inline comment below).
   * NOTE: was previously worded as if for a `spellFile.match` producing `<MatchView>`/`<TokenView>`
   * elements -- stale, copy-pasted from `MatchViewer`'s equivalent field.  Corrected here.
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

    // if we got a CodeMirror `error` in a previous draw,
    // remove the `mode` or we'll get an endless loop of pain
    const { mode: _mode, ...options } = inputOptions

    return (
      <CodeMirror
        key="error"
        value={file?.contents ?? "Loading"}
        options={options}
        editorDidMount={editor.onInputDidMount}
        editorWillUnmount={editor.onInputWillUnmount}
        onBeforeChange={editor.onInputChanged}
        onCursorActivity={editor.onInputCursor}
        onScroll={editor.onInputCursor}
      />
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
