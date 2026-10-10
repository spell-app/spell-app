/// <reference types="node" />

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs"
import { isAbsolute, join } from "node:path"
import * as vite from "vite"
import type { InlineConfig } from "vite"

import type { ImportMap } from "./tools.types.ts"
import { BundleMeasure } from "./BundleMeasure.ts"
import { Terminal } from "./Terminal.ts"

/****************
 * ### `PeerVendor`
 * Vendors the peer set for import-map pages:  ONE ES module per peer specifier (`solid-js`, `@solidjs/web`), so a
 * page maps each specifier to a local file and runs offline and deterministically.
 * - One Vite build with every specifier as its own entry:  modules they share (`@solidjs/signals`) land in shared
 *   chunks, so each module exists ONCE and identities hold across specifiers.
 * - Production conditions and `process.env.NODE_ENV`, minified:  what an app would ship.
 * - `resolve.dedupe` on every peer package:  a LINKED peer otherwise resolves its own imports (`solid-js`) from its
 *   own `node_modules`, bundling a second runtime.
 * - Tree-shaken to what is USED:  each specifier's file re-exports only the bindings the `usedBy` builds import from it
 *   (`BundleMeasure.importedBindings()`) -- `dist/` and the compiled Solid host app --
 *   so an import-map page downloads about the "library (as used)" size, not every export.
 *   A namespace import (`import * as`), a specifier nothing imports, or no build at all => the whole specifier.
 * - NOTE: run it AFTER `yarn build`, and again when `dist/` starts importing a new binding:
 *   a page importing a binding the vendored file lacks fails to load ("does not provide an export named ...").
 * - Writes `<outDir>/<specifier>.js` (+ `chunks/`), and `<outDir>/importmap.json` mapping each specifier to
 *   `<urlPrefix><file>`.
 * - Node only;  reuses `BundleMeasure`'s static helpers (specifiers, bindings, virtual entries).
 ****************/
export class PeerVendor {
  /** package root the specifiers resolve from, absolute */
  private readonly root: string
  /** `export * as x from "<spec>"` file listing the specifiers */
  private readonly peerEntry: string
  /** output directory, absolute */
  readonly outDir: string
  /** URL the output directory is served at */
  readonly urlPrefix: string
  /** built outputs (folders or files) whose imports decide what's vendored, absolute;  `[]` => everything */
  readonly usedBy: string[]

  constructor(options: PeerVendorOptions) {
    this.root = options.root
    this.peerEntry = isAbsolute(options.peerEntry) ? options.peerEntry : join(options.root, options.peerEntry)
    this.outDir = join(options.root, options.outDir ?? "vendor")
    this.urlPrefix = options.urlPrefix ?? "/vendor/"
    this.usedBy = options.usedBy === false ? [] : (options.usedBy ?? ["dist"]).map((path) => join(options.root, path))
  }

  /** Peer specifiers, from `peerEntry`. */
  specifiers(): string[] {
    return BundleMeasure.specifiers(this.peerEntry)
  }

  /** Build the vendored files;  resolves with (and writes) the import map. */
  async build(): Promise<ImportMap> {
    const specifiers = this.specifiers()
    const used = this.used()
    // the lib entries are bare specifiers:  a virtual module per entry re-exports each one
    const { plugin, entry } = BundleMeasure.virtualEntries(
      Object.fromEntries(
        specifiers.map((specifier) => [PeerVendor.fileOf(specifier), PeerVendor.reexport(specifier, used?.[specifier])])
      )
    )
    await vite.build({
      root: this.root,
      configFile: false,
      logLevel: "warn",
      plugins: [plugin],
      resolve: { dedupe: PeerVendor.packages(specifiers) },
      define: { "process.env.NODE_ENV": JSON.stringify("production") },
      build: {
        outDir: this.outDir,
        emptyOutDir: true,
        minify: true,
        lib: { entry, formats: ["es"] },
        rolldownOptions: {
          preserveEntrySignatures: "strict",
          output: { entryFileNames: "[name].js", chunkFileNames: "chunks/[name]-[hash].js" }
        }
      }
    } satisfies InlineConfig)
    const map: ImportMap = {
      imports: Object.fromEntries(
        specifiers.map((specifier) => [specifier, `${this.urlPrefix}${PeerVendor.fileOf(specifier)}.js`])
      )
    }
    mkdirSync(this.outDir, { recursive: true })
    writeFileSync(join(this.outDir, "importmap.json"), `${JSON.stringify(map, null, 2)}\n`)
    const shaken = specifiers.filter((specifier) => used?.[specifier] && !used[specifier].includes("*")).length
    Terminal.out(
      `vendored ${specifiers.length} specifiers (${shaken} tree-shaken to the bindings used) into ${this.outDir}`
    )
    return map
  }

  /**
   * Bindings the `usedBy` files import, per specifier;  `undefined` when there's nothing to read (then every
   * specifier is vendored whole).
   * - Reads `.js` modules and `.html` pages (their inline module scripts), under folders recursively.
   * - Icon packs (`dist/icon-packs/`) are skipped:  2,000 files of data, no imports.
   */
  private used(): Record<string, string[]> | undefined {
    const code: string[] = []
    for (const path of this.usedBy.filter((item) => existsSync(item))) {
      if (SCANNED.test(path)) {
        code.push(readFileSync(path, "utf8"))
        continue
      }
      for (const file of readdirSync(path, { recursive: true, encoding: "utf8" })) {
        if (SCANNED.test(file) && !file.startsWith("icon-packs/")) code.push(readFileSync(join(path, file), "utf8"))
      }
    }
    return code.length ? BundleMeasure.importedBindings(code) : undefined
  }

  /** npm packages of `specifiers`, once each:  `["solid-js", "solid-js/web"]` => `["solid-js"]`. */
  static packages(specifiers: string[]): string[] {
    return [...new Set(specifiers.map((specifier) => BundleMeasure.packageOf(specifier)))]
  }

  /** Output name of `specifier` (no extension):  `solid-js/web.js` => `solid-js/web`. */
  static fileOf(specifier: string): string {
    return specifier.replace(/\.m?js$/, "")
  }

  /**
   * Source of the virtual entry for `specifier`:  `names` only, or every export without them (or with `"*"`).
   * - NOTE: `export *` skips `default`;  none of today's peers (`solid-js`, `@solidjs/web`) has one.
   */
  private static reexport(specifier: string, names?: string[]): string {
    const from = JSON.stringify(specifier)
    if (!names?.length || names.includes("*")) return `export * from ${from}\n`
    return `export { ${names.join(", ")} } from ${from}\n`
  }
}

/** Constructor options of `PeerVendor`. */
export type PeerVendorOptions = {
  /** package root the specifiers resolve from */
  root: string
  /** `export * as x from "<spec>"` file listing the specifiers, absolute or relative to `root` */
  peerEntry: string
  /** output directory relative to `root`;  default `vendor` */
  outDir?: string
  /** URL the output directory is served at;  default `/vendor/` */
  urlPrefix?: string
  /**
   * Built outputs and pages (folders, `.js` or `.html` files, relative to `root`) whose imports decide which
   * bindings are vendored;  default `["dist"]`.
   * - `false` vendors every export.
   */
  usedBy?: string[] | false
}

/** Files `PeerVendor.used()` reads:  ES modules and pages (their inline module scripts). */
const SCANNED = /\.(js|html)$/
