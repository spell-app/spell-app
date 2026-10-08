import { describe, expect, test } from "vite-plus/test"

import { ComponentTokens } from "$/ui/styles/ComponentTokens"

/** Every English vocabulary (the tags), by path. */
const VOCABULARIES = import.meta.glob<string>("/src/components/*/*.en.ts", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The foundation sheets, whose `--ui-*` names are never component tokens. */
const FOUNDATION = import.meta.glob<string>("/src/styles/*.css", { query: "?raw", import: "default", eager: true })

/** The real tags and foundation:  what `test/componentTokens.test.ts` checks every sheet with. */
const TOKENS = new ComponentTokens({ vocabularies: VOCABULARIES, foundation: Object.values(FOUNDATION) })

////////////////
// ## ComponentTokens.owner()
////////////////

describe("ComponentTokens.owner()", () => {
  test("classifies names by the longest tag, never the foundation's", () => {
    expect(TOKENS.owner("--ui-button-radius")).toEqual({ tag: "button", family: "ui-button" })
    expect(TOKENS.owner("--ui-buttons-gap")).toEqual({ tag: "buttons", family: "ui-button" })
    expect(TOKENS.owner("--ui-header-color")?.family).toBe("ui-parts")
    expect(TOKENS.owner("--ui-text-color")).toBeUndefined()
    expect(TOKENS.owner("--ui-color")).toBeUndefined()
    expect(TOKENS.owner("--_ui-button-radius")).toBeUndefined()
  })
})

////////////////
// ## ComponentTokens.publicDeclarations()
////////////////

describe("ComponentTokens.publicDeclarations()", () => {
  test("finds declarations, not style-query conditions", () => {
    const css = `.a { --ui-button-x: 1; } @container style(--ui-button-y: 1) { .b { color: red } }`
    expect(TOKENS.publicDeclarations(css).map(({ name }) => name)).toEqual(["--ui-button-x"])
  })
})

////////////////
// ## ComponentTokens.convert()
////////////////

describe("ComponentTokens.convert()", () => {
  test("converts a sheet:  the first declaration becomes the alias, later ones write it, reads read it", () => {
    const css = [
      ".ui.button {",
      "  /* the radius */",
      "  --ui-button-radius: var(--ui-radius);",
      "  --ui-button-pad: calc(var(--ui-button-radius) * 2);",
      "  border-radius: var(--ui-button-radius);",
      "}",
      ".ui.circular.button { --ui-button-radius: 999px; }"
    ].join("\n")
    const { css: converted, notes } = TOKENS.convert("ui-button", css)
    expect(converted).toContain("--_ui-button-radius: var(--ui-button-radius, var(--ui-radius));")
    expect(converted).toContain("--_ui-button-pad: var(--ui-button-pad, calc(var(--_ui-button-radius) * 2));")
    expect(converted).toContain("border-radius: var(--_ui-button-radius);")
    expect(converted).toContain(".ui.circular.button { --_ui-button-radius: 999px; }")
    expect(notes).toEqual([expect.stringContaining("variation writes --_ui-button-radius")])
    expect(ComponentTokens.aliases(converted)).toEqual([
      { name: "--ui-button-radius", default: "var(--ui-radius)", description: "the radius" },
      { name: "--ui-button-pad", default: "calc(var(--_ui-button-radius) * 2)", description: undefined }
    ])
    expect(TOKENS.publicDeclarations(converted)).toEqual([])
  })
})
