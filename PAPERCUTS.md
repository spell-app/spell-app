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
- 2026-09-27 · A `TokenFormatter` built on `new P.Tokenizer()` silently formatted nothing:  the bare tokenizer's
  default `whitespacePolicy` is `ALL` (whitespace as TOKENS), while every `Parser`'s -- spell's too -- is
  `LEADING_ONLY` (whitespace on each token's `.whitespace`).  Code that walks tokens only worked for one. ·
  Skip `P.WhitespaceToken`s and measure gaps from the text, so either policy works. · spell/parser
- 2026-09-27 · `console.log()` from inside a vitest test (e.g. to read `SP.spellParser.speedTest()` results)
  printed nothing -- test console output is swallowed. · Write results to a file from the test
  (`fs.appendFileSync`) and read that. · spell/parser
- 2026-09-27 · After adding `monaco-editor`, the ALREADY-RUNNING `vite` dev server served every page as
  `504 (Outdated Optimize Dep)` -- blank app, even after reloads. · Restart `vite` with `--force` after adding
  or removing a dependency. · spell/parser
- 2026-09-27 · oxlint `import(default)`:  "No default export found" on Vite's `import X from "...?worker"`, though
  `tsc` is happy (`vite/client` types it). · `// oxlint-disable-next-line import/default` with a reason. · spell/parser
- 2026-09-27 · Codemod script couldn't `require("typescript")` for an AST:  `typescript` is v7 (native `tsgo`),
  which ships no JS compiler API. · Use `@babel/parser` (already in `node_modules`) with
  `plugins: ["typescript", "decorators"]`. · spell/parser
- 2026-09-27 · `F="a.ts b.ts"; tool $F` passed ONE argument -- zsh doesn't word-split unquoted variables. ·
  Spell paths out, use brace expansion (`rules/{a,b}.ts`), or `${=F}`. · spell/parser
- 2026-09-27 · "Rendered more hooks than during the previous render" in `<InputEditor>`, as soon as the Monaco
  models came in.  `react-easy-state`'s `autoEffect()` quietly becomes a `useEffect()` HOOK when it's called
  during a render -- and `SpellModels.modelFor()` runs during one. · Use `observe()` / `unobserve()` from
  `@nx-js/observer-util` for effects that aren't a component's. · spell/parser
- 2026-09-27 · The app's editor page hung, 100% CPU, stack always in Monaco's `getOffsetAt()`.  A store read
  inside a reaction returns PROXIES;  `setValue()` inside an `observe()` fired `onInputCursor()`, which reached
  the Monaco editor through the store, and Monaco crawled its own internals through a proxy.  Profiler couldn't
  even stop. · Find it with CDP `Debugger.pause` (Playwright `newCDPSession`), sampled a few times.  Keep Monaco
  out of stores, and touch it outside reactions.  See CODE-DEBT "Store proxies". · spell/parser
- 2026-09-27 · Language features answered nothing for other files, though hover worked.  `file.isActive` was
  false:  `project.activeImports`, cached during a render, held PROXIES of the files, and `includes()` missed the
  real one. · `raw()` (now in `~/util`) where identity matters.  See CODE-DEBT "Store proxies". · spell/parser

- 2026-09-28 · `yarn -s build` printed yarn's command list instead of building.  Yarn berry has no `-s`
  (silent) flag. · Plain `yarn build`. · spell/parser
- 2026-09-28 · `npx vitest run -u <one test file>` updated snapshots in OTHER suites too -- it rewrote another
  session's `ScopeExplorer.test.ts.snap`. · After any `-u`, check `git status -- '*.snap'` and restore snapshots
  you didn't mean to touch (`git checkout -- <file>` puts back the staged copy).  CAUSE (found later):  vitest 5's
  `-u [type]` takes an optional value, so `-u <file>` swallows the file as its value and runs EVERY suite.  Put
  the file first:  `vitest run <file> -u`, or `--update=all`. · spell/parser
- 2026-09-28 · A changed vitest snapshot was rewritten to the NEW output instead of failing -- once even with the old
  test names, while the test file had new ones.  Another process (a concurrent session?) seemingly ran vitest with
  `-u` meanwhile.  · Delete the `.snap` and re-run alone, then read what it wrote.  · spell/parser
- 2026-09-28 · Recompiling every `src/examples/*` folder also "compiled" `Todo List`, a leftover of a deleted project
  (just a `.compiled.js`) -- `SpellProject.compile()` quietly created a `project.json` + `Untitled.spell` there.
  · Recompile only folders that have a `project.json`;  check `git status` for `??` files afterwards. · spell/parser
- 2026-09-28 · 27 language-server / snapshot tests failed after a folder move that was fine:  they read the LIVE
  Solitaire example and assert exact line numbers + docstrings, so any edit to its `.spell` files (e.g. from the
  Type Explorer) breaks them. · To tell a real break from that, re-run with `git show HEAD:<file>` content swapped
  in (back up and restore the edited files).  Fixed:  tests now read frozen copies in `src/test/fixtures/`. · spell/parser
- 2026-09-28 · Loading a fixture as a `SpellProject` in a test REWROTE its `project.json`:  the server's index adds
  any unlisted `.js` in the folder as an import, and the new `Solitaire.compiled.snapshot.js` was one. · Snapshot
  files end `.snapshot.js`, which `isManifestFile()` now skips like `.compiled.js`.  Anything else dropped into a
  fixture folder must be in its `project.json`, or skipped there too. · spell/parser
- 2026-09-28 · A throwaway `tsx` script recompiling projects (`SpellProject.compile()` + `installDiskFetch()`) died at
  import with `ReferenceError: __SPELL_VERSION__ is not defined`:  vite defines it, `tsx` doesn't. · Then:  import
  `~/spellVersion.node` first.  Since fixed:  `SP.SPELL_VERSION` is set by hand, and `PACKAGE_VERSION` falls back
  to `"unknown"` without `~/packageVersion.node`. · spell/parser
- 2026-09-29 · A bash loop with `declare -A MAP` + `"${!MAP[@]}"` (less→css conversion diffing) failed with
  `bad substitution`, even though the tool is called "Bash" -- the shell it actually runs is the user's login
  shell (zsh here), and zsh doesn't support that associative-array syntax. · Wrote the name/path pairs to a
  plain `name|value` text file and looped over it with `while IFS='|' read -r`, which is portable. · spell/parser
- 2026-09-29 · `node_modules/.bin/lightningcss` (the CLI) doesn't exist in this repo -- only the `lightningcss`
  npm package (JS API used by Vite) is installed, no `lightningcss-cli`. · Wrote a 20-line `.mjs` using
  `lightningcss`'s `transform()` + `browserslistToTargets()` directly instead of shelling out; had to run it
  from inside the project root (not the scratchpad dir) so Node's module resolution could find `node_modules`.
  · spell/parser
