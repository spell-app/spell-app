import React from "react"
import { Dropdown } from "semantic-ui-react"
import type { DropdownProps } from "semantic-ui-react"

import { view } from "~/util"
import type { SpellLocation, SpellProject, AnySpellFile } from "~/languages/spell"

import { actions } from "~/app/actions"
import { UI } from "./ui"
import { store } from "~/app/store"

export type FileDropdownActionProps = {
  useRunner: boolean
  path: string
  location: SpellLocation
  active: boolean
}

/* Single item in FileDropdown */
const FileDropdownAction = React.memo(({ useRunner, path, location, active }: FileDropdownActionProps) => (
  <Dropdown.Item
    text={location.file}
    value={path}
    icon={UI.FILE_ICON}
    active={active}
    onClick={() => (useRunner ? store.showRunner(path) : store.showEditor(path))}
  />
))

export type FileDropdownProps = {
  useRunner?: boolean
  showLabel?: boolean
  showActions?: boolean
}

/** Menu of all available files for the selected project. */
export const FileDropdown = view(function FileDropdown({
  useRunner = false,
  showLabel = true,
  showActions = false
}: FileDropdownProps) {
  const { project, file }: { project?: SpellProject; file?: AnySpellFile } = store
  const ready = project?.isLoaded && !!file
  const dropdownProps: DropdownProps = {
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
    const menuItems: React.ReactElement[] = project.imports.map(({ path, location }) => (
      <FileDropdownAction
        key={path}
        useRunner={useRunner}
        path={path}
        location={location}
        active={path === file.path}
      />
    ))
    if (showActions && actions.FILE_DROPDOWN_ACTIONS) {
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
