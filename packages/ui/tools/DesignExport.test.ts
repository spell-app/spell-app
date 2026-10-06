import { readFileSync } from "node:fs"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import { beforeAll, describe, expect, it } from "vite-plus/test"

import { DesignBrand } from "./DesignBrand.ts"
import { DesignColor } from "./DesignColor.ts"
import { DesignExport } from "./DesignExport.ts"
import { DesignTokens } from "./DesignTokens.ts"
import { ElementManifests } from "./ElementManifests.ts"
import type { SiteDataFile } from "../src/docs-components/docs-components.types.ts"
import type { DesignExportResult, DesignTokensFile, ThemedValue } from "./tools.types.ts"

/**
 * The claude.ai design-system export (`yarn design:build`) keeps to the format's rules
 * (`artifact-type/reference/format.md` of the Design System type), and the editor manifests `yarn site:data` writes
 * are current;  the brand's `<ui-brand-*>` cards come in as a "Brand" group (epic `claude-design`, P11).
 */

const UI = fileURLToPath(new URL("../", import.meta.url))
const data = JSON.parse(readFileSync(join(UI, "site/_data/components.json"), "utf8")) as SiteDataFile
const BRAND = join(UI, "../brand")
const brandData = JSON.parse(readFileSync(join(BRAND, "_data/components.json"), "utf8")) as SiteDataFile
/** Spell UI's site data with the brand's merged in, as the export sees it */
let all: SiteDataFile
let result: DesignExportResult
let files: Map<string, string>
let tokens: DesignTokensFile

beforeAll(() => {
  const exporter = new DesignExport({ data, git: { branch: "main", sha: "abc1234", user: "Test" }, now: new Date(0) })
  result = exporter.build()
  all = exporter.allData
  files = new Map(result.files.map((file) => [file.path, file.text]))
  tokens = JSON.parse(files.get("tokens.json")!) as DesignTokensFile
}, 60_000)

