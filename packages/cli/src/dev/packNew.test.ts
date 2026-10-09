import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { dirname, join } from "path"
import { afterAll, beforeEach, describe, expect, test } from "vite-plus/test"

import { CLI } from "$/cli"

/**
 * A throwaway checkout per test:  copies of the real root files `pack new` edits (never the real ones), and a small
 * commands page.  `build: false` throughout:  `packBuild.test.ts` builds.
 */
const TEMP = realpathSync(mkdtempSync(join(tmpdir(), "pack-new-")))
afterAll(() => rmSync(TEMP, { recursive: true, force: true }))

/** Root files `wirePack()` edits, copied from this checkout. */
const ROOT_FILES = [
  "package.json",
  "tsconfig.base.json",
  "vitest.config.ts",
  "vite.lint.ts",
  ".gitattributes",
  "packages/cli/src/dev/mergeMain.ts"
]

/** The commands page, cut down:  a check row naming `brand`'s scripts, and the pack rows. */
const COMMANDS = {
  families: [
    {
      id: "checks",
      rows: [
        { op: "Type-check a package", yarn: { mark: "same", names: ["root ts", "brand ts", "ui ts"] } },
        { op: "Build a pack", id: "pack-build", cli: { mark: "same", names: ["spell dev pack"] }, yarn: { names: [] } },
        { op: "Check a pack", id: "pack-check", cli: { mark: "same", names: ["spell dev pack"] }, yarn: { names: [] } }
      ]
    }
  ]
}

/** The commands page's path in a checkout. */
const COMMANDS_JSON = "guides/dev/commands/commands.json"

let root = ""
let count = 0
beforeEach(() => {
  root = join(TEMP, `checkout-${++count}`)
  for (const file of ROOT_FILES) {
    mkdirSync(dirname(join(root, file)), { recursive: true })
    cpSync(join(CLI.REPO_ROOT, file), join(root, file))
  }
  mkdirSync(dirname(join(root, COMMANDS_JSON)), { recursive: true })
  writeFileSync(join(root, COMMANDS_JSON), `${JSON.stringify(COMMANDS, null, 2)}\n`)
})

/** `file`'s text in the throwaway checkout. */
function read(file: string): string {
  return readFileSync(join(root, file), "utf8")
}

/** Every root file's text, to compare before and after. */
function rootTexts(): string[] {
  return [...ROOT_FILES, COMMANDS_JSON].map(read)
}

