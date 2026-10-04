import { For, Show } from "solid-js"

import { editor } from "$/app/editor"
import { Actions, DropdownLabel, FILE_ICON, on, tracked } from "$/app/solid"

import "./FileDropdown.css"

/****************
 * ### `<FileDropdown>`
 * Menu of all available files for the selected project (`editor.project`):  a `<ui-dropdown>` of `<ui-item>`s,
 * showing `editor.file`.  Same props as React's `UI.FileDropdown` had.
 * - Choosing a file shows it in `<SpellEditor>`, or `<SpellRunner>` with `useRunner`.
 * - Loading (spinning caret, no items) until the project's loaded and has a file.
 * - The dropdown's value is ALWAYS `editor.file`'s path:  choosing sets it back during the event, and shows the file
 *   chosen, which then becomes `editor.file` (see `choose()`).
 * - `showActions`:  `Actions.FILE_DROPDOWN_ACTIONS` after a divider, as dropdown items;  choosing
 *   one clicks it, as `<MoreMenu>` does.
 * - Sits in a menu:  wrapped in a `<ui-item class="FileDropdown">`.  Look:  `FileDropdown.css`.
 ****************/
export function FileDropdown(props: FileDropdownProps) {
  /** What it shows, read from `editor` in one go. */
  const state = tracked(() => {
    const { project, file } = editor
    const ready = !!project?.isLoaded && !!file
    return {
      ready,
      path: file?.path ?? "",
      files: ready ? project.imports.map(({ path, location }) => ({ path, name: location.file })) : []
    }
  })

  return (
    <>
      <Show when={props.showLabel ?? true}>
        {/* HACK: a slotted `<ui-icon>`, not `icon`:  see `<Action>` */}
        <DropdownLabel>
          <ui-icon name={FILE_ICON} />
          File:
        </DropdownLabel>
      </Show>
      <ui-item class="FileDropdown">
        <ui-dropdown
          id="FileDropdown"
          class="FileDropdown"
          loading={!state().ready}
          prop:value={state().path}
          ref={on<{ value: string }>("ui-change", choose)}
        >
          <For each={state().files} keyed={(file) => file.path}>
            {(file) => (
              <ui-item value={file().path} icon={FILE_ICON} onClick={() => open(file().path)}>
                {file().name}
              </ui-item>
            )}
          </For>
          <Show when={props.showActions && state().ready}>
            <ui-item type="divider" />
            <Actions.FILE_DROPDOWN_ACTIONS />
          </Show>
        </ui-dropdown>
      </ui-item>
    </>
  )

  /** Show the file at `path`, in the editor or the runner. */
  function open(path: string) {
    if (props.useRunner) void editor.showRunner(path)
    else editor.showEditor(path)
  }
}

/** Props for `<FileDropdown>`. */
export type FileDropdownProps = {
  /** Open `<SpellRunner>` instead of `<SpellEditor>` when an item is clicked. */
  useRunner?: boolean
  /** Put a `<DropdownLabel>` before the dropdown.  Default:  `true`. */
  showLabel?: boolean
  /** Append `Actions.FILE_DROPDOWN_ACTIONS` after a divider. */
  showActions?: boolean
}

/**
 * The dropdown's `ui-change`:  click the item chosen -- a file's opens it, an action's runs it.
 * - SIDE EFFECT:  sets the dropdown's `value` back to `editor.file`'s DURING the event, so the dropdown keeps ours:
 *   the host decides (`Controlled`, `packages/ui/src/elements/Controlled.ts`).  Opening the file then moves it on.
 */
function choose(event: CustomEvent<{ value: string }>) {
  const dropdown = event.currentTarget as HTMLElement & { value?: unknown }
  dropdown.value = editor.file?.path ?? ""
  const item = [...dropdown.children].find(
    (child) =>
      child.localName === "ui-item" && (child.getAttribute("value") ?? child.textContent?.trim()) === event.detail.value
  )
  ;(item as HTMLElement | undefined)?.click()
}
