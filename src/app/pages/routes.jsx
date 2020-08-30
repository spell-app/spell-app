import React from "react"
import { Router } from "@reach/router"

import { ProjectChooserRoute } from "./ProjectChooser"
import { SpellEditorRoute } from "./SpellEditor"
import { SpellRunnerRoute } from "./SpellRunner"

export function Routes() {
  return (
    <Router>
      <SpellEditorRoute path="edit/:domain" />
      <SpellEditorRoute path="edit/:domain/:project" />
      <SpellEditorRoute path="edit/:domain/:project/*filePath" />

      <SpellRunnerRoute path="run/:domain" />
      <SpellRunnerRoute path="run/:domain/:project" />
      <SpellRunnerRoute path="run/:domain/:project/*filePath" />

      <ProjectChooserRoute default />
    </Router>
  )
}
