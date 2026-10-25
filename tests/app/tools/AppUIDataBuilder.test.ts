import { existsSync, readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, test } from "vite-plus/test"

import { keepingCommentsIn } from "spell/util/node/json5"
import { SiteDataBuilder } from "spell-ui/tools/SiteDataBuilder"

import { AppUIDataBuilder } from "spell-app/app/tools/AppUIDataBuilder"

/** The pages read from a vocabulary, not a `file`:  the component file whose banner names the page. */
const VOCABULARY_FAMILY_FILES = {
  "spell-viewer": "src/app/components/spell-viewer/SpellViewer.tsx",
  "spell-editor": "src/app/components/spell-editor/SpellEditor.tsx",
  "spell-code": "src/app/components/spell-code/SpellCode.tsx",
  "spell-markdown": "src/app/components/spell-markdown/SpellMarkdown.tsx",
  "spell-element": "src/app/runner/SpellElement.tsx"
}

/** One builder, one build, for every test:  it reads every `.tsx` file of the app. */
const BUILDER = new AppUIDataBuilder()
const DATA = await BUILDER.build()

describe("AppUIDataBuilder.build()", () => {
  test("components.json5 is up to date:  run `yarn site:data` after changing what it reads", () => {
    expect(readFileSync(BUILDER.dataFile, "utf8")).toBe(
      keepingCommentsIn(BUILDER.dataFile, SiteDataBuilder.stringify(DATA))
    )
  })

  test("search.json5 is up to date with the pages' sections", () => {
    expect(readFileSync(BUILDER.searchFile, "utf8")).toBe(keepingCommentsIn(BUILDER.searchFile, BUILDER.searchText()))
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
    expect(DATA.components.find((tag) => tag.tag === "spell-viewer")).toMatchObject({
      name: "<spell-viewer>",
      topics: ["web components"],
      href: "spell-viewer.html"
    })
  })

  test("says where the app draws a component", () => {
    expect(DATA.components.find((tag) => tag.tag === "Notice")?.usedIn).toEqual([
      { name: "index", file: "src/app/index.tsx" }
    ])
  })
})
