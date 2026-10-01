/**
 * Every name `<ui-emoji-set>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states,
 * texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - The family's grammar notes are in `ui-emoji.vocabulary.en.ts`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-emoji-set>`
 * Picks the emoji name set for the whole page, from HTML.  Renders nothing.
 * - `EmojiData` reads the LAST one in the document at its first lookup, so it works on a page that never defines the
 *   element;  one connected later switches the LATER lookups.  Emoji already drawn keep their glyph.
 ****************/
export const emojiSetVocabulary = {
  tag: "ui-emoji-set",
  noun: "emoji set",
  description: "An emoji set picks which names `<ui-emoji name>` understands:  CLDR's, or Fomantic's.",
  attributes: [
    {
      name: "names",
      kind: "enum",
      values: ["cldr", "fomantic"],
      default: "cldr",
      description:
        "The name set for every emoji on the page, one at a time:  `cldr` (Unicode's names, `thumbs_up`) or " +
        "`fomantic` (Fomantic's names with its meanings, `thumbsup`, `dog` = the dog's face).  A later switch " +
        "affects later lookups only."
    }
  ],
  events: [],
  slots: [],
  parts: [],
  states: [],
  texts: []
} as const satisfies ComponentVocabulary
