import React from "react"

import { view } from "~/util"
import { UI } from "./ui"

export const ProjectSettings = view(function ProjectSettings(props) {
  const values = {
    name: undefined,
    count: undefined
  }
  return (
    <UI.Form value={values} style={{ padding: 20 }}>
      <h2>Header</h2>
      <UI.Input path="name" label="Name" required autoFocus />
      <div>
        <UI.Input path="count" type="number" label="Count" min={3} max={10} />
      </div>
      <br />
      <UI.SubmitButton content="Save" />
    </UI.Form>
  )
})
