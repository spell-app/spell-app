import { lazy, type Component } from "solid-js"

import { editor } from "$/app/editor"
import type { FileEditorProps, MonacoEditorProps } from "$/app/solid/monaco"

/**
 * The app's Solid Monaco editor components, loaded on first use:  Monaco is most of the app's code, and only
 * the editor page needs it.  Each MUST go inside a `<Loading>`, whose fallback shows while it loads, e.g.
 * `<Loading fallback={<LazyMonaco.Loading />}>`.
 * - SIDE EFFECT, once loaded:  listens to the editor -- edits compile soon, "go to definition" in another
 *   file shows it -- and puts `SpellMonaco` / `monaco` on `globalThis` for console debugging, as `debug.ts` does
 *   for everything else.
 * - NOTE: `$/app/solid/monaco` is NOT in the `$/app/solid` barrel:  anything importing it statically would pull
 *   Monaco into the main bundle again.  Import its TYPES only, elsewhere.
 */
export const LazyMonaco = {
  /** `<MonacoEditor>` -- see `$/app/solid/monaco/MonacoEditor`. */
  MonacoEditor: lazy<Component<MonacoEditorProps>>(async () => ({
    default: (await loadMonaco()).MonacoEditor
  })),
  /** `<FileEditor>` -- see `$/app/solid/monaco/FileEditor`. */
  FileEditor: lazy<Component<FileEditorProps>>(async () => ({
    default: (await loadMonaco()).FileEditor
  })),
  /** What to show while Monaco loads. */
  Loading() {
    return <div class="MonacoEditor">Loading editor…</div>
  }
}

/** The `$/app/solid/monaco` module, loaded once and connected to `editor` -- see `LazyMonaco`. */
let loading: Promise<typeof import("$/app/solid/monaco")> | undefined

/** Load `$/app/solid/monaco` once, and connect it -- see `LazyMonaco`. */
function loadMonaco(): Promise<typeof import("$/app/solid/monaco")> {
  loading ??= import("$/app/solid/monaco").then((module) => {
    module.SpellMonaco.onEdit((file) => editor.onFileEdited(file))
    // the app's editor shows any file, so it takes whatever no `<spell-editor>` on the page did
    module.SpellMonaco.onOpen((path, selection) => {
      void editor.showFileAt(path, selection)
      return true
    })
    Object.assign(globalThis, { SpellMonaco: module.SpellMonaco, monaco: module.monaco })
    return module
  })
  return loading
}
