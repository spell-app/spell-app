import { For, Show } from "solid-js"

import { SP } from "spell-parser/spell"
import { appTexts } from "spell-app/app/ui/AppTexts"
import { navigate } from "spell-app/app/pages/navigation"
import { on } from "spell-app/app/solid/on"
import { NotebookController, type SaveStatus } from "./NotebookController"

import "./NotebookHeader.css"

/****************
 * ### `<NotebookHeader>`
 * A notebook's tools in the program pane's header, the row its title is in (epic `elemental-spell` P18;
 * Owen, 2026-10-26:  the page has no toolbar of its own).
 * - Its title, the project's icon and name, is a menu of the project's notebooks (Examples, Usage, API):
 *   picking one shows it, through the app's router, so the page never reloads.
 * - The lock, an icon about 40px after the title, as the header's other icons are:  whoever can write the file locks
 *   it, or unlocks it.  Locked, nothing is ever saved, for anyone.
 * - What happened to the last edit, small and grey:  "Saved", or "Locked:  changes aren't saved";
 *   shown for a while after the edit, then faded out (`NotebookController.status()`).
 ****************/
export function NotebookHeader(props: { controller: NotebookController; icon: string; title: string }) {
  const { controller } = props
  const locked = () => !!controller.model()?.locked
  const notebooks = () => NotebookController.notebooksIn(controller.project)
  // what the status said last:  kept while it fades out
  let lastStatus = ""
  return (
    <div class="NotebookHeader">
      <ui-dropdown
        class="NotebookPicker"
        aria-label={appTexts.text("notebookPagePick")}
        title={appTexts.text("notebookPagePick")}
        ref={on<{ value: string }>("ui-changed", (event) => {
          const path = event.detail.value
          if (path && path !== controller.file.path) showNotebook(path)
          // picked again next time:  a dropdown tells only of a new value
          const dropdown = event.currentTarget as HTMLElement & { value: string }
          queueMicrotask(() => (dropdown.value = ""))
        })}
      >
        <h2 slot="trigger">
          <ui-icon name={props.icon} />
          {props.title}
        </h2>
        <For each={notebooks()}>
          {(file) => (
            <ui-item value={file.path} icon={file.path === controller.file.path ? "check" : "blank"}>
              {nameOf(file)}
            </ui-item>
          )}
        </For>
      </ui-dropdown>
      <Show when={controller.isAdmin()}>
        <span class="NotebookLock">
          <ui-icon
            name={locked() ? "lock" : "lock open"}
            link=""
            class={["IconAction", { active: locked() }]}
            label={appTexts.text(locked() ? "notebookPageUnlock" : "notebookPageLock")}
            title={appTexts.text(locked() ? "notebookPageUnlock" : "notebookPageLock")}
            aria-pressed={locked() ? "true" : "false"}
            onClick={() => controller.setLocked(!locked())}
          />
        </span>
      </Show>
      <span class={["NotebookStatus", controller.status() ?? "", { shown: !!controller.status() }]} role="status">
        {statusText(controller.status())}
      </span>
    </div>
  )

  /** The status's words;  the last ones stay while it fades. */
  function statusText(status: SaveStatus | undefined): string {
    if (status) lastStatus = appTexts.text(STATUS_TEXTS[status])
    return lastStatus
  }
}

/** Show the notebook at `path`, in the same mode (Edit or Run), through the router:  no reload. */
export function showNotebook(path: string) {
  const location = new SP.SpellLocation(path)
  navigate(window.location.pathname.startsWith(RUN_PREFIX) ? location.runnerUrl : location.editorUrl)
}

/** A notebook's name in the menu:  its file's, without `.spellx`. */
function nameOf(file: SP.SpellFile): string {
  return file.path
    .split("/")
    .at(-1)!
    .replace(/\.spellx$/, "")
}

/** The words of each status. */
const STATUS_TEXTS = {
  saving: "notebookPageSaving",
  saved: "notebookPageSaved",
  locked: "notebookPageLocked"
} as const

/** Run mode's addresses start so;  Edit's with `/edit/`. */
const RUN_PREFIX = "/run/"
