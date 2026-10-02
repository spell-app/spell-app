# `@spell-app/ui` docs site

Astro 7 + MDX, static output, modelled on [fomantic-ui.com](https://fomantic-ui.com):  left sidebar, a page per
component with Types / Content / States / Variations sections, every example LIVE with a "Show code" pane, a
sticky "On this page" index, and a header with the colour scheme, Classic theme and version menus.

## Running

A workspace of the monorepo (`packages/ui/site`, so it shares ONE Solid with `ui`):  run `yarn install` at the repo root, then:

```sh
cd site
yarn dev       # http://localhost:4321;  Astro 7 runs it detached -- `yarn astro dev stop` to stop
yarn build     # -> site/dist/
yarn preview   # serve site/dist/
yarn check     # astro check (TypeScript 6:  astro check doesn't support TS 7 yet)
```

The library is consumed from SOURCE, never from `dist/`:  `astro.config.mjs` aliases `$` -> `../src`,
`$/ui/test` -> `../test`, `@spell-app/ui` -> `../src/index.ts`, and reuses the repo's decorator plugin
(`../vite.decorators.ts`) and Lightning CSS targets (`CSS_TARGETS` from `../vite.config.ts`).  

## Layout

```
site/
  astro.config.mjs           aliases, decorators, Lightning CSS, MDX + the paragraph-unwrap plugin
  src/
    content.config.ts        the `components` collection schema
    content/components/      ONE .mdx PER COMPONENT  <- component agents write here
    layouts/Docs.astro       header, sidebar, masthead, prose column, "On this page"
    components/
      Section.astro          h2 + anchor:  Types / Content / States / Variations / Usage ...
      Example.astro          one live example + "Show code" (the heart of the site)
      Variation.astro        h3 + one Example, for a "Variations" section
      TokenTable.astro       CSS custom properties table, with live colour swatches
      TokenPlayground.astro  inputs bound to tokens on :root (Theming page)
      ApiTable.astro         API tables from ../custom-elements.json ("coming soon" until it exists)
      ComponentBrowser.astro the sidebar's Components section:  every tag, A-Z / by topic, search, favorites
    pages/                   index, getting-started, grammar, theming, utilities, icons, components/
    lib/                     nav, ComponentIndex (tags + links, from ComponentDefinitions), SearchText,
                             HtmlFormatter (Show code), shiki themes, slug, the MDX plugin
    scripts/                 layout behaviour, the component browser, storage, copy buttons, the auto-loader
    styles/site.css          site chrome = THE app stylesheet (`#ui-app-stylesheet`)
```

## Writing a component page

Create `src/content/components/ui-<name>.mdx`.  It appears at `/components/ui-<name>/` automatically;  the API table
is appended for you.  The sidebar and the `/components/` index list TAGS, not pages:  each tag's vocabulary
`topics` / `aka` file it (`ComponentDefinitions`), and a tag other than the folder's main one links to its
`VocabularyTable` heading (`#ui-<tag>`).

```mdx
---
title: Button
tag: ui-button
status: in-progress # planned | in-progress | done;  anything but done shows a badge
summary: A button indicates a possible user action.
---

import Example from "../../components/Example.astro"
import Section from "../../components/Section.astro"
import Variation from "../../components/Variation.astro"
// Notes for other authors go here, as `//` comments attached to the imports (see "Gotchas").

<Section title="Types">
  <Example title="Emphasis" description="A button can be formatted to show different levels of emphasis." class="ui-cluster">
    <ui-button color="primary">Save</ui-button>
    <ui-button>Cancel</ui-button>
  </Example>
</Section>

<Section title="Variations">
  <Variation title="Size" description="A button can have different sizes." class="ui-cluster">
    <ui-button size="small">Small</ui-button>
    <ui-button size="large">Large</ui-button>
  </Variation>
</Section>
```

- Section order, as Fomantic:  Types, Content, States, Variations, then Usage (behaviour, events, slots, parts),
  Theming (`<TokenTable>`) and Accessibility.  Each `<Section>` `h2` becomes an "On this page" entry.
- `<Example>` props:  `title`, `description`, `class` (on the live box, e.g. `ui-cluster` to lay out siblings),
  `level` (`3` / `4`), `open` (code pane open), `code` (override the shown source).
- Write the markup ONCE:  `Example` renders its slot live AND shows the same markup, re-indented and highlighted.
  It captures the source with `Astro.slots.render("default")` (rendered HTML;  MDX has already dropped your
  whitespace), then `lib/HtmlFormatter.ts` pretty-prints it and strips Astro's `data-astro-*` annotations.
  Bare boolean attributes (`basic`) come out of MDX as `basic="true"`;  the formatter shows them bare again.

### Making examples live

- Nothing to import:  every page is wrapped in `<ui-root display="immediately">` (`layouts/Docs.astro`), which
  imports the family of every undefined `ui-*` tag on the page:  `src/components/ui-<family>/index.ts`.  Write
  `<ui-button>` and `$/ui/components/ui-button/index.ts` loads, on the pages that use it only.
- A family defines several tags (`ui-dropdown` + `ui-item`);  `<ui-root>`'s generated catalog
  (`src/components/ui-root/ui-root.catalog.ts`, `yarn gen:root`) maps each to its family.
- Anything else client-side (setting a rich `options` property, listening for `ui-change`) goes in a small
  `.astro` component with a `<script>`, used from the MDX page, e.g. `src/components/DropdownDemo.astro`:

  ```astro
  <ui-dropdown data-demo="options"></ui-dropdown>
  <script>
    import "$/ui/components/ui-dropdown"
    import type { UIDropdown } from "$/ui/components/ui-dropdown"
    const dropdown = document.querySelector<UIDropdown>("[data-demo=options]")!
    dropdown.options = [{ value: "1", text: "One" }]
  </script>
  ```

### Gotchas

- MDX does NOT bundle `<script>`:  it's JSX there, rendered as-is, and its `import`s fail.  Use an `.astro`
  component (above).
- NEVER a multi-line `{/* ... */}` comment in MDX:  the repo's `oxfmt` formats `.mdx` as markdown and turns
  it into `{/_ ... _/}`, which breaks the build.  Use `//` comments attached to the import block (no blank line
  before them, or they become a paragraph), or a single-line `{/* ... */}`.
- Text on its own line inside an HTML element (`<p>⏎text⏎</p>`) would become a nested `<p>` in MDX;
  `lib/unwrapHtmlParagraphs.ts` unwraps it.  Inside components (`<Section>`) paragraphs are kept.
- `style` in MDX is a string (`style="--min-column-size: 8em"`) or an object (`style={{ ... }}`).

## Styling the site

- `$/ui/styles/ui.css` is the page foundation (imported by the layout, bundled into a `<link>`).
- `src/styles/site.css` is linked as `<link id="ui-app-stylesheet">`:  the library's app-stylesheet convention,
  so the runtime also adopts it into every component's shadow root.  Keep EVERY site rule on a `.site-*` class,
  in `@layer ui.app`.  Rules meant for component internals would use Fomantic's class grammar there.
- Prefer `ui-*` utilities in markup and `--ui-*` tokens in CSS;  never `rem`.  `ui-native` on `<body>` styles
  plain controls, tables and code.

## TODO

- Manifest-driven API tables:  `ApiTable.astro` reads `../custom-elements.json` (`yarn manifest` in the root);
  check its shape against the analyzer's real output once components land.
- Editable playground and framework smoke pages (`site/playground`), per `docs/plan.md` "Tooling".
- The version menu lists only the current version.
