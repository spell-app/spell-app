import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { PartElement } from "./PartElement"
import { avatarVocabulary } from "./ui-avatar.vocabulary.en"

/****************
 * ### `<ui-avatar>`
 * A small picture of a person:  `<span class="avatar"><img part="image" alt=""></span>` from `src`, else the
 * default slot (a slotted `<img>`).
 * - `alt` defaults to `""`:  the person's name is almost always right next to it.
 ****************/
export class UIAvatar extends PartElement<typeof avatarVocabulary> {
  @E.proto static vocabulary = avatarVocabulary

  protected get rootTag(): string {
    return "span"
  }

  protected content(): JSX.Element {
    return (
      <Show when={this.src} fallback={<slot />}>
        <img src={this.src} alt={this.alt ?? ""} part={this.partForName("image")} />
      </Show>
    )
  }
}

/** The vocabulary getters, typed (`UIElement`'s doc). */
export interface UIAvatar extends E.AttributeValues<typeof avatarVocabulary> {}
