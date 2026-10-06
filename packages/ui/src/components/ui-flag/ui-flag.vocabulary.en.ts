/**
 * Every name `<ui-flag>` uses:  tag, attributes (kind + allowed values), parts, texts.  Schema:
 * `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-flag country="fr" size="large">`
 *   => `ui large flag fr`.  The country is CONTENT:  the Unicode flag emoji (`🇫🇷`), which is what
 *   Fomantic 2.9's default theme draws too (Twemoji SVGs named by the same code points).  Its resolved code is
 *   ALSO a class word after the noun, as in Fomantic's `fr flag`:  no rule here reads it, it's the hook a sprite
 *   theme selects on (`themes/famfamfam.css`).
 * - Resolving `country` (`FlagCountry`):
 *   - normalize:  trim, lowercase, `_` => space, collapse whitespace (`United_States` ~== `united states`)
 *   - `FLAG_ALIASES[name] ?? name` (`ui-flag.types.ts`) => a code:  an ISO 3166-1 alpha-2 code, or a key of
 *     `UIT.SpecialFlags`
 *   - the code => its emoji (`UIT.Flags.emojiFor()`, which menu options' flags use too):  `SpecialFlags[code]`,
 *     else a two-letter code's regional-indicator pair (`U+1F1E6 + letter - "a"` per letter:  `fr` => `🇫🇷`);
 *     anything else renders an empty flag box
 *   - `aria-label`:  `texts` for the `SpecialFlags` codes, else `Intl.DisplayNames(lang, { type: "region" })`
 *     of the upper-cased code (`FR` => `France`), which also follows the page language for free
 * - NOTE: aliases are Fomantic's English names;  a translation adds its own names next to them (they're data,
 *   not vocabulary names).
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-flag>`
 * A country flag:  `<span class="ui [size] flag <code>" part="flag" role="img" aria-label="France">🇫🇷</span>`.
 ****************/
export const flagVocabulary = {
  tag: "ui-flag",
  topics: ["icons", "images", "elements"],
  aka: ["country flag", "country", "locale flag"],
  skeleton: "inline 1.1 x 0.8",
  noun: "flag",
  description: "A flag is used to represent a political state.",
  attributes: [
    {
      name: "size",
      kind: "size",
      values: ["small", "medium", "large", "big", "huge", "massive"],
      description:
        "Fomantic's flag sizes against the surrounding text, `small` (1.5em) ... `massive` (12em);  `medium` " +
        "is the unsized default (1em), NOT Fomantic's 3em."
    },
    {
      name: "country",
      kind: "string",
      description:
        "ISO 3166-1 alpha-2 code in any case (`fr`, `US`), or one of Fomantic's names and aliases " +
        "(`france`, `united states`, `america`, `uk`, `england`, `pride` ...), see `FLAG_ALIASES`."
    }
  ],
  events: [],
  slots: [],
  parts: [{ name: "flag", description: "The flag glyph box." }],
  states: [],
  texts: [
    { key: "rainbow", text: "Rainbow flag", description: "Label of `rainbow` (`pride`, `lgbt`)." },
    { key: "transgender", text: "Transgender flag", description: "Label of `transgender`." },
    { key: "pirate", text: "Pirate flag", description: "Label of `pirate`." },
    { key: "gbEng", text: "England", description: "Label of `gb-eng` (`england`)." },
    { key: "gbSct", text: "Scotland", description: "Label of `gb-sct` (`scotland`)." },
    { key: "gbWls", text: "Wales", description: "Label of `gb-wls` (`wales`)." }
  ]
} as const satisfies ComponentVocabulary
