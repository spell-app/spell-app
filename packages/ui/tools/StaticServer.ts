/// <reference types="node" />

import { transformSync } from "esbuild"

import { SRV } from "$/server"

import type { ImportMap } from "./tools.types.ts"

/**
 * A tiny static file server for the smoke pages:  URL prefixes mapped to directories, nothing else.
 * - A thin wrapper over `SRV.WebServer`, which owns the mime table, path safety and http plumbing.
 * - No Vite dev server:  pages load BUILT files (`dist/`, vendored peers) exactly as a CDN would serve them.
 * - `.ts` files are transpiled on the fly (esbuild `transform`, types stripped, no bundling), so a
 *   type-only-importing helper like `PerfRun.ts` or a dictionary file can be loaded as-is.
 * - Every `.html` response gets `importMap` injected as `<script type="importmap">` right after `<head>`,
 *   before any module script, as the spec requires.
 */
export class StaticServer {
  /** the shared server;  loopback only */
  private readonly web: SRV.WebServer

  constructor(mounts: Record<string, string>, importMap: ImportMap) {
    this.web = new SRV.WebServer({
      mounts: Object.entries(mounts).map(([prefix, dir]) => ({ prefix, dir })),
      html: [(html) => StaticServer.inject(html, importMap)],
      transforms: {
        ".ts": (source) => ({
          body: transformSync(source, { loader: "ts", format: "esm" }).code,
          type: SRV.typeFor("x.js")
        })
      }
    })
  }

  /** Start on `port` (0 = any free one);  resolves with the origin, e.g. `http://127.0.0.1:5199`. */
  async listen(port = 0): Promise<string> {
    return (await this.web.listen({ port })).url
  }

  /** Stop. */
  close(): Promise<void> {
    return this.web.close()
  }

  /** Run until `Ctrl-C`, then stop cleanly. */
  untilInterrupted(): Promise<void> {
    return SRV.untilInterrupted(this.web.server)
  }

  /** `html` with the import map as the first thing in `<head>` (first thing in the page without one). */
  private static inject(html: string, importMap: ImportMap): string {
    const tag = `<script type="importmap">${JSON.stringify(importMap)}</script>`
    return /<head[^>]*>/i.test(html) ? html.replace(/<head[^>]*>/i, (head) => `${head}\n    ${tag}`) : tag + html
  }
}
