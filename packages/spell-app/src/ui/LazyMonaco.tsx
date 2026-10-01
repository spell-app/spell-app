import React from "react"

import { editor } from "#spell-app/editor"
import type { FileEditorProps, MonacoEditorProps } from "#spell-app/ui/monaco"

/**
 * The app's Monaco editor components, loaded on first use:  Monaco is most of the app's code, and only
 * the editor page needs it.  Each MUST go inside a `<React.Suspense>`.
 * - SIDE EFFECT, once loaded:  listens to the editor -- edits compile soon, "go to definition" in another
 *   file shows it -- and puts `SpellMonaco` / `monaco` on `globalThis` for console debugging, as `debug.ts` does
 *   for everything else.
 * - NOTE: `#spell-app/ui/monaco` is NOT in the `UI` barrel:  anything importing it statically would pull Monaco into
 *   the main bundle again.  Import its TYPES only, elsewhere.
 */
export const LazyMonaco = {
  /** `<MonacoEditor>` -- see `#spell-app/ui/monaco/MonacoEditor`. */
  MonacoEditor: React.lazy(async () => ({
    default: (await loadMonaco()).MonacoEditor
  })) as React.ComponentType<MonacoEditorProps>,
  /** `<FileEditor>` -- see `#spell-app/ui/monaco/FileEditor`. */
  FileEditor: React.lazy(async () => ({
    default: (await loadMonaco()).FileEditor
  })) as React.ComponentType<FileEditorProps>,
  /** What to show while Monaco loads. */
  Loading() {
    return <div className="MonacoEditor">Loading editor…</div>
  }
}

/** The `#spell-app/ui/monaco` module, loaded once and connected to `editor` -- see `LazyMonaco`. */
let loading: Promise<typeof import("#spell-app/ui/monaco")> | undefined

/** Load `#spell-app/ui/monaco` once, and connect it -- see `LazyMonaco`. */
function loadMonaco(): Promise<typeof import("#spell-app/ui/monaco")> {
  loading ??= import("#spell-app/ui/monaco").then((module) => {
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
