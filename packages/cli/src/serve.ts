/**
 * A small local web server, for what `spell` shows in a browser -- `spell icons --open`, a UI project's
 * `spell run` -- on `$/server`'s `WebServer`.
 * - `routes(path)` answers each GET:  text, a file on disk, or `undefined` for 404.  Nothing else is served.
 * - Listens on loopback only, on a free port unless told one.
 * - Opening a browser and waiting for `Ctrl-C`:  `SRV.openBrowser()` (`SPELL_NO_BROWSER=1` only prints the URL)
 *   and `SRV.untilInterrupted()`.
 */
import type { Server } from "http"

import { SRV } from "$/server"

/** What a route answers:  text (with its type), or a file on disk. */
export type Served = { text: string; type: string } | { file: string }

/** Answers each path, e.g. `/`, `/element/spell-app.js` -- `undefined` for 404. */
export type Routes = (path: string) => Served | undefined | Promise<Served | undefined>

/** Start serving `routes` on loopback -- resolves to its URL, e.g. `http://localhost:53122/`, and the server. */
export async function serve(
  routes: Routes,
  { port = 0 }: { port?: number } = {}
): Promise<{ url: string; server: Server }> {
  const web = new SRV.WebServer()
  web.router.get("*", async (request, reply, next) => {
    let path: string
    try {
      path = decodeURIComponent(request.path)
    } catch {
      throw new SRV.HttpError(400, `bad path:  ${request.path}`)
    }
    const served = await routes(path)
    if (!served) return next()
    if ("text" in served) return void reply.type(served.type).set("Cache-Control", "no-store").send(served.text)
    await reply.sendFile(served.file, { dotfiles: "allow" })
  })
  const { port: actual } = await web.listen({ port, fallback: false })
  // `localhost`, as printed before:  the guard accepts both names
  return { url: `http://localhost:${actual}/`, server: web.server }
}

/**
 * Route serving `folder`'s files under `prefix`, e.g. `/element/` -- never anything outside `folder`.
 * - `undefined` for paths not under `prefix`, or not a file there, so routes can be chained with `??`
 * - `path` is already decoded (`serve()` decodes it), so it's re-encoded segment-wise for `SRV.resolveInside()`
 */
export function folderRoute(prefix: string, folder: string): (path: string) => Served | undefined {
  return (path) => {
    if (!path.startsWith(prefix)) return undefined
    const rest = path.slice(prefix.length).split("/").map(encodeURIComponent).join("/")
    const resolved = SRV.resolveInside(folder, `/${rest}`, { index: false })
    return "file" in resolved ? { file: resolved.file } : undefined
  }
}
