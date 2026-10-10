import path from "node:path"
import { fileURLToPath } from "node:url"
import solid from "@solidjs/vite-plugin"
import type { Plugin, PluginOption, UserConfig } from "vite"

import { standardDecorators } from "../../vite.decorators.ts"
import { packageVersion } from "../../vite.packageVersion.ts"
import { CSS_TARGETS, SOLID_DEDUPE, emitIconPacks } from "../ui/vite.config.ts"

/**
 * Config every `vite*.config.ts` and `vitest.config.ts` here shares.
 * - Every `.tsx` is Solid:  the app, `@spell-app/ui`'s source (`$/ui`), and what compiled spell draws with
 *   (`core`'s `drawing.ts`, epic `output-targets` P10).  React left with P11.
 */

/**
 * `node_modules`, which the Solid plugin leaves alone --
 * except packages shipping Solid JSX SOURCE (their `solid` export condition), which it must compile:
 * `@solidjs/router` (`dist/*.jsx`).
 */
const NOT_SOLID_SOURCE = /\/node_modules\/(?!@solidjs\/router\/)/

/**
 * Plugins, aliases, dedupe and CSS for one config.
 * - A FUNCTION, so every config gets its own plugin instances:
 *   the Solid plugin picks client or server posture from the config it's created in
 *   (`vitest`:  node, so `@solidjs/web`'s server build, `renderToString`).
 * - `standardDecorators()` FIRST:  it and the Solid plugin are both `enforce: "pre"`,
 *   and the Solid compiler must see decorator-free code.
 * - `iconPacks`:  a BUILD that bundles `@spell-app/ui` emits its built-in icon packs
 *   beside the chunk that loads them (`iconPacksBesideBuiltIns()`).
 *   Omit for `vitest`, and for builds that import `ui` from `spell-ui.js`.
 * - Lightning CSS with `ui`'s `CSS_TARGETS`:
 *   Vite's default targets lower `light-dark()` and break `ui-dark` subtrees (see `packages/ui/vite.config.ts`).
 */
export function appConfig({ iconPacks }: { iconPacks?: boolean } = {}) {
  const plugins: PluginOption[] = [standardDecorators(), packageVersion(), solid({ exclude: [NOT_SOLID_SOURCE] })]
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
        // drop a rule Lightning CSS can't parse, with a warning, as a browser drops it:
        // `semantic.min.css` (linked from `index.html`) has selectors like `:before.ui`
        // that would otherwise fail the whole sheet
        errorRecovery: true
      }
    }
  } satisfies UserConfig
}

////////////////
// ## One Solid per page
////////////////

/**
 * Files of the shared Solid build, `vite.solid.config.ts`:
 * every other bundle of ours imports Solid and `@spell-app/ui` from these, beside it,
 * so a page with `<spell-app>`s AND a `<spell-editor>` loads ONE copy of each.
 * - `solid`:  `solid-js`, `@solidjs/web` (`@solidjs/signals` under them),
 *   `@spell-app/ui`'s element core, `$/ui/core`, and its root family, `$/ui/components/ui-root`, each whole:
 *   `<spell-app>` and `<spell-editor>` are Spell UI components (`UIComponent`), defined as their scripts run,
 *   and `<spell-app>` is a root (`UIRoot`);
 *   and `@solidjs/h` (as `h`), which compiled spell draws with (`spell-runtime.js`)
 * - `shared`:  what the other bundles import instead of `solid`, written by `vite.solid.config.ts`:
 *   the same names, taken from the PAGE when it has them (a docs page's `SpellUI.packModules`), else from `solid`
 * - `ui`:  `@spell-app/ui`'s barrel, `$/ui`, which the app imports LAZILY (`loadUI.ts`);
 *   its own lazy chunks are in `ui/`
 * - Why:  two Solids (or two `UIComponent`s) on one page fail SILENTLY (`solid-2.md`, "One Solid per page").
 *   Pinned by `element.build.test.ts`.
 */
export const SHARED_SOLID = { solid: "spell-solid.js", shared: "spell-solid-shared.js", ui: "spell-ui.js" } as const

/** Prefix of the external ids `sharedSolid()` gives `SHARED_SOLID`'s files, until `output.paths` writes them out. */
const SHARED_ID = "spell-shared-solid:"

/**
 * Specifiers another bundle takes from `SHARED_SOLID`'s files.
 * - Only those our code imports:
 *   `solid-js/internal` (from `@solidjs/web`) and `@solidjs/signals` (from `solid-js`) stay INSIDE `spell-solid.js`.
 * - `$/ui/core` and `$/ui/components/ui-root` are in `spell-solid.js`, not `spell-ui.js`:
 *   `<spell-app>` and `<spell-editor>` define themselves on them as their scripts run, before the rest of `ui` loads.
 * - Each through `spell-solid-shared.js`:  the page's copy when it has one (`SHARED_SPECIFIERS`).
 * - `@solidjs/h` (compiled spell's, in `spell-runtime.js`) has only a default export:
 *   `sharedSolid()` imports it through a module of its own (`SHARED_H`).
 */
