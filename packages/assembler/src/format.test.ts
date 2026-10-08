import { describe, expect, test } from "vite-plus/test"

import { AS } from "$/assembler"

/** A page on one line, as a tool builds it before formatting. */
const SQUASHED =
  "<!doctype html><html><head><title>t</title></head><body><div><p>a</p><ui-item   id='a'>b</ui-item></div></body></html>"

/** `SQUASHED` as `vp fmt` lays it out:  2-space indent, double quotes. */
const FORMATTED = [
  "<!doctype html>",
  "<html>",
  "  <head>",
  "    <title>t</title>",
  "  </head>",
  "  <body>",
  "    <div>",
  "      <p>a</p>",
  '      <ui-item id="a">b</ui-item>',
  "    </div>",
  "  </body>",
  "</html>",
  ""
].join("\n")

////////////////
// ## Tests
////////////////

describe("formatHTML()", () => {
  test("lays a page out as `vp fmt` would, and leaves a formatted page alone", async () => {
    expect(await AS.formatHTML("x.html", SQUASHED)).toBe(FORMATTED)
    expect(await AS.formatHTML("x.html", FORMATTED)).toBe(FORMATTED)
  })

  test("formats a plan doc's `.htm` part as HTML:  the file's extension picks the parser", async () => {
    expect(await AS.formatHTML("parts/p1.htm", "<ul><li>one</li><li>two</li></ul>")).toBe(
      "<ul>\n  <li>one</li>\n  <li>two</li>\n</ul>\n"
    )
  })

  test("throws on a parse error, naming the file", async () => {
    await expect(AS.formatHTML("parts/p1.htm", "</div></span>")).rejects.toThrow(
      /^p1\.htm:  SyntaxError: Unexpected closing tag "div"/
    )
  })
})
