import {
  SITE_DATA_META,
  SITE_DATA_PATH,
  type SiteDataFile,
  type SiteFamily,
  type SiteTag
} from "./docs-components.types"

/****************
 * ### `SiteData`
 * The docs site's generated data, `site/_data/components.json` (`yarn site:data`), fetched once per page and shared
 * by every docs element (`<ui-docs-api>`, `<ui-docs-tokens>`, `<ui-docs-nav>` ...).
 * - Where it is:  `SiteData.url`.  The site bundle's entry (`site/_src/site.ts`) sets it from its own location
 *   (`_assets/` => `../_data/components.json`), so a page at any depth finds it.  Unset:  a
 *   `<meta name="ui-docs-data" content="...">` in the page, else `_data/components.json` against the page.
 * - Fails loudly:  a missing or broken file rejects `load()` (and stays rejected until `reset()`);  an element shows
 *   its error, it never guesses.
 * - Plain fetch, no Solid:  elements wrap `load()` in their own async memo.
 ****************/
export class SiteData {
  /** URL of `components.json`, absolute or against the page;  see the class. */
  static url: string | undefined

  /** The one fetch, once started. */
  private static loading: Promise<SiteDataFile> | undefined

  /** The data file, fetched once per page. */
  static load(): Promise<SiteDataFile> {
    return (SiteData.loading ??= SiteData.fetch(SiteData.resolve()))
  }

  /** Forget the fetch (tests, a rebuilt file):  the next `load()` fetches again. */
  static reset(url?: string): void {
    SiteData.loading = undefined
    if (url !== undefined) SiteData.url = url
  }

  /** `tag`'s entry (a component or a docs tag), or `undefined`. */
  static tag(data: SiteDataFile, tag: string): SiteTag | undefined {
    return data.components.find((entry) => entry.tag === tag) ?? data.docs.find((entry) => entry.tag === tag)
  }

  /** The family `tag` belongs to (by its folder), or `undefined`. */
  static family(data: SiteDataFile, tag: string): SiteFamily | undefined {
    const folder = SiteData.tag(data, tag)?.folder ?? tag
    return Object.hasOwn(data.families, folder) ? data.families[folder] : undefined
  }

  /**
   * The site root, as an absolute URL ending in `/`:  the folder above the data file's `_data/` (`SITE_DATA_PATH`).
   * - What `<ui-docs-nav>` prefixes its links with when the page gives no `base`.
   */
  static root(): string {
    return new URL("../", SiteData.resolve()).href
  }

  /** Where to fetch from:  `url`, else the page's `<meta name="ui-docs-data">`, else `SITE_DATA_PATH`. */
  private static resolve(): string {
    const meta = document.querySelector<HTMLMetaElement>(`meta[name="${SITE_DATA_META}"]`)?.content
    return new URL(SiteData.url ?? meta ?? SITE_DATA_PATH, document.baseURI).href
  }

  /** Fetch and parse `url`;  rejects with what went wrong. */
  private static async fetch(url: string): Promise<SiteDataFile> {
    const response = await fetch(url)
    if (!response.ok) throw new Error(`SiteData:  ${url} answered ${response.status}`)
    return (await response.json()) as SiteDataFile
  }
}
