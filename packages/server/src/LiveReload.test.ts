import { mkdirSync, mkdtempSync, rmSync, symlinkSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { afterAll, describe, expect, it, vi } from "vite-plus/test"

import { SRV } from "$/server"

describe("LiveReload", () => {
  const temp = mkdtempSync(join(tmpdir(), "srv-live-"))
  afterAll(() => rmSync(temp, { recursive: true, force: true }))

  // shared content (epic `shared-content`):  a watched folder that is a link into a repo beside the checkout
  it("reports a change inside a watched LINKED folder, under the link's path", async () => {
    mkdirSync(join(temp, "peer/content"), { recursive: true })
    mkdirSync(join(temp, "root/packages/docs"), { recursive: true })
    symlinkSync("../../../peer/content", join(temp, "root/packages/docs/content"))
    const live = new SRV.LiveReload({ root: join(temp, "root"), debounce: 10, heartbeat: 0 })
    const send = vi.spyOn(live, "send")
    live.watch(join(temp, "root/packages/docs/content"))
    await new Promise((done) => setTimeout(done, 200))
    writeFileSync(join(temp, "peer/content/page.html"), "<p>changed</p>")
    await vi.waitFor(() => expect(send).toHaveBeenCalledWith("change", { path: "/packages/docs/content/page.html" }), {
      timeout: 3000
    })
    live.close()
  })

  // Spell UI's built half, laid over its pages at `/ui/` (claude-design P6)
  it("reports a folder served at another URL path under that path (`servedAt`)", async () => {
    mkdirSync(join(temp, "at/packages/ui/site/_assets"), { recursive: true })
    const live = new SRV.LiveReload({ root: join(temp, "at"), debounce: 10, heartbeat: 0 })
    const send = vi.spyOn(live, "send")
    live.watch(join(temp, "at/packages/ui/site"), { servedAt: "/ui" })
    await new Promise((done) => setTimeout(done, 200))
    writeFileSync(join(temp, "at/packages/ui/site/_assets/site.js"), "export {}")
    await vi.waitFor(() => expect(send).toHaveBeenCalledWith("change", { path: "/ui/_assets/site.js" }), {
      timeout: 3000
    })
    live.close()
  })
})
