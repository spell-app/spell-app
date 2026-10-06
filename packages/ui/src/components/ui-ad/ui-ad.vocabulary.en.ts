/**
 * Every name `<ui-ad>` uses:  tag, attributes (kind + allowed values), slots, parts, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-ad unit="medium rectangle" centered>`
 *   => `ui medium rectangle centered ad`.  `ui-ad.css` keys on those phrases (`[class*="medium rectangle"]`).
 * - `unit` is the IAB unit, emitted as its bare words, hence `kind: "valueOnly"` (as the menu's
 *   `position`).  NOT `size`:  that's the generic `mini` ... `massive`, and `medium rectangle` would read as one.
 * - `test` is a string:  present => Fomantic's `test` class (a grey placeholder saying "Ad");  a value is the text
 *   to show instead (Fomantic's `data-text`).
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-ad>`
 * An ad slot:  `<div class="ui ... ad" part="ad"><slot></slot></div>` sized to an IAB unit.
 ****************/
export const adVocabulary = {
  tag: "ui-ad",
  topics: ["media", "layout", "views"],
  aka: ["advertisement", "banner ad", "ad slot"],
  skeleton: "18 x 15",
  noun: "ad",
  description: "An ad displays third-party promotional content.",
  attributes: [
    {
      name: "unit",
      kind: "valueOnly",
      values: [
        "medium rectangle",
        "large rectangle",
        "vertical rectangle",
        "small rectangle",
        "half page",
        "square",
        "small square",
        "button",
        "square button",
        "small button",
        "skyscraper",
        "wide skyscraper",
        "leaderboard",
        "large leaderboard",
        "mobile leaderboard",
        "billboard",
        "panorama",
        "netboard",
        "banner",
        "vertical banner",
        "top banner",
        "half banner",
        "large mobile banner"
      ],
      description:
        "IAB unit, e.g. `medium rectangle` (300 x 250), `leaderboard` (728 x 90).  Mobile units (`mobile leaderboard`, " +
        "`large mobile banner`) show only on phone-sized viewports."
    },
    { name: "centered", kind: "keyOnly", description: "Centred in its container." },
    {
      name: "test",
      kind: "string",
      description: 'A placeholder:  a grey box saying "Ad" (bare `test`), or the given text (`test="Your ad here"`).'
    }
  ],
  events: [],
  slots: [{ name: "", description: "The ad:  usually an `<iframe>` or an image link." }],
  parts: [{ name: "ad", description: "The ad box." }],
  states: [],
  texts: [{ key: "adTest", text: "Ad", description: "What a bare `test` ad says." }]
} as const satisfies ComponentVocabulary
