import type { SiteAttribute, SiteEvent, SiteNamed, SiteTag, SiteText } from "$/ui/docs-components/docs-components.types"

import { InlineCode } from "./InlineCode"
import {
  BOOLEAN_KINDS,
  HUES_SET,
  KIND_LABELS,
  MIN_RANGE,
  type ApiCell,
  type ApiNote,
  type ApiRow,
  type ApiSection
} from "./ui-docs-api.types"

/****************
 * ### `ApiModel`
 * A tag's API as tables (`ApiSection`s):  what `<ui-docs-api>` and its native fallback both draw, so the two never
 * disagree about what a table holds.
 * - Pure data in, pure data out:  a `SiteTag` from `components.json`;  titles and column headers as TEXT KEYS (the
 *   element translates them), cells as `ApiCell`s.
 * - Only the tables a tag has:  an empty one is left out.
 * - `json` attributes (rich data) are the `properties` table, not `attributes`:  they have no attribute.
 ****************/
export class ApiModel {
  /** `tag`'s non-empty tables, in `API_SECTIONS` order. */
  static sections(tag: SiteTag): ApiSection[] {
    const attributes = tag.attributes.filter((attribute) => attribute.kind !== "json")
    const properties = tag.attributes.filter((attribute) => attribute.kind === "json")
    const sections: ApiSection[] = [
      {
        id: "attributes",
        columns: ["attribute", "kind", "values", "default", "description"],
        rows: attributes.map((attribute) => ApiModel.attributeRow(attribute))
      },
      {
        id: "properties",
        note: "propertiesNote",
        columns: ["property", "description"],
        rows: properties.map((attribute) => ApiModel.propertyRow(attribute))
      },
      {
        id: "events",
        note: "eventsNote",
        columns: ["event", "detail", "description"],
        rows: tag.events.map((event) => ApiModel.eventRow(event))
      },
      { id: "slots", columns: ["slot", "description"], rows: tag.slots.map((slot) => ApiModel.slotRow(slot)) },
      {
        id: "parts",
        note: "partsNote",
        columns: ["part", "description"],
        rows: tag.parts.map((part) => ApiModel.namedRow(part.name, part))
      },
      {
        id: "states",
        note: "statesNote",
        columns: ["state", "description"],
        rows: tag.states.map((state) => ApiModel.namedRow(`:state(${state.name})`, state))
      },
      {
        id: "texts",
        note: "textsNote",
        columns: ["key", "english", "description"],
        rows: tag.texts.map((text) => ApiModel.textRow(text))
      }
    ]
    return sections.filter((section) => section.rows.length)
  }

  /** JS property name of `attribute`:  its `property`, else its name in camelCase. */
  static propertyOf(attribute: SiteAttribute): string {
    return attribute.property ?? attribute.name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
  }

  /** Default shown for `attribute`:  its declared default, `false` for a boolean, else nothing. */
  static defaultOf(attribute: SiteAttribute): string | undefined {
    if (attribute.default !== undefined && attribute.default !== null) return String(attribute.default)
    return BOOLEAN_KINDS.has(attribute.kind) ? "false" : undefined
  }

  /** The Kind column's word for `kind`, e.g. `keyOnly` => `boolean`. */
  static kindLabel(kind: string): string {
    return KIND_LABELS[kind] ?? kind
  }

  /**
   * `values` as the Values cell, or `undefined` when there are none (free text, a boolean).
   * - `hues` paint each label in its own colour;  a run of consecutive whole numbers (`widths`:  `1` ... `16`)
   *   collapses to one `1 … 16` label.
   */
  static valuesOf(attribute: SiteAttribute): ApiCell | undefined {
    const values = attribute.values
    if (!values?.length) return undefined
    return {
      type: "values",
      values,
      ...(attribute.valueSet && { set: attribute.valueSet }),
      swatch: attribute.valueSet === HUES_SET,
      range: ApiModel.isRange(values)
    }
  }

  ////////////////
  // ## Rows
  ////////////////

  /** Name, kind, values, default, description. */
  private static attributeRow(attribute: SiteAttribute): ApiRow {
    const property = ApiModel.propertyOf(attribute)
    const notes: ApiNote[] = [
      ...(attribute.aliases ?? []).map((alias): ApiNote => ({ key: "alias", code: alias })),
      ...(attribute.property ? [{ key: "propertyName", code: property } as const] : []),
      ...(attribute.reflect === false ? [{ key: "notReflected" } as const] : [])
    ]
    const fallback = ApiModel.defaultOf(attribute)
    return {
      key: attribute.name,
      cells: [
        { type: "name", code: attribute.name, notes },
        { type: "text", text: ApiModel.kindLabel(attribute.kind) },
        ApiModel.valuesOf(attribute) ?? { type: "text", text: "" },
        { type: "text", text: fallback === undefined ? "" : InlineCode.wrap(fallback) },
        { type: "text", text: attribute.description }
      ]
    }
  }

  /** Property name (`column-defs` => `columnDefs`), description. */
  private static propertyRow(attribute: SiteAttribute): ApiRow {
    return {
      key: attribute.name,
      cells: [
        { type: "name", code: ApiModel.propertyOf(attribute), notes: [] },
        { type: "text", text: attribute.description }
      ]
    }
  }

  /** Event name (`cancelable` as a note), `detail` as code, description. */
  private static eventRow(event: SiteEvent): ApiRow {
    return {
      key: event.name,
      cells: [
        { type: "name", code: event.name, notes: event.cancelable ? [{ key: "cancelable" }] : [] },
        { type: "text", text: event.detail ? InlineCode.wrap(event.detail) : "" },
        { type: "text", text: event.description }
      ]
    }
  }

  /** Slot name (the default slot as `(default)`), description. */
  private static slotRow(slot: SiteNamed): ApiRow {
    const name: ApiCell = slot.name
      ? { type: "name", code: slot.name, notes: [] }
      : { type: "name", label: "defaultSlot", notes: [] }
    return { key: slot.name, cells: [name, { type: "text", text: slot.description }] }
  }

  /** `code` as the name, description. */
  private static namedRow(code: string, named: SiteNamed): ApiRow {
    return {
      key: named.name,
      cells: [
        { type: "name", code, notes: [] },
        { type: "text", text: named.description }
      ]
    }
  }

  /** Key, English text (as typed:  never code), description. */
  private static textRow(text: SiteText): ApiRow {
    return {
      key: text.key,
      cells: [
        { type: "name", code: text.key, notes: [] },
        { type: "text", text: InlineCode.wrap(text.text) },
        { type: "text", text: text.description ?? "" }
      ]
    }
  }

  /** `values` are `MIN_RANGE`+ consecutive whole numbers, ascending. */
  private static isRange(values: readonly string[]): boolean {
    if (values.length < MIN_RANGE) return false
    return values.every((value, index) => /^\d+$/.test(value) && Number(value) === Number(values[0]) + index)
  }
}
