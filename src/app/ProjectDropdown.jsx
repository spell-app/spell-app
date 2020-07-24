import React from "react"
import * as SUI from "semantic-ui-react"

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

/** Menu of all available projects. */
export const ProjectDropdown = view(function ProjectDropdown({ showLabel = true, showActions = true }) {
  const { projectRoot, project } = store
  const ready = projectRoot?.isLoaded && !!project
  const projectType = projectRoot?.singular || "Project"
  const dropdownProps = {
    id: "ProjectDropdown",
    item: true,
    loading: !ready,
    text: ready ? project.projectName : "Loading...",
    lazyLoad: true,
    labeled: true,
    style: { width: "10em" }
  }
  if (ready) {
    const menuItems = projectRoot.projectPaths.map((path) => {
      const location = new SpellLocation(path)
      return (
        <SUI.Dropdown.Item
          key={path}
          text={`${projectType}: ${location.projectName}`}
          value={path}
          icon="folder outline"
          active={ready && path === project.path}
          onClick={bound.navigateToMenuItem}
        />
      )
    })
    if (showActions) {
      menuItems.push(
        <SUI.Dropdown.Divider key="divider" />,
        <SUI.Dropdown.Item
          key="create"
          text="Create Project"
          icon={<SUI.Icon name="plus square outline" />}
          onClick={bound.createProject}
        />,
        <SUI.Dropdown.Item
          key="duplicate`"
          text="Duplicate Project"
          icon={<SUI.Icon name="clone outline" />}
          onClick={bound.duplicateProject}
        />,
        <SUI.Dropdown.Item
          key="rename"
          text="Rename Project"
          icon={<SUI.Icon name="edit outline" />}
          onClick={bound.renameProject}
        />,
        <SUI.Dropdown.Item
          key="delete"
          text="Delete Project"
          icon={<SUI.Icon name="trash alternate outline" />}
          onClick={bound.deleteProject}
        />
      )
    }
    dropdownProps.children = <SUI.Dropdown.Menu>{menuItems}</SUI.Dropdown.Menu>
  }
  const dropdown = <SUI.Dropdown {...dropdownProps} />
  if (!showLabel) return dropdown
  return (
    <>
      <SUI.Menu.Item className="dropdown-label" content={`${projectType}:`} />
      {dropdown}
    </>
  )
})
