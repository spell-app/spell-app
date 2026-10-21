import { afterEach, describe, expect, test } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"

import { ElementFixture } from "spell-kit/test-helpers/ElementFixture"
import type { SP } from "@spell-app/spell"
import type { SPACES } from "$/spaces"
import { openProjectSettings } from "$/app/pages/ProjectSettings"

/**
 * `<ProjectSettings>` in the browser:  a property editor on a project's settings, saved through its group.
 * - The project and its group are stand-ins:  the group records what it was asked to save.
 */

/** A stand-in project:  what the dialog reads of one. */
function project(contents: Record<string, unknown>): SP.SpellProject {
  return { title: "Solitaire", projectId: "owen@spell/solitaire", contents } as unknown as SP.SpellProject
}

/** A stand-in group:  it records each save, and fails when told to. */
function root(failWith?: Error) {
  const saves: unknown[] = []
  const group = {
    saves,
    async saveSettings(_project: SP.SpellProject, settings: SPACES.ProjectSettings) {
      if (failWith) throw failWith
      saves.push(structuredClone(settings))
    }
  }
  return group as typeof group & SPACES.SpellProjectRoot
}

/** The open dialog, once its editor has drawn its properties. */
async function dialog(): Promise<HTMLElement> {
  await expect
    .poll(() => document.querySelector(".ProjectSettings ui-property-editor ui-property ui-input"))
    .not.toBeNull()
  const modal = document.querySelector<HTMLElement>(".ProjectSettings")!
  await ElementFixture.settle(modal)
  return modal
}

/** The `<input>` of the dialog's property `name`. */
function input(modal: Element, name: string): HTMLInputElement {
  return modal.querySelector(`ui-property[name=${name}] ui-input`)!.shadowRoot!.querySelector("input")!
}

/** The editor's Save or Cancel button, by its text. */
function button(modal: Element, text: string): HTMLElement {
  const footer = modal.querySelector("ui-property-editor")!.shadowRoot!.querySelector("[part~=footer]")!
  return [...footer.querySelectorAll<HTMLElement>("ui-button")].find((each) => each.textContent === text)!
}

afterEach(() => {
  for (const host of document.querySelectorAll(".ProjectSettingsRoot")) host.remove()
})

describe("<ProjectSettings>", () => {
  test("shows the project file's settings, and saves the edited ones on Save, then closes", async () => {
    const group = root()
    const errors: unknown[] = []
    const closed = openProjectSettings(
      project({ title: "Solitaire", listsStartAt: 0, targets: ["js/solid"] }),
      group,
      (error) => errors.push(error)
    )
    const modal = await dialog()
    expect(input(modal, "title").value).toBe("Solitaire")
    await userEvent.type(input(modal, "title"), "!")
    await userEvent.type(input(modal, "version"), "1.0.0")
    button(modal, "Save").click()
    await closed
    expect(errors).toEqual([])
    expect(group.saves).toEqual([{ title: "Solitaire!", version: "1.0.0", targets: [], listsStartAt: 0 }])
  })

  test("refuses a version that isn't `1.2.0`-shaped:  nothing saved, the dialog stays", async () => {
    const group = root()
    void openProjectSettings(project({}), group, () => {})
    const modal = await dialog()
    await userEvent.type(input(modal, "version"), "one")
    input(modal, "title").focus()
    button(modal, "Save").click()
    await ElementFixture.tick()
    expect(group.saves).toEqual([])
    expect(modal.isConnected).toBe(true)
  })

  test("Cancel closes it, nothing saved", async () => {
    const group = root()
    const closed = openProjectSettings(project({ title: "Solitaire" }), group, () => {})
    const modal = await dialog()
    await userEvent.type(input(modal, "title"), "!")
    button(modal, "Cancel").click()
    await closed
    expect(group.saves).toEqual([])
  })

  test("a server error shows, and the dialog stays", async () => {
    const errors: unknown[] = []
    void openProjectSettings(project({ title: "A" }), root(new Error("disk full")), (error) => errors.push(error))
    const modal = await dialog()
    await userEvent.type(input(modal, "title"), "!")
    button(modal, "Save").click()
    await expect.poll(() => errors.length).toBe(1)
    expect(modal.isConnected).toBe(true)
  })
})
