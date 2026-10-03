import { createEffect, onSettled, untrack } from "solid-js"

import { monaco, SpellMonaco } from "$/app/ui/monaco"

import "./MonacoEditor.css"

/****************
 * ### `<MonacoEditor>`
 * A Monaco editor showing `model`, or else `value` in `language`, filling its parent.
 * - Made once, when it's settled into the page:  remount it for a fresh editor, e.g. per file
 *   (`<Show when={path()} keyed>`).
 * - `model` is someone else's, e.g. from `SpellMonaco.models`, which it follows:  we never dispose of it.
 *   Without one, the editor makes its own, and disposes of it on unmount.
 * - A new `value` goes into the editor only if it differs from what's there.  It's a new starting point, e.g. the
 *   file loaded or reloaded, so undo can't go back past it.  It does NOT call `onChange`:  that's only for the
 *   user's own edits.
 * - `onMount` / `onUnmount` hand out the editor itself, e.g. to add commands or follow the cursor.
 * - Works in a shadow root too, e.g. `<spell-editor>`'s -- see `keepMouseMovesInShadowRoot()`.
 * - NOTE: the editor is a plain variable, not a signal:  the effects below only follow PROPS, and making the
 *   editor reads the props as they are then, so a prop changed before it's made is still taken.
 ****************/
export function MonacoEditor(props: MonacoEditorProps) {
  let element!: HTMLDivElement
  /** The editor, once made. */
  let instance: monaco.editor.IStandaloneCodeEditor | undefined
  /** Set while we put `value` into the editor, so that edit isn't reported to `onChange`. */
  let isApplyingValue = false

  // Make the editor once it's in the page, and dispose of it and its own model on unmount.
  onSettled(() => {
    const { editor, ownModel } = untrack(create)
    return () => {
      props.onUnmount?.(editor)
      instance = undefined
      editor.dispose()
      ownModel?.dispose()
    }
  })

  // Show a new `model`.
  createEffect(
    () => props.model,
    (model) => {
      if (instance && model && instance.getModel() !== model) instance.setModel(model)
    }
  )

  // Take on a new `value`, as a new starting point for undo.
  createEffect(
    () => props.value,
    (value) => {
      applyValue(value)
    }
  )

  // Take on a new `language` -- only for our own model:  one we're given has its own.
  createEffect(
    () => [props.model, props.language ?? "plaintext"] as const,
    ([model, language]) => {
      const ownModel = model ? undefined : instance?.getModel()
      if (ownModel && ownModel.getLanguageId() !== language) monaco.editor.setModelLanguage(ownModel, language)
    }
  )

  return <div ref={(div) => (element = div)} class="MonacoEditor" />

  /**
   * Make the editor in `element`, from the props as they are now.
   * - SIDE EFFECT:  sets `instance`, follows edits into `onChange`, calls `onMount`.  Monaco disposes of the
   *   edit listener and the mouse-move keeper with the editor (see `onDidDispose`).
   */
  function create() {
    SpellMonaco.register()
    const { model, value, language = "plaintext" } = props
    const editor = monaco.editor.create(element, {
      ...SpellMonaco.OPTIONS,
      ...props.options,
      ...(model ? { model } : { value: value ?? "", language })
    })
    const ownModel = model ? undefined : (editor.getModel() ?? undefined)
    editor.onDidChangeModelContent(() => {
      // `props.onChange` read now:  always the latest
      if (!isApplyingValue) props.onChange?.(editor.getValue())
    })
    editor.onDidDispose(keepMouseMovesInShadowRoot(editor))
    instance = editor
    props.onMount?.(editor, monaco)
    return { editor, ownModel }
  }

  /** Put `value` into the editor's model, if it differs, without telling `onChange`. */
  function applyValue(value: string | undefined) {
    const model = instance?.getModel()
    if (!model || value === undefined || value === model.getValue()) return
    isApplyingValue = true
    try {
      model.setValue(value)
    } finally {
      isApplyingValue = false
    }
  }
}

/**
 * HACK:  if `editor` is in a shadow root, stop mouse moves over it there, so the page's `document` never hears of them.
 * - Why:  Monaco listens for `mousemove` on `document` to see the mouse leave the editor -- see its `MouseHandler`.
 *   Heard from `document`, a move inside a shadow root is the HOST's, NOT inside the editor, so Monaco decides
 *   the mouse left on every move, and hides the hover before it shows.
 * - Monaco's own listeners, inside the editor, still hear every move.  Moves elsewhere in the shadow root, or
 *   out of it, still reach `document`, so leaving is still seen.
 * - Returns what stops it.  Does nothing outside a shadow root.
 * - NOTE: a copy of the React `MonacoEditor.tsx`'s (not exported there);  that one goes with React (P8).
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
  /** Editor options, over `SpellMonaco.OPTIONS`.  Only read when the editor's made. */
  options?: monaco.editor.IStandaloneEditorConstructionOptions
  /** Called with the editor's whole text after each edit the USER makes. */
  onChange?: (value: string) => void
  /** Called with the editor once it's made -- and Monaco itself, as it's loaded lazily (see `LazyMonaco`). */
  onMount?: (editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) => void
  /** Called with the editor just before it's disposed of. */
  onUnmount?: (editor: monaco.editor.IStandaloneCodeEditor) => void
}
