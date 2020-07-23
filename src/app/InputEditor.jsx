import React from "react"
import { view } from "~/util"
import { store } from "./store"
import { CodeMirror, inputOptions } from "./CodeMirror"

/**
 * Create an ErrorBoundary component to re-render the InputEditor if CodeMirror throws.
 */
export class InputEditor extends React.Component {
  state = { error: undefined }

  static getDerivedStateFromError(error) {
    console.warn("InputEditor error boundary got error", error)
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    store.showError(error)
  }
  render() {
    const { error } = this.state
    // make sure we re-render if CodeMirror trips the error boundary
    const editor = error ? <InputEditorInner key="noerror" /> : <InputEditorInner key="error" error={error} />
    return (
      <div id="InputEditor" className="CodeMirrorContainer">
        {editor}
      </div>
    )
  }
}

const InputEditorInner = view(function InputEditorInner({ error }) {
  const { file, selection } = store
  // console.info("InputEditorInner", file, file?.contents?.split("\n")[0])

  // Call `store.onInputEffect()` to adjust selection on initial render
  React.useEffect(store.onInputEffect)

  // if we got a CodeMirror `error` in a previous draw,
  // remove the `mode` or we'll get an endless loop of pain
  let options = inputOptions
  if (error) {
    options = { ...options }
    delete options.mode
  }
  return (
    <CodeMirror
      key={(error && "error") || file?.path || "loading"}
      value={file?.contents ?? "Loading"}
      disabled
      options={options}
      editorDidMount={store.onInputDidMount}
      editorWillUnmount={store.onInputWillUnmount}
      onBeforeChange={store.onInputChanged}
      onCursorActivity={store.onInputCursor}
      onScroll={store.onInputCursor}
    />
  )
})
