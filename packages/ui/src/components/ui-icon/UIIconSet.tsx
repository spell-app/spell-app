import type { JSX } from "@solidjs/web"

import { proto, UIElement } from "$/ui/core"

import { iconSetVocabulary } from "./ui-icon-set.vocabulary.en"

import iconSetCSS from "./icon-set.css?inline"

/****************
 * ### `<ui-icon-set>`
 * Adds an icon pack to the page:  `<ui-icon-set src="fa7-brands">`, `<ui-icon-set src="/icons/lucide/pack.js"
 * prefix="lucide" only>`.  Renders nothing and is hidden.
 * - The BEHAVIOUR is the runtime's (`UI.icons`, `src/runtime/IconPacks.ts`):  it reads every `ui-icon-set` in the
 *   document and watches for changes, so pages that never define this element work the same.  Defining it gives
 *   the tag its vocabulary, docs and `display: none`.
 * - NOTE:  no native fallback:  there is nothing to show, and the runtime needs no rendering.
 ****************/
export class UIIconSet extends UIElement<typeof iconSetVocabulary> {
  @proto static vocabulary = iconSetVocabulary
  @proto static styles = { iconSet: iconSetCSS }

  render(): JSX.Element {
    return null
  }
}
