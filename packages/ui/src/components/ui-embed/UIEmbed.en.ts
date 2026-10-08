/**
 * Every name `<ui-embed>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `E.ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:  `<ui-embed active>` => `ui active embed`;
 *   the element adds the `aspect-ratio` word after the noun (`ui embed 4:3`),
 *   which `UIEmbed.css` matches with `[class*="4:3"]`, as Fomantic's.
 * - Fomantic's `data-id` is `video-id` here:  `id` is the element's own id.
 */

import type { E } from "$/ui/core"

/****************
 * ### `<ui-embed>`
 * An embed:  `<div class="ui ... embed" part="embed">` holding a play button
 * (placeholder image, icon, slot) until activated, then the `<iframe>`.
 ****************/
export const embedVocabulary = {
  tag: "ui-embed",
  topics: ["media", "modules"],
  aka: ["iframe", "video", "youtube", "vimeo", "player"],
  skeleton: "28 x 15.75",
  noun: "embed",
  description: "An embed displays content from other websites, like YouTube videos, loaded only when asked for.",
  attributes: [
    { name: "source", kind: "enum", values: ["youtube", "vimeo"], description: "Video host of `video-id`." },
    {
      name: "video-id",
      kind: "string",
      property: "videoId",
      description: "The video's id at `source` (Fomantic's `data-id`)."
    },
    {
      name: "url",
      kind: "string",
      description:
        "Any `http(s)` URL to frame, instead of `source` + `video-id`;  a YouTube / Vimeo one gets their player parameters."
    },
    { name: "placeholder", kind: "string", description: "Image shown (and clicked) before the frame loads." },
    {
      name: "label",
      kind: "string",
      description:
        "What it is, e.g. `Product tour`:  names the play button (`Play Product tour`) and the frame.  Default `alt`, else `video` / `embedded content`."
    },
    { name: "alt", kind: "string", description: "Fomantic's placeholder `alt`;  used as `label` when there is none." },
    {
      name: "icon",
      kind: "icon",
      default: "circle-play",
      description: 'Icon over the placeholder;  bare `icon` (or `"true"`) keeps the default, `icon="false"` shows none.'
    },
    {
      name: "aspect-ratio",
      kind: "enum",
      values: ["16:9", "4:3", "21:9", "square"],
      description: "Shape of the box;  `16:9` (widescreen) is the default."
    },
    {
      name: "autoplay",
      kind: "boolean",
      default: true,
      description: "The video plays as soon as the frame loads:  the click on the placeholder already asked for it."
    },
    {
      name: "branded-ui",
      kind: "boolean",
      property: "brandedUI",
      description: "Keep the player's own branding (Fomantic's `brandedUI`)."
    },
    {
      name: "parameters",
      kind: "json",
      description: "Extra URL parameters for the frame, e.g. `{ start: 30 }` (a JS property;  JSON in the attribute)."
    },
    {
      name: "active",
      kind: "keyOnly",
      description:
        "The frame is loaded.  Controlled:  set it to load / unload;  a click (or `host.activate()`) fires the cancelable `ui-activate` first."
    }
  ],
  events: [
    {
      name: "ui-activate",
      detail: "{ url: string, originalEvent?: Event }",
      cancelable: true,
      description:
        "About to load the frame from `url` (a click, Enter / Space, `host.activate()`);  `preventDefault()` keeps the placeholder."
    },
    {
      name: "ui-reset",
      detail: "{}",
      description: "Back to the placeholder (`host.reset()`, Fomantic's `reset`):  the frame is gone."
    }
  ],
  slots: [{ name: "", description: "Placeholder content inside the play button, over the image, e.g. a caption." }],
  parts: [
    { name: "embed", description: "The box." },
    { name: "play", description: "The play button (placeholder)." },
    { name: "placeholder", description: "The placeholder image." },
    { name: "icon", description: "The icon over the placeholder." },
    { name: "frame", description: "The box around the `<iframe>`, once active." }
  ],
  states: [{ name: "active", description: "The frame is loaded." }],
  texts: [
    { key: "embedPlay", text: "Play {name}", description: "Accessible name of the play button." },
    { key: "embedVideo", text: "video", description: "Default `label` of a YouTube / Vimeo embed." },
    { key: "embedContent", text: "embedded content", description: "Default `label` of any other embed." }
  ]
} as const satisfies E.ComponentVocabulary
