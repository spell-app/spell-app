import { NativeFallback, proto, type NativeFallbackRoot, UIT } from "$/ui/core"

import { brandChecklistVocabulary } from "./ui-brand-checklist.vocabulary.en"
import { brandCheckVocabulary } from "./ui-brand-check.vocabulary.en"
import {
  ACTIVE,
  CHECK_PATH,
  CHECK_VIEW_BOX,
  CHECKABLE,
  DONE,
  PENDING,
  SERIF,
  SVG_NS,
  type CheckState
} from "./ui-brand-checklist.types"

/****************
 * ### `BrandChecklistFallback`
 * The list's or a check's markup without Solid, keyed by the host's tag -- the same markup as the elements, so
 * their sheets style it unchanged:
 * - `<ui-brand-checklist>`:  `<div class="checklist" part="list" role="list"><slot>`
 * - `<ui-brand-check>`:  `<div class="check <state> [serif]" part="check">`, the mark and the slotted text;  its
 *   state from the parent list's `step` (read from the DOM), else `selected` / `checked`, else `state`;  `serif` from
 *   its own `font`, else the list's
 ****************/
export class BrandChecklistFallback extends NativeFallback {
  @proto static degraded = [
    "ticking a `checkable` check (it shows its state, but a click changes nothing)",
    "progress announcements",
    "translated done / in progress words (English)"
  ]

  /**
   * The words after a done / active step's text, keyed by state:  English, from the vocabulary.
   * - Why:  a failed render can't count on the runtime's translations.
   */
  private static readonly TEXTS: Record<string, string> = Object.fromEntries(
    brandCheckVocabulary.texts.map(({ key, text }) => [key, text])
  )

  constructor(host: HTMLElement, root: NativeFallbackRoot, error?: unknown, internals?: ElementInternals) {
    super(host, root, error, internals)
    // Shadows the prototype's placeholder vocabulary, see `@proto`.
    this.vocabulary = host.localName === brandChecklistVocabulary.tag ? brandChecklistVocabulary : brandCheckVocabulary
  }

  protected override build() {
    if (this.vocabulary === brandChecklistVocabulary) {
      const list = this.create("div", { class: this.classes(), role: UIT.LIST }, this.slot())
      return [this.decorate(list, "list")]
    }
    const state = this.state()
    const checkable = this.flag("checkable") || this.parentFlag("checkable")
    const serif = (this.attr("font") ?? this.parentAttr("font")) === SERIF
    const words = [state, checkable ? CHECKABLE : "", serif ? SERIF : ""].filter(Boolean).join(" ")
    const check = this.create("div", { class: this.classes(words) })
    check.append(this.marker(), this.decorate(this.create("span", { class: "label" }, this.slot()), "label"))
    if (state !== PENDING && !checkable) {
      check.append(this.create("span", { class: UIT.VISUALLY_HIDDEN }, ` ${BrandChecklistFallback.TEXTS[state]}`))
    }
    return [this.decorate(check, "check")]
  }

  /** How the check shows:  the list's `step`, else `selected` / `checked`, else `state`. */
  private state(): CheckState {
    const parent = this.host.parentElement
    const step = parent?.localName === brandChecklistVocabulary.tag ? parent.getAttribute("step") : null
    if (step !== null && !Number.isNaN(Number(step)) && !this.parentFlag("checkable")) {
      const siblings = [...parent!.children].filter((child) => child.localName === this.host.localName)
      const index = siblings.indexOf(this.host)
      return index < Number(step) ? DONE : index === Number(step) ? ACTIVE : PENDING
    }
    if (this.flag("selected") || this.host.hasAttribute("checked")) return DONE
    const own = this.attr("state")
    return own === DONE || own === ACTIVE ? own : PENDING
  }

  /** Boolean attribute `name` on the parent list, if the parent is one. */
  private parentFlag(name: string): boolean {
    return this.parentAttr(name) !== null
  }

  /** Attribute `name` of the parent list, if the parent is one, else `null`. */
  private parentAttr(name: string): string | null {
    const parent = this.host.parentElement
    return parent?.localName === brandChecklistVocabulary.tag ? parent.getAttribute(name) : null
  }

  /** The round mark, a check inside (`ui-brand-check.css` shows it once done). */
  private marker(): HTMLElement {
    const document = this.host.ownerDocument
    const svg = document.createElementNS(SVG_NS, "svg")
    svg.setAttribute("viewBox", CHECK_VIEW_BOX)
    const path = document.createElementNS(SVG_NS, "path")
    path.setAttribute("d", CHECK_PATH)
    svg.append(path)
    return this.decorate(this.create("span", { class: "marker", "aria-hidden": "true" }, svg), "marker")
  }
}
