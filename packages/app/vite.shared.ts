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
 * - Dropping the marker moves a file to Solid.  When the app's own UI is all Solid, only the files `core` renders
 *   compiled spell with keep it.  See `CODE-DEBT.md` "app:  React and Solid side by side".
 * - NOTE: the file list is read when the config loads:  restart `vite` after adding or removing a marker.
 */

/** Packages whose `src/` may hold React `.tsx`:  `app`'s own, and what it compiles from source. */
const REACT_DIRS = ["app/src", "core/src", "parser/src"]

/** First-line marker of a React file, as TypeScript reads it. */
const REACT_MARKER = "@jsxImportSource react"

/** `packages/`, absolute. */
const PACKAGES = fileURLToPath(new URL("..", import.meta.url))

/** The fork's source entry:  `@spell-app/solid-element` resolves here in dev, tests AND build (no `dist/` needed). */
const SOLID_ELEMENT = fileURLToPath(new URL("../solid-element/src/index.ts", import.meta.url))

/**
 * Plugins, aliases, dedupe and CSS for one config.
 * - A FUNCTION, so every config gets its own plugin instances:  the Solid plugin picks client or server posture
 *   from the config it's created in (`vitest`:  node, so `@solidjs/web`'s server build, `renderToString`).
 * - `standardDecorators()` FIRST:  it and the Solid plugin are both `enforce: "pre"`, and the Solid compiler must
 *   see decorator-free code.
 * - `iconPacks`:  where a BUILD puts `@spell-app/ui`'s built-in icon packs, beside the chunk that loads them
 *   (`BuiltInPacks`, by `import.meta.url`);  omit for `vitest`.
 * - Lightning CSS with `ui`'s `CSS_TARGETS`:  Vite's default targets lower `light-dark()` and break `ui-dark`
 *   subtrees (see `packages/ui/vite.config.ts`).
 */
export function appConfig({ iconPacks }: { iconPacks?: string } = {}) {
  const reactOnly = reactFiles()
  const plugins: PluginOption[] = [
    standardDecorators(),
    packageVersion(),
    solid({ exclude: [...reactOnly, /\/node_modules\//] }),
    react({ include: reactOnly })
  ]
  // `as unknown`:  `ui` has its own `vite` in `packages/ui/node_modules`, so its `Plugin` type is a different one
  if (iconPacks) plugins.push(emitIconPacks(iconPacks) as unknown as Plugin)
  return {
    plugins,
    resolve: {
      tsconfigPaths: true,
      dedupe: SOLID_DEDUPE,
      alias: [{ find: /^@spell-app\/solid-element$/, replacement: SOLID_ELEMENT }]
    },
    optimizeDeps: {
      // linked TypeScript source, compiled by the Solid plugin like our own files
      exclude: ["@spell-app/solid-element"]
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
