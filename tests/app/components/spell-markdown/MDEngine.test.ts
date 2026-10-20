import { describe, expect, test } from "vite-plus/test"

import { MDEngine } from "$/app/components/spell-markdown/MDEngine"

describe("MDEngine.render()", () => {
  test("decodes entities as the spec does:  whole references only, unknown ones kept", () => {
    const { html } = MDEngine.instance.render("&notit; &amp; &semi; &#0; &NotEqualTilde; &Afr; &nope; &copy", {
      breaks: false,
      headingOffset: 0,
      sanitized: false
    })
    expect(html).toContain("&amp;notit; &amp; ; � ≂̸ \u{1D504} &amp;nope; &amp;copy")
  })
})
