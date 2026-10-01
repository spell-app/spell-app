/**
 * Loose constants and types of the `ui-embed` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-embed.types`.
 */

import type { EmbedSource } from "$/ui/core"
import type { embedVocabulary } from "./ui-embed.vocabulary.en"

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
  source?: EmbedSource
  id?: string
  url?: string
  autoplay: boolean
  brandedUI: boolean
  parameters?: EmbedParameters
}

/** Placeholder of the id in a source's URL. */
export const ID = "{id}"

/** Protocols an embed may load. */
export const SAFE_PROTOCOLS = ["http:", "https:"]

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof embedVocabulary

/** Class words of the markup contract (`ui-embed.css`) -- grammar, not attributes, so not in the vocabulary. */
export const PLAY_CLASS = "play"
export const PLACEHOLDER_CLASS = "placeholder"

export const FRAME_CLASS = "embed"

/** What the frame may use (players ask for these). */
export const ALLOW =
  "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"

/** Referrer the frame gets:  YouTube's player needs the origin. */
export const REFERRER_POLICY = "strict-origin-when-cross-origin"

/** What the host asks of its controller (`UIEmbed`). */
export type EmbedController = {
  activate(): boolean
  reset(): void
}
