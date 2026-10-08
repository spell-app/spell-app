import { describe, expect, test } from "vite-plus/test"

import { MDEngine } from "./MDEngine"

describe("MDEngine.render()", () => {
  // the bundle (md.bundle.js) decodes with the browser's <textarea>, not `entities`' table (`gen-markdown.ts`, I6)
  test("decodes entities as the spec does:  whole references only, unknown ones kept", () => {
    const { html } = MDEngine.instance.render("&notit; &amp; &semi; &#0; &NotEqualTilde; &Afr; &nope; &copy", {
      breaks: false,
      headingOffset: 0,
      sanitized: false
    })
    expect(html).toContain("&amp;notit; &amp; ; � ≂̸ \u{1D504} &amp;nope; &amp;copy")
  })
})
