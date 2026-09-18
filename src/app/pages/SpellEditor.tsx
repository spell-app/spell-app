import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import type { RouteComponentProps } from "@reach/router"

import { SP } from "~/languages/spell"
import { Actions } from "~/app/actions"
import { UI, AppRoot, ASTRoot, ConsoleRoot, InputRoot, MatchRoot, SpellPage, SplitPanel } from "~/app/components"
import { store } from "~/app/store"

// import { ProjectSettings } from "./ProjectSettings"

/**
 * <SpellEditor />
 * Note that this does not need to be a `view()`,
 * it redraws automatically when the file changes.
 */
export const SpellEditor = React.memo(function SpellEditor() {
  store.projectPage = "editor"
  // Set up hotkey when NOT in codemirror
  // Note these are duplicated in CodeMirror.js
  useHotkeys("command+s", (event) => {
    event.preventDefault()
    store.saveFile()
  })
  useHotkeys("shift-command+r", () => {
    store.reloadFile()
  })
  useHotkeys("command+enter", () => {
    store.compileApp()
  })
  useHotkeys("command+n", (event) => {
    event.preventDefault()
    store.createFile()
  })

  return (
    <>
      <SpellPage id="SpellEditor" fillWindow dark rows>
        <EditorToolbar />
        <SplitPanel id="spellEditor-columns" columns resizable fluid spaced="tightly">
          <SplitPanel id="spellEditor-left" rows="85%" resizable rounded>
            <InputRoot />
            {/* <SplitPane scrolling light>
              <ProjectSettings />
            </SplitPane> */}
            <ConsoleRoot />
          </SplitPanel>
          <SplitPanel id="spellEditor-right" rows="60%" resizable rounded>
            <AppRoot />
            <ASTRoot />
            <MatchRoot />
          </SplitPanel>
        </SplitPanel>
      </SpellPage>
    </>
  )
})

export function EditorToolbar() {
  // console.info("EditorToolbar", { file, fileIsDirty })
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

/** Params parsed out of the `edit/:domain/:project/*filePath` routes. */
export type SpellRouteParams = {
  domain: string
  project: string
  filePath: string
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
