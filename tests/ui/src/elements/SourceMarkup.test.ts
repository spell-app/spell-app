import { describe, expect, test } from "vite-plus/test"

import { SourceError } from "$/ui/runtime"
import { SourceMarkup } from "$/ui/elements"

/** A file one folder down, as `source` names it. */
const SOURCE = "parts/intro.html"

/** A whole HTML file:  head, script, and a body with relative URLs. */
const FILE =
  `<!doctype html><html><head><title>Intro</title></head><body>` +
  `<p class="lead"><a href="next.html">Next</a> <a href="#top">Top</a></p>` +
  `<img src="pic.png" alt=""><script>window.RAN = true</script></body></html>`

////////////////
// ## Parsing
////////////////

describe("SourceMarkup.parse()", () => {
  test("takes the body's content for this page:  no head, scripts NEVER run", () => {
    const fragment = SourceMarkup.parse(FILE, { page: document })
    expect(fragment.ownerDocument).toBe(document)
    expect(fragment.querySelector("title")).toBeNull()
    expect(fragment.querySelector("p.lead")).not.toBeNull()
    expect((globalThis as { RAN?: boolean }).RAN).toBeUndefined()
  })

  test("takes only the first `select` match", () => {
    const fragment = SourceMarkup.parse(FILE, { page: document, select: "img" })
    expect([...fragment.children].map((child) => child.localName)).toEqual(["img"])
  })

  test("throws a `render` SourceError for a selector that's invalid or matches nothing", () => {
    expect.assertions(4)
    for (const select of ["[", "table"]) {
      try {
        SourceMarkup.parse(FILE, { page: document, source: SOURCE, select })
      } catch (error) {
        expect(error).toBeInstanceOf(SourceError)
        expect(error).toMatchObject({ kind: "render" })
      }
    }
  })
})

////////////////
// ## URLs
////////////////

describe("SourceMarkup.rewriteUrls() / restoreUrls()", () => {
  test("points relative URLs where they pointed in the file, keeping each original;  #hash links stay", () => {
    const fragment = SourceMarkup.parse(FILE, { page: document, source: SOURCE })
    const [next, top] = fragment.querySelectorAll("a")
    expect(next!.getAttribute("href")).toBe(new URL(`parts/next.html`, document.baseURI).href)
    expect(next!.getAttribute("data-ui-include-href")).toBe("next.html")
    expect(top!.getAttribute("href")).toBe("#top")
    expect(fragment.querySelector("img")!.getAttribute("src")).toBe(new URL(`parts/pic.png`, document.baseURI).href)
  })

  test("restoreUrls() puts every original back and drops the kept copies", () => {
    const fragment = SourceMarkup.parse(FILE, { page: document, source: SOURCE })
    SourceMarkup.restoreUrls(fragment)
    const next = fragment.querySelector("a")!
    expect(next.getAttribute("href")).toBe("next.html")
    expect(next.hasAttribute("data-ui-include-href")).toBe(false)
  })
})

////////////////
// ## Nesting
////////////////

describe("SourceMarkup.checkNesting()", () => {
  test("throws for an enclosing source of the same file;  another file is fine", () => {
    const outer = document.createElement("div")
    outer.setAttribute("source", SOURCE)
    const host = outer.appendChild(document.createElement("div"))
    const isSource = (element: Element) => element.hasAttribute("source")
    expect(() => SourceMarkup.checkNesting(host, "./" + SOURCE, isSource)).toThrow(/includes itself/)
    expect(() => SourceMarkup.checkNesting(host, "parts/other.html", isSource)).not.toThrow()
  })

  test("climbs out of shadow roots, and throws past the depth limit", () => {
    let top = document.createElement("div")
    const root = top
    for (let depth = 0; depth < 8; depth++) {
      const next = document.createElement("div")
      next.setAttribute("source", `level-${depth}.html`)
      top.attachShadow({ mode: "open" }).append(next)
      top = next
    }
    const host = top.appendChild(document.createElement("div"))
    expect(root.shadowRoot).not.toBeNull()
    expect(() => SourceMarkup.checkNesting(host, "deep.html", (element) => element.hasAttribute("source"))).toThrow(
      /nested more than 8 sources deep/
    )
  })
})
