import { For, Show, createEffect, createMemo, createSignal, omit } from "solid-js"

import { SP } from "spell-parser/spell"
import type { UIMenuJSXAttributes } from "spell-ui/jsx"
import { SPACES } from "spell-app/spaces"
import { editor } from "spell-app/app/editor"
import { appTexts, type GroupWords } from "spell-app/app/ui/AppTexts"
import { Actions, PROJECT_ICON, on, tracked } from "spell-app/app/solid"
import { isStaticBuild } from "spell-app/app/static/staticBuild"

import "./ProjectDropdown.css"

/****************
 * ### `<ProjectMenu>`
 * Every project of `projectRoot` (default:  `editor.projectRoot`) as a `<ui-menu>` of links;
 * choosing one shows it in `<SpellEditor>`, or in Run with `useRunner`.
 * - SIDE EFFECT:  loads `projectRoot` if it isn't yet, showing "Loading..." until it is (or "Couldn't load"), in the page's language.
 * - Every other prop goes to the `<ui-menu>`, e.g. `vertical=""`, `fluid=""`.
 ****************/
export function ProjectMenu(props: ProjectMenuProps) {
  const root = trackProjectRoot(() => props.projectRoot)
  return (
    <ui-menu {...omit(props, "projectRoot", "useRunner", "class")} class={["ProjectMenu", props.class]}>
      <Show
        when={root().loaded}
        fallback={
          <ui-item>
            {root().failed ? appTexts.text("couldNotLoadGroup", root().words) : appTexts.text("loadingGroup")}
          </ui-item>
        }
      >
        <For each={root().projects} fallback={<ui-item>{appTexts.text("nothingInGroup", root().words)}</ui-item>}>
          {(project) => (
            // HACK: a slotted `<ui-icon>`, not `icon`:  see `<Action>`
            <ui-item appearance="link" value={project.path} onClick={() => openProject(project.path, props.useRunner)}>
              <ui-icon name={root().icon} />
              {project.name}
            </ui-item>
          )}
        </For>
      </Show>
    </ui-menu>
  )
}

/** Props for `<ProjectMenu>`:  these, plus any `<ui-menu>` attribute. */
export type ProjectMenuProps = UIMenuJSXAttributes & {
  /** Root whose projects to list.  Default:  `editor.projectRoot`. */
  projectRoot?: SPACES.SpellProjectRoot
  /** Open it in Run, not Edit. */
  useRunner?: boolean
}

/****************
 * ### `<ProjectDropdown>`
 * Every project of `projectRoot` (default:  `editor.projectRoot`) as a `<ui-dropdown>` showing `editor.project`;
 * choosing one shows it in `<SpellEditor>`, or in Run with `useRunner`.
 * Built as `<FileDropdown>` is.
 * - SIDE EFFECT:  loads `projectRoot` if it isn't yet;
 *   loading (spinning caret, no items) until it is and a project is selected.
 * - The dropdown's value is ALWAYS `editor.project`'s path (see `choose()`):
 *   choosing sets it back during the event, and shows the project chosen, which then becomes `editor.project`.
 * - Its trigger shows the project's group icon before its name (a book for a guide ...):  the `trigger` slot.
 *   So does each item.
 * - `showActions`:  the project's actions at its foot (Rename, Duplicate, Delete;  New), in place of a "..." menu.
 * - Sits in a menu:  wrapped in a `<ui-item class="ProjectDropdown">`.  Look:  `ProjectDropdown.css`.
 * - SEE:  its App UI components page, `app/docs/ProjectDropdown.html` (`/components/app/ProjectDropdown.html`).
 ****************/
export function ProjectDropdown(props: ProjectDropdownProps) {
  const root = trackProjectRoot(() => props.projectRoot)
  const selected = tracked(() => editor.project?.path ?? "")
  const ready = () => root().loaded && !!selected()
  const selectedName = () => root().projects.find((project) => project.path === selected())?.name

  return (
    <ui-item class="ProjectDropdown">
      <ui-dropdown
        class="ProjectDropdown"
        loading={!ready()}
        value={selected()}
        ref={on<{ value: string }>("ui-changed", choose)}
      >
        <span slot="trigger" class="ProjectDropdownTrigger">
          <ui-icon name={root().icon ?? PROJECT_ICON} />
          <span class="ProjectName">{selectedName()}</span>
        </span>
        <Show when={ready()}>
          <For each={root().projects}>
            {(project) => (
              <ui-item
                value={project.path}
                icon={root().icon}
                onClick={() => openProject(project.path, props.useRunner)}
              >
                {project.name}
              </ui-item>
            )}
          </For>
          <Show when={props.showActions && !isStaticBuild}>
            <ui-item kind="divider" />
            <Actions.PROJECT_DROPDOWN_ACTIONS />
            <ui-item kind="divider" />
            {/* New:  the group's icon with a pencil on its corner, as a rich item */}
            <ui-item value={NEW_PROJECT} onClick={() => void editor.createApp()}>
              <ui-icons>
                <ui-icon name={root().icon ?? PROJECT_ICON} />
                <ui-icon corner="" name="pencil" />
              </ui-icons>
              {appTexts.text("createApp", root().words)}
            </ui-item>
          </Show>
        </Show>
      </ui-dropdown>
    </ui-item>
  )
}

