import React from "react"
import { Dropdown, Icon, Menu } from "semantic-ui-react"

import { view } from "~/util"

import { store } from "./store"

const bound = {
  createFile() {
    store.createFile()
  },
  duplicateFile() {
    store.duplicateFile()
  },
  renameFile() {
    store.renameFile()
  },
  deleteFile() {
    store.deleteFile()
  },
  navigateToMenuItem(event, { value }) {
    store.showEditor(value)
  }
}

export const fileDropdownActions = [
  <Dropdown.Item key="create" text="New File" icon="plus square outline" onClick={bound.createFile} />,
  <Dropdown.Item key="duplicate`" text="Duplicate File" icon="clone outline" onClick={bound.duplicateFile} />,
  <Dropdown.Item key="rename" text="Rename File" icon="edit outline" onClick={bound.renameFile} />,
  <Dropdown.Item key="delete" text="Delete File" icon="trash alternate outline" onClick={bound.deleteFile} />
]

export const FILE_ICON = "file outline"

/** Menu of all available projects. */
export const FileDropdown = view(function FileDropdown({ showLabel = true, showActions = false, noBorder = false }) {
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
    style: { minWidth: "8em", fontWeight: 700 },
    className: noBorder ? "no-border" : ""
  }
  if (ready) {
    const menuItems = project.imports.map(({ path, location }) => {
      return (
        <Dropdown.Item
          key={path}
          text={`${location.file}`}
          value={path}
          icon={FILE_ICON}
          active={ready && path === file.path}
          onClick={bound.navigateToMenuItem}
        />
      )
    })
    if (showActions) {
      menuItems.push(<Dropdown.Divider key="divider" />, ...fileDropdownActions)
    }
    dropdownProps.children = <Dropdown.Menu>{menuItems}</Dropdown.Menu>
  }
  const dropdown = <Dropdown {...dropdownProps} />
  if (!showLabel) return dropdown
  return (
    <>
      <Menu.Item className="dropdown-label" content="File:" icon={FILE_ICON} />
      {dropdown}
    </>
  )
})

/**
 * Menu of just file actions which by default shows as a `...` icon in a menu.
 * Other `props` will be passed down to the dropDown (and you can override icon/etc if you like).
 */
export function FileActionsDropdown({ item = true, pointing = false, icon = "ellipsis horizontal", ...props }) {
  return (
    <Dropdown item={item} pointing={pointing} icon={icon} {...props}>
      <Dropdown.Menu>{fileDropdownActions}</Dropdown.Menu>
    </Dropdown>
  )
}
