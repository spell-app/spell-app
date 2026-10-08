import { Show, untrack } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { embedVocabulary } from "./ui-embed.vocabulary.en"
import { EmbedFallback } from "./ui-embed.fallback"
import { EmbedSources } from "./EmbedSources"
import { UIEmbedHost } from "./UIEmbedHost"
import {
  ALLOW,
  FRAME_CLASS,
  PLACEHOLDER_CLASS,
  PLAY_CLASS,
  REFERRER_POLICY,
  type EmbedParameters,
  type Vocabulary
} from "./ui-embed.types"

import embedCSS from "./ui-embed.css?inline"

/****************
 * ### `<ui-embed>`
 * An embed:  `<div class="ui ... embed" part="embed">` holding a play `<button>` (the `placeholder` image, the icon,
 * the slot) until activated, then `<div class="embed" part="frame">` around the `<iframe>`.
 * - Privacy:  NOTHING third-party loads before activation -- no frame, no player script, not even a preconnect;
 *   only the page's own placeholder image.  (Fomantic loaded the frame at once when there was no placeholder.)
 * - Activation:  a click, Enter or Space on the button (a native `<button>`), or `host.activate()`:  the cancelable
 *   `ui-activate` (with the frame's `url`), then `active` -- and focus moves into the frame, so someone on the
 *   keyboard carries on in the player.  Writing `active` loads / unloads without an event;  `host.reset()` unloads
 *   with `ui-reset`.
 * - URL:  `EmbedSources` -- `source` + `video-id`, or `url`;  `http(s)` only;  `autoplay` (default on:  the click
 *   asked for it), `branded-ui` and `parameters` become player parameters.
 * - Names:  the button is `Play {label}`, the frame's `title` is `label` (`label`, else `alt`, else `video` /
 *   `embedded content`), all translated texts.
 ****************/
export class UIEmbed extends E.UIElement<Vocabulary> {
  @E.proto static vocabulary = embedVocabulary
  @E.proto static styleSheets = { embed: embedCSS }
  @E.proto static elementSetup = { Fallback: EmbedFallback, Host: UIEmbedHost }

  ////////////////
  // ## Active
  ////////////////

  /** Is the frame loaded?  `active`:  host-controlled, or internal;  `:state(active)`. */
  @E.cssState("active")
  @E.controlled("active")
  accessor isActive = false

  /** Move focus into the next frame (it was activated from the keyboard / a click). */
  private shouldFocusFrame = false

  /** Load the frame as an action of the page's reader:  the cancelable `ui-activate` first.  True when it loads. */
  activate(originalEvent?: Event): boolean {
    if (untrack(() => this.isActive)) return false
    const url = untrack(() => this.frameUrl)
    if (!url) return false
    const detail: UIT.EmbedActivateDetail = { url, originalEvent }
    const isApplied = this.requestChange("isActive", true, () => this.send("ui-activate", detail))
    if (isApplied) this.shouldFocusFrame = true
    return isApplied
  }

  /** Back to the placeholder (Fomantic's `reset`), with `ui-reset`. */
  reset() {
    if (!untrack(() => this.isActive)) return
    this.isActive = false
    this.send("ui-reset", {})
  }

  ////////////////
  // ## The frame
  ////////////////

  /** The frame URL, `undefined` when there's nothing (safe) to load. */
  @E.derived
  get frameUrl(): string | undefined {
    return EmbedSources.resolve({
      source: (this.source ?? undefined) as UIT.EmbedSource | undefined,
      id: this.videoId ?? undefined,
      url: this.url ?? undefined,
      autoplay: this.autoplay !== false,
      brandedUI: !!this.brandedUi,
      parameters: (this.parameters ?? undefined) as EmbedParameters | undefined
    })
  }

  /** What it is:  `label`, else `alt`, else the default for a video / anything. */
  @E.derived
  get accessibleName(): string {
    const own = this.label || this.alt
    if (own) return own
    const video = this.source || EmbedSources.sourceFor(this.url ?? undefined)
    return this.translationForKey(video ? "embedVideo" : "embedContent")
  }

  ////////////////
  // ## The play button
  ////////////////

  /** Glyph over the placeholder. */
  readonly iconGlyph = new E.IconGlyph({ owner: this, name: () => this.icon || undefined })

  ////////////////
  // ## Classes
  ////////////////

  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "active") return this.isActive
    return super.classValue(name)
  }

  /** The aspect-ratio word after the noun (`ui embed 4:3`). */
  protected get extraClasses(): string | undefined {
    return this.aspectRatio ?? undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClasses} part={this.partForName("embed")}>
        <Show when={this.isActive && this.frameUrl} fallback={this.playButton()}>
          <div class={FRAME_CLASS} part={this.partForName("frame")}>
            <iframe
              ref={this.onFrame}
              src={this.frameUrl}
              title={this.accessibleName}
              allow={ALLOW}
              allowfullscreen
              referrerpolicy={REFERRER_POLICY}
            />
          </div>
        </Show>
      </div>
    )
  }

  /** The play button:  placeholder image, icon, slot. */
  private playButton(): JSX.Element {
    return (
      <button
        type="button"
        class={PLAY_CLASS}
        part={this.partForName("play")}
        aria-label={this.translationForKey("embedPlay", { name: this.accessibleName })}
        onClick={this.onPlay}
      >
        <Show when={this.placeholder}>
          <img class={PLACEHOLDER_CLASS} part={this.partForName("placeholder")} src={this.placeholder!} alt="" />
        </Show>
        <Show when={this.icon}>
          <span class={UIT.ICON_CLASS} part={this.partForName("icon")}>
            {this.iconGlyph.svg}
          </span>
        </Show>
        <slot />
      </button>
    )
  }

  ////////////////
  // ## Handlers
  ////////////////

  /** The play button. */
  private readonly onPlay = (event: MouseEvent) => {
    this.activate(event)
  }

  /** A frame rendered:  take focus into it after an activation. */
  private readonly onFrame = (frame: HTMLIFrameElement) => {
    if (!this.shouldFocusFrame) return
    this.shouldFocusFrame = false
    queueMicrotask(() => {
      if (frame.isConnected) frame.focus()
    })
  }
}
/** The vocabulary getters, typed. */
export interface UIEmbed extends E.AttributeValues<Vocabulary> {}
