<!-- bedtime: active -->
# Morning plan:  vite-plus

Plan doc:  `packages/docs/content/epics/vite-plus/vite-plus.html`.  Branch `vite-plus`, worktree `.claude/worktrees/vite-plus`.

## 1. Summary

- All 4 phases done, 0 WIP, 0 skipped.  Branch `vite-plus`, NOT merged.
- Verdict:  adopt.  Every package's checks as on `main`;  `yarn ts` 6.0s -> 3.1s;  tests ~15% faster;  dev/build
  same.  Biggest catch:  `vp run --cache` is unsafe here (I1).
- Durable doc:  `packages/docs/content/vite-plus.html`.
- Commits (`git log --oneline main..HEAD`):
  - `36eae09f` P4:  Doc Review
  - `149549f8` P3:  Rollout
  - `031aea0d` P2:  Measure + Decide
  - `7eea0c8e` format:  oxfmt 0.70 churn (4 files)
  - `ad9e894d` P1:  imports -> `vite-plus/test*`
  - `078b2a76` P1:  Spike Migrate
  - `8dd687d9` plan doc

## 2. Phases

### P1 · Spike Migrate

- `vp migrate --no-interactive --no-agent --no-editor --no-hooks` at the root:  yarn catalog in `.yarnrc.yml`
  (`vite` -> `@voidzero-dev/vite-plus-core@1.0.0`, `vitest` 5.0.1 ...), `vite-plus` dep in every package, scripts
  `oxlint`/`oxfmt`/`vitest` -> `vp lint`/`vp fmt`/`vp test`, 346 files' imports -> `vite-plus/test*`, `.oxlintrc*` /
  `.oxfmtrc.json` folded into `vite.config.ts`.  Its "format" pass changed NOTHING else in source files.
- Broke:  package lint blocks `extends` the deleted `../../.oxlintrc.json`;  dropped every rule comment.  Fixed by J1.
- J1:  lint / fmt settings in ONE root module, `vite.lint.ts` (`lintBase`, `reactLint`, `packageLint()`,
  `rootLint()`, `fmtConfig`), comments restored, spread by the root's and every package's `vite.config.ts`.
  Alternatives:  keep `.oxlintrc.json` as a shared base file (against D8);  duplicate blocks per package (what
  migrate wrote).
- J2:  dropped `options.typeCheck: true` (migrate added it):  `yarn ts` already runs `tsc`;  the old config avoided
  duplicate diagnostics on purpose.  Alternative:  keep it, so `vp check` also type-checks.
