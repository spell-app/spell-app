/**
 * The English vocabulary of `<ui-docs-inspector>`:  every name the tag uses.
 * - Its tag, attributes, events, slots, parts, states and texts.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic,
 *   left out of the component list, and loaded by `<ui-root>` like any family.
 * - No class words:  its two attributes are `string` and `boolean`, which never make a class (`ui inspector`).
 */

import type { E } from "$/ui/core"

/****************
 * ### `docsInspectorVocabulary`
 * The names of `<ui-docs-inspector>`:  a live view of another element on the page,
 * its attributes, properties and `:state()`s, updating as they change.
 ****************/
export const docsInspectorVocabulary = {
  tag: "ui-docs-inspector",
  topics: ["documentation", "data display", "status"],
  aka: ["inspector", "element inspector", "devtools", "live properties", "state viewer", "debug panel"],
  skeleton: "short line, 4 line paragraph",
  noun: "inspector",
  description:
    "An inspector shows another element's attributes, properties and custom states, live:  click the element, " +
    "and watch them change.",
  attributes: [
    {
      name: "for",
      kind: "string",
      property: "htmlFor",
      description: "Id of the element to show, in the inspector's own document (or shadow root)."
    },
    {
      name: "all",
      kind: "boolean",
      description:
        "Show every property of the element's vocabulary, even unset ones.  " +
        "Default:  only properties with a value (not `undefined`, `null` or `false`)."
    }
  ],
  events: [],
  slots: [],
  parts: [
    { name: "inspector", description: 'The whole box (`<div class="ui inspector">`).' },
    { name: "title", description: 'The line naming the element shown:  `<ui-button id="save">`.' },
    { name: "group", description: "One group of rows:  attributes, properties or states." },
    { name: "caption", description: "A group's title." },
    { name: "row", description: "One row:  a name, and its value (none for a state)." },
    { name: "name", description: "A row's name." },
    { name: "value", description: "A row's value, as text (strings quoted)." },
    { name: "missing", description: "The message shown while no element has the `for` id." }
  ],
  states: [{ name: "missing", description: "No element has the `for` id (yet)." }],
  texts: [
    { key: "label", text: "Live view of {target}", description: "Accessible name of the inspector." },
    { key: "attributes", text: "Attributes", description: "Title of the attributes group." },
    { key: "properties", text: "Properties", description: "Title of the properties group." },
    { key: "states", text: "States", description: "Title of the custom states group." },
    { key: "none", text: "none", description: "Shown in a group with no rows." },
    { key: "missing", text: "No element with id “{id}”", description: "Shown while the `for` id names nothing." }
  ]
} as const satisfies E.ComponentVocabulary
