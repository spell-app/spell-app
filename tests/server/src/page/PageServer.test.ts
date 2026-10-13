import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { SRV } from "$/server"
import {
  AirplaneMode,
  HIGHLIGHT_JS,
  PageServer,
  componentSetPath,
  findById,
  oldAssetsPath,
  replaceById,
  uiBuildPath
} from "$/server/page"
import { ask } from "$/server/test/serve"

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
  let server: PageServer
  let port: number

  beforeAll(async () => {
    mkdirSync(join(root, "docs"))
    // Spell UI's two halves:  the pages (`ui/`, a link into the shared repo in a real checkout) and the build
    mkdirSync(join(root, "ui", "_data"), { recursive: true })
    mkdirSync(join(root, "packages", "ui", "site", "_assets"), { recursive: true })
    mkdirSync(join(root, "packages", "ui", "site", "_data"), { recursive: true })
    writeFileSync(join(root, "ui", "button.html"), "<!doctype html><head></head><p>UI</p>\n")
    writeFileSync(join(root, "ui", "_data", "search.json"), `{"from":"pages"}\n`)
    writeFileSync(join(root, "packages", "ui", "site", "_assets", "site.js"), "export {}\n")
    writeFileSync(join(root, "packages", "ui", "site", "_data", "components.json"), `{"from":"build"}\n`)
    writeFileSync(join(root, "package.json"), JSON.stringify({ pageServer: { watch: ["docs"], writable: ["docs"] } }))
    writeFileSync(page, PAGE)
    server = await new PageServer({ root }).start({ port: 0, routes: false })
    port = server.info.port
  })

  afterAll(async () => {
    await server.stop()
    rmSync(root, { recursive: true, force: true })
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
    expect(served).toMatchObject({ port, file: "/docs/page.html", token: server.web.guard.token })
    expect(served.etag).toBe(answer.headers.etag)
  })

  it("serves highlight.js from the repo, not cdnjs, so pages load offline", async () => {
    const offline = join(root, "docs", "offline.html")
    writeFileSync(offline, `<!doctype html><head></head><script src="${HIGHLIGHT_JS.cdn}"></script>\n`)
    const answer = await ask(port, "GET", "/docs/offline.html")
    expect(answer.text).toContain(`<script src="${HIGHLIGHT_JS.local}"></script>`)
    expect(answer.text).not.toContain("cdnjs")
  })

  it("tells pages when airplane mode is on", async () => {
    const before = process.env.SPELL_AIRPLANE_FILE
    process.env.SPELL_AIRPLANE_FILE = join(root, "airplane.json")
    try {
      expect((await config()).airplane).toBeUndefined()
      AirplaneMode.turn(true)
      expect((await config()).airplane).toBe(true)
    } finally {
      AirplaneMode.turn(false)
      if (before === undefined) delete process.env.SPELL_AIRPLANE_FILE
      else process.env.SPELL_AIRPLANE_FILE = before
    }
  })

  it("sends / to the docs home", async () => {
    const answer = await ask(port, "GET", "/")
    expect(answer.status).toBe(302)
    expect(answer.headers.location).toBe("/pages/index.html")
  })

  it("serves Spell UI's docs at /ui/:  the pages from ui/, live;  the build's _assets/ and _data/ laid over", async () => {
    const page = await ask(port, "GET", "/ui/button.html")
    expect(page.status).toBe(200)
    expect(page.text).toContain("<p>UI</p>")
    expect(page.text).toContain(`<script src="/api/server/live.js" defer></script>`)
    expect(page.text).toContain(SRV.FAVICON_LINKS)
    const served = JSON.parse(/window\.SPELL_SERVER = (.*?)<\/script>/.exec(page.text)![1]!) as SRV.ServerConfig
    expect(served.file).toBe("/ui/button.html")
    const script = await ask(port, "GET", "/ui/_assets/site.js")
    expect(script.status).toBe(200)
    expect(script.headers["content-type"]).toMatch(/javascript/)
    expect((await ask(port, "GET", "/ui/_data/components.json")).text).toBe(`{"from":"build"}\n`)
    // a file the build lacks:  the pages' own
    expect((await ask(port, "GET", "/ui/_data/search.json")).text).toBe(`{"from":"pages"}\n`)
    expect((await ask(port, "GET", "/ui")).status).toBe(301)
    expect((await ask(port, "GET", "/ui/missing.html")).status).toBe(404)
    expect((await ask(port, "GET", "/ui/_assets/missing.js")).status).toBe(404)
  })

  it("serves a worktree's Spell UI docs with ITS build laid over, at /worktrees/<w>/ui/", async () => {
    const worktree = join(root, ".claude", "worktrees", "w")
    mkdirSync(join(worktree, "ui"), { recursive: true })
    mkdirSync(join(worktree, "packages", "ui", "site", "_assets"), { recursive: true })
    writeFileSync(join(worktree, "ui", "button.html"), "<!doctype html><head></head><p>W</p>\n")
    writeFileSync(join(worktree, "packages", "ui", "site", "_assets", "site.js"), "// w\n")
    expect((await ask(port, "GET", "/worktrees/w/ui/button.html")).text).toContain("<p>W</p>")
    expect((await ask(port, "GET", "/worktrees/w/ui/_assets/site.js")).text).toBe("// w\n")
    expect(uiBuildPath("/worktrees/w/ui/_data/x.json")).toBe("/worktrees/w/packages/ui/site/_data/x.json")
    expect(uiBuildPath("/ui/components/x.html")).toBeUndefined()
  })

  it("serves a component set at its short address:  its own folder, with Spell UI's site bundle as its _assets/", async () => {
    const set = join(root, "packages", "epic-components")
    mkdirSync(join(set, "elements"), { recursive: true })
    mkdirSync(join(set, "_data"), { recursive: true })
    writeFileSync(join(set, "index.html"), "<!doctype html><head></head><p>Epic UI</p>\n")
    writeFileSync(join(set, "elements", "epic-item.html"), "<!doctype html><head></head><p>item</p>\n")
    writeFileSync(join(set, "_data", "components.json"), `{"from":"epic-ui"}\n`)
    const home = await ask(port, "GET", "/epic-ui/")
    expect(home.status).toBe(200)
    expect(home.text).toContain("<p>Epic UI</p>")
    expect(home.text).toContain(`<script src="/api/server/live.js" defer></script>`)
    expect((await ask(port, "GET", "/epic-ui/elements/epic-item.html")).text).toContain("<p>item</p>")
    expect((await ask(port, "GET", "/epic-ui/_data/components.json")).text).toBe(`{"from":"epic-ui"}\n`)
    // the bundle is the sets' build of Spell UI's site, one for every set
    mkdirSync(join(root, "packages", "ui", "site", "_assets", "sets"), { recursive: true })
    writeFileSync(join(root, "packages", "ui", "site", "_assets", "sets", "site.js"), "// sets\n")
    expect((await ask(port, "GET", "/epic-ui/_assets/site.js")).text).toBe("// sets\n")
    expect((await ask(port, "GET", "/epic-ui/missing.html")).status).toBe(404)
    // its address without the slash:  with it, so its pages' relative links resolve
    const bare = await ask(port, "GET", "/epic-ui")
    expect(bare.status).toBe(302)
    expect(bare.headers.location).toBe("/epic-ui/")
    // its long address is a plain folder now:  no redirect (Q30)
    expect((await ask(port, "GET", "/packages/epic-components/index.html")).status).toBe(200)
    // App UI's folder is the app's components:  one entry, the same route
    expect(componentSetPath("/app-ui/spell-app.html")).toBe("/packages/app/components/spell-app.html")
    expect(componentSetPath("/worktrees/w/epic-ui/_assets/site.js")).toBe(
      "/worktrees/w/packages/ui/site/_assets/sets/site.js"
    )
    expect(componentSetPath("/worktrees/w/epic-ui/x.html")).toBe("/worktrees/w/packages/epic-components/x.html")
    expect(componentSetPath("/epic-ui")).toBeUndefined()
    expect(componentSetPath("/ui/x.html")).toBeUndefined()
  })

  it("serves a worktree's component set from the worktree, at /worktrees/<w>/epic-ui/", async () => {
    const worktree = join(root, ".claude", "worktrees", "w")
    mkdirSync(join(worktree, "packages", "epic-components"), { recursive: true })
    mkdirSync(join(worktree, "packages", "ui", "site", "_assets", "sets"), { recursive: true })
    writeFileSync(join(worktree, "packages", "epic-components", "index.html"), "<!doctype html><head></head><p>W</p>\n")
    writeFileSync(join(worktree, "packages", "ui", "site", "_assets", "sets", "site.js"), "// w\n")
    expect((await ask(port, "GET", "/worktrees/w/epic-ui/")).text).toContain("<p>W</p>")
    expect((await ask(port, "GET", "/worktrees/w/epic-ui/_assets/site.js")).text).toBe("// w\n")
  })

  it("serves the docs assets' OLD folder from epics' tools, until this epic merges (oldAssetsPath())", async () => {
    mkdirSync(join(root, "packages", "epics", "tools", "_assets"), { recursive: true })
    writeFileSync(join(root, "packages", "epics", "tools", "_assets", "runtime.js"), "// epics\n")
    const old = await ask(port, "GET", "/packages/docs/tools/_assets/runtime.js")
    expect(old.status).toBe(200)
    expect(old.text).toBe("// epics\n")
    expect((await ask(port, "GET", "/packages/docs/tools/_assets/missing.js")).status).toBe(404)
    expect(oldAssetsPath("/worktrees/w/packages/docs/tools/_assets/a/b.js")).toBe(
      "/worktrees/w/packages/epics/tools/_assets/a/b.js"
    )
    expect(oldAssetsPath("/packages/docs/tools/index.js")).toBeUndefined()
  })

  it("reloads /ui/ pages when their files change, and when the bundle does", async () => {
    const events = await listen(port)
    const changed = events.next("change", "/ui/button.html")
    await new Promise((done) => setTimeout(done, 100))
    writeFileSync(join(root, "ui", "button.html"), "<!doctype html><head></head><p>UI 2</p>\n")
    expect(await changed).toEqual({ path: "/ui/button.html" })
    const rebuilt = events.next("change", "/ui/_assets/site.js")
    writeFileSync(join(root, "packages", "ui", "site", "_assets", "site.js"), "export { }\n")
    expect(await rebuilt).toEqual({ path: "/ui/_assets/site.js" })
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
    const outside = join(root, "ui", "readme.md")
    writeFileSync(outside, "# UI\n")
    const etag = (await ask(port, "GET", "/ui/readme.md")).headers.etag as string
    const read = await ask(port, "GET", "/api/pages?path=/ui/readme.md")
    expect(JSON.parse(read.text)).toMatchObject({ html: "# UI\n", etag })
    const put = await ask(port, "PUT", "/api/pages?path=/ui/readme.md", {
      headers: writeHeaders(etag, "text/plain"),
      body: "lost"
    })
    expect(put.status).toBe(403)
    expect(readFileSync(outside, "utf8")).toBe("# UI\n")
    const pageEtag = (await ask(port, "GET", "/ui/button.html", { headers: { "sec-fetch-dest": "empty" } })).headers
      .etag as string
    const patch = await ask(port, "PATCH", "/api/pages?path=/ui/button.html", {
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
    expect((await ask(port, "PUT", "/api/files?path=/ui/notes.md", { headers, body: "x" })).status).toBe(403)
    expect(existsSync(join(root, "ui", "notes.md"))).toBe(false)
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
 * - `next(event, path)`:  resolves with the data of the next `event` about `path`
 */
function listen(port: number): Promise<{ next: (event: string, path: string) => Promise<unknown>; close: () => void }> {
  return new Promise((done, fail) => {
    const waiting: { event: string; path: string; resolve: (data: unknown) => void }[] = []
    const socket = new WebSocket(`ws://127.0.0.1:${port}${SRV.LIVE_EVENTS}`)
    socket.addEventListener("message", (message: MessageEvent<string>) => {
      const { event, data } = JSON.parse(message.data) as { event: string; data: { path?: string } }
      const at = waiting.findIndex((each) => each.event === event && each.path === data.path)
      if (at >= 0) waiting.splice(at, 1)[0]!.resolve(data)
    })
    socket.addEventListener("error", () => fail(new Error(`no live-reload websocket on port ${port}`)))
    socket.addEventListener("open", () =>
      done({
        next: (event, path) => new Promise((resolve) => waiting.push({ event, path, resolve })),
        close: () => socket.close()
      })
    )
  })
}
