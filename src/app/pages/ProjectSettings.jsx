import React from "react"

import { view } from "~/util"
import { UI } from "./ui"

export const ProjectSettings = view(function ProjectSettings(props) {
  const values = {
    name: undefined,
    count: 3,
    nested: {
      type: undefined
    },
    array: [{ name: "name1" }, { name: "name2" }]
  }
  return (
    <UI.Form value={values} style={{ padding: 20 }} onSubmit={console.info}>
      <h2>{"Header"}</h2>
      <div>
        <UI.Input autoFocus required name="name" label="Name" />
        <UI.Input name="count" type="number" label="Count" min={3} max={10} />
      </div>
      <UI.FormGroup name="nested">
        <UI.Input name="type" label="Type (nested)" />
      </UI.FormGroup>
      <UI.Input name="array[0].name" label="Array 0 name" />
      <UI.FormRepeat name="array" grouped>
        <UI.Input name="name" label="Array name" />
      </UI.FormRepeat>
      <br />
      <UI.SubmitButton>Save</UI.SubmitButton>
    </UI.Form>
  )
})
