/// <reference types="node" />

import { readFileSync } from "node:fs"
import type { IncomingMessage, ServerResponse } from "node:http"
import { createServer, type InlineConfig, type Plugin, type ViteDevServer } from "vite"

import { VisualSettings } from "./VisualSettings.ts"

/**
 * Vite plugin serving `--static`'s pages from the visual tests' dev server (`VisualRunner`):
 * - `/static/<family>/<example>.html` -- `fixture.html`'s chrome (body class, `#example` box) around the element
 *   example rendered statically, linking the static stylesheet;  NO script, so no `ui-*` element is ever defined
 * - `/static/ui.css` -- that stylesheet
 * - A failed render answers 500 with the error as plain text;  the spec reports it.
 * - Rendering runs in node through Vite's SSR (`StaticFixture`, `ssrLoadModule()`) on a SECOND, SSR-only Vite server
 *   (`renderer`), in the posture of vitest's `ssr` project:  `mode: "test"` + `test.environment: "node"`.
 *   - Why:  `@solidjs/vite-plugin` compiles JSX for the server (`generate: "ssr"`) only in test mode or with its
 *     `ssr` option;  the dev server's own plugin (no `ssr`) compiles every module `dom`, even for SSR, and Solid's
 *     server build then throws "Client-only API called on the server side".  Its `ssr` option would change the
 *     ELEMENT pages' compile too (`hydratable`), so the visual server stays as it is.
 *   - `mode: "test"` touches only this server:  `import.meta.env.MODE`, `.env.test` files (none).
 * - NOTE: pages are NOT passed through `transformIndexHtml`, which would inject Vite's client script.
 * - SIDE EFFECT:  the renderer starts on the first request and closes with the dev server.
 */
export class StaticPages {
  /** Vite path of the SSR module that renders */
  static readonly MODULE = "/tools/visual/StaticFixture.ts"

  /** the SSR-only server, once started */
  private renderer?: Promise<ViteDevServer>

  /** The plugin;  serve only. */
  plugin(): Plugin {
    return {
      name: "ui-visual:static-pages",
      apply: "serve",
      configureServer: (server) => {
        // added directly (not returned):  runs BEFORE Vite's own middlewares, whose HTML fallback would answer first
        server.middlewares.use((request, response, next) => {
          this.handle(server, request, response).then((handled) => handled || next(), next)
        })
      },
      closeBundle: async () => {
        const renderer = this.renderer
        this.renderer = undefined
        await (await renderer)?.close()
      }
    }
  }

  ////////////////
  // ## Requests
  ////////////////

  /** Answer `request` if it's a static page or the stylesheet;  resolves `false` to pass it on. */
  private async handle(server: ViteDevServer, request: IncomingMessage, response: ServerResponse) {
    const path = decodeURIComponent((request.url ?? "").split("?")[0]!)
    if (!path.startsWith(VisualSettings.STATIC_PAGES)) return false
    const rest = path.slice(VisualSettings.STATIC_PAGES.length)
    const isPage = /^[\w-]+\/[\w-]+\.html$/.test(rest)
    if (rest !== "ui.css" && !isPage) return false
    const renderer = await (this.renderer ??= StaticPages.startRenderer(server))
    try {
      const { StaticFixture } = (await renderer.ssrLoadModule(
        StaticPages.MODULE
      )) as typeof import("./StaticFixture.ts")
      if (isPage) {
        const body = await StaticFixture.example(rest.slice(0, -".html".length))
        StaticPages.send(response, 200, "text/html", StaticPages.page(body))
      } else {
        StaticPages.send(response, 200, "text/css", await StaticFixture.stylesheet())
      }
    } catch (error) {
      const err = error as Error
      renderer.ssrFixStacktrace(err)
      StaticPages.send(response, 500, "text/plain", err.stack ?? String(err))
    }
    return true
  }

  /**
   * `fixture.html` with `body` in `#example`, the stylesheet linked, and its script removed.
   * - Read on every request:  an edit to the fixture shows on the next page.
   * - Throws when the fixture no longer has the markers this relies on.
   */
  static page(body: string): string {
    const fixture = readFileSync(`${VisualSettings.ROOT}${VisualSettings.FIXTURE.slice(1)}`, "utf8")
    const replacements: [RegExp, string][] = [
      [/<script\b[^>]*><\/script>\s*/, ""],
      [/<main id="example"><\/main>/, `<main id="example">${body}</main>`],
      [/<\/head>/, `  <link rel="stylesheet" href="${VisualSettings.STATIC_PAGES}ui.css" />\n  </head>`],
      [/<title>[^<]*<\/title>/, "<title>@spell-app/ui: static visual fixture</title>"]
    ]
    let html = fixture
    for (const [pattern, replacement] of replacements) {
      if (!pattern.test(html)) throw new Error(`StaticPages:  ${VisualSettings.FIXTURE} has no ${pattern}`)
      html = html.replace(pattern, () => replacement)
    }
    return html
  }

  /** Send `body` uncached. */
  private static send(response: ServerResponse, status: number, type: string, body: string) {
    response.statusCode = status
    response.setHeader("Content-Type", `${type}; charset=utf-8`)
    response.setHeader("Cache-Control", "no-store")
    response.end(body)
  }

  ////////////////
  // ## Renderer
  ////////////////

  /**
   * The SSR-only Vite server:  same root and config file as `server`, in vitest's `ssr` posture, no HTTP of its own.
   * - `test` isn't a Vite option:  the Solid plugin reads it from the user config.
   */
  private static startRenderer(server: ViteDevServer): Promise<ViteDevServer> {
    const config: InlineConfig & { test: { environment: string } } = {
      root: server.config.root,
      configFile: server.config.configFile,
      mode: "test",
      test: { environment: "node" },
      logLevel: "warn",
      appType: "custom",
      server: { middlewareMode: true, hmr: false, ws: false },
      optimizeDeps: { noDiscovery: true },
      // as the plugin does outside test mode (vitest inlines them itself):  external, `solid-js`' own imports would
      // be resolved by node, without `development`, and land on the PRODUCTION `@solidjs/signals` beside its dev
      // build ("Cannot set properties of undefined (setting 'server')")
      ssr: { noExternal: ["solid-js", "@solidjs/web"] }
    }
    return createServer(config)
  }
}
