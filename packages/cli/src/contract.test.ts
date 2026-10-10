import { mkdtempSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join, resolve } from "path"
import { pathToFileURL } from "url"
import { describe, test, expect } from "vite-plus/test"

import { P } from "$/parser"
import { buildTsx } from "$/spell/node/buildTsx"
import { SP } from "$/spell"
import { compiledFixture, fixtureImports, fixtureProjectNames } from "$/spell/test"
import { CLI } from "$/cli"

/**
 * The CORE CONTRACT:  every fixture project, compiled for each target, run headless as `spell run` runs it,
 * prints the SAME thing, line for line.
 * - What it prints is pinned in `__snapshots__/contract/<Project>.out.txt`.
 * - So a target's core is right when it prints what the snapshot says.
 *   - `js/solid` and `ts/solid` share `@spell/core` today.
 *   - Python's core (a later epic) must print the same.
 *   - What a core must HAVE is `SC.SpellCore` (`packages/core/src/spellCore.types.ts`).
 * - The snapshot catches a broken core method, which both targets would share.
 * - A fixture that imports another (`Klondike` imports `Cards`)
 *   runs with that one compiled for the same target, as its `@spell/project/<id>`.
 * - Each runs in a FAKE PAGE (linkedom, `RunSpec.dom`) that `start the game` draws into.
 *   What it drew is printed last, so drawing is compared too.
 * - `Math.random()` is seeded, so Solitaire deals the same cards every run.
 * - Changed on purpose:  `yarn vp test run src/contract.test.ts -u`, then read the diff.
 */
const TARGET_FILES: Record<string, string> = { "js/solid": ".mjs", "ts/solid": ".tsx" }

/**
 * What fixture `name` prints when its `target` code runs, as `spell run` would run it.
 * - `code`:  that code, unless given.
 */
