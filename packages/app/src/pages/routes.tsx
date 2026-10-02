/** @jsxImportSource react */
import { Router as ReachRouter, type RouterProps } from "@reach/router"

import { ProjectChooserRoute } from "./ProjectChooser"
import { SpellEditorRoute } from "./SpellEditor"
import { SpellRunnerRoute } from "./SpellRunner"

/**
 * `@types/reach__router`'s `Router` predates current React JSX component typings and isn't
 * recognized as a valid JSX component type (it's missing an internal `refs` field the newer
 * `@types/react` expects); narrow the cast once here rather than at every use site.
 */
const Router = ReachRouter as unknown as ReactComponentType<RouterProps & { children?: ReactNode }>

/****************
 * ### `<Routes />`
 * Top-level router: picks `<SpellEditorRoute>`/`<SpellRunnerRoute>`/`<ProjectChooserRoute>` by URL.
 ****************/
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
