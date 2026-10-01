/**
 * Every name `<ui-emoji>` uses:  tag, attributes (kind + allowed values), parts, states.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`:  `<ui-emoji name="smile" size="large" link>` => `ui large link
 *   emoji`.  Fomantic's own markup is `<em data-emoji=":smile:" class="large link">` (no `ui`, no noun) drawing a
 *   Twemoji SVG from a CDN;  here the glyph is the NATIVE Unicode character, so the grammar gets its noun back.
 * - `name`:  a name from the page's NAME SET, one at a time:  CLDR shortcodes (`thumbs_up`, the default) or Fomantic's
 *   names (Discord / JoyPixels shortcodes:  `smile`, `thumbsup`, `flag_us`), picked with `<ui-emoji-set names>`.  With
 *   or without `:colons:`, any case, spaces ~== `_`.  Resolved by `EmojiData` from lazily loaded chunks, generated
 *   by `scripts/gen-emoji.ts`.
 * - Accessible name, decided:
 *   - default:  the character is plain TEXT, so assistive tech reads its Unicode (CLDR) name in the USER's
 *     language ("grinning face with smiling eyes") -- better than an English shortcode, and free
 *   - `label="..."`:  `role=img` + `aria-label`, for an emoji that means something else in context ("Approved")
 *   - `label=""` (bare):  decorative, `aria-hidden`
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-emoji>`
 * An emoji:  `<span class="ui [size] [keyOnly ...] emoji" part="emoji">😄</span>`.
 ****************/
export const emojiVocabulary = {
  tag: "ui-emoji",
  noun: "emoji",
  description: "An emoji is a glyph used to represent something else.",
  attributes: [
    {
      name: "size",
      kind: "size",
      values: ["small", "medium", "large", "big"],
      description:
        "Fomantic's emoji sizes against the surrounding text:  `small` (1.5em), `large` (6em), `big` (7.5em);  " +
        "`medium` is the unsized default (1em), NOT Fomantic's 3em."
    },
    {
      name: "name",
      kind: "string",
      description:
        "The emoji's name in the page's name set:  by default its CLDR shortcode (Unicode's name, `thumbs_up`, " +
        '`grinning_face_with_smiling_eyes`, `flag_united_states`);  with `<ui-emoji-set names="fomantic">`, ' +
        "Fomantic's name (`thumbsup`, `smile`, `flag_us`).  The words may be joined any way:  `thumbs up`, " +
        "`thumbs-up`, `thumbsUp`, `thumbsup` (and `:smile:`, any case)."
    },
    {
      name: "label",
      kind: "string",
      description:
        "Accessible name (`role=img`), when the emoji stands for something else;  bare `label` hides it " +
        "(decorative).  Default:  the character's own Unicode name, read by assistive tech."
    },
    { name: "link", kind: "keyOnly", description: "Clickable look:  a pointer cursor.  The page adds the control." },
    { name: "disabled", kind: "keyOnly", description: "Dimmed." },
    { name: "loading", kind: "keyOnly", description: "Spins (a still glyph under reduced motion)." }
  ],
  events: [],
  slots: [],
  parts: [{ name: "emoji", description: "The emoji glyph box." }],
  states: [
    { name: "disabled", description: "Dimmed." },
    { name: "loading", description: "Spinning." }
  ],
  texts: []
} as const satisfies ComponentVocabulary

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
