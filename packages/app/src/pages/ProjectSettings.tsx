import { render } from "@solidjs/web"

import { UI as SpellUI } from "$/ui"
import type { V } from "$/ui/api"
import { SP } from "$/spell"
import { SPACES } from "$/spaces"
import { uiReady } from "$/app/solid/loadUI"

/****************
 * ### `<ProjectSettings>`
 * A project's settings, in a dialog:  a `<ui-property-editor>` on `PROJECT_SETTINGS_SCHEMA`
 * (epic `property-editor` P5, its first real use).
 * - What it edits:  the project file's `title`, `version`, `targets` and `listsStartAt`,
 *   a copy of what the project's index says (`settingsOf()`).
 * - `apply="on save"`:  the editor holds every edit until Save, which validates first.
 *   - Save:  the project root writes them into the project file (`SPACES.SpellProjectRoot.saveSettings()`),
 *     and the dialog closes.  A server error shows, and the dialog stays.
 *   - Cancel, or Escape:  the dialog closes, nothing written.
 * - Show it with `openProjectSettings()`, which mounts it and cleans up:  `editor.showProjectSettings()` does.
 ****************/
export function ProjectSettings(props: ProjectSettingsProps) {
  let modal: HTMLElement | undefined
  const settings = settingsOf(props.project)
  return (
    <ui-modal
      class="ProjectSettings"
      size="small"
      closedby="closerequest"
      label={`${props.project.title} settings`}
      visible=""
      ref={(element: HTMLElement) => {
        modal = element
        modal.addEventListener("ui-hide", () => props.onDone(), { once: true })
      }}
    >
      <ui-content>
        <ui-property-editor
          apply="on save"
          prop:schema={PROJECT_SETTINGS_SCHEMA}
          prop:value={settings}
          ref={(editor: HTMLElement) => {
            editor.addEventListener("ui-saved", () => void save())
            editor.addEventListener("ui-cancelled", () => hide())
          }}
        >
          <ui-property name="title" hint="Its folder's name, as words, when left empty."></ui-property>
          <ui-property name="version" apply="on leave"></ui-property>
          <ui-property name="targets" as={CHOICES}></ui-property>
          <ui-property name="listsStartAt" as="buttons"></ui-property>
        </ui-property-editor>
      </ui-content>
    </ui-modal>
  )

  /** Save:  write the settings into the project file, then close;  a server error shows, and the dialog stays. */
  async function save() {
    try {
      await props.root.saveSettings(props.project, settings)
      hide()
    } catch (error) {
      props.onError(error)
    }
  }

  /** Close the dialog (its shared `visible`):  `ui-hide` then calls `onDone()`. */
  function hide() {
    if (modal) (modal as HTMLElement & { visible: boolean }).visible = false
  }
}

/** Props for `<ProjectSettings>`. */
export type ProjectSettingsProps = {
  /** The project whose settings it edits. */
  project: SP.SpellProject
  /** Its group, which saves them. */
  root: SPACES.SpellProjectRoot
  /** Called once the dialog has closed. */
  onDone: () => void
  /** Called with a server error saving them. */
  onError: (error: unknown) => void
}

/**
 * Show a `<ProjectSettings>` for `project` in `root`;  resolves once it has closed.
 * - SIDE EFFECT:  a `<div class="ProjectSettingsRoot">` in `<body>` holding the dialog, until it has closed.
 * - Waits for `uiReady`:  `<ui-modal>` and the editor must be defined before it opens.
 */
export async function openProjectSettings(
  project: SP.SpellProject,
  root: SPACES.SpellProjectRoot,
  onError: (error: unknown) => void
): Promise<void> {
  await uiReady
  SpellUI.propertyControls.add(CHOICES, {
    tag: "ui-dropdown",
    attributes: { multiple: "", selection: "" },
    choices: "items"
  })
  const host = document.createElement("div")
  host.className = "ProjectSettingsRoot"
  document.body.append(host)
  return new Promise((resolve) => {
    const dispose = render(
      () => <ProjectSettings project={project} root={root} onDone={finish} onError={onError} />,
      host
    )

    /** Unmount, then resolve. */
    function finish() {
      dispose()
      host.remove()
      resolve()
    }
  })
}

/** What `<ProjectSettings>` edits:  a copy of the project file's settings, as its index says them. */
function settingsOf(project: SP.SpellProject): SPACES.ProjectSettings {
  const contents = project.contents
  return {
    title: contents?.title ?? "",
    version: contents?.version ?? "",
    targets: (contents?.targets ?? []).filter((name) => name !== SP.RUNNING_TARGET),
    listsStartAt: contents?.listsStartAt ?? 1
  }
}

/** The control kind for picking several choices:  a multiple-selection dropdown. */
const CHOICES = "choices"

/**
 * A project's settings, as `<ui-property-editor>` reads them.
 * - Its targets:  every one spell has but `js/solid`, which it always compiles to.
 */
const PROJECT_SETTINGS_SCHEMA: V.PropertySchema = {
  name: "ProjectSettings",
  attributes: [
    {
      name: "title",
      kind: "string",
      type: "text",
      description: "",
      tip: "The project's name for people, in the project list and the editor's title bar."
    },
    {
      name: "version",
      kind: "string",
      type: "text",
      description: "",
      pattern: "^(\\d+\\.\\d+\\.\\d+)?$",
      tip: "Its version, as `1.2.0`:  stamped on what it declares, for projects that import it."
    },
    {
      name: "targets",
      kind: "json",
      type: "list",
      of: "choice",
      values: Object.keys(SP.TARGETS).filter((name) => name !== SP.RUNNING_TARGET),
      description: "",
      label: "Also compiles to",
      tip: "Languages it compiles to as well as JavaScript, which it always does."
    },
    {
      name: "listsStartAt",
      kind: "enum",
      type: "choice",
      values: ["1", "0"],
      description: "",
      label: "Lists start at",
      tip: "Where its lists start counting:  1 as spell does, or 0 as JavaScript and Python do."
    }
  ]
}
