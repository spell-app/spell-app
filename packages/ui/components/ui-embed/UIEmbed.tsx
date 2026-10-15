import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { embedVocabulary } from "./UIEmbed.en"
import { EmbedSources } from "./EmbedSources"
import type { EmbedParameters } from "./UIEmbed.types"

import embedCSS from "./UIEmbed.css?inline"

/****************
 * ### `DOMEmbedElement`
 * The DOM element of `<ui-embed>`:
 * it adds the embed's script API, `activate()` and `reset()`, which its component does.
 *
 * - NOTE: `DOMElement` checks its members against the attributes' property names;
 *   neither `activate` nor `reset` is one.
 * - Above the component:  its `elementSetup` reads this class while the component is defined.
 ****************/
export class DOMEmbedElement extends E.DOMElement<UIEmbed> {
  /**
   * Load the frame as the play button would (the cancelable `ui-activate` first);
   * true when it loads (Fomantic's `show`).
   */
  activate(): boolean {
    return this.component?.activate() ?? false
  }

  /** Back to the placeholder, with `ui-reset` (Fomantic's `reset`). */
  reset() {
    this.component?.reset()
  }
}

/****************
 * ### `UIEmbed`
 * The component behind `<ui-embed>`:  a video or other page from another site, loaded only when asked for.
 * `<div class="ui … embed" part="embed">` holding a play `<button>` (the `placeholder` image, the icon, the slot)
 * until activated, then `<div class="embed" part="frame">` around the `<iframe>`.
 *
 * - Privacy:  NOTHING third-party loads before activation (no frame, no player script, not even a preconnect),
 *   only the page's own placeholder image.  (Fomantic loaded the frame at once when there was no placeholder.)
 *
 * - Activation:  a click, Enter or Space on the button (a native `<button>`), or `domElement.activate()`.
 *   - The cancelable `ui-activate` (with the frame's `url`) comes first, then `active`.
 *   - Focus moves into the frame, so someone on the keyboard carries on in the player.
 *   - Writing `active` loads / unloads without an event;  `domElement.reset()` unloads, with `ui-reset`.
 *
 * - Its URL comes from `EmbedSources`:  `source` + `video-id`, or `url`;  `http(s)` only.
 *   `autoplay` (on by default:  the click asked for it), `branded-ui` and `parameters` become player parameters.
 *
 * - Names:  the button is `Play {label}`, the frame's `title` is `label`
 *   (`label`, else `alt`, else `video` / `embedded content`), all translated texts.
 ****************/
export class UIEmbed extends E.UIComponent<Vocabulary> {
  @E.proto static vocabulary = embedVocabulary
  @E.protoMerged static elementSetup = {
    styleSheets: { embed: embedCSS },
    DOMElement: DOMEmbedElement
  } satisfies Partial<E.ElementSetup>

  ////////////////
  // ## Active
  ////////////////

  /**
   * Is the frame loaded?  `active`:  the DOM element's `active` property when set, else kept here;  `:state(active)`.
   */
  @E.cssState("active")
  @E.controlled("active")
  accessor isActive = false

  /** Move focus into the next frame (it was activated from the keyboard / a click). */
  private shouldFocusFrame = false

  /** Load the frame as an action of the page's reader:  the cancelable `ui-activate` first.  True when it loads. */
  @E.untracked
  activate(originalEvent?: Event): boolean {
    if (this.isActive) return false
    const url = this.frameUrl
    if (!url) return false
    const detail: UIT.EmbedActivateDetail = { url, originalEvent }
    const isApplied = this.requestChange("isActive", true, () => this.send("ui-activate", detail))
    if (isApplied) this.shouldFocusFrame = true
    return isApplied
  }

  /** Back to the placeholder (Fomantic's `reset`), with `ui-reset`. */
  @E.untracked
  reset() {
    if (!this.isActive) return
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

  /** The aspect-ratio word before the noun (`ui 4:3 embed`). */
  protected get extraClass(): string | undefined {
    return this.aspectRatio ?? undefined
  }

  ////////////////
  // ## Rendering
  ////////////////

  render(): JSX.Element {
    return (
      <div class={this.rootClass} part={this.partForName("embed")}>
        <Show when={this.isActive && this.frameUrl} fallback={this.playButton()}>
          <div class={FRAME_CLASS} part={this.partForName("frame")}>
            <iframe
              ref={this.onFrame}
              src={this.frameUrl}
              title={this.accessibleName}
              allow={ALLOW}
              allowfullscreen
              referrerpolicy="strict-origin-when-cross-origin"
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
    E.afterSolidUpdate(() => {
      if (frame.isConnected) frame.focus()
    })
  }
}
/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface UIEmbed extends E.AttributeValues<Vocabulary> {}

/** The vocabulary type, for brevity. */
type Vocabulary = typeof embedVocabulary

/** The class word of the play button (`UIEmbed.css`):  grammar, not an attribute, so not in the vocabulary. */
const PLAY_CLASS = "play"

/** The class word of the placeholder image, as `PLAY_CLASS`. */
const PLACEHOLDER_CLASS = "placeholder"

/** The class word of the box around the frame, as `PLAY_CLASS`. */
const FRAME_CLASS = "embed"

/** What the frame may use (players ask for these). */
const ALLOW = "accelerometer; autoplay; clipboard-write; encrypted-media; fullscreen; gyroscope; picture-in-picture"
