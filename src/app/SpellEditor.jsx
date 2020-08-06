import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"

import { AppRoot } from "./AppContainer"
import { ASTRoot } from "./ASTViewer"
import { ConsoleRoot } from "./ConsoleViewer"
import { InputRoot } from "./InputEditor"
import { MatchRoot } from "./MatchViewer"
import { SpellPage } from "./SpellPage"
import { ProjectDropdown, ProjectActionsDropdown } from "./ProjectDropdown"
import { SplitPanel } from "./SplitPanel"
import { store } from "./store"

const bound = {
  aboutSpell: () => store.aboutSpell(),
  compile: () => store.compile(),
  createProject: () => store.createProject(),
  showChooser: () => store.showChooser(),
  showProjectSettings: () => store.showProjectSettings(),
  showHelp: () => store.showHelp(),
  showDocs: () => store.showDocs(),
  logIn: () => store.logIn()
}

/** EditorToolbar as a `view()`. */
export const EditorToolbar = view(function EditorToolbar() {
  // console.info("EditorToolbar", { file, fileIsDirty })
  return (
    <SUI.Menu inverted color="purple" compact attached className="medium-short tight">
      <SUI.Menu.Menu style={{ minWidth: "33%" }}>
        <ProjectDropdown />
        <SUI.Menu.Item disabled content="Settings" icon="setting" onClick={bound.showProjectSettings} />
        <ProjectActionsDropdown />
        <SUI.Menu.Item className="spring no-border" />
      </SUI.Menu.Menu>
      <SUI.Menu.Menu style={{ minWidth: "34%" }}>
        <SUI.Menu.Item className="spring no-border" />
        <SUI.Menu.Item disabled content="Open Example or Project" icon="app store ios" onClick={bound.showChooser} />
        <SUI.Menu.Item content="New Project" icon="pencil" onClick={bound.createProject} />
        <SUI.Menu.Item className="spring no-border" />
      </SUI.Menu.Menu>
      <SUI.Menu.Menu position="right" style={{ minWidth: "33%" }}>
        <SUI.Menu.Item className="spring no-border" />
        <SUI.Menu.Item disabled content="Docs" icon="newspaper outline" onClick={bound.showDocs} />
        <SUI.Menu.Item disabled content="About Spell" icon="wizard" onClick={bound.aboutSpell} />
        {/* <SUI.Menu.Item disabled content="Help" icon="help circle" className="no-border" onClick={bound.showHelp} /> */}
        {/* <SUI.Menu.Item disabled content="Log In" icon="user outline" onClick={bound.logIn} /> */}
        <SUI.Menu.Item disabled icon="ellipsis horizontal" />
      </SUI.Menu.Menu>
    </SUI.Menu>
  )
})

/**
 * <SpellEditor />
 * Note that this does not need to be a `view()`,
 * it redraws automatically when the file changes.
 */
export function SpellEditor() {
  console.info("SpellEditor")
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
}
