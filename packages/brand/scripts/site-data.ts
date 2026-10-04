/**
 * `yarn site:data` (in `packages/brand`):  the brand elements' docs data, `_data/components.json` (+ `pages.json`),
 * from their vocabularies and sheets, by Spell UI's own builder (`packages/ui/tools/SiteDataBuilder.ts`).
 * - The docs widgets (`<ui-docs-api>`, `<ui-docs-tokens>`) read it on the brand docs pages (`components/<tag>.html`,
 *   loaded with `_assets/ui/brand-docs.js`, which points `SiteData.url` here).
 * - `pages.json`:  the hand-kept facts per family (title, summary, status), seeded once for a new family, then edited
 *   by hand, as Spell UI's.
 * - Each tag's `href` is `components/<tag>.html` against `packages/brand/`:  where its page is.
 * - Run it after changing a vocabulary or a sheet's tokens, and commit both files.
 */
import { mkdirSync, writeFileSync } from "node:fs"
import path from "node:path"

import { SiteDataBuilder } from "$/ui/tools/SiteDataBuilder"

/** `packages/brand/`. */
const BRAND = path.resolve(import.meta.dirname, "..")

const builder = new SiteDataBuilder(undefined, {
  components: path.join(BRAND, "components"),
  docs: null,
  data: path.join(BRAND, "_data")
})
const { data, pages } = await builder.build()
mkdirSync(builder.dataFolder, { recursive: true })
writeFileSync(builder.dataFile, SiteDataBuilder.stringify(data))
writeFileSync(builder.pagesFile, SiteDataBuilder.stringify(pages))
console.log(
  `brand site data:  ${data.components.length} tags in ${Object.keys(data.families).length} families -> ` +
    path.relative(process.cwd(), builder.dataFile)
)
