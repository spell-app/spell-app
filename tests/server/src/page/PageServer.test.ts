import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"
import {
  COMPONENT_SETS,
  PageServer,
  componentSetPath,
  componentSets,
  engineRoutePath,
  engineRoutes,
  findById,
  replaceById,
  urlPathOf
} from "$/server/page"
import { ask } from "$/server/test/serve"

/**
 * Component sets and engine routes, as the repo root's `package.json` names them (`"pageServer"`):
 * the server knows them only from its settings.
 */
const SERVED = {
  componentSets: {
    ui: { name: "Spell UI", dir: "packages/ui/docs", assets: "packages/ui/site/_assets" },
    epics: { name: "Epic UI", dir: "spell-epic/src/docs", assets: "packages/ui/site/_assets/sets" },
    app: { name: "App UI", dir: "packages/app/docs", assets: "packages/ui/site/_assets/sets" },
    brand: { name: "Brand", dir: "packages/brand/docs", assets: "packages/ui/site/_assets/sets" }
  },
  engineRoutes: {
    "/_epic/assets/": "spell-epic/src/tools/_assets",
    "/_epic/pack/": "spell-epic/src/components/__pack",
    "/templates/": "spell-epic/templates"
  }
}

/** A page whose formatting an edit must keep, byte for byte. */
const PAGE = `<!doctype html>
<html>
  <head><title>T</title></head>
  <body>
    <section id="one" class="s2">
      <p>One   <b>bold</b></p>
    </section>
    <SECTION id='two'>Two</SECTION>
    <p id="dup">a</p><p id="dup">b</p>
    <template><div id="in-template">t</div></template>
    <img id="void" src="x.png">
  </body>
</html>
`

describe("replaceById()", () => {
  it("replaces one element, keeping every other byte", () => {
    const next = replaceById(PAGE, "one", `<section id="one">NEW</section>`)
    const start = PAGE.indexOf(`<section id="one"`)
    const end = PAGE.indexOf("</section>") + "</section>".length
    expect(next).toBe(PAGE.slice(0, start) + `<section id="one">NEW</section>` + PAGE.slice(end))
  })

  it("replaces content only, with `inner`", () => {
    expect(replaceById(PAGE, "two", "2", true)).toContain("<SECTION id='two'>2</SECTION>")
  })

  it("finds a parent by tag, through a child's id", () => {
    const next = replaceById(PAGE, "two", "<section>S</section>", false, "body")
    expect(next).toMatch(/<html>\n  <head><title>T<\/title><\/head>\n  <section>S<\/section>\n<\/html>\n$/)
    expect(() => findById(PAGE, "two", "article")).toThrow(/no <article>/)
  })

  it("finds inside templates;  refuses missing, duplicate and end-tag-less inner", () => {
    expect(PAGE.slice(findById(PAGE, "in-template").start)).toMatch(/^<div id="in-template">/)
    expect(() => findById(PAGE, "nope")).toThrow(/no element/)
    expect(() => findById(PAGE, "dup")).toThrow(/2 elements/)
    expect(() => replaceById(PAGE, "void", "x", true)).toThrow(/no end tag/)
    expect(replaceById(PAGE, "void", `<img id="void" src="y.png">`)).toContain(`src="y.png"`)
  })
})

describe("liveClientScript()", () => {
  it("is a valid classic script", () => {
    // oxlint-disable-next-line no-implied-eval -- parsing (never running) the script is the test
    expect(() => new Function(SRV.liveClientScript())).not.toThrow()
  })
})

