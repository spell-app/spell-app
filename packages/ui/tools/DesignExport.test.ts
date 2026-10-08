import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { DesignColor } from "./DesignColor.ts"
import { DesignExport } from "./DesignExport.ts"
import { ElementManifests } from "./ElementManifests.ts"
import type { SiteDataFile } from "../src/docs-components/docs-components.types.ts"
import type { DesignExportResult, DesignTokensFile, ThemedValue } from "./tools.types.ts"

/**
 * The claude.ai design-system export (`yarn design:build`) keeps to the format's rules
 * (`artifact-type/reference/format.md` of the Design System type);  the brand's `<ui-brand-*>` cards come in
 * as a "Brand" group (epic `claude-design`, P11).
 */

////////////////
// ## Fixtures
////////////////

const UI = fileURLToPath(new URL("../", import.meta.url))
const DATA = JSON.parse(readFileSync(join(UI, "site/_data/components.json"), "utf8")) as SiteDataFile
const BRAND = join(UI, "../brand")
const BRAND_DATA = JSON.parse(readFileSync(join(BRAND, "_data/components.json"), "utf8")) as SiteDataFile
/** Spell UI's site data with the brand's merged in, as the export sees it */
let all: SiteDataFile
let result: DesignExportResult
let files: Map<string, string>
let tokens: DesignTokensFile

beforeAll(() => {
  const exporter = new DesignExport({
    data: DATA,
    git: { branch: "main", sha: "abc1234", user: "Test" },
    now: new Date(0)
  })
  result = exporter.build()
  all = exporter.allData
  files = new Map(result.files.map((file) => [file.path, file.text]))
  tokens = JSON.parse(files.get("tokens.json")!) as DesignTokensFile
}, 60_000)

////////////////
// ## tokens.json
////////////////

