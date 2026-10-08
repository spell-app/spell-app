import type { EpicData } from "$/epics/definitions"
import { PlanDoc } from "$/epics/tool/PlanDoc"
import { PlanMarkup } from "$/epics/tool/PlanMarkup"

import {
  Chrome,
  COMMITS_LABEL,
  EXTRA_FIELD_HOSTS,
  FIELD_NAMES,
  Old,
  UPDATED_LABEL,
  type FieldLabel,
  type FieldName
} from "./convert.types"

import type { Converter } from "./Converter"

/****************
 * ### `PhaseConverter`
 * The phases, for `Converter`:  `#phases` becomes `<epic-section kind="phases">`, each phase section an
 * `<epic-phase id title status estimate>`, its body's fields `<epic-field name>`s, its Updated lines
 * `<epic-updated>`s and its commits `<epic-commit>`s -- in the content model's order (Symptom, Changes, Updated,
 * Goal, Done, Commits, Files, Verify, To review), whatever order the old body had.
 * - A field the vocabulary has no name for (`Judgement calls:`, `Outcome:`) is kept whole, label and all, at the end
 *   of the phase's Done (else its Goal):  `EXTRA_FIELD_HOSTS`.
 * - Dropped, as chrome:  the progress bar, status icons.
 * - The Plan changes box (a copy of the Updated lines of the phases still to do) is written anew from the converted
 *   lines, as the plan-doc tool writes it on every edit (`PlanDoc.writePlanChanges()`, T14):  the same markup both
 *   ways, never the old box's.
 ****************/
export class PhaseConverter {
  /** The converter it works for:  STATIC for its life. */
  readonly owner: Converter

  constructor(owner: Converter) {
    this.owner = owner
  }

  /** `<epic-section kind="phases">` from `#phases`. */
  section(section: Element): Element {
    const phases: Element[] = []
    for (const child of PlanMarkup.takeChildren(section)) {
      if (!PlanMarkup.isElement(child)) {
        if (PlanMarkup.isBlank(child)) continue
        throw this.owner.error("text in Phases, outside any phase", section)
      }
      if (child.matches(`ui-icon[slot='icon'], ${Old.progress}, ${Old.planChanges}`)) continue
      if (child.localName !== "ui-section" || !child.hasAttribute("data-phase"))
        throw this.owner.error("Phases holds something other than phases", child)
      phases.push(this.phase(child))
    }
    const converted = this.owner.element("epic-section", { id: "phases", kind: "phases" }, phases, section)
    PlanDoc.writePlanChanges(converted)
    return converted
  }

  /** `<epic-phase>` from a phase section. */
  private phase(section: Element): Element {
    const id = section.id
    const header = section.querySelector(":scope > span[slot='header']")
    let title: { title?: string; slot?: Element }
    if (header) {
      header.remove()
      PlanMarkup.stripEdges(header, { first: Chrome.phasePrefix })
      title = PlanMarkup.titleOf(header)
    } else {
      const text = section.getAttribute("header") ?? ""
      const number = Chrome.phasePrefix.exec(text)?.[1]
      if (number !== undefined && `p${number}` !== id)
        this.owner.note(`#${id}:  titled \`P${number}\`, drawn as its id's`)
      title = { title: PlanMarkup.squeeze(text.replace(Chrome.phasePrefix, "")) }
    }
    const data: EpicData<"epic-phase"> = {
      id,
      title: title.title,
      status: section.getAttribute("data-status") as EpicData<"epic-phase">["status"],
      estimate: section.getAttribute("badge") || undefined
    }
    const fields = this.fields(section)
    return this.owner.element("epic-phase", data, title.slot ? [title.slot, ...fields] : fields, section)
  }

  /** The phase body's fields, as `<epic-field>`s, `<epic-updated>`s and `<epic-commit>`s, in the listed order. */
  private fields(section: Element): Element[] {
    const fields = new Map<FieldName, Node[]>()
    const updated: Element[] = []
    const commits: Element[] = []
    const extras: Element[] = []
    for (const child of PlanMarkup.takeChildren(section)) {
      if (PlanMarkup.isBlank(child) || (PlanMarkup.isElement(child) && child.matches("ui-icon[slot='icon']"))) continue
      if (!PlanMarkup.isElement(child) || !child.matches(Old.phaseBody))
        throw this.owner.error("a phase holds more than its body", section)
      for (const item of PlanMarkup.takeChildren(child)) {
        if (PlanMarkup.isBlank(item)) continue
        if (!PlanMarkup.isElement(item) || item.localName !== "ui-item")
          throw this.owner.error("a phase body holds a non-field", section)
        const label = item.querySelector(":scope > b:first-child")
        const name = Chrome.fieldLabel.exec(label?.textContent ?? "")?.[1]?.trim()
        if (name === UPDATED_LABEL) updated.push(...this.updated(item))
        else if (name === COMMITS_LABEL) commits.push(...this.owner.cards.commits(item))
        else if (name && Object.hasOwn(FIELD_NAMES, name)) {
          label!.remove()
          const field = FIELD_NAMES[name as FieldLabel]
          if (fields.has(field)) this.owner.note(`#${section.id}:  two \`${name}:\` fields, joined`)
          fields.set(field, [...(fields.get(field) ?? []), ...PlanMarkup.takeChildren(item)])
        } else extras.push(PlanMarkup.wrap(item, "div", PlanMarkup.takeChildren(item)))
      }
    }
    if (extras.length) this.placeExtras(section.id, fields, extras)
    const field = (name: FieldName) => {
      const nodes = fields.get(name)
      return nodes ? [this.owner.element("epic-field", { name }, nodes, section)] : []
    }
    return [
      ...field("symptom"),
      ...field("changes"),
      ...updated,
      ...field("goal"),
      ...field("done"),
      ...commits,
      ...field("files"),
      ...field("verify"),
      ...field("to-review")
    ]
  }

  /** Fields with no name in the vocabulary, kept whole at the end of the first of `EXTRA_FIELD_HOSTS` there is. */
  private placeExtras(id: string, fields: Map<FieldName, Node[]>, extras: Element[]) {
    const host = EXTRA_FIELD_HOSTS.find((name) => fields.has(name)) ?? "goal"
    fields.set(host, [...(fields.get(host) ?? []), ...extras])
    const labels = extras.map(
      (extra) => `\`${PlanMarkup.squeeze(extra.querySelector(":scope > b")?.textContent ?? "(no label)")}\``
    )
    this.owner.note(`#${id}:  ${labels.join(", ")} kept at the end of its ${host === "done" ? "Done" : "Goal"}`)
  }

  /** `<epic-updated at phase>`s from an Updated field's list:  one per dated line. */
  private updated(item: Element): Element[] {
    const list = item.querySelector(`:scope > ${Old.updatedList}`)
    if (!list) throw this.owner.error("an Updated field without its list", item)
    list.remove()
    item.querySelector(":scope > b:first-child")?.remove()
    if (item.textContent?.trim() || item.children.length)
      throw this.owner.error("an Updated field holds more than its list", item)
    return Array.from(list.children, (line) => {
      const time = line.querySelector(":scope > time:first-child")
      if (!time) throw this.owner.error("an Updated line without its time", line)
      time.remove()
      const phase = line.getAttribute("data-phase")
      const data = { at: PlanMarkup.squeeze(time.textContent ?? ""), phase: phase ? Number(phase) : undefined }
      return this.owner.element("epic-updated", data, PlanMarkup.takeChildren(line), line)
    })
  }
}
