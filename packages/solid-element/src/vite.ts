/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * `@spell-app/solid-element/vite`:  hot module replacement for custom elements in Vite dev, without reloading the page.
 * - Element modules (those that define elements:  `detect` matches their code) become HMR boundaries:  the plugin
 *   appends `import.meta.hot.accept(() => hotUpdate(import.meta.hot))`.  Vite re-runs the module, which
 *   re-registers its tags (the fork swaps each class's component in place), then `hotUpdate()` re-renders
 *   every live instance -- or, when the platform can't take the change (observed attributes ...), invalidates,
 *   and Vite reloads the page.
 * - Style modules (`styles.include`, e.g. `?inline` CSS a component adopts) self-accept and hand the new text to
 *   `styles.handler`, which re-registers the sheet:  no re-render, shadow DOM nodes keep their identity.
 * - Shared code:  a changed module reaching MORE THAN ONE element module (a base class, the runtime) makes Vite
 *   reload the page, instead of re-running every element module against a fresh copy of the base class their
 *   live instances don't extend.  One element module (its vocabulary, a helper) stays hot.
 * - `apply: "serve"`:  builds are untouched.  Code is only APPENDED, so existing source maps stay valid.
 * - NOTE: `@solidjs/vite-plugin`'s own refresh transform wraps exported FUNCTION components;  class-based
 *   controllers and inline render functions get no refresh boundary, so the two don't meet.  A module with both
 *   gets both accept callbacks;  each does its own part.
 */

import type { EnvironmentModuleNode, Plugin } from "vite"

/** Default `detect`:  the module calls `customElement(` (or `register(`). */
const DEFINES = /\b(?:customElement|register)\s*\(/

/**
 * Hot-replace custom elements defined with `@spell-app/solid-element`;  add it after the Solid plugin.
 * - Defaults suit plain fork users:  every non-dependency module calling `customElement()` is a boundary.
 */
export function solidElementHot(options: SolidElementHotOptions = {}): Plugin {
  const include = options.include ?? /\.[cm]?[jt]sx?$/
  const exclude = options.exclude ?? /\/node_modules\//
  const detect = options.detect ?? DEFINES
  const runtime = JSON.stringify(options.runtime ?? "@spell-app/solid-element")
  const { styles, setup } = options
  // ids this plugin made boundaries:  element modules, then style modules
  const elementIds = new Set<string>()
  const styleIds = new Set<string>()

  return {
    name: "spell:solid-element-hot",
    apply: "serve",
    // after the Solid plugin (JSX compiled) and Vite's CSS plugin (`?inline` => `export default "..."`)
    enforce: "post",

    transform(code, id, transformOptions) {
      if (transformOptions?.ssr) return undefined
      if (styles?.include.test(id)) {
        styleIds.add(id)
        return { code: code + styleAccept(id, styles), map: null }
      }
      const [file] = id.split("?")
      if (file !== id || !include.test(file!) || exclude.test(file!) || !detect.test(code)) return undefined
      elementIds.add(id)
      const imports =
        (setup ? `import ${JSON.stringify(setup)};` : "") + `import { hotUpdate as __hotUpdate } from ${runtime};`
      // appended:  imports are hoisted, and no line moves (map: null keeps the incoming source map)
      return {
        code: `${code}\n${imports}\nif (import.meta.hot) import.meta.hot.accept(() => __hotUpdate(import.meta.hot));\n`,
        map: null
      }
    },

    hotUpdate({ file, modules, server }) {
      if (this.environment.name !== "client") return undefined
      for (const mod of modules) {
        if (styleIds.has(mod.id ?? "")) {
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
          `[solid-element] ${file} is shared by ${reached.size} element modules:  full reload`,
          { timestamp: true }
        )
        this.environment.hot.send({ type: "full-reload", path: "*" })
        return []
      }
      return undefined
    }
  }

  /** Collect the element modules `mod` reaches through its importers, stopping at any accepting module. */
  function reach(mod: EnvironmentModuleNode, reached: Set<string>, seen: Set<EnvironmentModuleNode>) {
    if (seen.has(mod)) return
    seen.add(mod)
    if (mod.id && elementIds.has(mod.id)) {
      reached.add(mod.id)
      return
    }
    if (mod.isSelfAccepting) return
    for (const importer of mod.importers) reach(importer, reached, seen)
  }
}

/** Code appended to a style module:  self-accept, and hand `(id, new text)` to the handler. */
function styleAccept(id: string, { handler, call = "updateStyle" }: SolidElementHotStyles): string {
  const [name, ...path] = call.split(".")
  const method = path.map((part) => `.${part}`).join("")
  return (
    `\nimport { ${name} as __hotStyles } from ${JSON.stringify(handler)};\n` +
    `if (import.meta.hot) import.meta.hot.accept((next) => { ` +
    `if (next) __hotStyles${method}(${JSON.stringify(id)}, next.default) });\n`
  )
}

/** Options of `solidElementHot()`. */
export type SolidElementHotOptions = {
  /** Candidate element modules, by id;  default JS / TS files. */
  include?: RegExp
  /** Never boundaries;  default dependencies (`/node_modules/`). */
  exclude?: RegExp
  /** Code test for "this module defines elements";  default a `customElement(` / `register(` call. */
  detect?: RegExp
  /** Module exporting `hotUpdate`;  default `@spell-app/solid-element`.  MUST be the instance the elements use. */
  runtime?: string
  /**
   * Module every element module imports first (side effect), e.g. a framework hook that turns its own
   * idempotent `define()` into a re-definition on HMR.
   */
  setup?: string
  /** Style modules to update in place instead of re-rendering. */
  styles?: SolidElementHotStyles
}

/** Style handling of `solidElementHot()`. */
export type SolidElementHotStyles = {
  /** Style module ids, query included, e.g. `/\.css\?inline$/`. */
  include: RegExp
  /** Module exporting the handler. */
  handler: string
  /**
   * Export to call as `(id, css)`;  `Name.method` calls a static method.  Default `updateStyle`.
   * - `id` is the style module's id (path + query), `css` its new text.
   */
  call?: string
}
