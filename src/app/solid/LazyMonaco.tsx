import { lazy, type Component } from "solid-js"

import { editor } from "spell-app/app/editor"
import { appTexts } from "spell-app/app/ui/AppTexts"
import type { FileEditorProps, MonacoEditorProps } from "spell-app/app/solid/monaco"

/**
 * The app's Solid Monaco editor components, loaded on first use:
 * Monaco is most of the app's code, and only the editor page needs it.
 * - Each MUST go inside a `<Loading>`, whose fallback shows while it loads,
 *   e.g. `<Loading fallback={<LazyMonaco.Loading />}>`.
 * - SIDE EFFECT, once loaded:  listens to the editor, so edits compile soon,
 *   and "go to definition" in another file shows that file.
 * - SIDE EFFECT, once loaded:  hands the editor a scope explorer on its language service, for the Types tab
 *   (`editor.setScopeExplorer()`).
 * - SIDE EFFECT, once loaded:  puts `SpellMonaco` / `monaco` on `globalThis` for console debugging,
 *   as `debug.ts` does for everything else.
 * - NOTE: `spell-app/app/solid/monaco` is NOT in the `spell-app/app/solid` barrel:
 *   anything importing it statically would pull Monaco into the main bundle again.
 *   Import its TYPES only, elsewhere.
 */
export const LazyMonaco = {
  /** `<MonacoEditor>` -- see `spell-app/app/solid/monaco/MonacoEditor`. */
  MonacoEditor: lazy<Component<MonacoEditorProps>>(async () => ({
    default: (await loadMonaco()).MonacoEditor
  })),
  /** `<FileEditor>` -- see `spell-app/app/solid/monaco/FileEditor`. */
  FileEditor: lazy<Component<FileEditorProps>>(async () => ({
    default: (await loadMonaco()).FileEditor
  })),
  /** What to show while Monaco loads. */
  Loading() {
    return <div class="MonacoEditor">{appTexts.text("loadingEditor")}</div>
  }
}

/** The `spell-app/app/solid/monaco` module, loaded once and connected to `editor` -- see `LazyMonaco`. */
let loading: Promise<typeof import("spell-app/app/solid/monaco")> | undefined

/** Load `spell-app/app/solid/monaco` once, and connect it -- see `LazyMonaco`. */
function loadMonaco(): Promise<typeof import("spell-app/app/solid/monaco")> {
  loading ??= import("spell-app/app/solid/monaco").then(async (module) => {
    module.SpellMonaco.onEdit((file) => editor.onFileEdited(file))
    // the Types tab's tree, from the same language service:  `spell-app/lsp` is already in Monaco's chunk
    const { LSP } = await import("spell-app/lsp")
    editor.setScopeExplorer(new LSP.ScopeExplorer(module.SpellMonaco.register().service))
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
