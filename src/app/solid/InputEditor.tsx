import { For, Loading, Show, createEffect, createMemo, createSignal } from "solid-js"

import { editor } from "spell-app/app/editor"
import { editorPrefs } from "spell-app/app/editorPrefs"
import { appTexts } from "spell-app/app/ui/AppTexts"
import type { monaco } from "spell-app/app/solid/monaco"
import { Actions, ErrorBoundary, MoreMenu, PanelMenu, Submenu, tracked } from "spell-app/app/solid"
import { isStaticBuild } from "spell-app/app/static/staticBuild"
import { FileDropdown } from "./FileDropdown"
import { LazyMonaco } from "./LazyMonaco"
import { SpellxNotebook } from "./SpellxNotebook"

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
      <Show when={InputView.isNotebook} fallback={<InputEditor showError={editor.showError} />}>
        <NotebookRoot />
      </Show>
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
 * Toolbar above `<InputEditor>`:  the file dropdown;  Save, Reload and New File as icons with tooltips;
 * then a "..." menu:  the file's actions (`Actions.FILE_DROPDOWN_ACTIONS`), and "Show line numbers".
 * - The static build has no file actions, so its menu holds only the line numbers.
 * - No Compile:  the editor compiles as you type, and on ⌘↵.
 ****************/
export function InputToolbar() {
  return (
    <PanelMenu>
      <Submenu left spring>
        <FileDropdown />
      </Submenu>
      <Submenu right spring class="InputTools">
        <Show when={InputView.canShowNotebook}>
          <InputViewSwitch />
        </Show>
        <Actions.saveFile iconOnly />
        <Actions.reloadFile iconOnly />
        <Actions.createFile iconOnly />
        <MoreMenu direction="left" class="FileMoreMenu">
          <Actions.FILE_DROPDOWN_ACTIONS />
          <Show when={!isStaticBuild}>
            <ui-item type="divider" />
          </Show>
          <ui-item
            value="lineNumbers"
            icon={LineNumbers.isShowing ? "check square outline" : "square outline"}
            onClick={() => LineNumbers.toggle()}
          >
            {appTexts.text("showLineNumbers")}
          </ui-item>
        </MoreMenu>
      </Submenu>
    </PanelMenu>
  )
}

/****************
 * ### `<InputViewSwitch>`
 * Text | Notebook, for a `.spellx` file (epic `elemental-spell` P11):  how `<InputRoot>` shows it.
 * - Two icons in the pane headers' segmented track (the Inspector's tabs' look, `chrome.css`), each with its `title`:
 *   words would crowd New File and the "..." menu out of a narrow pane.
 ****************/
function InputViewSwitch() {
  return (
    <ui-menu appearance="segmented" class="InputViewSwitch">
      <For each={INPUT_VIEWS}>
        {(name) => (
          <ui-item
            link=""
            selected={InputView.isNotebook === (name === "notebook")}
            title={appTexts.text(INPUT_VIEW_LOOKS[name].text)}
            aria-label={appTexts.text(INPUT_VIEW_LOOKS[name].text)}
            onClick={() => InputView.show(name)}
          >
            <ui-icon name={INPUT_VIEW_LOOKS[name].icon} />
          </ui-item>
        )}
      </For>
    </ui-menu>
  )
}

/** Each way to show a `.spellx` file:  its switch's icon, and its tooltip. */
const INPUT_VIEW_LOOKS = {
  text: { icon: "align left", text: "inputViewText" },
  notebook: { icon: "th list", text: "inputViewNotebook" }
} as const

/****************
 * ### `InputView`
 * How `<InputRoot>` shows a `.spellx` file:  as text, or as a notebook (`<SpellxNotebook>`).
 * - Text at first;  the switch picks, and the browser remembers (`spellEditor:inputView`), for every `.spellx` file.
 * - Any other file is always text.
 ****************/
export class InputView {
  /** Can the file showing be a notebook (reactive)?  Only a `.spellx` file. */
  static get canShowNotebook(): boolean {
    return /\.spellx$/.test(editor.file?.path ?? "")
  }

  /** Is the file showing as a notebook (reactive)? */
  static get isNotebook(): boolean {
    return InputView.canShowNotebook && view() === "notebook"
  }

  /** Show files as `next`, and remember it. */
  static show(next: InputViewName): void {
    setView(next)
    editorPrefs.set(INPUT_VIEW_PREF, next)
  }
}

