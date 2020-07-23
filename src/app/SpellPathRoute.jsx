import React from "react"
import { SpellEditor } from "./SpellEditor"

/**
 * Reach-router `<Route/>` to show a project/example/etc by path.
 */
export function SpellPathRoute(props) {
  const { domain, project, filePath } = props
  const path = SpellLocation.pathForUrl({ domain, project, filePath })
  // console.info("SpellRoute", path, props)
  // HACK: Actually navigate on a timeout to avoid hook / rerender problems.
  setTimeout(() => store.selectPath(path), 0)
  return <SpellEditor />
}
