import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { DocsExampleFallback } from "./ui-docs-example.fallback"

FallbackStub.define("x-fb-docs-example", (host, root, internals) =>
  DocsExampleFallback.render({ host, root, error: new Error("boom"), internals })
)

describe("DocsExampleFallback", () => {
  it("renders the class grammar, a heading, the description, the slot and parts", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-docs-example header="Emphasis" description="Levels of emphasis." bare><button>Save</button></x-fb-docs-example>`
    )
    const section = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(section.localName).toBe("section")
    expect(section.className).toBe("ui bare example")
    expect(section.getAttribute("part")).toBe("example")
    expect(section.querySelector("h4[part=header]")!.textContent).toBe("Emphasis")
    expect(section.querySelector("p[part=description]")!.textContent).toBe("Levels of emphasis.")
    expect(section.querySelector("[part=demo] slot")).not.toBeNull()
    expect(section.querySelector("[part=code]")).toBeNull()
    await expectAccessible(host)
  })

  it("shows the markup with `code`, at the asked heading level", () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-docs-example header="H" level="3" code><button>Save</button></x-fb-docs-example>`
    )
    const section = FallbackStub.shadow(host).firstElementChild!
    expect(section.querySelector("h3")).not.toBeNull()
    expect(section.querySelector("pre[part=code] code")!.textContent).toBe("<button>Save</button>")
  })
})
