/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

/**
 * Finds an installed npm package the way Node does:  `node_modules/<name>` in this folder, then every parent.
 * - Why:  yarn hoists to the repo root (`nmHoistingLimits: none`, one copy of Solid), so `packages/ui/node_modules/<name>`
 *   usually doesn't exist.  NEVER hardcode that path;  ask here.
 * - Reads `package.json` directly, so it works for packages whose `exports` hide it.
 */
export class NodePackage {
  /** `packages/ui/`, absolute, with a trailing slash:  where lookups start */
  static readonly ROOT = fileURLToPath(new URL("../", import.meta.url))

  /** Absolute folder of installed `name`, or `undefined` when no `node_modules` from `from` upward holds it. */
  static dir(name: string, from: string = NodePackage.ROOT): string | undefined {
    for (let folder = from.replace(/\/$/, ""); ; folder = dirname(folder)) {
      const candidate = join(folder, "node_modules", name)
      if (existsSync(join(candidate, "package.json"))) return candidate
      if (dirname(folder) === folder) return undefined
    }
  }

  /** Like `dir()` but throws when `name` isn't installed. */
  static need(name: string, from?: string): string {
    const dir = NodePackage.dir(name, from)
    if (!dir)
      throw new Error(`${name} is not installed (looked in every node_modules above ${from ?? NodePackage.ROOT})`)
    return dir
  }

  /** Installed version of `name`, or `undefined` when missing. */
  static version(name: string, from?: string): string | undefined {
    const dir = NodePackage.dir(name, from)
    if (!dir) return undefined
    return (JSON.parse(readFileSync(join(dir, "package.json"), "utf8")) as { version: string }).version
  }
}
