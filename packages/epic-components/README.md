# `packages/epic-components/` -- Epic UI, the `<epic-*>` elements' pages

PAGES, not code:  the docs set of the `<epic-*>` elements an epic page is made of (epic `epic-workflow` P10).
- Not a yarn workspace:  no `package.json`.  The elements themselves are the epics pack's, in
  [`packages/epics/components/`](../epics/components/).
- Tracked and versioned with each branch, like code:  an element's page changes in the same commit as the element,
  and merges with its branch.
- Served at `/epic-ui/` by the page server (`COMPONENT_SETS`, [page.types.ts](../server/src/page/page.types.ts)),
  and at `/worktrees/<w>/epic-ui/` for a worktree's;  its long address (`/packages/epic-components/...`) redirects
  there.  The top bar's Epic/UI tab opens it.
- In Spell UI's page shape:  the top bar, a side column of every element by group, the page's contents list, the
  theme switch.  The pages load the sets' build of Spell UI's site (`_assets/`, laid over this folder by the page
  server), which loads the epics pack for the live examples.

| Path | What |
| --- | --- |
| `index.html` | the set's home, The Epic Elements:  how they nest |
| `elements/<tag>.html` | one page per element, 31 today |
| `_parts/layout.html` | every page's chrome, written once:  the brand, the side column, the epics pack's `<ui-components>` |
| `_parts/footer.html` | every page's footer |
| `_data/pages.json` | HAND-KEPT:  the side column's groups, the elements with no page, the side column's own links |
| `_data/components.json`, `_data/search.json` | GENERATED, committed:  `yarn site:data` in `packages/epics` |

- A new page:  copy [the template](../../templates/component-set-docs.html), then `yarn site:data` in
  `packages/epics`.  An element added to the pack shows in the side column by itself (under Other, `planned`) once
  the data is rebuilt.
- Links are written as from the page's SERVED address (`/epic-ui/elements/x.html`):  `../../` is the checkout's root
  from an element page.  `doc-links.js` checks them that way (`yarn tsx tools/doc-links.js --check`, in
  `packages/docs`).
- Check a page:  `node tools/check-spell.js ../epic-components/elements/<tag>.html`, in `packages/docs`.
- Comments:  the comment route takes them (`<page>.inbox.json` beside a page, git-ignored), but no bullhorn draws on
  these pages yet:  they load Spell UI's site, not the docs bundle that draws them.
- The epic's write-up and how-to guides stay in the guides:
  [Epic Pages as Components](../../guides/epic-components/epic-components.html),
  [Reviewing an Epic Page](../../guides/epic-components/review.html),
  [The Epic Tool](../../guides/epic-components/tool.html),
  [Epic Page Colours](../../guides/epic-components/colours.html).
