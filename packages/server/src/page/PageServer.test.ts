import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { get } from "node:http"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { SRV } from "$/server"
import { PageServer, findById, replaceById } from "$/server/page"
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
    writeFileSync(join(root, "package.json"), JSON.stringify({ pageServer: { watch: ["docs"] } }))
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

  it("writes its pid file and answers ping", async () => {
    expect(JSON.parse(readFileSync(join(root, ".spell-server.json"), "utf8"))).toMatchObject({ port, root })
    expect(JSON.parse((await ask(port, "GET", "/_server/ping")).text)).toMatchObject({ pid: process.pid, root })
    expect(await server.pidFile.status()).toMatchObject({ port, base: `http://127.0.0.1:${port}` })
  })

  it("injects SPELL_SERVER and the live client into pages", async () => {
    const answer = await ask(port, "GET", "/docs/page.html")
    expect(answer.text).toContain(`<script src="/_server/live.js" defer></script>`)
    const served = await config()
    expect(served).toMatchObject({ port, file: "/docs/page.html", token: server.web.guard.token })
    expect(served.etag).toBe(answer.headers.etag)
  })

  it("redirects old plan doc URLs from plans/ to epics/, query kept", async () => {
    const answer = await ask(port, "GET", "/packages/docs/plans/x/x.html?a=1")
    expect(answer.status).toBe(302)
    expect(answer.headers.location).toBe("/packages/docs/epics/x/x.html?a=1")
  })

  it("refuses foreign hosts", async () => {
    expect((await ask(port, "GET", "/docs/page.html", { headers: { host: "evil.example" } })).status).toBe(403)
  })

  it("reads a page, or one element, with its ETag", async () => {
    const whole = JSON.parse((await ask(port, "GET", "/_server/page?path=/docs/page.html")).text)
    expect(whole.html).toBe(readFileSync(page, "utf8"))
    const two = JSON.parse((await ask(port, "GET", "/_server/page?path=docs/page.html&id=two&inner=1")).text)
    expect(two).toMatchObject({ html: "Two", etag: whole.etag })
  })

  it("patches one section, keeping the rest", async () => {
    const before = readFileSync(page, "utf8")
    const { etag } = await config()
    const answer = await ask(port, "PATCH", "/_server/page?path=/docs/page.html", {
      headers: writeHeaders(etag!),
      body: JSON.stringify({ id: "two", html: "Zwei", inner: true })
    })
    expect(answer.status).toBe(200)
    expect(readFileSync(page, "utf8")).toBe(before.replace("'two'>Two<", "'two'>Zwei<"))
    expect(JSON.parse(answer.text).etag).not.toBe(etag)
  })

  it("refuses stale or missing If-Match, bad tokens, bad paths and bad ids", async () => {
    const body = JSON.stringify({ id: "two", html: "x", inner: true })
    const path = "/_server/page?path=/docs/page.html"
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
    const outside = "/_server/page?path=/../etc/passwd"
    expect((await ask(port, "PATCH", outside, { headers: writeHeaders(etag!), body })).status).toBe(403)
    const json = "/_server/page?path=/package.json"
    expect((await ask(port, "PUT", json, { headers: writeHeaders(etag!), body: "{}" })).status).toBe(400)
  })

  it("puts a whole page, then tells live pages it changed", async () => {
    const events = await listen(port)
    const { etag } = await config()
    const answer = await ask(port, "PUT", "/_server/page?path=/docs/page.html", {
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
    const answer = await ask(port, "PUT", "/_server/page?path=/docs/notes.md", {
      headers: writeHeaders(etag, "text/plain; charset=utf-8"),
      body: "# Notes\n\nSaved.\n"
    })
    expect(answer.status).toBe(200)
    expect(readFileSync(notes, "utf8")).toBe("# Notes\n\nSaved.\n")
    expect(JSON.parse(answer.text).etag).not.toBe(etag)
    const stale = await ask(port, "PUT", "/_server/page?path=/docs/notes.md", {
      headers: writeHeaders(etag, "text/plain"),
      body: "lost"
    })
    expect(stale.status).toBe(409)
    writeFileSync(join(root, "docs", "logo.png"), "x")
    const binary = await ask(port, "PUT", "/_server/page?path=/docs/logo.png", {
      headers: writeHeaders(etag, "text/plain"),
      body: "x"
    })
    expect(binary.status).toBe(400)
  })

  it("patches pages only:  a text file has no elements to replace", async () => {
    const etag = (await ask(port, "GET", "/docs/notes.md")).headers.etag as string
    const body = JSON.stringify({ id: "x", html: "<p>x</p>" })
    const answer = await ask(port, "PATCH", "/_server/page?path=/docs/notes.md", { headers: writeHeaders(etag), body })
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
 * Listen to `/_server/events` on `port`.
 * - `next(event, path)`:  resolves with the data of the next `event` about `path`
 */
function listen(port: number): Promise<{ next: (event: string, path: string) => Promise<unknown>; close: () => void }> {
  return new Promise((done) => {
    const waiting: { event: string; path: string; resolve: (data: unknown) => void }[] = []
    let buffer = ""
    const request = get({ host: "127.0.0.1", port, path: "/_server/events" }, (response) => {
      response.setEncoding("utf8")
      response.on("data", (chunk: string) => {
        buffer += chunk
        let end: number
        while ((end = buffer.indexOf("\n\n")) >= 0) {
          const block = buffer.slice(0, end)
          buffer = buffer.slice(end + 2)
          const event = /^event: (.*)$/m.exec(block)?.[1]
          const data = /^data: (.*)$/m.exec(block)?.[1]
          const parsed = data ? (JSON.parse(data) as { path?: string }) : undefined
          const at = waiting.findIndex((each) => each.event === event && each.path === parsed?.path)
          if (at >= 0) waiting.splice(at, 1)[0]!.resolve(parsed)
        }
      })
      done({
        next: (event, path) => new Promise((resolve) => waiting.push({ event, path, resolve })),
        close: () => request.destroy()
      })
    })
  })
}
