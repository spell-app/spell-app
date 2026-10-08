/**
 * The English vocabulary of `<ui-list>`:  every name the tag uses.
 * - Its tag, attributes (each with its kind and allowed values), events, slots, parts and states.
 *   The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-list relaxed="very" divided size="large">` => `ui large divided very relaxed list`.
 *   `UIList.css` keys on those words.
 * - Items are the GENERIC `<ui-item>` (`ownsParts` lists `item`), never a `ui-list-item`:  the list tells each
 *   item how to render (`ItemOwner.itemContext()`) and hands it `UIList.css`.
 * - `ownsParts` also lists `list`:  a `<ui-list>` inside a list is Fomantic's sub-list (`<div class="list">`),
 *   and `content` / `header` / `description`, which `UIParts.css` styles `:state(in-list)`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `listVocabulary`
 * The names of `<ui-list>`, a list:
 * `<ul class="ui ... list" role="list">` (`<ol>` when `ordered`) around its `<ui-item>`s.
 ****************/
export const listVocabulary = {
  tag: "ui-list",
  topics: ["lists", "data display", "typography", "basic", "elements"],
  aka: ["ul", "ol", "bullet list", "list view"],
  skeleton: "3 line paragraph",
  noun: "list",
  description: "A list groups related content.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    { name: "bulleted", kind: "keyOnly", description: "Marks each item with a bullet." },
    {
      name: "ordered",
      kind: "keyOnly",
      description:
        "Numbers each item (`1.`, `1.1` in a sub-list);  an item's `value` replaces its number.  Renders `<ol>`."
    },
    { name: "suffixed", kind: "keyOnly", description: "Ordered:  a dot follows each number (`1.`)." },
    {
      name: "link",
      kind: "keyOnly",
      description: "Items are links:  muted until hovered, the selected one strongest."
    },
    {
      name: "selection",
      kind: "keyOnly",
      description: "Items are choices:  `<button>`s with a hover background, `ui-select` on activation."
    },
    { name: "animated", kind: "keyOnly", description: "Items indent when hovered." },
    { name: "horizontal", kind: "keyOnly", description: "Items sit in a row." },
    { name: "divided", kind: "keyOnly", description: "A rule between items." },
    { name: "celled", kind: "keyOnly", description: "A rule around every item." },
    {
      name: "relaxed",
      kind: "keyOrValueAndKey",
      values: ["very"],
      description: 'More space between items;  `relaxed="very"` even more.'
    },
    {
      name: "fitted",
      kind: "keyOnly",
      description: "No horizontal item padding;  a `selection` list's hover background reaches past its edges."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    { name: "floated", kind: "valueAndKey", values: "floats", description: "Floats `left` or `right`." },
    {
      name: "vertical-align",
      kind: "verticalAlign",
      values: "verticalAlignments",
      description: "Aligns each item's icon, image and content:  `top` (default), `middle` or `bottom`."
    }
  ],
  events: [
    {
      name: "ui-select",
      detail: "{ value: string, item: Element, originalEvent?: Event }",
      description:
        "An interactive item was activated (click, Enter, Space):  a `selection` list's item, or an item link / " +
        "button.  `value` is the item's `value`, else its text."
    }
  ],
  slots: [{ name: "", description: "`<ui-item>`s;  a nested `<ui-list>` inside an item is its sub-list." }],
  parts: [{ name: "list", description: "The `<ul>` / `<ol>` box." }],
  states: [
    { name: "in-list", description: 'Nested in another list:  renders the sub-list (`class="list"`, no `ui`).' }
  ],
  texts: [],
  ownsParts: ["item", "list", "content", "header", "description"]
} as const satisfies E.ComponentVocabulary
