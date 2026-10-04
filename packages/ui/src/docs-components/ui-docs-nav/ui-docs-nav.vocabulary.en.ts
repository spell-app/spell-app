/**
 * Every name `<ui-docs-nav>` uses:  tag, attributes, events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - A DOC-ONLY element (`src/docs-components/`):  filed under the `documentation` topic, left out of the component
 *   list, loaded by `<ui-root>` like any family.
 * - Class words:  `ui [size] nav` on the scroll box;  `size` is also handed to the inner `<ui-menu>`.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-docs-nav>`
 * The docs site's left sidebar, Fomantic's dark `.toc` menu:  the intro pages, EVERY component (A-Z or by topic,
 * searchable, with favourites), then the Foundation pages;  the current page highlighted.
 ****************/
export const docsNavVocabulary = {
  tag: "ui-docs-nav",
  topics: ["documentation", "navigation", "menus"],
  aka: ["sidebar", "table of contents", "toc", "site nav", "docs menu", "component browser"],
  skeleton: {
    width: "15em",
    parts: [
      { shape: "paragraph", lines: 3 },
      { shape: "paragraph", lines: 8 }
    ]
  },
  noun: "nav",
  description:
    "A docs nav lists the site's pages and every component, A-Z or by topic, with search and favourites;  the " +
    "current page is highlighted and scrolled into view.",
  attributes: [
    {
      name: "current",
      kind: "string",
      description:
        "The page shown:  a component tag (`ui-button`) or a page's file name without `.html` (`getting-started`).  " +
        "Default:  the page's own file name (`/ui/` is `index`)."
    },
    {
      name: "base",
      kind: "string",
      description:
        "The site root, relative to the page, e.g. `../` from `components/`;  every link starts with it.  " +
        "Default:  the folder above the site's data file (`SiteData`), so links are absolute."
    },
    {
      name: "view",
      kind: "enum",
      values: ["az", "topics"],
      description:
        "Components A-Z, or grouped by `topics` (a tag sits under each of its topics).  The switch sets it " +
        "(reflected, `ui-change`) and the viewer's choice is remembered;  set in markup, it wins.  Default:  the " +
        "remembered one, else `az`."
    },
    {
      name: "size",
      kind: "size",
      description:
        "Size of the menu, `mini` ... `massive`;  `medium` is the default:  Fomantic's sidebar is a `big` menu on " +
        "a 14px page, ~15px, and ours is 16px already."
    }
  ],
  events: [
    {
      name: "ui-navigate",
      detail: "{ href: string, page: string, originalEvent: Event }",
      cancelable: true,
      description:
        "A link was followed:  `page` is its tag or page id.  A flyout or sidebar holding the nav closes on it;  " +
        "`preventDefault()` keeps the browser on the page (a router takes over)."
    },
    {
      name: "ui-change",
      detail: "{ view: 'az' | 'topics', originalEvent?: Event }",
      description: "The viewer switched between A-Z and Topics."
    },
    {
      name: "ui-favorite",
      detail: "{ tag: string, favorite: boolean, favorites: string[], originalEvent?: Event }",
      description: "The viewer starred or un-starred a component;  `favorites` is the whole list, A-Z."
    }
  ],
  slots: [
    { name: "header", description: "Above the links, in an item of its own:  a logo, the site name." },
    { name: "footer", description: "Below the links, in an item of its own:  a version, a theme picker." }
  ],
  parts: [
    { name: "nav", description: "The scroll box around the menu (the dark background below a short menu too)." },
    { name: "menu", description: "The `<ui-menu vertical inverted>`." },
    { name: "search", description: "The search `<ui-input>`." },
    { name: "views", description: "The A-Z / Topics `<ui-buttons>`." },
    { name: "count", description: "The `<ui-label>` with how many components show." }
  ],
  states: [
    { name: "searching", description: "A search is typed:  only matches show, every topic with one open." },
    { name: "empty", description: "The search matches nothing." },
    { name: "listed", description: "The component list has loaded and rendered." }
  ],
  texts: [
    { key: "navLabel", text: "Documentation", description: "Accessible name of the navigation landmark." },
    { key: "overview", text: "Overview", description: "Link to `index.html`." },
    { key: "gettingStarted", text: "Getting started", description: "Link to `getting-started.html`." },
    { key: "grammar", text: "Grammar", description: "Link to `grammar.html`." },
    { key: "allComponents", text: "All components", description: "Link to `components/index.html`, the card index." },
    { key: "components", text: "Components", description: "Header of the component lists." },
    { key: "foundation", text: "Foundation", description: "Header of the Foundation links." },
    { key: "theming", text: "Theming", description: "Link to `theming.html`." },
    { key: "utilities", text: "Utilities", description: "Link to `utilities.html`." },
    { key: "icons", text: "Icons", description: "Link to `icons.html`." },
    { key: "kitchenSink", text: "Kitchen sink", description: "Link to `kitchen-sink.html`." },
    { key: "favorites", text: "Favourites", description: "Header of the starred components." },
    { key: "search", text: "Search components", description: "Accessible name of the search box." },
    { key: "searchPlaceholder", text: "Search", description: "The search box's hint." },
    { key: "views", text: "List components", description: "Accessible name of the A-Z / Topics switch." },
    { key: "az", text: "A-Z", description: "The A-Z button's name." },
    { key: "topics", text: "By topic", description: "The Topics button's name." },
    { key: "addFavorite", text: "Add {name} to favourites", description: "A star's name while off." },
    { key: "removeFavorite", text: "Remove {name} from favourites", description: "A star's name while on." },
    { key: "matchOne", text: "1 component matches", description: "Announced while searching:  one match." },
    { key: "matchMany", text: "{count} components match", description: "Announced while searching." },
    { key: "noMatches", text: "No components match", description: "Shown when the search matches nothing." },
    { key: "count", text: "{count} components", description: "Accessible name of the count label." },
    { key: "loading", text: "Loading components", description: "Shown until the component list arrives." },
    { key: "loadError", text: "The component list didn't load", description: "Shown when the data file fails." },
    { key: "planned", text: "planned", description: "Badge of a family whose port hasn't started." },
    { key: "inProgress", text: "in progress", description: "Badge of a family being ported." }
  ]
} as const satisfies ComponentVocabulary
