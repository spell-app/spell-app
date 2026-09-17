import React from "react"
import classnames from "classnames"
import { Dropdown, Menu } from "semantic-ui-react"
import type { DropdownProps, MenuProps } from "semantic-ui-react"

import { view } from "~/util"
import { SpellLocation } from "~/languages/spell"
import type { SpellProject, SpellProjectRoot } from "~/languages/spell"
import type { SemanticICONS } from "semantic-ui-react"

import { UI } from "./ui"
import { store } from "~/app/store"

export type ProjectMenuItemProps = {
  key?: string
  text?: string
  icon?: string
  onClick?: () => void
}

export type GetProjectMenuItemsProps = {
  paths: string[] | undefined
  useRunner?: boolean
  Component: React.ComponentType<ProjectMenuItemProps>
  icon?: string
  itemProps?: Partial<ProjectMenuItemProps>
}

/** Just the items for a Project/Examples/etc Menu or Dropdown, as an array */
export function getProjectMenuItems({
  paths,
  useRunner,
  Component,
  icon = UI.PROJECT_ICON,
  itemProps
}: GetProjectMenuItemsProps): React.ReactElement[] {
  if (!paths) return [<Component key="_loading_" text="Loading..." />]
  return paths.map((path) => {
    const location = new SpellLocation(path)
    return (
      <Component
        key={path}
        text={location.projectName}
        icon={icon}
        onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
        {...itemProps}
      />
    )
  })
}

export type ProjectMenuProps = MenuProps & {
  projectRoot?: SpellProjectRoot
  useRunner?: boolean
  itemProps?: Record<string, unknown>
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
}: ProjectMenuProps) {
  React.useEffect(() => {
    if (projectRoot) projectRoot.load()
  }, [projectRoot])

  const ready = projectRoot?.isLoaded
  let items: React.ReactElement[]
  if (ready && projectRoot) {
    const paths = projectRoot.projectPaths
    items = paths.map((path) => {
      const location = new SpellLocation(path)
      return (
        <Menu.Item
          key={path}
          content={
            <span>
              <UI.Icon name={projectRoot.icon as SemanticICONS} />
              {location.projectName}
            </span>
          }
          onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
          {...itemProps}
        />
      )
    })
    if (!items.length) {
      items = [<Menu.Item key="_empty_" content={`No ${projectRoot.title} yet!`} />]
    }
  } else {
    items = [<Menu.Item key="_loading_" content="Loading..." />]
  }
  return (
    <Menu className={classnames("ProjectMenu", className)} {...menuProps}>
      {items}
    </Menu>
  )
})

export type ProjectDropdownProps = DropdownProps & {
  projectRoot?: SpellProjectRoot
  project?: SpellProject
  useRunner?: boolean
  showLabel?: boolean
  extraActions?: React.ReactElement[]
  itemProps?: Record<string, unknown>
}

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
}: ProjectDropdownProps) {
  React.useEffect(() => {
    if (projectRoot) projectRoot.load()
  }, [projectRoot])

  const ready = projectRoot?.isLoaded && !!project
  let items: React.ReactElement[]
  if (ready && projectRoot) {
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
      items = [<Menu.Item key="_empty_" content={`No ${projectRoot.title} yet!`} />]
    }
    if (extraActions) items.push(<Dropdown.Divider key="divider" />, ...extraActions)
  } else {
    items = [<Menu.Item key="_loading_" content="Loading..." />]
  }

  const dropdown = (
    <Dropdown
      item
      loading={!ready}
      text={ready && project ? project.projectName : ""}
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
