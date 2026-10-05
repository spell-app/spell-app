import { describe, expect, test } from "vite-plus/test"

import { absoluteUrls } from "$/app/runner"

describe("absoluteUrls()", () => {
  test("makes relative `url()`s absolute -- a shadow root's adopted sheet resolves them against the PAGE", () => {
    const css = `@font-face{src:url(themes/icons.woff2)}a{background:url("../img.png")}b{background:url(data:x)}`
    expect(absoluteUrls(css, "https://example.com/element/semantic-ui-css/semantic.min.css")).toBe(
      `@font-face{src:url(https://example.com/element/semantic-ui-css/themes/icons.woff2)}` +
        `a{background:url("https://example.com/element/img.png")}b{background:url(data:x)}`
    )
  })
})
