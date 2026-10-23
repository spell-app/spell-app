import type { LSP } from "spell-app/lsp"
import type { SP } from "spell-lang/spell"
import type { UI } from "spell-app/app/ui"

// ## Messages
//  between `<VSCodeRunner>` and the VS Code extension's `RunnerPanel`.
//  NOTE: the extension is its own project and can't import these, so it restates them -- change both together.

/**
 * Message from the extension to the runner webview.
 * - `run`:  run `compiled`, the project's javascript
 *   - keeping the program's things, unless it answers our `restart` -- see `<VSCodeRunner>`'s `run()`
 *   - `words`:  the project's words files, `<Project>.en.js`, as text, read before it runs
 *     - what the core says as it runs, e.g. its tests' lines, in the program's language (their `messages`)
 *     - the Thing Explorer's labels -- see `SP.SpellWords`
 *     - one per language its files are in, the one it speaks first (epic `spanish` P19);  `undefined` if it has none
 *   - `runTests`:  then run its tests too, as `runTests` does
 * - `runTests`:  run the project's tests, as `spell test` does, on a copy of the runtime of their own:
 *   show how they went on the console, and send `testResults`
 *   - the Run Tests command;  the runner runs them itself after a run that started no app, and on its Run Tests button
 * - `scopes`:  live scope tree to show in the Type Explorer, as the language server's `spell/scopes`
 * - `settings`:  the project's `settings.json5`, as the extension read it -- sent on `ready`, before anything else
 * - `details`:  answer to our `details` -- as the language server's `spell/scopeDetails`
 * - `imported`:  answer to our `loadImport`:  project `projectId`'s compiled javascript,
 *   or `error`, why it couldn't be loaded
 */
export type ToRunnerMessage =
  | { type: "run"; compiled: string; words?: string[]; runTests?: boolean }
  | { type: "runTests" }
  | { type: "imported"; projectId: string; compiled?: string; error?: string }
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
 * - `loadImport`:  the program imports project `projectId`, e.g. `@spell/library/people` --
 *   send its compiled javascript, as the language server's `spell/compiledImport`, in an `imported` message
 * - `testResults`:  how the project's tests went, after each test run -- for the editor to show each failed check
 *   on its line (the language server's `spell/testDiagnostics`)
 */
export type FromRunnerMessage =
  | { type: "ready" }
  | { type: "restart" }
  | { type: "open"; href: string }
  | ({ type: "setDescription" } & LSP.SetDescriptionParams)
  | { type: "saveSettings"; settings: ProjectSettings }
  | { type: "details"; path: string }
  | { type: "refreshScopes" }
  | { type: "loadImport"; projectId: string }
  | { type: "testResults"; tests: LSP.TestReport[] }

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
 * - A NEW object per compile:  an app runs each one once, however it hears of it.
 *   Its `editor` attribute AND the editor's `app` attribute can both name it.
 */
export type SpellCompiled = {
  /** Project compiled, e.g. `@spell/examples/Solitaire` -- where its imports and sources come from. */
  projectId: string
  /** Its javascript, as `<Project>.spell.js` holds it. */
  compiled: string
  /** Its scope pack, for the Type Explorer -- fresh, where the one on the server may be stale. */
  scopes?: LSP.ScopePack
  /** Its declarations, for the Type Explorer's code -- see `SP.SpellDeclarationsData`. */
  declarations?: SP.SpellDeclarationsData
  /** Its words, for the Thing Explorer's labels -- see `SP.SpellWords`. */
  words?: SP.SpellWordsData
}

////////////////
// ## Spell in a layout
//  what `<spell-app>`'s layout may hold (epic `drawable-thing` P9) -- here, so the runner can tell
//  WITHOUT loading `LayoutSpell`, which holds the parser
////////////////

/** The tag of a block of spell in a layout:  `<spell> when clicked ... </spell>`. */
export const LAYOUT_SPELL_TAG = "spell"

/** The tag of formatted text in a layout, drawn by `<ui-markdown>`:  `<markdown> ## Rules </markdown>`. */
export const LAYOUT_MARKDOWN_TAG = "markdown"

/** A hole in a layout's text:  `{...}`, no braces inside. */
export const LAYOUT_HOLE = /\{[^{}]+\}/

/** An attribute that's all one hole, `{...}`, its spell captured. */
export const LAYOUT_WHOLE_HOLE = /^\s*\{([\s\S]+)\}\s*$/

/**
 * Does `root`'s layout have spell in it:  a hole, an action, a handler, a `<spell>` block or a `<markdown>` block?
 * - See `LayoutSpell`.
 */
export function layoutHasSpell(root: Element): boolean {
  if (root.querySelector(`${LAYOUT_SPELL_TAG}, ${LAYOUT_MARKDOWN_TAG}`)) return true
  if (LAYOUT_HOLE.test(root.textContent ?? "")) return true
  return [...root.querySelectorAll("*")].some((element) =>
    // a hole written without quotes starts one, `on-click={play a song}`, but ends in a later attribute's name
    [...element.attributes].some((attribute) => /^\s*\{/.test(attribute.value))
  )
}
