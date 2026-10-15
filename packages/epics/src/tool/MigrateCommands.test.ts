/**
 * Tests of `spell dev plan-doc migrate` (`MigrateCommands`, `PlanDocFiles.migrate()`) on a scratch checkout:  the
 * runner (steps in order, `--step`, `--dry-run` writes nothing, the lock, the per-page report, a second run up to
 * date), page kinds, `--notify` splitting running epics from idle ones, then `--all` over COPIES of the real epic
 * pages (never the shared ones).
 */
import {
  cpSync,
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync
} from "node:fs"
import { tmpdir } from "node:os"
import { join, relative } from "node:path"
import { fileURLToPath } from "node:url"

import { afterAll, afterEach, beforeEach, describe, expect, test, vi } from "vite-plus/test"

import { SRV } from "$/server"

import { MigrateCommands } from "./MigrateCommands"
import { PlanDoc } from "./PlanDoc"
import { PlanDocCommands } from "./PlanDocCommands"
import { PlanDocFiles } from "./PlanDocFiles"
import { ReviewInbox } from "./ReviewInbox"

/** The tool's test fixtures:  `epic-plan.html`, a fresh doc in `<epic-*>` markup. */
const FIXTURES = fileURLToPath(new URL("fixtures", import.meta.url))

/** This checkout's root:  its `packages/` (the docs tool, the linker's index) and its real `epics/`. */
const CHECKOUT = fileURLToPath(new URL("../../../..", import.meta.url))

/** A scratch checkout:  its own `epics/`, this checkout's `packages/` linked in. */
const root = mkdtempSync(join(tmpdir(), "plan-doc-migrate-"))
symlinkSync(join(CHECKOUT, "packages"), join(root, "packages"))
const FILES = new PlanDocFiles({ root })

/** What the commands printed, on stdout and stderr. */
let printed: string[]
let warned: string[]

/** The commands, on the scratch checkout, their output caught;  `running`:  epics with a session. */
function commands(running: Record<string, string[]> = {}) {
  const sessionsOf = async (epic: string) =>
    (running[epic] ?? []).map((name, at) => ({ name, sessionId: `${epic}-${at}` }))
  const owner = new PlanDocCommands({ files: FILES, sessionsOf })
  vi.spyOn(owner, "print").mockImplementation((text) => void printed.push(text))
  vi.spyOn(owner, "warn").mockImplementation((text) => void warned.push(text))
  return owner
}

/** Epic `name`'s doc in the scratch checkout. */
const docOf = (name: string) => join(root, "epics", name, `${name}.plan.html`)

/**
 * Write epic `name`:  three phases, split;  `old`:  phase 2 holds a plan change in the shape before 2026-10-11
 * (`<epic-updated>`), which `updates-as-epic-update` migrates.
 */
async function writeEpic(name: string, { old = false }: { old?: boolean } = {}) {
  mkdirSync(join(root, "epics", name), { recursive: true })
  const plan = PlanDoc.parse(readFileSync(join(FIXTURES, "epic-plan.html"), "utf8"))
  for (const phase of ["One", "Two", "Three"]) plan.addPhase(phase, { goal: `<ul><li>${phase}'s goal</li></ul>` })
  if (old)
    plan
      .phase(2)
      .insertAdjacentHTML("beforeend", '<epic-updated at="2026-10-01 09:00"><p>Split in two. Why.</p></epic-updated>')
  await FILES.writeDoc(docOf(name), plan, true)
}

/** Every file under `top`'s `epics/` (default:  the scratch checkout's), with its text:  was anything written? */
function snapshot(top = root): Record<string, string> {
  const files: Record<string, string> = {}
  const walk = (dir: string) => {
    for (const name of readdirSync(dir)) {
      const path = join(dir, name)
      if (statSync(path).isDirectory()) walk(path)
      else files[relative(top, path)] = readFileSync(path, "utf8")
    }
  }
  walk(join(top, "epics"))
  return files
}

