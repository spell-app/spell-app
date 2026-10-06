import { describe, expect, test, vi } from "vite-plus/test"

import { CodeHighlighter } from "./CodeHighlighter"

describe("CodeHighlighter.highlight()", () => {
  test("loads highlight.js only for code it must colour", async () => {
    expect((await CodeHighlighter.highlight("x", "text")).html).toBe("x")
  })

  test("`text`, in any case, is plain escaped text:  the engine's loader is NEVER called", async () => {
    const loader = vi.spyOn(CodeHighlighter, "engineLoader")
    try {
      expect(await CodeHighlighter.highlight("<b>", "TEXT")).toEqual({ html: "&lt;b&gt;", detected: false })
      expect(loader).not.toHaveBeenCalled()
    } finally {
      loader.mockRestore()
    }
  })
})
