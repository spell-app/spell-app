/**
 * The English vocabulary of `<ui-property>`:  every name the tag uses.
 * - Its own names first, then `<ui-field>`'s, which it PASSES THROUGH (it is one), where they mean the same.
 * - The shape is `E.ComponentVocabulary`.  Pure data.
 */

import type { E } from "$/ui/core"
import { fieldVocabulary } from "$/ui/components/ui-form/UIField.en"
import { passThrough } from "./UIPropertyEditor.types"

/****************
 * ### `propertyVocabulary`
 * The names of `<ui-property>`:  one property of the thing a `<ui-property-editor>` edits,
 * drawn as a `<ui-field>` with the control its schema calls for.
 ****************/
export const propertyVocabulary = {
  ...fieldVocabulary,
  tag: "ui-property",
  topics: ["forms", "inputs"],
  aka: ["property", "inspector row", "setting", "schema field"],
  description:
    "A property is one field of a property editor:  its label, tip, choices and rules come from the editor's schema.",
  attributes: passThrough<E.AttributeSpec>(
    [
      {
        name: "name",
        kind: "string",
        description: "The property it edits;  a dotted path reaches into a nested thing (`font.size`).  Required."
      },
      {
        name: "as",
        kind: "string",
        description:
          "Which control (a kind `UI.propertyControls` knows):  `input`, `text`, `number`, `date`, `select`, `buttons`, " +
          "`range`, `checkbox`, `toggle`, `color`, `editor`, or one a page added.  None:  the default for its type."
      },
      {
        name: "options",
        kind: "string",
        description:
          "Where its choices come from, when not the schema's:  a source the page added " +
          "(`UI.propertyControls.addChoices()`), or a list, `a, b, c`."
      }
    ] as const satisfies readonly E.AttributeSpec[],
    [fieldVocabulary.attributes]
  ),
  events: [
    {
      name: "ui-change",
      detail: "{ name: string, value: unknown }",
      description: 'Its property was written (on Save, with `apply="on save"`).'
    }
  ],
  slots: passThrough<E.SlotSpec>(
    [
      { name: "", description: "Your own control, instead of the one it makes;  or nothing." }
    ] as const satisfies readonly E.SlotSpec[],
    [fieldVocabulary.slots]
  ),
  states: passThrough<E.StateSpec>(
    [
      { name: "changed", description: 'Its edit is held, not saved yet (`apply="on save"`).' },
      { name: "buttons", description: 'Its control is a row of choices, one each (`as="buttons"`).' }
    ] as const satisfies readonly E.StateSpec[],
    [fieldVocabulary.states]
  )
} as const satisfies E.ComponentVocabulary
