import React from "react"

import { view } from "~/util"

import { actions } from "~/app/actions"
import { UI } from "./ui"
import { ErrorHandler } from "./ErrorHandler"
import type { ErrorHandlerState, ErrorHandlerWrapperProps } from "./ErrorHandler"
import { CodeMirror, inputOptions } from "./CodeMirror"
import { store } from "~/app/store"

import "./InputEditor.less"

export type InputRootProps = {
  showToolbar?: boolean
}

/**
 *  Root element to show the `<InputEditor/>` in `SpellEditor`
 */
export const InputRoot = React.memo(function InputRoot({ showToolbar = true }: InputRootProps) {
  return (
    <div className="InputRoot">
      {!!showToolbar && <InputToolbar />}
      <InputEditor showError={store.showError} />
    </div>
  )
})

export function InputToolbar() {
  return (
    <UI.PanelMenu>
      <UI.Submenu left spring>
        <UI.FileDropdown />
      </UI.Submenu>
      <UI.Submenu right spring>
        <actions.compileApp />
        <actions.saveFile />
        <actions.reloadFile />
        <actions.createFile />
        <UI.FileActionsDropdown />
      </UI.Submenu>
    </UI.PanelMenu>
  )
}

export type InputEditorProps = {
  showError?: (error: unknown) => void
  /** Never actually passed by `<InputRoot>` today; kept so `getDerivedStateFromProps` below still compiles/works. */
  match?: unknown
}

type InputEditorState = ErrorHandlerState & { match?: unknown }

export class InputEditor extends ErrorHandler<InputEditorProps> {
  /** Clear `state.error` if `props.match` changes. */
  static getDerivedStateFromProps(props: InputEditorProps, oldState: InputEditorState): Partial<InputEditorState> {
    const newState: Partial<InputEditorState> = { match: props.match }
    if (oldState.match !== newState.match) newState.error = undefined
    return newState
  }

  /* Show error in UI when caught. */
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
   * Memoized top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   */
  Component = view(function InputEditorInner() {
    const { file } = store
    // Call `store.onInputEffect()` to adjust selection on initial render
    React.useEffect(store.onInputEffect)
    return (
      <CodeMirror
        key={file?.path || "loading"}
        value={file?.contents ?? "Loading"}
        options={inputOptions}
        editorDidMount={store.onInputDidMount}
        editorWillUnmount={store.onInputWillUnmount}
        onBeforeChange={store.onInputChanged}
        onCursorActivity={store.onInputCursor}
        onScroll={store.onInputCursor}
      />
    )
  })

  /**
   * Memoized top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   */
  ErrorComponent = view(function InputEditorInner(_props: InputEditorProps & { error: Error }) {
    const { file } = store

    // Call `store.onInputEffect()` to adjust selection on initial render
    React.useEffect(store.onInputEffect)

    // if we got a CodeMirror `error` in a previous draw,
    // remove the `mode` or we'll get an endless loop of pain
    const { mode: _mode, ...options } = inputOptions

    return (
      <CodeMirror
        key="error"
        value={file?.contents ?? "Loading"}
        options={options}
        editorDidMount={store.onInputDidMount}
        editorWillUnmount={store.onInputWillUnmount}
        onBeforeChange={store.onInputChanged}
        onCursorActivity={store.onInputCursor}
        onScroll={store.onInputCursor}
      />
    )
  })
}
