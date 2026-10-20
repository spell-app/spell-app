/**
 * The English vocabulary of `<ui-property-editor>`:  every name the tag uses.
 * - Its own names first, then those it PASSES THROUGH:  `<ui-form>`'s (it is one), then `<ui-section>`'s
 *   (it draws one around its properties), each only where it means the same.
 *   - Not passed through:  the section's `source` and `select` (the editor's own are its layout page's), and the
 *     form's `value` (the editor's own takes a thing or a list).
 * - The shape is `E.ComponentVocabulary`.  Pure data:  `import type` only (`passThrough()` too).
 */

import type { E } from "$/ui/core"
import { formVocabulary } from "$/ui/components/ui-form/UIForm.en"
import { sectionVocabulary } from "$/ui/components/ui-section/UISection.en"
import { passThrough } from "./UIPropertyEditor.types"

/** The editor's own attributes. */
const OWN_ATTRIBUTES = [
  {
    name: "schema",
    kind: "json",
    reflect: false,
    description:
      "What it edits, described:  a tag (`ui-button`:  its vocabulary), a schema the page added " +
      "(`UI.propertyControls.addSchema()`), or, as a property, a `PropertySchema` or a component vocabulary."
  },
  {
    name: "value",
    kind: "json",
    reflect: false,
    description: "The thing it edits, or a LIST of things (edited at once:  a property shows the value they agree on)."
  },
  {
    name: "source",
    kind: "string",
    description: "Its layout page:  a spell path inside the spell editor, else a full URL (epic `property-editor` P6)."
  },
  {
    name: "select",
    kind: "string",
    description: "With `source`:  a CSS selector;  only its first match in the layout page is used."
  },
  {
    name: "readonly",
    kind: "boolean",
    description: "Shows every value;  nothing can be changed.  Reaches every property in it."
  },
  { name: "output", kind: "string", description: 'A value at the end of the title bar;  `slot="output"`.' },
  { name: "error", kind: "string", description: "An error under the title, and the `error` state." }
] as const satisfies readonly E.AttributeSpec[]

/****************
 * ### `propertyEditorVocabulary`
 * The names of `<ui-property-editor>`:  a titled, folding form of properties, drawn from a schema.
 ****************/
export const propertyEditorVocabulary = {
  tag: "ui-property-editor",
  topics: ["forms", "inputs", "collections"],
  aka: ["inspector", "property sheet", "properties panel", "settings form", "object editor"],
  skeleton: "header, 3 line paragraph",
  noun: "form",
  description:
    "A property editor draws a form from a schema:  one field per property, in folding groups, for one thing or many.",
  attributes: passThrough<E.AttributeSpec>(
    OWN_ATTRIBUTES,
    [formVocabulary.attributes, sectionVocabulary.attributes],
    ["source", "select"]
  ),
  events: passThrough<E.EventSpec>(
    [
      {
        name: "ui-change",
        detail: "{ name: string, value: unknown, things: object[] }",
        description: "A property was written to the thing (or things)."
      },
      { name: "ui-loading", detail: "{ source: string }", description: "Its `source` page is about to load (P6)." },
      { name: "ui-loaded", detail: "{ source: string, content: string }", description: "It arrived (P6)." }
    ] as const satisfies readonly E.EventSpec[],
    [formVocabulary.events, sectionVocabulary.events],
    ["ui-load"]
  ),
  slots: passThrough<E.SlotSpec>(
    [
      { name: "", description: "`<ui-property-group>`s and `<ui-property>`s.  Empty:  one property per attribute." },
      { name: "output", description: "Rich output (instead of `output`)." }
    ] as const satisfies readonly E.SlotSpec[],
    [sectionVocabulary.slots]
  ),
  parts: passThrough<E.PartSpec>(
    [
      { name: "editor", description: "The editor's outer box." },
      { name: "footer", description: 'Under the properties:  Save and Cancel, with `apply="on save"`.' },
      { name: "output", description: "The output." },
      { name: "error-line", description: "The editor's own error, under its title." }
    ] as const satisfies readonly E.PartSpec[],
    [formVocabulary.parts, sectionVocabulary.parts]
  ),
  states: passThrough<E.StateSpec>(
    [
      { name: "readonly", description: "Nothing can be changed (`readonly`)." }
    ] as const satisfies readonly E.StateSpec[],
    [formVocabulary.states, sectionVocabulary.states]
  ),
  texts: passThrough<E.TextSpec>(
    [
      { key: "save", text: "Save", description: 'The Save button, with `apply="on save"`.' },
      { key: "cancel", text: "Cancel", description: 'The Cancel button, with `apply="on save"`.' },
      { key: "other", text: "Other", description: "The group of properties a layout doesn't place (P6)." }
    ] as const satisfies readonly E.TextSpec[],
    [formVocabulary.texts, sectionVocabulary.texts]
  )
} as const satisfies E.ComponentVocabulary
