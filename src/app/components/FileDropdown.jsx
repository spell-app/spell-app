import React from "react"
import { Dropdown } from "semantic-ui-react"

import { view } from "~/util"

import { actions } from "~/app/actions"
import { UI } from "../ui"
import { store } from "~/app/store"

/* Single item in FileDropdown */
const FileDropdownAction = React.memo(({ useRunner, path, location, active }) => (
  <Dropdown.Item
    text={location.file}
    value={path}
    icon={UI.FILE_ICON}
    active={active}
    onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
  />
))

/** Menu of all available files for the selected project. */
export const FileDropdown = view(function FileDropdown({ useRunner = false, showLabel = true, showActions = false }) {
  const { project, file } = store
  const ready = project?.isLoaded && !!file
  const dropdownProps = {
    id: "FileDropdown",
    basic: true,
    item: true,
    text: ready ? file.file : "",
    loading: !ready,
    lazyLoad: true,
    labeled: true,
    style: { minWidth: "8em", fontWeight: 700 }
  }
  if (ready) {
    const menuItems = project.imports.map(({ path, location }) => (
      <FileDropdownAction
        key={path}
        useRunner={useRunner}
        path={path}
        location={location}
        active={ready && path === file.path}
      />
    ))
    if (showActions) {
      menuItems.push(<Dropdown.Divider key="divider" />, ...actions.FILE_DROPDOWN_ACTIONS)
    }
    dropdownProps.children = <Dropdown.Menu>{menuItems}</Dropdown.Menu>
  }
  const dropdown = <Dropdown {...dropdownProps} />
  if (!showLabel) return dropdown
  return (
    <>
      <UI.DropdownLabel title="File:" icon={UI.FILE_ICON} />
      {dropdown}
    </>
  )
})
