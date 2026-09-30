// @ts-check
import { defineConfig } from "astro/config"
import mdx from "@astrojs/mdx"
import { satteri } from "@astrojs/markdown-satteri"
import solid from "@solidjs/vite-plugin"
import { fileURLToPath } from "node:url"

import { standardDecorators } from "../vite.decorators.ts"
import { CSS_TARGETS, SOLID_DEDUPE, emitIconPacks } from "../vite.config.ts"
// from SOURCE, as in the root `vite.config.ts`:  a fresh checkout has no `packages/solid-element/dist/`
import { solidElementHot } from "../../solid-element/src/vite.ts"
import { unwrapHtmlParagraphs } from "./src/lib/unwrapHtmlParagraphs.ts"
import { SHIKI_THEMES } from "./src/lib/shiki.ts"

/** Repo root:  the library is consumed from SOURCE (`../src`), never from `dist/`. */
const ROOT = fileURLToPath(new URL("..", import.meta.url))
/** `../src`, target of the `$` alias -- same alias the library itself uses. */
const SRC = fileURLToPath(new URL("../src", import.meta.url))
/** `../test`, target of `$test` (shared test helpers;  here only so shared source type-checks alike). */
const TEST = fileURLToPath(new URL("../test", import.meta.url))
/** The fork's source entry:  `@spell/solid-element` resolves here in dev AND build (no `dist/` needed). */
const SOLID_ELEMENT = fileURLToPath(new URL("../../solid-element/src/index.ts", import.meta.url))

/**
 * Docs site for `@spell/ui`, modelled on fomantic-ui.com.
 * - Static output;  pages are `.astro` + `.mdx`, NO framework integration -- live examples are plain HTML
 *   and `ui-*` custom elements, which is the whole point.
 * - Vite mirrors the library's own config (`../vite.config.ts`):  same aliases, same decorator lowering, the
 *   Solid compiler for the components' `.tsx` (plus the fork's element HMR in `astro dev`), same Lightning CSS
 *   targets.  NEVER let Vite's default CSS targets in:  they lower `light-dark()` and break `ui-dark` subtrees
 *   (see `docs/theming.md` "Build notes").
 * - `solid-js` / `@solidjs/web` are this package's own dependencies, deduped:  the library source, the fork and
 *   the site MUST share one Solid.
 */
export default defineConfig({
  output: "static",
  // `unwrapHtmlParagraphs`:  text on its own line inside `<p>` / `<ui-*>` stays inline, not a nested `<p>`
  integrations: [mdx({ processor: satteri({ mdastPlugins: [unwrapHtmlParagraphs] }) })],
  markdown: {
    shikiConfig: { themes: SHIKI_THEMES, defaultColor: false }
  },
  vite: {
    // `standardDecorators()` MUST come first (see `../vite.config.ts`);  the Solid compiler only for the library's
    // `.tsx` (the site has none)
    plugins: [
      standardDecorators(),
      solid({ include: [/\/src\/.+\.tsx$/] }),
      solidElementHot({
        include: /\/src\/components\/[\w-]+\/index\.ts$/,
        detect: /\.define\(/,
        setup: "$/elements/HotDefinitions",
        styles: {
          include: /\/src\/components\/[\w-]+\/[\w-]+\.css\?inline$/,
          handler: "$/elements/HotDefinitions",
          call: "HotDefinitions.updateStyle"
        }
      }),
      // built-in icon packs beside the client chunks, where `BuiltInPacks` finds them (`import.meta.url`)
      emitIconPacks("_astro/icon-packs")
    ],
    resolve: {
      // Array form so `$test` is matched before `$`;  string keys match `$` exactly or `$/...` only.
      alias: [
        { find: /^\$test(?=\/|$)/, replacement: TEST },
        { find: /^\$(?=\/|$)/, replacement: SRC },
        { find: /^@spell\/ui$/, replacement: `${SRC}/index.ts` },
        { find: /^@spell\/solid-element$/, replacement: SOLID_ELEMENT }
      ],
      dedupe: SOLID_DEDUPE
    },
    optimizeDeps: {
      exclude: ["@spell/solid-element"]
    },
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: CSS_TARGETS,
        drafts: { customMedia: true }
      }
    },
    server: {
      // `../src` is outside the site package;  Vite's dev server only serves the workspace root by default.
      fs: { allow: [ROOT] }
    },
    build: {
      // `brands.json` (~500 KB) is one lazily-loaded icon DATA chunk, loaded only by the icon browser's Brands tab
      chunkSizeWarningLimit: 600
    },
    ssr: {
      // Library source is TS + `?inline` CSS + JSON:  let Vite transform it, never hand it to Node as-is.
      noExternal: ["@spell/ui"]
    }
  }
})
