import { E } from "$/ui/core"
import {
  SITE_DATA_META,
  SITE_DATA_PATH,
  type SiteDataFile,
  type SiteFamily,
  type SiteTag
} from "./docs-components.types"

/****************
 * ### `SiteData`
 * The docs site's generated data, `site/_data/components.json` (`yarn site:data`),
 * fetched once per page and shared by every docs element (`<ui-docs-api>`, `<ui-docs-tokens>`, `<ui-docs-nav>` ...).
 * - Where it is:  `SiteData.url`.
 *   - The site bundle's entry (`site/_src/site.ts`) sets it from its own location
 *     (`_assets/` => `../_data/components.json`), so a page at any depth finds it.
 *   - Unset:  a `<meta name="ui-docs-data" content="...">` in the page, else `_data/components.json` against the page.
 * - Fails loudly:  a missing or broken file rejects `load()` (and stays rejected until `url` is set again);
 *   an element shows its error, it never guesses.
 * - Plain fetch, no Solid:  elements wrap `load()` in their own async memo.
 * - The site's other files go through `request()` too (`SearchData`, the layout's `SiteShell`):  one way to fail.
 * - Imports `$/ui/core` for `E.SourceError`, `@E.once` and `@E.resets` only:
 *   every bundle that loads this already has the core.
 * - Static only:  the data is one per page.
 ****************/
export class SiteData {
  /**
   * URL of `components.json`, absolute or against the page;  see the class.
   * - Setting it (to a new URL, the same one, or `undefined`) makes the next `load()` fetch again:
   *   tests, a rebuilt file.
   * - `undefined`:  back to the page's own (`<meta>`, else `SITE_DATA_PATH`).
   */
  @E.resets("load") static accessor url: string | undefined

  /** The data file, fetched once per page (until `url` is set). */
  @E.once static load(): Promise<SiteDataFile> {
    return SiteData.fetch(SiteData.resolve())
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

  /**
   * GET `url` for `method`;  resolves with the response, which answered 2xx.
   * - Throws a `load` `E.SourceError` when it doesn't answer (the network error as `cause.error`)
   *   or answers anything else (`cause.status`);  the message names `method`, the URL, and `fix`.
   * - Not `UI.sources`:  that refuses `data:` URLs (tests point `url` at one), caches the text,
   *   and needs the runtime chunk, which the layout's fetch (`SiteShell`) mustn't wait for.
   */
  static async request(url: string, { method, fix }: SiteRequest): Promise<Response> {
    let response: Response
    try {
      response = await fetch(url)
    } catch (error) {
      const said = error instanceof Error ? error.message : String(error)
      throw new E.SourceError(`${method}:  ${url} didn't answer (${said});  ${fix}`, { cause: { kind: "load", error } })
    }
    if (response.ok) return response
    const answer = `${response.status} ${response.statusText}`.trim()
    throw new E.SourceError(`${method}:  ${url} answered ${answer};  ${fix}`, {
      cause: { kind: "load", status: response.status }
    })
  }

  /** Where to fetch from:  `url`, else the page's `<meta name="ui-docs-data">`, else `SITE_DATA_PATH`. */
  private static resolve(): string {
    const meta = document.querySelector<HTMLMetaElement>(`meta[name="${SITE_DATA_META}"]`)?.content
    return new URL(SiteData.url ?? meta ?? SITE_DATA_PATH, document.baseURI).href
  }

  /** Fetch and parse `url`;  rejects with what went wrong (`request()`). */
  private static async fetch(url: string): Promise<SiteDataFile> {
    const response = await SiteData.request(url, { method: "SiteData.load()", fix: REBUILD })
    return (await response.json()) as SiteDataFile
  }
}

/** What `SiteData.request()` says when a file doesn't come. */
export type SiteRequest = {
  /** the method its caller called, e.g. `SiteData.load()` */
  method: string
  /** how to fix it, e.g. ``run `yarn site:data` `` */
  fix: string
}

/** The fix for a missing or unreadable data file. */
const REBUILD = "run `yarn site:data` in packages/ui, or check `SiteData.url`"
