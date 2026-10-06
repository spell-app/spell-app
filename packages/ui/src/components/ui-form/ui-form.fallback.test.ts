import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { FormFallback } from "./ui-form.fallback"

FallbackStub.define("x-fb-form", (host, root, internals) =>
  FormFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("FormFallback", () => {
  it("renders the form root around a slot, inert when disabled", () => {
    const host = Fixture.render<StubHost>(`<x-fb-form size="large" state="error" disabled><form></form></x-fb-form>`)
    const root = FallbackStub.shadow(host).firstElementChild!
    expect(root.className).toBe("ui large error disabled form")
    expect(root.getAttribute("part")).toBe("form")
    expect(root.hasAttribute("inert")).toBe(true)
    expect(root.querySelector("slot")).not.toBeNull()
  })
})
