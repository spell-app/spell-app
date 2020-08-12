import React from "react"

import { view } from "~/util"
import { UI } from "./ui"

export const ProjectSettings = view(function ProjectSettings(props) {
  const values = {
    name: undefined,
    count: 3,
    nested: {
      type: undefined
    }
  }
  return (
    <UI.Form value={values} style={{ padding: 20 }} onSubmit={console.info}>
      <h2>{"Header"}</h2>
      <div>
        <UI.Input autoFocus name="count" type="number" label="Count" min={3} max={10} />
        <UI.Input name="name" label="Name" required />
      </div>
      <UI.FormGroup name="nested">
        <UI.Input name="type" label="Type" />
      </UI.FormGroup>
      <br />
      <UI.SubmitButton content="Save" />
    </UI.Form>
  )
})
