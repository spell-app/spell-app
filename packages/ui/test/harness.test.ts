import { describe, expect, it } from "vite-plus/test"

import { A11y, expectAccessible } from "./A11y"
import { Fixture } from "./Fixture"

/**
 * Smoke test for the harness itself:  browser mode, custom elements with shadow roots, `Fixture`, axe.
 */

/** Trivial shadow-DOM element with semantic shadow markup, as real components will have. */
class HarnessGreeting extends HTMLElement {
  constructor() {
    super()
    const shadow = this.attachShadow({ mode: "open" })
    shadow.innerHTML = `<button type="button" class="ui button"><slot></slot></button>`
  }
}
customElements.define("harness-greeting", HarnessGreeting)

describe("Fixture.render()", () => {
  it("renders into the live document", () => {
    const element = Fixture.render(`<p>Hello</p>`)
    expect(element.isConnected).toBe(true)
    expect(element.textContent).toBe("Hello")
  })

  it("cleans up after each test", () => {
    expect(document.querySelectorAll("[data-fixture]")).toHaveLength(0)
  })

  it("throws on HTML without an element", () => {
    expect(() => Fixture.render("just text")).toThrow(/no element/)
  })

  it("upgrades custom elements with shadow roots", () => {
    const greeting = Fixture.render<HarnessGreeting>(`<harness-greeting>Hi there</harness-greeting>`)
    expect(greeting).toBeInstanceOf(HarnessGreeting)
    expect(greeting.shadowRoot?.querySelector("button")).not.toBeNull()
  })
})

describe("A11y.check()", () => {
  it("passes axe on an accessible element", async () => {
    const greeting = Fixture.render(`<harness-greeting>Hi there</harness-greeting>`)
    await expectAccessible(greeting)
  })

  it("reports axe violations readably", async () => {
    const button = Fixture.render(`<div><button type="button"></button></div>`)
    await expect(A11y.check(button)).rejects.toThrow(/button-name/)
  })
})
