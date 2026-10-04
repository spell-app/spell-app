# P4 / P5 -- page agent instructions

You write Spell UI doc pages for epic `spell-ui-pages`.  Worktree
`/Users/owen/www/spell-app/spell-app/.claude/worktrees/spell-ui-pages`.  Owen is asleep:  never ask;  decide,
record, go on.  Don't commit.  11 other page agents work in parallel, each on its own pages.

Read IN FULL first, in this order:
1. `packages/docs/epics/spell-ui-pages/BRIEF.md`
2. `packages/docs/epics/spell-ui-pages/PAGES.md` -- THE authoring guide (skeleton, translation rules, tabs,
   examples, gaps, checks).  Follow it exactly.
3. The pilot `packages/ui/site/components/ui-button.html` -- the model page.  Match its structure and quality.
4. `packages/ui/AGENTS.md` (component rules), and skim the plan doc's issues I1-I27 (known gaps + workarounds) in
   `packages/docs/epics/spell-ui-pages/spell-ui-pages.plan.html`, so you don't re-record them.

Per page:
- `yarn site:new <tag>` (in `packages/ui`) makes it from the template.
- Sources:  the Fomantic page (plan doc 1.3 "Fomantic page map";
  `packages/ui/reference/Fomantic-UI-Docs/server/documents/<group>/<name>.html.eco`), our family's vocabulary
  (`packages/ui/src/components/ui-<name>/*.vocabulary.en.ts`), its `examples/elements/*.html` (our element markup,
  known to work), and the OLD Astro page `packages/ui/site/src/content/components/ui-<name>.mdx` (what our docs
  already say:  keep every fact that is still true, especially for our-only components and the Usage tab).
- EVERY Fomantic example our widget can render goes in, as `<ui-docs-example>`, with Fomantic's header and text
  (adapted to our attribute names).  One it can't = a gap issue (`Gap:  <ui-tag> <what>`, from the WORKTREE ROOT:
  `yarn plan-doc add spell-ui-pages issue ...`) unless it's already recorded, plus the page note PAGES.md describes.
  A Fomantic feature we DELIBERATELY don't have (jQuery settings, `.ui.ignored` doc-only boxes ...):  skip quietly
  or a one-line note.
- Our-only families (no Fomantic page) keep the old mdx content, restyled the same way.
- Sub-tags of a family (`ui-buttons`, `ui-or` ...) live on the main tag's page (the API tab covers them).
- Check each page with `yarn site:check <tag>` (in `packages/ui`) until it's clean, and LOOK at the desktop and
  phone screenshots it writes.  Compare at least one page of yours with fomantic-ui.com's (Chrome or a Playwright
  screenshot).
- A widget bug fix is allowed only if < ~15 min and local to that widget (then run that family's tests);  else gap.
- NEVER run `yarn site:build`, `yarn review`, `yarn test:visual` (the lead does, once).  NEVER edit
  `packages/ui/site/_assets/` (generated), the template, `PAGES.md`, `_parts/`, or another agent's pages.  A
  template / shell problem:  record an issue and work around it on your page.

Report (under 250 words):  pages done, examples per page, gaps recorded (ids), widget fixes made (files), pages
with problems.
