import { Show } from "solid-js"

import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import type { NotebookController } from "./NotebookController"
import { CodeViewSwitch } from "./NotebookCell"

/****************
 * ### `<NotebookToolbar>`
 * A notebook page's toolbar, stuck to the top as the page scrolls (epic `elemental-spell` P16).
 * - Edit (a pencil, toggled):  every example's code editable, prose and templates too.
 * - In edit mode:  Add (Example, Text, Section, Template, after the selected cell), Delete, Move up, Move down,
 *   acting on the selected cell;  ⌘Z undoes each.
 * - Show code as:  spellx / spell / html, one switch for the whole page, remembered per notebook.
 * - Lock it (whoever can write the file) and Try as a visitor;  then what happens to edits:
 *   "Your changes are saved", or "Trying it out:  changes aren't saved".
 ****************/
export function NotebookToolbar(props: { controller: NotebookController }) {
  const { controller } = props
  const hasSelection = () => !!controller.selected()
  const locked = () => !!controller.model()?.locked
  return (
    <div class="NotebookToolbar" role="toolbar" aria-label={controller.model()?.name}>
      <div class="NotebookToolbarGroup">
        <ui-button
          size="small"
          icon="pencil"
          active={controller.editing()}
          primary={controller.editing() ? "" : undefined}
          onClick={() => controller.toggleEditing()}
        >
          {appTexts.text(controller.editing() ? "notebookPageDone" : "notebookPageEdit")}
        </ui-button>
        <Show when={controller.editing()}>
          <ui-dropdown class="NotebookAdd" size="small" button="">
            <span slot="trigger">
              <ui-icon name="plus" />
              {appTexts.text("notebookPageAdd")}
            </span>
            {addItem("code", "notebookPageAddExample", () => controller.add(newExample()))}
            {addItem("paragraph", "notebookPageAddText", () => controller.add(appTexts.text("notebookPageNewText")))}
            {addItem("heading", "notebookPageAddSection", () =>
              controller.add(`## ${appTexts.text("notebookPageNewSection")}`)
            )}
            {addItem("cube", "notebookPageAddTemplate", () => controller.add(newTemplate()))}
          </ui-dropdown>
          {tool("trash alternate outline", "notebookPageDelete", () => controller.remove(), !hasSelection())}
          {tool("arrow up", "notebookMoveUp", () => controller.move("up"), !hasSelection())}
          {tool("arrow down", "notebookMoveDown", () => controller.move("down"), !hasSelection())}
          {tool("undo", "notebookPageUndo", () => controller.undo(), !controller.canUndo)}
        </Show>
      </div>
      <div class="NotebookToolbarGroup">
        <span class="NotebookToolbarLabel">{appTexts.text("notebookPageCodeAs")}</span>
        <CodeViewSwitch controller={controller} />
      </div>
      <div class="NotebookToolbarGroup end">
        <span class={["NotebookStatus", { tryout: !controller.canSave() }]}>
          {appTexts.text(
            !controller.canSave()
              ? "notebookPageTryingOut"
              : controller.saving()
                ? "notebookPageSaving"
                : "notebookPageSaved"
          )}
        </span>
        <Show when={controller.isAdmin() || controller.visitor()}>
          <ui-button
            size="small"
            basic=""
            icon="user secret"
            active={controller.visitor()}
            onClick={() => controller.toggleVisitor()}
          >
            {appTexts.text("notebookPageVisitor")}
          </ui-button>
        </Show>
        <Show when={controller.isAdmin()}>
          {tool(locked() ? "lock" : "lock open", locked() ? "notebookPageUnlock" : "notebookPageLock", () =>
            controller.setLocked(!locked())
          )}
        </Show>
      </div>
    </div>
  )

  /** A toolbar button:  an icon, its text the tooltip and its label;  greyed out while `disabled`. */
  function tool(icon: string, text: AppTextKey, run: () => unknown, disabled = false) {
    return (
      <ui-button
        size="small"
        basic=""
        icon={icon}
        disabled={disabled ? "" : undefined}
        title={appTexts.text(text)}
        label={appTexts.text(text)}
        onClick={() => void run()}
      />
    )
  }

  /** One of Add's items. */
  function addItem(icon: string, text: AppTextKey, run: () => unknown) {
    return (
      <ui-item icon={icon} onClick={() => void run()}>
        {appTexts.text(text)}
      </ui-item>
    )
  }

  /** A new example, in the notebook's language. */
  function newExample(): string {
    const word = controller.model()?.language === "es" ? "ejemplo" : "example"
    const text = controller.model()?.language === "es" ? "texto" : "text"
    return `<${word} "${appTexts.text("notebookPageNewExample")}">\n\t<${text}>Hello</${text}>\n</${word}>`
  }

  /** A new template:  a view that draws its name. */
  function newTemplate(): string {
    const spanish = controller.model()?.language === "es"
    const name = appTexts.text("notebookPageNewTemplate")
    return spanish
      ? `<encanto-vista "${name}">\n\t<dibujar><texto>${name}</texto></dibujar>\n</encanto-vista>`
      : `<spell-view "${name}">\n\t<draw><text>${name}</text></draw>\n</spell-view>`
  }
}
