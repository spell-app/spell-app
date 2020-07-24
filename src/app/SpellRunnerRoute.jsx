import React from "react"
import { SpellRunner } from "./SpellRunner"

/**
 * Reach-router `<Route/>` to show a project/example/etc by path.
 */
export function SpellRunnerRoute(props) {
  const { domain, project, filePath } = props
  const path = SpellLocation.pathForUrl({ domain, project, filePath })
  // console.info("SpellRunnerRoute", path, props)
  // HACK: Actually navigate on a timeout to avoid hook / rerender problems.
  setTimeout(() => store.selectPath(path), 0)
  return <SpellRunner />
}
