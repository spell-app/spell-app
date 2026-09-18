import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import type { RouteComponentProps } from "@reach/router"

import { SP } from "~/languages/spell"
import { UI, Actions } from "~/app/ui"
import { store } from "~/app/store"

/**
 * ### `<SpellEditor />`
 * DOCME
 *
 * - Note that this does not need to be a `view()`,
 *   it redraws automatically when the file changes.
 */
export const SpellEditor = React.memo(function SpellEditor() {
  store.projectPage = "editor"
  // Set up hotkey when NOT in codemirror
  // Note these are duplicated in CodeMirror.js
  useHotkeys("command+s", (event) => {
    event.preventDefault()
    void store.saveFile()
  })
  useHotkeys("shift-command+r", () => {
    void store.reloadFile()
  })
  useHotkeys("command+enter", () => {
    void store.compileApp()
  })
  useHotkeys("command+n", (event) => {
    event.preventDefault()
    void store.createFile()
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

/**
 * Reach-router `<Route/>` to show a project/example/etc by path.
 * Note that this will redraw the editor every time the route changes.
 */
export function SpellEditorRoute(props: RouteComponentProps<SpellRouteParams>) {
  const { domain, project, filePath } = props
  const path = SP.SpellLocation.pathForUrl({ domain, project, filePath })
  // console.info("SpellRoute", path, props)
  // HACK: Actually navigate on a timeout to avoid hook / rerender problems.
  setTimeout(() => store.selectPath(path), 0)
  return <SpellEditor />
}

/** Params parsed out of the `edit/:domain/:project/*filePath` routes. */
export type SpellRouteParams = {
  domain: string
  project: string
  filePath: string
}
