import React from "react"
import { Dropdown, Menu } from "semantic-ui-react"

import { view } from "~/util"
import { SpellLocation } from "~/languages/spell"

import { store } from "./store"

const bound = {
  createProject() {
    store.createProject()
  },
  duplicateProject() {
    store.duplicateProject()
  },
  renameProject() {
    store.renameProject()
  },
  deleteProject() {
    store.deleteProject()
  },
  navigateToMenuItem(event, { value }) {
    store.showEditor(value)
  }
}
const projectDropdownActions = [
  <Dropdown.Item key="create" text="New Project" icon="pencil" onClick={bound.createProject} />,
  <Dropdown.Item key="duplicate`" text="Duplicate Project" icon="clone outline" onClick={bound.duplicateProject} />,
  <Dropdown.Item key="rename" text="Rename Project" icon="edit outline" onClick={bound.renameProject} />,
  <Dropdown.Item key="delete" text="Delete Project" icon="trash alternate outline" onClick={bound.deleteProject} />
]

export const PROJECT_ICON = "app store ios"

/** Menu of all available projects. */
export const ProjectDropdown = view(function ProjectDropdown({
  showLabel = true,
  showActions = false,
  noBorder = false
}) {
  const { projectRoot, project } = store
  const ready = projectRoot?.isLoaded && !!project
  const projectType = projectRoot?.singular || "Project"
  const dropdownProps = {
    id: "ProjectDropdown",
    item: true,
    loading: !ready,
    text: ready ? project.projectName : "",
    lazyLoad: true,
    labeled: true,
    style: { minWidth: "8em", fontWeight: 700 },
    className: noBorder ? "no-border" : ""
  }
  if (ready) {
    const menuItems = projectRoot.projectPaths.map((path) => {
      const location = new SpellLocation(path)
      return (
        <Dropdown.Item
          key={path}
          text={`${location.projectName}`}
          value={path}
          icon={PROJECT_ICON}
          active={ready && path === project.path}
          onClick={bound.navigateToMenuItem}
        />
      )
    })
    if (showActions) {
      menuItems.push(<Dropdown.Divider key="divider" />, ...projectDropdownActions)
    }
    dropdownProps.children = <Dropdown.Menu>{menuItems}</Dropdown.Menu>
  }
  const dropdown = <Dropdown {...dropdownProps} />
  if (!showLabel) return dropdown
  return (
    <>
      <Menu.Item className="dropdown-label" content={`${projectType}:`} icon={PROJECT_ICON} />
      {dropdown}
    </>
  )
})

/**
 * Menu of just project actions which by default shows as a `...` icon in a menu.
 * Other `props` will be passed down to the dropDown (and you can override icon/etc if you like).
 */
export function ProjectActionsDropdown({
  item = true,
  pointing = "top right",
  icon = "ellipsis horizontal",
  ...props
}) {
  return (
    <Dropdown item={item} pointing={pointing} icon={icon} {...props}>
      <Dropdown.Menu>{projectDropdownActions}</Dropdown.Menu>
    </Dropdown>
  )
}
