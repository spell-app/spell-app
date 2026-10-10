import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import {
  MARKER,
  PageServer,
  RunningEpics,
  sessionsTitledFor,
  titleNames,
  type LiveSession,
  type RunningEpic
} from "$/server/page"
import { EPIC_CARDS_END, EPIC_CARDS_START } from "$/server/site/EpicCards"
import { ask } from "$/server/test/serve"

/**
 * A plan doc in `<epic-*>` markup with `phases`, each `[status, header]` (`P2 · Title`), `updated` that day;  its
 * phase tags spread over lines, as oxfmt writes them.
 */
function planDoc(title: string, phases: [string, string][] = [], updated?: string): string {
  const tags = phases.map(
    ([status, header], i) =>
      `<epic-phase\n  id="p${i + 1}"\n  title="${header.replace(/^P\d+ · /, "")}"\n  status="${status}"\n></epic-phase>`
  )
  const page = `<epic-page epic="x"${updated ? `\n  updated="${updated}"` : ""}\n>`
  return (
    `<!doctype html><html><head><title>${title}</title></head><body class="spell-doc-page plan-doc">${page}` +
    `<epic-section id="phases" kind="phases">${tags.join("\n")}</epic-section></epic-page></body></html>\n`
  )
}

/** Write `html` at `path` under `root`, making folders. */
function put(root: string, path: string, html: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), html)
}

