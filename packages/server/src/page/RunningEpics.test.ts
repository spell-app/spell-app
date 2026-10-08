import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { MARKER, PageServer, RunningEpics, type RunningEpic } from "$/server/page"
import { ask } from "$/server/test/serve"

/** A plan doc with `phases`, each `[status, header]`;  its phase tags spread over lines, as oxfmt writes them. */
function planDoc(title: string, phases: [string, string][] = []): string {
  const sections = phases.map(
    ([status, header], i) =>
      `<ui-section\n  id="p${i + 1}"\n  data-phase="${i + 1}"\n  data-status="${status}"\n  header="${header}"\n  sticky\n></ui-section>`
  )
  return `<!doctype html><html><head><title>${title}</title></head><body class="spell-doc-page plan-doc">${sections.join("\n")}</body></html>\n`
}

/** Write `html` at `path` under `root`, making folders. */
function put(root: string, path: string, html: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), html)
}

describe("RunningEpics", () => {
  const root = mkdtempSync(join(tmpdir(), "srv-epics-"))
  let server: PageServer
  let port: number

  beforeAll(async () => {
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
    rmSync(root, { recursive: true, force: true })
  })

  it("lists each worktree's own epic, and any the main checkout lacks;  never stale copies", () => {
    const expected: RunningEpic[] = [
      {
        name: "seo",
        worktree: "seo",
        url: "/worktrees/seo/epics/seo/seo.plan.html",
        title: "SEO & co",
        done: 1,
        total: 3,
        active: "P2 · Site Map"
      },
      {
        name: "vite",
        worktree: "vite",
        url: "/worktrees/vite/packages/docs/epics/vite/vite.html",
        title: "Vite",
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
    // in progress:  [done/all], the active phase in the meta line
    expect(index).toContain(`<ui-label class="spell-epic-state" size="mini" basic>1/3</ui-label> <a`)
    expect(index).toContain("<ui-meta>P2 · Site Map · .claude/worktrees/seo</ui-meta>")
    // planning:  a blue thought bubble;  open, so Open | All keeps it
    expect(index).toMatch(/data-epic="vite" data-status="open">.*name="comment dots" color="blue"/)
    expect(index).toContain("SEO &amp; co")
  })

  it("drops a merged epic's card when the epic runs in a worktree;  stalled after a few days without update", () => {
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
        planDoc("Slow", [
          ["done", "P1 · One"],
          ["todo", "P2 · Two"]
        ]).replace('plan-doc">', 'plan-doc">updated <time id="plan-updated">2026-01-01</time>')
      )
      expect(new RunningEpics(stale).list()[0]?.updated).toBe("2026-01-01")
      expect(new RunningEpics(stale).render(MARKER)).toContain(
        'name="circle pause" color="yellow" title="stalled:  no update since 2026-01-01"'
      )
    } finally {
      rmSync(stale, { recursive: true, force: true })
    }
  })

  // epic `epic-components` P8:  converted docs say it in attributes;  until the switch (P12) both markups are read
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
