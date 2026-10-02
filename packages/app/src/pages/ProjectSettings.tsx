/****************
 * ### `<ProjectSettings>`
 * Scaffold of a project settings form, on `<ui-form>`:  its fields are placeholders, and submitting logs them.
 * - NOT shown anywhere yet:  `editor.showProjectSettings()` is still a TODO stub, and no route draws this.
 * - NOTE: React's version was on `$/app/ui/forms` (`UI.Form`, `FormGroup`, `FormRepeat`), spell programs' React
 *   form kit;  the app's own UI is on `@spell-app/ui` now.  Nested / repeated values (`nested.type`, `array[1].name`)
 *   are plain field names here, until a real form needs more.
 ****************/
export function ProjectSettings() {
  return (
    <ui-form class="ProjectSettings" style={{ padding: "20px" }}>
      <form onSubmit={submit}>
        <h2>Header</h2>
        <ui-field>
          <label for="ProjectSettings-name">Name</label>
          <ui-input id="ProjectSettings-name" name="name" required="" autofocus="" />
        </ui-field>
        <ui-field>
          <label for="ProjectSettings-count">Count</label>
          <ui-input id="ProjectSettings-count" name="count" type="number" min="3" max="10" value="3" />
        </ui-field>
        <ui-field>
          <label for="ProjectSettings-type">Type (nested)</label>
          <ui-input id="ProjectSettings-type" name="nested.type" />
        </ui-field>
        <ui-field>
          <label for="ProjectSettings-array0">Array 0 name</label>
          <ui-input id="ProjectSettings-array0" name="array[0].name" value="name1" />
        </ui-field>
        <ui-field>
          <label for="ProjectSettings-array1">Array 1 name</label>
          <ui-input id="ProjectSettings-array1" name="array[1].name" value="name2" />
        </ui-field>
        <ui-button type="submit" primary="">
          Save
        </ui-button>
      </form>
    </ui-form>
  )
}

/** Submit:  log the form's values (placeholder), and stay on the page. */
function submit(event: SubmitEvent) {
  event.preventDefault()
  console.info(Object.fromEntries(new FormData(event.currentTarget as HTMLFormElement)))
}