describe("RunningEpics", () => {
  const root = mkdtempSync(join(tmpdir(), "srv-epics-"))
  // no running sessions but the ones a test writes:  never this machine's (`RunningEpics.claudeHome`)
  const claudeHome = mkdtempSync(join(tmpdir(), "srv-epics-claude-"))
  const home = process.env.SPELL_CLAUDE_HOME
  let server: PageServer
  let port: number

  beforeAll(async () => {
    process.env.SPELL_CLAUDE_HOME = claudeHome
    writeFileSync(join(root, "package.json"), JSON.stringify({ pageServer: { watch: ["pages", "epics"] } }))
    put(root, "epics/index.html", `<html><head></head><body><h1>Epics</h1>${MARKER}</body></html>\n`)
    // merged into the main checkout:  a worktree's copy of it is stale, never listed
    put(root, "epics/old/old.html", planDoc("Old"))
    put(root, ".claude/worktrees/seo/epics/old/old.html", planDoc("Old, stale"))
    // the worktree's own epic, mid-way;  and one planning, in another worktree
    put(
      root,
      ".claude/worktrees/seo/epics/seo/seo.plan.html",
      planDoc("SEO &amp; co", [
        ["done", "P1 · Meta Tags"],
        ["active", "P2 · Site Map"],
        ["todo", "P3 · Doc Review"]
      ])
    )
    // a worktree cut before the rename to `<name>.plan.html` and the move into `content/`:
    // its plan doc under the old name and folder still counts;  a page of that name that isn't a plan doc doesn't
    put(root, ".claude/worktrees/vite/packages/docs/epics/vite/vite.html", planDoc("Vite"))
    put(root, ".claude/worktrees/vite/packages/docs/epics/notes/notes.html", "<html><body>notes</body></html>\n")
    server = await new PageServer({ root }).start({ port: 0, routes: false })
    port = server.info.port
  })

  afterAll(async () => {
    await server.stop()
    if (home === undefined) delete process.env.SPELL_CLAUDE_HOME
    else process.env.SPELL_CLAUDE_HOME = home
    rmSync(root, { recursive: true, force: true })
    rmSync(claudeHome, { recursive: true, force: true })
  })

  it("lists each worktree's own epic, and any the main checkout lacks;  never stale copies", () => {
    const expected: RunningEpic[] = [
      {
        name: "seo",
        worktree: "seo",
        url: "/worktrees/seo/epics/seo/seo.plan.html",
        title: "SEO & co",
        phases: ["done", "active", "todo"],
        done: 1,
        total: 3,
        active: "P2 · Site Map"
      },
      {
        name: "vite",
        worktree: "vite",
        url: "/worktrees/vite/packages/docs/epics/vite/vite.html",
        title: "Vite",
        phases: [],
        done: 0,
        total: 0
      }
    ]
    expect(new RunningEpics(root).list()).toEqual(expected)
  })

  it("serves them under `/worktrees/`, and the list as JSON", async () => {
    const doc = await ask(port, "GET", "/worktrees/seo/epics/seo/seo.plan.html")
    expect(doc.status).toBe(200)
    expect(doc.text).toContain("SEO &amp; co")
    const list = JSON.parse((await ask(port, "GET", "/_server/epics")).text) as RunningEpic[]
    expect(list.map((epic) => epic.name)).toEqual(["seo", "vite"])
  })

  it("gives a worktree's page that worktree's badge", async () => {
    const doc = await ask(port, "GET", "/worktrees/seo/epics/seo/seo.plan.html")
    const config = JSON.parse(/window\.SPELL_SERVER = (.*?)<\/script>/.exec(doc.text)![1]!) as { worktree?: string }
    expect(config.worktree).toBe("seo")
  })

  it("still refuses dot paths inside a worktree", async () => {
    put(root, ".claude/worktrees/seo/.env", "SECRET=1")
    expect((await ask(port, "GET", "/worktrees/seo/.env")).status).toBe(403)
  })

  it("puts the running epics' cards at the marker in the Epics list, each title after its state", async () => {
    const index = (await ask(port, "GET", "/epics/index.html")).text
    expect(index).not.toContain(MARKER)
    expect(index).toContain(`href="/worktrees/seo/epics/seo/seo.plan.html"`)
    // in progress:  [done/all], outlined in blue, the active phase in the meta line
    expect(index).toContain(
      `<ui-label class="spell-epic-state" size="mini" color="blue" basic title="in progress:  P2 · Site Map under way">1/3</ui-label> <a`
    )
    expect(index).toContain("<ui-meta>P2 · Site Map · .claude/worktrees/seo</ui-meta>")
    // no phases yet:  in progress too, saying it's planning;  open, so Open | All keeps it
    expect(index).toMatch(
      /data-epic="vite" data-title="Vite" data-group="planning" data-status="open"[^>]*>[\s\S]*?color="blue" basic title="in progress:  planning/
    )
    expect(index).toContain("SEO &amp; co")
  })

  it("drops a merged epic's card when the epic runs in a worktree;  paused after a few days without update", () => {
    // the closing tag split over lines, as oxfmt writes it
    const page = `<ui-cards>${MARKER}<ui-card data-epic="seo" data-status="done"><ui-content>old</ui-content></ui-card\n  ><ui-card data-epic="other"><ui-content>x</ui-content></ui-card></ui-cards>`
    const html = new RunningEpics(root).render(page)
    expect(html).not.toContain(">old<")
    expect(html).toContain('data-epic="other"')
    const stale = mkdtempSync(join(tmpdir(), "srv-epics-stale-"))
    try {
      put(
        stale,
        ".claude/worktrees/slow/packages/docs/epics/slow/slow.html",
        planDoc(
          "Slow",
          [
            ["done", "P1 · One"],
            ["todo", "P2 · Two"]
          ],
          "2026-01-01"
        )
      )
      expect(new RunningEpics(stale).list()[0]?.updated).toBe("2026-01-01")
      expect(new RunningEpics(stale).render(MARKER)).toContain(
        'name="circle pause" color="grey" title="paused:  no update since 2026-01-01, 1/2 phases done"'
      )
      // a session working in its worktree (this process:  alive):  in progress, however old the doc
      put(
        stale,
        "claude/sessions/1.json",
        JSON.stringify({ pid: process.pid, cwd: join(stale, ".claude/worktrees/slow/packages"), name: "🚧 other" })
      )
      const running = new RunningEpics(stale, { claudeHome: join(stale, "claude") })
      expect(running.runningNames()).toEqual(new Set(["slow", "other"]))
      expect(running.render(MARKER)).toContain('title="in progress:  1/2 phases done, a session is running">1/2<')
    } finally {
      rmSync(stale, { recursive: true, force: true })
    }
  })

  // epic `epic-components` P8:  converted docs say it in attributes (the old markup read no more since P15)
  it("reads a plan doc in <epic-*> markup:  phases, the active one's label, the page's updated date", () => {
    const fresh = mkdtempSync(join(tmpdir(), "srv-epics-new-"))
    try {
      put(
        fresh,
        ".claude/worktrees/neat/epics/neat/neat.plan.html",
        `<!doctype html><html><head><title>Epic: Neat &amp; Tidy</title></head><body class="spell-doc-page plan-doc">` +
          `<epic-page\n  epic="neat"\n  title="Neat &amp; Tidy"\n  updated="2026-10-06"\n>` +
          `<epic-section id="phases" kind="phases"><epic-phase id="p1" title="One" status="done"></epic-phase>` +
          `<epic-phase\n  id="p2"\n  title="Two &amp; Three"\n  status="active"\n  source="parts/p2.html"\n></epic-phase>` +
          `<epic-phase id="p3" title="Four" status="todo"></epic-phase></epic-section></epic-page></body></html>\n`
      )
      expect(new RunningEpics(fresh).list()[0]).toMatchObject({
        title: "Neat & Tidy",
        done: 1,
        total: 3,
        active: "P2 · Two & Three",
        updated: "2026-10-06"
      })
    } finally {
      rmSync(fresh, { recursive: true, force: true })
    }
  })

  // the ONE rule, `$/server/site/EpicState`, as the docs index and `<epic-page>` draw it (epic `airplane` P8)
  it("marks a future epic with a grey seedling;  every phase done:  errors while items need Owen, else done", () => {
    const quiet = mkdtempSync(join(tmpdir(), "srv-epics-quiet-"))
    try {
      put(
        quiet,
        ".claude/worktrees/idea/epics/idea/idea.plan.html",
        `<html><head><title>Epic: Idea</title></head><body><epic-page\n  epic="idea"\n  future\n></epic-page></body></html>\n`
      )
      for (const name of ["calm", "loud"]) {
        put(
          quiet,
          `.claude/worktrees/${name}/epics/${name}/${name}.plan.html`,
          `<html><head><title>Epic: ${name}</title></head><body><epic-page epic="${name}">` +
            `<epic-section id="phases" kind="phases"><epic-phase id="p1" title="One" status="done"></epic-phase>` +
            `<epic-phase id="p2" title="Two" status="done"></epic-phase></epic-section>` +
            `<epic-section id="issues" kind="issues"><epic-item id="i1" title="A" status="open" state="open">` +
            `</epic-item>${name === "loud" ? `<epic-item\n  id="i2"\n  status="open"\n  state="attention"\n></epic-item>` : ""}` +
            `</epic-section><epic-section id="questions" kind="questions"><epic-item id="q1" status="open" ` +
            `state="${name === "loud" ? "replied" : "recent"}"></epic-item></epic-section></epic-page></body></html>\n`
        )
      }
      const epics = new RunningEpics(quiet)
      expect(epics.list()).toMatchObject([
        { name: "calm", total: 2, done: 2 },
        { name: "idea", future: true, total: 0 },
        { name: "loud", total: 2, done: 2, urgent: ["i2", "q1"] }
      ])
      expect(epics.list()[0]).not.toHaveProperty("urgent")
      const html = epics.render(MARKER)
      expect(html).toContain('name="seedling" color="grey" title="future:  not planned yet"')
      expect(html).toContain(
        'data-group="done" data-status="done" data-phases="done done"><ui-content>\n<ui-header><ui-icon class="spell-epic-state" ' +
          'name="circle check" color="green" title="done:  every phase done, nothing needs you">'
      )
      expect(html).toContain(
        'data-group="urgent" data-status="open" data-phases="done done" data-urgent="i2 q1"><ui-content>\n<ui-header><ui-icon class="spell-epic-state" ' +
          'name="circle exclamation" color="red" title="errors:  every phase done, but 1 question, 1 issue need you">'
      )
      expect(html).not.toMatch(/sleeping|😴/)
    } finally {
      rmSync(quiet, { recursive: true, force: true })
    }
  })

  it("marks the docs index's cards again as it serves the page:  today's date, a session running", () => {
    const now = new Date(2026, 9, 10, 9)
    const card = (facts: string) =>
      `<ui-card data-epic="nap" data-status="open"${facts}><ui-content>\n<ui-header>` +
      `<span class="spell-epic-state" title="sleeping:  1 todo to follow up">😴</span> <a href="nap/nap.plan.html">Nap</a>` +
      `</ui-header>\n<ui-meta>epics/nap/nap.plan.html</ui-meta>\n</ui-content></ui-card>`
    const paused = new RunningEpics(root).render(
      `${MARKER}${card(' data-phases="done todo" data-updated="2026-10-06" data-urgent="j1"')}`,
      now
    )
    expect(paused).toContain(
      '<ui-icon class="spell-epic-state" name="circle pause" color="grey" title="paused:  no update since 2026-10-06, 1/2 phases done"></ui-icon> <a'
    )
    expect(paused).not.toContain("😴")
    const fresh = new RunningEpics(root).render(
      `${MARKER}${card(' data-phases="done todo" data-updated="2026-10-08"')}`,
      now
    )
    expect(fresh).toContain('basic title="in progress:  1/2 phases done, updated 2026-10-08">1/2</ui-label> <a')
    // an index written before the facts:  as it was
    expect(new RunningEpics(root).render(`${MARKER}${card("")}`, now)).toContain("😴")
  })

  // epic `airplane` P8 (Owen, 2026-10-10):  favourites first, then the groups;  alphabetical in each
  it("regroups every card between the markers by the favourites as they are now;  running cards join their group", () => {
    const grouped = mkdtempSync(join(tmpdir(), "srv-epics-groups-"))
    try {
      put(
        grouped,
        ".claude/worktrees/seo/epics/seo/seo.plan.html",
        planDoc("SEO", [["active", "P1 · Go"]], "2026-10-01")
      )
      put(
        grouped,
        ".claude/worktrees/seo/epics/seo/parts/log.html",
        `<epic-event at="2026-10-08T09:15-04:00">P1 active</epic-event>\n`
      )
      put(grouped, "epics/favorites.json", JSON.stringify(["zed"]))
      const index = (name: string, title: string, group: string, extra = "") =>
        `<ui-card id="epic-${name}" data-epic="${name}" data-title="${title}" data-group="${group}" data-status="open" ` +
        `data-phases="done todo"${extra}><ui-content><ui-header><a>${title}</a></ui-header></ui-content>` +
        `<button type="button" class="spell-epic-star" aria-pressed="true" aria-label="Unstar ${name}" title="x"><ui-icon name="star"></ui-icon></button\n  ></ui-card\n>`
      const page =
        `<main>${EPIC_CARDS_START}\n<div class="spell-epic-group" data-group="favorites"><ui-cards>` +
        `${index("alpha", "Alpha", "active")}</ui-cards></div>` +
        `<div class="spell-epic-group" data-group="active" hidden><ui-cards>` +
        `${index("zed", "Zed", "active")}${index("seo", "SEO", "active", ' data-worked="2026-10-09T20:00-04:00"')}` +
        `</ui-cards></div>\n${EPIC_CARDS_END}</main>`
      const html = new RunningEpics(grouped).render(page, new Date(2026, 9, 9))
      const groups = html.split('<div class="spell-epic-group" ').slice(1)
      const names = (group: string | undefined) => Array.from(group!.matchAll(/data-epic="(\w+)"/g), (m) => m[1])
      // `zed` starred now, `alpha` not any more;  running `seo` in Active, its index card gone
      expect(names(groups[0])).toEqual(["zed"])
      expect(names(groups[1])).toEqual(["alpha", "seo"])
      expect(groups.slice(2).every((group) => group.includes(" hidden>"))).toBe(true)
      expect(html).toContain('aria-pressed="false" aria-label="Star alpha"')
      expect(html.match(/data-epic="seo"/g)).toHaveLength(1)
      // last worked:  the merged card's (its branch's commit, as the docs index read it) beat the doc's log line
      expect(html).toMatch(/data-epic="seo"[^>]*data-worked="2026-10-09T20:00/)
      expect(new RunningEpics(grouped).list()[0]?.worked).toBe(new Date("2026-10-08T09:15-04:00").toISOString())
      expect(html.indexOf(EPIC_CARDS_START)).toBeLessThan(html.indexOf(EPIC_CARDS_END))
    } finally {
      rmSync(grouped, { recursive: true, force: true })
    }
  })

  it("renders nothing with no running epic, or no marker", () => {
    const empty = mkdtempSync(join(tmpdir(), "srv-epics-none-"))
    try {
      expect(new RunningEpics(empty).render(`<p>${MARKER}</p>`)).toBe(`<p>${MARKER}</p>`)
      expect(new RunningEpics(root).render("<p>no marker</p>")).toBe("<p>no marker</p>")
    } finally {
      rmSync(empty, { recursive: true, force: true })
    }
  })
})

// shared content (epics `shared-content`, `claude-design` P4):  every checkout's `epics` is a link to the same folder;
// a checkout on older code reaches it through its `packages/docs/content` link and the old-path links
describe("RunningEpics, shared content", () => {
  const temp = mkdtempSync(join(tmpdir(), "srv-epics-shared-"))
  afterAll(() => rmSync(temp, { recursive: true, force: true }))

  it("links a worktree's epic through the main checkout's own URL, whichever layout the worktree has", () => {
    const root = join(temp, "spell-app")
    put(temp, "spell-app-dev/epics/wt/wt.plan.html", planDoc("Shared", [["active", "P1 · Go"]]))
    put(temp, "spell-app-dev/epics/done/done.plan.html", planDoc("Done"))
    mkdirSync(join(temp, "spell-app-dev/packages/docs/content"), { recursive: true })
    symlinkSync("../../../epics", join(temp, "spell-app-dev/packages/docs/content/epics"))
    mkdirSync(root, { recursive: true })
    symlinkSync(join(temp, "spell-app-dev/epics"), join(root, "epics"))
    for (const worktree of ["wt", "older"]) {
      const checkout = join(root, ".claude/worktrees", worktree)
      mkdirSync(join(checkout, "packages/docs"), { recursive: true })
      if (worktree === "wt") symlinkSync(join(temp, "spell-app-dev/epics"), join(checkout, "epics"))
      else symlinkSync(join(temp, "spell-app-dev/packages/docs/content"), join(checkout, "packages/docs/content"))
    }
    const epics = new RunningEpics(root).list()
    expect(epics.map(({ name, worktree, url }) => ({ name, worktree, url }))).toEqual([
      { name: "wt", worktree: "wt", url: "/epics/wt/wt.plan.html" }
    ])
  })
})

// epic `airplane` P12:  which running session a plan doc's "start a review" types into
describe("sessions titled for an epic", () => {
  it("names it as its bare title, or as a whole word;  never inside a longer name", () => {
    expect(titleNames("🚧 airplane", "airplane")).toBe(true)
    expect(titleNames("⏸️ airplane", "airplane")).toBe(true)
    expect(titleNames("airplane", "airplane")).toBe(true)
    expect(titleNames("review the airplane epic", "airplane")).toBe(true)
    expect(titleNames("🚧 airplane-mode", "airplane")).toBe(false)
    expect(titleNames("🚧 seo", "airplane")).toBe(false)
    expect(titleNames("", "airplane")).toBe(false)
  })

  it("keeps the matching sessions, in order", () => {
    const session = (title: string, pid: number): LiveSession => ({
      pid,
      sessionId: "",
      title,
      status: "idle",
      cwd: ""
    })
    const all = [session("🚧 seo", 1), session("🚧 airplane", 2), session("airplane notes", 3)]
    expect(sessionsTitledFor("airplane", all).map((each) => each.pid)).toEqual([2, 3])
    expect(sessionsTitledFor("docs", all)).toEqual([])
  })
})
