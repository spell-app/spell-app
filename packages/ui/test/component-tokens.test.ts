import { describe, expect, it } from "vite-plus/test"

import { ComponentTokens } from "$/ui/styles/ComponentTokens"

/**
 * The component-token rule (`docs/theming.md` "Component tokens"):  a component sheet NEVER declares a public
 * `--ui-<tag>-*` token, of its own family or any other.  It reads each through a private alias declared where the
 * public one used to be (`--_ui-button-radius: var(--ui-button-radius, var(--ui-radius))`), so a value set on
 * `:root`, an ancestor, the host, `::part()` or in the app stylesheet reaches the box.
 * - Why a test:  one declaration of the public name on an inner box silently blocks every value set from outside
 *   (the bug this rule fixes);  nothing else would notice.
 * - Reads are fine;  foundation / remap names (`--ui-color`, `--ui-scale`, `--ui-inverted`, `--ui-size-*`) are
 *   not component tokens.
 */

/** Every component sheet, by path. */
const SHEETS = import.meta.glob<string>("/src/components/*/*.css", { query: "?raw", import: "default", eager: true })

/** Every English vocabulary (the tags), by path. */
const VOCABULARIES = import.meta.glob<string>("/src/components/*/*.vocabulary.en.ts", {
  query: "?raw",
  import: "default",
  eager: true
})

/** The foundation sheets, whose `--ui-*` names are never component tokens. */
const FOUNDATION = import.meta.glob<string>("/src/styles/*.css", { query: "?raw", import: "default", eager: true })

/**
 * Public tokens a sheet MAY declare, by sheet, each with why.  Only for an owner that deliberately themes a NESTED
 * component of another family, exactly as the page would -- it overrides a value the page set above the owner,
 * which is the point.  A stale entry fails.
 */
const EXCEPTIONS: Record<string, Record<string, string>> = {
  "ui-search/ui-search.css": {
    "--ui-input-radius": "the search prompt is Fomantic's round input:  it sets the nested input's radius"
  }
}

const tokens = new ComponentTokens(VOCABULARIES, Object.values(FOUNDATION))

/** `src/components/ui-button/ui-button.css` => `ui-button/ui-button.css` */
function short(path: string): string {
  return path.replace("/src/components/", "")
}

describe("component tokens", () => {
  it.each(Object.keys(SHEETS).map(short))("%s never declares a public component token", (path) => {
    const allowed = EXCEPTIONS[path] ?? {}
    const declared = tokens.publicDeclarations(SHEETS[`/src/components/${path}`]!)
    const found = declared.filter(({ name }) => !(name in allowed)).map(({ name, line }) => `${name} (line ${line})`)
    expect(found, "declare `--_ui-x: var(--ui-x, <default>)` instead (docs/theming.md)").toEqual([])
    for (const name of Object.keys(allowed))
      expect(
        declared.map((declaration) => declaration.name),
        `stale EXCEPTIONS entry ${name}`
      ).toContain(name)
  })

  it.each(Object.keys(SHEETS).map(short))("%s names every alias after the token it reads", (path) => {
    const css = SHEETS[`/src/components/${path}`]!
    const mismatched = ComponentTokens.declarations(css)
      .filter(({ name, value }) => name.startsWith("--_ui-") && /^var\(\s*--ui-/.test(value))
      .map(({ name, value, line }) => ({ name, read: /^var\(\s*(--ui-[a-z0-9-]+)/.exec(value)![1]!, line }))
      .filter(({ name, read }) => {
        const family = tokens.owner(`--${name.slice(3)}`)?.family
        return family && tokens.owner(read)?.family === family && read !== `--${name.slice(3)}`
      })
      .map(({ name, read, line }) => `${name} reads ${read} (line ${line})`)
    expect(mismatched).toEqual([])
  })

  it.each(Object.keys(SHEETS).map(short))("%s reads its aliased tokens only through the alias", (path) => {
    const css = ComponentTokens.stripComments(SHEETS[`/src/components/${path}`]!)
    const aliased = ComponentTokens.aliases(css).map(({ name }) => name)
    const bypasses: string[] = []
    for (const name of aliased) {
      const alias = `--_${name.slice(2)}`
      for (const match of css.matchAll(new RegExp(`var\\(\\s*${name}(?![a-z0-9-])`, "g"))) {
        const before = css.slice(0, match.index).replace(/\s+/g, " ")
        if (before.endsWith(`${alias}: `) || before.endsWith(`var(${alias}, `)) continue
        bypasses.push(`${name} at line ${css.slice(0, match.index).split("\n").length}`)
      }
    }
    expect(bypasses, "read `var(--_ui-x)`:  a variation writes the alias, so a bare public read skips it").toEqual([])
  })
})

describe("ComponentTokens", () => {
  it("classifies names by the longest tag, never the foundation's", () => {
    expect(tokens.owner("--ui-button-radius")).toEqual({ tag: "button", family: "ui-button" })
    expect(tokens.owner("--ui-buttons-gap")).toEqual({ tag: "buttons", family: "ui-button" })
    expect(tokens.owner("--ui-header-color")?.family).toBe("ui-parts")
    expect(tokens.owner("--ui-text-color")).toBeUndefined()
    expect(tokens.owner("--ui-color")).toBeUndefined()
    expect(tokens.owner("--_ui-button-radius")).toBeUndefined()
  })

  it("finds declarations, not style-query conditions", () => {
    const css = `.a { --ui-button-x: 1; } @container style(--ui-button-y: 1) { .b { color: red } }`
    expect(tokens.publicDeclarations(css).map(({ name }) => name)).toEqual(["--ui-button-x"])
  })

  it("converts a sheet:  the first declaration becomes the alias, later ones write it, reads read it", () => {
    const css = [
      ".ui.button {",
      "  /* the radius */",
      "  --ui-button-radius: var(--ui-radius);",
      "  --ui-button-pad: calc(var(--ui-button-radius) * 2);",
      "  border-radius: var(--ui-button-radius);",
      "}",
      ".ui.circular.button { --ui-button-radius: 999px; }"
    ].join("\n")
    const { css: converted, notes } = tokens.convert("ui-button", css)
    expect(converted).toContain("--_ui-button-radius: var(--ui-button-radius, var(--ui-radius));")
    expect(converted).toContain("--_ui-button-pad: var(--ui-button-pad, calc(var(--_ui-button-radius) * 2));")
    expect(converted).toContain("border-radius: var(--_ui-button-radius);")
    expect(converted).toContain(".ui.circular.button { --_ui-button-radius: 999px; }")
    expect(notes).toEqual([expect.stringContaining("variation writes --_ui-button-radius")])
    expect(ComponentTokens.aliases(converted)).toEqual([
      { name: "--ui-button-radius", default: "var(--ui-radius)", description: "the radius" },
      { name: "--ui-button-pad", default: "calc(var(--_ui-button-radius) * 2)", description: undefined }
    ])
    expect(tokens.publicDeclarations(converted)).toEqual([])
  })
})
