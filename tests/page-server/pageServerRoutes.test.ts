import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { PageServer } from "spell-kit/server/page"
import { ask } from "spell-kit/server/test/serve"
import { HIGHLIGHT_JS } from "spell-app/page-server"
import pageServerRoutes from "spell-app/page-server/pageServerRoutes"

/** Write `text` at `path` under `root`, making folders. */
function put(root: string, path: string, text: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

describe("pageServerRoutes", () => {
  const root = mkdtempSync(join(tmpdir(), "page-server-routes-"))
  let server: PageServer
  let port: number

  beforeAll(async () => {
    const sets = { ui: { name: "Spell UI", dir: "spell-ui/docs", assets: "spell-ui/site/_assets" } }
    put(root, "package.json", JSON.stringify({ pageServer: { componentSets: sets } }))
    // the sets' old homes, which the shared repo still holds until `people-and-orgs` merges (`MOVED_OUT`)
    put(root, "ui/button.html", "<!doctype html><head></head><p>old</p>\n")
    put(root, "brand/components/x.html", "<!doctype html><head></head><p>old</p>\n")
    put(root, "brand/index.html", "<!doctype html><head></head><p>Brand</p>\n")
    server = new PageServer({ root })
    await pageServerRoutes.setup(server.routeContext())
    await server.start({ port: 0, routes: false, pidFile: false })
    port = server.info.port
  })

  afterAll(async () => {
    await server.stop()
    rmSync(root, { recursive: true, force: true })
  })

  it("serves highlight.js from the engine, not cdnjs, so pages load offline (localHighlight())", async () => {
    put(root, "docs/offline.html", `<!doctype html><head></head><script src="${HIGHLIGHT_JS.cdn}"></script>\n`)
    const answer = await ask(port, "GET", "/docs/offline.html")
    expect(answer.text).toContain(`<script src="${HIGHLIGHT_JS.local}"></script>`)
    expect(answer.text).not.toContain("cdnjs")
  })

  it('answers "not found" at the sets\' old addresses:  no redirect (Q30)', async () => {
    for (const old of ["/ui/button.html", "/ui/", "/ui", "/brand/components/x.html", "/epic-ui/", "/app-ui/x.html"])
      expect((await ask(port, "GET", old)).status, old).toBe(404)
    expect((await ask(port, "GET", "/ui/button.html")).text).toContain("see /components/ui/")
    // the rest of the shared brand/ folder is the Brand tab's:  still served
    expect((await ask(port, "GET", "/brand/index.html")).status).toBe(200)
  })
})
