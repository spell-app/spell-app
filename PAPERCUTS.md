# Papercuts

Log of things that slowed down development. Date · symptom · fix · project.

- 2026-09-19 · Browser-only React error (hook-order warning) couldn't be diagnosed from the terminal — no
  browser/console access, and no playwright/puppeteer in the repo, so the real stack trace was invisible and
  static reading of the component turned up nothing. · Drove headless Chrome directly over CDP from a ~90-line
  Node script (`--headless=new --remote-debugging-port`, `PUT /json/new?<url>`, then Node 22's built-in global
  `WebSocket` + `Runtime.enable` to capture `Runtime.consoleAPICalled` / `Runtime.exceptionThrown` with
  `stackTrace.callFrames`). No dependencies needed. Gave the exact frame within a minute. · spell/parser
- 2026-09-19 · Upgraded `semantic-ui-react` and browser-tested it green — against the OLD version. A
  long-running `vite` dev server keeps serving its already-optimized `node_modules/.vite/deps` bundle,
  so a dependency version change is invisible to the browser and every check passes misleadingly. ·
  Assert the version in the page before trusting a result (`typeof SUI.Visibility` told us v2 vs v3),
  and re-verify against a server started with `vite --force`. Restart the dev server after ANY
  dependency change. · spell/parser
- 2026-09-20 · Type-checking one scratch file with `npx tsc --noEmit some/file.ts` dies with `TS5112:
  tsconfig.json is present but will not be loaded if files are specified on commandline`. · Pass
  `--ignoreConfig` plus the flags you need (`--strict --target es2022 --skipLibCheck`). NOTE: globals from
  `src/app.d.ts` (`Prettify`, `SplitString`, `Class`) are NOT available that way -- inline them. · spell/parser
- 2026-09-20 · `yarn format:check` fails on a clean checkout: `package.json` is not oxfmt-clean, so
  the check can't tell you whether YOUR change is formatted. · Unfixed -- compare against
  `git stash; oxfmt --check .` or run `oxfmt --check src`. · spell/parser
- 2026-09-20 · Rule `name` / `precedence` / `testRule` as accessors over a private `#meta` made parsing ~20% slower
  (83ms => 99ms for `spellParser.testRules()`); `Object.freeze()` cost nothing. · Keep anything read while parsing
  as a plain field;  accessors only for cold descriptive props.  Also: `parser.clone()` runs per scope and clones
  every `Group`, so `Choice.clone()` / `Rule` constructor are HOT.  Measure with a throwaway vitest file which
  loops `spellParser.testRules(undefined, false)` and prints the median. · spell/parser
- 2026-09-20 · Standard (stage 3) decorators die with a bare `SyntaxError: Invalid or unexpected token` under vitest
  and would ship raw `@` syntax in the prod build: Vite 8 transforms TS with oxc, which only lowers LEGACY
  decorators, and neither Node 22 nor browsers run them natively.  `tsc`, `oxlint`, `oxfmt` and `tsx` (esbuild
  0.25) are all fine, so the type-check passes and misleads you. · FIXED same day by `vite.decorators.ts`: `enforce: "pre"`
  plugin in BOTH `vite.config.ts` and `vitest.config.ts` running `esbuild.transform(code, { loader: "ts",
  target: "es2022", keepNames: true })` -- verified working.  Probably why `@derived` is commented out in
  `util/extend.ts`. · spell/parser
- 2026-09-20 · A rule module's embedded `tests` only run if a sibling `<module>.test.ts` calls
  `unitTestModuleRules()` -- `draw.ts` had none, so a failing test sat unnoticed.  · Added `draw.test.ts`.
  TODO: a test which fails if any `SpellParser` module has testable rules but no test file. · spell/parser
- 2026-09-20 · NEVER `git stash` to "check how it was on HEAD" while background agents are editing the same working
  tree -- it yanks their files out from under them mid-edit. · Use `git show HEAD:path` or a `git worktree`. · spell/parser
- 2026-09-27 · `console.log` from rule constructors (module-eval time) mostly never shows in `vitest run` output --
  a temporary probe printed only a handful of test-fixture rules, none of the spell ones. · Probe with
  `require("fs").appendFileSync("<scratch>/probe.txt", ...)` instead, then read the file. · spell/parser
- 2026-09-27 · Ran `npx prettier --write` on two files -- this repo formats with OXFMT (`yarn format`), and prettier's
  80-col / semicolon style reflowed them;  oxfmt then kept prettier's multi-line object breaks. · Use `npx oxfmt <files>`;
  to undo, rebuild from `git show HEAD:<file>` rather than hoping oxfmt reverts it. · spell/parser
- 2026-09-27 · `console.log` inside a TEST body also vanished from `npx vitest run <file> --silent=false` with the
  default reporter -- first run printed nothing, looked like the probe didn't execute. · Add `--reporter=verbose`
  (or write to a scratch file, as above). · spell/parser
- 2026-09-27 · "Type errors" in `SpellLanguageServer.ts` in the editor, but `tsc` (TS 7) AND the editor's own TS 6 build
  both passed clean.  They were oxlint's TYPE-AWARE rules (`typescript(no-floating-promises)`), which the Oxc extension
  shows as red squiggles just like tsc. · Run `npx oxlint src/<path>` before hunting TS versions.  Dropped
  `connection.sendDiagnostics()` / `sendNotification()` promises need `.catch()` or `await`. · spell/parser
