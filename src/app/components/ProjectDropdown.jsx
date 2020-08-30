import React from "react"
import classnames from "classnames"
import { Dropdown, Menu } from "semantic-ui-react"

import { view } from "~/util"
import { SpellLocation } from "~/languages/spell"

import { UI } from "./ui"
import { store } from "~/app/store"

/** Just the items for a Project/Examples/etc Menu or Dropdown, as an array */
export function getProjectMenuItems({ paths, useRunner, Component, icon = UI.PROJECT_ICON, itemProps }) {
  if (!paths) return [<Component key="_loading_" text="Loading..." />]
  return paths.map((path) => {
    const location = new SpellLocation(path)
    return (
      <Component
        text={location.projectName}
        icon={icon}
        onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
        {...itemProps}
      />
    )
  })
}

/**
 * Normal Menu for all available projects for a random `projectRoot`, defaulting to `store.projectRoot`.
 */
export const ProjectMenu = view(function ProjectDropdown({
  projectRoot = store.projectRoot,
  useRunner = false,
  itemProps,
  className = "",
  ...menuProps
}) {
  React.useEffect(() => {
    if (projectRoot) projectRoot.load()
  }, [projectRoot])

  const ready = projectRoot?.isLoaded
  let items
  if (ready) {
    const paths = projectRoot.projectPaths
    items = paths.map((path) => {
      const location = new SpellLocation(path)
      return (
        <Menu.Item
          key={path}
          content={
            <span>
              <UI.Icon name={projectRoot.icon} />
              {location.projectName}
            </span>
          }
          onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
          {...itemProps}
        />
      )
    })
    if (!items.length) {
      items = <Menu.Item content={`No ${projectRoot.title} yet!`} />
    }
  } else {
    items = <Menu.Item content="Loading..." />
  }
  return (
    <Menu className={classnames("ProjectMenu", className)} {...menuProps}>
      {items}
    </Menu>
  )
})

/** Dropdown Menu of all available projects for a random projectRoot, defaulting to `store.projectRoot`. */
export const ProjectDropdown = view(function ProjectDropdown({
  projectRoot = store.projectRoot,
  project = store.project,
  useRunner = false,
  showLabel = true,
  extraActions = undefined,
  itemProps,
  className,
  ...dropdownProps
}) {
  React.useEffect(() => {
    if (projectRoot) projectRoot.load()
  }, [projectRoot])

  const ready = projectRoot?.isLoaded && !!project
  let items
  if (ready) {
    const paths = projectRoot.projectPaths
    items = paths.map((path) => {
      const location = new SpellLocation(path)
      return (
        <Dropdown.Item
          key={path}
          text={location.projectName}
          icon={projectRoot.icon}
          onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
          {...itemProps}
        />
      )
    })
    if (!items.length) {
      items = <Menu.Item content={`No ${projectRoot.label} yet!`} />
    }
    if (extraActions) items.push(<Dropdown.Divider key="divider" />, ...extraActions)
  } else {
    items = <Menu.Item content="Loading..." />
  }

  const dropdown = (
    <Dropdown
      item
      loading={!ready}
      text={ready ? project.projectName : ""}
      lazyLoad
      labeled
      style={{ minWidth: "8em", fontWeight: 700 }}
      className={classnames("ProjectDropdown", className)}
      {...dropdownProps}
    >
      <Dropdown.Menu>{items}</Dropdown.Menu>
    </Dropdown>
  )
  if (!showLabel) return dropdown
  return (
    <>
      <UI.DropdownLabel title={`${projectRoot?.Type || "Project"}:`} icon={UI.PROJECT_ICON} />
      {dropdown}
    </>
  )
})
