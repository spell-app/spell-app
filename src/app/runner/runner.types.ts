import type { LSP } from "~/lsp"
import type { UI } from "~/app/ui"

// ## Messages
//  between `<VSCodeRunner>` and the VS Code extension's `RunnerPanel`.
//  NOTE: the extension is its own project and can't import these, so it restates them -- change both together.

/**
 * Message from the extension to the runner webview.
 * - `run`:  run `compiled`, the project's javascript, afresh
 * - `scopes`:  live scope tree to show in the Type Explorer, as the language server's `spell/scopes`
 * - `settings`:  the project's `settings.json5`, as the extension read it -- sent on `ready`, before anything else
 */
export type ToRunnerMessage =
  | { type: "run"; compiled: string }
  | { type: "scopes"; tree: LSP.ScopeNode }
  | { type: "settings"; settings: ProjectSettings }

/**
 * Message from the runner webview to the extension.
 * - `ready`:  listening now, so compile and send `run`
 * - `restart`:  the Restart button -- compile again and send `run`
 * - `open`:  a link clicked, e.g. `file:///…/Card.spell#L12` -- open it in the editor
 * - `setDescription`:  a docstring edited in the Type Explorer -- edit the source, as `spell/setDescription`
 * - `saveSettings`:  write these sections of `settings.json5` -- see `ProjectSettings`
 */
export type FromRunnerMessage =
  | { type: "ready" }
  | { type: "restart" }
  | { type: "open"; href: string }
  | ({ type: "setDescription" } & LSP.SetDescriptionParams)
  | { type: "saveSettings"; settings: ProjectSettings }

/**
 * How a project is shown, remembered in its `settings.json5` -- beside its `project.json`, git-ignored, and NOT one
 * of its files in the editor.  The extension reads and writes it:  NOT the webview's own storage, which may not
 * outlive the panel.
 * - Each top-level section is written whole, so a section's props needn't be merged.
 * - NOTE: more to come;  every prop is optional, so a missing or older file just starts afresh.
 */
export type ProjectSettings = {
  /** The runner's own. */
  runner?: {
    /** Is the pane below the app showing? */
    showConsole?: boolean
    /** Which tab of it. */
    pane?: RunnerPane
  }
  /** The Type Explorer's:  what's selected and open. */
  typeExplorer?: UI.TypeExplorerState
}

/** Tab of the runner's pane below the app:  the Type Explorer, or the program's console output. */
export type RunnerPane = "types" | "output"
