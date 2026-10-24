import type { RouteSectionProps } from "@solidjs/router"
import { Match, Show, Switch, createSignal } from "solid-js"

import { SP } from "spell-parser/spell"
import {
  Actions,
  AppMenu,
  AppRoot,
  ConsoleRoot,
  EditorMode,
  InputRoot,
  ModeButtons,
  OutputEditor,
  OutputRoot,
  PROJECT_ICON,
  ProjectActionsDropdown,
  ProjectDropdown,
  SpellPage,
  SplitPanel,
  Submenu,
  ThemeMenu,
  ThingExplorer,
  TreeRoot,
  TypeExplorer,
  tracked,
  trackProjectRoot,
  type Mode
} from "spell-app/app/solid"
import { editor, runtimeCore } from "spell-app/app/editor"
import { editorPrefs } from "spell-app/app/editorPrefs"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import type { ThingExplorerState } from "spell-app/app/ui/ui.types"
// Import directly, NOT through the runner barrel, which brings the runners themselves
import { RunnerPane, type RunnerTab } from "spell-app/app/runner/RunnerPane"
import { editorHotkeys } from "./editorHotkeys"
import { followRoute } from "./followRoute"

import "./SpellEditor.css"

/****************
 * ### `<SpellEditor>`
 * The editing page:  the code (`<InputRoot>`) on the left, the running program (`<AppPane>`) on the right.
 * - In Debug (`EditorMode`), the Program panel (`<ProgramPanel>`) sits under the code:
 *   its output, things, types and compiled code.  Closing it goes back to Edit.
 * - Showing or hiding the panel never redraws the code or the program:  the panel keeps each pane by its node.
 * - SIDE EFFECT:  the page's keyboard shortcuts while it's up, outside Monaco (`editorHotkeys()`).
 ****************/
export function SpellEditor() {
  editorHotkeys()
  const isDebugging = () => EditorMode.editing === "debug"
  return (
    <SpellPage id="SpellEditor" fillWindow dark rows>
      <EditorToolbar mode={EditorMode.editing} />
      <SplitPanel id="spellEditor-columns" columns resizable fluid spaced="tightly">
        <SplitPanel id="spellEditor-left" rows={isDebugging() ? "65%" : "100%"} resizable rounded>
          <InputRoot />
          <Show when={isDebugging()}>
            <ProgramPanel onClose={() => EditorMode.show("edit")} />
          </Show>
        </SplitPanel>
        <SplitPanel rows rounded>
          <AppPane />
        </SplitPanel>
      </SplitPanel>
    </SpellPage>
  )
}

/****************
 * ### `<AppPane>`
 * The running program, under a header:  the project's group icon and its title, then Restart at the right.
 * - The program's mount point (`<AppRoot>`) is drawn once, and never redrawn.
 * - Also the run page's (`<SpellRunner>`).
 ****************/
export function AppPane() {
  const root = trackProjectRoot(() => undefined)
  const title = tracked(() => (editor.project ? new SP.SpellProject(editor.project.path).title : ""))
  return (
    <div class="AppPane">
      <header class="AppPaneHeader">
        <h2>
          <ui-icon name={root().icon ?? PROJECT_ICON} />
          {title()}
        </h2>
        <Actions.restartApp iconOnly />
      </header>
      <AppRoot showToolbar={false} />
    </div>
  )
}

/****************
 * ### `<ProgramPanel>`
 * Debug's panel under the code:  one pane of tabs (`<RunnerPane>`), as VS Code's runner panel has.
 * - Program Output:  what the program logged, and how compiling and running it went (`<ConsoleViewer>`).
 * - Things:  what the running program has made, live (`<ThingExplorer>` on `runtimeCore()`'s `things`).
 * - Types:  every type the code knows (`<TypeExplorer>` on `editor.scopeTree`, from the in-page language service).
 * - JavaScript:  the compiled code (`<OutputRoot>`);  TypeScript and Python:  the project as those targets write it.
 * - Sentence Tree:  the spell tree of the cursor's line (`<TreeRoot>`).
 * - At the right, whatever tab shows:  Clear Console, on Program Output only, and Close (`onClose`).
 * - Types and Things follow each compile:  `editor.compileApp()` works out a new tree, and runs the program.
 * - Remembers which tab shows, as a preference (`TAB_PREF`).
 * - Switching tabs loses neither explorer's state, while the page is up:
 *   the Types tab keeps its own, and the Things tab's is kept here (`thingsState`).
 ****************/
