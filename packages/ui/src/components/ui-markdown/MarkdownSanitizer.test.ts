import DOMPurify from "dompurify"
import { describe, expect, it, onTestFinished } from "vite-plus/test"

import { SourceError } from "$/ui/runtime/runtime.types"

import { MarkdownSanitizer } from "./MarkdownSanitizer"

describe("MarkdownSanitizer.sanitize()", () => {
  it("drops scripts and handlers, and keeps `ui-*` tags only when asked", () => {
    const html = `<p onclick="x()">hi</p><script>x()</script><ui-label color="red" onmouseover="x()">tag</ui-label>`
    const kept = document.createElement("div")
    kept.append(MarkdownSanitizer.instance.sanitize(html, true))
    expect(kept.innerHTML).toBe(`<p>hi</p><ui-label color="red">tag</ui-label>`)
    const dropped = document.createElement("div")
    dropped.append(MarkdownSanitizer.instance.sanitize(html, false))
    expect(dropped.querySelector("ui-label, script")).toBeNull()
  })

  it("fails closed where DOMPurify can't sanitize", () => {
    const supported = DOMPurify.isSupported
    DOMPurify.isSupported = false
    onTestFinished(() => {
      DOMPurify.isSupported = supported
    })
    expect(() => MarkdownSanitizer.instance.sanitize("<b>hi</b>", false)).toThrow(SourceError)
  })
})
