import React from "react"
import * as SUI from "semantic-ui-react"

import { AppContainer } from "./AppContainer"
import { ErrorNotice } from "./ErrorNotice"
import { Notice } from "./Notice"
import { SpellPage } from "./SpellPage"
import { SplitPanel } from "./SplitPanel"
import { ProjectDropdown } from "./ProjectDropdown"
import { store } from "./store"

/** RunnerToolbar. */
export function RunnerToolbar() {
  // console.info("RunnerToolbar", { file, fileIsDirty })
  const bound = React.useMemo(() => {
    return {
      showEditor: () => store.showEditor()
    }
  })
  return (
    <SUI.Menu inverted compact>
      <ProjectDropdown showLabel useRunner />
      <SUI.Menu.Item
        content=" Edit Project"
        icon={<SUI.Icon size="large" name="edit outline" />}
        onClick={bound.showEditor}
      />
    </SUI.Menu>
  )
}

/** Runner page. */
export function SpellRunner() {
  return (
    <>
      <SpellPage id="SpellRunner" fillWindow dark rows>
        <RunnerToolbar />
        <SplitPanel id="spellRunner" rows="85%" spaced padded resizable resizable bordered light rounded>
          <SUI.Container>
            <AppContainer />
          </SUI.Container>
          Console
        </SplitPanel>
      </SpellPage>
      <Notice />
      <ErrorNotice />
    </>
  )
}
