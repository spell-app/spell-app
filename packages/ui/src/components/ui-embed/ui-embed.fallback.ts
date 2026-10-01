import { NativeFallback, proto } from "$/ui/core"

import { embedVocabulary } from "./ui-embed.vocabulary.en"
import { EmbedSources, type EmbedParameters } from "./EmbedSources"

/****************
 * ### `EmbedFallback`
 * The element's markup, plain DOM:  `<div part="embed" class="ui ... embed">` with a play button (placeholder image,
 * the slot) that swaps itself for the `<iframe>` -- so the video still plays, and still only after a click.
 ****************/
export class EmbedFallback extends NativeFallback<typeof embedVocabulary> {
  @proto static vocabulary = embedVocabulary
  @proto static degraded = [
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
      class: "play",
      part: "play",
      "aria-label": `Play ${this.label()}`
    })
    const placeholder = this.attr("placeholder")
    if (placeholder)
      button.append(this.create("img", { class: "placeholder", part: "placeholder", src: placeholder, alt: "" }))
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
      allow: "autoplay; encrypted-media; fullscreen; picture-in-picture",
      allowfullscreen: true,
      referrerpolicy: "strict-origin-when-cross-origin"
    })
    this.box.classList.add("active")
    this.box.replaceChildren(this.create("div", { class: "embed", part: "frame" }, frame))
  }

  /** The frame URL, read from the attributes. */
  private url(): string | undefined {
    let parameters: EmbedParameters | undefined
    try {
      parameters = JSON.parse(this.attr("parameters") ?? "null") ?? undefined
    } catch {
      parameters = undefined
    }
    const autoplay = this.host.getAttribute("autoplay")
    return EmbedSources.resolve({
      source: (this.attr("source") ?? undefined) as "youtube" | "vimeo" | undefined,
      id: this.attr("video-id") ?? undefined,
      url: this.attr("url") ?? undefined,
      autoplay: autoplay === null || this.flag("autoplay"),
      brandedUI: this.flag("branded-ui"),
      parameters
    })
  }

  /** `label`, else `alt`, else English defaults. */
  private label(): string {
    return this.attr("label") || this.attr("alt") || (this.attr("source") ? "video" : "embedded content")
  }
}
