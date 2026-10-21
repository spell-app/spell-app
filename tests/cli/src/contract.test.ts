import { spawnSync } from "child_process"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join, resolve } from "path"
import { pathToFileURL } from "url"
import { describe, test, expect } from "vite-plus/test"

import { P } from "spell-lang/parser"
import { PY } from "spell-lang/py"
import { buildTsx } from "spell-lang/spell/node/buildTsx"
import { SP } from "spell-lang/spell"
import { PYTHON_FIXTURES, compiledFixture, fixtureImports, fixtureProjectNames } from "spell-lang/spell/test"
import { CLI } from "$/cli"

/**
 * The CORE CONTRACT:  every fixture project, compiled for each target, run headless as `spell run` runs it,
 * prints the SAME thing, line for line.
 * - What it prints is pinned in `__snapshots__/contract/<project>.out.txt`.
 * - So a target's core is right when it prints what the snapshot says.
 *   - `js/solid` and `ts/solid` share `@spell/core` today.
 *   - Python's core, `spell_core` (`packages/py/core`), prints the same
 *     for the fixtures its writer writes so far, `PYTHON_FIXTURES` (epic `python-target`).
 *   - What a core must HAVE is `SC.Core` (`packages/core/src/core.types.ts`).
 * - The snapshot catches a broken core method, which both targets would share.
 * - A fixture that imports another (`Klondike` imports `Cards`)
 *   runs with that one compiled for the same target, as its `@spell/project/<id>`.
 * - Each runs in a FAKE PAGE (linkedom, `RunSpec.dom`) that `start the game` draws into.
 *   What it drew is printed last, so drawing is compared too.
 * - Its random numbers start from seed 1 (`core.seedRandom()`),
 *   so Solitaire deals the same cards every run, on every target.
 * - Only STDOUT is compared:  the program's own output, as data.
 *   A dump of a thing (`print the card`) goes to stderr, as do warnings (epic `python-target`, Q17):
 *   how a thing looks dumped is each target's own business.
 * - Changed on purpose:  `yarn vp test run src/contract.test.ts -u`, then read the diff.
 */
const TARGET_FILES: Record<string, string> = { "js/solid": ".mjs", "ts/solid": ".tsx", py: ".py" }

/** The seed every contract run starts its random numbers from. */
const CONTRACT_SEED = 1

/**
 * What fixture `name` prints to stdout when its `target` code runs, as `spell run --seed 1` would run it.
 * - `code`:  that code, unless given.
 */
async function printed(name: string, target: string, code = compiledFixture(name, target)): Promise<string> {
  const extension = TARGET_FILES[target]
  const folder = mkdtempSync(join(tmpdir(), "spell-contract-"))
  try {
    const projects = await importedProjects(name, target, folder)
    const { exitCode, output, stdout } = await CLI.runCode("run", name, code, {
      extension,
      projects,
      capture: true,
      dom: true,
      seed: CONTRACT_SEED,
      // only what's printed matters:  Python needn't wait at a pause (javascript's run as they are)
      pauses: false
    })
    expect(exitCode, `${name} on ${target} exited ${exitCode}:\n${output}`).toBe(CLI.EXIT.OK)
    return stdout
  } finally {
    rmSync(folder, { recursive: true, force: true })
  }
}

/**
 * Each fixture `name` imports, and what THEY import, compiled for `target` into `folder`:
 * by project id, its file's URL, as `CLI.runCode()` takes them.
 * - TypeScript is built first (`buildTsx()`), as `runCode()` builds its own.
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
    if (TARGET_FILES[target] === ".tsx") code = await buildTsx(code, { filename: `${fixture}.spell.tsx` })
    // Python imports another project as a module of its name, `from cards import Card`
    const isPython = TARGET_FILES[target] === ".py"
    const file = join(folder, isPython ? `${PY.PyWriter.projectModule(module)}.py` : `${fixture}.spell.mjs`)
    writeFileSync(file, code)
    projects[projectId] = pathToFileURL(file).href
    await importedProjects(fixture, target, folder, projects)
  }
  return projects
}

/** Every target that runs a program:  all but a library (`ts/lib`), which keeps only the classes. */
const RUNNING_TARGETS = Object.values(SP.TARGETS)
  .filter((target) => target.can.run !== false)
  .map((target) => target.name)

