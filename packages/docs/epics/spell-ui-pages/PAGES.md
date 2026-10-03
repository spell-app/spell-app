# spell-ui-pages -- writing a component page (P4)

Read `BRIEF.md` beside this first.  The pilot, `packages/ui/site/components/ui-button.html`, is the model:  open it
beside this file and copy its patterns.  One agent = one or a few families;  write ONLY your pages, never the
template, `site/_src/`, `site/_parts/` or another agent's page.

## 1. Make the page

From `packages/ui`:

```
yarn site:new ui-card                  # => site/components/ui-card.html  (any tag of the family works:  ui-cards too)
yarn site:new getting-started --title "Getting started" --summary "One line."   # a non-component page:  site/<page>.html
```

- Title, summary and status come from `site/_data/pages.json` (`families.<folder>`).  A wrong summary:  fix it THERE
  (hand-kept, the durable home) and rerun `yarn site:data`;  never only in the page.
- It refuses to overwrite;  `--force` regenerates (and loses your content:  don't).
- What you get (DON'T change it;  it is the template's, `packages/docs/templates/spell-ui-docs.html`):
  - `<head>`:  the scheme script, `../_assets/site.css`, `../_assets/site.js`
  - `<spell-site-header>`, `<ui-root icons="fa7-brands, fomantic" display="immediately">`
  - header + footer as `<ui-include page-styles>` of `_parts/header.html` / `_parts/footer.html`
  - the nav column, the masthead (title, summary, status label unless done, source / bug / Fomantic links, the
    family's `<ui-docs-themes for>`)
  - `<ui-rail>` + `<ui-sticky>` + `<ui-docs-toc for="site-tabs">` ("On this page", built at runtime)
  - `<ui-tabs id="site-tabs" class="site-tabs" history basic compact>` with four panes:  `examples`, `usage`, `api`,
    `theming`.  YOU fill the CONTENTS of the `examples`, `usage` and `theming` panes;  `api` is done
    (`<ui-docs-api family>`, generated from the vocabularies).

## 2. Sources

- Fomantic's page:  `packages/ui/reference/Fomantic-UI-Docs/server/documents/<group>/<name>.html.eco` (page map:  plan doc
  1.3).  Take EVERY section and example, in Fomantic's order, with Fomantic's header and description text (MIT;  the
  footer credits it).  Live:  `https://fomantic-ui.com/<group>/<name>.html` (WebFetch, or screenshot it).
- Our names:  `packages/ui/src/components/ui-<name>/*.vocabulary.en.ts` -- the ONLY attributes and values that exist.
  `examples/elements/*.html` beside them:  Fomantic's examples already translated to element markup;  reuse them.
  `examples/*.html`:  the class grammar.
- What our old page says (Usage, Theming prose, a11y, framework snippets, our own extras):
  `packages/ui/site/src/content/components/ui-<name>.mdx`.  Keep our extras that Fomantic lacks.
- Images:  `../images/...`, same paths as fomantic-ui.com's `/images/...` (`packages/ui/site/images/`).  A missing
  image:  a gap note in the page, not a hotlink.
- Grammar rules (attribute <-> class words):  `packages/ui/docs/grammar.md`.

## 3. Examples pane

```html
<ui-header level="2" dividing id="types">Types</ui-header>

<ui-docs-example header="Emphasis" description="A button can be formatted to show different levels of emphasis.">
  <ui-button primary>Save</ui-button>
  <ui-button>Discard</ui-button>
</ui-docs-example>
<ui-docs-example>
  <ui-button secondary>Okay</ui-button>
</ui-docs-example>
```

- A SECTION per Fomantic `h2` (Types, Content, States, Variations, Groups, Group Variations ...):
  `<ui-header level="2" dividing id="...">`.  ids lowercase-kebab, unique, NEVER `examples` / `usage` / `api` /
  `theming` (those are the tab hash).  Sub-sections, rarely:  `level="3"`.
- An EXAMPLE per Fomantic `.example`:  `<ui-docs-example header description>` around the live markup.  The toc
  lists it under its section and gives it an id from its header (`#labeled-icon`).
  - Fomantic's header-less `.another.example` continuation => `<ui-docs-example>` with no header.
  - `description`:  one sentence;  `backticks` become code;  `&quot;` for a quote inside the attribute.
  - Richer description or Fomantic's `ui ignored message` notes:  several `slot="description"` children, in order
    (left out of the code shown);  then put the sentence in a `<p slot="description">` too (the attribute stops
    showing):

    ```html
    <ui-docs-example header="Emphasis">
      <p slot="description">A button can be formatted to show different levels of emphasis.</p>
      <ui-message slot="description" state="info" size="small">Set your brand colours in <code>--ui-primary</code>.</ui-message>
      <ui-button primary>Save</ui-button>
    </ui-docs-example>
    ```

  - The markup IS the code shown:  clean `<ui-*>` markup, 2-space indent, no `style=`, no `<div class>` chrome.  A
    layout wrapper, only if the example needs one:  a `<ui-*>` (`<ui-segment basic>`, `<ui-container>`).  Inverted
    examples:  `<ui-segment inverted>` (Fomantic's `ui inverted segment`).
  - NO comments inside a `<ui-docs-example>` (they show in its code).
- A Fomantic feature we DELIBERATELY don't have (the vocabulary or the mdx says "not ported"):  one line in its place,
  `<ui-message size="small" class="site-not-ported">Not ported:  <what> -- <why, one clause>.</ui-message>` (or as a
  `slot="description"` child of the nearest example).
- Things that bit the pilot:
  - icon names in CANONICAL word order:  `arrow right`, `chevron left` (Fomantic's `right arrow` draws NOTHING and
    warns nothing, I23).  Check every icon in the screenshot.
  - text that holds `<tags>`:  wrap `<ui-markdown>` content in `<script type="text/markdown">` and `<ui-code>` content
    in `<script type="text/plain">` (indentation is stripped), or raw `<tag>`s parse as real elements.
  - a `popover` attribute on a `ui-*` host doesn't hide it:  use the widget's own (`<ui-popup on="manual">`).

### Fomantic class grammar => our markup (common mappings)

| Fomantic | Ours |
|---|---|
| `<div class="ui X">` / `<button class="ui X">` | `<ui-X>`;  each class word => its attribute (`ui small primary basic button` => `<ui-button size="small" primary basic>`) |
| sizes `mini` ... `massive` | `size="mini"`;  `medium` = default, write nothing |
| colours `red` ... `black`, `primary`, `secondary` | `color="red"`;  `primary` / `secondary` are also bare words on most tags (`<ui-button primary>`) |
| `left floated` / `right floated` | `floated="left"` |
| `left aligned` / `center aligned` text | `text-align="center"` |
| `very padded`, `very relaxed`, `very close` | `padded="very"`, `relaxed="very"`, `close="very"` |
| `top attached`, `bottom attached`, `attached` | `attached="top"`, `attached="bottom"`, `attached` |
| `left labeled` / `right labeled` | `labeled="left"` / `labeled="right"` |
| `labeled icon button` + `<i class="x icon">` | `<ui-button labeled icon="x">` |
| `<i class="x icon"></i>` inside an element | the element's `icon="x"` attribute;  markup / a spinner:  `<ui-icon slot="icon" name="x">` |
| `ui labeled button` > `button` + `ui basic label` | `<ui-button icon="heart" label="2,048">` |
| `five buttons`, `three item menu`, `four wide column` | `width="5"` (columns `4`, fractions `1/4`, `25%`);  NEVER `wide` |
| `<div class="or" data-text="ou">` | `<ui-or text="ou">` |
| `active` | `active` (alias of `selected` where the tag chooses) |
| `disabled`, `loading` | same words |
| `.header`, `.content`, `.meta`, `.description`, `.extra` children | `<ui-header>`, `<ui-content>`, `<ui-meta>`, `<ui-description>`, `<ui-extra>` (parts style themselves by owner) |
| `.item` children (menu, list, dropdown) | `<ui-item>` (`href` for links) |
| `ui image` / `ui avatar image` | `<ui-image src>` / `<ui-image avatar src>` |
| a theme variable (`@orCircleSize`) | its public token (`--ui-button-or-size`), on the Theming tab |

Not in the table:  read the tag's vocabulary;  still nothing => it's a gap (section 6).

## 4. Usage pane

Sections (`<ui-header level="2" dividing id>`), from the mdx, tightened:

- Using it -- what to write, which attributes matter (class words, booleans, shorthands vs slots), groups / owners
- Events -- every `ui-*` event with its `detail`, a `<ui-code language="js">` listener
- Behaviour specific to the family (forms, commands, validation, values ...), with a live `<ui-docs-example>` where a
  demo helps
- Keyboard -- what each key does
- Accessibility -- what the shadow markup exposes, what an author must add (`aria-label` on icon-only ...)
- Framework usage -- React / Vue / Solid snippets when events or rich properties need them

Prose:  `<ui-markdown><script type="text/markdown">...</script></ui-markdown>`.  Code:
`<ui-code language="js|css|html"><script type="text/plain">...</script></ui-code>`.

## 5. Theming pane

Keep `<ui-docs-tokens family="ui-<name>" playground>` exactly.  Around it:

- Tokens -- how to set the family's public `--ui-<tag>-*` tokens (element, ancestor, `:root`, `::part()`), a
  `<ui-code language="css">` sample, what variations do with them;  "never set `--_*`" (private plumbing)
- Themes -- which Fomantic themes restyle this family:  `site/_data/components.json` `themes[]` whose `families`
  list your folder (the masthead picker shows the same list)

## 6. Gaps

A Fomantic example (or a piece of the page) a widget can't render right -- missing attribute / value, wrong look,
needs hand CSS -- is a GAP:

1. Look for it first:  `grep -o 'Gap: [^<]*' packages/docs/epics/spell-ui-pages/spell-ui-pages.html`.
2. New:  from the WORKTREE ROOT,
   `yarn plan-doc add spell-ui-pages issue "Gap:  <ui-tag> <what's missing>" --details "<p>Fomantic example: ...  What the page does instead: ...</p>"`
   (raw `<tags>` in the title:  the script escapes them).  It prints the id.
3. In the page, an HTML comment BEFORE the example:  `<!-- GAP I23:  what's wrong, one line. -->`.  Render what we
   can (closest attributes), or leave the example out with the comment saying so.
4. Fix it in the widget ONLY if < ~15 min and local to that one widget, with a test;  then close the issue
   (`yarn plan-doc close spell-ui-pages <id>`) and drop the comment.  A suspected bug, not a gap:
   `SUSPECTED-BUGS.md` (repo root, `## ui`).

## 7. Checks (all before you report)

From `packages/ui`:

1. `yarn site:check ui-<name>` -- must print `OK`.  Fails on console errors, 404s, undefined / unrendered `ui-*`, a
   missing tab, an empty toc on the Examples tab, phone-width overflow (it names the offenders:  usually an example;
   wide demos scroll inside their frame on phones), a nav flyout that won't open.
2. LOOK at the screenshots in `tools/results/site-check/` (`ui-<name>-desk-examples.png`, `-desk-full.png`,
   `-desk-usage|api|theming.png`, `-phone-top|mid|full|nav.png`, `-desk-dark.png`):  every example renders, icons draw,
   nothing overlaps or clips.  Compare section by section with fomantic-ui.com's page.
3. If you fixed a widget:  `yarn ts` and that family's tests (`yarn vitest run --project browser src/components/ui-<name>`).
   Do NOT run `yarn site:build` / `yarn review` (the lead does, once);  a widget fix shows on the site only after the
   lead's `yarn site:build` (until then, check it with the family's tests).

Report:  sections + example count, gaps (ids + one line), not-ported notes, surprises in the mapping.
