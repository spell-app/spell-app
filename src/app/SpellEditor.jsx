import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"

import { AppContainer } from "./AppContainer"
import { ASTRoot } from "./ASTViewer"
import { ConsoleRoot } from "./ConsoleViewer"
import { FileDropdown } from "./FileDropdown"
import { InputEditor } from "./InputEditor"
import { MatchRoot } from "./MatchViewer"
import { SpellPage } from "./SpellPage"
import { ProjectDropdown } from "./ProjectDropdown"
import { SplitPanel } from "./SplitPanel"
import { store } from "./store"

/** EditorToolbar as a `view()`. */
export const EditorToolbar = view(function EditorToolbar() {
  const { file } = store
  const fileNeedsCompilation = file?.isLoaded && !file?.compiled
  const fileIsDirty = file?.isDirty
  // console.info("EditorToolbar", { file, fileIsDirty })
  const bound = React.useMemo(() => {
    return {
      compile: () => store.compile(),
      saveFile: () => store.saveFile(),
      reloadFile: () => store.reloadFile(),
      showRunner: () => store.showRunner()
    }
  })
  return (
    <SUI.Menu inverted compact>
      <ProjectDropdown showLabel showActions />
      <FileDropdown showLabel showActions />
      <SUI.Menu.Item style={{ width: "2em" }} />
      <SUI.Menu.Item
        content=" Compile"
        icon={<SUI.Icon size="large" name="chevron circle right" />}
        color="blue"
        active={fileNeedsCompilation}
        onClick={bound.compile}
      />
      <SUI.Menu.Item
        content="Save"
        icon={<SUI.Icon size="large" name="cloud download" />}
        color="green"
        active={fileIsDirty}
        onClick={bound.saveFile}
      />
      <SUI.Menu.Item
        content=" Revert"
        icon={<SUI.Icon size="large" name="cloud download" />}
        color="red"
        active={fileIsDirty}
        onClick={bound.reloadFile}
      />
      <SUI.Menu.Item
        content=" Run Project"
        icon={<SUI.Icon size="large" name="hand point up outline" />}
        onClick={bound.showRunner}
      />
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
        <SplitPanel id="spellEditor-columns" columns resizable fluid spaced>
          <SplitPanel id="spellEditor-left" rows="85%" resizable bordered light rounded>
            <InputEditor />
            <SplitPanel.Pane scrolling>
              <ConsoleRoot />
            </SplitPanel.Pane>
          </SplitPanel>
          <SplitPanel id="spellEditor-right" rows="60%" resizable bordered light rounded>
            <SplitPanel.Pane padded scrolling>
              <AppContainer />
            </SplitPanel.Pane>
            <ASTRoot />
            <MatchRoot />
          </SplitPanel>
        </SplitPanel>
      </SpellPage>
    </>
  )
}
