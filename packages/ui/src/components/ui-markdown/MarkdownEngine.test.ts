import { describe, expect, test } from "vite-plus/test"

import { MarkdownEngine } from "./MarkdownEngine"

/** Render options:  no line breaks, no offset, unsanitized. */
const PLAIN = { breaks: false, headingOffset: 0, sanitized: false }

describe("MarkdownEngine.slug()", () => {
  test.each([
    ["Getting started!", "getting-started"],
    ["  API:  `load()` & more ", "api--load--more"],
    ["Ünïcode wörds", "ünïcode-wörds"]
  ])("%s => %s", (text, slug) => {
    expect(MarkdownEngine.slug(text)).toBe(slug)
  })
})

describe("MarkdownEngine.render()", () => {
  test("numbers a repeated heading's id, as GitHub does", () => {
    const { headings } = MarkdownEngine.instance.render("# Setup\n\n## Setup\n\n### Setup", PLAIN)
    expect(headings.map(({ id }) => id)).toEqual(["setup", "setup-1", "setup-2"])
  })

  test("shifts heading levels by `headingOffset`, NEVER past <h6>", () => {
    const { html, headings } = MarkdownEngine.instance.render("# One\n\n###### Six", { ...PLAIN, headingOffset: 2 })
    expect(headings.map(({ level }) => level)).toEqual([3, 6])
    expect(html).toContain('<h6 id="six">Six</h6>')
  })
})
