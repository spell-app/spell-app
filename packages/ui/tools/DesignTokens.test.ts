import { describe, expect, test } from "vite-plus/test"

import { DesignTokens } from "./DesignTokens.ts"

describe("DesignTokens.rootDeclarations()", () => {
  test("reads only top-level :root declarations, inside @layer", () => {
    const css =
      "@layer a { :root { --x: 1px; --y: light-dark(#fff, #000) } } @media (x) { :root { --z: 2 } } .a { --w: 3 }"
    expect(DesignTokens.rootDeclarations(css)).toEqual([
      { name: "--x", value: "1px" },
      { name: "--y", value: "light-dark(#fff, #000)" }
    ])
  })
})

describe("DesignTokens.pickTheme()", () => {
  test("picks a theme's branch of light-dark()", () => {
    expect(DesignTokens.pickTheme("light-dark(var(--a), var(--b))", "dark")).toBe("var(--b)")
  })
})

describe("DesignTokens.pickAll()", () => {
  test("picks a theme's branch of EVERY light-dark() in a value", () => {
    expect(DesignTokens.pickAll("0 1px light-dark(#000, #fff), 0 2px light-dark(red, blue)", "light")).toBe(
      "0 1px #000, 0 2px red"
    )
  })
})
