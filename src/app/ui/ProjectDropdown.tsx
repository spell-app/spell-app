import React from "react"
import classnames from "classnames"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"

import { SP } from "~/languages/spell"
import { store } from "~/app/store"

import { UI } from "."

/****************
 * ### `<ProjectMenu>`
 * Reactive menu for all available projects for a random `projectRoot`, defaulting to `store.projectRoot`.
 ****************/
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
  let items: ReactElement[]
  if (ready && projectRoot) {
    const paths = projectRoot.projectPaths
    items = paths.map((path) => {
      const location = new SP.SpellLocation(path)
      return (
        <SUI.Menu.Item
          key={path}
          content={
            <span>
              <UI.Icon name={projectRoot.icon as SUI.SemanticICONS} />
              {location.projectName}
            </span>
          }
          onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
          {...itemProps}
        />
      )
    })
    if (!items.length) {
      items = [<SUI.Menu.Item key="_empty_" content={`No ${projectRoot.title} yet!`} />]
    }
  } else {
    items = [<SUI.Menu.Item key="_loading_" content="Loading..." />]
  }
  return (
    <SUI.Menu className={classnames("ProjectMenu", className)} {...menuProps}>
      {items}
    </SUI.Menu>
  )
})

export type ProjectMenuProps = SUI.MenuProps & {
  projectRoot?: SP.SpellProjectRoot
  useRunner?: boolean
  itemProps?: Record<string, unknown>
}

/****************
 * ### `<ProjectDropdown>`
 * Reactive dropdown Menu of all available projects for a random projectRoot, defaulting to `store.projectRoot`.
 ****************/
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
  let items: ReactElement[]
  if (ready && projectRoot) {
    const paths = projectRoot.projectPaths
    items = paths.map((path) => {
      const location = new SP.SpellLocation(path)
      return (
        <SUI.Dropdown.Item
          key={path}
          text={location.projectName}
          icon={projectRoot.icon}
          onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
          {...itemProps}
        />
      )
    })
    if (!items.length) {
      items = [<SUI.Menu.Item key="_empty_" content={`No ${projectRoot.title} yet!`} />]
    }
    if (extraActions) items.push(<SUI.Dropdown.Divider key="divider" />, ...extraActions)
  } else {
    items = [<SUI.Menu.Item key="_loading_" content="Loading..." />]
  }

  const dropdown = (
    <SUI.Dropdown
      item
      loading={!ready}
      text={ready && project ? project.projectName : ""}
      lazyLoad
      labeled
      style={{ minWidth: "8em", fontWeight: 700 }}
      className={classnames("ProjectDropdown", className)}
      {...dropdownProps}
    >
      <SUI.Dropdown.Menu>{items}</SUI.Dropdown.Menu>
    </SUI.Dropdown>
  )
  if (!showLabel) return dropdown
  return (
    <>
      <UI.DropdownLabel title={`${projectRoot?.Type || "Project"}:`} icon={UI.PROJECT_ICON} />
      {dropdown}
    </>
  )
})

export type ProjectDropdownProps = SUI.DropdownProps & {
  projectRoot?: SP.SpellProjectRoot
  project?: SP.SpellProject
  useRunner?: boolean
  showLabel?: boolean
  extraActions?: ReactElement[]
  itemProps?: Record<string, unknown>
}

////////////////
// Helpers
////////////////

// /**
//  * Return array of items for a Project/Examples/etc Menu or Dropdown.
//  */
// function getProjectMenuItems({
//   paths,
//   useRunner,
//   Component,
//   icon = UI.PROJECT_ICON,
//   itemProps
// }: GetProjectMenuItemsProps): ReactElement[] {
//   if (!paths) return [<Component key="_loading_" text="Loading..." />]
//   return paths.map((path) => {
//     const location = new SP.SpellLocation(path)
//     return (
//       <Component
//         key={path}
//         text={location.projectName}
//         icon={icon}
//         onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
//         {...itemProps}
//       />
//     )
//   })
// }

// type GetProjectMenuItemsProps = {
//   paths: string[] | undefined
//   useRunner?: boolean
//   Component: ReactComponentType<ProjectMenuItemProps>
//   icon?: string
//   itemProps?: Partial<ProjectMenuItemProps>
// }

// type ProjectMenuItemProps = {
//   key?: string
//   text?: string
//   icon?: string
//   onClick?: () => void
// }
