import type { AttributeSpec, PropertySchema, ValueType } from "$/ui/vocabulary"

/****************
 * ### `PropertyControls`
 * What `<ui-property-editor>` draws and reads by NAME, as `UI.propertyControls`:  one registry per page.
 * - Control KINDS, `<ui-property as="...">`:  the element each draws, and the value types it's the default for.
 *   - `add("date", { tag: "ui-calendar", types: ["date"] })` adds or replaces one;  the built-in kinds are below.
 * - CHOICE sources, `<ui-property options="fonts">` / an attribute's `choicesFrom`:  `addChoices(name, read)`,
 *   where `read()` returns the choices, or a promise of them ("every font installed").
 * - "On change" RULES, an attribute's `onChange`:  `addRule(name, rule)`, run after the property is written.
 * - SCHEMAS by name, `<ui-property-editor schema="ProjectSettings">`:  `addSchema(name, schema)`;
 *   a tag's own vocabulary is found without one.
 * - In the runtime's lazy chunk:  plain data, no DOM.  `<ui-property>` makes the elements.
 ****************/
export class PropertyControls {
  /** Control kinds by name, the built-in ones first. */
  private readonly kinds = new Map<string, PropertyControl>(Object.entries(BUILT_IN_KINDS))

  /** Choice sources by name. */
  private readonly choiceSources = new Map<string, ChoiceSource>()

  /** "On change" rules by name. */
  private readonly rules = new Map<string, PropertyRule>()

  /** Schemas by name. */
  private readonly schemas = new Map<string, PropertySchema>()

  ////////////////
  // ## Control kinds
  ////////////////

  /** Add (or replace) control kind `kind`. */
  add(kind: string, control: PropertyControl) {
    this.kinds.set(kind, control)
  }

  /** Control kind `kind`, if there's one. */
  get(kind: string): PropertyControl | undefined {
    return this.kinds.get(kind)
  }

  /**
   * The kind a property of `spec` is drawn with when its `as` doesn't say:
   * the last kind added for its value type (a kind added later wins), else `input`.
   */
  kindFor(type: ValueType): string {
    let found: string | undefined
    for (const [kind, control] of this.kinds) if (control.types?.includes(type)) found = kind
    return found ?? INPUT
  }

  ////////////////
  // ## Choices, rules and schemas
  ////////////////

  /** Add (or replace) choice source `name`. */
  addChoices(name: string, read: ChoiceSource) {
    this.choiceSources.set(name, read)
  }

  /** The choices of source `name`;  `undefined` when there's no such source.  NEVER throws:  a failing source is `[]`. */
  async choices(name: string): Promise<readonly Choice[] | undefined> {
    const read = this.choiceSources.get(name)
    if (!read) return undefined
    try {
      return await read()
    } catch {
      return []
    }
  }

  /** Add (or replace) "on change" rule `name`. */
  addRule(name: string, rule: PropertyRule) {
    this.rules.set(name, rule)
  }

  /** "On change" rule `name`, if there's one. */
  rule(name: string): PropertyRule | undefined {
    return this.rules.get(name)
  }

  /** Add (or replace) schema `name`, e.g. a spell class's (the app's `ClassSchemas`). */
  addSchema(name: string, schema: PropertySchema) {
    this.schemas.set(name, schema)
  }

  /** Schema `name`, if one was added. */
  schema(name: string): PropertySchema | undefined {
    return this.schemas.get(name)
  }
}

////////////////
// ## Types
////////////////

/** A control kind:  the element `<ui-property>` draws for it. */
export type PropertyControl = {
  /** The element, e.g. `ui-input`. */
  tag: string
  /** Attributes it's made with, e.g. `{ type: "number" }`. */
  attributes?: Readonly<Record<string, string>>
  /** The value types it's the default control for. */
  types?: readonly ValueType[]
  /**
   * How its choices are drawn:  `items`, a `<ui-item value>` child each (a select);
   * `radios`, the control itself once per choice (a `<ui-radio>` each);  none:  no choices.
   */
  choices?: "items" | "radios"
}

/** One choice:  a value, or a value and the text people see. */
export type Choice = string | { value: string; text: string }

/** A choice source:  the choices, now or later. */
export type ChoiceSource = () => readonly Choice[] | Promise<readonly Choice[]>

/**
 * An "on change" rule, run after a property is written.
 * - `things`:  what the editor edits (one, or many);  `property`:  the attribute written, with its new `value`.
 * - It may change other properties of the things, or what another property offers.
 */
export type PropertyRule = (change: { things: readonly object[]; property: AttributeSpec; value: unknown }) => void

/** The kind a property falls back to. */
const INPUT = "input"

/**
 * The built-in control kinds.
 * - `buttons` is a row of radios for now:  Spell UI has no segmented control a form reads (epic `property-editor` I3).
 * - `color` is the browser's own picker for now:  Spell UI's colour pickers come later (epic `property-editor` T4).
 */
const BUILT_IN_KINDS: Record<string, PropertyControl> = {
  input: { tag: "ui-input", types: ["text", "data"] },
  text: { tag: "ui-textarea" },
  number: { tag: "ui-input", attributes: { type: "number" }, types: ["number"] },
  date: { tag: "ui-input", attributes: { type: "date" }, types: ["date"] },
  select: { tag: "ui-select", choices: "items", types: ["choice"] },
  buttons: { tag: "ui-radio", choices: "radios" },
  range: { tag: "ui-slider" },
  checkbox: { tag: "ui-checkbox", types: ["boolean"] },
  toggle: { tag: "ui-checkbox", attributes: { type: "toggle" } },
  color: { tag: "ui-input", attributes: { type: "color" } },
  editor: { tag: "ui-property-editor", types: ["thing"] }
}
