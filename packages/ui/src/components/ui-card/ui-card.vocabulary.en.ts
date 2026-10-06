/**
 * Every name `<ui-card>` and `<ui-cards>` use:  tag, attributes (kind + allowed values), slots, parts, states,
 * texts.  Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-card raised color="red" size="small">` => `ui small red raised card`;
 *   `<ui-cards columns="3" doubling stackable>` => `ui doubling stackable three cards`.  `ui-card.css` keys on those.
 * - A card owns the generic content parts (`ownsParts`):  `<ui-content>`, `<ui-header>`, `<ui-meta>`,
 *   `<ui-description>`, `<ui-extra>`, `<ui-avatar>` inside it get `:state(in-card)` (`ui-parts.css`).
 * - A group owns its cards (`ownsParts:  card`):  a card in a group gets `:state(in-cards)` and takes the group's
 *   variations (`size`, `color`, `raised` ...) as its own classes, as Fomantic's `.ui.raised.cards > .card` has it.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-card>`
 * A card:  an `<article class="ui ... card">` (an `<a>` with `href`) of content parts, with shorthands.
 ****************/
export const cardVocabulary = {
  tag: "ui-card",
  topics: ["cards", "containers", "data display", "views"],
  aka: ["tile", "panel", "profile card"],
  skeleton: {
    width: "18em",
    parts: [{ shape: "image", ratio: "square" }, { shape: "header" }, { shape: "paragraph", lines: 3 }]
  },
  noun: "card",
  plural: "cards",
  description: "A card displays site content in a manner similar to a playing card.",
  attributes: [
    { name: "size", kind: "size", description: "Text size, `mini` ... `massive`;  `medium` is the default." },
    {
      name: "color",
      kind: "color",
      description: "A coloured line along the bottom edge (a tinted fill when `basic`)."
    },
    {
      name: "horizontal",
      kind: "keyOnly",
      description: "Image and content side by side;  the extra content spans the bottom."
    },
    { name: "raised", kind: "keyOnly", description: "Lifted off the page with a stronger shadow." },
    {
      name: "link",
      kind: "keyOnly",
      description: "Rises on hover, as a link card does.  A LOOK only:  give it `href` to make it a link."
    },
    { name: "fluid", kind: "keyOnly", description: "Takes the width of its container." },
    { name: "centered", kind: "keyOnly", description: "Centred in its container." },
    { name: "basic", kind: "keyOnly", description: "No border or shadow." },
    {
      name: "dashed",
      kind: "keyOnly",
      description:
        "A placeholder:  a dashed border (`--ui-card-border-color`) and no drop shadow, unless `raised`.  Not Fomantic's."
    },
    { name: "inverted", kind: "keyOnly", description: "For dark backgrounds:  the dark scheme." },
    { name: "disabled", kind: "keyOnly", description: "Faded and inert;  a link card loses its `href`." },
    { name: "loading", kind: "keyOnly", description: "Dimmed under a spinner, announced as busy." },
    { name: "href", kind: "string", description: "Makes the whole card a link (`<a>`)." },
    { name: "target", kind: "string", description: "Link target, with `href`." },
    { name: "header", kind: "string", description: "Shorthand:  the header of a content block." },
    { name: "meta", kind: "string", description: "Shorthand:  metadata below the header." },
    { name: "description", kind: "string", description: "Shorthand:  the description of the content block." },
    { name: "extra", kind: "string", description: "Shorthand:  extra content at the bottom (a footer)." },
    {
      name: "image",
      kind: "string",
      description: "Shorthand:  image URL, shown at the top (at the start when horizontal)."
    },
    {
      name: "alt",
      kind: "string",
      description: 'Alternative text of the `image` shorthand;  default `""` (decorative:  the card\'s text names it).'
    }
  ],
  events: [],
  slots: [
    {
      name: "",
      description:
        "Content:  `<ui-content>` blocks (header, meta, description), `<img>`s (full-width images), `<ui-extra>`, " +
        "buttons.  A slotted part of a shorthand's noun replaces that shorthand."
    }
  ],
  parts: [
    { name: "card", description: "The card box (`<article>`, or `<a>` with `href`)." },
    { name: "image", description: "The `image` shorthand's box." },
    { name: "content", description: "The content block the `header` / `meta` / `description` shorthands render." },
    { name: "header", description: "The `header` shorthand." },
    { name: "meta", description: "The `meta` shorthand." },
    { name: "description", description: "The `description` shorthand." },
    { name: "extra", description: "The `extra` shorthand." }
  ],
  states: [
    { name: "in-cards", description: "In a `<ui-cards>` group:  sized and spaced by it, `role=listitem`." },
    { name: "disabled", description: "`disabled`." },
    { name: "loading", description: "`loading`." }
  ],
  texts: [{ key: "loading", text: "Loading…", description: "Announced while `loading`." }],
  ownsParts: ["content", "header", "meta", "description", "extra", "avatar"]
} as const satisfies E.ComponentVocabulary
