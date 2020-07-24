import React from "react"
import * as SUI from "semantic-ui-react"

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

/** Menu of all available projects. */
export const FileDropdown = view(function FileDropdown({ showLabel = true, showActions = true }) {
  const { project, file } = store
  const ready = project?.isLoaded && !!file
  const dropdownProps = {
    id: "FileDropdown",
    basic: true,
    item: true,
    loading: !ready,
    text: ready ? file.file : "Loading...",
    lazyLoad: true,
    labeled: true,
    style: { width: "10em" }
  }
  if (ready) {
    const menuItems = project.imports.map(({ path, location }) => {
      return (
        <SUI.Dropdown.Item
          key={path}
          text={`${location.file}`}
          value={path}
          icon="file outline"
          active={ready && path === file.path}
          onClick={bound.navigateToMenuItem}
        />
      )
    })
    if (showActions) {
      menuItems.push(
        <SUI.Dropdown.Divider key="divider" />,
        <SUI.Dropdown.Item
          key="create"
          text="Create File"
          icon={<SUI.Icon name="plus square outline" />}
          onClick={bound.createFile}
        />,
        <SUI.Dropdown.Item
          key="duplicate`"
          text="Duplicate File"
          icon={<SUI.Icon name="clone outline" />}
          onClick={bound.duplicateFile}
        />,
        <SUI.Dropdown.Item
          key="rename"
          text="Rename File"
          icon={<SUI.Icon name="edit outline" />}
          onClick={bound.renameFile}
        />,
        <SUI.Dropdown.Item
          key="delete"
          text="Delete File"
          icon={<SUI.Icon name="trash alternate outline" />}
          onClick={bound.deleteFile}
        />
      )
    }
    dropdownProps.children = <SUI.Dropdown.Menu>{menuItems}</SUI.Dropdown.Menu>
  }
  const dropdown = <SUI.Dropdown {...dropdownProps} />
  if (!showLabel) return dropdown
  return (
    <>
      <SUI.Menu.Item className="dropdown-label" content="File" />
      {dropdown}
    </>
  )
})
