import { existsSync, readFileSync } from "node:fs"
import { join } from "node:path"

import { DesignComponents } from "./DesignComponents.ts"
import type { SiteDataFile } from "../src/docs-components/docs-components.types.ts"
import type { DesignExample, DesignSource } from "./tools.types.ts"

/****************
 * ### `DesignBrand`
 * The brand's `<ui-brand-*>` elements as a card source of the design system (`DesignSource`;  epic `claude-design`,
 * P11):  one "Brand" card per family, beside Spell UI's own.
 * - Read as DATA, never imported:  `ui` must not depend on `brand` (root `AGENTS.md`, "Overview"), so this reads files
 *   the brand writes, as the brand book's "CONTENT FUNDAMENTALS" already was:
 *   - `packages/brand/_data/components.json` -- its site data (`yarn site:data` in `packages/brand`), the same shape
 *     as ours
 *   - `brand/components/<tag>.html` -- its docs pages (SHARED, the repo root's `brand/` link):  the examples are their
 *     Examples tab's `<ui-docs-example>`s, titled by the `<ui-section>` around each
 *   - the page's own `<style>`s and `packages/brand/_assets/brand-docs.css`'s example rules (`.brand-docs-row`,
 *     `.brand-docs-panel`):  the classes those examples use
 * - The elements themselves reach the bundle from the docs tool (`bundle-spell-ui.js --design`), which may import any
 *   package.
 ****************/
export class DesignBrand {
  /** the repo root, absolute */
  readonly root: string
  /** the brand's site data */
  readonly data: SiteDataFile
  /** each docs page's text, by family folder, read once */
  private readonly pages = new Map<string, string>()

  constructor({ root, data }: DesignBrandProps) {
    this.root = root
    this.data = data
  }

  /** The brand's card source, or `undefined` where this checkout has no brand site data. */
  static read(root: string): DesignSource | undefined {
    const file = join(root, DATA)
    if (!existsSync(file)) return undefined
    return new DesignBrand({ root, data: JSON.parse(readFileSync(file, "utf8")) as SiteDataFile }).source()
  }

  /** This brand as a `DesignSource`. */
  source(): DesignSource {
    return {
      group: GROUP,
      data: this.data,
      componentsPath: "../brand/components",
      intro:
        "Spell's own elements (`<ui-brand-*>`):  its colour tools, the inspector field, the composer, the build " +
        "checklist and phone, and the page art (logo, flourish, blob).  They read the brand roles (`--spell-*`, " +
        '`brand-*` and `surface-warm` ... in `tokens.json`) and take `color="accent"` (Polished Ivory).',
      examples: (folder) => this.examples(folder),
      style: (folder) => this.style(folder)
    }
  }

  /** Family `folder`'s examples:  its docs page's Examples tab, one per `<ui-docs-example>`, in page order. */
  examples(folder: string): DesignExample[] {
    const page = this.page(folder)
    const tab = /<ui-tab\s+value="examples"[\s\S]*?(?=<ui-tab\s|<\/ui-tabs>)/.exec(page)?.[0] ?? ""
    const result: DesignExample[] = []
    for (const match of tab.matchAll(/<ui-docs-example\b[^>]*>([\s\S]*?)<\/ui-docs-example>/g)) {
      const before = tab.slice(0, match.index)
      const headers = [...before.matchAll(/<ui-section\b[^>]*\sheader="([^"]*)"/g)]
      const title = headers.at(-1)?.[1] ?? "Example"
      const markup = DesignComponents.dedent(match[1]!)
      if (markup.trim()) result.push({ title, markup, source: `brand/components/${folder}.html` })
    }
    return result
  }

  /** The CSS family `folder`'s examples need:  its docs page's own `<style>`s, then `brand-docs.css`'s example rules. */
  style(folder: string): string {
    // comments out first:  a page's header comment may NAME a `<style>`
    const page = this.page(folder).replace(/<!--[\s\S]*?-->/g, "")
    const own = [...page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((match) =>
      DesignComponents.dedent(match[1]!)
    )
    const sheet = join(this.root, DOCS_CSS)
    const glue = existsSync(sheet)
      ? [...readFileSync(sheet, "utf8").matchAll(/^\.brand-docs-(?:row|panel)\s*\{[^}]*\}/gm)].map((match) => match[0])
      : []
    return [...own, ...glue].join("\n").trim()
  }

  /** Family `folder`'s docs page, or `""` when this checkout's `brand/` doesn't have it. */
  private page(folder: string): string {
    const cached = this.pages.get(folder)
    if (cached !== undefined) return cached
    const file = join(this.root, "brand/components", `${folder}.html`)
    const text = existsSync(file) ? readFileSync(file, "utf8") : ""
    this.pages.set(folder, text)
    return text
  }
}

/** Constructor props of `DesignBrand`. */
export type DesignBrandProps = {
  /** the repo root, absolute */
  root: string
  /** the brand's site data */
  data: SiteDataFile
}

/** The brand's card group, after Spell UI's own. */
const GROUP = "Brand"

/** The brand's site data, repo-relative. */
const DATA = "packages/brand/_data/components.json"

/** The brand docs pages' sheet, repo-relative:  its example rules travel with the cards. */
const DOCS_CSS = "packages/brand/_assets/brand-docs.css"
