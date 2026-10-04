import { SiteData } from "$/ui/docs-components/SiteData"
import { SITE_SEARCH_PATH, type SiteSearchFile } from "$/ui/docs-components/docs-components.types"

/****************
 * ### `SearchData`
 * The site's search file, `site/_data/search.json` (`yarn site:data`):  every page's sections, fetched once per page,
 * on the first search (~170 KB, ~25 KB compressed:  never on load).
 * - Where it is:  `SearchData.url`, else beside the data file:  `_data/search.json` under `SiteData.root()`.
 * - Fails loudly, like `SiteData`:  `load()` rejects (until `reset()`);  the search then finds the other pages' TITLES
 *   only through their components, never their sections.
 * - Plain fetch, no Solid.
 ****************/
export class SearchData {
  /** URL of `search.json`, absolute or against the page;  unset:  beside the data file. */
  static url: string | undefined

  /** The one fetch, once started. */
  private static loading: Promise<SiteSearchFile> | undefined

  /** The search file, fetched once per page. */
  static load(): Promise<SiteSearchFile> {
    return (SearchData.loading ??= SearchData.fetch())
  }

  /** Forget the fetch (tests, a rebuilt file):  the next `load()` fetches again. */
  static reset(url?: string): void {
    SearchData.loading = undefined
    SearchData.url = url
  }

  /** Fetch and parse the file;  rejects with what went wrong (an unresolvable URL included). */
  private static async fetch(): Promise<SiteSearchFile> {
    const url = new URL(SearchData.url ?? SITE_SEARCH_PATH, SearchData.url ? document.baseURI : SiteData.root()).href
    const response = await fetch(url)
    if (!response.ok) throw new Error(`SearchData:  ${url} answered ${response.status}`)
    return (await response.json()) as SiteSearchFile
  }
}
