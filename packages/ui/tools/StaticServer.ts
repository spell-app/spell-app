/// <reference types="node" />

import { existsSync, readFileSync, statSync } from "node:fs"
import { createServer, type Server } from "node:http"
import type { AddressInfo } from "node:net"
import { extname, join, normalize } from "node:path"
import { transformSync } from "esbuild"

import type { ImportMap } from "./tools.types.ts"

/**
 * A tiny static file server for the smoke pages:  URL prefixes mapped to directories, nothing else.
 * - No Vite dev server:  pages load BUILT files (`dist/`, vendored peers) exactly as a CDN would serve them.
 * - `.ts` files are transpiled on the fly (esbuild `transform`, types stripped, no bundling), so a
 *   type-only-importing helper like `PerfRun.ts` or a dictionary file can be loaded as-is.
 * - Every `.html` response gets `importMap` injected as `<script type="importmap">` right after `<head>`,
 *   before any module script, as the spec requires.
 */
export class StaticServer {
  /** URL prefix (`/dist/`) => directory, absolute;  longest prefix wins */
  private readonly mounts: [string, string][]
  /** injected into every HTML page */
  private readonly importMap: ImportMap
  private server: Server | undefined

  constructor(mounts: Record<string, string>, importMap: ImportMap) {
    this.mounts = Object.entries(mounts).sort((a, b) => b[0].length - a[0].length)
    this.importMap = importMap
  }

  /** Start on `port` (0 = any free one);  resolves with the origin, e.g. `http://127.0.0.1:5199`. */
  async listen(port = 0): Promise<string> {
    const server = createServer((request, response) => {
      const url = new URL(request.url ?? "/", "http://localhost")
      const file = this.resolve(decodeURIComponent(url.pathname))
      if (!file) {
        response.writeHead(404, { "content-type": "text/plain" }).end(`not found: ${url.pathname}`)
        return
      }
      const { body, type } = this.read(file)
      response.writeHead(200, { "content-type": type, "cache-control": "no-store" }).end(body)
    })
    this.server = server
    await new Promise<void>((resolve) => server.listen(port, "127.0.0.1", resolve))
    return `http://127.0.0.1:${(server.address() as AddressInfo).port}`
  }

  /** Stop. */
  async close(): Promise<void> {
    await new Promise<void>((resolve) => (this.server ? this.server.close(() => resolve()) : resolve()))
  }

  /** File for `pathname`, or `undefined`;  never outside a mount. */
  private resolve(pathname: string): string | undefined {
    for (const [prefix, directory] of this.mounts) {
      if (!pathname.startsWith(prefix)) continue
      const file = normalize(join(directory, pathname.slice(prefix.length)))
      if (!file.startsWith(normalize(directory))) return undefined
      if (existsSync(file) && statSync(file).isFile()) return file
      const index = join(file, "index.html")
      return existsSync(index) ? index : undefined
    }
    return undefined
  }

  /** Body and content type of `file`, transformed as needed. */
  private read(file: string): { body: string | Buffer; type: string } {
    const extension = extname(file)
    if (extension === ".html") return { body: this.inject(readFileSync(file, "utf8")), type: TYPES[".html"]! }
    if (extension === ".ts") {
      const source = readFileSync(file, "utf8")
      return { body: transformSync(source, { loader: "ts", format: "esm" }).code, type: TYPES[".js"]! }
    }
    return { body: readFileSync(file), type: TYPES[extension] ?? "application/octet-stream" }
  }

  /** `html` with the import map as the first thing in `<head>`. */
  private inject(html: string): string {
    const tag = `<script type="importmap">${JSON.stringify(this.importMap)}</script>`
    return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (head) => `${head}\n    ${tag}`) : tag + html
  }
}

/** Content types by extension. */
const TYPES: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png"
}
