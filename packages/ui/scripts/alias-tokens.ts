import { readdirSync, readFileSync, writeFileSync } from "node:fs"
import { fileURLToPath } from "node:url"

import { ComponentTokens } from "$/ui/styles/ComponentTokens"
import { NodePackage } from "../tools/NodePackage.ts"
import { SITE_PAGES } from "../tools/tools.types.ts"

/**
 * `yarn tokens:alias <family> [--write]`:  the codemod of `docs/theming.md` "Converting a family".
 * - Rewrites every sheet of `src/components/ui-<family>/` so it never DECLARES a public `--ui-<family>-*` token:
 *   the first declaration becomes the private alias `--_ui-x: var(--ui-x, <default>)`, later ones (variations)
 *   write the alias, and every read in the family's sheets reads the alias.  See `ComponentTokens.convert()`.
 * - Without `--write` it only prints:  the notes to review, and every OTHER file still naming a converted token
 *   (other sheets' reads, tests, examples, docs) -- those need a human, see the recipe.
 * - NOTE: imports the leaf file, not the `$/ui/styles` barrel (whose `?inline` imports only Vite understands).
 */
class AliasTokensCommand {
  /** repo root */
  readonly root = fileURLToPath(new URL("../", import.meta.url))

  /** oxfmt binary, run over rewritten sheets so `yarn format` is a no-op afterwards */
  readonly formatter = `${NodePackage.need("oxfmt")}/bin/oxfmt`

  /**
   * Parse arguments, convert, report.
   * - SIDE EFFECT:  with `--write`, overwrites the family's sheets (then formats them).
   */
  async run(args: string[]) {
    const family = args.find((arg) => !arg.startsWith("--"))
    const write = args.includes("--write")
    if (!family) throw new Error("usage:  yarn tokens:alias <family> [--write]")

    const tokens = new ComponentTokens(this.read(this.files("src/components", /\.vocabulary\.en\.ts$/)), [
      ...Object.values(this.read(this.files("src/styles", /\.css$/)))
    ])
    const sheets = this.read(this.files(`src/components/${family}`, /\.css$/))
    const declared = new Set(
      Object.values(sheets).flatMap((css) =>
        tokens
          .publicDeclarations(css)
          .filter(({ name }) => tokens.owner(name)?.family === family)
          .map(({ name }) => name)
      )
    )
    console.log(`${family}:  ${declared.size} public tokens declared`)

    const written: string[] = []
    for (const [path, css] of Object.entries(sheets)) {
      const { css: converted, notes } = tokens.convert(family, css, declared)
      console.log(`\n${path}${converted === css ? "  (unchanged)" : ""}`)
      for (const note of notes) console.log(`  - ${note}`)
      if (write && converted !== css) {
        writeFileSync(`${this.root}${path}`, converted)
        written.push(`${this.root}${path}`)
      }
    }
    if (written.length > 0) {
      const { execFileSync } = await import("node:child_process")
      execFileSync(this.formatter, written, { stdio: "ignore" })
    }

    console.log("\nOther files naming a converted token (reads of the PUBLIC name, not through the alias):")
    const own = new Set(Object.keys(sheets))
    const pattern = new RegExp(`(?<!var\\(--_ui-[a-z0-9-]+, var\\()(${[...declared].join("|")})(?![a-z0-9-])`, "g")
    // the site's pages:  the shared `ui/` at the checkout's root (`SITE_PAGES`)
    for (const directory of ["src", "test", "site", SITE_PAGES, "docs"]) {
      for (const path of this.files(directory, /\.(css|ts|tsx|html|md)$/)) {
        if (own.has(path) || path.endsWith("docs/report.md") || GENERATED_SITE.test(path) || declared.size === 0)
          continue
        const lines = readFileSync(`${this.root}${path}`, "utf8").split("\n")
        lines.forEach((line, index) => {
          if (line.match(pattern)) console.log(`  ${path}:${index + 1}:  ${line.trim().slice(0, 140)}`)
        })
      }
    }
  }

  /** Repo-relative paths under `directory` (recursive) whose name matches `pattern`. */
  private files(directory: string, pattern: RegExp): string[] {
    return (readdirSync(`${this.root}${directory}`, { recursive: true }) as string[])
      .filter((file) => pattern.test(file) && !file.includes("node_modules"))
      .map((file) => `${directory}/${file}`)
      .sort()
  }

  /** path => text of each repo-relative path. */
  private read(paths: string[]): Record<string, string> {
    return Object.fromEntries(paths.map((path) => [path, readFileSync(`${this.root}${path}`, "utf8")]))
  }
}

/** The site's generated files:  the minified bundle and its data, never hand-edited. */
const GENERATED_SITE = /^site\/_(assets|data)\//

await new AliasTokensCommand().run(process.argv.slice(2))