const FROM_SHARED_SOLID = new Map<string, string>([
  ["solid-js", SHARED_SOLID.shared],
  ["@solidjs/web", SHARED_SOLID.shared],
  ["@solidjs/h", SHARED_SOLID.shared],
  ["$/ui/core", SHARED_SOLID.shared],
  ["$/ui/components/ui-root", SHARED_SOLID.shared],
  ["$/ui", SHARED_SOLID.ui]
])

/**
 * The specifiers `spell-solid-shared.js` takes from the page when the page has them all:
 * keys of `globalThis.SpellUI.packModules`, the docs bundle's (`packages/docs/tools/_assets/spell-ui.entry.js`).
 */
export const SHARED_SPECIFIERS = [...FROM_SHARED_SOLID]
  .filter(([, file]) => file === SHARED_SOLID.shared)
  .map(([id]) => id)

/** Solid's hyperscript, `h()`:  what compiled spell draws with, through `core`'s export (epic `output-targets` P20). */
const H_PACKAGE = "@solidjs/h"

/**
 * Shared specifiers with only a DEFAULT export, by the name `spell-solid.js` and `spell-solid-shared.js` export it as:
 * `@solidjs/h`'s `h`.
 * - The page's `SpellUI.packModules` holds the module as it is (`{ default: h }`), as a component pack imports it:
 *   `spell-solid-shared.js` renames it.
 */
export const SHARED_DEFAULTS: Readonly<Record<string, string>> = { [H_PACKAGE]: "h" }

/** Virtual module `sharedSolid()` resolves `H_PACKAGE` to:  `spell-solid-shared.js`'s `h`, as a default export. */
const SHARED_H = "\0spell-shared-h"

/** Any other import from Solid's or `ui`'s packages:  `sharedSolid()` refuses it, as the shared files may lack it. */
const SOLID_FAMILY = /^(solid-js|@solidjs\/[^/]+|@spell-app\/ui)(\/|$)|^\$\/ui\//

/**
 * For a build that takes Solid and `@spell-app/ui` from `SHARED_SOLID`'s files beside it, instead of bundling its own:
 * `vite.element.config.ts`, `vite.editor.config.ts`, `vite.runner.config.ts`.
 * - Such an import resolves to an EXTERNAL id, which `output.paths` writes as `./spell-solid-shared.js` /
 *   `./spell-ui.js`:  relative.
 *   So every chunk that imports one MUST sit at the output folder's top level (ours do:  fixed names, no folders).
 * - Static and dynamic imports alike:  `import("$/ui")` becomes `import("./spell-ui.js")`, still on demand.
 * - Any other Solid / `ui` specifier (`solid-js/store`, `$/ui/runtime`) is a build ERROR:
 *   add it to `FROM_SHARED_SOLID` and to what `vite.solid.config.ts` exports, or the shared files won't have its names.
 * - Type-only imports (`@solidjs/web/types/jsx.js`) are gone before this runs.
 * - `enforce: "pre"`:  before Vite's resolver (`resolve.tsconfigPaths` would resolve `$/ui` to its source).
 */
export function sharedSolid(): Plugin {
  return {
    name: "spell-shared-solid",
    apply: "build",
    enforce: "pre",
    resolveId(source) {
      if (source === H_PACKAGE) return SHARED_H
      const file = FROM_SHARED_SOLID.get(source)
      if (file) return { id: `${SHARED_ID}${file}`, external: true }
      if (source.startsWith(SHARED_ID)) return { id: source, external: true }
      if (SOLID_FAMILY.test(source)) {
        this.error(`"${source}" can't come from ${Object.values(SHARED_SOLID).join(" / ")}:  see sharedSolid()`)
      }
      return null
    },
    // `@solidjs/h` has only a DEFAULT export, which `spell-solid-shared.js` re-exports as `h`
    load: (id) => (id === SHARED_H ? `export { h as default } from "${SHARED_ID}${SHARED_SOLID.shared}"` : null),
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
 * `@spell-app/ui`'s built-in icon packs, emitted to `icon-packs/` beside whichever chunk holds `BuiltInPacks` --
 * where it looks for them.
 * `ui`'s `emitIconPacks()` does the copying.
 * - FOUND in the bundle, not configured:  which chunk holds it is the bundler's call
 *   (`assets/UIRuntime-<hash>.js` in the app, `spell-ui.js` in `vite.solid.config.ts`).
 *   Packs in the wrong folder fail quietly:  blank icons.
 * - A build error when no chunk holds it:  a build that asks for packs and doesn't bundle `ui` is misconfigured.
 * - All three packs, ~2.3 MB in ~2,170 files (the "8.7 MB" is `du`'s, in 4 kB disk blocks).
 *   - The app's icons need `fa7-free` (the default pack, always fetched) and `fomantic`,
 *     whose names point INTO both Font Awesome folders (448 brands).
 *   - So leaving `fa7-brands` out would save ~0.2 MB, with a filter `emitIconPacks()` doesn't have.
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