async function printed(name: string, target: string, code = compiledFixture(name, target)): Promise<string> {
  const extension = TARGET_FILES[target]
  const folder = mkdtempSync(join(tmpdir(), "spell-contract-"))
  try {
    const projects = await importedProjects(name, target, folder)
    const { exitCode, output } = await CLI.runCode("run", name, code, { extension, projects, capture: true, dom: true })
    expect(exitCode, `${name} on ${target} exited ${exitCode}:\n${output}`).toBe(CLI.EXIT.OK)
    return output
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

/**
 * Each fixture `name` imports, and what THEY import, compiled for `target` into `folder`:  by project id, its file's
 * URL, as `CLI.runCode()` takes them.  TypeScript is built first (`buildTsx()`), as `runCode()` builds its own.
 */
async function importedProjects(
  name: string,
  target: string,
  folder: string,
  projects: Record<string, string> = {}
): Promise<Record<string, string>> {
  for (const [module, fixture] of Object.entries(fixtureImports(name))) {
    const projectId = decodeURI(module.slice(SP.SPELL_PROJECT_MODULE.length))
    if (projects[projectId]) continue
    let code = compiledFixture(fixture, target)
    if (TARGET_FILES[target] === ".tsx") code = await buildTsx(code, { filename: `${fixture}.compiled.tsx` })
    const file = join(folder, `${fixture}.compiled.mjs`)
    writeFileSync(file, code)
    projects[projectId] = pathToFileURL(file).href
    await importedProjects(fixture, target, folder, projects)
  }
  return projects
}

describe("the core contract:  every target prints the same", () => {
  test("every target has a file extension to run from", () => {
    expect(Object.keys(SP.TARGETS).sort()).toEqual(Object.keys(TARGET_FILES).sort())
  })

  for (const name of fixtureProjectNames()) {
    test(
      name,
      async () => {
        const [js, ts] = await Promise.all([printed(name, "js/solid"), printed(name, "ts/solid")])
        expect(ts.split("\n")).toEqual(js.split("\n"))
        await expect(js).toMatchFileSnapshot(resolve(import.meta.dirname, `__snapshots__/contract/${name}.out.txt`))
      },
      60_000
    )
  }
})

/**
 * `spellCore`'s names before epic `output-targets` P16, by their new ones:  a program compiled before then calls the
 * old ones, and nothing recompiles it.  See `deprecated.ts` in `$/core`.
 */
const OLD_NAMES: Record<string, string> = {
  positionOf: "itemOf",
  getItemAt: "getItemOf",
  setItemAt: "setItemOf",
  removeItemAt: "removeItemOf",
  removeItemsAt: "removeItemsOf",
  duplicateList: "duplicateCollection",
  mergeLists: "mergeCollections",
  mergeListsInto: "mergeCollectionsInto"
}

/**
 * Javascript as written before epic `output-targets` P19:  every `spellCore` helper called by name,
 * `spellCore.getItemAt(stock, -1)`, never a list's own method -- see `P.JSWriter.coreCall()`.
 */
class HelpersByName extends P.JSWriter {
  coreCall(): string | undefined {
    return undefined
  }
}

describe("a program compiled before P16, with spellCore's old names", () => {
  test("prints what it prints today", async () => {
    const name = "Solitaire"
    const helpersByName = compiledFixture(name, new HelpersByName())
    const before = helpersByName.replace(/\bspellCore\.(\w+)\(/g, (call, method: string) =>
      OLD_NAMES[method] ? `spellCore.${OLD_NAMES[method]}(` : call
    )
    // it calls the old names, or this test proves nothing
    for (const old of ["itemOf", "getItemOf", "duplicateCollection", "mergeCollections"]) {
      expect(before).toContain(`spellCore.${old}(`)
    }
    await expect(printed(name, "js/solid", before)).resolves.toEqual(await printed(name, "js/solid"))
  }, 60_000)
})

/**
 * A card table drawn as javascript compiled since epic `output-targets` P20 draws:
 * Solid's own `h()`, imported from `@spell/core`, in the page's spellings.
 * - `{{rank}}` is where each card's rank goes.
 */
const DRAWN_WITH_H = `
import { spellCore, Thing, List, App, h } from "@spell/core"
export class Card extends Thing {
  draw() { return h("td", { class: "card", colspan: "2" }, () => this.rank) }
}
export class Table extends App {
  draw() { return h("table", h("tr", () => spellCore.drawItems(this.cards))) }
}
const table = new Table()
table.cards = new List()
table.cards.add(new Card({ rank: "ace" }), new Card({ rank: "king" }))
table.start()
`

/** The same table, as javascript compiled before P20 draws it:  `spellCore.element()`, in React's spellings. */
const DRAWN_WITH_ELEMENT = `
import { spellCore, Thing, List, App } from "@spell/core"
export class Card extends Thing {
  draw() { return spellCore.element({ tag: "td", props: { className: "card", colSpan: "2" }, children: [() => this.rank] }) }
}
export class Table extends App {
  draw() {
    return spellCore.element({ tag: "table", children: [
      spellCore.element({ tag: "tr", children: [() => spellCore.drawItems(this.cards)] })
    ] })
  }
}
const table = new Table()
table.cards = new List()
table.cards.add(new Card({ rank: "ace" }), new Card({ rank: "king" }))
table.start()
`

describe("drawing with h() from @spell/core, as `spell run` runs it", () => {
  /** What `code` prints, run headless in a fake page:  ending with what it drew. */
  async function drawn(code: string): Promise<string> {
    const { exitCode, output } = await CLI.runCode("run", "Table", code, { capture: true, dom: true })
    expect(exitCode, output).toBe(CLI.EXIT.OK)
    return output.trim()
  }

  test("draws;  a program compiled before P20, with the deprecated `spellCore.element()`, draws the same", async () => {
    const [withH, withElement] = await Promise.all([drawn(DRAWN_WITH_H), drawn(DRAWN_WITH_ELEMENT)])
    expect(withH).toBe(
      `<div id="spell-app-root"><table><tr>` +
        `<td class="card" colspan="2">ace</td><td class="card" colspan="2">king</td>` +
        `</tr></table></div>`
    )
    expect(withElement).toBe(withH)
  }, 60_000)
})
