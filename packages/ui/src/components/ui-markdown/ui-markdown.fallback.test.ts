import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"

import { MarkdownFallback } from "./ui-markdown.fallback"

FallbackStub.define("x-fb-markdown", (host, root, internals) =>
  MarkdownFallback.render(host, root, new Error("boom"), internals)
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("MarkdownFallback", () => {
  it("shows the markdown as written", async () => {
    const host = Fixture.render<StubHost>(
      `<x-fb-markdown size="small"><script type="text/markdown"># Title\n*text*</script></x-fb-markdown>`
    )
    const article = FallbackStub.shadow(host).firstElementChild!
    expect(article.getAttribute("part")).toBe("body")
    expect(article.className).toBe("ui small markdown")
    expect(article.querySelector("pre")!.textContent).toBe("# Title\n*text*")
    await expectAccessible(host, AXE)
  })
})
