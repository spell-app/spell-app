import { describe, expect, test } from "vite-plus/test"

import { ROOT_CATALOG } from "$/ui/components/ui-root/ui-root.catalog"

import { SkeletonText } from "./SkeletonText"

/** Every skeleton the catalog holds (parsed from the vocabularies by `yarn gen:root`), by tag. */
const CATALOG_SKELETONS = Object.entries(ROOT_CATALOG).flatMap(([tag, entry]) =>
  entry.skeleton ? [[tag, entry.skeleton] as const] : []
)

describe("SkeletonText.parse()", () => {
  test.each([
    ["18 x 15", { width: "18em", height: "15em" }],
    ["inline 6 x 2.5", { display: "inline", width: "6em", height: "2.5em" }],
    ["2 tall", { height: "2em" }],
    ["0.25 tall", { height: "0.25em" }],
    ["18 wide", { width: "18em" }],
    [
      "18 wide: square image, header, 3 line paragraph",
      {
        width: "18em",
        parts: [{ shape: "image", ratio: "square" }, { shape: "header" }, { shape: "paragraph", lines: 3 }]
      }
    ],
    [
      "header with image, paragraph",
      {
        parts: [{ shape: "header", image: true }, { shape: "paragraph" }]
      }
    ],
    [
      "rectangular image, image, line, very short line",
      {
        parts: [
          { shape: "image", ratio: "rectangular" },
          { shape: "image" },
          { shape: "line" },
          { shape: "line", length: "very short" }
        ]
      }
    ],
    ["none", false]
  ] as const)("%s", (text, spec) => {
    expect(SkeletonText.parse(text)).toEqual(spec)
  })

  test("spaces around words, `x`, `:` and `,` are free", () => {
    expect(SkeletonText.parse("  inline   6x2.5 ")).toEqual({ display: "inline", width: "6em", height: "2.5em" })
    expect(SkeletonText.parse("18 wide :square image ,  3  line  paragraph")).toEqual({
      width: "18em",
      parts: [
        { shape: "image", ratio: "square" },
        { shape: "paragraph", lines: 3 }
      ]
    })
  })

  test("writes keys in the catalog's order:  display, width, height, parts", () => {
    expect(Object.keys(SkeletonText.parse("inline 4 x 2: header") as object)).toEqual([
      "display",
      "width",
      "height",
      "parts"
    ])
  })

  test.each([
    ["18 by 15", /can't read "18 by 15"/],
    ["inline", /can't read "inline"/],
    ["", /can't read ""/],
    ["tall: header", /can't read "tall: header"/],
    ["header, hedaer", /"hedaer" in "header, hedaer" isn't a part/],
    ["2 x 2: huge line", /"huge line" in .* isn't a part/],
    ["header, 0 line paragraph", /"0 line paragraph" in .* isn't a part/],
    ["None", /can't read "None"/]
  ])("throws a TypeError naming bad text:  %s", (text, message) => {
    expect(() => SkeletonText.parse(text)).toThrow(TypeError)
    expect(() => SkeletonText.parse(text)).toThrow(message)
  })
})

describe("SkeletonText.format()", () => {
  test("writes the shortest form", () => {
    expect(SkeletonText.format({ display: "inline", width: "6em", height: "2.5em" })).toBe("inline 6 x 2.5")
    expect(SkeletonText.format({ height: "2em" })).toBe("2 tall")
    expect(SkeletonText.format({ width: "15em", parts: [{ shape: "paragraph", lines: 8 }] })).toBe(
      "15 wide: 8 line paragraph"
    )
    expect(SkeletonText.format(false)).toBe("none")
  })

  test("throws for what text can't say:  a size not in em, nothing to draw", () => {
    expect(() => SkeletonText.format({ width: "18px" })).toThrow(/width "18px" isn't in em/)
    expect(() => SkeletonText.format({ display: "inline" })).toThrow(/draws nothing/)
  })

  // every skeleton the vocabularies describe survives the trip both ways
  test.each(CATALOG_SKELETONS)("round trip:  <%s>", (_, spec) => {
    const text = SkeletonText.format(spec)
    expect(SkeletonText.parse(text)).toEqual(spec)
    expect(SkeletonText.format(SkeletonText.parse(text))).toBe(text)
  })
})
