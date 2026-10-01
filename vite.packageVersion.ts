import type { Plugin } from "vite"

import { readPackageVersion } from "./packages/spell/src/packageVersion.node.ts"

/**
 * Hand code our `package.json` version as `__PACKAGE_VERSION__` -- see `PACKAGE_VERSION` in `#spell-util`.
 * - MUST be used by every vite config:  `vite.config.ts`, `vitest.config.ts`, `vite.runner.config.ts`.
 * - Code `tsx` runs instead, e.g. the server, gets it from `src/packageVersion.node.ts`.
 */
export function packageVersion(): Plugin {
  return {
    name: "package-version",
    config: () => ({ define: { __PACKAGE_VERSION__: JSON.stringify(readPackageVersion()) } })
  }
}
