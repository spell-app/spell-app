// FIRST:  defines `__PACKAGE_VERSION__`, which vite would, before anything reads it
import "$/spell/node/packageVersion.node"

import { existsSync, readFileSync } from "fs"
import JSON5 from "json5"
import { join } from "path"

import { SRV } from "$/server"
import type { RouteModule } from "$/server/page"
import { api } from "./api"

/**
 * The app on the page server:  a ROUTE MODULE (`$/server/page`'s `RouteModule`), listed in the repo root's
 * `package.json` `"pageServer": { "routes": [...] }`.  What `spell serve` runs everything on.
 * - `/api/...` -- the app's API, `./api` (as `index.ts` serves it alone, `yarn start:server`);  bodies as JSON5
 * - `/hello` -- liveness
 * - `/editor` -- the site header's "Editor":  redirects to the editor UI, vite's dev server, which `spell serve`
 *   starts and records in `<root>/.spell-server.editor.json` (`EDITOR_FILE`);  not running:  says how to start it
 * - writes refuse a foreign `Origin` (another site posting into our projects):  the API has no token, since the
 *   editor calls it from vite's origin, through vite's proxy
 */
const appRoutes: RouteModule = {
  name: "app",
  setup({ router, root }) {
    router.use("/api", refuseForeignOrigins, SRV.parseBodies({ limit: 10 * 1024 * 1024, parseJson: JSON5.parse }), api)
    router.get("/hello", (_request, reply) => reply.json({ message: "Hello from the API!" }))
    router.get("/editor", async (_request, reply) => {
      const editor = await editorUrl(root)
      if (editor) return void reply.redirect(editor)
      reply
        .status(503)
        .type("text/html")
        .send(
          `<!doctype html><title>Editor</title><p>The editor isn't running:  start it with <code>spell serve</code>.</p>`
        )
    })
  }
}

export default appRoutes

/** The editor's record, written by `spell serve`:  `{ url, pid }`. */
export const EDITOR_FILE = ".spell-server.editor.json"

/** The running editor's URL, from `EDITOR_FILE`, if it answers. */
async function editorUrl(root: string): Promise<string | undefined> {
  const file = join(root, EDITOR_FILE)
  if (!existsSync(file)) return undefined
  try {
    const { url } = JSON.parse(readFileSync(file, "utf8")) as { url: string }
    await fetch(url, { signal: AbortSignal.timeout(1000) })
    return url
  } catch {
    return undefined
  }
}

/** Middleware:  403 for a write whose `Origin` isn't this machine (`localhost` / `127.0.0.1`, any port). */
function refuseForeignOrigins(request: SRV.Request, _reply: SRV.Reply, next: SRV.Next): void {
  const origin = request.get("origin")
  if (
    request.method !== "GET" &&
    request.method !== "HEAD" &&
    origin &&
    !/^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(origin)
  )
    throw new SRV.HttpError(403, "wrong origin")
  next()
}
