/**
 * The types the `ui-embed` family's files share:  `UIEmbed` and `EmbedSources`.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 * - A constant only one class reads sits below that class (epic `wwod-spell-ui`, Q18).
 */

import type { UIT } from "$/ui/core"

////////////////
// ## Sources
////////////////

/** One known source. */
export type EmbedSourceSpec = {
  /** hosts it's recognised by (subdomains included) */
  domains: readonly string[]
  /** player URL, `{id}` for the video id */
  url: string
  /** its player parameters */
  parameters: (settings: { autoplay: boolean; brandedUI: boolean }) => EmbedParameters
}

/** URL parameters;  booleans become `1` / `0`, `undefined` / `null` are left out. */
export type EmbedParameters = Record<string, string | number | boolean | null | undefined>

/** What `EmbedSources.resolve()` builds from. */
export type EmbedUrlOptions = {
  /** known video host of `id` */
  source?: UIT.EmbedSource
  /** the video's id at `source` */
  id?: string
  /** a URL to use as given, instead of `source` + `id`;  its source is still recognised by domain */
  url?: string
  /** start playing as the frame loads */
  autoplay: boolean
  /** keep the player's own branding (titles, logos) */
  brandedUI: boolean
  /** the page's own player parameters, over the source's */
  parameters?: EmbedParameters
}
