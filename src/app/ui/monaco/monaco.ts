/**
 * Monaco, loaded once for the app:  import `monaco` from HERE, never from `monaco-editor` directly.
 * - The editor core and all its features (and the colouring from a parse, which `register.all` leaves out),
 *   but only the languages we show:  spell (see `SpellMonaco`), plus
 *   Monarch colouring for `.js` / `.css` / markdown / html, and TypeScript and Python for the Program panel's other
 *   targets:  none of them needs a language worker.
 *   - spell's `<css>` blocks colour with the CSS one too (`SpellTokensProvider`);  its markup, with the html one
 *     (a notebook's html view too).
 * - Its one worker, `editor.worker`, comes through Vite's `?worker`.
 * - NOTE: paths are `monaco-editor/<path under esm/vs>` -- see `exports` in its `package.json`.
 * - SIDE EFFECT:  sets `self.MonacoEnvironment`.
 */
import * as monaco from "monaco-editor/editor/editor.api"
// oxlint-disable-next-line import/default -- `?worker` is Vite's, typed by `vite/client`, which oxlint can't see
import EditorWorker from "monaco-editor/editor/editor.worker?worker"
import "monaco-editor/features/register.all"
// Not in `register.all`, only in Monaco's whole-editor entry:  without it a document's semantic tokens never colour
// (spell's keywords, types, properties ... from its parse:  `SpellLanguageFeatures`)
import "monaco-editor/editor/contrib/semanticTokens/browser/documentSemanticTokens"
import "monaco-editor/languages/definitions/javascript/register"
import "monaco-editor/languages/definitions/css/register"
import "monaco-editor/languages/definitions/markdown/register"
import "monaco-editor/languages/definitions/html/register"
import "monaco-editor/languages/definitions/typescript/register"
import "monaco-editor/languages/definitions/python/register"

export { monaco }

self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
