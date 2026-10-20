import { existsSync, readFileSync } from "node:fs"
import { join, relative } from "node:path"

import { readJSON5File } from "$/util/node/json5"

import { DesignComponents } from "./DesignComponents.ts"
import type { SiteDataFile } from "../src/docs-components/docs-components.types.ts"
import type { DesignExample, DesignSource } from "./tools.types.ts"

/****************
 * ### `DesignBrand`
 * The brand's `<brand-*>` elements (a component pack) as a card source of the design system
 * (`DesignSource`;  epic `claude-design`, P11):  one "Brand" card per family, beside Spell UI's own.
 * - Read as DATA, never imported:  `ui` must not depend on `brand` (root `AGENTS.md`, "Overview").
 *   So this reads files the brand writes, in the brand's package folder, which the CALLER names
 *   (`yarn design:build --brand <folder>`;  Spell UI never names the brand's folder itself, epic `repo-split` P5):
 *   - `docs/__data/components.json5` -- its docs set's data, the same shape as ours (its `yarn site:data`)
 *   - `docs/<tag>.html` -- its docs set's pages (served at `/components/brand/`):
 *     the examples are their Examples tab's `<ui-docs-example>`s, titled by the `<ui-section>` around each
 *   - each page's own `<style>`s:  the classes those examples use (`.brand-docs-row`, `.stage` ...)
 * - The elements themselves reach the bundle from the docs tool (`bundle-spell-ui.js --design`),
 *   which may import any package.
 ****************/
export class DesignBrand {
  /** the brand's package folder, absolute */
  readonly folder: string
  /** `packages/ui`, absolute:  the paths the export records are relative to it */
  readonly uiFolder: string
  /** the brand's site data */
  readonly data: SiteDataFile
  /** each docs page's text, by family folder, read once */
  private readonly pages = new Map<string, string>()

  constructor({ folder, uiFolder, data }: DesignBrandProps) {
    this.folder = folder
    this.uiFolder = uiFolder
    this.data = data
  }

  /** The card source of the brand in package folder `folder`, or `undefined` when it has no site data there. */
  static read(folder: string, uiFolder: string): DesignSource | undefined {
    const file = join(folder, DATA)
    if (!existsSync(file)) return undefined
    return new DesignBrand({ folder, uiFolder, data: readJSON5File<SiteDataFile>(file) }).source()
  }

  /** The brand's folder as the export records it:  relative to `packages/ui`, e.g. `../brand`. */
  get shownFolder(): string {
    return relative(this.uiFolder, this.folder)
  }

  /** This brand as a `DesignSource`. */
  source(): DesignSource {
    return {
      group: GROUP,
      data: this.data,
      componentsPath: `${this.shownFolder}/components`,
      docsPaths: [`${this.shownFolder}/${DATA}`, `${this.shownFolder}/${PAGES}/brand-*.html`],
      intro:
        "Spell's own elements (`<brand-*>`):  its colour tools, the inspector field, the composer, the build " +
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
      // its title:  `label`, or its old name, `header`
      const headers = [...before.matchAll(/<ui-section\b[^>]*\s(?:label|header)="([^"]*)"/g)]
      const title = headers.at(-1)?.[1] ?? "Example"
      const markup = DesignComponents.dedent(match[1]!)
      if (markup.trim()) result.push({ title, markup, source: `${this.shownFolder}/${PAGES}/${folder}.html` })
    }
    return result
  }

  /** The CSS family `folder`'s examples need:  its docs page's own `<style>`s. */
  style(folder: string): string {
    // comments out first:  a page's header comment may NAME a `<style>`
    const page = this.page(folder).replace(/<!--[\s\S]*?-->/g, "")
    const own = [...page.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/g)].map((match) =>
      DesignComponents.dedent(match[1]!)
    )
    return own.join("\n").trim()
  }

  /** Family `folder`'s docs page, or `""` when this checkout doesn't have it. */
  private page(folder: string): string {
    const cached = this.pages.get(folder)
    if (cached !== undefined) return cached
    const file = join(this.folder, PAGES, `${folder}.html`)
    const text = existsSync(file) ? readFileSync(file, "utf8") : ""
    this.pages.set(folder, text)
    return text
  }
}

/** Constructor props of `DesignBrand`. */
export type DesignBrandProps = {
  /** the brand's package folder, absolute */
  folder: string
  /** `packages/ui`, absolute */
  uiFolder: string
  /** the brand's site data */
  data: SiteDataFile
}

/** The brand's card group, after Spell UI's own. */
const GROUP = "Brand"

/** The brand's docs set, in its folder:  its pages, one per family (`<tag>.html`). */
const PAGES = "docs"

/** The brand's docs set's data, in its folder. */
const DATA = `${PAGES}/__data/components.json5`
