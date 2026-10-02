import { For, Show, createComponent, omit } from "solid-js"

import type { SP } from "$/spell"
import type { monaco } from "$/app/ui/monaco"

import "./SpellEditorPane.css"

/****************
 * ### `<SpellEditorPane>`
 * What a `<spell-editor>` draws:  a tab per spell file, if it has more than one, the Monaco editor showing `file`,
 * and a status line.
 * - Holds NO state:  `SpellEditorElement` has it all, in signals it hands us as props.
 * - Monaco comes in `monaco` once it's loaded -- till then, a placeholder.  Its Solid `MonacoEditor` is drawn
 *   straight from that module:  never imported here, so Monaco stays a lazy chunk.
 * - ONE editor for its life, whatever the file:  it shows each file's model in turn -- see `SpellModels`.
 ****************/
export function SpellEditorPane(props: SpellEditorPaneProps) {
  return (
    <div class="SpellEditor">
      <Show when={props.files.length > 1}>
        <div class="SpellEditorTabs" role="tablist">
          <For each={props.files}>
            {(it) => (
              <button
                role="tab"
                aria-selected={it === props.file ? "true" : "false"}
                class={{ active: it === props.file }}
                onClick={() => props.onSelect(it)}
              >
                {it.file ?? it.path}
                <Show when={props.isDirty(it)}>
                  <span class="dirty" title="Edited since it was saved"></span>
                </Show>
              </button>
            )}
          </For>
        </div>
      </Show>
      <div class="SpellEditorBody">
        <Show when={props.monaco && props.file} fallback={<div class="SpellEditorLoading">Loading editor…</div>}>
          <LazyEditor
            module={props.monaco!}
            model={props.monaco!.SpellMonaco.models.modelFor(props.file!)}
            onMount={(editor, api) => props.onMount(editor, api)}
            onUnmount={(editor) => props.onUnmount(editor)}
          />
        </Show>
      </div>
      <div class={["SpellEditorStatus", props.status.state]}>
        <span class="message">{statusText(props.status)}</span>
        <span class="keys">⌘S save · ⌘↵ run</span>
      </div>
    </div>
  )
}

/** Props for `<SpellEditorPane>`. */
export type SpellEditorPaneProps = {
  /** Spell files to show a tab for. */
  files: SP.SpellFile[]
  /** File to show. */
  file: SP.SpellFile | undefined
  /** What the editor's doing. */
  status: SpellEditorStatus
  /** Monaco and our spell features, once loaded. */
  monaco: MonacoModule | undefined
  /** Is `file` edited since it was saved?  Read in JSX:  the caller makes it reactive. */
  isDirty: (file: SP.SpellFile) => boolean
  /** A tab was clicked. */
  onSelect: (file: SP.SpellFile) => void
  /** The Monaco editor was made -- and Monaco itself, which is loaded lazily. */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) => void
  /** The Monaco editor is going. */
  onUnmount: (editor: monaco.editor.IStandaloneCodeEditor) => void
}

/****************
 * ### `<LazyEditor>`
 * `module`'s Solid `MonacoEditor`, with the rest of our props.
 * - `module` is read once:  it's loaded once, and never changes.
 * - NOTE: `createComponent`, not JSX:  a component picked at run time.
 ****************/
function LazyEditor(props: LazyEditorProps) {
  return createComponent(props.module.MonacoEditor, omit(props, "module"))
}

/** Props for `<LazyEditor>`:  the loaded module, and its `MonacoEditor`'s. */
type LazyEditorProps = Parameters<MonacoModule["MonacoEditor"]>[0] & {
  /** The loaded `$/app/solid/monaco`. */
  module: MonacoModule
}

/** `$/app/solid/monaco`:  Monaco, spell in it, and the Solid `MonacoEditor` -- loaded lazily, see `SpellEditorElement`. */
export type MonacoModule = typeof import("$/app/solid/monaco")

/**
 * What a `<spell-editor>` is doing, for its status line.
 * - `loading`:  the project, or Monaco
 * - `compiling`:  saving what's edited, then compiling
 * - `compiled`:  compiled with no parse errors, and handed on
 * - `errors`:  compiled, but with `errors` parse errors -- so NOT handed on
 * - `saved`:  saved, e.g. on Cmd+S
 * - `failed`:  couldn't, with `message` saying why
 */
export type SpellEditorStatus =
  | { state: "loading" | "compiling" | "compiled" | "saved" }
  | { state: "errors"; errors: number }
  | { state: "failed"; message: string }

/** What the status line says for `status`. */
function statusText(status: SpellEditorStatus): string {
  switch (status.state) {
    case "loading":
      return "Loading…"
    case "compiling":
      return "Compiling…"
    case "compiled":
      return "Compiled"
    case "saved":
      return "Saved"
    case "errors":
      return `${status.errors} parse ${status.errors === 1 ? "error" : "errors"} -- not run`
    case "failed":
      return status.message
  }
}
