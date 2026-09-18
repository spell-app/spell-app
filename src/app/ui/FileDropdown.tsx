import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "~/util"
import type { SP } from "~/languages/spell"

import { store } from "~/app/store"

import { UI } from "."
import { Actions } from "./Actions"

/* Single item in FileDropdown */
const FileDropdownAction = React.memo(({ useRunner, path, location, active }: FileDropdownActionProps) => (
  <SUI.Dropdown.Item
    text={location.file}
    value={path}
    icon={UI.FILE_ICON}
    active={active}
    onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
  />
))

export type FileDropdownActionProps = {
  useRunner: boolean
  path: string
  location: SP.SpellLocation
  active: boolean
}

/** Menu of all available files for the selected project. */
export const FileDropdown = view(function FileDropdown({
  useRunner = false,
  showLabel = true,
  showActions = false
}: FileDropdownProps) {
  const { project, file }: { project?: SP.SpellProject; file?: SP.AnySpellFile } = store
  const ready = project?.isLoaded && !!file
  const dropdownProps: SUI.DropdownProps = {
    id: "FileDropdown",
    basic: true,
    item: true,
    text: ready ? file.file : "",
    loading: !ready,
    lazyLoad: true,
    labeled: true,
    style: { minWidth: "8em", fontWeight: 700 }
  }
  if (ready && project) {
    const menuItems: ReactElement[] = project.imports.map(({ path, location }) => (
      <FileDropdownAction
        key={path}
        useRunner={useRunner}
        path={path}
        location={location}
        active={path === file.path}
      />
    ))
    if (showActions && Actions.FILE_DROPDOWN_ACTIONS) {
      menuItems.push(<SUI.Dropdown.Divider key="divider" />, ...Actions.FILE_DROPDOWN_ACTIONS)
    }
    dropdownProps.children = <SUI.Dropdown.Menu>{menuItems}</SUI.Dropdown.Menu>
  }
  const dropdown = <SUI.Dropdown {...dropdownProps} />
  if (!showLabel) return dropdown
  return (
    <>
      <UI.DropdownLabel title="File:" icon={UI.FILE_ICON} />
      {dropdown}
    </>
  )
})

export type FileDropdownProps = {
  useRunner?: boolean
  showLabel?: boolean
  showActions?: boolean
}
