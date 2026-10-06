import { E, type UIT } from "$/ui/core"
import type { EmbedSourceSpec, EmbedUrlOptions } from "./ui-embed.types"

/****************
 * ### `EmbedSources`
 * The frame URL of a `<ui-embed>`:  Fomantic's embed `sources` (YouTube, Vimeo) and URL building, as data plus one
 * pure method.
 * - `source` + `id` fill the source's URL template;  a bare `url` is used as given, its source recognised by domain
 *   (so its player parameters still apply).
 * - Parameters:  the source's own (autoplay, branding), then the caller's `parameters` on top.  Values are `1` /
 *   `0` for booleans (the players' documented form), written with `URLSearchParams`.
 * - Only `http:` / `https:` URLs come out:  anything else (`javascript:`, `data:`) is refused with a dev warning, so a
 *   page can't be made to run script through an embed's `url`.
 * - YouTube plays from `youtube-nocookie.com` (its privacy-enhanced mode);  Fomantic used `youtube.com`.
 * - STATIC, instance-free on purpose:  the element and its native fallback share it, and neither holds one.
 ****************/
export class EmbedSources {
  /** Known sources:  where their player lives, how a domain is recognised, their parameters. */
  declare sources: Readonly<Record<UIT.EmbedSource, EmbedSourceSpec>>
  @E.proto static sources: Readonly<Record<UIT.EmbedSource, EmbedSourceSpec>> = {
    youtube: {
      domains: ["youtube.com", "youtu.be", "youtube-nocookie.com"],
      url: "https://www.youtube-nocookie.com/embed/{id}",
      parameters: ({ autoplay, brandedUI }) => ({
        autohide: !brandedUI,
        autoplay,
        hq: true,
        modestbranding: !brandedUI
      })
    },
    vimeo: {
      domains: ["vimeo.com"],
      url: "https://player.vimeo.com/video/{id}",
      parameters: ({ autoplay, brandedUI }) => ({
        autoplay,
        byline: brandedUI,
        portrait: brandedUI,
        title: brandedUI
      })
    }
  }

  /**
   * The frame URL for `options`, or `undefined` when there's nothing (safe) to load.
   * - NEVER throws:  a bad or unsafe URL is a dev warning and `undefined`.
   */
  static resolve(options: EmbedUrlOptions): string | undefined {
    const source = options.source ?? EmbedSources.sourceFor(options.url)
    const spec = source ? EmbedSources.sources[source] : undefined
    const base = options.url || (spec && options.id ? spec.url.replace(ID, encodeURIComponent(options.id)) : "")
    if (!base) return undefined
    let url: URL
    try {
      url = new URL(base, globalThis.location?.href)
    } catch {
      E.Warnings.devWarn("<ui-embed>", `"${base}" is not a URL`)
      return undefined
    }
    if (!SAFE_PROTOCOLS.includes(url.protocol)) {
      E.Warnings.devWarn("<ui-embed>", `refusing a ${url.protocol} URL;  only http(s) embeds load`)
      return undefined
    }
    const parameters = {
      ...(spec?.parameters({ autoplay: options.autoplay, brandedUI: options.brandedUI }) ?? {}),
      ...options.parameters
    }
    for (const [name, value] of Object.entries(parameters)) {
      if (value === undefined || value === null) continue
      url.searchParams.set(name, typeof value === "boolean" ? (value ? "1" : "0") : String(value))
    }
    return url.href
  }

  /** The known source whose domain `url` is on, if any. */
  static sourceFor(url: string | undefined): UIT.EmbedSource | undefined {
    if (!url) return undefined
    let host: string
    try {
      host = new URL(url, globalThis.location?.href).hostname
    } catch {
      return undefined
    }
    for (const [name, spec] of Object.entries(EmbedSources.sources) as [UIT.EmbedSource, EmbedSourceSpec][]) {
      if (spec.domains.some((domain) => host === domain || host.endsWith(`.${domain}`))) return name
    }
    return undefined
  }
}

/** Placeholder of the id in a source's URL. */
const ID = "{id}"

/** Protocols an embed may load. */
const SAFE_PROTOCOLS = ["http:", "https:"]
