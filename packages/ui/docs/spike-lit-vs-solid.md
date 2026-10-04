# Lit vs Solid: the two spikes side by side

> NOTE (2026-09-29):  the Solid spike is now the package (`src/`, `packages/solid-element/`, `tools/`;  status in
> `docs/report.md`).  `spike/` is gone;  the paths below refer to git tag `archive/spikes`.

**Decision (Owen, 2026-09-30):  Solid 2.**  The Lit spike is archived at git tag `archive/lit-spike` (`git checkout archive/lit-spike -- spike/lit` restores it);  `spike/lit/REPORT.md` there is the full Lit report.

Both spikes build the same eight families (`button`, `dropdown`, `icon`, `label`, 13 content `parts`, `divider`, `segment`, `container`) on the same foundation (`src/`), CSS, vocabularies and native fallbacks, and are measured, smoke-tested and reported by the same tools (`spike/shared/`).  Full reports, with identical sections and generated tables:  `spike/lit/REPORT.md`, `spike/solid/REPORT.md`.  Numbers as of 2026-09-30.

- Lit spike:  Lit 3.3.3, standard decorators.
- Solid spike:  Solid 2.0.0-rc.11 on `@spell-app/solid-element` (`spike/solid-element/`), our fork of `@solidjs/element` + `component-register` that fixes 22 reproduced bugs and could go upstream (`spike/solid-element/UPSTREAM.md`).
- Both are packaged as a SHARED RUNTIME:  the base library is a peer dependency (external), our code splits into a `core` entry (every family), a `forms` entry (form controls only) and one small entry per family.

## Size (min + gzip level 9, kB)

| | Lit | Solid |
|---|--:|--:|
| library, as used by the components | 7.51 | 26.65 |
| core | 14.12 | 14.63 |
| forms (dropdown only, so far) | 6.37 | 6.36 |
| own, all 8 families | 69.95 | 71.11 |
| **plain page with one button** (library + core + button) | **33.15** | 53.07 |
| **plain page with all families** | **93.97** | 118.75 |
| app already ships the component library's base library | 86.45 | 92.09 |
| **spell app on Solid 2** (Lit components still need Lit;  Solid components use the app's Solid) | **93.97** | **92.09** |

- Per family, our own code costs the same on both (button 11.5 vs 11.8, dropdown 15.7 vs 17.1, parts 11.7 vs 14.3);  the base library is the whole difference on a plain page.
- **In the spell app the two are a wash** (94.0 vs 92.1):  the app pays for Solid anyway, so Solid components add nothing for it, while Lit components add Lit.
- Standalone builds (library bundled into each family) for reference:  one button 27.4 (Lit) / 41.4 (Solid), all families 90.8 / 114.3.  Sharing costs a plain one-button page a little and saves on pages with several families or an app that ships the library.
- The import-map pages vendor only the used Lit bindings;  the Solid pages still vendor all of Solid (59.6 kB), because the Solid 2 host page's identity probe imports everything (fixable, see the Solid report's Risks).

## Everything else

| | Lit | Solid |
|---|---|---|
| Per keystroke, 1000 options, production (avg / max ms) | 1.3 / 5.1 | 1.3 / 4.0 |
| First open, 1000 rows, production (ms) | 14.2 | 19.4 |
| Hosts (vanilla, React 19, Vue 3, Solid 2 app) | all pass | all pass |
| Solid 2 app shares one runtime with the components, app context reaches a component | n/a | **yes** (identity + context checks pass) |
| Compatibility checks | a second Lit copy loaded by URL works | a Solid 1.9 host alongside our Solid 2 works (no context, as expected) |
| Forms (`formAssociated`, validity, reset, fieldset) | native | native, via the fork's options and hooks |
| SSR / Declarative Shadow DOM | real (`@lit-labs/ssr`) | DIY string render;  the fork adopts a declarative root, no hydration |
| Error isolation + native fallback | per element;  all 7 shared fallback cases pass | per element (fork boundary);  all 7 pass |
| Translation hook | works | works |
| Element core LOC (lines / code) | 1301 / 700 | 1592 / 845 (was 1599 / 868 before the fork;  the fork itself is 693 code lines) |
| Tests | 163 | 283 (+108 in the fork) |
| Dependency risk | stable;  SSR is a Labs package | Solid 2 is an RC;  we now own the element layer (the fork) |

## Reading

- **Size no longer decides it for the spell app.**  On a plain page Lit is 20–25 kB lighter, all of it Solid's runtime.  Inside a Solid 2 app, where these components will mostly live, the totals are equal.
- **What Solid buys in the spell app:**  one reactive system end to end.  The Solid 2 host page proves the app and the components share one `solid-js`, app context reaches components, and app signals drive component props with no glue.  Component authors and app authors follow the same rules.
- **What Lit buys:**  fewer rules for component authors (no eager-memo / owned-scope traps), native SSR, and no element layer of our own to maintain.
- **The fork changed the Solid picture.**  The 22 bugs and workarounds are gone from the spike, the page-wide halt is gone (per-element boundary + native fallback), and the remaining cost is ownership:  ~700 lines we maintain until (if) upstream takes the patches.
- **Performance is a tie** at this scale;  Lit opens a 1000-row menu about 5 ms faster.

## Recommendation

If spell's own app is Solid 2 (it is), **Solid** is now the better system for spell:  same size inside the app, one runtime and one mental model, context and signals flowing into components.  **Lit** remains the better choice only if `@spell-app/ui` must serve non-Solid pages first, or if we don't want to own the element layer.

Either way, before building more families:
- decide whether to send the fork's patches upstream (`spike/solid-element/UPSTREAM.md`), which lowers the ownership risk
- adopt one-module-per-icon loading (`docs/icons.md`, "Loading strategies")
- fix the palette contrast debt (`agents/CODE-DEBT.md`)

## Appendix: history

- **Milestone 0** (button + dropdown, library bundled into every widget):  Lit 27.3 / 47.9 kB vs Solid 47.7 / 70.1 kB;  Solid's `component-register` needed ~40 lines of workarounds for forms and three attribute quirks, and one uncaught error halted every Solid element on the page.  Those "alone" numbers were later found to be wrong:  Vite merged every entry into each "alone" build.
- **Batch 1** (six more families):  Solid added a per-element error boundary (+1.4 kB);  both spikes hit the same six foundation bugs, since fixed.
- **Shared runtime** (this round):  peers externalized, `core` + `forms` entries, one measuring tool and report template for both, the Solid fork, native fallbacks.
