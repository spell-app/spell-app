import { IconName, type IconPackIndex } from "$/ui/icons"

import type { IconPackIcon, IconPackOptions, ResolvedIcon } from "./runtime.types"

/****************
 * ### `IconPack`
 * One loaded icon pack:  its index, the names it answers, and where its SVGs live.
 * - In the runtime's lazy chunk;  imports the icon PACK format (`$/ui/icons`), never a pack itself.
 * - Built by `IconPacks.use()` (`UI.icons`);  the page-wide order and the SVG cache are `IconPacks`'.
 * - Names follow `IconName.claim()`:  an `alias` beats a file name, else the first entry keeps a shared name.
 ****************/
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

  constructor({ index, url, options = {} }: IconPackProps) {
    this.index = index
    this.url = url
    const base = options.base ? new URL(options.base, IconPack.pageUrl()).href : new URL("./", url).href
    this.base = base.endsWith("/") ? base : `${base}/`
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
    return key === undefined ? undefined : { ...this.iconFor(key), name }
  }

  /**
   * Every icon, in index order, with all the names that reach it -- for the docs icon browser.
   * - An icon whose names were all taken by other entries has an empty `names`.
   */
  icons(): IconPackIcon[] {
    const names = new Map<string, string[]>()
    for (const [name, key] of this.names) names.set(key, [...(names.get(key) ?? []), name])
    return Object.keys(this.index.icons).map((key) => ({ ...this.iconFor(key), names: names.get(key) ?? [] }))
  }

  /** Index entry `key`'s location and size, defaults applied. */
  private iconFor(key: string): Omit<ResolvedIcon, "name"> {
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

  ////////////////
  // ## Statics
  ////////////////

  /**
   * Import the pack whose index is at absolute `url`.
   * - STATIC:  the factory, called before there's a pack.
   * - SIDE EFFECT:  runs `pack.js`, like any script the page adds:  the page author opted in to it.
   * - Rejects when the file can't load or isn't an index (no `id` / `icons`).
   */
  static async load(url: string, options?: IconPackOptions): Promise<IconPack> {
    const module = (await import(/* @vite-ignore */ url)) as { default?: IconPackIndex }
    const index = module.default
    if (!index || typeof index.id !== "string" || typeof index.icons !== "object") {
      throw new TypeError(`IconPack.load():  ${url} isn't an icon pack index (no \`id\` / \`icons\`);  check the URL`)
    }
    return new IconPack({ index, url, options })
  }

  /**
   * What a relative URL is relative to:  the page's base URL, or `undefined` outside a browser.
   * - STATIC:  read for every pack and source alike (`IconPacks` asks it too), from no pack in particular.
   */
  static pageUrl(): string | undefined {
    return globalThis.document?.baseURI
  }
}

/** Constructor props for `IconPack`. */
export type IconPackProps = {
  /** the index, as `pack.js` exported it */
  index: IconPackIndex
  /** absolute URL of `pack.js` */
  url: string
  /** how `UI.icons.use()` added it */
  options?: IconPackOptions
}

/** viewBox width / height when neither the entry nor `defaults` sets it. */
const DEFAULT_SIZE = 512
