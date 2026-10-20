import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vite-plus/test"

import { PageServer } from "@spell-app/server/page"
import { ask } from "@spell-app/server/test/serve"
import { HIGHLIGHT_JS, movedFolderPath } from "$/page-server"
import pageServerRoutes from "$/page-server/pageServerRoutes"

/** Write `text` at `path` under `root`, making folders. */
function put(root: string, path: string, text: string): void {
  mkdirSync(dirname(join(root, path)), { recursive: true })
  writeFileSync(join(root, path), text)
}

describe("pageServerRoutes", () => {
  const root = mkdtempSync(join(tmpdir(), "page-server-routes-"))
  // the epic engine:  spell-epic beside the checkout, linked in at its root as `spell-epic` (epic `epic-eject` I5)
  const engine = `${root}-engine`
  let server: PageServer
  let port: number

  beforeAll(async () => {
    mkdirSync(engine, { recursive: true })
    symlinkSync(engine, join(root, "spell-epic"))
    const sets = { ui: { name: "Spell UI", dir: "packages/ui/docs", assets: "packages/ui/site/_assets" } }
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
    rmSync(engine, { recursive: true, force: true })
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

  it("serves the engine's old folders from spell-epic:  a safety net for a page that still links them (movedFolderPath())", async () => {
    put(engine, "src/tools/_assets/runtime.js", "// epics\n")
    for (const path of ["/packages/docs/tools/_assets/runtime.js", "/packages/epics/tools/_assets/runtime.js"]) {
      const old = await ask(port, "GET", path)
      expect(old.status, path).toBe(200)
      expect(old.text).toBe("// epics\n")
    }
    expect((await ask(port, "GET", "/packages/docs/tools/_assets/missing.js")).status).toBe(404)
    expect(movedFolderPath("/worktrees/w/packages/docs/tools/_assets/a/b.js")).toBe(
      "/worktrees/w/spell-epic/src/tools/_assets/a/b.js"
    )
    expect(movedFolderPath("/packages/docs/tools/index.js")).toBeUndefined()
    // the epics pack, which every shared epic page loads
    put(engine, "src/components/__pack/epics.pack.js", "// pack\n")
    expect((await ask(port, "GET", "/packages/epics/pack/epics.pack.js")).text).toBe("// pack\n")
    expect((await ask(port, "GET", "/packages/epics/components/__pack/epics.pack.js")).text).toBe("// pack\n")
    expect(movedFolderPath("/packages/epics/package.json")).toBeUndefined()
  })
})
