import { For, Show } from "solid-js"

import { editor } from "spell-app/app/editor"
import { Actions, FILE_ICON, on, tracked } from "spell-app/app/solid"
import { isStaticBuild } from "spell-app/app/static/staticBuild"

import "./FileDropdown.css"

/****************
 * ### `<FileDropdown>`
 * Menu of all available files for the selected project (`editor.project`):
 * a `<ui-dropdown>` of `<ui-item>`s, showing `editor.file`.
 * Same props as React's `UI.FileDropdown` had.
 * - Choosing a file shows it in `<SpellEditor>`, or in Run with `useRunner`.
 * - Its trigger shows the file icon before the file's name (the `trigger` slot), as each item does.
 * - Loading (spinning caret, no items) until the project's loaded and has a file.
 * - A file the project doesn't import (a `.spellx` beside its `.spell`) is listed after its imports, by its name,
 *   so the trigger still names it.
 * - The dropdown's value is ALWAYS `editor.file`'s path (see `choose()`):
 *   choosing sets it back during the event, and shows the file chosen, which then becomes `editor.file`.
 * - `showActions`:  `Actions.FILE_DROPDOWN_ACTIONS` after a divider, as dropdown items;
 *   choosing one clicks it, as `<MoreMenu>` does.
 * - Sits in a menu:  wrapped in a `<ui-item class="FileDropdown">`.  Look:  `FileDropdown.css`.
 * - SEE:  its App UI components page, `app/docs/FileDropdown.html` (`/components/app/FileDropdown.html`).
 ****************/
export function FileDropdown(props: FileDropdownProps) {
  /** What it shows, read from `editor` in one go. */
  const state = tracked(() => {
    const { project, file } = editor
    const ready = !!project?.isLoaded && !!file
    const files = ready ? project.imports.map(({ path, location }) => ({ path, name: location.file })) : []
    // a file the project doesn't import (a `.spellx` beside its `.spell`) is listed too, by its file name
    if (ready && !files.some((each) => each.path === file.path))
      files.push({ path: file.path, name: file.path.split("/").at(-1) ?? file.path })
    return { ready, path: file?.path ?? "", files }
  })

  const selectedName = () => state().files.find((file) => file.path === state().path)?.name

  return (
    <ui-item class="FileDropdown">
      <ui-dropdown
        id="FileDropdown"
        class="FileDropdown"
        loading={!state().ready}
        value={state().path}
        ref={on<{ value: string }>("ui-changed", choose)}
      >
        <span slot="trigger" class="FileDropdownTrigger">
          <ui-icon name={FILE_ICON} />
          {selectedName()}
        </span>
        <For each={state().files} keyed={(file) => file.path}>
          {(file) => (
            <ui-item value={file().path} icon={FILE_ICON} onClick={() => open(file().path)}>
              {file().name}
            </ui-item>
          )}
        </For>
        <Show when={props.showActions && state().ready && !isStaticBuild}>
          <ui-item type="divider" />
          <Actions.FILE_DROPDOWN_ACTIONS />
        </Show>
      </ui-dropdown>
    </ui-item>
  )

  /** Show the file at `path`, in the editor or the runner. */
  function open(path: string) {
    if (props.useRunner) void editor.showRunner(path)
    else editor.showEditor(path)
  }
}

/** Props for `<FileDropdown>`. */
export type FileDropdownProps = {
  /** Open the file in Run, not Edit, when an item is clicked. */
  useRunner?: boolean
  /** Append `Actions.FILE_DROPDOWN_ACTIONS` after a divider -- never in the static build, which has none. */
  showActions?: boolean
}

/**
 * The dropdown's `ui-changed`:  click the item chosen -- a file's opens it, an action's runs it.
 * - SIDE EFFECT:  sets the dropdown's `value` back to `editor.file`'s DURING the event, so the dropdown keeps ours:
 *   the host decides (`requestChange()` on a `@controlled` member, the kit's `element/src/Reactive.ts`).
 * - Opening the file then moves it on.
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
