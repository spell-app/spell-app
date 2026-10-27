import type { RouteSectionProps } from "@solidjs/router"
import { Match, Show, Switch, createSignal, onCleanup } from "solid-js"

import { SP } from "spell-parser/spell"
import {
  Actions,
  AppMenu,
  AppRoot,
  ConsoleRoot,
  EditorMode,
  InputRoot,
  Inspector,
  InspectorPane,
  InspectorPick,
  InspectorToggle,
  ModeButtons,
  OutputEditor,
  OutputRoot,
  PROJECT_ICON,
  ProjectDropdown,
  SpellPage,
  SplitPanel,
  Submenu,
  ThemeMenu,
  TreeRoot,
  tracked,
  trackProjectRoot,
  type Mode
} from "spell-app/app/solid"
import { editor } from "spell-app/app/editor"
import { editorPrefs } from "spell-app/app/editorPrefs"
import { appTexts, type AppTextKey } from "spell-app/app/ui/AppTexts"
// Import directly, NOT through the runner barrel, which brings the runners themselves
import { RunnerPane, type RunnerTab } from "spell-app/app/runner/RunnerPane"
import { NotebookPage } from "spell-app/app/solid/notebook/NotebookPage"
import { editorHotkeys } from "./editorHotkeys"
import { followRoute } from "./followRoute"
import type { EditorPage } from "./pages.types"

import "./SpellEditor.css"

/****************
 * ### `<SpellEditor>`
 * A project's page, in each of the editor's modes (`mode`, `EditorMode`):
 * - Edit:  the code (`<InputRoot>`) on the left, the running program (`<AppPane>`) on the right.
 * - Run:  the program alone, the code column gone.
 *   - ONE page for both (Owen:  "a discontinuity in the page when I switch between run / edit"):
 *     switching keeps the page, its bar and the running program where they are;  only the code column comes and goes.
 * - In Debug (`EditorMode`), the Program panel (`<ProgramPanel>`) sits under the code:
 *   its output, things, types and compiled code.  Closing it goes back to Edit.
 * - Showing or hiding the panel never redraws the code or the program:  the panel keeps each pane by its node.
 * - The Inspector, while it's open, is a pane at the far right (`<InspectorPane>`, epic `debut` P13):
 *   a pane of the same panel, so the same room round it as the app, and a bar to drag it wider or narrower.
 *   - Its own remembered sizes (`spellEditor-columns-inspector`):  three panes, not two.
 *   - On a phone, a sheet that slides up over the page as something's picked (epic `debut` P17, Q6).
 * - SIDE EFFECT:  the page's keyboard shortcuts while it's up, outside Monaco (`editorHotkeys()`).
 ****************/
export function SpellEditor(props: { mode: Mode }) {
  editorHotkeys()
  const isRunning = () => props.mode === "run"
  const isDebugging = () => props.mode === "debug"
  const layout = () => columnsFor(isRunning(), Inspector.isOpen)
  return (
    <SpellPage id="SpellEditor" fillWindow dark rows>
      <EditorToolbar mode={props.mode} />
      <SplitPanel id={layout().id} columns={layout().columns} resizable fluid spaced="tightly">
        <Show when={!isRunning()}>
          <SplitPanel id="spellEditor-left" rows={isDebugging() ? "65%" : "100%"} resizable rounded>
            <InputRoot />
            <Show when={isDebugging()}>
              <ProgramPanel onClose={() => EditorMode.show("edit")} />
            </Show>
          </SplitPanel>
        </Show>
        <SplitPanel rows rounded>
          <AppPane />
        </SplitPanel>
        <Show when={Inspector.isOpen}>
          <InspectorPane />
        </Show>
      </SplitPanel>
    </SpellPage>
  )
}

/****************
 * ### `<AppPane>`
 * The running program, under a header:  the project's group icon and its title;
 * at the right, Restart, the Inspector's crosshairs, its button (and its menu of cards) and Settings.
 * - The program's mount point (`<AppRoot>`) is drawn once, and never redrawn.
 * - Its body is the area the Inspector picks parts in (`Inspector.watch()`).
 * - Shown in every mode, Run's too:  the page keeps it as the code column comes and goes.
 * - A NOTEBOOK's project (a `.spellx` file holding a `<spell-notebook>`, epic `elemental-spell` P16) shows its page
 *   instead, editable in place (`<NotebookPage>`):  the program still runs in its mount point, out of sight, its
 *   classes and its notebook what the page's cells draw with.
 ****************/
