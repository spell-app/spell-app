import { E, UI } from "$/ui/core"
// A leaf, not `$/ui/vocabulary` (through `E`):  that barrel is in `core.js`, and only packs parse skeleton text at
// runtime, so it stays in this family's chunk
import { SkeletonText } from "$/ui/vocabulary/SkeletonText"
import { RootLoader } from "./RootLoader"
import {
  ComponentLoadPolicies,
  type ComponentLoadPolicy,
  type ComponentPackEntry,
  type RootPackTag
} from "./UIRoot.types"

/****************
 * ### `ComponentPack`
 * A component pack:  a JSON file listing tags a page's roots may meet, each with the module that defines it,
 * when to load it and what to draw until then (`ComponentPackEntry`).  `<ui-components source>` reads one;
 * so can a script (`ComponentPack.load()`).
 *
 * ```json
 * [
 *   { "tag": "x-chart", "source": "chart.js", "skeleton": "20 x 12" },
 *   { "tag": "x-legend", "source": "chart.js", "load": "eager" }
 * ]
 * ```
 *
 * - Fetched through `UI.sources`, so the pack is same-origin only;  each `source` resolves against the PACK file.
 * - A pack is CODE, not data:  its `source`s run like a `<script type="module">`.
 * - Every tag joins `RootLoader` page-wide (`addTags()`), its word winning over the catalog's.  While the pack is on
 *   its way, roots wait for it before calling a tag unknown (`RootLoader.adding()`).
 * - Static:  the tags are one set per page, kept by `RootLoader`.
 ****************/
export class ComponentPack {
  /**
   * Read the pack at `source` (against the document), check it, and add its tags to every root on the page.
   * - SIDE EFFECTS:  `RootLoader.adding()` at once (so roots wait for it), then `RootLoader.addTags()`;
   *   `eager` tags start loading.
   * - Rejects with a `SourceError`:  `load` / `cross-origin` / `file-protocol` when it can't be fetched (`UI.sources`),
   *   `render` when it isn't a pack (`entries()`).
   */
  static load(source: string): Promise<RootPackTag[]> {
    const loading = ComponentPack.read(source)
    RootLoader.adding(loading)
    return loading
  }

  /**
   * The tags of a pack's text, `text` fetched from `url`:
   * each checked, its `source` made absolute against `url`, its skeleton parsed.
   * - Throws a `render` `SourceError` naming the pack (and the entry) when it isn't a JSON array of entries,
   *   an entry isn't one, or a skeleton isn't skeleton text (its `TypeError` as `cause.error`).
   * - Static:  pure, so tests check packs without a server.
   */
  static entries(text: string, url: string): RootPackTag[] {
    let json: unknown
    try {
      json = JSON.parse(text)
    } catch (error) {
      throw ComponentPack.notAPack(`${url} isn't JSON`, error)
    }
    if (!Array.isArray(json)) throw ComponentPack.notAPack(`${url} isn't an array of entries`)
    return json.map((entry: unknown, index) => ComponentPack.entry(entry, { url, index }))
  }

  ////////////////
  // ## Internal
  ////////////////

  /** Fetch and read `source`, then add its tags. */
  private static async read(source: string): Promise<RootPackTag[]> {
    const ui = await UI.load()
    const { url, text } = await ui.sources.load(source)
    const tags = ComponentPack.entries(text, url)
    RootLoader.addTags(tags)
    return tags
  }

  /** Entry `index` of the pack at `url`, checked. */
  private static entry(entry: unknown, { url, index }: { url: string; index: number }): RootPackTag {
    const where = `${url} entry ${index + 1}`
    if (typeof entry !== "object" || entry === null) throw ComponentPack.notAPack(`${where} isn't an object`)
    const unknownKey = Object.keys(entry).find((key) => !ENTRY_KEYS.includes(key as keyof ComponentPackEntry))
    if (unknownKey) throw ComponentPack.notAPack(`${where} has an unknown key "${unknownKey}"`)
    const { tag, source, load = DEFAULT_LOAD, skeleton } = entry as Partial<Record<keyof ComponentPackEntry, unknown>>
    if (typeof tag !== "string" || !CUSTOM_ELEMENT_TAG.test(tag)) {
      throw ComponentPack.notAPack(`${where}'s tag ${JSON.stringify(tag)} isn't a custom-element name ("x-chart")`)
    }
    if (typeof source !== "string" || !source) throw ComponentPack.notAPack(`${where} (<${tag}>) has no source`)
    if (!ComponentLoadPolicies.includes(load as ComponentLoadPolicy)) {
      throw ComponentPack.notAPack(
        `${where} (<${tag}>):  load ${JSON.stringify(load)} isn't one of ${ComponentLoadPolicies.join(", ")}`
      )
    }
    const packTag = { tag, source: new URL(source, url).href, load: load as ComponentLoadPolicy }
    if (skeleton === undefined) return packTag
    if (typeof skeleton !== "string") throw ComponentPack.notAPack(`${where} (<${tag}>):  skeleton isn't text`)
    try {
      return { ...packTag, skeleton: SkeletonText.parse(skeleton) }
    } catch (error) {
      throw ComponentPack.notAPack(`${where} (<${tag}>):  ${(error as Error).message}`, error)
    }
  }

  /** The `render` `SourceError` for a pack that isn't one:  `problem`, then the fix. */
  private static notAPack(problem: string, error?: unknown): E.SourceError {
    return new E.SourceError(`ComponentPack.load():  ${problem};  ${FIX}`, {
      cause: error === undefined ? { kind: "render" } : { kind: "render", error }
    })
  }
}

/** The keys an entry may have. */
const ENTRY_KEYS: readonly (keyof ComponentPackEntry)[] = ["tag", "source", "load", "skeleton"]

/** `load` unless an entry says. */
const DEFAULT_LOAD: ComponentLoadPolicy = "on-demand"

/** A valid custom-element name, close enough:  lowercase, starts with a letter, has a `-`. */
const CUSTOM_ELEMENT_TAG = /^[a-z][a-z0-9._]*-[a-z0-9._-]*$/

/** How to write a pack, for every error. */
const FIX = `write a JSON array of { "tag", "source", "load"?, "skeleton"? }`