describe("PageServer", () => {
  const root = mkdtempSync(join(tmpdir(), "srv-page-"))
  const page = join(root, "docs", "page.html")
  // the epic engine:  spell-epic beside the checkout, linked in at its root as `spell-epic` (epic `epic-eject` I5)
  const engine = `${root}-engine`
  let server: PageServer
  let port: number

  beforeAll(async () => {
    mkdirSync(join(root, "docs"))
    mkdirSync(join(engine, "src", "docs"), { recursive: true })
    symlinkSync(engine, join(root, "spell-epic"))
    // Spell UI's set:  its pages (`packages/ui/docs/`) and its site bundle (`packages/ui/site/_assets/`)
    mkdirSync(join(root, "packages", "ui", "docs", "__data"), { recursive: true })
    mkdirSync(join(root, "packages", "ui", "site", "_assets"), { recursive: true })
    writeFileSync(join(root, "packages", "ui", "docs", "ui-button.html"), "<!doctype html><head></head><p>UI</p>\n")
    writeFileSync(join(root, "packages", "ui", "docs", "__data", "components.json5"), `{"from":"ui"}\n`)
    writeFileSync(join(root, "packages", "ui", "site", "_assets", "site.js"), "export {}\n")
    // a page with no `</body>`
    mkdirSync(join(root, "brand"), { recursive: true })
    writeFileSync(join(root, "brand", "index.html"), "<!doctype html><head></head><p>Brand</p>\n")
    // a folder outside `writable`
    mkdirSync(join(root, "other"), { recursive: true })
    writeFileSync(join(root, "other", "button.html"), "<!doctype html><head></head><p>other</p>\n")
    // a built page script, and one not built:  only the first is added (`pageScripts`)
    mkdirSync(join(root, "build"), { recursive: true })
    writeFileSync(join(root, "build", "colours.js"), "export {}\n")
    const pageScripts = [
      { src: "/colours.js", file: "build/colours.js", skip: ["/components/"] },
      { src: "/unbuilt.js", file: "build/unbuilt.js" }
    ]
    writeFileSync(
      join(root, "package.json"),
      JSON.stringify({ pageServer: { watch: ["docs"], writable: ["docs"], pageScripts, ...SERVED } })
    )
    writeFileSync(page, PAGE)
    server = await new PageServer({ root }).start({ port: 0, routes: false })
    port = server.info.port
  })

  afterAll(async () => {
    await server.stop()
    rmSync(root, { recursive: true, force: true })
    rmSync(engine, { recursive: true, force: true })
  })

  /** the page's `window.SPELL_SERVER`, as served */
  async function config(): Promise<SRV.ServerConfig> {
    const answer = await ask(port, "GET", "/docs/page.html")
    return JSON.parse(/window\.SPELL_SERVER = (.*?)<\/script>/.exec(answer.text)![1]!) as SRV.ServerConfig
  }

  /** headers for a write */
  function writeHeaders(etag: string, type = "application/json") {
    return { "content-type": type, "x-server-token": server.web.guard.token, "if-match": etag }
  }

  it("writes its pid file and answers its info at /api/server", async () => {
    expect(JSON.parse(readFileSync(join(root, ".spell-server.json"), "utf8"))).toMatchObject({ port, root })
    expect(JSON.parse((await ask(port, "GET", "/api/server")).text)).toMatchObject({ pid: process.pid, root })
    expect(await server.pidFile.status()).toMatchObject({ port, base: `http://127.0.0.1:${port}` })
  })

  it("answers nothing at the old /_server/ calls:  no redirect, no alias", async () => {
    for (const old of ["/_server/ping", "/_server/page?path=/docs/page.html", "/_server/live.js", "/_server/epics"])
      expect((await ask(port, "GET", old)).status, old).toBe(404)
  })

  it("injects SPELL_SERVER and the live client into pages", async () => {
    const answer = await ask(port, "GET", "/docs/page.html")
    expect(answer.text).toContain(`<script src="/api/server/live.js" defer></script>`)
    const served = await config()
    // `source`:  the file on disk, what the site header's "open in VS Code" opens (epic `epic-engine` I42)
    expect(served).toMatchObject({ port, file: "/docs/page.html", source: page, token: server.web.guard.token })
    expect(served.etag).toBe(answer.headers.etag)
  })

  it("adds its settings' page scripts before `</body>`:  only those built, never on pages they skip", async () => {
    const tag = `<script type="module" src="/colours.js"></script>`
    const answer = await ask(port, "GET", "/docs/page.html")
    expect(answer.text).toContain(`${tag}\n</body>`)
    expect(answer.text).not.toContain("/unbuilt.js")
    // a component set's page:  skipped (`/components/`)
    expect((await ask(port, "GET", "/components/ui/ui-button.html")).text).not.toContain(tag)
    // a page with no `</body>`:  at its end
    expect((await ask(port, "GET", "/brand/index.html")).text.trimEnd().endsWith(tag)).toBe(true)
  })

  it("tells pages what route modules add (`addPageConfig()`), as each page is served", async () => {
    let flying = false
    server.addPageConfig(() => (flying ? { airplane: true } : {}))
    expect((await config()).airplane).toBeUndefined()
    flying = true
    expect((await config()).airplane).toBe(true)
    flying = false
  })

  it("sends / to the home page", async () => {
    const answer = await ask(port, "GET", "/")
    expect(answer.status).toBe(302)
    expect(answer.headers.location).toBe("/pages/index.html")
  })

  it("serves Spell UI's docs at /components/ui/:  its package's docs/, live;  its site bundle laid over at _assets/", async () => {
    const page = await ask(port, "GET", "/components/ui/ui-button.html")
    expect(page.status).toBe(200)
    expect(page.text).toContain("<p>UI</p>")
    expect(page.text).toContain(`<script src="/api/server/live.js" defer></script>`)
    expect(page.text).toContain(SRV.FAVICON_LINKS)
    const served = JSON.parse(/window\.SPELL_SERVER = (.*?)<\/script>/.exec(page.text)![1]!) as SRV.ServerConfig
    // the page's file, through the overlay:  what the page editor and comments act on
    expect(served.file).toBe("/packages/ui/docs/ui-button.html")
    const script = await ask(port, "GET", "/components/ui/_assets/site.js")
    expect(script.status).toBe(200)
    expect(script.headers["content-type"]).toMatch(/javascript/)
    expect(script.text).toBe("export {}\n")
    expect((await ask(port, "GET", "/components/ui/__data/components.json5")).text).toBe(`{"from":"ui"}\n`)
    expect((await ask(port, "GET", "/components/ui")).status).toBe(302)
    expect((await ask(port, "GET", "/components/ui/missing.html")).status).toBe(404)
    expect((await ask(port, "GET", "/components/ui/_assets/missing.js")).status).toBe(404)
  })

  it("serves every other set at /components/<set>/:  its docs/, with the sets' build of Spell UI's site as _assets/", async () => {
    // Epic UI's:  spell-epic's, through the checkout's link
    const set = join(engine, "src", "docs")
    mkdirSync(join(set, "__data"), { recursive: true })
    writeFileSync(join(set, "index.html"), "<!doctype html><head></head><p>Epic UI</p>\n")
    writeFileSync(join(set, "epic-item.html"), "<!doctype html><head></head><p>item</p>\n")
    writeFileSync(join(set, "__data", "components.json5"), `{"from":"epics"}\n`)
    const home = await ask(port, "GET", "/components/epics/")
    expect(home.status).toBe(200)
    expect(home.text).toContain("<p>Epic UI</p>")
    expect(home.text).toContain(`<script src="/api/server/live.js" defer></script>`)
    expect((await ask(port, "GET", "/components/epics/epic-item.html")).text).toContain("<p>item</p>")
    expect((await ask(port, "GET", "/components/epics/__data/components.json5")).text).toBe(`{"from":"epics"}\n`)
    // the bundle is the sets' build of Spell UI's site, one for every set but Spell UI's own
    mkdirSync(join(root, "packages", "ui", "site", "_assets", "sets"), { recursive: true })
    writeFileSync(join(root, "packages", "ui", "site", "_assets", "sets", "site.js"), "// sets\n")
    expect((await ask(port, "GET", "/components/epics/_assets/site.js")).text).toBe("// sets\n")
    expect((await ask(port, "GET", "/components/epics/missing.html")).status).toBe(404)
    // its address without the slash:  with it, so its pages' relative links resolve
    const bare = await ask(port, "GET", "/components/epics")
    expect(bare.status).toBe(302)
    expect(bare.headers.location).toBe("/components/epics/")
    // its long address is a plain folder:  no redirect (Q30)
    expect((await ask(port, "GET", "/spell-epic/src/docs/index.html")).status).toBe(200)
    expect(componentSetPath("/components/app/spell-app.html", server.componentSets)).toBe(
      "/packages/app/docs/spell-app.html"
    )
    expect(componentSetPath("/components/brand/brand-logo.html", server.componentSets)).toBe(
      "/packages/brand/docs/brand-logo.html"
    )
    expect(componentSetPath("/worktrees/w/components/epics/_assets/site.js", server.componentSets)).toBe(
      "/worktrees/w/packages/ui/site/_assets/sets/site.js"
    )
    expect(componentSetPath("/worktrees/w/components/ui/_assets/site.js", server.componentSets)).toBe(
      "/worktrees/w/packages/ui/site/_assets/site.js"
    )
    expect(componentSetPath("/worktrees/w/components/epics/x.html", server.componentSets)).toBe(
      "/worktrees/w/spell-epic/src/docs/x.html"
    )
    expect(componentSetPath("/components/epics", server.componentSets)).toBeUndefined()
    expect(componentSetPath("/components/nope/x.html", server.componentSets)).toBeUndefined()
  })

  it("serves a worktree's component set from the worktree, at /worktrees/<w>/components/<set>/", async () => {
    // where epics' route module says the worktrees are
    server.serveWorktrees(join(root, ".claude", "worktrees"))
    expect(server.info.worktrees).toBe(join(root, ".claude", "worktrees"))
    const worktree = join(root, ".claude", "worktrees", "w")
    mkdirSync(join(worktree, "spell-epic", "src", "docs"), { recursive: true })
    mkdirSync(join(worktree, "packages", "ui", "site", "_assets", "sets"), { recursive: true })
    writeFileSync(join(worktree, "spell-epic", "src", "docs", "index.html"), "<!doctype html><head></head><p>W</p>\n")
    writeFileSync(join(worktree, "packages", "ui", "site", "_assets", "sets", "site.js"), "// w\n")
    expect((await ask(port, "GET", "/worktrees/w/components/epics/")).text).toContain("<p>W</p>")
    expect((await ask(port, "GET", "/worktrees/w/components/epics/_assets/site.js")).text).toBe("// w\n")
    // and pages are told the folder, and the URL path live reload reports its files under (`SRV.servedPath()`)
    expect(await config()).toMatchObject({
      worktrees: join(root, ".claude", "worktrees"),
      worktreesPath: "/.claude/worktrees/"
    })
  })

  // epic `epic-eject` J28:  worktrees beside the repo, and those left in the old place, at the same URLs
  it("serves worktrees from several folders:  the first that has <w>;  each page told its own folder", async () => {
    // a checkout of its own:  stopping a second server here would take the first's pid file (same pid)
    const main = mkdtempSync(join(tmpdir(), "srv-places-"))
    mkdirSync(join(main, "docs"))
    writeFileSync(join(main, "docs", "page.html"), PAGE)
    const beside = `${main}.worktrees`
    const old = join(main, ".claude", "worktrees")
    const pageIn = (folder: string, name: string, text: string) => {
      mkdirSync(join(folder, name, "docs"), { recursive: true })
      writeFileSync(join(folder, name, "docs", "page.html"), `<!doctype html><head></head><p>${text}</p>\n`)
    }
    pageIn(beside, "moved", "beside")
    pageIn(beside, "both", "beside")
    pageIn(old, "both", "old")
    pageIn(old, "stayed", "old")
    const several = await new PageServer({ root: main }).start({
      port: 0,
      routes: false,
      pidFile: false,
      bundles: false
    })
    try {
      several.serveWorktrees(beside, old).serveWorktrees(old)
      expect(several.info).toMatchObject({ worktrees: beside, worktreesFolders: [beside, old] })
      const at = several.info.port
      const served = async (path: string) => {
        const answer = await ask(at, "GET", path)
        const told = JSON.parse(/window\.SPELL_SERVER = (.*?)<\/script>/.exec(answer.text)![1]!) as SRV.ServerConfig
        return { text: /<p>(.*?)<\/p>/.exec(answer.text)?.[1], ...told }
      }
      expect(await served("/worktrees/moved/docs/page.html")).toMatchObject({
        text: "beside",
        worktree: "moved",
        worktrees: beside,
        worktreesPath: urlPathOf(main, beside)
      })
      expect(await served("/worktrees/stayed/docs/page.html")).toMatchObject({
        text: "old",
        worktree: "stayed",
        worktrees: old,
        worktreesPath: "/.claude/worktrees/"
      })
      // a worktree in both places:  the first folder's
      expect((await served("/worktrees/both/docs/page.html")).text).toBe("beside")
      // a page of the main checkout:  the first folder
      expect(await served("/docs/page.html")).toMatchObject({ worktrees: beside })
      expect((await ask(at, "GET", "/worktrees/nowhere/docs/page.html")).status).toBe(404)
    } finally {
      await several.stop()
      for (const dir of [main, beside]) rmSync(dir, { recursive: true, force: true })
    }
  })

  // epic `epic-eject` P12:  the shared content with no link at the checkout's root
  it("serves the content folder at / after the checkout, and under every worktree's address (serveContent())", async () => {
    // a checkout of its own, with no links:  its content folder and worktrees beside it
    const main = mkdtempSync(join(tmpdir(), "srv-content-"))
    const content = `${main}.epics`
    const worktrees = `${main}.worktrees`
    const put = (file: string, text: string) => {
      mkdirSync(dirname(file), { recursive: true })
      writeFileSync(file, text)
    }
    const plan = join(content, "epics", "x", "x.plan.html")
    put(plan, "<!doctype html><head></head><p id=p>plan</p>\n")
    put(join(content, "brand", "index.html"), "<!doctype html><head></head><p>content brand</p>\n")
    put(join(main, "brand", "index.html"), "<!doctype html><head></head><p>checkout brand</p>\n")
    put(join(main, "other", "page.html"), "<!doctype html><head></head><p>other</p>\n")
    put(join(worktrees, "w", "epics", "own.html"), "<!doctype html><head></head><p>own</p>\n")
    put(join(main, "package.json"), JSON.stringify({ pageServer: { writable: ["epics", "guides"] } }))
    const served = await new PageServer({ root: main }).start({
      port: 0,
      routes: false,
      pidFile: false,
      bundles: false
    })
    try {
      const at = served.info.port
      const told = async (path: string) => {
        const answer = await ask(at, "GET", path)
        expect(answer.status, path).toBe(200)
        const config = JSON.parse(/window\.SPELL_SERVER = (.*?)<\/script>/.exec(answer.text)![1]!) as SRV.ServerConfig
        return { text: /<p[^>]*>(.*?)<\/p>/.exec(answer.text)?.[1], ...config }
      }
      expect((await ask(at, "GET", "/epics/x/x.plan.html")).status).toBe(404)
      // the content folder first, then the worktrees:  either order;  a second call with it changes nothing
      const context = served.routeContext()
      context.serveContent!(content)
      context.serveContent!(content)
      served.serveWorktrees(worktrees)
      expect(() => served.serveContent(worktrees)).toThrow(/already serving/)
      expect(JSON.parse((await ask(at, "GET", "/api/server")).text)).toMatchObject({ contentFolder: content })

      // its pages, told their path in it:  what the page editor saves and live reload reports;
      // and the file itself, in the content folder, not the checkout (`source`, epic `epic-engine` I42)
      expect(await told("/epics/x/x.plan.html")).toMatchObject({
        text: "plan",
        file: "/epics/x/x.plan.html",
        source: plan
      })
      // the checkout first
      expect((await told("/brand/index.html")).text).toBe("checkout brand")
      // under a worktree's address, after its own files, with ITS badge
      expect(await told("/worktrees/w/epics/x/x.plan.html")).toMatchObject({
        text: "plan",
        file: "/epics/x/x.plan.html",
        source: plan,
        worktree: "w",
        worktrees: worktrees
      })
      expect(await told("/worktrees/w/epics/own.html")).toMatchObject({
        text: "own",
        source: join(worktrees, "w", "epics", "own.html")
      })
      expect((await ask(at, "GET", "/worktrees/w/epics/missing.html")).status).toBe(404)

      // writes land in the content folder, and live pages hear of it at / and at the worktree's address
      const events = await listen(at)
      const changed = events.next("change", "/epics/x/x.plan.html")
      const inWorktree = events.next("change", `${urlPathOf(main, worktrees)}w/epics/x/x.plan.html`)
      await new Promise((done) => setTimeout(done, 100))
      const { etag } = await told("/epics/x/x.plan.html")
      const headers = { "content-type": "application/json", "x-server-token": served.web.guard.token }
      const patch = await ask(at, "PATCH", "/api/pages?path=/epics/x/x.plan.html", {
        headers: { ...headers, "if-match": etag! },
        body: JSON.stringify({ id: "p", html: "edited", inner: true })
      })
      expect(patch.status).toBe(200)
      expect(readFileSync(plan, "utf8")).toContain("<p id=p>edited</p>")
      expect(await changed).toEqual({ path: "/epics/x/x.plan.html" })
      expect(await inWorktree).toEqual({ path: `${urlPathOf(main, worktrees)}w/epics/x/x.plan.html` })
      events.close()
      const text = { ...headers, "content-type": "text/plain" }
      const saved = await ask(at, "PUT", "/api/files?path=/guides/new/notes.md", { headers: text, body: "# New\n" })
      expect(saved.status).toBe(200)
      expect(readFileSync(join(content, "guides", "new", "notes.md"), "utf8")).toBe("# New\n")
      expect(existsSync(join(main, "guides"))).toBe(false)
      expect((await ask(at, "PUT", "/api/files?path=/other/x.md", { headers: text, body: "x" })).status).toBe(403)
    } finally {
      await served.stop()
      for (const dir of [main, content, worktrees]) rmSync(dir, { recursive: true, force: true })
    }
  })

  // epic `repo-split` P4:  the sets and engine routes are settings, so the server names nothing of a repo's own
  it("reads its component sets and engine routes from its settings (componentSets(), engineRoutes())", () => {
    expect(server.componentSets.map((set) => [set.name, set.prefix])).toEqual([
      ["Spell UI", "/components/ui"],
      ["Epic UI", "/components/epics"],
      ["App UI", "/components/app"],
      ["Brand", "/components/brand"]
    ])
    expect(componentSets({ componentSets: { x: { name: "X", dir: "x/docs", assets: "x/_assets" } } })).toEqual([
      { name: "X", prefix: "/components/x", dir: "x/docs", assets: "x/_assets" }
    ])
    expect(engineRoutes({ engineRoutes: { "/_x": "/x/files/", "/y/": "y" } })).toEqual([
      ["/_x/", "/x/files/"],
      ["/y/", "/y/"]
    ])
    expect(componentSets({})).toEqual([])
    expect(engineRoutes({})).toEqual([])
  })

  // REFACTOR (epic `repo-split` P4):  until spell-epic's route-module tests write their scratch checkouts' sets
  it("serves this checkout's component sets when its root's settings name none (COMPONENT_SETS)", () => {
    const bare = mkdtempSync(join(tmpdir(), "srv-bare-"))
    try {
      expect(new PageServer({ root: bare }).componentSets).toBe(COMPONENT_SETS)
      expect(COMPONENT_SETS.map((set) => set.prefix)).toContain("/components/ui")
      expect(new PageServer({ root: bare }).engineRoutes).toEqual([])
    } finally {
      rmSync(bare, { recursive: true, force: true })
    }
  })

  it("urlPathOf():  a folder as a URL path from the root, inside it or beside it", () => {
    expect(urlPathOf("/r/app", "/r/app/.claude/worktrees")).toBe("/.claude/worktrees/")
    expect(urlPathOf("/r/app", "/r/app.worktrees")).toBe("/../app.worktrees/")
    expect(urlPathOf("/r/app", "/r/app")).toBe("/")
  })

  it("serves the engine's routes (/_epic/assets/, /_epic/pack/) from spell-epic, through the link (engineRoutePath())", async () => {
    mkdirSync(join(engine, "src", "tools", "_assets"), { recursive: true })
    writeFileSync(join(engine, "src", "tools", "_assets", "engine.js"), "// engine\n")
    mkdirSync(join(engine, "src", "components", "__pack"), { recursive: true })
    writeFileSync(join(engine, "src", "components", "__pack", "epics.pack.js"), "// pack\n")
    expect((await ask(port, "GET", "/_epic/assets/engine.js")).text).toBe("// engine\n")
    expect((await ask(port, "GET", "/_epic/pack/epics.pack.js")).text).toBe("// pack\n")
    expect((await ask(port, "GET", "/_epic/assets/missing.js")).status).toBe(404)
    expect(engineRoutePath("/_epic/assets/emoji/cldr/a.js", server.engineRoutes)).toBe(
      "/spell-epic/src/tools/_assets/emoji/cldr/a.js"
    )
    expect(engineRoutePath("/epics/x.html", server.engineRoutes)).toBeUndefined()
  })

  // epic-eject T11:  every template is the engine's, spell-epic's `templates/`
  it("serves the templates (/templates/) from spell-epic, from a worktree's address too (engineRoutePath())", async () => {
    mkdirSync(join(engine, "templates"), { recursive: true })
    writeFileSync(join(engine, "templates", "durable.html"), "<title>Guide Template</title>\n")
    expect((await ask(port, "GET", "/templates/durable.html")).text).toContain("<title>Guide Template</title>")
    expect((await ask(port, "GET", "/templates/missing.html")).status).toBe(404)
    expect(engineRoutePath("/templates/goals/index.html", server.engineRoutes)).toBe(
      "/spell-epic/templates/goals/index.html"
    )
    expect(engineRoutePath("/worktrees/seo/templates/durable.html", server.engineRoutes)).toBe(
      "/spell-epic/templates/durable.html"
    )
    expect(engineRoutePath("/worktrees/seo/guides/x.html", server.engineRoutes)).toBeUndefined()
  })

  it("reloads a set's pages when their files change, and when its bundle does", async () => {
    const events = await listen(port)
    const changed = events.next("change", "/components/ui/ui-button.html")
    await new Promise((done) => setTimeout(done, 100))
    writeFileSync(join(root, "packages", "ui", "docs", "ui-button.html"), "<!doctype html><head></head><p>UI 2</p>\n")
    expect(await changed).toEqual({ path: "/components/ui/ui-button.html" })
    const rebuilt = events.next("change", "/components/ui/_assets/site.js")
    writeFileSync(join(root, "packages", "ui", "site", "_assets", "site.js"), "export { }\n")
    expect(await rebuilt).toEqual({ path: "/components/ui/_assets/site.js" })
    events.close()
  })

  it("refuses foreign hosts", async () => {
    expect((await ask(port, "GET", "/docs/page.html", { headers: { host: "evil.example" } })).status).toBe(403)
  })

  it("reads a page, or one element, with its ETag", async () => {
    const whole = JSON.parse((await ask(port, "GET", "/api/pages?path=/docs/page.html")).text)
    expect(whole.html).toBe(readFileSync(page, "utf8"))
    const two = JSON.parse((await ask(port, "GET", "/api/pages?path=docs/page.html&id=two&inner=1")).text)
    expect(two).toMatchObject({ html: "Two", etag: whole.etag })
  })

  it("patches one section, keeping the rest", async () => {
    const before = readFileSync(page, "utf8")
    const { etag } = await config()
    const answer = await ask(port, "PATCH", "/api/pages?path=/docs/page.html", {
      headers: writeHeaders(etag!),
      body: JSON.stringify({ id: "two", html: "Zwei", inner: true })
    })
    expect(answer.status).toBe(200)
    expect(readFileSync(page, "utf8")).toBe(before.replace("'two'>Two<", "'two'>Zwei<"))
    expect(JSON.parse(answer.text).etag).not.toBe(etag)
  })

  it("refuses stale or missing If-Match, bad tokens, bad paths and bad ids", async () => {
    const body = JSON.stringify({ id: "two", html: "x", inner: true })
    const path = "/api/pages?path=/docs/page.html"
    const { etag } = await config()
    expect((await ask(port, "PATCH", path, { headers: writeHeaders(`"0-0"`), body })).status).toBe(409)
    const noMatch = { "content-type": "application/json", "x-server-token": server.web.guard.token }
    expect((await ask(port, "PATCH", path, { headers: noMatch, body })).status).toBe(428)
    const badToken = { ...writeHeaders(etag!), "x-server-token": "nope" }
    expect((await ask(port, "PATCH", path, { headers: badToken, body })).status).toBe(403)
    const evil = { ...writeHeaders(etag!), origin: "http://evil.example" }
    expect((await ask(port, "PATCH", path, { headers: evil, body })).status).toBe(403)
    const dup = JSON.stringify({ id: "dup", html: "x" })
    expect((await ask(port, "PATCH", path, { headers: writeHeaders(etag!), body: dup })).status).toBe(409)
    const missing = JSON.stringify({ id: "nope", html: "x" })
    expect((await ask(port, "PATCH", path, { headers: writeHeaders(etag!), body: missing })).status).toBe(404)
    const outside = "/api/pages?path=/../etc/passwd"
    expect((await ask(port, "PATCH", outside, { headers: writeHeaders(etag!), body })).status).toBe(403)
    const json = "/api/pages?path=/package.json"
    expect((await ask(port, "PUT", json, { headers: writeHeaders(etag!), body: "{}" })).status).toBe(400)
  })

  it("puts a whole page, then tells live pages it changed", async () => {
    const events = await listen(port)
    const { etag } = await config()
    const answer = await ask(port, "PUT", "/api/pages?path=/docs/page.html", {
      headers: writeHeaders(etag!, "text/html"),
      body: "<!doctype html><p id=x>new</p>\n"
    })
    expect(answer.status).toBe(200)
    expect(readFileSync(page, "utf8")).toBe("<!doctype html><p id=x>new</p>\n")
    expect(await events.next("change", "/docs/page.html")).toEqual({ path: "/docs/page.html" })
    events.close()
  })

  it("says hello with its run, the run its pages got:  a page from an earlier run knows to reload", async () => {
    const events = await listen(port)
    const { run } = await config()
    expect(run).toMatch(/^[0-9a-f]{8}$/)
    expect(await events.next("hello")).toEqual({ run })
    events.close()
  })

  it("serves a script's fetch() the file AS IS:  no injected tags", async () => {
    const fetched = await ask(port, "GET", "/docs/page.html", { headers: { "sec-fetch-dest": "empty" } })
    expect(fetched.text).toBe(readFileSync(page, "utf8"))
    expect(fetched.headers.etag).toBeTruthy()
  })

  it("puts a whole TEXT file (what <ui-code> / <ui-markdown> save);  never .json or a binary", async () => {
    const notes = join(root, "docs", "notes.md")
    writeFileSync(notes, "# Notes\n")
    const etag = (await ask(port, "GET", "/docs/notes.md")).headers.etag as string
    const answer = await ask(port, "PUT", "/api/pages?path=/docs/notes.md", {
      headers: writeHeaders(etag, "text/plain; charset=utf-8"),
      body: "# Notes\n\nSaved.\n"
    })
    expect(answer.status).toBe(200)
    expect(readFileSync(notes, "utf8")).toBe("# Notes\n\nSaved.\n")
    expect(JSON.parse(answer.text).etag).not.toBe(etag)
    const stale = await ask(port, "PUT", "/api/pages?path=/docs/notes.md", {
      headers: writeHeaders(etag, "text/plain"),
      body: "lost"
    })
    expect(stale.status).toBe(409)
    writeFileSync(join(root, "docs", "logo.png"), "x")
    const binary = await ask(port, "PUT", "/api/pages?path=/docs/logo.png", {
      headers: writeHeaders(etag, "text/plain"),
      body: "x"
    })
    expect(binary.status).toBe(400)
  })

  it("writes pages through /api/pages in its package.json's `writable` folders ONLY;  reads any", async () => {
    const outside = join(root, "other", "readme.md")
    writeFileSync(outside, "# UI\n")
    const etag = (await ask(port, "GET", "/other/readme.md")).headers.etag as string
    const read = await ask(port, "GET", "/api/pages?path=/other/readme.md")
    expect(JSON.parse(read.text)).toMatchObject({ html: "# UI\n", etag })
    const put = await ask(port, "PUT", "/api/pages?path=/other/readme.md", {
      headers: writeHeaders(etag, "text/plain"),
      body: "lost"
    })
    expect(put.status).toBe(403)
    expect(readFileSync(outside, "utf8")).toBe("# UI\n")
    const pageEtag = (await ask(port, "GET", "/other/button.html", { headers: { "sec-fetch-dest": "empty" } })).headers
      .etag as string
    const patch = await ask(port, "PATCH", "/api/pages?path=/other/button.html", {
      headers: writeHeaders(pageEtag),
      body: JSON.stringify({ id: "x", html: "<p>x</p>" })
    })
    expect(patch.status).toBe(403)
  })

  it("changes files through /api/files, in its package.json's `writable` folders ONLY", async () => {
    const headers = { "content-type": "text/plain", "x-server-token": server.web.guard.token }
    const saved = await ask(port, "PUT", "/api/files?path=/docs/saved/notes.md", { headers, body: "# Saved\n" })
    expect(saved.status).toBe(200)
    expect(readFileSync(join(root, "docs", "saved", "notes.md"), "utf8")).toBe("# Saved\n")
    expect((await ask(port, "PUT", "/api/files?path=/other/notes.md", { headers, body: "x" })).status).toBe(403)
    expect(existsSync(join(root, "other", "notes.md"))).toBe(false)
  })

  it("patches pages only:  a text file has no elements to replace", async () => {
    const etag = (await ask(port, "GET", "/docs/notes.md")).headers.etag as string
    const body = JSON.stringify({ id: "x", html: "<p>x</p>" })
    const answer = await ask(port, "PATCH", "/api/pages?path=/docs/notes.md", { headers: writeHeaders(etag), body })
    expect(answer.status).toBe(400)
  })

  it("on stop, removes its own pid file, never another server's", async () => {
    const file = join(root, ".spell-server.json")
    const mine = readFileSync(file, "utf8")
    writeFileSync(file, JSON.stringify({ ...JSON.parse(mine), pid: 1 }))
    const other = await new PageServer({ root }).start({ port: 0, routes: false, pidFile: false })
    await other.stop()
    expect(existsSync(file)).toBe(true)
    writeFileSync(file, mine)
    server.pidFile.removeIfOurs()
    expect(existsSync(file)).toBe(false)
  })
})