export function AppPane() {
  const root = trackProjectRoot(() => undefined)
  const title = tracked(() => (editor.project ? new SP.SpellProject(editor.project.path).title : ""))
  const notebook = tracked(() => notebookOf(editor.project, editor.file))
  return (
    <div class="AppPane">
      <header class="AppPaneHeader">
        <h2>
          <ui-icon name={root().icon ?? PROJECT_ICON} />
          {title()}
        </h2>
        <Actions.restartApp iconOnly />
        <InspectorPick />
        <InspectorToggle />
        <Actions.showProjectSettings iconOnly />
      </header>
      <div class="AppPaneBody" ref={(area) => onCleanup(Inspector.watch(area))}>
        <div class={["AppPaneProgram", { hidden: !!notebook() }]}>
          <AppRoot showToolbar={false} />
        </div>
        <Show when={notebook()} keyed>
          {(file) => <NotebookPage file={file} project={editor.project!} />}
        </Show>
      </div>
    </div>
  )
}

/****************
 * ### `<ProgramPanel>`
 * Debug's panel under the code:  one pane of tabs (`<RunnerPane>`), as VS Code's runner panel has.
 * - Output:  what the program logged, and how compiling and running it went (`<ConsoleViewer>`).
 * - JavaScript:  the compiled code (`<OutputRoot>`);  TypeScript and Python:  the project as those targets write it.
 * - The file's other form, a read-only view (epic `elemental-spell` J95:  a template lives in ONE file):
 *   - Code Spell, on a `.spellx` file:  the code spell it means (`SX.CodeSpellWriter`;  P8)
 *   - Spellx, on a `.spell` file:  it written as spellx (`SX.SpellxWriter`)
 * - Sentence:  the spell tree of the cursor's line (`<TreeRoot>`).
 * - At the right, whatever tab shows:  Clear Console, on Output only, and Close (`onClose`).
 * - Remembers which tab shows, as the editor's preference `spellEditor:programTab`.
 * - Things and Types (Templates) are the Inspector's now, in its Views card (`<InspectorViews>`):
 *   a tab remembered from before shows Program Output.
 ****************/
