/** @jsxImportSource react */
import type { SP } from "$/spell"
import type { monaco } from "$/app/ui/monaco"

import "./SpellEditorPane.css"

/****************
 * ### `<SpellEditorPane>`
 * What a `<spell-editor>` draws:  a tab per spell file, if it has more than one, the Monaco editor showing `file`,
 * and a status line.
 * - Holds NO state:  `SpellEditorElement` has it all, and draws us again when it changes.
 * - Monaco comes in `monaco` once it's loaded -- till then, a placeholder.
 * - ONE editor for its life, whatever the file:  it shows each file's model in turn -- see `SpellModels`.
 ****************/
export function SpellEditorPane({ files, file, status, monaco, onSelect, onMount, onUnmount }: SpellEditorPaneProps) {
  return (
    <div className="SpellEditor">
      {files.length > 1 && (
        <div className="SpellEditorTabs" role="tablist">
          {files.map((it) => (
            <button
              key={it.path}
              role="tab"
              aria-selected={it === file}
              className={it === file ? "active" : undefined}
              onClick={() => onSelect(it)}
            >
              {it.file ?? it.path}
              {it.isDirty && <span className="dirty" title="Edited since it was saved"></span>}
            </button>
          ))}
        </div>
      )}
      <div className="SpellEditorBody">
        {monaco && file ? (
          <monaco.MonacoEditor
            model={monaco.SpellMonaco.models.modelFor(file)}
            onMount={onMount}
            onUnmount={onUnmount}
          />
        ) : (
          <div className="SpellEditorLoading">Loading editor…</div>
        )}
      </div>
      <div className={`SpellEditorStatus ${status.state}`}>
        <span className="message">{statusText(status)}</span>
        <span className="keys">⌘S save · ⌘↵ run</span>
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
  /** A tab was clicked. */
  onSelect: (file: SP.SpellFile) => void
  /** The Monaco editor was made -- and Monaco itself, which is loaded lazily. */
  onMount: (editor: monaco.editor.IStandaloneCodeEditor, api: typeof monaco) => void
  /** The Monaco editor is going. */
  onUnmount: (editor: monaco.editor.IStandaloneCodeEditor) => void
}

/** `$/app/ui/monaco`:  Monaco, and spell in it -- loaded lazily, see `SpellEditorElement`. */
export type MonacoModule = typeof import("$/app/ui/monaco")

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
