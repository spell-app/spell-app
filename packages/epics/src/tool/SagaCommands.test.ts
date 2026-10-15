/**
 * Tests of `SagaCommands` (`epic saga ...`) and `epic new --saga`, on a scratch checkout (epic `epic-workflow` P15):
 * the list, an epic's saga set and cleared, a saga refused, the list's order and titles, and a rename every
 * reference follows.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { PlanDoc } from "./PlanDoc"
import { PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"
import { Sagas } from "./Sagas"

/** The tool's test fixtures:  `epic-plan.html`, a fresh doc in `<epic-*>` markup. */
const FIXTURES = fileURLToPath(new URL("fixtures", import.meta.url))

const root = mkdtempSync(join(tmpdir(), "saga-commands-"))
const FILES = new PlanDocFiles({ root })

/** What the commands printed, on stdout and stderr. */
let printed: string[]
let warned: string[]

/** The commands, on the scratch checkout, their output caught in `printed` / `warned`. */
function commands() {
  const owner = new PlanDocCommands({ files: FILES })
  vi.spyOn(owner, "print").mockImplementation((text) => void printed.push(text))
  vi.spyOn(owner, "warn").mockImplementation((text) => void warned.push(text))
  return owner
}

/** Write `text` at `path` (from the scratch root), its folders made. */
function write(path: string, text: string) {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

/** The text at `path`, from the scratch root. */
function read(path: string): string {
  return readFileSync(join(root, path), "utf8")
}

/** A guide titled `title`, its description meta written over three lines as the formatter does. */
function guide(title: string): string {
  return (
    `<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <title>${title}</title>\n` +
    `    <meta\n      name="description"\n      content="About ${title}."\n    />\n  </head>\n  <body></body>\n</html>\n`
  )
}

/** Epic `name`'s page, from the fixture. */
async function epic(name: string) {
  const plan = PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"))
  await FILES.writeDoc(join(root, "epics", name, `${name}.plan.html`), plan, true)
}

beforeEach(async () => {
  printed = []
  warned = []
  for (const folder of ["epics", "guides", "sagas"]) rmSync(join(root, folder), { recursive: true, force: true })
  write(
    "sagas/sagas.json",
    JSON.stringify({
      "//": "note",
      sagas: [
        { id: "drawable-spell", title: "Drawable Spell", purpose: "drawn" },
        { id: "epics", title: "Epic Tooling", purpose: "epics" }
      ]
    })
  )
  await epic("x")
  await epic("y")
  write("guides/one.html", guide("One"))
  write("guides/two/two.html", guide("Two"))
  vi.spyOn(FILES, "reindex").mockImplementation(() => {})
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("epic saga set", () => {
  test("names the saga on the epic page, logged;  --none clears it", async () => {
    expect(await commands().run(["saga", "set", "x", "epics"])).toBe(0)
    expect(printed).toEqual(["x:  saga epics (Epic Tooling)"])
    const plan = FILES.read(FILES.findDoc("x"))
    expect(plan.saga).toBe("epics")
    expect(plan.summary().saga).toBe("epics")
    expect(read("epics/x/x.plan.html")).toMatch(/<epic-page\b[^>]*\ssaga="epics"/)
    expect(FILES.listEpics().find((each) => each.name === "x")?.saga).toBe("epics")
    expect(await commands().run(["saga", "set", "x", "epics"])).toBe(0)
    expect(printed.at(-1)).toBe("x:  saga epics (Epic Tooling), already")
    expect(await commands().run(["saga", "set", "x", "--none"])).toBe(0)
    expect(FILES.read(FILES.findDoc("x")).saga).toBeNull()
    expect(read("epics/x/parts/log.html")).toMatch(/saga:\s+epics[\s\S]*no saga \(was epics\)/)
  })

  test("refuses a saga not in the list, writing nothing", async () => {
    const before = read("epics/x/x.plan.html")
    expect(await commands().run(["saga", "set", "x", "nope"])).toBe(1)
    expect(warned[0]).toMatch(/no saga "nope";  the sagas:  drawable-spell, epics/)
    expect(read("epics/x/x.plan.html")).toBe(before)
  })
})

describe("epic saga list", () => {
  test("each saga in order, with its epics and guide count;  then the epics with none", async () => {
    await commands().run(["saga", "set", "y", "epics"])
    write("guides/one.html", Sagas.withSaga(guide("One"), "epics"))
    printed = []
    expect(await commands().run(["saga", "list", "--json"])).toBe(0)
    const listing = JSON.parse(printed[0]!)
    expect(listing.map((saga: { id: string }) => saga.id)).toEqual(["drawable-spell", "epics"])
    expect(listing[1]).toMatchObject({ title: "Epic Tooling", page: "sagas/epics/epics.saga.html", epics: ["y"] })
    expect(listing[1].guides).toBe(1)
    printed = []
    await commands().run(["saga", "list"])
    expect(printed[0]).toMatch(/epics\s+Epic Tooling\s+\(1 epic, 1 guide\)/)
    expect(printed[0]).toMatch(/no saga:  x$/)
  })
})

describe("epic saga new, move, title", () => {
  test("adds a saga after another, moves it, retitles it", async () => {
    expect(await commands().run(["saga", "new", "agents", "Agents", "--purpose", "how agents work"])).toBe(0)
    expect(printed.at(-1)).toBe("agents:  Agents, saga 3 of 3")
    await commands().run(["saga", "new", "tooling", "Dev Tooling", "--purpose", "tools", "--after", "drawable-spell"])
    const sagas = new Sagas(root)
    expect(sagas.ids()).toEqual(["drawable-spell", "tooling", "epics", "agents"])
    await commands().run(["saga", "move", "agents", "--before", "drawable-spell"])
    expect(sagas.ids()).toEqual(["agents", "drawable-spell", "tooling", "epics"])
    await commands().run(["saga", "move", "agents", "--after", "epics"])
    expect(sagas.ids()).toEqual(["drawable-spell", "tooling", "epics", "agents"])
    await commands().run(["saga", "title", "tooling", "The Tooling"])
    expect(sagas.find("tooling")?.title).toBe("The Tooling")
    expect(JSON.parse(read("sagas/sagas.json"))["//"]).toBe("note")
  })

  test("refuses a taken or malformed id, no purpose, or a move with neither place", async () => {
    const owner = commands()
    expect(await owner.run(["saga", "new", "epics", "Again", "--purpose", "x"])).toBe(1)
    expect(await owner.run(["saga", "new", "Three Words Here", "X", "--purpose", "x"])).toBe(1)
    expect(await owner.run(["saga", "new", "fresh", "Fresh"])).toBe(1)
    expect(await owner.run(["saga", "move", "epics"])).toBe(1)
    expect(await owner.run(["saga", "title", "nope", "X"])).toBe(1)
    expect(warned).toHaveLength(5)
    expect(new Sagas(root).ids()).toEqual(["drawable-spell", "epics"])
  })
})

describe("epic saga rename", () => {
  test("the list, each epic page, each guide's meta, the saga's folder and the shared pages' links follow", async () => {
    await commands().run(["saga", "set", "x", "epics"])
    write("guides/one.html", Sagas.withSaga(guide("One"), "epics"))
    write("sagas/epics/epics.saga.html", `<saga-page saga="epics"></saga-page>`)
    write("sagas/epics/parts/overview.html", "<p>overview</p>")
    write(
      "guides/two/two.html",
      `${guide("Two")}<a href="SAGA:/epics#T3">a</a> <a href="SAGA:/epics/x">b</a> <a href="SAGA:/epics-old">c</a>` +
        `<epic-link saga="epics" item="T1"></epic-link>`
    )
    printed = []
    expect(await commands().run(["saga", "rename", "epics", "epic-tools"])).toBe(0)
    expect(new Sagas(root).ids()).toEqual(["drawable-spell", "epic-tools"])
    expect(FILES.read(FILES.findDoc("x")).saga).toBe("epic-tools")
    expect(Sagas.sagaOf(read("guides/one.html"))).toBe("epic-tools")
    expect(existsSync(join(root, "sagas/epics"))).toBe(false)
    expect(read("sagas/epic-tools/epic-tools.saga.html")).toBe(`<saga-page saga="epic-tools"></saga-page>`)
    expect(read("sagas/epic-tools/parts/overview.html")).toBe("<p>overview</p>")
    const two = read("guides/two/two.html")
    expect(two).toContain(`href="SAGA:/epic-tools#T3"`)
    expect(two).toContain(`href="SAGA:/epic-tools/x"`)
    expect(two).toContain(`href="SAGA:/epics-old"`)
    expect(two).toContain(`<epic-link saga="epic-tools" item="T1">`)
    expect(printed[0]).toMatch(/epics -> epic-tools[\s\S]*epic pages:  x[\s\S]*guides:  guides\/one\.html/)
    expect(printed[0]).toMatch(/links:  .*guides\/two\/two\.html \(3\)/)
  })

  test("refuses a saga that isn't there, or a new id that's taken, changing nothing", async () => {
    const owner = commands()
    expect(await owner.run(["saga", "rename", "nope", "fresh"])).toBe(1)
    expect(await owner.run(["saga", "rename", "epics", "drawable-spell"])).toBe(1)
    expect(new Sagas(root).ids()).toEqual(["drawable-spell", "epics"])
  })
})

describe("epic new --saga", () => {
  test("names the saga from the start;  a saga not in the list writes nothing", async () => {
    expect(await commands().run(["new", "fresh", "--saga", "drawable-spell"])).toBe(0)
    expect(FILES.read(FILES.findDoc("fresh")).summary().saga).toBe("drawable-spell")
    expect(await commands().run(["new", "other", "--saga", "nope"])).toBe(1)
    expect(existsSync(join(root, "epics/other"))).toBe(false)
  })
})
