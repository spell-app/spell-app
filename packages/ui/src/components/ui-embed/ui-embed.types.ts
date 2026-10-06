/**
 * Constants and types of the `ui-embed` family:  what its element, host, `EmbedSources` and native fallback share.
 * - Pure data, at the bottom of the folder's imports:  `import type` only, so node can load it (`yarn site:data`).
 *   `ID` / `SAFE_PROTOCOLS`, which only `EmbedSources` reads, sit below that class (epic `wwod-spell-ui`, Q18).
 */

import type { UIT } from "$/ui/core"
import type { embedVocabulary } from "./ui-embed.vocabulary.en"

////////////////
// ## Element
////////////////

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof embedVocabulary

/** What the host asks of its controller (`UIEmbed`). */
export type EmbedController = {
  /** load the frame as the play button would;  true when it loads */
  activate(): boolean
  /** back to the placeholder */
  reset(): void
}

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

////////////////
// ## Markup
////////////////

/** Class word of the play button (`ui-embed.css`) -- grammar, not an attribute, so not in the vocabulary. */
export const PLAY_CLASS = "play"

/** Class word of the placeholder image, as `PLAY_CLASS`. */
export const PLACEHOLDER_CLASS = "placeholder"

/** Class word of the box around the frame, as `PLAY_CLASS`. */
export const FRAME_CLASS = "embed"

/** What the frame may use (players ask for these). */
export const ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"

/** Referrer the frame gets:  YouTube's player needs the origin. */
export const REFERRER_POLICY = "strict-origin-when-cross-origin"
