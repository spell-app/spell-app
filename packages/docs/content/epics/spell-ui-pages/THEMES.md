# spell-ui-pages -- themes contract (P6)

Read `BRIEF.md` beside this first, then `packages/ui/docs/theming.md` IN FULL, and `packages/ui/src/styles/themes/classic.css`.

## The contract (every theme agent codes to it)

- One sheet per Fomantic theme:  `packages/ui/src/styles/themes/<name>.css`, everything inside `@layer ui.theme { ... }`.
  Assets (fonts, images) a theme needs:  `packages/ui/src/styles/themes/<name>/`, referenced relatively.
- Fomantic's themes are DELTAS on Fomantic's default look.  Ours equivalent of that default look is the existing
  `classic.css`.  So a Fomantic theme is applied ON TOP of `classic`:  the loader registers `classic` + `<name>`.
  Don't copy classic's tokens into your sheet;  only the theme's own differences.
- Name clash:  Fomantic's own `classic` theme becomes `fomantic-classic.css` (our `classic.css` stays what it is).
- A sheet has two halves, both in `@layer ui.theme`:
  1. TOKENS on `:root` (and `:host` where needed):  Fomantic's `.variables` -> our `--ui-*` globals and
     `--ui-<tag>-*` component tokens (theming.md "Component tokens").  Prefer tokens:  they reach shadow roots by
     inheritance.  Colours as OKLCH, `light-dark()` pairs where it matters (keep dark mode working:  Fomantic had none).
  2. OVERRIDES:  Fomantic's `.overrides` (and any variable that has no token) as CLASS-GRAMMAR rules
     (`.ui.button`, `.ui.menu .item` ...), exactly the class grammar our components render inside their shadow roots
     (look at the component's `UI<Name>.tsx` / `ui-<name>.css` for the real markup and class names).
- Runtime (T1 builds it FIRST, ~30 min;  others code against it):
  `UI.styles.register(name, css, { page: true, shadow: true })` -- `shadow: true` ALSO adopts the sheet into every
  component shadow root (after utilities, before the app stylesheet), so the class-grammar half reaches the
  components.  Re-registering with `""` removes it.  Theme loading helper:  `src/styles/themes/themes.ts` exports
  `ThemeSheets` with a literal `import.meta.glob("./*.css", { query: "?inline", import: "default" })` registry
  (so new sheets need NO registry edit), a list of names, and `apply(name | undefined)` which registers
  `classic` + the theme (or clears both), on the page and in shadow roots.  `dark.css` and `classic.css` are not
  "Fomantic themes" in the list's sense:  T1 decides how they show in the list (document it).
- A header comment per sheet, like `classic.css`'s:  what the theme is, which Fomantic components it touches, what
  was NOT ported and why.
- Not portable (a component we don't have, an override needing markup we don't render):  skip, note it in the
  header, and record a plan-doc caveat `Theme <name>:  <what> not ported`.

## Verify (each agent, for each of its themes)

- A browser test `packages/ui/src/styles/themes/themes.test.ts` (T1 creates it;  others ADD cases -- append, don't
  rewrite):  apply the theme, render the touched components, assert at least one computed style per touched
  component INSIDE the shadow root (e.g. github button background, material button text-transform).
- `yarn ts`, then the theme tests (`yarn vitest run --project browser src/styles/themes` or the package's way),
  in `packages/ui`.  Don't run the whole `yarn review` concurrently with other agents unless last.
- Screenshot one page per theme (Playwright, scratch script in the session scratchpad
  `/private/tmp/claude-501/-Users-owen-www-spell-app-spell-app--claude-worktrees-ui-import/2ae3516d-0bd8-43bf-bea9-0bb84f2b93a2/scratchpad/`),
  showing the touched components, and LOOK at it vs fomantic-ui.com with that theme (their themes page,
  `packages/ui/reference/Fomantic-UI-Docs/server/documents/usage/theming.html.eco`).  You may use the
  docs bundle approach or `yarn dev` (`tools/demo/`), your call.
- Don't commit.  Report:  per theme, what was ported / skipped, test results, caveat ids.
