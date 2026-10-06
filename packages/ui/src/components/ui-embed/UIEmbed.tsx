import { Show, createMemo, untrack } from "solid-js"
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
  @E.proto static styles = { embed: embedCSS }
  @E.proto static Fallback = EmbedFallback
  @E.proto static Host = UIEmbedHost

  ////////////////
  // ## State
  ////////////////

  /** `active`:  host-controlled, or internal. */
  readonly activeState = this.controlled("active", false)

  /** Glyph over the placeholder. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.attrs.icon || undefined })

  /** The frame URL, `undefined` when there's nothing (safe) to load. */
  readonly url = createMemo(() =>
    EmbedSources.resolve({
      source: (this.attrs.source ?? undefined) as UIT.EmbedSource | undefined,
      id: this.attrs.videoId ?? undefined,
      url: this.attrs.url ?? undefined,
      autoplay: this.attrs.autoplay !== false,
      brandedUI: !!this.attrs.brandedUi,
      parameters: (this.attrs.parameters ?? undefined) as EmbedParameters | undefined
    })
  )

  /** What it is:  `label`, else `alt`, else the default for a video / anything. */
  readonly label = createMemo(() => {
    const own = this.attrs.label || this.attrs.alt
    if (own) return own
    const video = this.attrs.source || EmbedSources.sourceFor(this.attrs.url ?? undefined)
    return this.text(video ? "embedVideo" : "embedContent")
  })

  /** Move focus into the next frame (it was activated from the keyboard / a click). */
  private shouldFocusFrame = false

  /** Is the frame loaded? */
  isActive(): boolean {
    return this.activeState.get()
  }

  ////////////////
  // ## Element hooks
  ////////////////

  protected classValue(name: E.AttributeName<Vocabulary>): unknown {
    if (name === "active") return this.isActive()
    return super.classValue(name)
  }

  /** The aspect-ratio word after the noun (`ui embed 4:3`). */
  protected extraClasses(): string | undefined {
    return this.attrs.aspectRatio ?? undefined
  }

  protected hostStates() {
    return { active: this.isActive() }
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("embed")}>
        <Show when={this.isActive() && this.url()} fallback={this.placeholder()}>
          <div class={FRAME_CLASS} part={this.part("frame")}>
            <iframe
              ref={this.onFrame}
              src={this.url()}
              title={this.label()}
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
  private placeholder(): JSX.Element {
    return (
      <button
        type="button"
        class={PLAY_CLASS}
        part={this.part("play")}
        aria-label={this.text("embedPlay", { name: this.label() })}
        onClick={this.onPlay}
      >
        <Show when={this.attrs.placeholder}>
          <img class={PLACEHOLDER_CLASS} part={this.part("placeholder")} src={this.attrs.placeholder!} alt="" />
        </Show>
        <Show when={this.attrs.icon}>
          <span class={UIT.ICON_CLASS} part={this.part("icon")}>
            {this.glyph.svg()}
          </span>
        </Show>
        <slot />
      </button>
    )
  }

  ////////////////
  // ## Transitions
  ////////////////

  /** Load the frame as an action of the page's reader:  the cancelable `ui-activate` first.  True when it loads. */
  activate(originalEvent?: Event): boolean {
    if (untrack(() => this.isActive())) return false
    const url = untrack(this.url)
    if (!url) return false
    const detail: UIT.EmbedActivateDetail = { url, originalEvent }
    const isApplied = this.activeState.request(true, () => this.emit("ui-activate", detail))
    if (isApplied) this.shouldFocusFrame = true
    return isApplied
  }

  /** Back to the placeholder (Fomantic's `reset`), with `ui-reset`. */
  reset() {
    if (!untrack(() => this.isActive())) return
    this.activeState.set(false)
    this.emit("ui-reset", {})
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
