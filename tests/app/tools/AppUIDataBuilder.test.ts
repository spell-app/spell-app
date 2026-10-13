import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, test } from "vite-plus/test"

import { SiteDataBuilder } from "$/ui/tools/SiteDataBuilder"

import { AppUIDataBuilder } from "../../../packages/app/tools/AppUIDataBuilder.ts"

/** The pages read from a vocabulary, not a `file`:  the component file whose banner names the page. */
const VOCABULARY_FAMILY_FILES = {
  "spell-app": "components/spell-app/SpellApp.tsx",
  "spell-editor": "components/spell-editor/SpellEditor.tsx",
  "spell-element": "src/runner/SpellElement.tsx"
}

/** One builder, one build, for every test:  it reads every `.tsx` file of the app. */
const BUILDER = new AppUIDataBuilder()
const DATA = await BUILDER.build()

describe("AppUIDataBuilder.build()", () => {
  test("components.json is up to date:  run `yarn site:data` in packages/app after changing what it reads", () => {
    expect(readFileSync(BUILDER.dataFile, "utf8")).toBe(SiteDataBuilder.stringify(DATA))
  })

  test("search.json is up to date with the pages' sections", () => {
    expect(readFileSync(BUILDER.searchFile, "utf8")).toBe(BUILDER.searchText())
  })

  test("EVERY page it lists is there, in the set's folder", () => {
    const missing = Object.keys(DATA.families)
      .map((family) => `${family}.html`)
      .filter((page) => !existsSync(path.join(BUILDER.dataFolder, "..", page)))
    expect(missing).toEqual([])
  })

  test("the set's home links EVERY page", () => {
    const home = readFileSync(path.join(BUILDER.dataFolder, "..", "index.html"), "utf8")
    const unlinked = Object.keys(DATA.families).filter((family) => !home.includes(`href="${family}.html"`))
    expect(unlinked).toEqual([])
  })

  test("EVERY page's component points at its page, in its banner", () => {
    const files: Record<string, string | undefined> = {
      ...Object.fromEntries(Object.entries(BUILDER.pages.families).map(([family, seed]) => [family, seed.file])),
      ...VOCABULARY_FAMILY_FILES
    }
    const silent = Object.entries(files).filter(
      ([family, file]) => !file || !readFileSync(path.join(BUILDER.root, file), "utf8").includes(`docs/${family}.html`)
    )
    expect(silent.map(([family]) => family)).toEqual([])
  })

  test("files each tag under its page's group, and links a sub-component to its header there", () => {
    expect(DATA.components.find((tag) => tag.tag === "SplitPane")).toMatchObject({
      folder: "SplitPanel",
      mainTag: "SplitPanel",
      main: false,
      topics: ["shell"],
      href: "SplitPanel.html#SplitPane"
    })
    expect(DATA.components.find((tag) => tag.tag === "spell-app")).toMatchObject({
      name: "<spell-app>",
      topics: ["web components"],
      href: "spell-app.html"
    })
  })

  test("says where the app draws a component", () => {
    expect(DATA.components.find((tag) => tag.tag === "Notice")?.usedIn).toEqual([
      { name: "index", file: "packages/app/src/index.tsx" }
    ])
  })
})