/** Props for `<ProjectDropdown>`. */
export type ProjectDropdownProps = {
  /** Root whose projects to list.  Default:  `editor.projectRoot`. */
  projectRoot?: SPACES.SpellProjectRoot
  /** Open it in Run, not Edit. */
  useRunner?: boolean
  /**
   * At its foot, the project's actions:  Rename, Duplicate, Delete, then New, each after a divider
   * (choosing one does it, as a file dropdown's do) -- never in the static build, which has none.
   */
  showActions?: boolean
}

/** The New item's value:  what `choose()` finds it by. */
const NEW_PROJECT = "new-project"

/** What `<ProjectMenu>` / `<ProjectDropdown>` / the landing page's cards show of a project root. */
export type ProjectRootState = {
  /** Has it loaded its list of projects? */
  loaded: boolean
  /** Did loading it fail?  Then it never loads:  see `trackProjectRoot()`. */
  failed: boolean
  /** Its projects, in order:  `path`, the name to show, and its description, if its project file has one. */
  projects: { path: string; name: string; description?: string }[]
  /** Its icon name. */
  icon?: string
  /** Its words, in the page's language:  its title (`Examples`), what its projects are called (`Example`) ... */
  words: GroupWords
}

/**
 * `root()` (default:  `editor.projectRoot`), read through `tracked()`:  Solid sees it load and change.
 * - SIDE EFFECT:  loads the root once it's known, if it isn't yet.
 *   A failure is a console warning and `failed`, e.g. a root whose folder doesn't exist (the server answers 500).
 * - A memo makes a new `tracked()` per root (disposing the last):  `tracked()`'s read can't follow Solid props.
 * - Call in a component body:  it's owned by the component.
 */
export function trackProjectRoot(root: () => SPACES.SpellProjectRoot | undefined): () => ProjectRootState {
  const editorRoot = tracked(() => editor.projectRoot)
  const current = createMemo(() => root() ?? editorRoot())
  const [failed, setFailed] = createSignal<SPACES.SpellProjectRoot>()
  createEffect(current, (projectRoot) => {
    if (!projectRoot || projectRoot.isLoaded) return
    projectRoot.load().catch((error: unknown) => {
      console.warn(`Couldn't load ${projectRoot.path}:`, error)
      setFailed(projectRoot)
    })
  })
  const state = createMemo(() => {
    const projectRoot = current()
    return tracked(() => readProjectRoot(projectRoot))
  })
  return () => ({ ...state()(), failed: !!failed() && failed() === current() })
}

/** What `<ProjectMenu>` / `<ProjectDropdown>` show of `projectRoot`, read now. */
function readProjectRoot(projectRoot: SPACES.SpellProjectRoot | undefined): Omit<ProjectRootState, "failed"> {
  const loaded = !!projectRoot?.isLoaded
  return {
    loaded,
    projects: loaded
      ? // each project's title:  its file's `"title"`, which the list gave, else made from its name (Q45)
        projectRoot!.projectPaths.map((path) => ({
          path,
          name: new SP.SpellProject(path).title,
          description: projectRoot!.contents?.find((entry) => entry.path === path)?.description
        }))
      : [],
    icon: projectRoot?.icon,
    words: appTexts.groupWords(projectRoot)
  }
}

/** Show the project at `path`, in the editor or the runner. */
export function openProject(path: string, useRunner?: boolean) {
  if (useRunner) void editor.showRunner(path)
  else editor.showEditor(path)
}

/**
 * The dropdown's `ui-changed`:  click the item chosen, which opens its project.
 * - SIDE EFFECT:  sets the dropdown's `value` back to `editor.project`'s DURING the event, so the dropdown keeps ours:
 *   the element decides (`requestChange()` on a `@controlled` member, in `spell/element/Reactive`).
 * - Opening the project then moves it on.
 */
function choose(event: CustomEvent<{ value: string }>) {
  const dropdown = event.currentTarget as HTMLElement & { value?: unknown }
  dropdown.value = editor.project?.path ?? ""
  // an action's item has no value:  found by its text, as a file dropdown's
  const item = [...dropdown.children].find(
    (child) =>
      child.localName === "ui-item" && (child.getAttribute("value") ?? child.textContent?.trim()) === event.detail.value
  )
  ;(item as HTMLElement | undefined)?.click()
}
