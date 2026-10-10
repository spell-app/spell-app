import { For, Show, createEffect, createMemo, createSignal, omit } from "solid-js"

import { SP } from "$/spell"
import { editor } from "$/app/editor"
import { DropdownLabel, PROJECT_ICON, on, tracked, type UIElementAttributes } from "$/app/solid"

import "./ProjectDropdown.css"

/****************
 * ### `<ProjectMenu>`
 * Every project of `projectRoot` (default:  `editor.projectRoot`) as a `<ui-menu>` of links;
 * choosing one shows it in `<SpellEditor>`, or `<SpellRunner>` with `useRunner`.
 * - SIDE EFFECT:  loads `projectRoot` if it isn't yet, showing "Loading..." until it is (or "Couldn't load").
 * - Every other prop goes to the `<ui-menu>`, e.g. `vertical=""`, `fluid=""`.
 ****************/
export function ProjectMenu(props: ProjectMenuProps) {
  const root = trackProjectRoot(() => props.projectRoot)
  return (
    <ui-menu {...omit(props, "projectRoot", "useRunner", "class")} class={["ProjectMenu", props.class]}>
      <Show
        when={root().loaded}
        fallback={<ui-item>{root().failed ? `Couldn't load ${root().title}` : "Loading..."}</ui-item>}
      >
        <For each={root().projects} fallback={<ui-item>{`No ${root().title} yet!`}</ui-item>}>
          {(project) => (
            // HACK: a slotted `<ui-icon>`, not `icon`:  see `<Action>`
            <ui-item link="" value={project.path} onClick={() => open(project.path, props.useRunner)}>
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
export type ProjectMenuProps = UIElementAttributes & {
  /** Root whose projects to list.  Default:  `editor.projectRoot`. */
  projectRoot?: SP.SpellProjectRoot
  /** Open `<SpellRunner>` instead of `<SpellEditor>`. */
  useRunner?: boolean
}

/****************
 * ### `<ProjectDropdown>`
 * Every project of `projectRoot` (default:  `editor.projectRoot`) as a `<ui-dropdown>` showing `editor.project`;
 * choosing one shows it in `<SpellEditor>`, or `<SpellRunner>` with `useRunner`.
 * Built as `<FileDropdown>` is.
 * - SIDE EFFECT:  loads `projectRoot` if it isn't yet;
 *   loading (spinning caret, no items) until it is and a project is selected.
 * - The dropdown's value is ALWAYS `editor.project`'s path (see `choose()`):
 *   choosing sets it back during the event, and shows the project chosen, which then becomes `editor.project`.
 * - `showLabel` (default `true`):  a `<DropdownLabel>` first, e.g. "Example:".
 * - Sits in a menu:  wrapped in a `<ui-item class="ProjectDropdown">`.  Look:  `ProjectDropdown.css`.
 ****************/
export function ProjectDropdown(props: ProjectDropdownProps) {
  const root = trackProjectRoot(() => props.projectRoot)
  const selected = tracked(() => editor.project?.path ?? "")
  const ready = () => root().loaded && !!selected()

  return (
    <>
      <Show when={props.showLabel ?? true}>
        {/* HACK: a slotted `<ui-icon>`, not `icon`:  see `<Action>` */}
        <DropdownLabel>
          <ui-icon name={PROJECT_ICON} />
          {`${root().Type || "Project"}:`}
        </DropdownLabel>
      </Show>
      <ui-item class="ProjectDropdown">
        <ui-dropdown
          class="ProjectDropdown"
          loading={!ready()}
          prop:value={selected()}
          ref={on<{ value: string }>("ui-change", choose)}
        >
          <Show when={ready()}>
            <For each={root().projects}>
              {(project) => (
                <ui-item value={project.path} icon={root().icon} onClick={() => open(project.path, props.useRunner)}>
                  {project.name}
                </ui-item>
              )}
            </For>
          </Show>
        </ui-dropdown>
      </ui-item>
    </>
  )
}

/** Props for `<ProjectDropdown>`. */
export type ProjectDropdownProps = {
  /** Root whose projects to list.  Default:  `editor.projectRoot`. */
  projectRoot?: SP.SpellProjectRoot
  /** Open `<SpellRunner>` instead of `<SpellEditor>`. */
  useRunner?: boolean
  /** Put a `<DropdownLabel>` before the dropdown.  Default:  `true`. */
  showLabel?: boolean
}

/** What `<ProjectMenu>` / `<ProjectDropdown>` show of a project root. */
type ProjectRootState = {
  /** Has it loaded its list of projects? */
  loaded: boolean
  /** Did loading it fail?  Then it never loads:  see `trackProjectRoot()`. */
  failed: boolean
  /** Its projects, in order:  `path` and the name to show. */
  projects: { path: string; name: string }[]
  /** Its icon name. */
  icon?: string
  /** Its title, e.g. "Examples". */
  title?: string
  /** What its projects are called, e.g. "Example". */
  Type?: string
}

/**
 * `root()` (default:  `editor.projectRoot`), read through `tracked()`:  Solid sees it load and change.
 * - SIDE EFFECT:  loads the root once it's known, if it isn't yet.
 *   A failure is a console warning and `failed`, e.g. a root whose folder doesn't exist (the server answers 500).
 * - A memo makes a new `tracked()` per root (disposing the last):  `tracked()`'s read can't follow Solid props.
 * - Call in a component body:  it's owned by the component.
 */
function trackProjectRoot(root: () => SP.SpellProjectRoot | undefined): () => ProjectRootState {
  const editorRoot = tracked(() => editor.projectRoot)
  const current = createMemo(() => root() ?? editorRoot())
  const [failed, setFailed] = createSignal<SP.SpellProjectRoot>()
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
function readProjectRoot(projectRoot: SP.SpellProjectRoot | undefined): Omit<ProjectRootState, "failed"> {
  const loaded = !!projectRoot?.isLoaded
  return {
    loaded,
    projects: loaded
      ? projectRoot!.projectPaths.map((path) => ({ path, name: new SP.SpellLocation(path).projectName ?? path }))
      : [],
    icon: projectRoot?.icon,
    title: projectRoot?.title,
    Type: projectRoot?.Type
  }
}

/** Show the project at `path`, in the editor or the runner. */
function open(path: string, useRunner?: boolean) {
  if (useRunner) void editor.showRunner(path)
  else editor.showEditor(path)
}

/**
 * The dropdown's `ui-change`:  click the item chosen, which opens its project.
 * - SIDE EFFECT:  sets the dropdown's `value` back to `editor.project`'s DURING the event, so the dropdown keeps ours:
 *   the host decides (`requestChange()` on a `@controlled` member, `packages/ui/src/elements/Reactive.ts`).
 * - Opening the project then moves it on.
 */
function choose(event: CustomEvent<{ value: string }>) {
  const dropdown = event.currentTarget as HTMLElement & { value?: unknown }
  dropdown.value = editor.project?.path ?? ""
  const item = [...dropdown.children].find(
    (child) => child.localName === "ui-item" && child.getAttribute("value") === event.detail.value
  )
  ;(item as HTMLElement | undefined)?.click()
}