describe("the core contract:  every target prints the same", () => {
  test("every target has a file extension to run from", () => {
    expect([...RUNNING_TARGETS].sort()).toEqual(Object.keys(TARGET_FILES).sort())
  })

  for (const name of fixtureProjectNames()) {
    test(
      name,
      async () => {
        // Python only where its writer writes the fixture so far -- see `PYTHON_FIXTURES`
        const targets = RUNNING_TARGETS.filter((target) => !target.startsWith("py") || PYTHON_FIXTURES.has(name))
        const [js, ...others] = await Promise.all(targets.map((target) => printed(name, target)))
        for (const [index, other] of others.entries()) {
          expect(other!.split("\n"), `${name} on ${targets[index + 1]}`).toEqual(js!.split("\n"))
        }
        await expect(js).toMatchFileSnapshot(resolve(import.meta.dirname, `__snapshots__/contract/${name}.out.txt`))
      },
      60_000
    )
  }
})

/**
 * `core`'s names before epic `output-targets` P16, by their new ones:
 * a program compiled before then calls the old ones, and nothing recompiles it.  See `deprecated.ts` in `$/core`.
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
 * Javascript as written before epic `output-targets` P19:  every `core` helper called by name,
 * `core.getItemAt(stock, -1)`, never a list's own method -- see `P.JSWriter.coreCall()`.
 */
class HelpersByName extends P.JSWriter {
  coreCall(): string | undefined {
    return undefined
  }
}

