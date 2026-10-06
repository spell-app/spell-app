import { createMemo } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E, UIT } from "$/ui/core"
import { loaderVocabulary } from "./ui-loader.vocabulary.en"
import { LoaderFallback } from "./ui-loader.fallback"
import { POLITE } from "./ui-loader.types"

import loaderCSS from "./ui-loader.css?inline"

/****************
 * ### `<ui-loader>`
 * A spinner, with optional text:  `<div class="ui … loader" part="loader"><slot></slot></div>`.
 * - The spinner is the root's `::before` / `::after`, decorative.
 * - The HOST is the live region, through internals:  `role=status`, `aria-live=polite` -- so it's announced
 *   wherever it's put, with nothing in the shadow root to find.  With no slotted text it's named by the
 *   `loading` text ("Loading…");  slotted text names it otherwise (a status takes its name from content).
 * - Shown only while `active` (Fomantic's rule, in `ui-loader.css`);  `:state(active)` / `:state(disabled)` are
 *   for page styling.
 * - Host is `display: contents`:  a centred loader is positioned against the nearest positioned ancestor in the
 *   flat tree, as Fomantic's `<div class="ui loader">` was.
 ****************/
export class UILoader extends E.UIElement<typeof loaderVocabulary> {
  @E.proto static vocabulary = loaderVocabulary
  @E.proto static styles = { loader: loaderCSS }
  @E.proto static Fallback = LoaderFallback
  @E.proto static delegatesFocus = false

  /** Light-DOM slot occupancy:  slotted text names the status. */
  readonly slots = new E.SlotContent(this.host)

  /** Has slotted text?  Tracked. */
  readonly hasText = createMemo(() => this.slots.has(""))

  constructor(...args: ConstructorParameters<typeof E.UIElement>) {
    super(...args)
    const { internals } = this.host
    internals.role = UIT.STATUS
    internals.ariaLive = POLITE
  }

  /** Adds the host's accessible name:  the `loading` text while nothing is slotted. */
  mount(): JSX.Element {
    // here, not in the constructor:  the name reads `UI.i18n` (via `text()`), which exists once the runtime loads;
    // `hostEffect`:  a server render (`$/ui/static`) applies it too
    this.hostEffect(
      () => (this.isLoaded() && !this.hasText() ? this.text("loading") : undefined),
      (label) => {
        // `null`:  `ariaLabel` is the platform's, and `null` removes it
        this.host.internals.ariaLabel = label ?? null
      }
    )
    return super.mount()
  }

  protected hostStates() {
    return { active: this.attrs.active, disabled: this.attrs.disabled }
  }

  render(): JSX.Element {
    return (
      <div class={this.classes()} part={this.part("loader")}>
        <slot />
      </div>
    )
  }
}