export function ProgramPanel(props: { onClose: () => void }) {
  const [tab, setTab] = createSignal(editorPrefs.get(TAB_PREF) as ProgramTabId)
  // the Things tab's state, kept here so it outlives switching tabs:  the explorer reads it once, as it mounts
  let thingsState: ThingExplorerState = {}
  return (
    <RunnerPane
      class="ProgramPanel"
      tabs={PROGRAM_TABS.map(tabFor)}
      pane={tab()}
      onPane={showTab}
      tools={
        <>
          <Show when={tab() === "output"}>
            <Actions.clearConsole iconOnly />
          </Show>
          <ui-icon
            name="close"
            link=""
            class="close"
            label={appTexts.text("closeProgram")}
            data-tooltip={appTexts.text("closeProgram")}
            data-position="bottom right"
            data-inverted=""
            onClick={() => props.onClose()}
          />
        </>
      }
    >
      <Switch>
        <Match when={tab() === "output"}>
          <ConsoleRoot showToolbar={false} />
        </Match>
        <Match when={tab() === "things"}>
          <Show when={runtimeCore()?.things} keyed>
            {(things) => (
              <ThingExplorer
                things={things}
                words={editor.programWords}
                state={thingsState}
                onStateChange={(changed) => (thingsState = changed)}
              />
            )}
          </Show>
        </Match>
        <Match when={tab() === "types"}>
          <TypeExplorer
            tree={editor.scopeTree}
            onOpen={editor.openScopeLink}
            loadDetails={editor.scopeDetails}
            onRefresh={() => void editor.refreshScopes()}
          />
        </Match>
        <Match when={tab() === "javascript"}>
          <OutputRoot showToolbar={false} />
        </Match>
        <Match when={tab() === "typescript"}>
          <OutputEditor showError={editor.showError} target="ts/solid" />
        </Match>
        <Match when={tab() === "python"}>
          <OutputEditor showError={editor.showError} target="py" />
        </Match>
        <Match when={tab() === "tree"}>
          <TreeRoot showToolbar={false} />
        </Match>
      </Switch>
    </RunnerPane>
  )

  /** Show tab `id`, and remember it. */
  function showTab(id: ProgramTabId) {
    setTab(id)
    editorPrefs.set(TAB_PREF, id)
  }
}

/** Tabs of `<ProgramPanel>`, in order. */
const PROGRAM_TABS = ["output", "things", "types", "javascript", "typescript", "python", "tree"] as const
/** One of `<ProgramPanel>`'s tabs. */
type ProgramTabId = (typeof PROGRAM_TABS)[number]
/** Icon of each tab (Fomantic's names, else Font Awesome's), and its title's key. */
const TAB_LOOKS: Record<ProgramTabId, { icon: string; text: AppTextKey }> = {
  output: { icon: "list", text: "outputTab" },
  things: { icon: "cubes", text: "thingsTab" },
  types: { icon: "sitemap", text: "typesTab" },
  javascript: { icon: "js", text: "javascriptTab" },
  typescript: { icon: "code", text: "typescriptTab" },
  python: { icon: "python", text: "pythonTab" },
  tree: { icon: "tree", text: "treeTab" }
}
/** The preference that remembers which tab `<ProgramPanel>` shows. */
const TAB_PREF = "programTab"
// TODO:  drop the rename once every browser has opened the editor since epic `prefs-and-undo` P1
editorPrefs.declare(TAB_PREF, { oneOf: PROGRAM_TABS }).rename("spellEditor.programTab", TAB_PREF)

/** Tab `id`, titled in the page's language. */
function tabFor(id: ProgramTabId): RunnerTab<ProgramTabId> {
  return { id, icon: TAB_LOOKS[id].icon, title: appTexts.text(TAB_LOOKS[id].text) }
}

/****************
 * ### `<EditorToolbar>`
 * Top menu of the editor's pages:  the project dropdown, Run | Edit | Debug, settings and the project's actions;
 * the chooser;  the theme menu and the person.
 * - `mode`:  the page's, pressed in `<ModeButtons>`.
 * - The static build's "Reset Example" sits by the project actions (`Actions.resetApp`, drawn only there).
 ****************/
export function EditorToolbar(props: { mode: Mode }) {
  return (
    <AppMenu>
      <Submenu left spring>
        <ProjectDropdown useRunner={props.mode === "run"} />
        <ModeButtons current={props.mode} />
        <Actions.showProjectSettings iconOnly />
        <Actions.resetApp />
        <ProjectActionsDropdown />
      </Submenu>
      <Submenu center spring>
        <Actions.showProjectChooser />
      </Submenu>
      <Submenu right spring>
        <ThemeMenu />
        <Actions.you />
      </Submenu>
    </AppMenu>
  )
}

/****************
 * ### `<SpellEditorRoute>`
 * The `/edit/...` routes:  `<SpellEditor>`, showing the project / file the URL names (`followRoute()`).
 * - Stays mounted while only the URL's params change:  moving between files doesn't redraw the page.
 ****************/
export function SpellEditorRoute(props: RouteSectionProps) {
  followRoute(() => props.params, "editor")
  return <SpellEditor />
}