- J3:  root `lint` block gets React `overrides` for app/cli/core/lsp/parser/spell/util + package ignores, and
  `.vscode/settings.json` gets `oxc.disableNestedConfig` / `oxc.fmt.disableNestedConfig` (Vite+'s editor setup):
  editor and `vp check` read the root block only.  Verified:  root-only lint still flags cli's `exhaustive-deps`.
  Alternative:  leave nested configs on in the editor.
- J4:  no git hooks (`--no-hooks`), no agent text (`--no-agent`), no editor files (`--no-editor`;  settings
  hand-edited instead).
- J5:  `engines.node` `>=24.11` in all 12 `package.json`s;  CI `node-version: 24`.
- J6:  `yarn oxfmt` / `yarn oxlint` no longer work in a package (migrate dropped them as direct deps;  `yarn vitest`
  still works).  Broke `yarn plan-doc add` (tidy step).  Fixed `packages/docs/tools/pages.js` `tidy()` and
  `packages/docs/AGENTS.md` to `yarn vp fmt`.  Alternative:  re-add both as catalog deps.
- Checks:  per package ts / lint / format:check / test == baseline (same pre-existing failures, nothing new);
  app `build` + `build:element` ok;  `yarn vscode` ok (installed from this branch).  Root `yarn test`:  4 cli 5s
  timeouts under load (pass alone, C7);  app cold-cache failures (pass warm, C6).
- Commits:  `078b2a76` P1 config, `ad9e894d` P1 imports (D7, 380 lines / 331 files).

### P2 · Measure + Decide

- Format churn (Q3):  oxfmt 0.70 vs 0.71 differ on 4 files only (rewraps at the 120-col edge).  `7eea0c8e`.  The
  other 63 files `vp fmt --check .` flags are unformatted on `main` too.
- Lint downgrade (oxlint 1.85):  no new warnings in any package.
- `vp run --cache -r ts`:  0.6s warm vs 6.0s `yarn ts` -- BUT I1:  it replayed "TSC PASSED" with a planted type
  error.  Auto input tracking misses TS 7's native `tsc`.  Unsafe without explicit `cache.input`.
- Tests:  318-345s one package at a time vs 270-276s `vp run -r test` (2 runs each);  cli's 240s suite caps it.
- Verdict D9:  adopt (D6 bar met).  `031aea0d`.

### P3 · Rollout

- Root `ts` / `test:packages` / `review` -> `vp run --fail-if-no-match -F '@spell-app/*' <task>`;  `review` also
  `--concurrency-limit 1`.  `yarn ts` 6.0s -> 3.1s;  fails correctly on a planted type error.
- Root `AGENTS.md`:  new "Toolchain:  Vite+" section.  READMEs:  Node 24.11.
- J7:  `vp run` filtered to `@spell-app/*` (`-r` includes the root, whose all-in-one `test` then ran twice;  a
  filter matching nothing exits 0, hence `--fail-if-no-match`);  `review` serial (rewrites files, its tests flake
  under load).  Alternatives:  all parallel;  keep `yarn workspaces foreach`.
- J8:  no root `check` script (`vp check` fails on 63 files already unformatted on `main`), no cached tasks (I1).
- Checks:  `yarn test:packages` 262s, all 11 packages ran, only `main`'s cli `serve --headless` failure.  `149549f8`.

### P4 · Doc Review

- `packages/docs/content/vite-plus.html` (check-spell ok, screenshots looked at), docs index;  plan doc:  C1 closed, summary
  rewritten.  Worktree NOT left (bedtime).  `36eae09f`.

## 3. Problems

- Baseline (untouched `main` toolchain, in the worktree):  `yarn test` 5 failed / 6344 passed, 251s.  Failing
  BEFORE any change:  app browser `runner.browser`, `ConsoleViewer.browser`, `InputEditor.browser` (4, 15s timeouts),
  `spellEditor.browser`;  cli `spell serve --headless`.  App's were a cold vite deps cache:  pass warm.
- Baseline per package (ts / lint / format:check / test, 305s in all), failing BEFORE any change:
  - cli lint:  `TargetPrompt.tsx:72` `react-hooks(exhaustive-deps)` warning;  cli test:  `spell serve --headless`
  - server lint:  unused `oxlint-disable` in `Request.ts:35`
  - docs format:check:  56 files;  spell format:check:  `src/node/environment.ts`
  - solid-element:  no `ts` script (not a failure)

## 4. Decisions

- D1:  vite+ pinned versions across the board
- D2/D4:  Node 24 LTS, via `volta install node@24` (global default);  CI to 24
- D3 (Q3):  oxfmt 0.70 churn as one separate commit
- D5:  all phases;  P4 stops before leaving the worktree / merging
- D6:  adopt bar:  every root script green;  timings don't gate P3
- D7:  rewrite `vitest` imports to `vite-plus/test*` (own commit)
- D8:  fold `.oxlintrc.json` / `.oxfmtrc.json` into `vite.config.ts` `lint` / `fmt` blocks

- I1 (open):  `vp run --cache` replayed "TSC PASSED" with a planted type error -- auto input tracking misses TS 7's
  native `tsc`.  Not used anywhere;  AGENTS.md says never.
- Root `yarn test` on vite-plus:  4 cli 5s timeouts under load (C7);  pass alone.  Suspected flaky, not new.

## 5. Todos for Owen

1. T8:  VS Code format-on-save:  save a `.ts` file -- no semicolons appearing?  (Oxc extension must read the root
   `vite.config.ts` `fmt` block now.)
2. T12:  merge `vite-plus` into `main` (`/isolate done`), then `yarn install` + `yarn vscode` from `main`.
   NOTE: Node 24 is now your volta default (D4).
3. T11:  format the 63 files `main` leaves unformatted, then add a root `check` script (`vp check`).
4. Review the judgement calls:  T1, T3-T7, T9, T10 (J1-J8 above).
