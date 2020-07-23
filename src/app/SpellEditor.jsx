import React from "react"
import { useHotkeys } from "react-hotkeys-hook"
// import * as SUI from "semantic-ui-react"

import { view } from "~/util"

import { AppContainer } from "./AppContainer"
import { ASTRoot } from "./ASTViewer"
import { EditorToolbar } from "./EditorToolbar"
import { ErrorNotice } from "./ErrorNotice"
import { InputEditor } from "./InputEditor"
import { MatchRoot } from "./MatchViewer"
import { Notice } from "./Notice"
import { SplitPanel, SplitPane } from "./SplitPanel"
import { store } from "./store"

import "./SpellEditor.less"

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
      <div className="SpellEditor OWN-THE-WINDOW">
        <EditorToolbar />
        <SplitPanel spaced resizable columns fluid>
          <SplitPanel bordered raised rounded resizable scrolling rows="80%,10%">
            <SplitPane padded={false} scrolling={false}>
              <InputEditor />
            </SplitPane>
            Console
          </SplitPanel>
          <SplitPanel bordered raised rounded resizable rows="60%,20%,20%">
            <SplitPane padded scrolling>
              <AppContainer />
            </SplitPane>
            <ASTRoot />
            <SplitPane>
              <MatchRoot />
            </SplitPane>
          </SplitPanel>
        </SplitPanel>
      </div>
      <Notice />
      <ErrorNotice />
    </>
  )
}
