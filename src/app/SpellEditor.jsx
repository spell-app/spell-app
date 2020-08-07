import React from "react"
import { useHotkeys } from "react-hotkeys-hook"

import { actions } from "./actions"
import { UI } from "./ui"
import { AppRoot } from "./AppContainer"
import { ASTRoot } from "./ASTViewer"
import { ConsoleRoot } from "./ConsoleViewer"
import { InputRoot } from "./InputEditor"
import { MatchRoot } from "./MatchViewer"
import { SpellPage } from "./SpellPage"
import { SplitPanel } from "./SplitPanel"
import { store } from "./store"

/**
 * <SpellEditor />
 * Note that this does not need to be a `view()`,
 * it redraws automatically when the file changes.
 */
export const SpellEditor = React.memo(function SpellEditor() {
  // Set up hotkey when NOT in codemirror
  // Note these are duplicated in CodeMirror.js
  useHotkeys("command+s", (event) => {
    event.preventDefault()
    store.saveFile()
  })
  useHotkeys("shift-command+r", () => store.reloadFile())
  useHotkeys("command+enter", () => store.compile())
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
        <actions.showRunner />
        <actions.showProjectSettings />
        <UI.ProjectActionsDropdown />
      </UI.Submenu>
      <UI.Submenu center spring>
        <actions.showProjectChooser />
        <actions.createProject />
      </UI.Submenu>
      <UI.Submenu right spring>
        <actions.aboutSpell noBorder />
        <actions.showHelp />
        <actions.showDocs />
        <UI.MoreMenu stub />
      </UI.Submenu>
    </UI.AppMenu>
  )
}
