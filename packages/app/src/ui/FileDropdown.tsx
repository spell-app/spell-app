/** @jsxImportSource react */
import React from "react"
import * as SUI from "semantic-ui-react"

import { view } from "$/util"
import type { SP } from "$/spell"

import { editor } from "$/app/editor"

import { UI } from "$/app/ui"
import { Actions } from "./Actions"

/****************
 * ### `<FileDropdownAction>`
 * Single item in `<FileDropdown>`'s menu, for one file `path` in the current project.
 ****************/
const FileDropdownAction = React.memo(({ useRunner, path, location, active }: FileDropdownActionProps) => (
  <SUI.Dropdown.Item
    text={location.file}
    value={path}
    icon={UI.FILE_ICON}
    active={active}
    onClick={() => (useRunner ? editor.showRunner(path) : editor.showEditor(path))}
  />
))

/** Props for `<FileDropdownAction>`. */
export type FileDropdownActionProps = {
  /** Open `<SpellRunner>` instead of `<SpellEditor>` when clicked. */
  useRunner: boolean
  /** File path this item selects. */
  path: string
  /** Parsed location for `path`, used to show its file name. */
  location: SP.SpellLocation
  /** Whether this is `editor.file`, the currently selected file. */
  active: boolean
}

/****************
 * ### `<FileDropdown>`
 * Menu of all available files for the selected project (`editor.project`).
 ****************/
export const FileDropdown = view(function FileDropdown({
  useRunner = false,
  showLabel = true,
  showActions = false
}: FileDropdownProps) {
  const { project, file }: { project?: SP.SpellProject; file?: SP.AnySpellFile } = editor
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

/** Props for `<FileDropdown>`. */
export type FileDropdownProps = {
  /** Open `<SpellRunner>` instead of `<SpellEditor>` when an item is clicked. */
  useRunner?: boolean
  /** Prepend a `<UI.DropdownLabel>` before the dropdown. */
  showLabel?: boolean
  /** Append `Actions.FILE_DROPDOWN_ACTIONS` after a divider. */
  showActions?: boolean
}