describe("a program compiled before P16, with core's old names", () => {
  test("prints what it prints today", async () => {
    const name = "Solitaire"
    const helpersByName = compiledFixture(name, new HelpersByName())
    const before = helpersByName.replace(/\bcore\.(\w+)\(/g, (call, method: string) =>
      OLD_NAMES[method] ? `core.${OLD_NAMES[method]}(` : call
    )
    // it calls the old names, or this test proves nothing
    for (const old of ["itemOf", "getItemOf", "duplicateCollection", "mergeCollections"]) {
      expect(before).toContain(`core.${old}(`)
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
import { core, Thing, List, App, h } from "@spell/core"
export class Card extends Thing {
  draw() { return h("td", { class: "card", colspan: "2" }, () => this.rank) }
}
export class Table extends App {
  draw() { return h("table", h("tr", () => core.drawItems(this.cards))) }
}
const table = new Table()
table.cards = new List()
table.cards.add(new Card({ rank: "ace" }), new Card({ rank: "king" }))
table.start()
`

describe("drawing with h() from @spell/core, as `spell run` runs it", () => {
  /** What `code` prints to stdout, run headless in a fake page:  ending with what it drew. */
  async function drawn(code: string): Promise<string> {
    const { exitCode, output, stdout } = await CLI.runCode("run", "Table", code, { capture: true, dom: true })
    expect(exitCode, output).toBe(CLI.EXIT.OK)
    return stdout.trim()
  }

  test("draws a card table:  a cell per card, in the page's spellings", async () => {
    expect(await drawn(DRAWN_WITH_H)).toBe(
      `<div id="spell-app-root"><table><tr>` +
        `<td class="card" colspan="2">ace</td><td class="card" colspan="2">king</td>` +
        `</tr></table></div>`
    )
  }, 60_000)
})

/** The fixtures that are games:  a `deck` of cards, and a `card-click` handler. */
const GAMES = ["solitaire", "klondike", "outline-solitaire"]

/**
 * Where the board a run draws last starts, in its output's `lines`:  the last `<div id="spell-app-root">`.
 * - The board is the rest:  text drawn in it may have lines of its own, e.g. Klondike's `<markdown>` rules.
 */
function boardAt(lines: string[]): number {
  for (let index = lines.length - 1; index >= 0; index--) {
    if (lines[index]!.startsWith('<div id="spell-app-root">')) return index
  }
  return -1
}

/** `spell_core`'s uv project, which runs the player. */
const SPELL_CORE = resolve(import.meta.dirname, "../../../../spell-lang/py/core")
/** The player:  `spell_core`'s test script, in the repo's `tests/py/core/tests/`. */
const PLAYER = resolve(import.meta.dirname, "../../../../spell-lang/tests/py/core/tests/patches_in_a_game.py")

/**
 * Only what changed, sent click by click, gives the same state as sending it whole (epic `python-target` P18):
 * each game played on the `py` target, seeded, 300 clicks, a mirror reading each `patch()`.
 * - The player:  `patches_in_a_game.py`, in `spell_core`'s tests (`tests/py/core/tests/`).
 */
describe("the core contract:  a game's patches give its whole state, click by click", () => {
  for (const name of GAMES) {
    test(
      name,
      async () => {
        const folder = mkdtempSync(join(tmpdir(), "spell-patches-"))
        try {
          await importedProjects(name, "py", folder)
          const program = join(folder, `${name}.spell.py`)
          writeFileSync(program, compiledFixture(name, "py"))
          const args = ["run", "--quiet", "--project", SPELL_CORE, "python", PLAYER, program]
          const { status, stdout, stderr } = spawnSync("uv", [...args, "--seed", String(CONTRACT_SEED)], {
            encoding: "utf8"
          })
          expect(status, `${name}:\n${stderr}`).toBe(0)
          expect(stdout).toMatch(/[1-9]\d* of 300 clicks changed something;  every patch matched/)
        } finally {
          rmSync(folder, { recursive: true, force: true })
        }
      },
      60_000
    )
  }
})

/**
 * A page draws a Python program as javascript draws it (epic `python-target` P19):
 * each game run on the `py` target, seeded, its state (`--state`) drawn in the fake page by its drawing half,
 * `<Project>.elements.spell.js` (`PY.ElementsWriter`), started by `@spell/core`'s `startPage()`.
 * - The board it draws is the javascript run's, the last line of its contract snapshot.
 * - A click on a face-up card sends Python the event, the card by its id;  Python's session runs it.
 */
describe("the core contract:  a page draws a Python game as javascript does", () => {
  for (const name of GAMES) {
    test(
      name,
      async () => {
        const folder = mkdtempSync(join(tmpdir(), "spell-page-"))
        try {
          await importedProjects(name, "py", folder)
          const program = join(folder, `${name}.spell.py`)
          writeFileSync(program, compiledFixture(name, "py"))
          const run = ["run", "--quiet", "--project", SPELL_CORE, "python", "-m"]
          const ran = spawnSync("uv", [...run, "spell_core.run", program, "--seed", "1", "--no-pauses", "--state"], {
            encoding: "utf8"
          })
          expect(ran.status, `${name}:\n${ran.stderr}`).toBe(0)
          const state = ran.stdout.trimEnd().split("\n").at(-1)!

          // the page:  its drawing half, and those of the projects it imports, as modules beside it
          const elements = join(folder, `${name}.elements.mjs`)
          writeFileSync(elements, compiledFixture(name, PY.ElementsWriter.instance))
          const projects: Record<string, string> = {}
          const modules = [`import * as program from ${JSON.stringify(pathToFileURL(elements).href)}`]
          for (const [module, fixture] of Object.entries(fixtureImports(name))) {
            const file = join(folder, `${fixture}.elements.mjs`)
            writeFileSync(file, compiledFixture(fixture, PY.ElementsWriter.instance))
            projects[decodeURI(module.slice(SP.SPELL_PROJECT_MODULE.length))] = pathToFileURL(file).href
            modules.push(`import * as ${fixture.toLowerCase()} from ${JSON.stringify(module)}`)
          }
          const imported = Object.values(fixtureImports(name)).map((fixture) => fixture.toLowerCase())
          const page = [
            'import { startPage } from "@spell/core"',
            ...modules,
            "const sent = []",
            `startPage({ modules: [${[...imported, "program"].join(", ")}], state: ${state}, send: (message) => sent.push(message) })`,
            'document.querySelector(".Card.face-up").dispatchEvent(new Event("click", { bubbles: true }))',
            "console.log(JSON.stringify(sent))"
          ].join("\n")
          const { exitCode, output, stdout } = await CLI.runCode("run", `${name}Page`, page, {
            projects,
            capture: true,
            dom: true
          })
          expect(exitCode, `${name}'s page:\n${output}`).toBe(CLI.EXIT.OK)
          const lines = stdout.trimEnd().split("\n")
          const board = boardAt(lines)
          // the messages sent, then a blank line, then the board
          const [messages, drawn] = [lines[board - 2], lines.slice(board).join("\n")]
          const snapshot = readFileSync(resolve(import.meta.dirname, `__snapshots__/contract/${name}.out.txt`), "utf8")
          const expected = snapshot.trimEnd().split("\n")
          expect(drawn).toBe(expected.slice(boardAt(expected)).join("\n"))

          // the click:  the event, its card by reference (`Card#3-of-diamonds`), which Python's session runs
          const [click] = JSON.parse(messages!) as Array<{ trigger: string; target: string; details: object }>
          expect(click).toEqual({
            trigger: "card-click",
            target: expect.stringMatching(/^Card#\w+-of-\w+$/),
            details: {}
          })
          const session = spawnSync("uv", [...run, "spell_core.page", program, "--seed", "1", "--no-pauses"], {
            encoding: "utf8",
            input: `${JSON.stringify(click)}\n`
          })
          expect(session.status, `${name}'s session:\n${session.stderr}`).toBe(0)
          expect(JSON.parse(session.stdout.trimEnd().split("\n").at(-1)!)).toBeInstanceOf(Array)
        } finally {
          rmSync(folder, { recursive: true, force: true })
        }
      },
      60_000
    )
  }
})
