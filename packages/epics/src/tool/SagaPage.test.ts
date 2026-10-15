/**
 * Tests of `SagaPage` and `SagaEpics` (epic `epic-workflow` P15) on a scratch checkout:  a saga page made from the
 * template, edited by the `epic` verbs through its short address, checked as an epic page is;  and the epics a saga's
 * Epics draws, read from the epic pages that name it.
 */
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, afterEach, beforeAll, describe, expect, test, vi } from "vite-plus/test"

import { PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"
import { SagaEpics } from "./SagaEpics"
import { SagaPage } from "./SagaPage"

const root = mkdtempSync(join(tmpdir(), "saga-page-"))
const FILES = new PlanDocFiles({ root })
const PAGE = join(root, "sagas", "epics", "epics.saga.html")

/** What the commands printed, on stdout and stderr. */
let printed: string[] = []

/** The commands, on the scratch checkout, their output caught in `printed`;  the docs index never runs. */
function commands() {
  const owner = new PlanDocCommands({ files: FILES })
  vi.spyOn(owner, "print").mockImplementation((text) => void printed.push(text))
  vi.spyOn(owner, "warn").mockImplementation((text) => void printed.push(text))
  vi.spyOn(FILES, "reindex").mockImplementation(() => {})
  return owner
}

/** A small epic page naming saga `saga` (or none), with one active phase of two and an item that needs Owen. */
function epicPage(name: string, title: string, saga?: string) {
  const sagaAttribute = saga ? ` saga="${saga}"` : ""
  return `<!doctype html><title>Epic: ${title}</title><body class="plan-doc">
<epic-page epic="${name}" title="${title}"${sagaAttribute} updated="2026-10-14">
<epic-overview id="overview"><epic-summary>
  What ${title} does.
</epic-summary></epic-overview>
<epic-section id="phases" kind="phases"><epic-phase id="p1" title="One" status="done"></epic-phase><epic-phase id="p2" title="Two" status="active"></epic-phase></epic-section>
<epic-section id="decisions" kind="questions"><epic-item id="q1" title="which?" status="open" state="attention"></epic-item></epic-section>
</epic-page>`
}

beforeAll(() => {
  mkdirSync(join(root, "sagas"), { recursive: true })
  writeFileSync(
    join(root, "sagas", "sagas.json"),
    JSON.stringify({
      sagas: [{ id: "epics", title: "Epic Tooling", purpose: "Epics:  their pages, and `<epic-*>` elements." }]
    })
  )
  for (const [name, title, saga] of [
    ["review", "Epic Review", "epics"],
    ["airplane", "Airplane Mode", "epics"],
    ["seo", "SEO", "spell-ui"],
    ["loose", "No Saga", undefined]
  ] as const) {
    mkdirSync(join(root, "epics", name), { recursive: true })
    writeFileSync(join(root, "epics", name, `${name}.plan.html`), epicPage(name, title, saga))
  }
})

afterEach(() => {
  printed = []
  vi.restoreAllMocks()
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("SagaPage", () => {
  test("its short address:  SAGA:/<id> both ways, the prefix in any case;  anything else names no saga", () => {
    expect(SagaPage.addressOf("drawable-spell")).toBe("SAGA:/drawable-spell")
    expect(SagaPage.idOf("SAGA:/drawable-spell")).toBe("drawable-spell")
    expect(SagaPage.idOf("saga:/epics")).toBe("epics")
    for (const name of ["epics", "SAGA:/", "SAGA:/Not An Id", "goal:/epics"])
      expect(SagaPage.idOf(name)).toBeUndefined()
  })

  test("`saga page`:  the template filled from sagas.json, one file;  refused again without --force", async () => {
    expect(await commands().run(["saga", "page", "epics"])).toBe(0)
    const html = readFileSync(PAGE, "utf8")
    expect(html).toMatch(/<epic-page\s+kind="saga"\s+saga="epics"\s+title="Epic Tooling"/)
    expect(html).toContain("<title>Epic Tooling</title>")
    expect(html).toContain("<code>&lt;epic-*&gt;</code> elements.")
    expect(html).toContain('<epic-cards saga="epics"></epic-cards>')
    expect(html).not.toContain("{{")
    expect(html).not.toContain("SAGA PAGE TEMPLATE")
    expect(existsSync(join(root, "sagas", "epics", "parts"))).toBe(false)
    expect(await commands().run(["saga", "page", "epics"])).toBe(1)
    expect(printed.join("\n")).toMatch(/already exists:  --force/)
    expect(await commands().run(["saga", "page", "epics", "--force"])).toBe(0)
    expect(await commands().run(["saga", "page", "nope"])).toBe(1)
  })

  test("edited by the epic verbs through SAGA:/<id>, and checked as an epic page", async () => {
    await new SagaPage(FILES).make("epics", { force: true })
    expect(await commands().run(["add", "SAGA:/epics", "todo", "Make the Epics page group by saga"])).toBe(0)
    expect(printed).toEqual(["T1"])
    expect(FILES.read(PAGE).document.querySelector("#todos > epic-item#t1")?.getAttribute("title")).toBe(
      "Make the Epics page group by saga"
    )
    expect(FILES.read(PAGE).check()).toEqual([])
    expect(await commands().run(["items", "SAGA:/missing"])).toBe(1)
  })
})

describe("SagaEpics", () => {
  test("every epic page naming the saga, by title, with its summary, link and state's facts", () => {
    const { saga, epics } = new SagaEpics(root).of("epics")
    expect(saga).toBe("epics")
    expect(epics.map((epic) => epic.name)).toEqual(["airplane", "review"])
    expect(epics[0]).toEqual({
      name: "airplane",
      title: "Airplane Mode",
      href: "../../epics/airplane/airplane.plan.html",
      summary: "What Airplane Mode does.",
      facts: {
        phases: ["done", "active"],
        updated: "2026-10-14",
        future: false,
        standing: false,
        urgent: ["q1"],
        active: "P2 · Two"
      }
    })
    expect(new SagaEpics(root).of("tooling").epics).toEqual([])
  })
})
