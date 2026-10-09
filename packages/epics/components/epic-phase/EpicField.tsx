import { createEffect } from "solid-js"
import { isServer, type JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// Import directly:  the page's signals, not its family's barrel (which would define `<epic-page>` here)
import { EpicPage } from "$/epics/components/epic-page/EpicPage"

import { epicFieldVocabulary } from "./EpicField.en"
import { ICON, LABEL, TEXT } from "./EpicPhase.types"

import fieldCSS from "./EpicField.css?inline"

/****************
 * ### `EpicField`
 * The component behind `<epic-field>`:  one named field of a phase (Symptom, Changes, Goal ...) -- its icon in a
 * column, centred on the first line, then its bold label (`Symptom:`) and its prose, wrapping beside the icon.
 * - Files and Verify are hidden until the Phases title's toggles show them (`--epic-files-display` /
 *   `--epic-verify-display`, inherited from the Phases section).
 * - To review:  each `#link` shows as a chip in its item's state colour.  SIDE EFFECT:  writes `data-spell-state` on
 *   those links (light DOM), as today's runtime did, again whenever the page's layout changes.
 ****************/
export class EpicField extends E.UIComponent<typeof epicFieldVocabulary> {
  @E.proto static vocabulary = epicFieldVocabulary
  @E.proto static styleSheets = { "epic-field": fieldCSS }

  /** Its look:  icon and label key;  Symptom's for an unknown name. */
  get look(): FieldLook {
    return FIELD_LOOKS[(this.name ?? "symptom") as FieldName] ?? FIELD_LOOKS.symptom
  }

  /** Its icon. */
  readonly glyph = new E.IconGlyph({ owner: this, name: () => this.look.icon })

  /** The `<epic-page>` around it, once connected. */
  get page(): Element | null {
    return this.isConnected ? this.domElement.closest(EpicPage.TAG) : null
  }

  /** To review:  colour its links by their items' states, again as the page changes. */
  onMount(): JSX.Element {
    if (isServer) return super.onMount()
    createEffect(
      () => {
        // the layout count, so every change re-runs the apply;  -1:  nothing to colour
        const page = this.page
        const layout = page ? EpicPage.signalsOf(page).layout.get() : 0
        return this.name === TO_REVIEW && this.isConnected ? layout : -1
      },
      (layout) => {
        if (layout >= 0) this.colourLinks()
      }
    )
    return super.onMount()
  }

  render(): JSX.Element {
    return (
      <div class={[this.rootClass, FIELD]} part={this.partForName("base")}>
        <span class={ICON} part={this.partForName("icon")} aria-hidden="true">
          {this.glyph.svg}
        </span>
        <div class={TEXT}>
          <b class={LABEL} part={this.partForName("label")}>
            {this.translationForKey(this.look.label)}
          </b>{" "}
          <slot />
        </div>
      </div>
    )
  }

  /** Mark each To review link with its item's state:  `state`, else `old` once closed, `open` before. */
  private colourLinks() {
    for (const link of this.domElement.querySelectorAll(':scope > a[href^="#"]')) {
      const item = document.getElementById(decodeURIComponent(link.getAttribute("href")!.slice(1)))
      if (!item) continue
      const status = item.getAttribute("status") ?? ""
      const state = item.getAttribute("state") ?? (CLOSED_STATUSES.includes(status) ? "old" : "open")
      if (link.getAttribute(LINK_STATE) !== state) link.setAttribute(LINK_STATE, state)
    }
  }
}

/** The vocabulary's attribute getters, typed (see "Attributes" in `UIComponent`). */
export interface EpicField extends E.AttributeValues<typeof epicFieldVocabulary> {}

/** A field's `name` => its icon and its label's text key, as today's phase bodies drew them. */
const FIELD_LOOKS = {
  symptom: { icon: "circle exclamation", label: "symptom" },
  changes: { icon: "wand magic sparkles", label: "changes" },
  goal: { icon: "bullseye", label: "goal" },
  done: { icon: "circle check", label: "done" },
  files: { icon: "folder", label: "files" },
  verify: { icon: "flask", label: "verify" },
  "to-review": { icon: "list check", label: "toReview" }
} as const

/** A field's `name`. */
type FieldName = keyof typeof FIELD_LOOKS

/** One of `FIELD_LOOKS`. */
type FieldLook = (typeof FIELD_LOOKS)[FieldName]

/** The To review field:  its links show as chips in their items' state colours. */
const TO_REVIEW = "to-review"

/**
 * The attribute the To review links get, their item's state (`attention`, `open` ...):  the name today's runtime
 * gave it, which the field's sheet colours by.
 */
const LINK_STATE = "data-spell-state"

/** An item status that's closed:  its item, without a `state`, reads `old`. */
const CLOSED_STATUSES = ["decided", "done", "canceled"]

/** Class word of its box. */
const FIELD = "field"
