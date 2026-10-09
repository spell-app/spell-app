/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs"
import { dirname, join, normalize, relative, resolve } from "node:path"

/****************
 * ### `DeclarationCheck`
 * Checks the built declarations (`dist/**.d.ts`, `vite.config.ts` `declarations()`) are what a consumer needs.
 * - Every `types` path in `package.json` `exports` (and the top-level `types`) exists.
 * - Every import / export STATEMENT is a bare package name, or a relative path that resolves INSIDE `dist/`:  no
 *   `$/util`, `$/ui` ... (build-time aliases a consumer can't resolve), and nothing escaping `dist/` (`util` is
 *   not published on its own, so its declarations ship in `dist/_util/`).  Doc comments may mention aliases.
 * - `problems()` is empty when it's fine;  `yarn smoke` runs it after `vite build` and fails otherwise.
 * - Node only, node built-ins only.
 ****************/
export class DeclarationCheck {
  /** Package root, absolute. */
  readonly root: string

  /** `dist/`, absolute. */
  readonly dist: string

  constructor(root: string) {
    this.root = resolve(root)
    this.dist = join(this.root, "dist")
  }

  /** One message per problem found, `[]` when the declarations are sound. */
  problems(): string[] {
    return [...this.missingExports(), ...this.badSpecifiers()]
  }

  /** `exports` / `types` entries naming a `.d.ts` that doesn't exist. */
  private missingExports(): string[] {
    const packageJson = JSON.parse(readFileSync(join(this.root, "package.json"), "utf8")) as {
      types?: string
      exports?: Record<string, string | { types?: string }>
    }
    const paths = [
      packageJson.types,
      ...Object.values(packageJson.exports ?? {}).map((entry) => (typeof entry === "object" ? entry.types : undefined))
    ]
    return paths
      .filter((path): path is string => !!path)
      .filter((path) => !existsSync(join(this.root, path)))
      .map((path) => `package.json names ${path}, which does not exist`)
  }

  /** Import / export statements in `dist/**.d.ts` a consumer couldn't resolve. */
  private badSpecifiers(): string[] {
    const problems: string[] = []
    for (const file of DeclarationCheck.declarationFiles(this.dist)) {
      // block comments dropped first:  a docstring's example (`import("./Engine")`) is no statement
      const code = readFileSync(file, "utf8").replace(/\/\*[\s\S]*?\*\//g, "")
      for (const [, specifier] of code.matchAll(/(?:from |import\(|^import )["']([^"']+)["']/gm)) {
        if (!specifier.startsWith(".")) {
          if (specifier.startsWith("#") || specifier.startsWith("$")) {
            problems.push(`${relative(this.root, file)}:  alias "${specifier}"`)
          }
          continue
        }
        const target = normalize(resolve(dirname(file), specifier))
        const inside = target === this.dist || target.startsWith(`${this.dist}/`)
        if (!inside) problems.push(`${relative(this.root, file)}:  "${specifier}" leaves dist/`)
        else if (!DeclarationCheck.resolvesToDeclaration(target))
          problems.push(`${relative(this.root, file)}:  "${specifier}" not found`)
      }
    }
    return problems
  }

  /** Every `.d.ts` under `dir`, recursively. */
  private static declarationFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const path = join(dir, entry.name)
      if (entry.isDirectory()) return DeclarationCheck.declarationFiles(path)
      return entry.name.endsWith(".d.ts") ? [path] : []
    })
  }

  /**
   * Whether `target` (an import path) is a declaration file, or a folder with an `index.d.ts`.
   * - `./x.js` means `./x.d.ts`, as TypeScript reads it (`MDBundle.d.ts` imports `./md.bundle.js`)
   */
  private static resolvesToDeclaration(target: string): boolean {
    return (
      existsSync(`${target}.d.ts`) ||
      existsSync(target.replace(/\.m?js$/, ".d.ts")) ||
      (existsSync(target) && statSync(target).isDirectory() && existsSync(join(target, "index.d.ts")))
    )
  }
}
