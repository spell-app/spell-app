import { describe, expect, it } from "vite-plus/test"

import { UI } from "$/ui/runtime"
import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { ButtonFallback } from "./ui-button.fallback"

FallbackStub.define(
  "x-fb-button",
  (host, root, internals) => ButtonFallback.render(host, root, new Error("boom"), internals),
  true
)

/** `<form>` around `html`;  records the `FormData` of the next submit and cancels it. */
function form(html: string) {
  const element = Fixture.render<HTMLFormElement>(`<form><input name="a" value="1" />${html}</form>`)
  const result: { data?: FormData; submits: number } = { submits: 0 }
  element.addEventListener("submit", (event) => {
    event.preventDefault()
    result.submits++
    result.data = new FormData(element)
  })
  const host = element.querySelector<StubHost>("x-fb-button")!
  return { element, host, result, control: () => FallbackStub.shadow(host).querySelector("button, a")! as HTMLElement }
}

describe("ButtonFallback", () => {
  it("renders the markup contract", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-button size="small" primary basic aria-label="Save it">Save</x-fb-button>`
    )
    const button = FallbackStub.shadow(host).querySelector("button")!
    expect(button.className).toBe("ui small basic primary button")
    expect(button.getAttribute("part")).toBe("button")
    expect(button.type).toBe("button")
    expect(button.getAttribute("aria-label")).toBe("Save it")
    expect(button.querySelector("slot")).not.toBeNull()
    expect(host.matches(":state(errored)")).toBe(true)
    await expectAccessible(host)
  })

  it("uses `content` only as the slot's fallback", () => {
    const host = Fixture.render<StubHost>(`<x-fb-button content="Shorthand"></x-fb-button>`)
    expect(FallbackStub.shadow(host).querySelector("slot")!.textContent).toBe("Shorthand")
  })

  it("reads booleans through the converters", () => {
    const no = Fixture.render<StubHost>(`<x-fb-button disabled="no">A</x-fb-button>`)
    expect(FallbackStub.shadow(no).querySelector("button")!.disabled).toBe(false)
    const yes = Fixture.render<StubHost>(`<x-fb-button disabled>A</x-fb-button>`)
    const button = FallbackStub.shadow(yes).querySelector("button")!
    expect(button.disabled).toBe(true)
    expect(button.className).toContain("disabled")
  })

  it("renders a link with `href`", async () => {
    const host = Fixture.render<StubHost>(`<x-fb-button href="/x" target="_blank">Go</x-fb-button>`)
    const link = FallbackStub.shadow(host).querySelector("a")!
    expect(link.getAttribute("href")).toBe("/x")
    expect(link.rel).toBe("noopener")
    expect(link.className).toBe("ui button")
    expect(FallbackStub.shadow(host).querySelector("button")).toBeNull()
    await expectAccessible(host)
  })

  it("submits its form with name=value", () => {
    const { control, result } = form(`<x-fb-button type="submit" name="go" value="yes">Go</x-fb-button>`)
    control().click()
    expect(result.submits).toBe(1)
    expect(result.data!.get("go")).toBe("yes")
    expect(result.data!.get("a")).toBe("1")
  })

  it("does not keep the submitter value after the submit", () => {
    const { element, control, result } = form(`<x-fb-button type="submit" name="go" value="yes">Go</x-fb-button>`)
    control().click()
    expect(new FormData(element).has("go")).toBe(false)
    expect(result.submits).toBe(1)
  })

  it("does nothing for the default type", () => {
    const { control, result } = form(`<x-fb-button name="go" value="yes">Go</x-fb-button>`)
    control().click()
    expect(result.submits).toBe(0)
  })

  it("resets its form", () => {
    const { element, control } = form(`<x-fb-button type="reset">Reset</x-fb-button>`)
    const input = element.querySelector("input")!
    input.value = "changed"
    control().click()
    expect(input.value).toBe("1")
  })

  it("is inert when disabled", () => {
    const { control, result } = form(`<x-fb-button type="submit" disabled>Go</x-fb-button>`)
    control().click()
    expect(result.submits).toBe(0)
  })

  it("flips aria-pressed and active for a toggle, with no other event", () => {
    const host = Fixture.render<StubHost>(`<x-fb-button toggle>T</x-fb-button>`)
    const button = FallbackStub.shadow(host).querySelector("button")!
    const events: string[] = []
    host.addEventListener("ui-toggle", () => events.push("ui-toggle"))
    expect(button.getAttribute("aria-pressed")).toBe("false")
    button.click()
    expect(button.getAttribute("aria-pressed")).toBe("true")
    expect(button.classList.contains("active")).toBe(true)
    button.click()
    expect(button.getAttribute("aria-pressed")).toBe("false")
    expect(events).toEqual([])
  })

  it("names an icon-only button after its icon", () => {
    const host = Fixture.render<StubHost>(`<x-fb-button icon="save"></x-fb-button>`)
    expect(FallbackStub.shadow(host).querySelector("button")!.getAttribute("aria-label")).toBe("save")
  })

  it('never names a button "true" after a bare icon (`icon="true"`, as frameworks write it)', () => {
    const host = Fixture.render<StubHost>(`<x-fb-button icon="true"></x-fb-button>`)
    expect(FallbackStub.shadow(host).querySelector("button")!.hasAttribute("aria-label")).toBe(false)
  })

  it("runs an invoker command on click (the fallback's own, or the browser's)", async () => {
    await UI.load()
    const wrapper = Fixture.render<HTMLElement>(
      `<div><x-fb-button commandfor="t" command="show-popover">Go</x-fb-button><div id="t" popover>p</div></div>`
    )
    const host = wrapper.querySelector<StubHost>("x-fb-button")!
    FallbackStub.shadow(host).querySelector<HTMLElement>("button")!.click()
    expect(wrapper.querySelector("#t")!.matches(":popover-open")).toBe(true)
    wrapper.querySelector<HTMLElement>("#t")!.hidePopover()
  })

  it("stops reacting after dispose()", () => {
    const { host, control, result } = form(`<x-fb-button type="submit">Go</x-fb-button>`)
    host.handle!.dispose()
    control().click()
    expect(result.submits).toBe(0)
  })
})