beforeEach(async () => {
  printed = []
  warned = []
  rmSync(join(root, "epics"), { recursive: true, force: true })
  await writeEpic("old", { old: true })
  await writeEpic("new")
})

afterEach(() => {
  vi.restoreAllMocks()
})

afterAll(() => rmSync(root, { recursive: true, force: true }))

describe("migrate:  the runner", () => {
  test("--dry-run:  the report, nothing written", async () => {
    const before = snapshot()
    expect(await commands().run(["migrate", "--all", "--dry-run"])).toBe(0)
    expect(printed).toEqual([
      "new:  up to date",
      "old:  would run updates-as-epic-update",
      "epic pages:  1 of 2 would change (updates-as-epic-update 1)"
    ])
    expect(snapshot()).toEqual(before)
  })

  test("every step, in order:  the page migrated and logged, NOT stamped updated;  a second run:  up to date", async () => {
    const updated = FILES.read(docOf("old")).page.getAttribute("updated")
    expect(await commands().run(["migrate", "old", "new"])).toBe(0)
    expect(printed).toEqual([
      "old:  updates-as-epic-update",
      "new:  up to date",
      "epic pages:  1 of 2 changed (updates-as-epic-update 1)"
    ])
    const plan = FILES.read(docOf("old"))
    expect(plan.document.querySelector("epic-updated")).toBeNull()
    expect(plan.phase(2).querySelector(":scope > epic-update")!.getAttribute("summary")).toBe("Split in two")
    expect(plan.document.querySelector("#log > epic-event:last-of-type")!.textContent).toMatch(
      /migrated:\s+updates-as-epic-update/
    )
    expect(plan.page.getAttribute("updated")).toBe(updated)
    const after = snapshot()
    printed = []
    expect(await commands().run(["migrate", "--all"])).toBe(0)
    expect(printed.at(-1)).toBe("epic pages:  0 of 2 changed")
    expect(snapshot()).toEqual(after)
  })

  test("--step runs just that step;  a step that isn't one is refused", async () => {
    expect(await commands().run(["migrate", "epic", "old", "--step", "owen-types-to-you-type"])).toBe(0)
    expect(printed[0]).toBe("old:  up to date")
    expect(await commands().run(["migrate", "epic", "--step", "nope"])).toBe(1)
    expect(warned.at(-1)).toMatch(/no epic page step "nope"/)
  })

  test("--file:  one epic page, by its path", async () => {
    expect(await commands().run(["migrate", "--file", docOf("old"), "--dry-run"])).toBe(0)
    expect(printed).toEqual(["old:  would run updates-as-epic-update", expect.stringMatching(/1 of 1 would change/)])
  })

  test("the page's lock:  it waits for a writer, and migrates the page as the writer left it", async () => {
    let release!: () => void
    const held = new Promise<void>((resolve) => (release = resolve))
    const writer = SRV.FileLock.runAsync(docOf("old"), async () => {
      await held
      await FILES.writeDoc(docOf("old"), FILES.read(docOf("new")), true)
    })
    const migrating = commands().run(["migrate", "old"])
    await new Promise((resolve) => setTimeout(resolve, 150))
    expect(printed).toEqual([])
    release()
    await writer
    expect(await migrating).toBe(0)
    // the writer left the page current:  nothing to migrate
    expect(printed[0]).toBe("old:  up to date")
  })

  test("links-agree moves a comment whose block moved, in the inbox, after the page", async () => {
    const inbox = ReviewInbox.pathFor(docOf("new"))
    ReviewInbox.update(inbox, (each) => {
      each.comments.cm1 = {
        anchor: "p-one#field-9",
        kind: "field",
        label: "",
        excerpt: "Three's goal",
        text: "a note",
        at: "2026-10-11T09:00:00Z",
        status: "new"
      }
    })
    expect(await commands().run(["migrate", "new", "--step", "links-agree"])).toBe(0)
    expect(printed[0]).toBe("new:  links-agree")
    expect(ReviewInbox.read(inbox).comments.cm1!.anchor).toMatch(/^p-three#field-\d$/)
  })

  test("stable-phase-ids:  old ids, their links, part files and inbox entries follow;  a second run:  up to date", async () => {
    // epic `new` as written before P15:  each phase's id its number, links and the inbox keyed by them
    const file = docOf("new")
    const old = FILES.read(file)
    old.phaseElements.forEach((phase, index) => (phase.id = `p${index + 1}`))
    old.addItem("todo", "see two", { details: '<p><a href="#p2">P2 · Two</a>, <a href="new.plan.html#p3">P3</a></p>' })
    await FILES.writeDoc(file, old, true)
    const parts = join(file, "..", "parts")
    expect(readdirSync(parts).filter((name) => /^p/.test(name))).toEqual(["p1.html", "p2.html", "p3.html"])
    const inbox = ReviewInbox.pathFor(file)
    ReviewInbox.update(inbox, (each) => {
      each.setMark("p2", { action: "revisit", note: "too big?" })
      each.setDraft("p3", "revisit", "half typed")
      each.setNew(undefined, { kind: "todo", title: "later", near: "p2" })
      each.commentList.add({ anchor: "p2#field-1", kind: "field" }, "hooked up?")
    })

    expect(await commands().run(["migrate", "new", "--step", "stable-phase-ids"])).toBe(0)
    expect(printed[0]).toBe("new:  stable-phase-ids")
    const plan = FILES.read(file)
    expect(plan.phases.map((phase) => `${phase.n} ${phase.id}`)).toEqual(["1 p-one", "2 p-two", "3 p-three"])
    expect(Array.from(plan.item("t1").querySelectorAll("a"), (a) => a.getAttribute("href"))).toEqual([
      "#p-two",
      "new.plan.html#p-three"
    ])
    // each part under its phase's new id, the old ones gone
    expect(
      readdirSync(parts)
        .filter((name) => /^p/.test(name))
        .sort()
    ).toEqual(["p-one.html", "p-three.html", "p-two.html"])
    const after = ReviewInbox.read(inbox)
    expect(Object.keys(after.marks).sort()).toEqual(["new1", "p-two"])
    expect(after.marks.new1!.near).toBe("p-two")
    expect(Object.keys(after.drafts)).toEqual(["p-three"])
    expect(after.comments.cm1!.anchor).toBe("p-two#field-1")

    printed = []
    expect(await commands().run(["migrate", "new"])).toBe(0)
    expect(printed[0]).toBe("new:  up to date")
  })

  test("--list:  the epic page's steps, then the other kinds' (the docs tool)", async () => {
    expect(await commands().run(["migrate", "--list"])).toBe(0)
    expect(printed.map((line) => line.split(/\s+/).slice(0, 3).join(" "))).toEqual([
      "epic 2026-10-11 updates-as-epic-update",
      "epic 2026-10-11 owen-types-to-you-type",
      "epic 2026-10-11 links-agree",
      "epic 2026-10-14 stable-phase-ids",
      expect.stringMatching(/cheatsheet.* 2026-10-02 ui-section$/),
      expect.stringMatching(/detail,choice.* 2026-10-14 answer-elements$/)
    ])
  })
})

describe("migrate:  kinds", () => {
  test("a kind's words:  `epic` and epic ids;  another kind with names is refused;  --notify only for epics", () => {
    expect(MigrateCommands.parse(["seo", "docs"], {})).toEqual({ kind: "epic", names: ["seo", "docs"] })
    expect(MigrateCommands.parse(["epic", "seo"], {})).toEqual({ kind: "epic", names: ["seo"] })
    expect(MigrateCommands.parse(["cheatsheet"], {})).toEqual({ kind: "cheatsheet", names: [] })
    expect(MigrateCommands.parse([], {})).toEqual({ kind: undefined, names: [] })
    expect(MigrateCommands.parse([], { all: true })).toEqual({ kind: "epic", names: [] })
    expect(() => MigrateCommands.parse(["guide", "x"], {})).toThrow(/name a page with --file/)
    expect(() => MigrateCommands.parse(["guide"], { notify: true })).toThrow(/--notify is for epic pages/)
  })

  test("another kind runs the docs tool's steps (a kind without any says so)", async () => {
    expect(await commands().run(["migrate", "brand"])).toBe(0)
    expect([printed, warned]).toEqual([["brand pages:  no steps for them yet"], []])
  })
})

describe("migrate --notify", () => {
  test("an epic with a running session is told (TELL), not migrated;  an idle one is migrated now", async () => {
    await writeEpic("busy", { old: true })
    const before = readFileSync(docOf("busy"), "utf8")
    expect(await commands({ busy: ["🚧 busy"] }).run(["migrate", "--all", "--notify"])).toBe(0)
    expect(printed).toEqual([
      "busy:  its session is running:  told to run updates-as-epic-update itself",
      "new:  up to date",
      "old:  updates-as-epic-update",
      "epic pages:  2 of 3 changed (updates-as-epic-update 2)",
      expect.stringMatching(/^TELL:/),
      `  to 🚧 busy:  ${MigrateCommands.message("busy", ["updates-as-epic-update"])}`
    ])
    expect(readFileSync(docOf("busy"), "utf8")).toBe(before)
    expect(FILES.read(docOf("old")).document.querySelector("epic-updated")).toBeNull()
  })

  test("the message:  one line, what to run, when, and that it may commit it", () => {
    const message = MigrateCommands.message("seo", ["links-agree"])
    expect(message).not.toMatch(/\n/)
    expect(message).toMatch(/epic migrate seo/)
    expect(message).toMatch(/end of the phase/)
    expect(message).toMatch(/commit .* without asking/)
  })

  test("refused without the CLI's sessions", async () => {
    const owner = new PlanDocCommands({ files: FILES })
    vi.spyOn(owner, "warn").mockImplementation((text) => void warned.push(text))
    expect(await owner.run(["migrate", "--all", "--notify"])).toBe(1)
    expect(warned.at(-1)).toMatch(/--notify needs the running sessions/)
  })
})

describe("migrate --all over COPIES of the real epic pages", () => {
  /** This checkout's shared epics (a link into the content repo):  read only, never written. */
  const real = join(CHECKOUT, "epics")

  test.skipIf(!existsSync(real))(
    "dry run writes nothing;  for real, then again:  nothing more",
    async () => {
      const copies = mkdtempSync(join(tmpdir(), "plan-doc-migrate-real-"))
      try {
        cpSync(real, join(copies, "epics"), {
          recursive: true,
          dereference: true,
          filter: (path) => !path.endsWith(".lock")
        })
        for (const entry of ["packages", "guides", "templates", "pages", "agents"])
          if (existsSync(join(CHECKOUT, entry))) symlinkSync(join(CHECKOUT, entry), join(copies, entry))
        const files = new PlanDocFiles({ root: copies })
        const run = async (args: string[]) => {
          const owner = new PlanDocCommands({ files })
          const lines: string[] = []
          vi.spyOn(owner, "print").mockImplementation((text) => void lines.push(text))
          vi.spyOn(owner, "warn").mockImplementation(() => {})
          expect(await owner.run(["migrate", "--all", ...args])).toBe(0)
          return lines
        }
        const before = snapshot(copies)
        await run(["--dry-run"])
        expect(snapshot(copies)).toEqual(before)
        await run([])
        const after = snapshot(copies)
        const second = await run([])
        expect(second.at(-1)).toMatch(/^epic pages:  0 of \d+ changed$/)
        expect(snapshot(copies)).toEqual(after)
      } finally {
        rmSync(copies, { recursive: true, force: true })
      }
    },
    180_000
  )
})
