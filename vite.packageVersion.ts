import { readFileSync } from "node:fs"
import { resolve } from "node:path"

import type { Plugin } from "vite"

/**
 * Hand code the `package.json` version of the package being built as `__PACKAGE_VERSION__` -- see `PACKAGE_VERSION`
 * in `$/util`.
 * - MUST be used by every vite config:  `vite.config.ts`, `vitest.config.ts`, `vite.runner.config.ts`.
 * - `packageFolder`:  the package's own folder, `import.meta.dirname` in its config;  its `package.json` gives the
 *   version, so the stamp reaches into no other package.
 *   - The spell family shares one version (`0.8.0` ...), each package carrying it in its own `package.json`.
 * - Code `tsx` runs instead, e.g. the server, gets it from spell's `src/node/packageVersion.node.ts`.
 */
export function packageVersion(packageFolder: string): Plugin {
  return {
    name: "package-version",
    config: () => ({ define: { __PACKAGE_VERSION__: JSON.stringify(readPackageVersion(packageFolder)) } })
  }
}

/** The version in `<packageFolder>/package.json`. */
function readPackageVersion(packageFolder: string): string {
  const packageJson = resolve(packageFolder, "package.json")
  return (JSON.parse(readFileSync(packageJson, "utf8")) as { version: string }).version
}
