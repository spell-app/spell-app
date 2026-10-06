import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/test/FallbackStub"

import { CommentFallback } from "./ui-comment.fallback"

// the fallback keys on the host's and its parent's tags, so the stubs take the real tags
FallbackStub.define("ui-comments", (host, root, internals) =>
  CommentFallback.render({ host, root, error: new Error("boom"), internals })
)
FallbackStub.define("ui-comment", (host, root, internals) =>
  CommentFallback.render({ host, root, error: new Error("boom"), internals })
)

/** Axe without contrast:  the stub has no stylesheet. */
const AXE = { rules: { "color-contrast": { enabled: false } } }

describe("CommentFallback", () => {
  it("renders the list, its <article> comments and a thread inside a comment", async () => {
    const host = Fixture.render<StubHost>(
      `<ui-comments threaded size="small"><ui-comment>Matt<ui-comments collapsed><ui-comment>Reply</ui-comment>` +
        `</ui-comments></ui-comment><form slot="reply"><textarea aria-label="Reply"></textarea></form></ui-comments>`
    )
    const root = FallbackStub.shadow(host).firstElementChild as HTMLElement
    expect(root.className).toBe("ui small threaded comments")
    expect(root.getAttribute("part")).toBe("comments")
    expect(root.querySelector(".reply > slot[name=reply]")).not.toBeNull()
    const comment = FallbackStub.shadow(host.querySelector("ui-comment")!).firstElementChild!
    expect(comment.localName).toBe("article")
    expect(comment.className).toBe("comment")
    expect(comment.getAttribute("part")).toBe("comment")
    const thread = FallbackStub.shadow(host.querySelector("ui-comment ui-comments")!).firstElementChild!
    expect(thread.className).toBe("collapsed comments")
    expect(host.handle!.degraded.length).toBeGreaterThan(0)
    await expectAccessible(host, AXE)
  })

  it("marks a disabled comment aria-disabled", () => {
    const host = Fixture.render<StubHost>(`<ui-comment disabled collapsed>Off</ui-comment>`)
    const comment = FallbackStub.shadow(host).firstElementChild!
    expect(comment.className).toBe("collapsed disabled comment")
    expect(comment.getAttribute("aria-disabled")).toBe("true")
  })
})
