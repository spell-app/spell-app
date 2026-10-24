import type { RouteSectionProps } from "@solidjs/router"
import { Match, Show, Switch, createSignal } from "solid-js"

import { getPref, setPref } from "spell/util"

import {
  Actions,
  AppMenu,
  AppRoot,
  ConsoleRoot,
  InputRoot,
  MoreMenu,
  OutputRoot,
  ProjectActionsDropdown,
  ProjectDropdown,
  SpellPage,
  SplitPanel,
  Submenu,
  ThemeMenu,
  ThingExplorer,
  TreeRoot,
  TypeExplorer
} from "spell-app/app/solid"
import { editor, runtimeCore } from "spell-app/app/editor"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
import type { ThingExplorerState } from "spell-app/app/ui/ui.types"
// Import directly, NOT through the runner barrel, which brings the runners themselves
import { RunnerPane, type RunnerTab } from "spell-app/app/runner/RunnerPane"
import { editorHotkeys } from "./editorHotkeys"
import { followRoute } from "./followRoute"

import "./SpellEditor.css"

/****************
 * ### `<SpellEditor>`
 * The editing page:  `<InputRoot>` (the code) above `<ConsoleRoot>` (compile and run log) on the left;
 * `<EditorTabs>` on the right:  the running program, its things and types, its javascript, the spell tree.
 * - SIDE EFFECT:  the page's keyboard shortcuts while it's up, outside Monaco (`editorHotkeys()`).
 ****************/
export function SpellEditor() {
  editorHotkeys()
  return (
    <SpellPage id="SpellEditor" fillWindow dark rows>
      <EditorToolbar />
      <SplitPanel id="spellEditor-columns" columns resizable fluid spaced="tightly">
        <SplitPanel id="spellEditor-left" rows="85%" resizable rounded>
          <InputRoot />
          <ConsoleRoot />
        </SplitPanel>
        <SplitPanel rows rounded>
          <EditorTabs />
        </SplitPanel>
      </SplitPanel>
    </SpellPage>
  )
}

/****************
 * ### `<EditorTabs>`
 * The editor's right column:  one pane of tabs, as VS Code's runner panel and `<spell-app>` have (`<RunnerPane>`).
 * - App:  the running program (`<AppRoot>`).
 *   - ALWAYS drawn, just hidden behind another tab:  the program's mount point is never redrawn.
 * - Things:  what the running program has made, live (`<ThingExplorer>` on `runtimeCore()`'s `things`).
 * - Types:  every type the code knows (`<TypeExplorer>` on `editor.scopeTree`, from the in-page language service).
 * - JavaScript:  the compiled code (`<OutputRoot>`).
 * - Tree:  the spell tree of the cursor's line (`<TreeRoot>`).
 * - Restart and Publish sit at the tab bar's right, whatever tab shows:  plain icons, each with a tooltip.
 * - Types and Things follow each compile:  `editor.compileApp()` works out a new tree, and runs the program.
 * - Remembers which tab shows, as a preference (`TAB_PREF`).
 * - Switching tabs loses neither explorer's state, while the page is up:
 *   the Types tab keeps its own, and the Things tab's is kept here (`thingsState`).
 ****************/
export function EditorTabs() {
  const [tab, setTab] = createSignal<EditorTabId>(tabOrDefault(getPref(TAB_PREF, undefined)))
  // the Things tab's state, kept here so it outlives switching tabs:  the explorer reads it once, as it mounts
  let thingsState: ThingExplorerState = {}
  return (
    <RunnerPane
      class="EditorTabs"
      tabs={EDITOR_TABS.map(tabFor)}
      pane={tab()}
      onPane={showTab}
      tools={
        <>
          <ui-icon
            name="redo"
            link=""
            class="restart"
            label={appTexts.text("restart")}
            title={appTexts.text("restart")}
            onClick={() => void editor.restartApp()}
          />
          <ui-icon
            name="world"
            link=""
            class="publish"
            label={appTexts.text("publish")}
            title={appTexts.text("publish")}
            onClick={() => editor.publishApp()}
          />
        </>
      }
    >
      <div class="EditorTab" hidden={tab() !== "app"}>
        <AppRoot showToolbar={false} />
      </div>
      <Switch>
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
        <Match when={tab() === "tree"}>
          <TreeRoot showToolbar={false} />
        </Match>
      </Switch>
    </RunnerPane>
  )

  /** Show tab `id`, and remember it. */
  function showTab(id: EditorTabId) {
    setTab(id)
    setPref(TAB_PREF, id)
  }
}

/** Tabs of `<EditorTabs>`, in order. */
const EDITOR_TABS = ["app", "things", "types", "javascript", "tree"] as const
/** One of `<EditorTabs>`'s tabs. */
type EditorTabId = (typeof EDITOR_TABS)[number]
/** Icon of each tab, by Fomantic's name, and its title's key. */
const TAB_LOOKS: Record<EditorTabId, { icon: string; text: AppTextKey }> = {
  app: { icon: "play", text: "appTab" },
  things: { icon: "cubes", text: "thingsTab" },
  types: { icon: "sitemap", text: "typesTab" },
  javascript: { icon: "code", text: "javascriptTab" },
  tree: { icon: "tree", text: "treeTab" }
}
/** The preference that remembers which tab `<EditorTabs>` shows. */
const TAB_PREF = "spellEditor.tab"

/** Tab `id`, titled in the page's language. */
function tabFor(id: EditorTabId): RunnerTab<EditorTabId> {
  return { id, icon: TAB_LOOKS[id].icon, title: appTexts.text(TAB_LOOKS[id].text) }
}

/** `saved` if it's one of our tabs, e.g. a remembered preference, else the App tab. */
function tabOrDefault(saved: unknown): EditorTabId {
  return EDITOR_TABS.find((id) => id === saved) ?? "app"
}

/****************
 * ### `<EditorToolbar>`
 * Top menu of `<SpellEditor>`:  the project dropdown, preview / settings / project actions;  the chooser;  about.
 * - The static build's "Reset Example" sits by the project actions (`Actions.resetApp`, drawn only there).
 ****************/
export function EditorToolbar() {
  return (
    <AppMenu>
      <Submenu left spring>
        <ProjectDropdown />
        <Actions.showRunner />
        <Actions.showProjectSettings />
        <Actions.resetApp />
        <ProjectActionsDropdown />
      </Submenu>
      <Submenu center spring>
        <Actions.showProjectChooser />
      </Submenu>
      <Submenu right spring>
        <ThemeMenu />
        <Actions.aboutSpell />
        <Actions.you />
        <MoreMenu stub />
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
