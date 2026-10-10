import type { LSP } from "$/lsp"
import type { SP } from "$/spell"
import type { UI } from "$/app/ui"

// ## Messages
//  between `<VSCodeRunner>` and the VS Code extension's `RunnerPanel`.
//  NOTE: the extension is its own project and can't import these, so it restates them -- change both together.

/**
 * Message from the extension to the runner webview.
 * - `run`:  run `compiled`, the project's javascript, afresh
 * - `scopes`:  live scope tree to show in the Type Explorer, as the language server's `spell/scopes`
 * - `settings`:  the project's `settings.json5`, as the extension read it -- sent on `ready`, before anything else
 * - `details`:  answer to our `details` -- as the language server's `spell/scopeDetails`
 * - `words`:  the project's words file, `<Project>.en.js`, as text -- for the Thing Explorer's labels, see
 *   `SP.SpellWords`.  Sent after each `run`;  `undefined` if it has none.
 */
export type ToRunnerMessage =
  | { type: "run"; compiled: string }
  | { type: "words"; words?: string }
  | { type: "scopes"; tree: LSP.ScopeNode }
  | { type: "settings"; settings: ProjectSettings }
  | { type: "details"; path: string; details: LSP.ScopeDetails | null }

/**
 * Message from the runner webview to the extension.
 * - `ready`:  listening now, so compile and send `run`
 * - `restart`:  the Restart button -- compile again and send `run`
 * - `open`:  a link clicked, e.g. `file:///…/Card.spell#L12` -- open it in the editor
 * - `setDescription`:  a docstring edited in the Type Explorer -- edit the source, as `spell/setDescription`
 * - `saveSettings`:  write these sections of `settings.json5` -- see `ProjectSettings`
 * - `details`:  send the details of Type Explorer node or member `path` -- answered by a `details` message
 * - `refreshScopes`:  the Type Explorer's Refresh button -- send fresh `scopes`
 */
export type FromRunnerMessage =
  | { type: "ready" }
  | { type: "restart" }
  | { type: "open"; href: string }
  | ({ type: "setDescription" } & LSP.SetDescriptionParams)
  | { type: "saveSettings"; settings: ProjectSettings }
  | { type: "details"; path: string }
  | { type: "refreshScopes" }

/**
 * How a project is shown, remembered in its `settings.json5`:
 * beside its `project.json`, git-ignored, and NOT one of its files in the editor.
 * - The extension reads and writes it:  NOT the webview's own storage, which may not outlive the panel.
 * - Each top-level section is written whole, so a section's props needn't be merged.
 * - NOTE: more to come;  every prop is optional, so a missing or older file just starts afresh.
 */
export type ProjectSettings = {
  /** The runner's own. */
  runner?: {
    /** Is the pane below the app showing?  A program with no app always shows its output. */
    showConsole?: boolean
    /** Which tab of it. */
    pane?: RunnerPaneId
    /** Top pane's share of the height, in %, as last dragged -- with or without an app. */
    split?: number
  }
  /** The Type Explorer's:  what's selected and open. */
  typeExplorer?: UI.TypeExplorerState
  /** The Thing Explorer's:  what's selected and open. */
  thingExplorer?: UI.ThingExplorerState
}

/** Tab of the runner's pane below the app:  the Type Explorer, the Thing Explorer, or the program's console output. */
export type RunnerPaneId = "types" | "things" | "output"

// ## Editors and apps
//  how a `<spell-editor>` feeds `<spell-app>`s on the same page -- see `SpellEditorElement`, `SpellAppElement`.

/**
 * Event a `<spell-editor>` fires after each clean compile, with a `SpellCompiled` as its `detail`.
 * - Bubbles, and is `composed`, so it's heard from outside a shadow root too.
 * - A `<spell-app editor="<selector>">` listens for it -- see `SpellAppElement`.
 */
export const SPELL_COMPILED_EVENT = "spell-compiled"

/**
 * What a `<spell-editor>` compiled, for `<spell-app>`s to run -- see `SPELL_COMPILED_EVENT`.
 * - A NEW object per compile:  an app runs each one once, however it hears of it -- its `editor` attribute AND the
 *   editor's `app` attribute can both name it.
 */
export type SpellCompiled = {
  /** Project compiled, e.g. `@system:examples:Solitaire` -- where its imports and sources come from. */
  projectId: string
  /** Its javascript, as `<Project>.compiled.js` holds it. */
  compiled: string
  /** Its scope pack, for the Type Explorer -- fresh, where the one on the server may be stale. */
  scopes?: LSP.ScopePack
  /** Its declarations, for the Type Explorer's code -- see `SP.SpellDeclarationsData`. */
  declarations?: SP.SpellDeclarationsData
  /** Its words, for the Thing Explorer's labels -- see `SP.SpellWords`. */
  words?: SP.SpellWordsData
}
