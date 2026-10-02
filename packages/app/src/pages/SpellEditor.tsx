/** @jsxImportSource react */
import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import type { RouteComponentProps } from "@reach/router"

import { SP } from "$/spell"
import { UI, Actions } from "$/app/ui"
import { editor } from "$/app/editor"
import type { SpellRouteParams } from "./pages.types"

/****************
 * ### `<SpellEditor />`
 * Main editing page: `<UI.InputRoot>` (code editor) plus `<UI.ConsoleRoot>` (compile/run log) on the left,
 * `<UI.AppRoot>` (live rendered app) plus `<UI.ASTRoot>`/`<UI.MatchRoot>` (parse tree / match inspector)
 * on the right.
 * - SIDE EFFECT: sets `editor.projectPage = "editor"` on every render.
 * - Wires up save/reload/compile/new-file hotkeys that only fire outside the Monaco editor --
 *   `editor.onInputDidMount()` adds the same keys inside it.
 * - Note that this does not need to be a `view()`, it redraws automatically when the file changes.
 ****************/
export const SpellEditor = React.memo(function SpellEditor() {
  editor.projectPage = "editor"
  // Set up hotkey when NOT in the Monaco editor
  // Note these are duplicated in `editor.onInputDidMount()`
  useHotkeys("command+s", (event) => {
    event.preventDefault()
    void editor.saveFile()
  })
  useHotkeys("shift-command+r", () => {
    void editor.reloadFile()
  })
  useHotkeys("command+enter", () => {
    void editor.compileApp()
  })
  useHotkeys("command+n", (event) => {
    event.preventDefault()
    void editor.createFile()
  })

  return (
    <>
      <UI.SpellPage id="SpellEditor" fillWindow dark rows>
        <EditorToolbar />
        <UI.SplitPanel id="spellEditor-columns" columns resizable fluid spaced="tightly">
          <UI.SplitPanel id="spellEditor-left" rows="85%" resizable rounded>
            <UI.InputRoot />
            {/* <UI.SplitPane scrolling light>
              <UI.ProjectSettings />
            </UI.SplitPane> */}
            <UI.ConsoleRoot />
          </UI.SplitPanel>
          <UI.SplitPanel id="spellEditor-right" rows="60%" resizable rounded>
            <UI.AppRoot />
            <UI.ASTRoot />
            <UI.MatchRoot />
          </UI.SplitPanel>
        </UI.SplitPanel>
      </UI.SpellPage>
    </>
  )
})

/****************
 * ### `<EditorToolbar />`
 * Top menu bar for `<SpellEditor>` -- project dropdown, runner/settings actions, and about/docs links.
 ****************/
export function EditorToolbar() {
  return (
    <UI.AppMenu>
      <UI.Submenu left spring>
        <UI.ProjectDropdown />
        <Actions.showRunner />
        <Actions.showProjectSettings />
        <UI.ProjectActionsDropdown />
      </UI.Submenu>
      <UI.Submenu center spring>
        <Actions.showProjectChooser />
      </UI.Submenu>
      <UI.Submenu right spring>
        <Actions.aboutSpell />
        {/* <Actions.showHelp /> */}
        <Actions.showDocs />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.AppMenu>
  )
}

/****************
 * ### `<SpellEditorRoute />`
 * Reach-router `<Route/>` to show a project/example/etc by path.
 * - Note that this will redraw the editor every time the route changes.
 * - HACK: navigates on a timeout to avoid hook/rerender problems.
 ****************/
export function SpellEditorRoute(props: RouteComponentProps<SpellRouteParams>) {
  const { domain, project, filePath } = props
  const path = SP.SpellLocation.pathForUrl({ domain, project, filePath })
  // console.info("SpellRoute", path, props)
  // HACK: Actually navigate on a timeout to avoid hook / rerender problems.
  setTimeout(() => editor.selectPath(path), 0)
  return <SpellEditor />
}
