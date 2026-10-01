import { readFileSync } from "fs"
import { resolve } from "path"
import { fileURLToPath } from "url"

/**
 * Our `package.json` version -- the app's, NOT the spell language's (`SP.SPELL_VERSION`).
 * - NODE ONLY:  reads the file.  NEVER import from browser code -- it gets `__PACKAGE_VERSION__` from vite.
 */
export function readPackageVersion(): string {
  const packageJson = resolve(fileURLToPath(import.meta.url), "..", "..", "..", "package.json")
  return (JSON.parse(readFileSync(packageJson, "utf8")) as { version: string }).version
}

/**
 * SIDE EFFECT: defines `__PACKAGE_VERSION__` for code `tsx` runs rather than vite.
 * - Vite and vitest define it themselves -- see `vite.packageVersion.ts`.
 * - `src/server/index.ts` and `src/lsp/server.ts` import this FIRST, before anything reads it.
 */
globalThis.__PACKAGE_VERSION__ ??= readPackageVersion()
