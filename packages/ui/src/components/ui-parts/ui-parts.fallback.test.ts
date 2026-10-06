import { describe, expect, it } from "vite-plus/test"

import { Fixture } from "$/ui/test/fixture"
import { expectAccessible } from "$/ui/test/a11y"
import { FallbackStub, type StubHost } from "$/ui/components/fallback.stub"
import { cardVocabulary } from "$/ui/components/ui-card/ui-card.vocabulary.en"
import { segmentVocabulary } from "$/ui/components/ui-segment/ui-segment.vocabulary.en"
import { PartContext } from "$/ui/elements"

import { ContentPartFallback } from "./ui-parts.fallback"
import { PART_VOCABULARIES } from "./ui-parts.types"

for (const tag of ["ui-meta", "ui-header", "ui-content", "ui-description"]) {
  FallbackStub.define(tag, (host, root, internals) =>
    ContentPartFallback.render({ host, root, error: new Error("boom"), internals })
  )
}
// the owner registry, as `UIElement.define()` fills it:  the parts, a card (an owner) and a segment (a barrier)
for (const vocabulary of PART_VOCABULARIES) PartContext.define({ vocabulary, tag: vocabulary.tag, isPart: true })
PartContext.define({ vocabulary: cardVocabulary, tag: cardVocabulary.tag, isPart: false })
PartContext.define({ vocabulary: segmentVocabulary, tag: segmentVocabulary.tag, isPart: false })

describe("ContentPartFallback", () => {
  it("renders a bare noun div, keyed by the host's tag", async () => {
    const host = Fixture.render<StubHost>(`<ui-meta>Yesterday</ui-meta>`)
    const meta = FallbackStub.shadow(host).firstElementChild!
    expect(meta.tagName).toBe("DIV")
    expect(meta.className).toBe("meta")
    expect(meta.getAttribute("part")).toBe("meta")
    expect(meta.querySelector("slot")).not.toBeNull()
    await expectAccessible(host)
  })

  it("renders a standalone header as an `ui header` heading by level", async () => {
    const host = Fixture.render<StubHost>(`<ui-header level="2" dividing size="large">Title</ui-header>`)
    const header = FallbackStub.shadow(host).firstElementChild!
    expect(header.tagName).toBe("H2")
    expect(header.className).toBe("ui large dividing header")
    expect(header.getAttribute("part")).toBe("header")
    await expectAccessible(host)
  })

  it("renders a header without a level as a div, and with href as a link", () => {
    const plain = Fixture.render<StubHost>(`<ui-header>Title</ui-header>`)
    expect(FallbackStub.shadow(plain).firstElementChild!.tagName).toBe("DIV")
    const link = Fixture.render<StubHost>(`<ui-header href="/x">Title</ui-header>`)
    expect(FallbackStub.shadow(link).firstElementChild!.tagName).toBe("A")
  })

  it("renders a header owned by any registered owner (a card) as a bare `header`, not past a barrier", () => {
    const card = Fixture.render<HTMLElement>(
      `<ui-card><ui-content><ui-header>Elliot</ui-header></ui-content></ui-card>`
    )
    const header = FallbackStub.shadow(card.querySelector<StubHost>("ui-header")!).firstElementChild!
    expect(header.className).toBe("header")
    const segment = Fixture.render<HTMLElement>(
      `<ui-card><ui-segment><ui-header>Alone</ui-header></ui-segment></ui-card>`
    )
    const alone = FallbackStub.shadow(segment.querySelector<StubHost>("ui-header")!).firstElementChild!
    expect(alone.className).toBe("ui header")
  })

  it("renders a header owned by another header as a bare `header`", () => {
    const outer = Fixture.render<StubHost>(`<ui-header><ui-header level="3">Sub</ui-header></ui-header>`)
    const inner = outer.querySelector<StubHost>("ui-header")!
    const header = FallbackStub.shadow(inner).firstElementChild!
    expect(header.className).toBe("header")
    expect(header.getAttribute("role")).toBe("heading")
    expect(header.getAttribute("aria-level")).toBe("3")
  })
})
