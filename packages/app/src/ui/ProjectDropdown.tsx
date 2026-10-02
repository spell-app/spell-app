/** @jsxImportSource react */
import React from "react"
import classnames from "classnames"
import * as SUI from "semantic-ui-react"

import { view } from "$/util"

import { SP } from "$/spell"
import { editor } from "$/app/editor"

import { UI } from "$/app/ui"

/****************
 * ### `<ProjectMenu>`
 * Reactive menu for all available projects for a random `projectRoot`, defaulting to `editor.projectRoot`.
 ****************/
export const ProjectMenu = view(function ProjectMenu({
  projectRoot = editor.projectRoot,
  useRunner = false,
  itemProps,
  className = "",
  ...menuProps
}: ProjectMenuProps) {
  React.useEffect(() => {
    if (projectRoot) void projectRoot.load()
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
          onClick={() => (useRunner ? editor.showRunner(path) : editor.showEditor(path))}
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

/** Props for `<ProjectMenu>`.  Extra keys pass through to the underlying `SUI.Menu`. */
export type ProjectMenuProps = SUI.MenuProps & {
  /** Root whose projects to list.  Defaults to `editor.projectRoot`. */
  projectRoot?: SP.SpellProjectRoot
  /** Open `<SpellRunner>` instead of `<SpellEditor>` when an item is clicked. */
  useRunner?: boolean
  /** Extra props spread onto each `SUI.Menu.Item`. */
  itemProps?: Record<string, unknown>
}

/****************
 * ### `<ProjectDropdown>`
 * Reactive dropdown Menu of all available projects for a random projectRoot, defaulting to `editor.projectRoot`.
 ****************/
export const ProjectDropdown = view(function ProjectDropdown({
  projectRoot = editor.projectRoot,
  project = editor.project,
  useRunner = false,
  showLabel = true,
  extraActions,
  itemProps,
  className,
  ...dropdownProps
}: ProjectDropdownProps) {
  // Load projectRoot but don't wait for it
  React.useEffect(() => {
    if (projectRoot) void projectRoot.load()
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
          onClick={() => (useRunner ? editor.showRunner(path) : editor.showEditor(path))}
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

/** Props for `<ProjectDropdown>`.  Extra keys pass through to the underlying `SUI.Dropdown`. */
export type ProjectDropdownProps = SUI.DropdownProps & {
  /** Root whose projects to list.  Defaults to `editor.projectRoot`. */
  projectRoot?: SP.SpellProjectRoot
  /** Currently selected project, shown as the dropdown's text.  Defaults to `editor.project`. */
  project?: SP.SpellProject
  /** Open `<SpellRunner>` instead of `<SpellEditor>` when an item is clicked. */
  useRunner?: boolean
  /** Prepend a `<UI.DropdownLabel>` before the dropdown. */
  showLabel?: boolean
  /** Extra items appended after a divider, e.g. "New Project". */
  extraActions?: ReactElement[]
  /** Extra props spread onto each `SUI.Dropdown.Item`. */
  itemProps?: Record<string, unknown>
}

////////////////
// ## Helpers
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
//         onClick={() => (useRunner ? editor.showRunner(path) : editor.showEditor(path))}
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
