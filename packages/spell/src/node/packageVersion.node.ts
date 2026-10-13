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
 * - What `tsx` runs imports this FIRST, before anything reads it:  spaces' servers (`appRoutes.ts`, `cli.ts`),
 *   lsp's `server.ts` and `scopes.ts`, the `spell` command (`main.ts`).
 */
globalThis.__PACKAGE_VERSION__ ??= readPackageVersion()
