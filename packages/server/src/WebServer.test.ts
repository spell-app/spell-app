import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

import { SRV } from "$/server"
// the leaf, not the `site` barrel:  that's browser code (`SiteHeader extends HTMLElement`)
import { FAVICON_SVG } from "$/server/site/favicon"
import { ask } from "$/server/test/serve"

describe("WebServer's favicon", () => {
  const root = mkdtempSync(join(tmpdir(), "srv-web-"))
  let live: SRV.WebServer
  let plain: SRV.WebServer
  let mine: SRV.WebServer

  beforeAll(async () => {
    writeFileSync(join(root, "page.html"), "<!doctype html><html><head><title>T</title></head><body>P</body></html>\n")
    writeFileSync(
      join(root, "own.html"),
      `<!doctype html><head><link href="x.svg" rel="icon"></head><body><code>&lt;link rel="icon"&gt;</code></body>\n`
    )
    writeFileSync(join(root, "body.html"), `<!doctype html><head></head><body><link rel="icon" href="x.svg"></body>\n`)
    mkdirSync(join(root, "own"))
    writeFileSync(join(root, "own", "favicon.ico"), "ICO")
    live = new SRV.WebServer({ live: true, mounts: [{ prefix: "/", dir: root }] })
    plain = new SRV.WebServer({ mounts: [{ prefix: "/", dir: root }] })
    // a folder with its own favicon.ico at `/`:  it wins
    mine = new SRV.WebServer({ mounts: [{ prefix: "/", dir: join(root, "own") }] })
    // an SPA's fallback answers everything else:  `/favicon.ico` still comes first
    plain.fallback.get("/*", (_request, reply) => reply.send("<!doctype html>SPA"))
    await Promise.all([live.listen(), plain.listen(), mine.listen()])
  })

  afterAll(async () => {
    await Promise.all([live.close(), plain.close(), mine.close()])
    rmSync(root, { recursive: true, force: true })
  })

  it("serves the SVG, the PNGs and /favicon.ico, live or not", async () => {
    for (const server of [live, plain]) {
      const svg = await ask(server.port, "GET", "/_server/favicon.svg")
      expect(svg.status).toBe(200)
      expect(svg.headers["content-type"]).toBe("image/svg+xml")
      expect(svg.text).toBe(FAVICON_SVG)
      expect(svg.headers["cache-control"]).toMatch(/max-age/)
      for (const path of [SRV.FAVICON_PNG, "/_server/apple-touch-icon.png", "/favicon.ico"]) {
        const png = await ask(server.port, "GET", path)
        expect(png.status, path).toBe(200)
        expect(png.headers["content-type"], path).toBe("image/png")
        expect(png.text.slice(1, 4), path).toBe("PNG")
      }
    }
    expect((await ask(plain.port, "HEAD", "/favicon.ico")).status).toBe(200)
    expect((await ask(plain.port, "GET", "/other")).text).toContain("SPA")
  })

  it("lets a folder's own favicon.ico win", async () => {
    expect((await ask(mine.port, "GET", "/favicon.ico")).text).toBe("ICO")
  })

  it("injects the icon links into live pages, before </head>", async () => {
    const page = (await ask(live.port, "GET", "/page.html")).text
    expect(page).toContain(SRV.FAVICON_LINKS)
    expect(page.indexOf(`rel="icon"`)).toBeLessThan(page.indexOf("</head>"))
    expect(page.indexOf(`href="${SRV.FAVICON_PNG}" sizes="32x32"`)).toBeLessThan(page.indexOf("favicon.svg"))
    expect(page).toContain(`<link rel="apple-touch-icon" href="/_server/apple-touch-icon.png">`)
  })

  it("never duplicates a page's own icon;  a link outside <head> doesn't count", async () => {
    const own = (await ask(live.port, "GET", "/own.html")).text
    expect(own).not.toContain("/_server/favicon")
    expect(own).toContain(`<script src="/_server/live.js" defer></script>`)
    expect((await ask(live.port, "GET", "/body.html")).text).toContain(SRV.FAVICON_LINKS)
  })

  it("injects nothing into pages of a server that isn't live", async () => {
    expect((await ask(plain.port, "GET", "/page.html")).text).not.toContain("/_server/favicon")
  })
})