describe("DesignExport.build() tokens.json", () => {
  it("names every token validly, and uniquely across the families (type styles apart)", () => {
    const names: string[] = []
    for (const [key, family] of Object.entries(tokens)) {
      if (key === "type" || !family || typeof family !== "object" || !("tokens" in family)) continue
      for (const token of (family as { tokens: { name: string }[] }).tokens) names.push(token.name)
    }
    expect(names.length).toBeGreaterThan(300)
    for (const name of names) expect(name).toMatch(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/)
    expect(names.filter((name, index) => names.indexOf(name) !== index)).toEqual([])
    for (const group of tokens.type.groups)
      for (const style of group.styles) expect(style.name).toMatch(/^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$/)
  })

  it("never shadows a live custom property:  no `ui-` or `spell-` prefix", () => {
    for (const token of tokens.color.tokens) expect(token.name).not.toMatch(/^(ui|spell)-/)
  })

  it("writes colours only as hex, plain `rgb()` / `oklch()`, or an alias of an existing colour, light and dark", () => {
    const colors = new Map(tokens.color.tokens.map((token) => [token.name, token.value]))
    expect(tokens.color.themes.map((theme) => theme.id)).toEqual(["light", "dark"])
    for (const [name, value] of colors) {
      for (const theme of ["light", "dark"]) {
        const text = themed(value, theme)
        expect(text, `${name} (${theme})`).not.toMatch(/var\(|color-mix|light-dark|calc\(|from\s/)
        const alias = /^\{(.+)\}$/.exec(text)?.[1]
        if (!alias) {
          expect(DesignColor.isPlain(text), `${name} (${theme}):  ${text}`).toBe(true)
          continue
        }
        // the chain ends at a real colour within 16 steps, without a cycle
        const seen = new Set([name])
        let current = alias
        for (let depth = 0; ; depth++) {
          expect(depth, `${name} alias chain`).toBeLessThan(16)
          expect(colors.has(current), `${name} (${theme}) aliases missing ${current}`).toBe(true)
          expect(seen.has(current), `${name} alias cycle`).toBe(false)
          seen.add(current)
          const next = /^\{(.+)\}$/.exec(themed(colors.get(current)!, theme))?.[1]
          if (!next) break
          current = next
        }
      }
    }
  })

  it("names a brand role apart from the `--ui-*` token it would clash with", () => {
    const colors = new Map(tokens.color.tokens.map((token) => [token.name, token]))
    expect(colors.get("brand-accent")?.usage).toMatch(/^`--spell-accent`/)
    expect(colors.get("accent")?.usage).toMatch(/^`--ui-accent`/)
    expect(colors.has("surface-warm")).toBe(true)
  })

  it("resolves the Spell theme's brand colours", () => {
    const colors = new Map(tokens.color.tokens.map((token) => [token.name, token.value]))
    expect(Object.fromEntries(colors)).toMatchObject({
      "violet-500": "#7b68e9",
      primary: "{violet}",
      surface: { light: "oklch(1 0 0)", dark: "{violet-925}" }
    })
    // computed:  color-mix() in light, an alias in dark
    expect(themed(colors.get("text-light")!, "light")).toMatch(/^#[0-9a-f]{6}$/)
  })

  it("writes shadows and plain families without var(), light-dark() or colour functions", () => {
    for (const token of tokens.shadow.tokens)
      for (const theme of ["light", "dark"]) expect(themed(token.value, theme)).toMatch(/^[0-9a-z #.,-]+$/)
    for (const key of ["spacing", "radius", "size", "motion", "zIndex", "breakpoint"] as const) {
      expect(tokens[key].tokens.length, key).toBeGreaterThan(0)
      expect(tokens[key].tokens.length, key).toBeLessThanOrEqual(60)
      for (const token of tokens[key].tokens) expect(token.value as string).toMatch(/^[A-Za-z0-9 #%(),./+_-]{1,200}$/)
    }
  })

  it("gives font stacks the format can read, and records where it came from", () => {
    for (const stack of Object.values(tokens.type.families)) {
      expect(stack.length).toBeLessThanOrEqual(200)
      expect(stack).not.toMatch(/[;{}<>\\()]/)
    }
    expect(tokens.meta).toMatchObject({
      source: "github",
      repo: "spell-app/spell-app",
      ref: "main@abc1234",
      package: "packages/ui"
    })
  })
})

////////////////
// ## Component cards
////////////////

describe("DesignExport.build() components", () => {
  it("has a card for every main tag, each with a README and a preview", () => {
    const mains = all.components.filter((tag) => tag.main).map((tag) => tag.tag)
    expect(result.families.map((family) => family.mainTag).toSorted(compare)).toEqual([...mains].toSorted(compare))
    for (const family of result.families) {
      expect(files.has(`components/${family.comp}/README.md`), family.comp).toBe(true)
      expect(files.has(`components/${family.comp}/preview.html`), family.comp).toBe(true)
    }
  })

  it("starts each README with its name and a one-sentence summary, under 64 KB", () => {
    for (const family of result.families) {
      const readme = files.get(`components/${family.comp}/README.md`)!
      expect(readme.startsWith(`# ${family.comp}\n\n`), family.comp).toBe(true)
      expect(readme.split("\n")[2], family.comp).toMatch(/[.!?]$/)
      expect(Buffer.byteLength(readme), family.comp).toBeLessThanOrEqual(64 * 1024)
    }
  })

  it("marks each preview on line 1, loads no script by URL, and stays under 256 KB", () => {
    for (const family of result.families) {
      const preview = files.get(`components/${family.comp}/preview.html`)!
      expect(preview.split("\n")[0], family.comp).toMatch(
        /^<!-- @dsCard group="[A-Za-z]+" height=\d+( subtitle="[^"]*")? -->$/
      )
      expect(preview, family.comp).not.toMatch(/<script[^>]*\ssrc=|<(iframe|frame|object|embed|portal|noscript)\b/i)
      expect(Buffer.byteLength(preview), family.comp).toBeLessThanOrEqual(256 * 1024)
      const height = Number(/height=(\d+)/.exec(preview)![1])
      expect(height).toBeGreaterThanOrEqual(40)
      expect(height).toBeLessThanOrEqual(4000)
    }
  })

  it("gives every tag a Props type and a tag-map entry in index.d.ts", () => {
    const declarations = files.get("components/index.d.ts")!
    for (const tag of all.components) {
      expect(declarations).toContain(`export type ${ElementManifests.pascal(tag.tag)}Props = {`)
      expect(declarations).toContain(`"${tag.tag}": HTMLElement & ${ElementManifests.pascal(tag.tag)}Props`)
    }
    expect(declarations).toContain('size?: "mini" | "tiny" | "small" | "medium" | "large" | "big" | "huge" | "massive"')
    expect(Buffer.byteLength(declarations)).toBeLessThanOrEqual(1.5 * 1024 * 1024)
  })

  it("writes a bare cover, the brand book and the index", () => {
    expect(files.get("components/Cover/preview.html")).toMatch(/^<!-- @dsCard height=(2[4-9]\d|3[0-5]\d|360) -->\n/)
    expect(files.has("components/Cover/README.md")).toBe(false)
    const readme = files.get("README.md")!
    expect(Buffer.byteLength(readme)).toBeLessThanOrEqual(200 * 1024)
    expect(readme).toMatch(/^# Spell\n/)
    expect(readme).toContain("components/bundle.js")
    expect(readme).toContain("## Not synced")
    for (const family of result.families) expect(readme).toContain(`(components/${family.comp}/README.md)`)
    expect(readme).not.toMatch(/\bsp-[a-z]/)
    const index = JSON.parse(files.get("design-system.json")!) as Record<string, unknown>
    expect(index).toMatchObject({ v: 3, layout: "files", title: "Spell", namespace: "SpellUI", libraries: [] })
    expect(files.has("components/bundle.js")).toBe(false)
  })
})

describe("DesignExport.build() brand cards", () => {
  it("puts every brand family in a Brand group, last, with its docs page's examples", () => {
    const brand = result.families.filter((family) => family.group === "Brand")
    expect(brand.map((family) => family.mainTag).toSorted(compare)).toEqual(
      BRAND_DATA.components
        .filter((tag) => tag.main)
        .map((tag) => tag.tag)
        .toSorted(compare)
    )
    expect(result.families.at(-1)!.group).toBe("Brand")
    const logo = files.get("components/BrandLogo/preview.html")!
    expect(logo).toContain("<ui-brand-logo")
    expect(files.get("README.md")).toContain("### Brand")
  })
})

////////////////
// ## Helpers
////////////////

/** A-Z order for `toSorted()`. */
function compare(a: string, b: string): number {
  return a.localeCompare(b)
}

/** A token value in `theme`:  its own entry, else the plain string. */
function themed(value: ThemedValue, theme: string): string {
  return typeof value === "string" ? value : (value[theme] ?? value.light!)
}
