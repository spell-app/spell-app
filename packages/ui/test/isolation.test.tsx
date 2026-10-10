import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"

import { createEffect, resetErrorHalt } from "solid-js"
import type { JSX } from "@solidjs/web"

import type { ComponentVocabulary } from "$/ui/vocabulary"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UIComponent, type AttributeValues, type UIComponentClass, type DOMElement } from "$/ui/elements"

import "$/ui/components/ui-label"
import "$/ui/components/ui-segment"

/** Test-only element that throws on demand:  `boom` in render, `crash` in the constructor, `burst` in an effect. */
class Bomb extends UIComponent<typeof BOMB> {
  constructor(...args: ConstructorParameters<typeof UIComponent>) {
    super(...args)
    if (this.crash) throw new Error("crash in the constructor")
    createEffect(
      () => this.burst,
      (burst) => {
        if (burst) throw new Error("burst in an effect")
      }
    )
  }

  render(): JSX.Element {
    return <span part="bomb">{this.text_()}</span>
  }

  /** Text, or a throw while `boom`. */
  private text_(): string {
    if (this.boom) throw new Error("boom in render")
    return "ok"
  }
}

// the vocabulary's getters (`this.boom` ...), for TypeScript
interface Bomb extends AttributeValues<typeof BOMB> {}

/** Vocabulary of `<x-bomb>`. */
const BOMB = {
  tag: "x-bomb",
  noun: "bomb",
  attributes: [
    { name: "boom", kind: "boolean", description: "Throw while rendering." },
    { name: "crash", kind: "boolean", description: "Throw while constructing." },
    { name: "burst", kind: "boolean", description: "Throw in an effect." }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary

beforeAll(() => {
  Object.defineProperty(Bomb.prototype, "vocabulary", { value: BOMB })
  ;(Bomb as unknown as UIComponentClass & typeof UIComponent).define("x-bomb")
})

afterEach(() => {
  resetErrorHalt()
})

/** A `<ui-label>` sibling:  does it still update after the bomb went off? */
async function siblingStillUpdates(sibling: DOMElement) {
  sibling.setAttribute("color", "red")
  await ElementFixture.tick()
  return sibling.shadowRoot!.querySelector("[part~=label]")!.className
}

////////////////
// ## UIComponent.define() error boundary
////////////////

describe("UIComponent.define() error boundary", () => {
  it("disables ONLY the element whose render throws;  its sibling keeps updating", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bomb></x-bomb><ui-label>Sibling</ui-label></div>`)
    const bomb = root.querySelector<DOMElement>("x-bomb")!
    const sibling = root.querySelector<DOMElement>("ui-label")!
    const events: CustomEvent[] = []
    root.addEventListener("ui-error", (event) => events.push(event as CustomEvent))
    expect(bomb.shadowRoot!.textContent).toBe("ok")
    bomb.setAttribute("boom", "")
    await ElementFixture.tick()
    expect(bomb.matches(":state(errored)")).toBe(true)
    expect(bomb.shadowRoot!.querySelector("[part=bomb]")).toBeNull()
    // no native fallback for a test element:  a bare `<slot>`, so its children would still show
    expect(bomb.shadowRoot!.firstElementChild?.localName).toBe("slot")
    expect(error).toHaveBeenCalledTimes(1)
    expect(error).toHaveBeenCalledWith("<x-bomb> failed:", expect.any(Error))
    expect(events).toHaveLength(1)
    expect(events[0]!.cancelable && events[0]!.composed && events[0]!.bubbles).toBe(true)
    expect((events[0]!.detail as { error: Error }).error.message).toBe("boom in render")
    expect(await siblingStillUpdates(sibling)).toBe("ui red label")
    // and new elements still render
    const later = await ElementFixture.render<DOMElement>(`<ui-label color="blue">Later</ui-label>`)
    expect(later.shadowRoot!.querySelector("[part~=label]")!.className).toBe("ui blue label")
    error.mockRestore()
  })

  it("contains a throw in the constructor", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bomb crash></x-bomb><ui-label>Sibling</ui-label></div>`)
    expect(root.querySelector("x-bomb")!.matches(":state(errored)")).toBe(true)
    expect(await siblingStillUpdates(root.querySelector<DOMElement>("ui-label")!)).toBe("ui red label")
    error.mockRestore()
  })

  it("contains a throw in an effect", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bomb></x-bomb><ui-label>Sibling</ui-label></div>`)
    const bomb = root.querySelector<DOMElement>("x-bomb")!
    bomb.setAttribute("burst", "")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(bomb.matches(":state(errored)")).toBe(true)
    expect(await siblingStillUpdates(root.querySelector<DOMElement>("ui-label")!)).toBe("ui red label")
    error.mockRestore()
  })

  // Owen asked (epic `spell-element`, P2):  does a container's net catch it instead?  No:  each element draws in a
  // Solid root with no parent, so only its OWN net can, and the container goes on as if nothing happened
  it("catches the throw in the element's own net, never its container's", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<ui-segment><x-bomb></x-bomb><ui-label>Sibling</ui-label></ui-segment>`)
    const bomb = root.querySelector<DOMElement>("x-bomb")!
    bomb.setAttribute("boom", "")
    await ElementFixture.tick()
    expect(bomb.matches(":state(errored)")).toBe(true)
    expect(root.matches(":state(errored)")).toBe(false)
    expect(root.shadowRoot!.querySelector("slot")).not.toBeNull()
    expect(await siblingStillUpdates(root.querySelector<DOMElement>("ui-label")!)).toBe("ui red label")
    error.mockRestore()
  })

  it("a broken FIRST render still resolves `ready`, and drops the broken component", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    // `ElementFixture.render()` awaits every element's `ready`:  it would time out if a failure never resolved it
    const bomb = await ElementFixture.render<DOMElement>(`<x-bomb boom></x-bomb>`)
    expect({ errored: bomb.matches(":state(errored)"), component: bomb.component }).toEqual({
      errored: true,
      component: undefined
    })
    error.mockRestore()
  })

  it("an app that cancels `ui-error` gets NO fallback;  the element is still marked and logged", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bomb></x-bomb></div>`)
    root.addEventListener("ui-error", (event) => event.preventDefault())
    const bomb = root.querySelector<DOMElement>("x-bomb")!
    bomb.setAttribute("boom", "")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect({
      errored: bomb.matches(":state(errored)"),
      logged: error.mock.calls.length,
      content: bomb.shadowRoot!.childNodes.length
    }).toEqual({ errored: true, logged: 1, content: 0 })
    error.mockRestore()
  })
})
