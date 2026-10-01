/**
 * A small local web server, for what `spell` shows in a browser -- `spell icons --open`, a UI project's
 * `spell run` -- and opening a browser on it.
 * - `routes(path)` answers each GET:  text, a file on disk, or `undefined` for 404.  Nothing else is served.
 * - Listens on `localhost` only, on a free port unless told one.
 * - `SPELL_NO_BROWSER=1`:  `openBrowser()` only prints the URL -- for tests, CI, or a remote shell.
 */
import { spawn } from "child_process"
import { createReadStream, existsSync, statSync } from "fs"
import { createServer, type Server } from "http"
import { extname, relative, resolve } from "path"

/** What a route answers:  text (with its type), or a file on disk. */
export type Served = { text: string; type: string } | { file: string }

/** Answers each path, e.g. `/`, `/element/spell-app.js` -- `undefined` for 404. */
export type Routes = (path: string) => Served | undefined | Promise<Served | undefined>

/** Content type for each file extension we serve. */
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".ico": "image/x-icon",
  ".ttf": "font/ttf",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".eot": "application/vnd.ms-fontobject",
  ".txt": "text/plain; charset=utf-8"
}

/** Start serving `routes` on `localhost` -- resolves to its URL, e.g. `http://localhost:53122/`, and the server. */
export function serve(routes: Routes, { port = 0 }: { port?: number } = {}): Promise<{ url: string; server: Server }> {
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url ?? "/", "http://localhost").pathname)
      const served = request.method === "GET" || request.method === "HEAD" ? await routes(path) : undefined
      if (!served) {
        response.writeHead(404, { "content-type": TYPES[".txt"]! }).end(`Not found:  ${path}\n`)
      } else if ("text" in served) {
        response.writeHead(200, { "content-type": served.type, "cache-control": "no-store" }).end(served.text)
      } else {
        response.writeHead(200, { "content-type": TYPES[extname(served.file)] ?? "application/octet-stream" })
        createReadStream(served.file).pipe(response)
      }
    } catch (error) {
      response.writeHead(500, { "content-type": TYPES[".txt"]! }).end(String(error))
    }
  })
  return new Promise((done, fail) => {
    server.once("error", fail)
    server.listen(port, "localhost", () => {
      const address = server.address()
      const actual = typeof address === "object" && address ? address.port : port
      done({ url: `http://localhost:${actual}/`, server })
    })
  })
}

/**
 * Route serving `folder`'s files under `prefix`, e.g. `/element/` -- never anything outside `folder`.
 * - `undefined` for paths not under `prefix`, so routes can be chained with `??`.
 */
export function folderRoute(prefix: string, folder: string): (path: string) => Served | undefined {
  return (path) => {
    if (!path.startsWith(prefix)) return undefined
    const file = resolve(folder, path.slice(prefix.length))
    const inside = relative(folder, file)
    if (inside.startsWith("..") || !existsSync(file) || !statSync(file).isFile()) return undefined
    return { file }
  }
}

/**
 * Open `url` in the default browser -- `open` on macOS, `start` on Windows, else `xdg-open`.
 * - `SPELL_NO_BROWSER=1`:  doesn't.
 * - Returns whether it tried.
 */
export function openBrowser(url: string): boolean {
  if (process.env.SPELL_NO_BROWSER) return false
  const [command, ...args] =
    process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", "", url]
        : ["xdg-open", url]
  const child = spawn(command!, args, { stdio: "ignore", detached: true })
  child.on("error", () => {})
  child.unref()
  return true
}

/** Resolve once `Ctrl-C` -- `SIGINT` -- or `SIGTERM` arrives, after closing `server`. */
export function untilInterrupted(server: Server): Promise<void> {
  return new Promise((done) => {
    const stop = () => {
      server.closeAllConnections()
      server.close(() => done())
    }
    process.once("SIGINT", stop)
    process.once("SIGTERM", stop)
  })
}
