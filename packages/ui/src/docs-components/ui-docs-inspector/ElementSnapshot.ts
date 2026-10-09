import type { E } from "$/ui/core"

/****************
 * ### `ElementSnapshot`
 * What `<ui-docs-inspector>` shows of one element at one moment:  its attributes, properties and `:state()`s,
 * each as rows of text.
 * - Attributes:  every attribute the element has, in the DOM's order, as written.
 * - Properties:  for a Spell UI element (a `DOMElement`), the property of each attribute in its vocabulary
 *   (`button.active`), converted.
 *   - By default only the ones with a value:  not `undefined`, `null` or `false`, nor a boolean at its `true` default
 *     (every tag's `visible`, until hidden).  `{ all: true }`:  every one.
 *   - Any other element has none.
 * - States:  the custom states the element is in now (`:state(active)`), from its `internals.states`, A-Z.
 * - Pure reads:  no Solid, no listeners, so a test can take one of any element.
 ****************/
export class ElementSnapshot {
  /** The element's attributes, as written. */
  readonly attributes: readonly SnapshotRow[]

  /** Its vocabulary's properties, converted (see the class docs for which). */
  readonly properties: readonly SnapshotRow[]

  /** The custom states it is in, A-Z. */
  readonly states: readonly string[]

  /** Read `element` now. */
  constructor(element: Element, { all = false }: SnapshotOptions = {}) {
    this.attributes = [...element.attributes].map(({ name, value }) => ({ name, value: JSON.stringify(value) }))
    this.properties = ElementSnapshot.propertiesOf(element, all)
    const states = (element as Partial<E.DOMElement>).internals?.states
    this.states = states ? [...states].sort() : []
  }

  ////////////////
  // ## Rows
  ////////////////

  /**
   * `next`, with each row equal to one of `previous`'s (same name, same value) swapped for that row:
   * `previous` itself when nothing changed.
   * - Why:  `<ui-docs-inspector>`'s rows are a `<For>`, keyed by the row object,
   *   so an unchanged row keeps its DOM and only changed rows draw again (and flash).
   */
  static keepUnchanged(previous: readonly SnapshotRow[], next: readonly SnapshotRow[]): readonly SnapshotRow[] {
    const byName = new Map(previous.map((row) => [row.name, row]))
    const rows = next.map((row) => {
      const old = byName.get(row.name)
      return old?.value === row.value ? old : row
    })
    const isSame = rows.length === previous.length && rows.every((row, index) => row === previous[index])
    return isSame ? previous : rows
  }

  /**
   * A value as the inspector shows it:  strings quoted, `undefined` / `null` by name, lists and objects as JSON
   * (cut to `MAX_VALUE_LENGTH`), a function as `ƒ`.
   */
  static valueText(value: unknown): string {
    if (value === undefined) return "undefined"
    if (value === null) return "null"
    if (typeof value === "function") return "ƒ"
    if (typeof value === "string") return JSON.stringify(value)
    if (typeof value === "number" || typeof value === "boolean" || typeof value === "bigint") return `${value}`
    if (typeof value === "symbol") return value.toString()
    let text: string
    try {
      text = JSON.stringify(value)
    } catch {
      text = Object.prototype.toString.call(value)
    }
    return text.length > MAX_VALUE_LENGTH ? `${text.slice(0, MAX_VALUE_LENGTH - 1)}…` : text
  }

  /** The vocabulary properties of `element`, when it's a Spell UI element;  only set ones unless `all`. */
  private static propertiesOf(element: Element, all: boolean): SnapshotRow[] {
    const { tagSetup } = element.constructor as Partial<E.DOMElementClass>
    if (!tagSetup) return []
    const self = element as unknown as Record<string, unknown>
    const rows: SnapshotRow[] = []
    const definition = tagSetup.elementDefinition
    for (const attribute of definition.attributes) {
      const value = self[attribute.property]
      // a boolean at its TRUE default (`visible`, which every tag has) is no more "set" than a false one
      const isAtTrueDefault = value === true && definition.convert(attribute, undefined) === true
      if (!all && (value === undefined || value === null || value === false || isAtTrueDefault)) continue
      rows.push({ name: attribute.property, value: ElementSnapshot.valueText(value) })
    }
    return rows
  }
}

/** Longest value text shown;  a longer one is cut, ending in `…`. */
const MAX_VALUE_LENGTH = 60

////////////////
// ## Types
////////////////

/** One row of a snapshot:  a name, and its value as text. */
export type SnapshotRow = {
  /** attribute or property name */
  readonly name: string
  /** the value as shown:  an attribute's text quoted, a property's from `valueText()` */
  readonly value: string
}

/** `ElementSnapshot`'s options. */
export type SnapshotOptions = {
  /** every vocabulary property, even unset ones (`<ui-docs-inspector all>`) */
  all?: boolean
}
