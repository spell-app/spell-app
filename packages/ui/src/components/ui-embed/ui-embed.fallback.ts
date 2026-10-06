import { E, UIT } from "$/ui/core"
import { embedVocabulary } from "./ui-embed.vocabulary.en"
import { EmbedSources } from "./EmbedSources"
import {
  ALLOW,
  FRAME_CLASS,
  PLACEHOLDER_CLASS,
  PLAY_CLASS,
  REFERRER_POLICY,
  type EmbedParameters,
  type Vocabulary
} from "./ui-embed.types"

/****************
 * ### `EmbedFallback`
 * The element's markup, plain DOM:  `<div part="embed" class="ui ... embed">` with a play button (placeholder image,
 * the slot) that swaps itself for the `<iframe>` -- so the video still plays, and still only after a click.
 ****************/
export class EmbedFallback extends E.NativeFallback<Vocabulary> {
  @E.proto static vocabulary = embedVocabulary
  @E.proto static degraded = [
    "`ui-activate` / `ui-reset`, `host.activate()` / `reset()`, the `active` property, focus moving into the frame",
    "the play glyph, translated names (English only), `parameters` from the property (the attribute's JSON is read)"
  ]

  /** The box. */
  private box?: HTMLDivElement

  protected override build() {
    const ratio = this.attr("aspect-ratio")
    const box = this.create("div", { class: this.classes(ratio ?? undefined) })
    this.box = this.decorate(box, "embed")
    if (this.flag("active")) this.load()
    else box.append(this.playButton())
    return [box]
  }

  /** The play button:  loads the frame. */
  private playButton(): HTMLButtonElement {
    const button = this.create("button", {
      type: "button",
      class: PLAY_CLASS,
      part: PLAY_PART,
      "aria-label": this.text("embedPlay", this.label())
    })
    const placeholder = this.attr("placeholder")
    if (placeholder) {
      button.append(this.create("img", { class: PLACEHOLDER_CLASS, part: PLACEHOLDER_PART, src: placeholder, alt: "" }))
    }
    button.append(this.slot())
    this.listen(button, "click", () => this.load())
    return button
  }

  /** Swap the button for the frame. */
  private load() {
    const url = this.url()
    if (!url || !this.box) return
    const frame = this.create("iframe", {
      src: url,
      title: this.label(),
      allow: ALLOW,
      allowfullscreen: true,
      referrerpolicy: REFERRER_POLICY
    })
    this.box.classList.add(UIT.ACTIVE)
    this.box.replaceChildren(this.create("div", { class: FRAME_CLASS, part: FRAME_PART }, frame))
  }

  /** The frame URL, read from the attributes. */
  private url(): string | undefined {
    let parameters: EmbedParameters | undefined
    try {
      parameters = JSON.parse(this.attr("parameters") ?? "null") ?? undefined
    } catch {
      parameters = undefined
    }
    return EmbedSources.resolve({
      source: (this.attr("source") ?? undefined) as UIT.EmbedSource | undefined,
      id: this.attr("video-id") ?? undefined,
      url: this.attr("url") ?? undefined,
      autoplay: this.attr("autoplay") === null || this.flag("autoplay"),
      brandedUI: this.flag("branded-ui"),
      parameters
    })
  }

  /** `label`, else `alt`, else the vocabulary's English default for a video / anything. */
  private label(): string {
    return this.attr("label") || this.attr("alt") || this.text(this.attr("source") ? "embedVideo" : "embedContent")
  }

  /** The vocabulary's English text `key`, its `{name}` filled with `name`. */
  private text(key: E.TextKey<Vocabulary>, name = ""): string {
    const text = this.vocabulary.texts.find((each) => each.key === key)?.text ?? ""
    return text.replace("{name}", name)
  }
}

/** Part of the play button, from the vocabulary (`decorate()` would copy the host's ARIA onto it). */
const PLAY_PART: E.PartNameOf<Vocabulary> = "play"

/** Part of the placeholder image, as `PLAY_PART`. */
const PLACEHOLDER_PART: E.PartNameOf<Vocabulary> = "placeholder"

/** Part of the box around the frame, as `PLAY_PART`. */
const FRAME_PART: E.PartNameOf<Vocabulary> = "frame"
