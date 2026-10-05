import { afterEach, beforeAll, describe, expect, it, vi } from "vite-plus/test"
import { commands } from "vite-plus/test/browser"
import { createEffect, flush, resetErrorHalt } from "solid-js"
import type { JSX } from "@solidjs/web"

import type { ComponentVocabulary } from "$/ui/vocabulary"
import { ElementFixture } from "$/ui/test/ElementFixture"
import { UIElement, type UIElementClass, type UIHost } from "$/ui/elements"

import "$/ui/components/ui-label"

/** Test-only element that throws on demand:  `boom` in render, `crash` in the constructor, `burst` in an effect. */
class Bomb extends UIElement<typeof BOMB> {
  constructor(...args: ConstructorParameters<typeof UIElement>) {
    super(...args)
    if (this.attrs.crash) throw new Error("crash in the constructor")
    createEffect(
      () => this.attrs.burst,
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
    if (this.attrs.boom) throw new Error("boom in render")
    return "ok"
  }
}

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
  ;(Bomb as unknown as UIElementClass & typeof UIElement).define("x-bomb")
})

/**
 * Define `tag` for `Element` with the fork's error boundary OFF:  `isolateErrors` is read at `define()`.
 * - Restores the switch afterwards.
 */
function defineBare(Element: UIElementClass & typeof UIElement, tag: string) {
  UIElement.isolateErrors = false
  try {
    Element.define(tag)
  } finally {
    UIElement.isolateErrors = true
  }
}

afterEach(() => {
  resetErrorHalt()
})

/** A `<ui-label>` sibling:  does it still update after the bomb went off? */
async function siblingStillUpdates(sibling: UIHost) {
  sibling.setAttribute("color", "red")
  await ElementFixture.tick()
  return sibling.shadowRoot!.querySelector("[part~=label]")!.className
}

describe("per-element error boundary", () => {
  it("disables ONLY the element whose render throws;  its sibling keeps updating", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bomb></x-bomb><ui-label>Sibling</ui-label></div>`)
    const bomb = root.querySelector<UIHost>("x-bomb")!
    const sibling = root.querySelector<UIHost>("ui-label")!
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
    const later = await ElementFixture.render<UIHost>(`<ui-label color="blue">Later</ui-label>`)
    expect(later.shadowRoot!.querySelector("[part~=label]")!.className).toBe("ui blue label")
    error.mockRestore()
  })

  it("contains a throw in the constructor", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bomb crash></x-bomb><ui-label>Sibling</ui-label></div>`)
    expect(root.querySelector("x-bomb")!.matches(":state(errored)")).toBe(true)
    expect(await siblingStillUpdates(root.querySelector<UIHost>("ui-label")!)).toBe("ui red label")
    error.mockRestore()
  })

  it("contains a throw in an effect", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bomb></x-bomb><ui-label>Sibling</ui-label></div>`)
    const bomb = root.querySelector<UIHost>("x-bomb")!
    bomb.setAttribute("burst", "")
    await ElementFixture.tick()
    await ElementFixture.tick()
    expect(bomb.matches(":state(errored)")).toBe(true)
    expect(await siblingStillUpdates(root.querySelector<UIHost>("ui-label")!)).toBe("ui red label")
    error.mockRestore()
  })
})

describe("error boundary cost", () => {
  it("measures render time of 300 labels with and without boundaries", { timeout: 60_000 }, async () => {
    const { UILabel } = await import("$/ui/components/ui-label")
    defineBare(UILabel as unknown as UIElementClass & typeof UIElement, "bare-label")
    const html = (tag: string) => `<div>${`<${tag} color='red' icon='check'>x</${tag}>`.repeat(300)}</div>`
    const times: Record<string, number[]> = { isolated: [], bare: [] }
    for (let run = 0; run < 6; run++) {
      for (const mode of ["isolated", "bare"] as const) {
        const start = performance.now()
        const root = await ElementFixture.render(html(mode === "isolated" ? "ui-label" : "bare-label"))
        times[mode]!.push(performance.now() - start)
        root.remove()
      }
    }
    const median = (values: number[]) => [...values].sort((a, b) => a - b)[Math.floor(values.length / 2)]!
    const result = { isolatedMs: median(times.isolated!.slice(1)), bareMs: median(times.bare!.slice(1)), times }
    await commands.writeFile(".cache/error-boundary.json", JSON.stringify(result, null, 2))
    expect(result.isolatedMs).toBeGreaterThan(0)
  })
})

// LAST:  a halt poisons Solid's scheduler for the rest of the file (`resetErrorHalt()` only re-arms it)
describe("without the boundary", () => {
  it("the same throw halts EVERY element (the failure mode it prevents)", async () => {
    // a fresh tag defined with the fork's `errorBoundary: false`
    defineBare(Bomb as unknown as UIElementClass & typeof UIElement, "x-bare-bomb")
    const error = vi.spyOn(console, "error").mockImplementation(() => {})
    const report = vi.spyOn(globalThis, "reportError").mockImplementation(() => {})
    const root = await ElementFixture.render(`<div><x-bare-bomb></x-bare-bomb><ui-label>Sibling</ui-label></div>`)
    const bomb = root.querySelector<UIHost>("x-bare-bomb")!
    bomb.setAttribute("boom", "")
    // drain the queue HERE, so the escaping error lands in this `try` instead of an unhandled microtask
    try {
      flush()
    } catch (thrown) {
      expect(String(thrown)).toContain("boom in render")
    }
    expect(error.mock.calls.some(([message]) => String(message).includes("REACTIVITY_HALTED"))).toBe(true)
    expect(await siblingStillUpdates(root.querySelector<UIHost>("ui-label")!)).toBe("ui label")
    report.mockRestore()
    error.mockRestore()
  })
})
