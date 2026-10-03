import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { SRV } from "$/server"
import { ask, serveHandler, type Served } from "$/server/test/serve"

/** Two folders:  `site/` at `/`, `element/` at `/element/`. */
const DIR = mkdtempSync(join(tmpdir(), "srv-static-"))
mkdirSync(join(DIR, "site", "docs"), { recursive: true })
mkdirSync(join(DIR, "element"))
writeFileSync(join(DIR, "site", "index.html"), "<html><head></head><body>home</body></html>")
writeFileSync(join(DIR, "site", "docs", "index.html"), "<html><head></head><body>docs</body></html>")
writeFileSync(join(DIR, "site", "app.ts"), "const x: number = 1")
writeFileSync(join(DIR, "site", "style.css"), "a{}")
writeFileSync(join(DIR, "site", ".hidden"), "no")
writeFileSync(join(DIR, "element", "spell-app.js"), "export {}")

describe("StaticHandler", () => {
  let served: Served

  beforeAll(async () => {
    const files = new SRV.StaticHandler({
      mounts: [
        { prefix: "/", dir: join(DIR, "site") },
        { prefix: "/element", dir: join(DIR, "element") }
      ],
      html: [(html, { path }) => html.replace("<head>", `<head><meta name="path" content="${path}">`)],
      transforms: {
        ".ts": (source) => ({ body: `/* js */ ${source.replace(": number", "")}`, type: SRV.TYPES[".js"]! })
      }
    })
    const router = new SRV.Router().use(files.handle).get("*", (_request, reply) => reply.send("fallback"))
    served = await serveHandler(router.handle)
  })

  afterAll(async () => {
    await served.close()
    rmSync(DIR, { recursive: true, force: true })
  })

  it("serves files with type, no-store and an ETag", async () => {
    const answer = await ask(served.port, "GET", "/style.css")
    expect(answer.text).toBe("a{}")
    expect(answer.headers["content-type"]).toBe("text/css; charset=utf-8")
    expect(answer.headers["cache-control"]).toBe("no-store")
    expect(answer.headers.etag).toMatch(/^"[0-9a-f]+-[0-9a-f]+"$/)
  })

  it("picks the longest prefix", async () => {
    expect((await ask(served.port, "GET", "/element/spell-app.js")).text).toBe("export {}")
  })

  it("runs html hooks on pages, with the path", async () => {
    const answer = await ask(served.port, "GET", "/docs/")
    expect(answer.text).toContain(`<meta name="path" content="/docs/">`)
    expect(answer.text).toContain("docs")
  })

  it("redirects a folder without its slash", async () => {
    const answer = await ask(served.port, "GET", "/docs")
    expect(answer.status).toBe(301)
    expect(answer.headers.location).toBe("/docs/")
  })

  it("redirects a mount's own folder without its slash", async () => {
    const answer = await ask(served.port, "GET", "/element")
    expect(answer.status).toBe(301)
    expect(answer.headers.location).toBe("/element/")
  })

  it("runs transforms by extension", async () => {
    const answer = await ask(served.port, "GET", "/app.ts")
    expect(answer.headers["content-type"]).toBe("text/javascript; charset=utf-8")
    expect(answer.text).toBe("/* js */ const x = 1")
  })

  it("refuses dot files and escapes;  passes misses on", async () => {
    expect((await ask(served.port, "GET", "/.hidden")).status).toBe(403)
    expect((await ask(served.port, "GET", "/%2e%2e/element/spell-app.js")).status).toBe(403)
    expect((await ask(served.port, "GET", "/missing.html")).text).toBe("fallback")
    expect((await ask(served.port, "POST", "/style.css")).status).toBe(404)
  })
})
