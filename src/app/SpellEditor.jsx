import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
// import * as SUI from "semantic-ui-react"

import { AppContainer } from "./AppContainer"
import { ASTRoot } from "./ASTViewer"
import { EditorToolbar } from "./EditorToolbar"
import { ErrorNotice } from "./ErrorNotice"
import { InputEditor } from "./InputEditor"
import { MatchRoot } from "./MatchViewer"
import { Notice } from "./Notice"
import { SplitPanel } from "./SplitPanel"
import { store } from "./store"

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

  // console.warn("SpellEditor")
  return (
    <>
      <div id="SpellEditor" className="OWN-THE-WINDOW" style={{ background: "#343a40" }}>
        <EditorToolbar />
        <SplitPanel id="spellEditor-columns" spaced resizable columns fluid>
          <SplitPanel id="spellEditor-left" resizable bordered raised rounded rows="85%">
            <InputEditor />
            <SplitPanel.Pane padded scrolling>
              Console
            </SplitPanel.Pane>
          </SplitPanel>
          <SplitPanel id="spellEditor-right" bordered raised rounded resizable rows="60%">
            <SplitPanel.Pane padded scrolling>
              <AppContainer />
            </SplitPanel.Pane>
            <ASTRoot />
            <MatchRoot />
          </SplitPanel>
        </SplitPanel>
      </div>
      <Notice />
      <ErrorNotice />
    </>
  )
}