export function ProgramPanel(props: { onClose: () => void }) {
  const remembered = editorPrefs.get(TAB_PREF) as ProgramTabId
  const [tab, setTab] = createSignal<ProgramTabId>(PROGRAM_TABS.includes(remembered) ? remembered : "output")
  // which form the file is in:  its other form is the `spell` tab's view
  const form = tracked(() => (editor.file instanceof SP.SpellFile ? editor.file.form : undefined))
  return (
    <RunnerPane
      class="ProgramPanel"
      tabs={PROGRAM_TABS.map((id) => tabFor(id, form()))}
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
            class="IconAction close"
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
        <Match when={tab() === "javascript"}>
          <OutputRoot showToolbar={false} />
        </Match>
        <Match when={tab() === "typescript"}>
          <OutputEditor showError={editor.showError} target="ts/solid" />
        </Match>
        <Match when={tab() === "python"}>
          <OutputEditor showError={editor.showError} target="py" />
        </Match>
        <Match when={tab() === "spell" && form() === "spellx"}>
          <OutputEditor showError={editor.showError} target="spell" />
        </Match>
        <Match when={tab() === "spell"}>
          <OutputEditor showError={editor.showError} target="spellx" />
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

/**
 * `project`'s notebook, if it's one:  a `.spellx` file holding a `<spell-notebook>` (`<encanto-cuaderno>`).
 * - The one open in the editor (`open`), when it's a notebook:  a project of several shows each at its own address,
 *   `/edit/@spell/notebooks/Avatar/Usage.spellx` (epic `elemental-spell` P18).
 * - Else its first.
 * - Read from the files' text, so the page shows as soon as the project's loaded.
 */
function notebookOf(
  project: SP.SpellProject | undefined,
  open: { path?: string } | undefined
): SP.SpellFile | undefined {
  if (!project?.isLoaded) return undefined
  const notebooks = project.spellFiles.filter(
    (file) => file.form === "spellx" && NOTEBOOK_TAG.test(file.contents ?? "")
  )
  return notebooks.find((file) => file.path === open?.path) ?? notebooks[0]
}

/** A notebook's tag, at a line's start:  `<spell-notebook`, Spanish's `<encanto-cuaderno`. */
const NOTEBOOK_TAG = /^[ \t]*<(?:spell-notebook|encanto-cuaderno)\b/m

/**
 * The page's columns and the preference that remembers their sizes, for each set of panes:
 * code or not (Run), the Inspector or not.
 * - The Inspector starts 380px wide, as the Theme Creator's;  never narrower than 300px (`SpellEditor.css`).
 */
function columnsFor(isRunning: boolean, isInspecting: boolean): { id: string; columns: string | true } {
  const id = `spellEditor-columns${isRunning ? "-run" : ""}${isInspecting ? "-inspector" : ""}`
  if (!isInspecting) return { id, columns: true }
  return { id, columns: isRunning ? "*,380px" : "*,*,380px" }
}

/** Tabs of `<ProgramPanel>`, in order;  `spell` is the file's other form, code spell or spellx (`tabFor()`). */
const PROGRAM_TABS = ["output", "javascript", "typescript", "python", "spell", "tree"] as const
/** One of `<ProgramPanel>`'s tabs. */
type ProgramTabId = (typeof PROGRAM_TABS)[number]
/** Icon of each tab (Fomantic's names, else Font Awesome's), and its title's key. */
const TAB_LOOKS: Record<ProgramTabId, { icon: string; text: AppTextKey }> = {
  output: { icon: "list", text: "outputTab" },
  javascript: { icon: "js", text: "javascriptTab" },
  typescript: { icon: "code", text: "typescriptTab" },
  python: { icon: "python", text: "pythonTab" },
  spell: { icon: "file alternate outline", text: "codeSpellTab" },
  tree: { icon: "tree", text: "treeTab" }
}
/** The preference that remembers which tab `<ProgramPanel>` shows. */
const TAB_PREF = "programTab"
// TODO:  drop the rename once every browser has opened the editor since epic `prefs-and-undo` P1
editorPrefs.declare(TAB_PREF, { oneOf: PROGRAM_TABS }).rename("spellEditor.programTab", TAB_PREF)

/**
 * Tab `id`, titled in the page's language.
 * - `spell`, the file's other form:  "Code Spell" on a `.spellx` file, "Spellx" on a `.spell` file (`form`).
 */
function tabFor(id: ProgramTabId, form: SP.SpellForm | undefined): RunnerTab<ProgramTabId> {
  const text = id === "spell" && form !== "spellx" ? "spellxTab" : TAB_LOOKS[id].text
  return { id, icon: TAB_LOOKS[id].icon, title: appTexts.text(text) }
}

/****************
 * ### `<EditorToolbar>`
 * Top menu of the editor's page:  the project dropdown (the project's actions at its foot);
 * Run | Edit | Debug in the middle;  at the right, the theme menu, Home (the landing page) and the person.
 * - Restart, the Inspector's button and Settings are the App pane's (`<AppPane>`).
 * - `mode`:  the page's, pressed in `<ModeButtons>`.
 * - The static build's "Reset Example" sits by the project actions (`Actions.resetApp`, drawn only there).
 ****************/
export function EditorToolbar(props: { mode: Mode }) {
  return (
    <AppMenu>
      <Submenu left spring mark>
        <ProjectDropdown useRunner={props.mode === "run"} showActions />
        <Actions.resetApp />
      </Submenu>
      <Submenu center spring>
        <ModeButtons current={props.mode} />
      </Submenu>
      <Submenu right spring>
        <ThemeMenu />
        <Actions.showProjectChooser iconOnly />
        <Actions.you />
      </Submenu>
    </AppMenu>
  )
}

/****************
 * ### `<ProjectPageRoute>`
 * The `/edit/...` and `/run/...` routes:  `<SpellEditor>`, showing the project / file the URL names (`followRoute()`),
 * in Run for `/run/`, else in Edit or Debug, as `EditorMode` remembers.
 * - ONE route for both:  it stays mounted while only the URL's params change, the page (`edit`, `run`) too,
 *   so switching between Run and Edit, or between files, doesn't redraw the page.
 ****************/
export function ProjectPageRoute(props: RouteSectionProps) {
  const page = (): EditorPage => (props.params.page === RUN_PAGE ? "runner" : "editor")
  followRoute(() => props.params, page)
  return <SpellEditor mode={page() === "runner" ? "run" : EditorMode.editing} />
}

/** The run page's word in its URL, `/run/...`. */
const RUN_PAGE = "run"
