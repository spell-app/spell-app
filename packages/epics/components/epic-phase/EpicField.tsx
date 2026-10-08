import { createEffect, createMemo } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { IconGlyph, proto, UIElement, UIT } from "$/ui/core"

// Import directly:  the page's signals, not its family's barrel (which would define `<epic-page>` here)
import { EpicPage } from "$/epics/components/epic-page/EpicPage"

import { epicFieldVocabulary } from "./epic-field.vocabulary.en"
import {
  CLOSED_STATUSES,
  FIELD,
  FIELD_LOOKS,
  ICON,
  LABEL,
  LINK_STATE,
  TEXT,
  TO_REVIEW,
  type EpicFieldVocabulary,
  type FieldName
} from "./epic-phase.types"

import fieldCSS from "./epic-field.css?inline"

/****************
 * ### `<epic-field>`
 * One named field of a phase (Symptom, Changes, Goal ...):  its icon in a column, centred on the first line, then
 * its bold label (`Symptom:`) and its prose, wrapping beside the icon.
 * - Files and Verify are hidden until the Phases title's toggles show them (`--epic-files-display` /
 *   `--epic-verify-display`, inherited from the Phases section).
 * - To review:  each `#link` shows as a chip in its item's state colour.  SIDE EFFECT:  writes `data-spell-state` on
 *   those links (light DOM), as today's runtime did, again whenever the page's layout changes.
 ****************/
export class EpicField extends UIElement<EpicFieldVocabulary> {
  @proto static vocabulary = epicFieldVocabulary
  @proto static styles = { "epic-field": fieldCSS }

  /** Its look:  icon and label key;  Symptom's for an unknown name. */
  readonly look = createMemo(() => FIELD_LOOKS[(this.attrs.name ?? "symptom") as FieldName] ?? FIELD_LOOKS.symptom)

  /** Its icon. */
  readonly glyph = new IconGlyph(this, () => this.look().icon)

  /** The `<epic-page>` around it, once connected. */
  readonly page = createMemo(() => (this.connected.get() ? this.host.closest(EpicPage.TAG) : null))

  /** To review:  colour its links by their items' states, again as the page changes. */
  mount(): JSX.Element {
    if (isServer) return super.mount()
    createEffect(
      () => {
        // the layout count, so every change re-runs the apply;  -1:  nothing to colour
        const page = this.page()
        const layout = page ? EpicPage.signalsOf(page).layout.get() : 0
        return this.attrs.name === TO_REVIEW && this.connected.get() ? layout : -1
      },
      (layout) => {
        if (layout >= 0) this.colourLinks()
      }
    )
    return super.mount()
  }

  render(): JSX.Element {
    return (
      <div class={[this.classes(), FIELD]} part={this.part("base")}>
        <span class={ICON} part={this.part("icon")} aria-hidden={UIT.TRUE}>
          {this.glyph.svg()}
        </span>
        <div class={TEXT}>
          <b class={LABEL} part={this.part("label")}>
            {this.text(this.look().label)}
          </b>{" "}
          <slot />
        </div>
      </div>
    )
  }

  /** Mark each To review link with its item's state:  `state`, else `old` once closed, `open` before. */
  private colourLinks() {
    for (const link of this.host.querySelectorAll(':scope > a[href^="#"]')) {
      const item = document.getElementById(decodeURIComponent(link.getAttribute("href")!.slice(1)))
      if (!item) continue
      const status = item.getAttribute("status") ?? ""
      const state = item.getAttribute("state") ?? (CLOSED_STATUSES.includes(status) ? "old" : "open")
      if (link.getAttribute(LINK_STATE) !== state) link.setAttribute(LINK_STATE, state)
    }
  }
}