/** The two ways `<InputRoot>` shows a `.spellx` file. */
const INPUT_VIEWS = ["text", "notebook"] as const
/** One of `INPUT_VIEWS`. */
type InputViewName = (typeof INPUT_VIEWS)[number]
/** The preference that remembers how `.spellx` files show. */
const INPUT_VIEW_PREF = "inputView"
editorPrefs.declare(INPUT_VIEW_PREF, { oneOf: INPUT_VIEWS })
const [view, setView] = createSignal<InputViewName>((editorPrefs.get(INPUT_VIEW_PREF) as InputViewName) ?? "text")

/****************
 * ### `<NotebookRoot>`
 * `editor.file` as a notebook (`<SpellxNotebook>`):  its edits go in as typed text (`editor.onInputChanged()`).
 ****************/
function NotebookRoot() {
  const file = tracked(() => editor.file)
  return (
    <div class="InputEditor InputNotebook">
      <Show when={file()?.path} keyed>
        {(path) => (
          <SpellxNotebook text={file()?.contents ?? ""} path={path} onChange={(text) => editor.onInputChanged(text)} />
        )}
      </Show>
    </div>
  )
}

/****************
 * ### `LineNumbers`
 * Does the code editor show line numbers?
 * - Off at first;  its toolbar's "..." menu turns them on, and the browser remembers (`spellEditor:lineNumbers`).
 ****************/
export class LineNumbers {
  /** Are they showing (reactive)? */
  static get isShowing(): boolean {
    return areShowing()
  }

  /** Show them if hidden, else hide them;  remember which. */
  static toggle(): void {
    // the new value in a local:  a signal reads its old value until Solid flushes the write
    const isShowing = !areShowing()
    setShowing(isShowing)
    editorPrefs.set(LINE_NUMBERS_PREF, isShowing)
    LineNumbers.applyTo(editor.getInputEditor(), isShowing)
  }

  /** Show or hide them in `inputEditor`:  as chosen, unless `isShowing` says. */
  static applyTo(inputEditor: monaco.editor.IStandaloneCodeEditor | undefined, isShowing = areShowing()): void {
    inputEditor?.updateOptions({ lineNumbers: isShowing ? "on" : "off" })
  }
}

/** The preference that remembers whether the code editor shows line numbers. */
const LINE_NUMBERS_PREF = "lineNumbers"
// TODO:  drop the rename once every browser has opened the editor since epic `prefs-and-undo` P1
editorPrefs.declare(LINE_NUMBERS_PREF, { type: "choice" }).rename("spellEditor.lineNumbers", LINE_NUMBERS_PREF)
const [areShowing, setShowing] = createSignal(editorPrefs.get(LINE_NUMBERS_PREF) as boolean)

/****************
 * ### `<InputEditor>`
 * The Monaco source editor on `editor.file`, guarded by an `<ErrorBoundary>`.
 * - `<FileEditor>` -- Monaco, loaded on first use (see `LazyMonaco`) -- remade per file:  keyed by its path.
 * - `editor.onInputDidMount()` wires save/reload/compile keys, and cursor/scroll events back into `editor`.
 * - `editor.onInputEffect()` (scroll to and select `file.initialSelection`) runs once the editor's made,
 *   and again whenever `editor.file`, its `isLoaded` or its `initialSelection` change.
 * - On an error:  `showError()` is told, and a plain-text `<FallbackEditor>` takes over.
 *   It heals by itself when what threw changes (see `<ErrorBoundary>`).
 * - NOTE: React's `match` prop (never passed, it reset the error on change) is gone:  the boundary heals itself.
 * - SEE:  its App UI components page, `app/docs/InputEditor.html` (`/components/app/InputEditor.html`).
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
 * `<InputEditor>`'s editor after a caught error:  plain text, NO spell colouring.
 * - In case colouring is what threw:  re-attaching it would just throw again.
 * - It has no model, so edits go in through `editor.onInputChanged()`.
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
 * The input editor is made:  show its line numbers or not, hand it to `editor`,
 * then select `file.initialSelection`, if any.
 * - Why the second step:  the editor arrives after the file did (Monaco loads lazily, and makes its editor once
 *   settled), so the `followInitialSelection()` run for that file came too early.
 */
function didMount(inputEditor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) {
  LineNumbers.applyTo(inputEditor)
  editor.onInputDidMount(inputEditor, api)
  editor.onInputEffect()
}

/**
 * Scroll to and select `file.initialSelection` (`editor.onInputEffect()`)
 * whenever `editor.file`, its `isLoaded` or its `initialSelection` change.
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
