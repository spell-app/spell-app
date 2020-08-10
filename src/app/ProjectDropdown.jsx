import React from "react"
import { Dropdown } from "semantic-ui-react"

import { view } from "~/util"
import { SpellLocation } from "~/languages/spell"

import { actions } from "./actions"
import { UI } from "./ui"
import { store } from "./store"

export const ProjectDropdownAction = React.memo(({ useRunner, path, location, active }) => (
  <Dropdown.Item
    text={location.projectName}
    value={path}
    icon={UI.PROJECT_ICON}
    active={active}
    onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
  />
))

/** Menu of all available projects. */
export const ProjectDropdown = React.memo(
  view(function ProjectDropdown({ useRunner = false, showLabel = true, showActions = false, noBorder = false }) {
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
          <ProjectDropdownAction
            key={path}
            useRunner={useRunner}
            path={path}
            location={location}
            active={ready && path === project.path}
          />
        )
      })
      if (showActions) {
        menuItems.push(<Dropdown.Divider key="divider" />, ...actions.PROJECT_DROPDOWN_ACTIONS)
      }
      dropdownProps.children = <Dropdown.Menu>{menuItems}</Dropdown.Menu>
    }
    const dropdown = <Dropdown {...dropdownProps} />
    if (!showLabel) return dropdown
    return (
      <>
        <UI.DropdownLabel title={`${projectType}:`} icon={UI.PROJECT_ICON} />
        {dropdown}
      </>
    )
  })
)