describe("CLI.newPack()", () => {
  test("writes the package from the templates, every token filled in", async () => {
    const report = await CLI.newPack(root, "epics", { prefix: "epic-", build: false })
    expect(report.created.sort()).toEqual(
      [
        ".gitignore",
        "AGENTS.md",
        "CLAUDE.md",
        "README.md",
        "components/index.ts",
        "package.json",
        "src/index.ts",
        "src/pack.test.ts",
        "tsconfig.json",
        "vite.config.ts",
        "vitest.config.ts"
      ].map((file) => `packages/epics/${file}`)
    )
    const pack = JSON.parse(read("packages/epics/package.json"))
    expect(pack).toMatchObject({
      name: "@spell-app/epics",
      spellPack: { prefix: "epic-" },
      scripts: {
        "pack:build": "node ../cli/bin/spell.mjs dev pack build epics",
        "pack:check": "node ../cli/bin/spell.mjs dev pack check epics"
      }
    })
    expect(pack.devDependencies["solid-js"]).toBe(JSON.parse(read("package.json")).resolutions["solid-js"])
    expect(read("packages/epics/vitest.config.ts")).toContain("export function epicsProjects(")
    expect(read("packages/epics/AGENTS.md")).toContain("`spell dev pack build epics`")
    for (const file of report.created) expect(read(file)).not.toMatch(/__(pack|packCamel|prefix|solid)__/)
  })

  test("wires the pack into the checkout:  workspace, aliases, vitest, lint, attributes, generator, commands page", async () => {
    const report = await CLI.newPack(root, "my-pack", { prefix: "mp-", build: false })
    expect(report.updated.map((line) => line.split(" ")[0])).toEqual([
      "package.json",
      "tsconfig.base.json",
      "vitest.config.ts",
      "vite.lint.ts",
      ".gitattributes",
      "packages/cli/src/dev/mergeMain.ts",
      COMMANDS_JSON
    ])
    const json = JSON.parse(read("package.json"))
    expect(json.workspaces.at(-1)).toBe("packages/my-pack")
    expect(json.pageServer.watch.at(-1)).toBe("packages/my-pack/pack")
    expect(read("tsconfig.base.json")).toMatch(
      // its own block after the last alias, whichever package that is (the real file grows)
      /\],\n\n {6}\/\/ ## `my-pack`.*\n.*\n {6}"\$\/my-pack": \["\.\/packages\/my-pack\/src\/index\.ts"\],/
    )
    expect(read("tsconfig.base.json")).toContain(`"$/my-pack/components/*": ["./packages/my-pack/components/*"]\n    }`)
    const vitest = read("vitest.config.ts")
    expect(vitest).toContain(
      `import { myPackProjects } from "./packages/my-pack/vitest.config.ts"\nimport { uiProjects }`
    )
    expect(vitest).toMatch(
      /,\n {2}"my-pack": myPackProjects\(\{ prefix: "my-pack:", root: resolve\(PACKAGES_DIR, "my-pack"\) \}\)\n\}/
    )
    expect(vitest).toContain(" * - `my-pack`:  a component pack (`spell dev pack`)")
    const lint = read("vite.lint.ts")
    expect(lint).toMatch(
      // last in the list, whatever came before it (the real file grows)
      /",\n {2}\/\/ `my-pack`'s component pack.*\n {2}"packages\/my-pack\/pack"\n\]/
    )
    expect(lint).toMatch(/",\n {4}"\*\*\/packages\/my-pack\/pack\/\*\*"\n {2}\]/)
    expect(read(".gitattributes")).toMatch(
      /\n# my-pack:.*\npackages\/my-pack\/pack\/\*\* +linguist-generated merge=binary -diff\n$/
    )
    const generator = /^ *\{ name: "my-pack pack",.*$/m.exec(read("packages/cli/src/dev/mergeMain.ts"))![0]
    const yarnLock = /^ *\{ name: "yarn\.lock",.*$/m.exec(read("packages/cli/src/dev/mergeMain.ts"))![0]
    expect(generator.indexOf("outputs:")).toBe(yarnLock.indexOf("outputs:"))
    expect(generator).toContain(`run: ["yarn", "pack:build"] }`)
    const rows = JSON.parse(read(COMMANDS_JSON)).families[0].rows
    expect(rows.map((row: { yarn: { names: string[] } }) => row.yarn.names)).toEqual([
      ["root ts", "brand ts", "my-pack ts", "ui ts"],
      ["my-pack pack:build"],
      ["my-pack pack:check"]
    ])
  })

  test("is IDEMPOTENT:  a second run creates nothing and changes nothing", async () => {
    await CLI.newPack(root, "epics", { prefix: "epic-", build: false })
    const before = rootTexts()
    const again = await CLI.newPack(root, "epics", { build: false })
    expect(again.created).toEqual([])
    expect(again.updated).toEqual([])
    expect(again.skipped).toContain("packages/epics/package.json")
    expect(rootTexts()).toEqual(before)
  })

  test("on a folder with files already:  adds what's missing, keeps the rest, lists what it skipped", async () => {
    const dir = join(root, "packages", "epics")
    mkdirSync(dir, { recursive: true })
    writeFileSync(join(dir, "README.md"), "mine\n")
    writeFileSync(join(dir, "package.json"), JSON.stringify({ name: "@spell-app/epics", scripts: { ts: "mine" } }))
    const report = await CLI.newPack(root, "epics", { prefix: "epic-", build: false })
    expect(report.skipped).toContain("packages/epics/README.md")
    expect(read("packages/epics/README.md")).toBe("mine\n")
    expect(report.updated[0]).toMatch(/^packages\/epics\/package\.json \(version, .*scripts\.pack:build.*spellPack\)$/)
    const pack = JSON.parse(read("packages/epics/package.json"))
    expect(pack.scripts.ts).toBe("mine")
    expect(pack.scripts["pack:check"]).toBe("node ../cli/bin/spell.mjs dev pack check epics")
    expect(pack.spellPack).toEqual({ prefix: "epic-" })
  })

  test("refuses a bad name, a core package, a bad prefix, or another prefix than the pack's", async () => {
    await expect(CLI.newPack(root, "Epics", { build: false })).rejects.toThrow(/isn't a package name/)
    await expect(CLI.newPack(root, "ui", { build: false })).rejects.toThrow(/one of the repo's own packages/)
    await expect(CLI.newPack(root, "epics", { prefix: "ui-", build: false })).rejects.toThrow(/isn't a tag prefix/)
    await expect(CLI.newPack(root, "epics", { prefix: "epic", build: false })).rejects.toThrow(/isn't a tag prefix/)
    await CLI.newPack(root, "epics", { prefix: "epic-", build: false })
    await expect(CLI.newPack(root, "epics", { prefix: "e-", build: false })).rejects.toThrow(/prefix 'epic-'/)
  })

  test("defaults the prefix to `<name>-`", async () => {
    await CLI.newPack(root, "cards", { build: false })
    expect(CLI.readPack(root, "cards").prefix).toBe("cards-")
  })
})

describe("CLI.newElement()", () => {
  test("writes one family like brand's, and exports it from the components barrel", async () => {
    await CLI.newPack(root, "epics", { prefix: "epic-", build: false })
    const report = await CLI.newElement(root, "epics", "epic-page-header", { build: false })
    const family = "packages/epics/components/epic-page-header"
    expect(report.created.sort()).toEqual(
      ["EpicPageHeader.css", "EpicPageHeader.en.ts", "EpicPageHeader.test.tsx", "EpicPageHeader.tsx", "index.ts"].map(
        (file) => `${family}/${file}`
      )
    )
    expect(report.updated).toEqual(["packages/epics/components/index.ts (exports epic-page-header)"])
    expect(read(`${family}/EpicPageHeader.tsx`)).toContain(
      "export class EpicPageHeader extends E.UIComponent<typeof epicPageHeaderVocabulary>"
    )
    expect(read(`${family}/EpicPageHeader.tsx`)).toContain(
      '@E.proto static styleSheets = { "epic-page-header": pageHeaderCSS }'
    )
    expect(read(`${family}/EpicPageHeader.en.ts`)).toMatch(
      /export const epicPageHeaderVocabulary = \{\n {2}tag: "epic-page-header",[\s\S]*noun: "page-header",/
    )
    expect(read(`${family}/EpicPageHeader.css`)).toContain("--_epic-page-header-gap: var(--epic-page-header-gap")
    expect(read(`${family}/EpicPageHeader.test.tsx`)).toContain(`import "$/epics/components/epic-page-header"`)
    const barrel = read("packages/epics/components/index.ts")
    expect(barrel).not.toContain("export {}")
    expect(barrel.endsWith(`*/\nexport * from "./epic-page-header"\n`)).toBe(true)
  })

  test("is idempotent, and adds a second family after the first", async () => {
    await CLI.newPack(root, "epics", { prefix: "epic-", build: false })
    await CLI.newElement(root, "epics", "epic-page", { build: false })
    const again = await CLI.newElement(root, "epics", "epic-page", { build: false })
    expect(again.created).toEqual([])
    expect(again.updated).toEqual([])
    await CLI.newElement(root, "epics", "epic-card", { build: false })
    expect(read("packages/epics/components/index.ts")).toMatch(
      /export \* from "\.\/epic-page"\nexport \* from "\.\/epic-card"\n$/
    )
  })

  test("refuses a tag without the pack's prefix, and a package that isn't a pack", async () => {
    await CLI.newPack(root, "epics", { prefix: "epic-", build: false })
    await expect(CLI.newElement(root, "epics", "ui-page", { build: false })).rejects.toThrow(/starting 'epic-'/)
    await expect(CLI.newElement(root, "epics", "epic-", { build: false })).rejects.toThrow(/isn't a tag/)
    await expect(CLI.newElement(root, "nope", "nope-x", { build: false })).rejects.toThrow(/isn't a component pack/)
    expect(existsSync(join(root, "packages", "epics", "components", "ui-page"))).toBe(false)
  })
})

describe("CLI.addToList()", () => {
  test("adds to the end of a nested list, with a comma, indented as its last item;  skips strings and comments", () => {
    const text = `const a = {\n  b: "}", // ]\n  list: [\n    "x" /* ] */\n  ]\n}\n`
    expect(CLI.addToList(text, ["list: ["], [`"y"`])).toBe(
      `const a = {\n  b: "}", // ]\n  list: [\n    "x" /* ] */,\n    "y"\n  ]\n}\n`
    )
  })
})
