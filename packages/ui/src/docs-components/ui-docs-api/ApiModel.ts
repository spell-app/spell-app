import type { SiteAttribute, SiteEvent, SiteNamed, SiteTag, SiteText } from "$/ui/docs-components/docs-components.types"
import { InlineCode } from "./InlineCode"
import type { ApiCell, ApiNote, ApiRow, ApiSection } from "./UIDocsApi.types"

/****************
 * ### `ApiModel`
 * A tag's API as tables (`ApiSection`s):  what `<ui-docs-api>` draws.
 * - Pure data in, pure data out:  a `SiteTag` from `components.json`;
 *   titles and column headers as TEXT KEYS (the component translates them), cells as `ApiCell`s.
 * - Only the tables a tag has:  an empty one is left out.
 * - `json` attributes (rich data) are the `properties` table, not `attributes`:  they have no attribute.
 * - Static and pure, so tests drive it directly.
 ****************/
export class ApiModel {
  /** `tag`'s non-empty tables, in `ApiSectionIds` order. */
  static sectionsFor(tag: SiteTag): ApiSection[] {
    const attributes = tag.attributes.filter((attribute) => attribute.kind !== JSON_KIND)
    const properties = tag.attributes.filter((attribute) => attribute.kind === JSON_KIND)
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
  static propertyFor(attribute: SiteAttribute): string {
    return attribute.property ?? attribute.name.replace(/-([a-z])/g, (_, letter: string) => letter.toUpperCase())
  }

  /** Default shown for `attribute`:  its declared default, `false` for a boolean, else nothing. */
  static defaultFor(attribute: SiteAttribute): string | undefined {
    // The data is JSON:  a vocabulary's `default: null` arrives as `null`
    if (attribute.default !== undefined && attribute.default !== null) return String(attribute.default)
    return BOOLEAN_KINDS.has(attribute.kind) ? "false" : undefined
  }

  /** The Kind column's word for `kind`, e.g. `keyOnly` => `boolean`. */
  static kindLabelFor(kind: string): string {
    return KIND_LABELS[kind] ?? kind
  }

  /**
   * `attribute`'s values as the Values cell, or `undefined` when there are none (free text, a boolean).
   * - `hues` paint each label in its own colour;  a run of consecutive whole numbers (`widths`:  `1` ... `16`)
   *   collapses to one `1 … 16` label.
   */
  static valuesFor(attribute: SiteAttribute): ApiCell | undefined {
    const values = attribute.values
    if (!values?.length) return undefined
    return {
      type: "values",
      values,
      ...(attribute.valueSet && { set: attribute.valueSet }),
      isSwatch: attribute.valueSet === HUES_SET,
      isRange: ApiModel.isRange(values)
    }
  }

  /** The labels a Values cell shows:  each value, or a range's `first … last` alone. */
  static labelsFor(cell: Extract<ApiCell, { type: "values" }>): readonly string[] {
    return cell.isRange ? [`${cell.values[0]}${RANGE_SEPARATOR}${cell.values.at(-1)}`] : cell.values
  }

  ////////////////
  // ## Rows
  ////////////////

  /** Name, kind, values, default, description. */
  private static attributeRow(attribute: SiteAttribute): ApiRow {
    const property = ApiModel.propertyFor(attribute)
    const notes: ApiNote[] = [
      ...(attribute.aliases ?? []).map((alias): ApiNote => ({ key: "alias", code: alias })),
      ...(attribute.property ? [{ key: "propertyName", code: property } as const] : []),
      ...(attribute.reflect === false ? [{ key: "notReflected" } as const] : [])
    ]
    const fallback = ApiModel.defaultFor(attribute)
    return {
      key: attribute.name,
      cells: [
        { type: "name", code: attribute.name, notes },
        { type: "text", text: ApiModel.kindLabelFor(attribute.kind) },
        ApiModel.valuesFor(attribute) ?? { type: "text", text: "" },
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
        { type: "name", code: ApiModel.propertyFor(attribute), notes: [] },
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

/** The `AttributeKind` of rich data:  a property, no attribute. */
const JSON_KIND = "json"

/**
 * How each `AttributeKind` reads to an author, in the Kind column.
 * - NOTE: English only, like every description in `components.json`:  the site's data isn't translated.
 */
const KIND_LABELS: Readonly<Record<string, string>> = {
  keyOnly: "boolean",
  boolean: "boolean",
  valueAndKey: "value",
  keyOrValueAndKey: "boolean or value",
  valueOnly: "value",
  enum: "enum",
  width: "width",
  multiple: "list",
  textAlign: "alignment",
  verticalAlign: "alignment",
  size: "size",
  color: "colour",
  icon: "icon name",
  string: "text",
  number: "number",
  json: "property"
}

/** Kinds whose absent default is `false`. */
const BOOLEAN_KINDS: ReadonlySet<string> = new Set(["keyOnly", "boolean"])

/** The value set whose values are colour names:  each label is painted in its hue. */
const HUES_SET = "hues"

/** Fewest values a numeric run needs before it collapses to one `first … last` label. */
const MIN_RANGE = 4

/** Between a range's ends. */
const RANGE_SEPARATOR = " … "
