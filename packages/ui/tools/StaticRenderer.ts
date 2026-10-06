/// <reference types="node" />

import { fileURLToPath } from "node:url"
import { createServer, type InlineConfig, type ViteDevServer } from "vite"

/****************
 * ### `StaticRenderer`
 * The SSR-only Vite server the static server render (`$/ui/static`) runs on, from node:  shared by the visual tests'
 * `--static` pages (`visual/StaticPages.ts`) and `spell static` (`packages/cli`, `src/runner/renderStatic.ts`).
 * - Why Vite at all:  the controllers' JSX must compile `generate: "ssr"` and `@solidjs/web` resolve to its server
 *   build, which `tsx` / esbuild can't do.  Load render modules with `server.ssrLoadModule()`, e.g.
 *   `StaticRenderer.DOCUMENT` (`StaticDocument`).
 * - Runs in the posture of vitest's `ssr` project:  `mode: "test"` + `test.environment: "node"`.
 *   - Why:  `@solidjs/vite-plugin` compiles JSX for the server only in test mode or with its `ssr` option;  without
 *     either it compiles every module `dom`, even for SSR, and Solid's server build then throws "Client-only API
 *     called on the server side".  Its `ssr` option would change a dev server's ELEMENT pages too (`hydratable`).
 *   - `mode: "test"` touches only this server:  `import.meta.env.MODE`, `.env.test` files (none).
 * - No HTTP of its own (middleware mode), no HMR, no dependency discovery.
 * - See `agents/PAPERCUTS.md` (`## ui`, "`server.ssrLoadModule()` of `$/ui/server`", the folder's name then).
 ****************/
export class StaticRenderer {
  /** `packages/ui/`, with a trailing `/`:  the server's root by default. */
  static readonly ROOT = fileURLToPath(new URL("../", import.meta.url))

  /** Vite path of `StaticDocument`, the whole-page render module. */
  static readonly DOCUMENT = "/tools/StaticDocument.ts"

  /**
   * Start the server:  `root`'s Vite config (`vite.config.ts`, or `configFile`), in vitest's `ssr` posture.
   * - SIDE EFFECT:  caller MUST `close()` it, or the process stays alive.
   */
  static start({ root = StaticRenderer.ROOT, configFile }: StaticRendererOptions = {}): Promise<ViteDevServer> {
    return createServer(StaticRenderer.config(root, configFile ?? `${root.replace(/\/?$/, "/")}vite.config.ts`))
  }

  /**
   * The server's config.
   * - `test` isn't a Vite option:  the Solid plugin reads it from the user config.
   * - `ssr.noExternal`:  as the plugin does outside test mode (vitest inlines them itself).  External, `solid-js`'
   *   own imports would be resolved by node, without `development`, and land on the PRODUCTION `@solidjs/signals`
   *   beside its dev build ("Cannot set properties of undefined (setting 'server')").
   */
  static config(root: string, configFile: string | false): InlineConfig & { test: { environment: string } } {
    return {
      root,
      configFile,
      mode: "test",
      test: { environment: "node" },
      logLevel: "warn",
      appType: "custom",
      server: { middlewareMode: true, hmr: false, ws: false },
      optimizeDeps: { noDiscovery: true },
      ssr: { noExternal: ["solid-js", "@solidjs/web"] }
    }
  }
}

/** What `StaticRenderer.start()` serves from;  each defaults to `packages/ui`'s. */
export type StaticRendererOptions = {
  /** the server's root, absolute;  default `StaticRenderer.ROOT` */
  root?: string
  /** its Vite config file, or `false` for none;  default `<root>/vite.config.ts` */
  configFile?: string | false
}