describe("design export:  tokens.json", () => {
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
    expect(colors.get("violet-500")).toBe("#7b68e9")
    expect(colors.get("primary")).toBe("{violet}")
    expect(colors.get("surface")).toEqual({ light: "oklch(1 0 0)", dark: "{violet-925}" })
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

describe("design export:  components", () => {
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

describe("design export:  the brand's cards", () => {
  it("puts every brand family in a Brand group, last, with its docs page's examples", () => {
    const brand = result.families.filter((family) => family.group === "Brand")
    expect(brand.map((family) => family.mainTag).toSorted(compare)).toEqual(
      brandData.components
        .filter((tag) => tag.main)
        .map((tag) => tag.tag)
        .toSorted(compare)
    )
    expect(result.families.at(-1)!.group).toBe("Brand")
    const logo = files.get("components/BrandLogo/preview.html")!
    expect(logo).toContain("<ui-brand-logo")
    expect(files.get("README.md")).toContain("### Brand")
  })

  it("reads a docs page's examples from its Examples tab, titled by their sections, without comments' styles", () => {
    const page = `<!-- a <style> named in a comment -->
<style>.stage { position: relative }</style>
<ui-tabs><ui-tab value="examples" label="Examples">
<ui-section id="a" header="Types"><ui-section id="b" header="Phone">
<ui-docs-example description="x">
  <ui-brand-phone></ui-brand-phone>
</ui-docs-example>
</ui-section></ui-section>
</ui-tab><ui-tab value="usage" label="Usage"><ui-docs-example><b>not this</b></ui-docs-example></ui-tab></ui-tabs>`
    const brand = new DesignBrand({ root: "/nowhere", data: brandData })
    ;(brand as unknown as { pages: Map<string, string> }).pages.set("ui-brand-phone", page)
    expect(brand.examples("ui-brand-phone")).toEqual([
      { title: "Phone", markup: "<ui-brand-phone></ui-brand-phone>", source: "brand/components/ui-brand-phone.html" }
    ])
    expect(brand.style("ui-brand-phone")).toBe(".stage { position: relative }")
  })

  it("leave the brand's manifests current (else `yarn site:data` in packages/brand)", () => {
    const manifests = new ElementManifests({ data: brandData, packageFolder: BRAND, componentsPath: "components" })
    const [[elements], [custom]] = manifests.outputs(join(BRAND, "_data"))
    const written = JSON.parse(readFileSync(elements!, "utf8")) as { modules: unknown[] }
    expect(written.modules).toEqual(manifests.customElements().modules)
    expect(readFileSync(custom!, "utf8")).toBe(JSON.stringify(manifests.htmlCustomData(), null, 2) + "\n")
  })
})

describe("design export:  editor manifests", () => {
  it("are current (else run `yarn site:data`)", () => {
    for (const [file, text] of new ElementManifests({ data, packageFolder: UI }).outputs(join(UI, "site/_data")))
      expect(readFileSync(file, "utf8") === text, file).toBe(true)
  })

  it("describe every component tag as a Custom Elements Manifest", () => {
    const manifest = new ElementManifests({ data, packageFolder: UI }).customElements()
    expect(manifest.schemaVersion).toMatch(/^2\./)
    const definitions = manifest.modules.flatMap((module) =>
      module.exports.filter((entry) => entry.kind === "custom-element-definition").map((entry) => String(entry.name))
    )
    expect(definitions.toSorted(compare)).toEqual(data.components.map((tag) => tag.tag).toSorted(compare))
    for (const module of manifest.modules) {
      expect(module.kind).toBe("javascript-module")
      for (const declaration of module.declarations) {
        expect(declaration).toMatchObject({ kind: "class", customElement: true })
        expect(declaration.tagName).toMatch(/^ui-[a-z-]+$/)
        expect(declaration.name).toMatch(/^UI[A-Za-z]+$/)
        for (const key of ["attributes", "events", "slots", "cssParts", "cssStates"])
          expect(Array.isArray(declaration[key]), key).toBe(true)
      }
    }
    const button = manifest.modules
      .flatMap((module) => module.declarations)
      .find((entry) => entry.tagName === "ui-button")!
    expect(button.attributes).toContainEqual(expect.objectContaining({ name: "primary", type: { text: "boolean" } }))
    expect(button.events).toContainEqual(expect.objectContaining({ name: "ui-toggle" }))
  })

  it("give VS Code every tag, with values for value sets", () => {
    const custom = new ElementManifests({ data, packageFolder: UI }).htmlCustomData()
    expect(custom.tags.map((tag) => tag.name).toSorted(compare)).toEqual(
      data.components.map((tag) => tag.tag).toSorted(compare)
    )
    const size = custom.tags
      .find((tag) => tag.name === "ui-button")!
      .attributes.find((attribute) => attribute.name === "size")!
    expect(size.values?.map((value) => value.name)).toContain("small")
  })
})

describe("DesignColor", () => {
  it("parses and writes hex", () => {
    expect(DesignColor.toHex(DesignColor.parse("#7b68e9")!)).toBe("#7b68e9")
    expect(DesignColor.toHex(DesignColor.parse("rgb(200 206 231 / 0.16)")!)).toBe("#c8cee729")
    expect(DesignColor.toHex(DesignColor.parse("transparent")!)).toBe("#00000000")
  })

  it("works out relative colours and mixes", () => {
    // same channels:  the colour itself, with a new alpha
    expect(DesignColor.toHex(DesignColor.parse("oklch(from #7b68e9 l c h / 0.5)")!)).toBe("#7b68e980")
    const darker = DesignColor.parse("oklch(from #7b68e9 calc(l - 0.1) c h)")!
    expect(darker.l).toBeCloseTo(DesignColor.parse("#7b68e9")!.l - 0.1, 5)
    expect(DesignColor.parse("oklch(from #7b68e9 min(l, 0.3) c h)")!.l).toBeCloseTo(0.3, 5)
    expect(DesignColor.toHex(DesignColor.parse("color-mix(in oklab, #ffffff 50%, #ffffff)")!)).toBe("#ffffff")
    expect(DesignColor.parse("color-mix(in oklab, currentColor 40%, transparent)")).toBeUndefined()
  })

  it("tells plain colours from the rest", () => {
    expect(DesignColor.isPlain("oklch(0.57 0.21 27)")).toBe(true)
    expect(DesignColor.isPlain("rgb(43 47 63 / 0.06)")).toBe(true)
    expect(DesignColor.isPlain("red")).toBe(false)
    expect(DesignColor.isPlain("oklch(from var(--x) l c h)")).toBe(false)
  })
})

describe("DesignTokens", () => {
  it("reads only top-level :root declarations, inside @layer", () => {
    const css =
      "@layer a { :root { --x: 1px; --y: light-dark(#fff, #000) } } @media (x) { :root { --z: 2 } } .a { --w: 3 }"
    expect(DesignTokens.rootDeclarations(css)).toEqual([
      { name: "--x", value: "1px" },
      { name: "--y", value: "light-dark(#fff, #000)" }
    ])
  })

  it("picks a theme's branch of light-dark()", () => {
    expect(DesignTokens.pickTheme("light-dark(var(--a), var(--b))", "dark")).toBe("var(--b)")
    expect(DesignTokens.pickAll("0 1px light-dark(#000, #fff), 0 2px light-dark(red, blue)", "light")).toBe(
      "0 1px #000, 0 2px red"
    )
  })
})

/** A-Z order for `toSorted()`. */
function compare(a: string, b: string): number {
  return a.localeCompare(b)
}

/** A token value in `theme`:  its own entry, else the plain string. */
function themed(value: ThemedValue, theme: string): string {
  return typeof value === "string" ? value : (value[theme] ?? value.light!)
}
