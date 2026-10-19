import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

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

describe("StaticHandler overlays", () => {
  it("serves an overlay's file in place of the path asked;  falls through when it has none", () => {
    const dir = mkdtempSync(join(tmpdir(), "srv-overlay-"))
    mkdirSync(join(dir, "pages", "_data"), { recursive: true })
    mkdirSync(join(dir, "build", "_data"), { recursive: true })
    writeFileSync(join(dir, "pages", "_data", "both.json"), "pages")
    writeFileSync(join(dir, "pages", "_data", "pages-only.json"), "pages")
    writeFileSync(join(dir, "build", "_data", "both.json"), "build")
    const files = new SRV.StaticHandler({ mounts: [{ prefix: "/", dir }] })
    files.overlays.push((path) => (path.startsWith("/pages/_data/") ? path.replace("/pages/", "/build/") : undefined))
    expect(fileOf("/pages/_data/both.json")).toBe(join(dir, "build", "_data", "both.json"))
    expect(fileOf("/pages/_data/pages-only.json")).toBe(join(dir, "pages", "_data", "pages-only.json"))
    expect(fileOf("/pages/_data/missing.json")).toMatchObject({ status: 404 })
    rmSync(dir, { recursive: true, force: true })

    /** the file `path` resolves to, else what it resolved to */
    function fileOf(path: string) {
      const resolved = files.resolve(path)
      return resolved && "file" in resolved ? resolved.file : resolved
    }
  })
})

describe("StaticHandler layers", () => {
  it("lays folders mounted at one prefix over each other:  the first that has the path serves it", () => {
    const dir = mkdtempSync(join(tmpdir(), "srv-layers-"))
    for (const [folder, file] of [
      ["new", "both.html"],
      ["new", "new-only.html"],
      ["old", "both.html"],
      ["old", "old-only.html"]
    ] as const) {
      mkdirSync(join(dir, folder, "w"), { recursive: true })
      writeFileSync(join(dir, folder, "w", file), folder)
    }
    const files = new SRV.StaticHandler({ mounts: [{ prefix: "/", dir: join(dir, "new") }] })
    files.mount({ prefix: "/", dir: join(dir, "old") })
    expect(fileOf("/w/both.html")).toBe(join(dir, "new", "w", "both.html"))
    expect(fileOf("/w/new-only.html")).toBe(join(dir, "new", "w", "new-only.html"))
    expect(fileOf("/w/old-only.html")).toBe(join(dir, "old", "w", "old-only.html"))
    expect(fileOf("/w")).toMatchObject({ redirect: "/w/" })
    expect(fileOf("/w/missing.html")).toMatchObject({ status: 404 })
    expect(fileOf("/.git")).toMatchObject({ status: 403 })
    rmSync(dir, { recursive: true, force: true })

    /** the file `path` resolves to, else what it resolved to */
    function fileOf(path: string) {
      const resolved = files.resolve(path)
      return resolved && "file" in resolved ? resolved.file : resolved
    }
  })

  // epic `epic-eject` P12:  the content folder under every worktree's address, after the worktrees' own files
  it("lays a catch-all (`skip`) under the others at its prefix, whenever mounted:  any first folder, dropped", () => {
    const dir = mkdtempSync(join(tmpdir(), "srv-skip-"))
    for (const [folder, file] of [
      ["worktrees/w/epics", "own.html"],
      ["content/epics", "own.html"],
      ["content/epics", "shared.html"]
    ] as const) {
      mkdirSync(join(dir, folder), { recursive: true })
      writeFileSync(join(dir, folder, file), folder)
    }
    // the catch-all first:  still laid under
    const files = new SRV.StaticHandler({ mounts: [{ prefix: "/worktrees/", dir: join(dir, "content"), skip: 1 }] })
    files.mount({ prefix: "/worktrees/", dir: join(dir, "worktrees") })
    const fileOf = (path: string) => {
      const resolved = files.resolve(path)
      return resolved && "file" in resolved ? resolved.file : resolved
    }
    expect(fileOf("/worktrees/w/epics/own.html")).toBe(join(dir, "worktrees", "w", "epics", "own.html"))
    expect(fileOf("/worktrees/w/epics/shared.html")).toBe(join(dir, "content", "epics", "shared.html"))
    expect(fileOf("/worktrees/any/epics/shared.html")).toBe(join(dir, "content", "epics", "shared.html"))
    expect(fileOf("/worktrees/w/epics")).toHaveProperty("redirect")
    expect(fileOf("/worktrees/w/missing.html")).toMatchObject({ status: 404 })
    rmSync(dir, { recursive: true, force: true })
  })
})
