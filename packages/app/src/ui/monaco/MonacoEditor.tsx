/** @jsxImportSource react */
import React from "react"

import { monaco } from "./monaco"
import { SpellMonaco } from "./SpellMonaco"

import "./MonacoEditor.css"

/****************
 * ### `<MonacoEditor>`
 * A Monaco editor showing `model`, or else `value` in `language`, filling its parent.
 * - Made once, on mount:  change `key` for a fresh editor, e.g. per file.
 * - `model` is someone else's, e.g. from `SpellMonaco.models`, which it follows:  we never dispose of it.
 *   Without one, the editor makes its own, and disposes of it on unmount.
 * - A new `value` goes into the editor only if it differs from what's there.  It's a new starting point, e.g. the
 *   file loaded or reloaded, so undo can't go back past it.  It does NOT call `onChange`:  that's only for the
 *   user's own edits.
 * - `onMount` / `onUnmount` hand out the editor itself, e.g. to add commands or follow the cursor.
 * - Works in a shadow root too, e.g. `<spell-editor>`'s -- see `keepMouseMovesInShadowRoot()`.
 ****************/
export function MonacoEditor({
  model,
  value,
  language = "plaintext",
  options,
  onChange,
  onMount,
  onUnmount
}: MonacoEditorProps) {
  const element = React.useRef<HTMLDivElement>(null)
  const [instance, setInstance] = React.useState<monaco.editor.IStandaloneCodeEditor>()
  /** Set while we put `value` into the editor, so that edit isn't reported to `onChange`. */
  const isApplyingValue = React.useRef(false)
  /** Latest `onChange`, for the listener made on mount. */
  const latestOnChange = React.useRef(onChange)
  React.useEffect(() => {
    latestOnChange.current = onChange
  }, [onChange])

  // Make the editor on mount, and dispose of it and its model on unmount.
  // NOTE: deliberately runs once:  every prop it reads is only its STARTING value.
  React.useEffect(() => {
    SpellMonaco.register()
    const editor = monaco.editor.create(element.current!, {
      ...SpellMonaco.OPTIONS,
      ...options,
      ...(model ? { model } : { value: value ?? "", language })
    })
    const ownModel = model ? undefined : editor.getModel()
    const listener = editor.onDidChangeModelContent(() => {
      if (!isApplyingValue.current) latestOnChange.current?.(editor.getValue())
    })
    const stopKeepingMouseMoves = keepMouseMovesInShadowRoot(editor)
    setInstance(editor)
    onMount?.(editor, monaco)
    return () => {
      onUnmount?.(editor)
      stopKeepingMouseMoves()
      listener.dispose()
      editor.dispose()
      ownModel?.dispose()
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Show a new `model`.
  React.useEffect(() => {
    if (instance && model && instance.getModel() !== model) instance.setModel(model)
  }, [instance, model])

  // Take on a new `value`, as a new starting point for undo.
  React.useEffect(() => {
    const model = instance?.getModel()
    if (!model || value === undefined || value === model.getValue()) return
    isApplyingValue.current = true
    try {
      model.setValue(value)
    } finally {
      isApplyingValue.current = false
    }
  }, [instance, value])

  // Take on a new `language` -- only for our own model:  one we're given has its own.
  React.useEffect(() => {
    const ownModel = model ? undefined : instance?.getModel()
    if (ownModel && ownModel.getLanguageId() !== language) monaco.editor.setModelLanguage(ownModel, language)
  }, [instance, model, language])

  return <div ref={element} className="MonacoEditor" />
}

/**
 * HACK:  if `editor` is in a shadow root, stop mouse moves over it there, so the page's `document` never hears of them.
 * - Why:  Monaco listens for `mousemove` on `document` to see the mouse leave the editor -- see its `MouseHandler`.
 *   Heard from `document`, a move inside a shadow root is the HOST's, NOT inside the editor, so Monaco decides
 *   the mouse left on every move, and hides the hover before it shows.
 * - Monaco's own listeners, inside the editor, still hear every move.  Moves elsewhere in the shadow root, or
 *   out of it, still reach `document`, so leaving is still seen.
 * - Returns what stops it.  Does nothing outside a shadow root.
 */
function keepMouseMovesInShadowRoot(editor: monaco.editor.IStandaloneCodeEditor): () => void {
  const node = editor.getContainerDomNode()
  const root = node.getRootNode()
  if (!(root instanceof ShadowRoot)) return () => {}
  const keep = (event: Event) => {
    if (event.composedPath().includes(node)) event.stopPropagation()
  }
  root.addEventListener("mousemove", keep)
  return () => root.removeEventListener("mousemove", keep)
}

/** Props for `<MonacoEditor>`. */
export type MonacoEditorProps = {
  /** Model to show, e.g. from `SpellMonaco.models`.  Wins over `value` + `language`. */
  model?: monaco.editor.ITextModel
  /** Text to show, if no `model`.  Omit to leave the editor's text alone. */
  value?: string
  /** Monaco language id, if no `model`, e.g. `"spell"` -- see `SpellMonaco.languageForPath()`.  Default `"plaintext"`. */
  language?: string
  /** Editor options, over `SpellMonaco.OPTIONS`.  Only read on mount. */
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  /** Called with the editor's whole text after each edit the USER makes. */
  onChange?: (value: string) => void
  /** Called with the editor once it's made -- and Monaco itself, as it's loaded lazily (see `UI.LazyMonaco`). */
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) => void
  /** Called with the editor just before it's disposed of. */
  onUnmount?: (editor: monaco.editor.IStandaloneCodeEditor) => void
}
