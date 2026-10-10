import { Show } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"

// Import directly:  the page's signals, not its family's barrel (which would define `<epic-page>` here)
import { EpicPage } from "$/epics/components/epic-page/EpicPage"
import { STATUS_STATES } from "$/epics/components/epic-item/EpicItem.types"

import { epicFieldVocabulary } from "./EpicField.en"
import { ICON, LABEL, TEXT } from "./EpicPhase.types"

import fieldCSS from "./EpicField.css?inline"

/****************
 * ### `EpicField`
 * The component behind `<epic-field>`:  one named field of a phase (Symptom, Changes, Goal ...) --
 * its icon in a column, centred on the first line, then its bold label (`Symptom:`) and its prose,
 * wrapping beside the icon.
 * - A labelled block in prose (`label`, no `name`:  `Where:`, P14):  the bold label and its prose, no icon column.
 * - Files and Verify are hidden until the Phases title's toggles show them (`--epic-files-display` /
 *   `--epic-verify-display`, inherited from the Phases section).
 * - To review:  each `#link` shows as a chip in its item's state colour.
 *   SIDE EFFECT:  writes `data-spell-state` on those links (light DOM), as today's runtime did,
 *   again whenever the page's layout changes.
 ****************/
export class EpicField extends E.UIComponent<typeof epicFieldVocabulary> {
  @E.proto static vocabulary = epicFieldVocabulary
  @E.protoMerged static elementSetup = { styleSheets: { "epic-field": fieldCSS } } satisfies Partial<E.ElementSetup>

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

  /** The page's layout counter:  bumped when sections come or go, or a phase changes (`EpicPage`). */
  get layout(): number {
    const page = this.page
    return page ? EpicPage.signalsOf(page).layout.get() : 0
  }

  /** To review:  colour its links by their items' states, again as the page changes (`layout`). */
  @E.onChange("name", "isConnected", "layout")
  protected onLayoutChanged(name: string | undefined, connected: boolean) {
    if (name === TO_REVIEW && connected) this.colourLinks()
  }

  /** A labelled block in prose (`label`, no `name`):  its label alone, no icon (P14). */
  get isLabelled(): boolean {
    return !this.name && !!this.label
  }

  render(): JSX.Element {
    return (
      <div class={[this.rootClass, FIELD, this.isLabelled && LABELLED]} part={this.partForName("base")}>
        <Show when={!this.isLabelled}>
          <span class={ICON} part={this.partForName("icon")} aria-hidden="true">
            {this.glyph.svg}
          </span>
        </Show>
        <div class={TEXT}>
          <b class={LABEL} part={this.partForName("label")}>
            {this.isLabelled
              ? this.translationForKey("labelled", { label: this.label ?? "" })
              : this.translationForKey(this.look.label)}
          </b>{" "}
          <slot />
        </div>
      </div>
    )
  }

  /** Mark each To review link with its item's state:  `state`, else by its status (`STATUS_STATES`). */
  private colourLinks() {
    for (const link of this.domElement.querySelectorAll(':scope > a[href^="#"]')) {
      const item = document.getElementById(decodeURIComponent(link.getAttribute("href")!.slice(1)))
      if (!item) continue
      const state = item.getAttribute("state") ?? STATUS_STATES[item.getAttribute("status") ?? ""] ?? "open"
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
 * The attribute the To review links get, their item's state (`attention`, `open` ...):
 * the name today's runtime gave it, which the field's sheet colours by.
 */
const LINK_STATE = "data-spell-state"

/** Class word of its box. */
const FIELD = "field"

/** Class word of a labelled block's box:  no icon column. */
const LABELLED = "labelled"