/**
 * Listen to the live-reload websocket (`SRV.LIVE_EVENTS`) on `port`, as a page does.
 * - `next(event, path)`:  resolves with the data of the next `event` about `path` (none:  an event with no path)
 * - the `hello` every socket opens with is kept, so `next("hello")` finds it however late it asks
 */
function listen(
  port: number
): Promise<{ next: (event: string, path?: string) => Promise<unknown>; close: () => void }> {
  return new Promise((done, fail) => {
    const waiting: { event: string; path?: string; resolve: (data: unknown) => void }[] = []
    let hello: unknown
    const socket = new WebSocket(`ws://127.0.0.1:${port}${SRV.LIVE_EVENTS}`)
    socket.addEventListener("message", (message: MessageEvent<string>) => {
      const { event, data } = JSON.parse(message.data) as { event: string; data: { path?: string } }
      if (event === "hello") hello = data
      const at = waiting.findIndex((each) => each.event === event && each.path === data.path)
      if (at >= 0) waiting.splice(at, 1)[0]!.resolve(data)
    })
    socket.addEventListener("error", () => fail(new Error(`no live-reload websocket on port ${port}`)))
    socket.addEventListener("open", () =>
      done({
        next: (event, path) =>
          event === "hello" && hello
            ? Promise.resolve(hello)
            : new Promise((resolve) => waiting.push({ event, path, resolve })),
        close: () => socket.close()
      })
    )
  })
}
