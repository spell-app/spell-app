import { afterEach, describe, expect, test, vi } from "vite-plus/test"

import type { SPACES } from "spell-app/spaces"
import { ElementFixture } from "spell/test-helpers/ElementFixture"
import { openYouPanel } from "spell-app/app/solid/modals"

/**
 * The "You" panel (epic `people-and-orgs` P9), in the browser:
 * - the server's answers stood in for (`fetch`)
 * - the fields read from the person
 * - Save sending what they say
 */

/** A `<ui-modal>` host, as the tests poke it. */
type Modal = HTMLElement & { visible: boolean }

/** `GET /api/people/me`'s answer, as the server gives it. */
const ME: SPACES.MeAnswer = {
  person: {
    id: "owen",
    address: "owen@spell",
    names: "Owen Williams",
    nickname: "O",
    emails: ["owen@example.com"],
    dates: [{ label: "birthday", day: "1970-01-01" }]
  },
  orgs: [{ id: "spell", name: "Spell", role: "spell-admin" }],
  problems: [{ file: "@spell/owen@/__me.json5", property: "names", message: "names is text, not a number" }]
}

/** Each request the panel made:  its method, and its body read. */
let requests: { method: string; body?: unknown }[] = []

/** The panel's route. */
const ME_URL = "/api/people/me"

/**
 * `fetch`, answering `ME` (with a POST's changes in it) at `ME_URL`.
 * - Any other request (Spell UI loading its parts, in a busy full run) goes to the real `fetch`, unrecorded.
 */
function standIn() {
  requests = []
  const realFetch = globalThis.fetch
  vi.stubGlobal("fetch", async (url: string | URL | Request, init: RequestInit = {}) => {
    const address = typeof url === "string" ? url : url instanceof URL ? url.href : url.url
    if (!address.endsWith(ME_URL)) return realFetch(url, init)
    const body = init.body ? JSON.parse(init.body as string) : undefined
    requests.push({ method: init.method ?? "GET", body })
    return new Response(JSON.stringify({ ...ME, person: { ...ME.person, ...body } }))
  })
}

afterEach(() => {
  vi.unstubAllGlobals()
  for (const modal of document.querySelectorAll<Modal>("ui-modal")) modal.remove()
  for (const root of document.querySelectorAll(".YouPanelRoot")) root.remove()
})

describe("the You panel", () => {
  test("shows the person, their orgs and their file's problems", async () => {
    standIn()
    const answer = openYouPanel()
    const modal = await current()
    expect(modal.getAttribute("header")).toBe("You:  owen@spell")
    expect(value(modal, "#YouPanel-names")).toBe("Owen Williams")
    expect(value(modal, "#YouPanel-emails")).toBe("owen@example.com")
    expect(value(modal, ".date .label")).toBe("birthday")
    expect(value(modal, ".date .day")).toBe("1970-01-01")
    expect(modal.querySelector("ui-list")!.textContent).toContain("Spell · spell-admin")
    expect(modal.querySelector("ui-message")!.textContent).toContain("names is text, not a number")
    modal.querySelector<HTMLElement>(".cancel")!.click()
    expect(await answer).toEqual(ME)
    expect(requests.map((request) => request.method)).toEqual(["GET"])
  })

  test("Save sends what the fields say:  a date added, an empty email line left out", async () => {
    standIn()
    const answer = openYouPanel()
    const modal = await current()
    set(modal, "#YouPanel-nickname", "Owen")
    set(modal, "#YouPanel-emails", "owen@example.com\n\nowen@spell.app")
    modal.querySelector<HTMLElement>("ui-button[icon='plus']")!.click()
    await expect.poll(() => modal.querySelectorAll(".date").length).toBe(2)
    const [, label] = modal.querySelectorAll<HTMLElement & { value: string }>(".date .label")
    const [, day] = modal.querySelectorAll<HTMLElement & { value: string }>(".date .day")
    label!.value = "met"
    day!.value = "2020-02-02"
    modal.querySelector<HTMLElement>(".approve")!.click()
    const saved = await answer
    expect(requests.at(-1)).toEqual({
      method: "POST",
      body: {
        names: "Owen Williams",
        nickname: "Owen",
        emails: ["owen@example.com", "owen@spell.app"],
        dates: [
          { label: "birthday", day: "1970-01-01" },
          { label: "met", day: "2020-02-02" }
        ]
      }
    })
    expect(saved.person.nickname).toBe("Owen")
  })
})

////////////////
// ## Helpers
////////////////

/** The shown panel, once it's `visible` and its elements have rendered. */
async function current(): Promise<Modal> {
  await expect.poll(() => document.querySelector<Modal>("ui-modal.YouPanel")?.visible, { timeout: 5000 }).toBe(true)
  const modal = document.querySelector<Modal>("ui-modal.YouPanel")!
  await ElementFixture.settle(modal)
  return modal
}

/** The `value` of `modal`'s first `selector` field. */
function value(modal: Modal, selector: string): string {
  return modal.querySelector<HTMLElement & { value: string }>(selector)!.value
}

/** Set `modal`'s first `selector` field's `value`, as typing would. */
function set(modal: Modal, selector: string, text: string) {
  modal.querySelector<HTMLElement & { value: string }>(selector)!.value = text
}
