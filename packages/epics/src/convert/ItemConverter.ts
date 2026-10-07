import { SectionIds, type EpicData, type ItemSectionKind } from "$/epics/definitions"

import { Old } from "./convert.types"

import type { Converter } from "./Converter"
import { isBlank, isElement, takeChildren, titleOf } from "./domEdits"

/****************
 * ### `ItemConverter`
 * The item sections, for `Converter`:  each becomes `<epic-section kind>`, each item an `<epic-item>` -- its
 * `data-*` marks as attributes (`ITEM_DATA`), its line's title as `title` (or a `slot="title"` child when it holds
 * markup, or an UPDATE marker), its details laid out by `CardConverter`.
 * - Born-answered questions (`add ... decision`:  the title IS the answer, no answer card) need nothing special:
 *   `answered`, `status="decided"`, their text as it is.
 * - Dropped, as chrome:  the id chip (`Q7`), the review label, the panel around the details;  an UPDATE label
 *   becomes `<epic-update phase>` in the title.
 ****************/
export class ItemConverter {
  /** The converter it works for:  STATIC for its life. */
  readonly owner: Converter

  constructor(owner: Converter) {
    this.owner = owner
  }

  /** `<epic-section kind>` from a section of items. */
  section(section: Element, kind: ItemSectionKind): Element {
    const items: Element[] = []
    for (const child of takeChildren(section)) {
      if (isBlank(child) || (isElement(child) && child.matches("ui-icon[slot='icon']"))) continue
      if (!isElement(child) || !child.matches(Old.items))
        throw this.owner.error("an item section holds a non-list", section)
      for (const item of takeChildren(child)) {
        if (isBlank(item)) continue
        if (!isElement(item) || item.localName !== "ui-item")
          throw this.owner.error("an item list holds a non-item", child)
        items.push(this.item(item))
      }
    }
    return this.owner.element("epic-section", { id: SectionIds[kind], kind }, items, section)
  }

  /** `<epic-item>` from a `<ui-item>`:  its marks, its title, its details. */
  private item(item: Element): Element {
    const panel = item.querySelector(`:scope > ${Old.itemPanel}`)
    const line = panel?.querySelector(":scope > ui-title") ?? item
    const updates = [...this.updatesIn(line), ...(panel ? this.updatesIn(item) : [])]
    const titleSpan = line.querySelector(`:scope > ${Old.itemTitle}`)
    for (const child of [...Array.from(line.childNodes), ...(panel ? Array.from(item.childNodes) : [])]) {
      if (child === panel || child === titleSpan || isBlank(child)) continue
      if (isElement(child) && child.matches(`${Old.chip}, ${Old.reviewLabel}`)) child.remove()
      else throw this.owner.error("an item's line holds more than its chip, title and labels", item)
    }
    if (!titleSpan) throw this.owner.error("an item without its title", item)
    const { title, slot } = titleOf(titleSpan, updates)
    const content = panel?.querySelector(":scope > ui-content")
    const details = content ? this.owner.cards.layout(item, takeChildren(content)) : []
    return this.owner.element("epic-item", this.data(item, title), slot ? [slot, ...details] : details, item)
  }

  /** The UPDATE labels among `parent`'s children, as `<epic-update phase>`s (taken out). */
  private updatesIn(parent: Element): Element[] {
    return Array.from(parent.querySelectorAll(`:scope > ${Old.updateLabel}[data-phase]`), (label) => {
      label.remove()
      return this.owner.element("epic-update", { phase: Number(label.getAttribute("data-phase")) }, [], label)
    })
  }

  /** `<epic-item>`'s data from the old item's `data-*` marks;  a mark it doesn't know is noted, not kept. */
  private data(item: Element, title: string | undefined): EpicData<"epic-item"> {
    const data: Record<string, string | number | boolean | undefined> = { id: item.id, title }
    for (const { name, value } of Array.from(item.attributes)) {
      if (name === "id") continue
      const key = ITEM_DATA[name as keyof typeof ITEM_DATA]
      if (!key) this.owner.note(`#${item.id}:  \`${name}\` has no attribute in <epic-item>:  dropped`)
      else if (BOOLEAN_DATA.has(key)) data[key] = true
      else if (key === "phase") data[key] = Number(value)
      else data[key] = value
    }
    return data as EpicData<"epic-item">
  }
}

/** An old item's marks => `<epic-item>`'s data keys. */
const ITEM_DATA = {
  "data-status": "status",
  "data-state": "state",
  "data-changed": "changed",
  "data-phase": "phase",
  "data-answered": "answered",
  "data-reviewed": "reviewed",
  "data-review-as": "reviewAs",
  "data-deferred": "deferred",
  "data-queued": "queued",
  "data-work": "work",
  "data-working": "working",
  "data-bedtime": "bedtime"
} as const

/** The marks that are there or not:  booleans. */
const BOOLEAN_DATA = new Set<string>(["answered", "working", "bedtime"])
