import { createRenderEffect, type Accessor } from "solid-js"
import type { JSX } from "@solidjs/web"

import type { E } from "$/ui/core"
import { loaderVocabulary } from "$/ui/components/ui-loader/UILoader.en"

/****************
 * ### `LoaderMessage`
 * What `<ui-root loading="...">` shows while its components load:  a `<ui-loader>` with the message.
 * `UIRoot.Loading`, so an app swaps the look with one assignment or a subclass (`UIRoot.Loading = MyLoading`).
 * - The `ui-loader` family is imported STATICALLY, by the root's barrel (`index.ts`):  one of the two families a root
 *   never loads on demand (the other is `ui-placeholder`, for skeletons).  Not here:  this file is also loaded by the
 *   static server render (`$/ui/static`), where defining an element throws.  Its vocabulary only:  pure data.
 * - Built with the DOM, not JSX:  Solid's JSX has no types for our tags.
 * - Static:  an app swaps the CLASS (`UIRoot.Loading`), and it keeps no state of its own.
 ****************/
export class LoaderMessage {
  /** The loader, `part` set to the root's `loading` part name, its text following `message`. */
  static render(part: string, message: Accessor<string>): JSX.Element {
    const loader = document.createElement(loaderVocabulary.tag)
    for (const name of LOADER_SWITCHES) loader.setAttribute(name, "")
    loader.setAttribute("part", part)
    createRenderEffect(message, (text) => {
      loader.textContent = text
    })
    return loader
  }
}

/** A class `UIRoot.Loading` accepts:  `LoaderMessage` or one shaped like it. */
export type RootLoading = Pick<typeof LoaderMessage, "render">

/** The loader's switches for a centred spinner with its text below:  `<ui-loader active inline centered text>`. */
const LOADER_SWITCHES: readonly E.AttributeName<typeof loaderVocabulary>[] = ["active", "inline", "centered", "text"]
