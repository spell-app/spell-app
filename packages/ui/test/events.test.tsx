import { afterEach, beforeEach, describe, expect, it } from "vite-plus/test"
import { userEvent } from "vite-plus/test/browser"
import { render } from "@solidjs/web"

import { UI } from "$/ui/runtime"
import { ElementFixture } from "$/ui/test/ElementFixture"

import "$/ui/components/ui-button"
import "$/ui/components/ui-dropdown"
import "$/ui/components/ui-input"
import "$/ui/components/ui-label"

/**
 * Page listeners on `ui-*` elements see the platform's retargeted event:  `target` === the host,
 * `composedPath()[0]` the inner node.  Solid's delegation used to leave the inner node on the event
 * (`@spell-app/solid-element` `events.ts`).
 */

/** What a page listener saw. */
type Seen = { type: string; target: boolean; currentTarget: string; path0: string }

/** Listen for `types` on `host` and on the document;  returns what each listener saw. */
function listen(host: HTMLElement, types: string[]) {
  const seen: Seen[] = []
  const record = (event: Event) =>
    seen.push({
      type: event.type,
      target: event.target === host,
      currentTarget: event.currentTarget === host ? "host" : (event.currentTarget as Node).nodeName,
      path0: (event.composedPath()[0] as Element).localName
    })
  for (const type of types) {
    host.addEventListener(type, record)
    document.addEventListener(type, record)
  }
  cleanups.push(() => types.forEach((type) => document.removeEventListener(type, record)))
  return seen
}

/** Undo `listen()` / `solidApp()` after each test. */
const cleanups: (() => void)[] = []

/** A Solid app elsewhere on the page, with its own delegated handlers. */
function solidApp() {
  const container = document.createElement("div")
  document.body.append(container)
  const dispose = render(() => <button onClick={() => {}}>app</button>, container)
  cleanups.push(() => {
    dispose()
    container.remove()
  })
}

beforeEach(async () => {
  await UI.load()
  UI.overlays.useCloseWatcher = false
})

afterEach(() => cleanups.splice(0).forEach((cleanup) => cleanup()))

describe.each([
  ["without other Solid code", false],
  ["with a Solid app on the page", true]
])("<ui-*> events, page listeners %s", (_, withApp) => {
  beforeEach(() => {
    if (withApp) solidApp()
  })

  it("<ui-input>:  input, keydown, focusin, click see the host", async () => {
    const host = await ElementFixture.render<HTMLElement>(`<ui-input placeholder="Name"></ui-input>`)
    const seen = listen(host, ["input", "keydown", "focusin", "click"])
    const control = host.shadowRoot!.querySelector("input")!
    await userEvent.click(control)
    await userEvent.keyboard("a")
    expect(seen.map((entry) => entry.type)).toEqual([
      "focusin",
      "focusin",
      "click",
      "click",
      "keydown",
      "keydown",
      "input",
      "input"
    ])
    for (const entry of seen) expect(entry).toMatchObject({ target: true, path0: "input" })
    expect(seen.map((entry) => entry.currentTarget)).toEqual([
      "host",
      "#document",
      "host",
      "#document",
      "host",
      "#document",
      "host",
      "#document"
    ])
    expect((host as HTMLElement & { value: string }).value).toBe("a")
  })

  it("<ui-button>:  click, keydown, focusin see the host", async () => {
    const host = await ElementFixture.render<HTMLElement>(`<ui-button>Save</ui-button>`)
    const seen = listen(host, ["click", "keydown", "focusin"])
    const button = host.shadowRoot!.querySelector("button")!
    await userEvent.click(button, { position: { x: 2, y: 2 } })
    // Safari doesn't focus a button on click (and clears focus):  focus it, so the focusin and the Enter happen there
    button.focus()
    await userEvent.keyboard("{Enter}")
    expect(seen.map((entry) => entry.type)).toEqual(expect.arrayContaining(["focusin", "click", "keydown"]))
    for (const entry of seen) expect(entry).toMatchObject({ target: true, path0: "button" })
    expect(seen.filter((entry) => entry.currentTarget === "#document")).toHaveLength(seen.length / 2)
  })

  it("<ui-dropdown>:  click, keydown, focusin see the host;  it still opens and selects", async () => {
    const host = await ElementFixture.render<HTMLElement & { value: unknown }>(
      `<ui-dropdown selection placeholder="Fruit"><ui-item value="a">Apple</ui-item><ui-item value="b">Banana</ui-item></ui-dropdown>`
    )
    const seen = listen(host, ["click", "keydown", "focusin"])
    const combobox = host.shadowRoot!.querySelector<HTMLElement>("[role=combobox]")!
    await userEvent.click(combobox)
    await ElementFixture.tick()
    await userEvent.keyboard("{ArrowDown}{Enter}")
    await ElementFixture.tick()
    expect(host.value).toBe("b")
    expect(seen.map((entry) => entry.type)).toEqual(expect.arrayContaining(["focusin", "click", "keydown"]))
    for (const entry of seen) expect(entry).toMatchObject({ target: true, path0: combobox.localName })
  })
})

describe("<ui-dropdown> events from nested elements", () => {
  it("<ui-dropdown>:  a click inside a rich item's nested element selects the option", async () => {
    const host = await ElementFixture.render<HTMLElement & { value: unknown }>(
      `<ui-dropdown selection placeholder="Fruit">
        <ui-item value="a"><ui-label>Apple</ui-label></ui-item><ui-item value="b"><ui-label>Banana</ui-label></ui-item>
      </ui-dropdown>`
    )
    const combobox = host.shadowRoot!.querySelector<HTMLElement>("[role=combobox]")!
    await userEvent.click(combobox)
    await ElementFixture.tick()
    const label = host.querySelectorAll("ui-label")[1]
    const inner = label.shadowRoot!.firstElementChild as HTMLElement
    inner.click()
    await ElementFixture.tick()
    expect(host.value).toBe("b")
  })
})
