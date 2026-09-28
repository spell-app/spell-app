/**
 * Monaco, loaded once for the app:  import `monaco` from HERE, never from `monaco-editor` directly.
 * - The editor core and all its features, but only the languages we show:  spell (see `SpellMonaco`), plus
 *   Monarch colouring for `.js` / `.css` / markdown, none of which need a language worker.
 * - Its one worker, `editor.worker`, comes through Vite's `?worker`.
 * - NOTE: paths are `monaco-editor/<path under esm/vs>` -- see `exports` in its `package.json`.
 * - SIDE EFFECT:  sets `self.MonacoEnvironment`.
 */
import * as monaco from "monaco-editor/editor/editor.api"
// oxlint-disable-next-line import/default -- `?worker` is Vite's, typed by `vite/client`, which oxlint can't see
import EditorWorker from "monaco-editor/editor/editor.worker?worker"
import "monaco-editor/features/register.all"
import "monaco-editor/languages/definitions/javascript/register"
import "monaco-editor/languages/definitions/css/register"
import "monaco-editor/languages/definitions/markdown/register"

export { monaco }

self.MonacoEnvironment = { getWorker: () => new EditorWorker() }
