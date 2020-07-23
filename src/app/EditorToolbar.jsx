import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"

import { store } from "./store"
import { FileDropdown } from "./FileDropdown"
import { ProjectDropdown } from "./ProjectDropdown"

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
      createFile: () => store.createFile(),
      duplicateFile: () => store.duplicateFile(),
      renameFile: () => store.renameFile(),
      deleteFile: () => store.deleteFile()
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
    </SUI.Menu>
  )
})
