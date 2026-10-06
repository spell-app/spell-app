/**
 * Every name `<ui-tabs>` and `<ui-tab>` use:  tags, attributes (kind + allowed values), events, slots, parts,
 * states, texts.  Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Fomantic's words:  a `.ui.tab` is a PANE (`<div class="ui bottom attached tab segment" data-tab>`);  the tabs
 *   you click are the items of a `tabular` (or `pointing` / `secondary` / `text`) MENU.  So `<ui-tab>` is the pane,
 *   and `<ui-tabs>` draws the menu from its panes' `label`s, with `ui-menu.css`.
 * - Class words come out through `ClassBuilder`:
 *   - `<ui-tabs tabular attached size="small">` => the root `ui small tabular top attached tabs` and its tab list
 *     `ui small tabular top attached menu` (the same words, Fomantic's noun `menu`)
 *   - `<ui-tab>` in those tabs => `ui active bottom attached tab segment` (the menu's opposite edge;  `active` while
 *     selected)
 * - `selected` is the canonical chosen state (`active`, Fomantic's word, is an alias);  the chosen pane is the tabs'
 *   `value`.
 * - The tab list's look is the menu's ONE word, `appearance` (`UIT.MenuAppearances`:  `tabular`, `pointing`,
 *   `secondary`, `text`, `segmented`);  the older booleans stay as aliases.  `alignment` and `equal` place and size
 *   the tabs, as on `<ui-menu>`.
 */

import * as UIT from "$/ui/components/components.types"
import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-tabs>`
 * A tab set:  `<div class="ui ... tabs" part="tabs">` holding a `role="tablist"` menu of `<button role="tab">`s
 * (one per `<ui-tab>` pane) and the panes' slot.
 ****************/
export const tabsVocabulary = {
  tag: "ui-tabs",
  topics: ["navigation", "menus", "containers", "modules"],
  aka: ["tab bar", "tab strip", "tabbed panel", "tab view"],
  skeleton: {
    parts: [
      { shape: "line", length: "medium" },
      { shape: "paragraph", lines: 3 }
    ]
  },
  noun: "tabs",
  description: "A tab is a hidden section of content activated by a menu.",
  attributes: [
    {
      name: "size",
      kind: "size",
      description: "Size of the tab menu, `mini` ... `massive`;  `medium` is the default."
    },
    {
      name: "color",
      kind: "color",
      description: "Hue of the selected tab (`segmented`:  its fill;  default the primary colour)."
    },
    {
      name: "appearance",
      kind: "valueOnly",
      values: UIT.MenuAppearances,
      description:
        "The tab list's look, as `<ui-menu appearance>`:  `tabular` (file-folder tabs), `pointing`, `secondary`, " +
        "`text`, `segmented` (a bordered group of joined tabs, the selected one filled:  a segmented control).  The " +
        "booleans below are aliases."
    },
    {
      name: "tabular",
      kind: "keyOnly",
      description: 'Tabs drawn as file-folder tabs (Fomantic\'s classic tab look).  Alias of `appearance="tabular"`.'
    },
    {
      name: "pointing",
      kind: "keyOnly",
      description:
        'The selected tab points at its pane;  an underline with `secondary`.  Alias of `appearance="pointing"`.'
    },
    {
      name: "secondary",
      kind: "keyOnly",
      description: 'De-emphasized tabs:  no box.  Alias of `appearance="secondary"`.'
    },
    { name: "text", kind: "keyOnly", description: 'Plain text tabs.  Alias of `appearance="text"`.' },
    { name: "inverted", kind: "keyOnly", description: "The dark scheme for the tabs and the panes." },
    {
      name: "vertical",
      kind: "keyOnly",
      description: "Tabs stacked in a column beside the panes;  ArrowUp / ArrowDown move between them."
    },
    { name: "fluid", kind: "keyOnly", description: "The tab menu takes the full width (or, vertical, its column's)." },
    {
      name: "compact",
      kind: "keyOnly",
      description: "The tab menu is only as wide as its tabs (Fomantic's `compact` menu)."
    },
    {
      name: "alignment",
      kind: "valueAndKey",
      key: "aligned",
      values: UIT.ItemAlignments,
      description:
        "Where the tabs sit:  `fluid` -- they fill the row;  `left` / `center` / `right` -- packed at that end (a " +
        "`segmented` tab list moves as a whole).  Ignored when `vertical`."
    },
    {
      name: "equal",
      kind: "keyOnly",
      description:
        'Every tab the same width, from the tabs themselves (no count):  with `alignment="fluid"` an equal share ' +
        "of the row each;  otherwise each as wide as the widest."
    },
    {
      name: "basic",
      kind: "keyOnly",
      description: "Panes without the segment box (Fomantic's `basic segment`):  no border, no shadow."
    },
    {
      name: "attached",
      kind: "keyOrValueAndKey",
      values: ["top", "bottom"],
      description:
        "Joins the tab menu and the panes edge to edge:  bare or `top` puts the tabs above (`top attached` menu, " +
        '`bottom attached` panes);  `attached="bottom"` puts them below.'
    },
    {
      name: "value",
      kind: "string",
      description:
        "Value of the selected pane (its `value`, else its index).  Controlled:  set it to switch panes;  " +
        "`ui-change` can veto the user's changes.  Without it, the first `selected` pane, else the first enabled one."
    },
    {
      name: "activation",
      kind: "enum",
      values: ["automatic", "manual"],
      default: "automatic",
      description:
        "`automatic`:  moving focus with the arrow keys selects the tab (APG's default).  `manual`:  arrows only " +
        "move focus;  Enter / Space select."
    },
    {
      name: "history",
      kind: "boolean",
      description:
        "Mirror the selected pane in the URL hash (`#value`):  selecting pushes a history entry, Back / Forward and " +
        "links to `#value` select the pane, and a page opened on `#value` starts there."
    }
  ],
  events: [
    {
      name: "ui-change",
      detail: "{ value: string, tab: Element, originalEvent?: Event }",
      cancelable: true,
      description:
        "A pane is about to be selected (click, key, or the URL hash with `history`);  `preventDefault()` keeps the " +
        "current one."
    }
  ],
  slots: [{ name: "", description: "`<ui-tab>` panes;  each one's `label` becomes a tab." }],
  parts: [
    { name: "tabs", description: "The whole tab set:  menu and panes." },
    { name: "menu", description: "The tab list (`role=tablist`), a menu in the class grammar." },
    { name: "tab", description: 'One tab (`<button role=tab class="item">`).' },
    { name: "icon", description: "A tab's icon, from its pane's `icon`." }
  ],
  states: [{ name: "vertical", description: "Tabs in a column (`vertical`)." }],
  texts: [],
  ownsParts: ["tab"]
} as const satisfies ComponentVocabulary
