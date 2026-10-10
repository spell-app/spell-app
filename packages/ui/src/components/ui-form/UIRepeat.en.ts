/**
 * The English vocabulary of `<ui-repeat>`:  every name the tag uses.
 * - Its tag, its one attribute and its slot.  The shape is `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Pure data:  node imports it (`yarn site:data`, `yarn gen:root`), so `$/ui/core` for types only.
 * - The family's grammar notes are in `UIForm.en.ts`.
 */

import type { E } from "$/ui/core"

/****************
 * ### `repeatVocabulary`
 * The names of `<ui-repeat>`, its children once per item of a list in a bound `<ui-form>`:
 * `<slot></slot>`, its rows in the light DOM.
 ****************/
export const repeatVocabulary = {
  tag: "ui-repeat",
  topics: ["forms", "lists", "collections"],
  aka: ["repeater", "field array", "form list", "for each", "list editor"],
  noun: "repeat",
  ui: false,
  description: "A repeat shows its fields once per item of a list, each row bound to its own item.",
  attributes: [
    {
      name: "name",
      kind: "string",
      description:
        "The list to repeat over:  this property of the scope -- the `<ui-form>`'s `value`, or the item of the " +
        "`<ui-repeat>` row around it.  Any iterable (an array, a `Set` ...)."
    }
  ],
  events: [],
  slots: [
    {
      name: "",
      description:
        "The TEMPLATE:  markup copied once per item (its controls' `name`s bind to the item);  a `<template>`, or " +
        "plain children, taken into one as it connects."
    }
  ],
  parts: [],
  states: [],
  texts: []
} as const satisfies E.ComponentVocabulary
