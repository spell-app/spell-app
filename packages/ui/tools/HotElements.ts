/*! Derived from `@solidjs/element` and `component-register`:  MIT licence, (c) Ryan Carniato. */
import type { EnvironmentModuleNode, Plugin } from "vite"

/**
 * `hotElements(hotDefinitions)`:  the Vite plugin for hot module replacement of `ui`'s elements in `yarn dev`,
 * without reloading the page.  `vite.config.ts` adds it after the Solid plugin;  `hotDefinitions` is the absolute
 * path of `src/elements/HotDefinitions.ts`.
 * - Component barrels (`src/components/ui-<name>/index.ts`, the modules that call `define()`) become HMR boundaries:
 *   the plugin imports `HotDefinitions` into each, and appends `import.meta.hot.accept(() => HotDefinitions.update())`.
 *   Vite re-runs the barrel, whose `define()` of a new version of a class re-defines its tags in place
 *   (`HotDefinitions`), then `update()` re-renders every live instance -- or, when the platform can't take the change
 *   (observed attributes ...), invalidates, and Vite reloads the page.
 * - Component sheets (`src/components/ui-<name>/UI<Name>.css?inline`) self-accept and hand the new text to
 *   `HotDefinitions.updateStyle()`, which re-registers the sheet:  no re-render, shadow DOM nodes keep their identity.
 * - Shared code:  a changed module reaching MORE THAN ONE barrel (a base class, the runtime) makes Vite reload the
 *   page, instead of re-running every barrel against a fresh copy of the base class their live instances don't
 *   extend.  One barrel (its vocabulary, a helper) stays hot.
 * - `apply: "serve"`:  builds are untouched.  Code is only APPENDED, so existing source maps stay valid.
 * - NOTE: `@solidjs/vite-plugin`'s own refresh transform wraps exported FUNCTION components;  class components get
 *   no refresh boundary, so the two don't meet.
 * - From solid-element's Vite plugin, its options made `ui`'s fixed ones (epic `spell-element`, Q11).
 */
export function hotElements(hotDefinitions: string): Plugin {
  const handler = JSON.stringify(hotDefinitions)
  // ids this plugin made boundaries:  barrels, then sheets
  const barrelIds = new Set<string>()
  const sheetIds = new Set<string>()

  return {
    name: "spell:hot-elements",
    apply: "serve",
    // after the Solid plugin (JSX compiled) and Vite's CSS plugin (`?inline` => `export default "..."`)
    enforce: "post",

    transform(code, id, transformOptions) {
      if (transformOptions?.ssr) return undefined
      if (SHEET.test(id)) {
        sheetIds.add(id)
        return { code: code + sheetAccept(id, handler), map: null }
      }
      const [file] = id.split("?")
      if (file !== id || !BARREL.test(file!) || !DEFINES.test(code)) return undefined
      barrelIds.add(id)
      // appended:  imports are hoisted, and no line moves (map: null keeps the incoming source map)
      return {
        code:
          `${code}\nimport { HotDefinitions as __HotDefinitions } from ${handler};\n` +
          `if (import.meta.hot) import.meta.hot.accept(() => __HotDefinitions.update(import.meta.hot));\n`,
        map: null
      }
    },

    hotUpdate({ file, modules, server }) {
      if (this.environment.name !== "client") return undefined
      for (const mod of modules) {
        if (sheetIds.has(mod.id ?? "")) {
          // HACK: Vite's CSS analysis marks `?inline` CSS NOT self-accepting on every transform, and its import
          // analysis skips CSS requests, so the graph never learns about the appended accept:  without this the
          // update climbs to the importers and re-renders them
          mod.isSelfAccepting = true
          continue
        }
        const reached = new Set<string>()
        reach(mod, reached, new Set())
        if (reached.size <= 1) continue
        server.config.logger.info(
          `[hot-elements] ${file} is shared by ${reached.size} component barrels:  full reload`,
          {
            timestamp: true
          }
        )
        this.environment.hot.send({ type: "full-reload", path: "*" })
        return []
      }
      return undefined
    }
  }

  /** Collect the barrels `mod` reaches through its importers, stopping at any accepting module. */
  function reach(mod: EnvironmentModuleNode, reached: Set<string>, seen: Set<EnvironmentModuleNode>) {
    if (seen.has(mod)) return
    seen.add(mod)
    if (mod.id && barrelIds.has(mod.id)) {
      reached.add(mod.id)
      return
    }
    if (mod.isSelfAccepting) return
    for (const importer of mod.importers) reach(importer, reached, seen)
  }
}

/** Code appended to a sheet module:  self-accept, and hand `(id, new text)` to `HotDefinitions.updateStyle()`. */
function sheetAccept(id: string, handler: string): string {
  return (
    `\nimport { HotDefinitions as __HotStyles } from ${handler};\n` +
    `if (import.meta.hot) import.meta.hot.accept((next) => { ` +
    `if (next) __HotStyles.updateStyle(${JSON.stringify(id)}, next.default) });\n`
  )
}

/** A component barrel:  the module that calls `define()` for its family. */
const BARREL = /\/src\/components\/[\w-]+\/index\.ts$/

/** A barrel's code calls `define()`. */
const DEFINES = /\.define\(/

/** A component sheet, as a component imports it (`UIButton.css?inline`). */
const SHEET = /\/src\/components\/[\w-]+\/[\w-]+\.css\?inline$/
