import { E } from "$/ui/core"
import { SiteData } from "$/ui/docs-components/SiteData"
import { SITE_SEARCH_PATH, type SiteSearchFile } from "$/ui/docs-components/docs-components.types"

/****************
 * ### `SearchData`
 * The site's search file, `_data/search.json` (the shared `ui/_data/search.json`, `yarn site:data`):
 * every page's sections, fetched once per page, on the first search (~170 KB, ~25 KB compressed:  never on load).
 * - `SiteData`'s twin, the same surface:  `url` (setting it fetches again), `load()`;
 *   fetched through `SiteData.request()`.
 * - Where it is:  `SearchData.url`, else beside the data file:  `_data/search.json` under `SiteData.root()`.
 * - Fails loudly, like `SiteData`:  `load()` rejects (until `url` is set again).
 *   The search then finds the other pages' TITLES only through their components, never their sections.
 * - Plain fetch, no Solid.
 * - Static only:  the file is one per page.
 ****************/
export class SearchData {
  /**
   * URL of `search.json`, absolute or against the page;  unset:  beside the data file.
   * - Setting it (to a new URL, the same one, or `undefined`) makes the next `load()` fetch again, as `SiteData.url`.
   */
  @E.resets("load") static accessor url: string | undefined

  /** The search file, fetched once per page (until `url` is set). */
  @E.once static load(): Promise<SiteSearchFile> {
    return SearchData.fetch()
  }

  /** Fetch and parse the file;  rejects with what went wrong (an unresolvable URL included). */
  private static async fetch(): Promise<SiteSearchFile> {
    const url = new URL(SearchData.url ?? SITE_SEARCH_PATH, SearchData.url ? document.baseURI : SiteData.root()).href
    const response = await SiteData.request(url, {
      method: "SearchData.load()",
      fix: "run `yarn site:data` in packages/ui, or check `SearchData.url`"
    })
    return (await response.json()) as SiteSearchFile
  }
}
