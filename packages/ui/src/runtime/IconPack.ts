import { IconName, type IconPackIndex } from "$/ui/icons"

import type { IconPackIcon, IconPackOptions, ResolvedIcon } from "./runtime.types"

/**
 * One loaded icon pack:  its index, the names it answers, and where its SVGs live.
 * - Built by `IconPacks.use()` (`UI.icons`);  the page-wide order and the SVG cache are `IconPacks`'.
 * - Names follow `IconName.claim()`:  an `alias` beats a file name, else the first entry keeps a shared name.
 */
export class IconPack {
  /** the index, as `pack.js` exported it */
  readonly index: IconPackIndex
  /** absolute URL of `pack.js` */
  readonly url: string
  /** folder the index keys resolve against, absolute, ending in `/` */
  readonly base: string
  /** extra `prefix:` this pack answers to, besides its id */
  readonly prefix?: string
  /** normalized name -> index key */
  private readonly names: Map<string, string>

  constructor(index: IconPackIndex, url: string, options: IconPackOptions = {}) {
    this.index = index
    this.url = url
    this.base = IconPack.folder(options.base ? new URL(options.base, IconPack.page()).href : new URL("./", url).href)
    this.prefix = options.prefix?.toLowerCase()
    this.names = IconName.claim(Object.entries(index.icons).map(([key, entry]) => [key, entry.alias]))
  }

  /** the index's id */
  get id(): string {
    return this.index.id
  }

  /** Does `prefix` (lowercase) name this pack? */
  answers(prefix: string): boolean {
    return prefix === this.id || prefix === this.prefix
  }

  /** Where normalized `name` leads in this pack, or `undefined`. */
  resolve(name: string): ResolvedIcon | undefined {
    const key = this.names.get(name)
    return key === undefined ? undefined : { ...this.icon(key), name }
  }

  /**
   * Every icon, in index order, with all the names that reach it -- for the docs icon browser.
   * - An icon whose names were all taken by other entries has an empty `names`.
   */
  icons(): IconPackIcon[] {
    const names = new Map<string, string[]>()
    for (const [name, key] of this.names) names.set(key, [...(names.get(key) ?? []), name])
    return Object.keys(this.index.icons).map((key) => ({ ...this.icon(key), names: names.get(key) ?? [] }))
  }

  /** One entry's location and size, defaults applied. */
  private icon(key: string): Omit<ResolvedIcon, "name"> {
    const entry = this.index.icons[key]
    const defaults = this.index.defaults ?? {}
    return {
      pack: this.id,
      key,
      url: new URL(`${key}.svg`, this.base).href,
      width: entry.width ?? defaults.width ?? DEFAULT_SIZE,
      height: entry.height ?? defaults.height ?? DEFAULT_SIZE
    }
  }

  /**
   * Import the pack whose index is at absolute `url`.
   * - SIDE EFFECT:  runs `pack.js`, like any script the page adds:  the page author opted in to it.
   * - Rejects when the file can't load or isn't an index (no `id` / `icons`).
   */
  static async load(url: string, options?: IconPackOptions): Promise<IconPack> {
    const module = (await import(/* @vite-ignore */ url)) as { default?: IconPackIndex }
    const index = module.default
    if (!index || typeof index.id !== "string" || typeof index.icons !== "object") {
      throw new Error(`${url} is not an icon pack index`)
    }
    return new IconPack(index, url, options)
  }

  /** `url` ending in `/`, so relative keys resolve INSIDE it. */
  private static folder(url: string): string {
    return url.endsWith("/") ? url : `${url}/`
  }

  /** What a relative `base` is relative to:  the page, or nothing outside a browser. */
  private static page(): string | undefined {
    return typeof document === "undefined" ? undefined : document.baseURI
  }
}

/** viewBox width / height when neither the entry nor `defaults` sets it. */
const DEFAULT_SIZE = 512
