import { readdirSync, readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import react from "@vitejs/plugin-react"
import solid from "@solidjs/vite-plugin"
import type { Plugin, PluginOption, UserConfig } from "vite"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"
import { CSS_TARGETS, SOLID_DEDUPE, emitIconPacks } from "../ui/vite.config.ts"

/**
 * Config every `vite*.config.ts` and `vitest.config.ts` here shares, for React and Solid side by side.
 * - Solid is the DEFAULT JSX:  `@spell-app/ui`'s source (`$/ui`) and new app files are Solid.  A React file says so
 *   on its first line, `/** @jsxImportSource react *\/`:  `tsconfig.json` type-checks it as React from that, and
 *   `reactFiles()` hands it to the React plugin instead of Solid's.  ONE marker, read by both.
 * - The app's own UI is all Solid (P6-P9):  only what compiled spell draws with keeps the marker (`core`'s classes,
 *   spell's forms `F`).  See `agents/CODE-DEBT.md` "app:  React for spell programs, beside the app's Solid".
 * - NOTE: the file list is read when the config loads:  restart `vite` after adding or removing a marker.
 */

/** Packages whose `src/` may hold React `.tsx`:  `app`'s own, and what it compiles from source. */
const REACT_DIRS = ["app/src", "core/src"]

/** First-line marker of a React file, as TypeScript reads it. */
const REACT_MARKER = "@jsxImportSource react"

/** `packages/`, absolute. */
const PACKAGES = fileURLToPath(new URL("..", import.meta.url))

/**
 * `node_modules`, which the Solid plugin leaves alone -- except packages shipping Solid JSX SOURCE (their `solid`
 * export condition), which it must compile:  `@solidjs/router` (`dist/*.jsx`).
 */
const NOT_SOLID_SOURCE = /\/node_modules\/(?!@solidjs\/router\/)/

/**
 * The custom-element layer `<spell-app>` and `<spell-editor>` are defined with, `$/ui/elements/solid-element`:  `ui`'s
 * since epic `spell-element`, shared through `spell-solid.js` (`SHARED_SOLID`).
 */
export const SOLID_ELEMENT = fileURLToPath(new URL("../ui/src/elements/solid-element/index.ts", import.meta.url))

/**
 * Plugins, aliases, dedupe and CSS for one config.
 * - A FUNCTION, so every config gets its own plugin instances:  the Solid plugin picks client or server posture
 *   from the config it's created in (`vitest`:  node, so `@solidjs/web`'s server build, `renderToString`).
 * - `standardDecorators()` FIRST:  it and the Solid plugin are both `enforce: "pre"`, and the Solid compiler must
 *   see decorator-free code.
 * - `iconPacks`:  a BUILD that bundles `@spell-app/ui` emits its built-in icon packs beside the chunk that loads them
 *   (`iconPacksBesideBuiltIns()`);  omit for `vitest`, and for builds that import `ui` from `spell-ui.js`.
 * - Lightning CSS with `ui`'s `CSS_TARGETS`:  Vite's default targets lower `light-dark()` and break `ui-dark`
 *   subtrees (see `packages/ui/vite.config.ts`).
 */
export function appConfig({ iconPacks }: { iconPacks?: boolean } = {}) {
  const reactOnly = reactFiles()
  const plugins: PluginOption[] = [
    standardDecorators(),
    packageVersion(),
    solid({ exclude: [...reactOnly, NOT_SOLID_SOURCE] }),
    react({ include: reactOnly })
  ]
  if (iconPacks) plugins.push(iconPacksBesideBuiltIns())
  return {
    plugins,
    resolve: {
      tsconfigPaths: true,
      dedupe: SOLID_DEDUPE
    },
    css: {
      transformer: "lightningcss",
      lightningcss: {
        targets: CSS_TARGETS,
        drafts: { customMedia: true },
        // drop a rule Lightning CSS can't parse, with a warning, as a browser drops it:  `semantic.min.css` (linked
        // from `index.html`) has selectors like `:before.ui` that would otherwise fail the whole sheet
        errorRecovery: true
      }
    }
  } satisfies UserConfig
}

/**
 * Every `.tsx` under `REACT_DIRS` whose source carries `REACT_MARKER`, as exact-path patterns.
 * - Read once per config load.
 */
export function reactFiles(): RegExp[] {
  const files: RegExp[] = []
  for (const dir of REACT_DIRS) {
    const root = path.join(PACKAGES, dir)
    for (const entry of readdirSync(root, { recursive: true, withFileTypes: true })) {
      if (!entry.isFile() || !entry.name.endsWith(".tsx")) continue
      const file = path.join(entry.parentPath, entry.name)
      if (readFileSync(file, "utf8").slice(0, 200).includes(REACT_MARKER)) files.push(exactPath(file))
    }
  }
  return files
}

/** A pattern matching `file` exactly, with or without a `?query`. */
function exactPath(file: string): RegExp {
  return new RegExp(`^${file.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}(\\?.*)?$`)
}

////////////////
// ## One Solid per page
////////////////

/**
 * Files of the shared Solid build, `vite.solid.config.ts`:  every other bundle of ours imports Solid and
 * `@spell-app/ui` from these, beside it, so a page with `<spell-app>`s AND a `<spell-editor>` loads ONE copy of each.
 * - `solid`:  `solid-js`, `@solidjs/web` (`@solidjs/signals` under them) and `ui`'s custom-element layer
 *   (`SOLID_ELEMENT`), whole
 * - `ui`:  `@spell-app/ui`'s barrel, `$/ui`, which the app imports LAZILY (`loadUI.ts`);  its own lazy chunks are in `ui/`
 * - Why:  two Solids on one page fail SILENTLY (`solid-2.md`, "One Solid per page").  Pinned by `element.build.test.ts`.
 */
export const SHARED_SOLID = { solid: "spell-solid.js", ui: "spell-ui.js" } as const

/** Prefix of the external ids `sharedSolid()` gives `SHARED_SOLID`'s files, until `output.paths` writes them out. */
const SHARED_ID = "spell-shared-solid:"

/**
 * Specifiers another bundle takes from `SHARED_SOLID`'s files.
 * - Only those our code imports:  `solid-js/internal` (from `@solidjs/web`) and `@solidjs/signals` (from `solid-js`)
 *   stay INSIDE `spell-solid.js`.
 * - `$/ui/elements/solid-element` (`SOLID_ELEMENT`) is in `spell-solid.js`, not `spell-ui.js`:  `<spell-app>` and
 *   `<spell-editor>` define themselves before `ui` loads.
 */
const FROM_SHARED_SOLID = new Map<string, string>([
  ["solid-js", SHARED_SOLID.solid],
  ["@solidjs/web", SHARED_SOLID.solid],
  ["$/ui/elements/solid-element", SHARED_SOLID.solid],
  ["$/ui", SHARED_SOLID.ui]
])

/** Any other import from Solid's or `ui`'s packages:  `sharedSolid()` refuses it, as the shared files may lack it. */
const SOLID_FAMILY = /^(solid-js|@solidjs\/[^/]+|@spell-app\/ui)(\/|$)|^\$\/ui\//

/**
 * For a build that takes Solid and `@spell-app/ui` from `SHARED_SOLID`'s files beside it, instead of bundling its own:
 * `vite.element.config.ts`, `vite.editor.config.ts`, `vite.runner.config.ts`.
 * - Such an import resolves to an EXTERNAL id, which `output.paths` writes as `./spell-solid.js` / `./spell-ui.js`:
 *   relative, so every chunk that imports one MUST sit at the output folder's top level (ours do:  fixed names, no
 *   folders).
 * - Static and dynamic imports alike:  `import("$/ui")` becomes `import("./spell-ui.js")`, still on demand.
 * - Any other Solid / `ui` specifier (`solid-js/store`, `$/ui/runtime`) is a build ERROR:  add it to
 *   `FROM_SHARED_SOLID` and to what `vite.solid.config.ts` exports, or `spell-solid.js` won't have its names.
 * - Type-only imports (`@solidjs/web/types/jsx.js`) are gone before this runs.
 * - `enforce: "pre"`:  before Vite's resolver (`resolve.tsconfigPaths` would resolve `$/ui` to its source).
 */
export function sharedSolid(): Plugin {
  return {
    name: "spell-shared-solid",
    apply: "build",
    enforce: "pre",
    resolveId(source) {
      const file = FROM_SHARED_SOLID.get(source)
      if (file) return { id: `${SHARED_ID}${file}`, external: true }
      if (SOLID_FAMILY.test(source)) {
        this.error(`"${source}" can't come from ${SHARED_SOLID.solid} / ${SHARED_SOLID.ui}:  see sharedSolid()`)
      }
      return null
    },
    outputOptions(options) {
      return { ...options, paths: (id: string) => (id.startsWith(SHARED_ID) ? `./${id.slice(SHARED_ID.length)}` : id) }
    }
  }
}

////////////////
// ## Icon packs
////////////////

/** `ui`'s `BuiltInPacks`, which looks for the packs beside ITS chunk (`import.meta.url`). */
const BUILT_IN_PACKS = /\/ui\/src\/icons\/BuiltInPacks\.ts$/

/**
 * `@spell-app/ui`'s built-in icon packs, emitted to `icon-packs/` beside whichever chunk holds `BuiltInPacks` -- where it
 * looks for them.  `ui`'s `emitIconPacks()` does the copying.
 * - FOUND in the bundle, not configured:  which chunk holds it is the bundler's call (`assets/UIRuntime-<hash>.js` in
 *   the app, `spell-ui.js` in `vite.solid.config.ts`), and packs in the wrong folder fail quietly:  blank icons.
 * - A build error when no chunk holds it:  a build that asks for packs and doesn't bundle `ui` is misconfigured.
 * - All three packs, ~2.3 MB in ~2,170 files (the "8.7 MB" is `du`'s, in 4 kB disk blocks).  The app's icons need
 *   `fa7-free` (the default pack, always fetched) and `fomantic`, whose names point INTO both Font Awesome folders (448
 *   brands), so leaving `fa7-brands` out would save ~0.2 MB, with a filter `emitIconPacks()` doesn't have.
 */
function iconPacksBesideBuiltIns(): Plugin {
  return {
    name: "spell-icon-packs-beside-built-ins",
    apply: "build",
    generateBundle(options, bundle, isWrite) {
      if (this.environment.name !== "client") return
      const chunk = Object.values(bundle).find(
        (file) => file.type === "chunk" && file.moduleIds.some((id) => BUILT_IN_PACKS.test(id))
      )
      if (!chunk) return this.error("`iconPacks`:  no chunk holds `@spell-app/ui`'s `BuiltInPacks`")
      const dir = path.posix.join(path.posix.dirname(chunk.fileName), "icon-packs")
      // `as unknown`:  `ui` has its own `vite` in `packages/ui/node_modules`, so its `Plugin` type is a different one
      const emit = emitIconPacks(dir) as unknown as { generateBundle(this: unknown, ...args: unknown[]): void }
      emit.generateBundle.call(this, options, bundle, isWrite)
    }
  }
}
