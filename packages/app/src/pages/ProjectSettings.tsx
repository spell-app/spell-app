/** @jsxImportSource react */
import { view } from "$/util"

import { UI } from "$/app/ui"

/**
 * `UI.FormGroup`/`FormRepeat`/`SubmitButton` get their `form` prop injected at runtime by the
 * enclosing `<UI.Form>` (see `WithForm()`/`injectForm` in `$/app/ui/Form`), but their
 * exported prop types still require it explicitly.  Narrow-cast here at the JSX boundary rather
 * than fabricating a fake `form` value.
 */
const FormGroup = UI.FormGroup as ReactComponentType<{ name?: string; children?: ReactNode }>
const FormRepeat = UI.FormRepeat as ReactComponentType<{ name?: string; grouped?: boolean; children?: ReactNode }>
const SubmitButton = UI.SubmitButton as ReactComponentType<{ children?: ReactNode }>

/****************
 * ### `<ProjectSettings />`
 * Form scaffold for project settings.
 * - `values`/`onSubmit` are hardcoded placeholders -- not yet wired to a real project setting or
 *   `editor.showProjectSettings()` (still a TODO stub), and currently commented out of `<SpellEditor>`.
 ****************/
export const ProjectSettings = view(function ProjectSettings() {
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
      <FormGroup name="nested">
        <UI.Input name="type" label="Type (nested)" />
      </FormGroup>
      <UI.Input name="array[0].name" label="Array 0 name" />
      <FormRepeat name="array" grouped>
        <UI.Input name="name" label="Array name" />
      </FormRepeat>
      <br />
      <SubmitButton>Save</SubmitButton>
    </UI.Form>
  )
})
