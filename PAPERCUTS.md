# Papercuts

Log of things that slowed down development. Date · symptom · fix · project.

One section per package, oldest first.  Entries before 2026-09-30 are from when each package was its own repo
(`spell` was `parser`).  Check here first when tooling fails mysteriously.

## spell

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
- 2026-09-29 · `yarn ts` printed `<< TSC PASSED` right after a real `error TS2552` -- the script chains its
  steps with `;`, so it prints "passed" whatever `tsc` exits with. · Read `tsc`'s output (or check `$?` of
  `yarn tsc`), not the banner.  Fixed:  `ts`, `lint`, `lint:fix`, `format`, `test` and `review` now chain with `&&`. · spell/parser
- 2026-09-29 · `<spell-app>` threw `Invalid URL` everywhere:  vite rewrites `new URL(".", import.meta.url)` as
  an ASSET reference, and inlined `"."` as a base64 `data:` URL of the folder's `index.ts`. · Take the folder
  from `import.meta.url` as a string instead:  `url.slice(0, url.lastIndexOf("/") + 1)`. · spell/parser
- 2026-09-29 · `runner.js` and `spell-runtime.js` wouldn't load:  `SyntaxError: Unexpected reserved word`.
  `await import(await link(...))` -- vite wraps dynamic `import()` in `preload(() => import(...))` for module
  preloading, which moved the inner `await` into a NON-async arrow.  Broke the VS Code runner silently:  it
  built and installed fine. · Work out the URL first, then `import()` it.  `element.build.test.ts` now runs
  `node --check` on every built bundle. · spell/parser
- 2026-09-30 · A runner crash showed only "Minified React error #301", with a stack of React internals -- even from
  `vite build -c vite.element.config.ts --mode development --minify false`, which un-minifies OUR code but still
  bundles React's production build.  · Decode the number (#301 = a component updated itself mid-render), then
  bisect by what the render reads.  Drive the demo headless with Playwright:  a script in the scratchpad must
  import it by path, `/Users/owen/www/spell/parser/node_modules/playwright/index.mjs` -- bare `"playwright"`
  won't resolve outside the repo.  · spell/parser
- 2026-09-30 · `<spell-editor>`'s Monaco said "Could not create web worker(s)", with a 404:  vite's `?worker`
  compiles to `new Worker("/spell-editor-editor.worker.js")` -- from the page's ROOT -- under the default
  `base: "/"`. · `base: "./"` in `vite.editor.config.ts`, so it's `new URL(..., import.meta.url)`, beside the
  bundle. · spell/parser
- 2026-09-30 · A rolldown `codeSplitting` group to name Monaco's chunk (`test: /monaco-editor|app\/ui\/monaco/`)
  took the PARSER too -- a group takes its modules' dependencies by default -- so the 8 KB entry imported the
  "lazy" 5 MB chunk statically.  Built fine. · Drop the group:  a dynamic `import()` splits on its own, named for
  the module.  Look at the ENTRY's imports, not just its size;  `element.build.test.ts` now pins it. · spell/parser
- 2026-09-30 · Monaco's hover never showed inside a shadow root -- completion, menus and keyboard hover
  (Cmd+K Cmd+I) all did.  Monaco's `mousemove` listener on `document` sees a shadow root's HOST as the target,
  so it fired "mouse left" after every move. · Found by wrapping the hover controller's methods live, in
  Playwright, through the loaded chunk (`import("/element/spell-editor-monaco.js")`) -- each show was followed by
  `_onEditorMouseLeave`.  Stop the editor's mouse moves at the shadow root:  see `keepMouseMovesInShadowRoot()`. ·
  spell/parser
- 2026-09-30 · `WebFetch` / `curl` of https://www.solidjs.com/blog returns an empty shell:  the site is a
  client-rendered SPA, so the post list and bodies aren't in the HTML. · Download the entry bundle
  (`/assets/index-*.js`), find each post's `slug:{title,date,body:()=>import("./<slug>-<hash>.js")}` entry, then
  fetch that chunk and pull the text out of its compiled-MDX string literals.  For v2.solidjs.com, the docs are
  markdown at `v2.solidjs.com/llms-full.txt`. · spell/parser
- 2026-09-30 · A Solid 2 prototype died with `[REACTIVITY_HALTED] TypeError: r is not a function`, and every
  later update was ignored. · An effect's apply function RETURNS its cleanup:  `v => list.push(v)` returned a
  number, which Solid then called.  Write `v => { ... }`.  See `packages/docs/solid/solid-2.html#effect-apply-returns-its-cleanup`. · spell/parser
- 2026-09-30 · A skill using `` !`cat file` `` context injection failed to load AT ALL (zero turns, only
  `Shell command permission check failed ... Permission to use Bash has been denied`) in a session with Bash
  denied.  `allowed-tools: Bash(cat ...)` in the skill's frontmatter does not override the denial. · Don't inject docs
  with `!`.  Either `@`-import them from `AGENTS.md` (always loaded, recursive through `CLAUDE.md`'s `@AGENTS.md`;
  NOT loaded for Explore subagents), or -- what we do for Solid -- a conditional "if working with X, READ file" line at
  the top of `AGENTS.md` plus a skill whose body says to Read it. ·
  spell/parser
- 2026-09-30 · A regex-based HTML pass (`<a\b.*?</a>`) wrapped already-linked `<code>` in a SECOND link -- 7 nested
  links shipped, and the link check passed.  oxfmt wraps long tags, so closing tags come out as `</a\n  >`. · Allow
  whitespace before `>` in every closing-tag pattern (`</a\s*>`), and make the checker count nested links:  both done
  in `scripts/doc-links.py`.  Re-run a transform after `oxfmt` and diff to prove it's idempotent. · spell/parser
- 2026-09-30 · Bundling `../ui/dist/index.js` with esbuild for the `.html` docs:  every `ui-*` element failed
  with `NoOwnerError`.  The fork (`../ui/packages/solid-element`) has its OWN `node_modules/solid-js` and
  `@solidjs/*`, so a naive bundle carries two Solids. · Resolve every `solid-js` / `@solidjs/*` /
  `@spell/solid-element` import from UI's root (`packages/docs/scripts/bundle-spell-ui.js` does, and fails the build if a
  Solid package appears twice).  Also:  UI's `yarn build` doesn't rebuild the fork -- run `yarn fork:build` first. ·
  spell/parser
- 2026-09-30 · A throwaway `tsx` script outside the repo (or a `.ts` one outside `src/`) died at import with
  `TypeError: Class extends value undefined` in `rulex.ts`:  with no `"type": "module"` above it, tsx compiles it as
  CommonJS, and that load order trips the `~/parser` circular-import trap (`CODE-DEBT.md`). · Name the script `.mts`
  and run `npx tsx --tsconfig tsconfig.json <script>` from the repo root -- see
  `docs/precedence/experiments/grammar-today.mts`. · spell/parser
- 2026-09-30 · `node_modules/.bin/tsc --noEmit some-file.ts` refused to run:  `TS5112: tsconfig.json is present but
  will not be loaded if files are specified on commandline`.  TypeScript 7 treats that as an error. · Add
  `--ignoreConfig` when checking one loose file -- see `docs/precedence/experiments/typescript-check.ts`. ·
  spell/parser

- 2026-09-30 · An agent started with `isolation: "worktree"` got a worktree of the OLD `parser` repo, not the
  monorepo:  the worktree comes from the repo the Claude session was STARTED in, whatever folder the work is in.
  It wrote its files to the scratchpad instead, and they were copied in by hand. · Start Claude sessions in
  `~/www/spell-app/spell`;  from a session started elsewhere, run agents without worktree isolation, one at a
  time. · monorepo
- 2026-09-30 · `tsconfig` `paths` using `${configDir}` (so one base table could hold each package's own `~/*`)
  pass `tsc`, but `tsx` can't use them:  4.20.3 throws `Non-relative paths are not allowed when 'baseUrl' is not
  set`, 4.23.15 silently resolves nothing. · Fixed paths only, in the root `tsconfig.base.json`. · monorepo
- 2026-09-30 · Under `tsx` 4.23 (ui's), `import "~/packageVersion.node"` fails with `Cannot find package '~'`, while
  `~/util` and `~/y.foo` resolve:  it won't add `.ts` to a specifier ending in `.node` (Node's native-addon
  extension).  4.20.3 (spell's) is fine. · Use spell's `tsx`, or write `~/packageVersion.node.ts`.  MUST fix
  before unifying `tsx` versions. · spell
- 2026-09-30 · In a fresh checkout / worktree, `yarn lint` (so `yarn review`) in `packages/spell` fails with
  `vscode-extension/tsconfig.json: Cannot find type definition file for 'vscode'`:  the extension is its own yarn
  project and nothing has installed its `node_modules`. · `yarn vscode:build` once (installs it, builds the
  extension and the runner;  does NOT install into VS Code). · spell

- 2026-09-30 · Moving the tests under one root `vitest` run: four tests failed that pass in the package folder.
  They shell out to `npx vite build` and write `.cache/` with paths relative to the process's working directory,
  which is the repo root in a root run. · Give every child process an explicit `cwd` (the package folder, from
  `environment.srcDir`) and resolve files from `import.meta.dirname`, never the bare working directory. ·
  spell, ui
- 2026-10-03 · Importing `$/spell/test` (or anything that loads `src/node/environment.ts`) prints a 15-line
  `{ environment: { vitePort ... testFilesRoot } }` to stderr:  every vitest file using the fixtures, every `tsx`
  experiment.  It buries the output you came for (`grammar-today.mts`, `--silent=false` BENCH runs). ·
  `console.warn({ environment })` at the bottom of `environment.ts`;  not fixed yet -- filter with `grep` meanwhile. ·
  spell

## ui

- 2026-09-28 · `yarn install` with the global yarn (volta, 4.9.2) dies in the fetch step:
  `ENOENT ... lstat '/node_modules/typescript/lib/_tsc.js'` -- yarn's builtin `compat/typescript` patch
  predates TypeScript 7, whose package has no `_tsc.js`. · Pinned the repo to yarn 4.18.0 (as `spell/parser`)
  with `yarn set version 4.18.0` -- `.yarn/releases/` + `yarnPath` in `.yarnrc.yml`. · spell/ui
- 2026-09-28 · yarn 4.18 then refuses `oxfmt@^0.71.0`: `All versions satisfying "^0.71.0" are quarantined`
  (new default minimum release age). · `npmMinimalAgeGate: 0` in `.yarnrc.yml`, as `spell/parser`. · spell/ui
- 2026-09-28 · `yarn build` fails loading `vite.config.ts`: `[unplugin-dts] The installed "typescript" package
  does not provide the JavaScript Compiler API (this happens with TypeScript 7+)`.  `vite-plugin-dts` 5 needs
  the TS 6 JS API. · `yarn add -D @typescript/typescript6`, which it falls back to automatically. · spell/ui
- 2026-09-28 · SIDE EFFECT of the above:  `@typescript/typescript6` depends on `typescript@^6`, which the
  node-modules linker hoists as `node_modules/@typescript/old` AND links as `node_modules/.bin/tsc` -- so
  `npx tsc` / `node_modules/.bin/tsc` run TypeScript 6.0.3, not 7. · Always `yarn tsc` (yarn resolves the
  workspace's own `typescript@7`);  package scripts are fine.  Check with `yarn tsc --version`. · spell/ui
- 2026-09-28 · Vite 8 deprecates `build.rollupOptions` (still accepted) in favour of `build.rolldownOptions`;
  `output.keepNames` lives there now. · Use `rolldownOptions` in `vite.config.ts`. · spell/ui
- 2026-09-28 · Vitest 5 browser mode prints `Plugin "vitest:mocks:interceptor" defines Vite-specific hooks
  (configureServer) in a plugin returned from applyToEnvironment. These hooks will be ignored.` on every run.
  Harmless:  it's Vitest's own plugin, tests run fine. · Ignore until Vitest fixes it. · spell/ui
- 2026-09-28 · Vitest 5 browser config shape (changed in v4):  provider is a FACTORY imported from its own
  package -- `import { playwright } from "@vitest/browser-playwright"`, `provider: playwright()` -- not the
  string `"playwright"`, and browsers are `instances: [{ browser: "chromium" }]`, not `name:`.  Test helpers
  import from `vitest/browser`, not `@vitest/browser/context`. · See `vitest.config.ts`. · spell/ui
- 2026-09-28 · Tests under `src/` can't import `test/fixture.ts` without `../../test/fixture`:  the `$` alias
  only covers `src/`, and `AGENTS.md` says NEVER start an import with `../`. · `src/runtime/*.test.ts` use the
  relative path for now;  a `$test/*` alias (tsconfig `paths` + both vite configs) would fix it. · spell/ui
- 2026-09-28 · TypeScript 7's DOM lib has no `CloseWatcher`, and after a failed `instanceof HTMLStyleElement`
  it narrows `HTMLLinkElement | HTMLStyleElement` to `never` (the two are structurally close). · Minimal
  `CloseWatcherLike` type in `runtime.types.ts`;  test `instanceof HTMLLinkElement` first. · spell/ui
- 2026-09-28 · Checking that `load()` code-splits needs a build:  browser-mode tests can't read `dist/`, and a
  scratch `vite.config.ts` outside the repo can't resolve `vite` (`MODULE_NOT_FOUND`). · Drive the Vite JS
  API from a scratch `.mts` with `node --experimental-strip-types` (node 22.17), importing
  `node_modules/vite/dist/node/index.js` and `vite.decorators.ts` by absolute path.  Left as `it.todo` in
  `UIRuntime.test.ts`. · spell/ui
- 2026-09-28 · `oxfmt --check` on a JSON file doesn't just report -- it (like plain `oxfmt`) rewrites the
  file to pretty-printed (2-space) JSON in place;  `.oxfmtrc.json`'s `ignorePatterns` doesn't exclude
  generated data (`src/icons/data/*.json`), so every `yarn review` inflates it by ~4-15% (a long
  `[width, height, path]` tuple explodes across 5 lines past the 120-col print width). · Tuned
  `gen-icons.ts`'s `MAX_CHUNK_BYTES` / `SEARCH_TERMS_CAP` against the POST-format size instead of the
  compact size it first writes -- see `docs/icons.md`'s "A papercut: oxfmt reformats generated JSON". ·
  spell/ui
- 2026-09-28 · `tsc` (whole-project `yarn ts`) fails on an unrelated in-progress file
  (`src/styles/styles.types.ts` -> missing `./styles.vocabulary.en`) from parallel work elsewhere in the
  repo, blocking `yarn review` for everyone until that lands. · Verified `src/icons/` and
  `scripts/gen-icons.ts` independently with a scoped `tsc -p <temp config>` (`types: []`/explicit
  `typeRoots`, `include` limited to this pipeline's files) instead of waiting. · spell/ui
- 2026-09-28 · Tests under `src/` can't reach the shared test utils (`test/fixture.ts`, `test/a11y.ts`) by the
  `$/...` rule:  `$` maps to `src/`, and `AGENTS.md` bans `../` imports. · `OwnerContext.test.ts` renders into
  its own container instead.  Fix:  add a `$test` (or `$/../test`) alias in `tsconfig.json` + `vitest.config.ts`. · spell/ui
- 2026-09-28 · oxlint's type-aware `no-base-to-string` fires on `${value}` / `String(value)` when `value: unknown`
  (e.g. `ClassBuilder` reading a `Record<string, unknown>` bag), even though `restrict-template-expressions`
  is off. · Narrow first (`typeof value === "string" | "number"`), see `ClassBuilder.text()`. · spell/ui
- 2026-09-28 · Vite's default Lightning CSS targets (`baseline-widely-available`) LOWER `light-dark()` in every
  `?inline` / imported sheet into `var(--lightningcss-light, a) var(--lightningcss-dark, b)` plus a
  `@media (prefers-color-scheme)` switch, and add hex + `@supports (color: lab())` fallbacks for OKLCH literals.
  In a custom property the `var()`s substitute where the token is DECLARED (`:root`), so every `.ui-dark` /
  inverted subtree silently keeps the page's scheme. · Needs `css.lightningcss.targets` set to modern browsers
  in `vite.config.ts` AND `vitest.config.ts`, e.g. `{ chrome: 125 << 16, safari: 26 << 16, firefox: 147 << 16 }`
  (verified:  `styles.test.ts` passes 20/20 with it, and its barrel `light-dark()` test is skipped until then). ·
  spell/ui
- 2026-09-28 · `@property` rules inside a shadow root's (adopted) stylesheet are IGNORED in Chromium -- only the
  document registers custom properties. · Register in page-level sheets only;  never rely on a registration
  (or its `initial-value`) inside a component's own CSS. · spell/ui
- 2026-09-28 · A registered `<color>` custom property resolves `light-dark()` where it is DECLARED, so
  `@property --ui-red { syntax: "<color>" }` + `:root { --ui-red: light-dark(a, b) }` freezes `:root`'s scheme
  into `.ui-dark` subtrees (unregistered, the token stream resolves where it is USED). · Register only the
  concrete per-scheme bases (`--ui-red-on-light` / `-on-dark`);  keep `light-dark()` tokens unregistered. · spell/ui
- 2026-09-28 · oxfmt formats `.css` too (prettier style), including generated sheets. · `yarn gen:styles` runs
  oxfmt over its output, and `styles.test.ts` compares generated vs committed CSS with whitespace stripped. · spell/ui
- 2026-09-28 · `scripts/*.ts` sit in no tsconfig, so `yarn ts` never type-checks them. · Added
  `scripts/tsconfig.json` (extends `tsconfig.node.json`, `$` paths, DOM lib);  `yarn gen:styles` runs
  `tsc -p scripts` first.  Consider adding it to `yarn ts`. · spell/ui
- 2026-09-28 · `console.log` inside a Vitest browser-mode test doesn't reach the terminal in this setup, which
  makes quick browser probes awkward. · Throw an `Error` with the values instead, or assert. · spell/ui
- 2026-09-28 · `yarn -s tsx ...` fails with `Unknown Syntax Error: Unsupported option name ("-s")` -- yarn 1's
  silent flag doesn't exist in yarn 4. · Drop `-s`;  redirect output instead. · spell/ui
- 2026-09-29 · Astro 7's MDX ignores `mdx({ remarkPlugins })` (and `markdown.remarkPlugins`):  the default
  Markdown processor is now Sätteri (Rust), which only runs its own `mdastPlugins` / `hastPlugins`;  the
  "ignored" warning is easy to miss in build output. · Wrote the plugin for Sätteri (`defineMdastPlugin` from
  `satteri`) and passed `mdx({ processor: satteri({ mdastPlugins }) })` (`site/astro.config.mjs`). · spell/ui site
- 2026-09-29 · MDX renders text on its own line inside an HTML element (`<p>⏎text⏎</p>`, which oxfmt produces
  on its own for long JSX) as a nested `<p>`:  invalid HTML, and wrong source in `Example`'s "Show code". ·
  `site/src/lib/unwrapHtmlParagraphs.ts` unwraps paragraphs inside lower-case JSX elements. · spell/ui site
- 2026-09-29 · Root `oxfmt .` formats `site/**/*.mdx` as markdown and rewrites a MULTI-line `{/* ... */}` JSX
  comment to `{/_ ... _/}`, which breaks the MDX build (`Unterminated regular expression`).  It also collapses
  double spaces after periods in prose. · Only single-line `{/* */}` or `//` comments attached to the import
  block in MDX (documented in `site/README.md`);  or add `site/**/*.mdx` to `.oxfmtrc.json` `ignorePatterns`. ·
  spell/ui site
- 2026-09-29 · MDX has no bundled `<script>`:  it's JSX, emitted as-is, so `import`s in it fail at build
  (`ReferenceError`).  Component pages can't import `$/components/...` themselves. · `site/src/scripts/
  components.ts` (run by the layout) `import.meta.glob`s `$/components/*/*.ts` and loads the module for each
  undefined `ui-*` tag on the page;  anything more goes in an `.astro` component with a `<script>`. · spell/ui site
- 2026-09-29 · `astro check` (Astro 7.3) refuses TypeScript 7 ("does not currently support TypeScript 7.0"),
  and `@astrojs/check` 0.9 then fails to import with `Cannot find package '@emnapi/runtime'` (a missing peer of
  `@napi-rs/wasm-runtime`), which Astro reports as "not installed" and offers to `yarn add` it again. · `site/`
  pins `typescript@^6` and adds `@emnapi/runtime` + `@emnapi/core` as dev deps. · spell/ui site
- 2026-09-29 · Astro emits the page's own `<link id="ui-app-stylesheet">` BEFORE the bundled foundation
  (`import "$/styles/ui.css"`), so the site sheet's `@layer ui.app` was the first layer named -- the LOWEST. ·
  `site.css` `@import`s `$/styles/layers.css` first (resolved through the `$` alias by Lightning CSS). · spell/ui site
- 2026-09-29 · Astro + rolldown warn `MODULE_LEVEL_DIRECTIVE ... "use astro:head-inject" ... may not be
  preserved` for every content-collection `.mdx`.  Harmless (pages render, styles propagate). · Ignore. · spell/ui site
- 2026-09-29 · Site build warns `INEFFECTIVE_DYNAMIC_IMPORT` for `src/icons/data/aliases.json` /
  `fomantic-aliases.json`:  `Icons.ts`'s template `import(\`./data/${chunk}.json\`)` also matches the two maps
  it imports statically. · Harmless;  a narrower glob in `Icons.#loadChunk` would silence it. · spell/ui
- 2026-09-29 · `yarn dev` in Astro 7 starts the dev server DETACHED and returns;  stop it with
  `yarn astro dev stop` (or `status` / `logs`). · Noted in `site/README.md`. · spell/ui site
- 2026-09-29 · `page.screenshot({ path })` (from `vitest/browser`) to a path outside the repo fails with
  `Access denied to "..." See Vite config documentation for "server.fs"` -- the path goes through Vite's
  dev server, which only serves the project. · Write under the repo (e.g. `.cache/shots/`, which `yarn clean`
  removes) and move the files afterwards. · spell/ui
- 2026-09-29 · Porting a `.less` into the `types, content, variations, states` sublayers:  Fomantic's
  "Content" rules (`.ui.dropdown > .dropdown.icon`, `> .text`, `> .menu`) are BASE rules that its types
  override (`.ui.selection.dropdown > .dropdown.icon { position: absolute }`).  Put in the `content` layer
  they beat every type rule regardless of specificity -- the selection caret stopped being absolute and
  `.label ~ .text { display: none }` stopped working, with no error. · Keep a component's base element
  rules in `types`, ahead of the type rules;  `content` is for parts no type touches. · spell/ui
- 2026-09-29 · A relative selector inside `:is()` (`.ui.dropdown :is(> .text, .menu > .item) > .icon`) is
  invalid -- only `:has()` takes relative selectors -- and the browser silently drops the whole rule
  (lightningcss passes it through). · Spell the alternatives out as separate selectors in the list. · spell/ui
- 2026-09-29 · Root `tsconfig.json` includes `spike/` but has no alias for a spike's own `src/`, so a `$spike/*`
  alias (tsconfig `paths` + Vite) made root `yarn tsc` fail on every spike file -- and two spikes can't share
  one alias name anyway. · `spike/lit` imports its own files relatively (`../../elements`), a deliberate
  exception to the `$`-only import rule;  scripts that need node types start with `/// <reference types="node" />`. · spell/ui spike/lit
- 2026-09-29 · A spike package (own lockfile, own `vitest`) importing `$test/fixture` gets the ROOT copy of
  `vitest` (resolved from `test/`), i.e. a second runner:  `onTestFinished` / `afterEach` register nowhere. ·
  `resolve.dedupe: ["vitest", "axe-core"]` in the spike's Vite config;  also `server.fs.allow: [repo root]`, since
  the spike's lockfile makes Vite treat `spike/lit` as the workspace root. · spell/ui spike/lit
- 2026-09-29 · Lit base-class helper names collide with `HTMLElement` members:  a `part()` method breaks
  `HTMLElement.part` (and then EVERY standard `@property` / `@state` decorator on subclasses fails to type with
  "Unable to resolve signature of property decorator" -- the real error is far away);  `remove()` and a
  `get inert()` shadow DOM API. · Named them `partName()`, `removeValue()`, `locked`.  Check `name in
  HTMLElement.prototype` before naming an element method. · spell/ui spike/lit
- 2026-09-29 · Lit 3.3 `useDefault: true` on a property whose initial value is `undefined` records the FIRST
  real change as the default and swallows it (no update, no reflection). · Only use `useDefault` when the
  constructor sets a non-`undefined` start value (`VocabularyProperties.initialValue()`). · spell/ui spike/lit
- 2026-09-29 · Standard decorators make classes side-effectful, so a barrel re-exporting a decorated class
  (`FormElement`) drags it (and `Validator`) into every chunk that imports the barrel -- even unused. ·
  `"sideEffects"` in the package's `package.json` (as the root has);  button-only cost fell 4.1 KB gzip. · spell/ui spike/lit
- 2026-09-29 · Chromium's `CloseWatcher` GROUPS watchers created without an intervening user activation, so
  a test that opens a second overlay programmatically and presses Escape closes BOTH. · Press a real key
  (`userEvent.keyboard("{ArrowDown}")`) before opening the second overlay. · spell/ui spike/lit
- 2026-09-29 · Contract says "icon svg as FALLBACK content of `<slot name=icon>`", but `ui-button.css` /
  `ui-dropdown.css` size `.icon > svg` and `.icon > ::slotted(svg)`:  fallback content matches neither, so a
  labeled-icon glyph fills its whole block (same for `.text > img` inside the dropdown's `trigger` slot). ·
  Render the svg as a SIBLING of the slot.  Caught only by comparing screenshots with the class-grammar
  fragments. · spell/ui spike/lit
- 2026-09-29 · Solid 2 RC:  ONE uncaught error in any `@solidjs/element` component (a memo reading an
  undefined field) logs `[REACTIVITY_HALTED]` and freezes EVERY Solid element on the page -- later tests
  hung on `ready` until timeout (a 45-test file took 240 s). · Find the FIRST error above the halt;  give the
  browser project a `testTimeout` so a halt fails fast. · spell/ui spike/solid
- 2026-09-29 · Solid 2 memos compute EAGERLY:  a `createMemo` in a base-class constructor that calls an
  overridable method reads subclass fields that don't exist yet (`this.hasIcon is not a function`);  likewise a
  memo field initializer reading a signal assigned in the constructor BODY. · `{ lazy: true }` on base-class
  memos;  declare every signal as a field (`Cell`) above the memos that read it. · spell/ui spike/solid
- 2026-09-29 · `@solidjs/vite-plugin` picks its client / server posture from the `test.environment` of the config
  it was CREATED in, so a vitest project with `environment: "node"` under `extends: true` still gets the browser
  build (`renderToString is not supported in the browser`). · Give that project its own `solid()` instance
  (`spike/solid/vitest.config.ts`). · spell/ui spike/solid
- 2026-09-29 · Vitest stubs CSS imports in node tests, so `?inline` sheets are `""` there (a DSD string came out
  with an empty `<style>`). · `test.css: { include: [/.+/] }` on that project. · spell/ui spike/solid
- 2026-09-29 · A package in a sub-folder (`spike/solid/`) with its own `node_modules`:  `test/fixture.ts` and
  `test/a11y.ts` resolve `vitest` / `axe-core` from the REPO's `node_modules`, a second vitest instance
  (`onTestFinished` has no test).  Also Vite's `server.fs` refuses `../../src` and the first run reloads mid-test
  (`optimized dependencies changed`). · `resolve.dedupe: ["vitest", "axe-core", ...]`, `server.fs.allow: [repo]`,
  `optimizeDeps.include` (`spike/solid/vite.shared.ts`). · spell/ui spike/solid
- 2026-09-29 · `commands.writeFile()` (vitest browser) resolves paths from the PROJECT root, not the test file;
  `../../../x` escaped the repo and hit `server.fs` ("Access denied"). · Write to `.cache/...`. · spell/ui spike/solid
- 2026-09-29 · Root `tsconfig.json` `include`s `spike`, so root `yarn tsc` type-checks `spike/solid/**/*.tsx` without
  its `jsx` / `jsxImportSource` / `$spike` settings:  411 errors. · Spike-local `yarn tsc` is clean;  the root
  should exclude `spike/*` (each spike has its own tsconfig) -- NOT changed, outside the spike's remit. ·
  spell/ui spike/solid
- 2026-09-29 · rolldown (Vite 8.3) warns `advancedChunks option is deprecated, please use codeSplitting instead`;
  same `groups` shape. · `output.codeSplitting: { groups }`. · spell/ui spike/solid
- 2026-09-29 · After the root `tsconfig.json` started excluding `spike`, `spike/lit`'s `yarn ts` failed with
  `TS18003: No inputs were found`:  `exclude` is INHERITED through `extends` and its `../../spike` matches the
  spike's own files. · Override `"exclude": ["node_modules", "dist"]` in `spike/lit/tsconfig.json`. · spell/ui spike/lit
- 2026-09-29 · The root `.oxlintrc.json` ignores `spike/**`, and oxlint resolves `ignorePatterns` against the config
  that declares them, so running the root binary from a spike lints nothing. · `spike/lit/.oxlintrc.json`
  `extends` the root config with its own `ignorePatterns`;  `yarn lint` / `yarn format:check` in `spike/lit`. ·
  spell/ui spike/lit
- 2026-09-29 · Vitest's `cdp()` is typed as an empty `CDPSession` interface (`.send` is a TS error) unless the
  provider's types are loaded. · `/// <reference types="@vitest/browser-playwright" />` in the file that calls it
  (`spike/lit/src/testing/AXTree.ts`). · spell/ui spike/lit
- 2026-09-29 · `lit/static-html.js` discovered mid-run made Vite re-optimize and reload the test page
  ("Vite unexpectedly reloaded a test"). · List every `lit/*` subpath in `optimizeDeps.include`
  (`spike/lit/vite.config.ts`). · spell/ui spike/lit
- 2026-09-29 · Same inherited-`exclude` `TS18003` in `spike/solid` (`yarn tsc --noEmit`). · Override `exclude` in
  `spike/solid/tsconfig.json`. · spell/ui spike/solid
- 2026-09-29 · No lint / format commands in `spike/solid` once the root configs ignore `spike/`;  also oxlint 1.86
  prints NOTHING on a clean run, which looks like "linted nothing". · `spike/solid/.oxlintrc.json` (a copy of the
  root's without the spike ignore) + `yarn oxlint` / `yarn oxfmt --check .` scripts;  checked with a planted
  `debugger`. · spell/ui spike/solid
- 2026-09-29 · `UIElement.define()` with no tag registered a test vocabulary `tag: "stub-card"` as `ui-card`:
  `Vocabulary.define()` derives the tag from prefix + noun, ignoring `vocabulary.tag`. · Pass the tag:
  `define(vocabulary.tag)` (`StubOwner`). · spell/ui spike/solid
- 2026-09-29 · Solid's JSX types have no custom-element tags (`<ui-segment>` in a test's JSX is TS2339). ·
  `<Dynamic component="ui-segment">`. · spell/ui spike/solid
- 2026-09-29 · A test that deliberately lets an error escape Solid (to show the halt) got "Vitest caught 1 unhandled
  error":  the throw resurfaces from Solid's queued microtask flush, outside the test's `try`. · Call `flush()`
  synchronously inside the `try` right after the write (`src/errors/isolation.test.tsx`);  run it LAST in the file,
  since a halt poisons the scheduler for later tests even after `resetErrorHalt()`. · spell/ui spike/solid
- 2026-09-29 · Two spike agents share one scratchpad directory:  screenshot names collided (`label-types.png`). ·
  Solid writes to `spike/solid/.cache/screenshots/` (`yarn screenshots`). · spell/ui spike/solid
- 2026-09-29 · Solid 2 rc.11 `useContext(ctx)` THROWS ("Context must either be created with a default value or a
  value must be provided") when the context was created with `undefined` as its default and no provider is
  above. · Create optional contexts with `null` as the default (`createContext<T | null>(null)`). ·
  spike/solid-element
- 2026-09-29 · A Solid scheduler halt (`[REACTIVITY_HALTED]`) is reported ASYNCHRONOUSLY, so a test reproducing
  it fails the Vitest browser run with an "unhandled error" even inside `try` / `catch` around `flush()`. ·
  Vitest's `error-catcher` only logs when a USER `error` listener exists:  add a `window` `error` listener
  (`preventDefault()`) and keep it up for one task (`setTimeout(0)`);  `resetErrorHalt()` in `afterEach`.  See
  `spike/solid-element/src/errors.test.tsx`. · spike/solid-element
- 2026-09-29 · Solid 2 rc.11 `<For each={strings}>{(item) => …}</For>`:  `item` is the VALUE, not an accessor
  (`item()` throws `item is not a function`). · Use it directly. · spike/solid-element
- 2026-09-29 · Solid 2's `createContext` provider evaluates `children` in a LAZY memo:  a component called from
  a provider's `children` getter runs tracked (re-running whenever a prop read in its body changes) and not at
  all until read. · `untrack()` inside the getter, and read the returned accessor once to run it now.  See
  `spike/solid-element/src/withSolid.ts`. · spike/solid-element
- 2026-09-29 · `vite.build({ configFile, build: { lib: { entry: { button } } } })` does NOT build `button` alone:
  Vite `mergeConfig()`s inline options into the file config and UNIONS `build.lib.entry` objects, so every
  "alone" build in the old `spike/lit/measure.ts` really had all eight entries (inflating batch 1's "alone"
  numbers by up to 4 kB). · Load the file once with `vite.loadConfigFromFile()`, replace `lib.entry` (and
  `external`) yourself, pass `configFile: false` -- `spike/shared/SpikeMeasure.ts`. · spike/shared
- 2026-09-29 · Vite lib mode with entries that import each other (`button.js` => `core.js`) emits every entry as a
  0.1 kB facade re-exporting a hashed chunk (`core.js` => `core-<hash>.js`):  lib mode defaults
  `preserveEntrySignatures` to `strict`. · `rolldownOptions.preserveEntrySignatures: "allow-extension"`. ·
  spike/lit
- 2026-09-29 · A virtual lib entry (`lib.entry: { lit: "virtual:lit" }`) fails `[UNRESOLVED_ENTRY]`:  lib mode
  resolves entries against `root` first, so the plugin's `resolveId` sees `/abs/root/virtual:lit`. · Match the
  marker anywhere in the id (`id.indexOf(VIRTUAL)`) -- `spike/shared/PeerVendor.ts`. · spike/shared
- 2026-09-29 · Tooling in `spike/shared` typed `vite: typeof import("vite")` won't accept a spike's `vite`
  module:  two installs, and vitest augments the spike's `ResolvedConfig` (`Property 'test' is missing`). ·
  Structural `ViteLike` with `build: (config: any) => …`;  call sites write the config `satisfies InlineConfig`. ·
  spike/shared
- 2026-09-29 · Adding a custom tag to Solid 2's JSX:  `declare module "@solidjs/web" { namespace JSX … }` fails
  (`Invalid module name in augmentation`), because `@solidjs/web` only RE-EXPORTS `JSX`. · Augment the defining
  module, `declare module "@solidjs/web/types/jsx.js"` (the package exports `./types/*`) --
  `spike/shared/frameworks/solid/app.tsx`. · spike/shared
- 2026-09-29 · Foundation commit `33b89e5` (icon `style` => `variant`, label `image` string, divider `hidden`
  spacing) broke 4 Lit spike tests + `yarn ts`, unnoticed:  the root `yarn review` doesn't run the spikes. ·
  Adapted the spike;  run a spike's `yarn ts && yarn test` after vocabulary changes while spikes exist. · spike/lit
- 2026-09-29 · `yarn review` stops in `lint:fix` although `src/` is clean:  root `oxlint` walks into
  `spike/*/` and fails on their own configs (`options.typeAware is only supported in the root config, but it
  was found in spike/icons/.oxlintrc.json`;  earlier `no-base-to-string` in `spike/solid-element/src/props.ts`),
  because a nested `.oxlintrc.json` is still parsed despite root `ignorePatterns: ["spike/**"]`. · Lint just
  the package with `yarn oxlint src test`, then run `yarn tsc`, `yarn oxfmt --check src`, `yarn vitest run` by
  hand;  spikes should drop `typeAware` from their own oxlint configs. · spell/ui
- 2026-09-29 · Cache-warm measurements over HTTP/2 with a throwaway certificate:  `fetch()` re-downloaded every
  file on the second visit while `<script type=module>` / CSS `mask` did not (looked like `fetch` "not caching"). ·
  Chromium never writes responses with certificate errors to its HTTP cache (`--ignore-certificate-errors` /
  `ignoreHTTPSErrors` keep the error);  the Blink memory cache still served the other resource types. Launch with
  `--ignore-certificate-errors-spki-list=<sha256 of the public key>` instead -- `spike/icons/TestServer.ts`. ·
  spike/icons
- 2026-09-29 · Playwright `ariaSnapshot()` showed an empty tree for `<x-icon label="...">` whose role / name come from
  `ElementInternals` (and for `display: contents` hosts):  it reads DOM attributes, not Chromium's accessibility
  tree. · Read the real tree over CDP (`Accessibility.getFullAXTree`) -- `spike/icons/test.ts`. · spike/icons
- 2026-09-29 · `page.evaluate(fn)` from a `tsx` script threw `__name is not defined`:  tsx compiles with esbuild
  `keepNames`, which wraps named inner functions in a `__name()` helper the page doesn't have. · `addInitScript("window.__name = (t) => t")`
  -- `spike/icons/test.ts`. · spike/icons
- 2026-09-29 · A LINKED peer (`"@spell/solid-element": "link:../solid-element"`) silently brought a second Solid:
  Vite resolves the symlink to its real path, so the fork's `import "solid-js"` resolved from
  `spike/solid-element/node_modules` -- the vendored `@spell/solid-element.js` carried its own signals runtime
  (65 kB instead of 11), which breaks owner / context sharing with the app. · `resolve.dedupe` on every peer package
  in every build that bundles peers:  the spike's `vite.shared.ts`, `PeerVendor` and `SpikeMeasure`'s `library`
  build (both now dedupe `packageOf()` of each specifier). · spike/solid
- 2026-09-29 · Splitting a lib build into two shared entries (`core`, `forms`):  `dist/core.js` became a facade and
  a hashed `UIElement-<hash>.js` held the element core, because `forms` imported core LEAF files, so Rolldown saw
  modules reached by two independent entries. · Import the shared code through the `core` ENTRY (`./core`) from
  `forms`;  `SpikeMeasure`'s `coreOutsideCore` check now flags it. · spike/solid
- 2026-09-29 · Standalone ("library bundled") sizes doubled (button 41 => 81 kB) after adding the Solid identity
  hook to `core.ts`:  `import * as SolidJs from "solid-js"` stored in a global keeps every export alive, so nothing
  tree-shakes. · Moved the hook to `src/identity.ts`, loaded by the `index` entry only (what the host page
  imports). · spike/solid
- 2026-09-29 · Measuring the peer library "as used" needs the names each chunk imports from `lit` / `solid-js`,
  but Rolldown 1.2.11's `OutputChunk` has no `importedBindings` (Rollup's does), only `imports` (specifiers). ·
  `SpikeMeasure.importedBindings()` parses the emitted `import { a as b } from "x"` statements (Rolldown prints
  them plainly);  `PeerVendor` reuses it on `dist/`. · spell/ui spikes
- 2026-09-29 · `yarn dev` in `spike/solid` dies loading `vite.config.ts`:  `ERR_UNKNOWN_FILE_EXTENSION ".ts" for
  .../spike/solid-element/src/vite.ts`.  Vite 8 bundles a config with EVERY bare import external -- linked
  packages too -- so Node 22.17 imports `@spell/solid-element/vite` itself, and can't load `.ts` (tsx-run scripts
  like `yarn test:hmr` hide it). · The fork builds the plugin to `dist/vite.js` (`vite.node.config.ts`, second
  step of its `yarn build`);  `exports["./vite"].default` points there.  Build the fork once before `yarn dev`. ·
  spike/solid-element
- 2026-09-29 · A `?inline` CSS module's own `import.meta.hot.accept()` never takes:  Vite's `vite:css-analysis`
  resets `isSelfAccepting = false` for `?inline` on every transform, and import analysis skips CSS requests, so
  the module graph never records the accept;  the update climbs to the importers and re-renders them. · The HMR
  plugin sets `mod.isSelfAccepting = true` for its style modules in its `hotUpdate` hook. · spike/solid-element
- 2026-09-29 · Playwright `page.evaluate(fn)` from a tsx-run script throws `ReferenceError: __name is not
  defined`:  tsx compiles with esbuild `keepNames`, which wraps named inner functions (and `const f = () => ...`)
  in `__name(...)`, and that call is serialized into the page. · `page.addInitScript("globalThis.__name = (fn) =>
  fn")` (`test/hmr.e2e.ts`). · spike/solid
- 2026-09-29 · HMR of a component whose vocabulary module re-ran:  `Vocabulary.register(): <ui-button> is already
  registered` -- it accepts the SAME vocabulary object twice ("HMR, double imports" in its docs) but a re-run
  module makes a NEW object. · `HotDefinitions` drops the old entry from `UI.vocabulary.vocabularies` before
  re-defining;  a `Vocabulary.replace()` in `src/` would be cleaner. · spike/solid
- 2026-09-29 · Icons: a bundler-visible pattern (`import(`./data/${x}.json`)`, `new URL(`./glyphs/${x}.js`, import.meta.url)`)
  globs and emits EVERY matching file (search.json, or all 2,163 glyphs) . · `Icons.#loadGlyph()` builds the URL from
  `Icons.glyphBase || import.meta.url` in a getter plus `/* @vite-ignore */`, so no pattern is visible;  verified by a
  scratch `vite build` of `src/icons/index.ts` (no per-icon output).  Supersedes the two earlier icon entries above
  (oxfmt reformatting and `INEFFECTIVE_DYNAMIC_IMPORT`):  `data/` is oxfmt-ignored, glyph loading is not a glob. · spell/ui
- 2026-09-29 · Promoting the Solid spike:  `import { defineConfig } from "vite"` in `vite.config.ts` failed under
  `tsx` (`does not provide an export named 'defineConfig'`) after adding a `tsconfig` `paths` pin
  `"vite": ["./node_modules/vite/dist/node/index.d.ts"]` -- `tsx` honours `paths` at RUNTIME, so `vite` resolved to
  a `.d.ts`.  The pin was there because the fork's HMR plugin, imported from source, types against the fork's OWN
  `vite` install, whose `Plugin` TypeScript won't unify with the root's. · No `paths` pin;  `hotElements()` casts
  the fork's plugin through `unknown` (HACK comment in `vite.config.ts`). · spell/ui
- 2026-09-29 · `src/index.ts` re-exporting `$/styles` (a pure re-export, no entry of its own) made Rolldown put the
  foundation sheets INTO `index.js`, and the lazy `UIRuntime` chunk then imported `./index.js` -- i.e. loading the
  runtime on a button-only page would load every family.  Only visible in the real `dist/` (the measured build has
  no `index` entry). · `styles` is its own lib entry (`dist/styles.js`, `@spell/ui/styles`);  check
  `grep '^import' dist/UIRuntime-*.js` after touching `index.ts`. · spell/ui
- 2026-09-29 · `export * as E from "$/elements"` in `src/index.ts` moves Rolldown's runtime helpers (`__name`,
  `__exportAll`) out of `core.js` into a shared `rolldown-runtime-<hash>.js` that EVERY chunk imports (0.29 kB, one
  more request per page). · Fixed:  the namespaces moved to an `api` entry (`src/api.ts`);  namespacing a barrel
  `core` also reaches (`$/vocabulary`) still split the runtime, so `V` namespaces an api-only re-export
  (`vocabulary.api.ts`), and `api.ts` imports `$/forms` or the `forms` leaves split out of `forms.js` too.
  `yarn measure`'s `runtimeChunks` check guards it. · spell/ui
- 2026-09-29 · Import-map smoke pages failed with `The requested module 'solid-js' does not provide an export
  named 'flush'` once `yarn vendor` tree-shook Solid:  page modules (`perf-adapter.js`, inline `<script>`s) import
  bindings `dist/` never does. · `PeerVendor`'s `usedBy` reads `.html` pages and `.js` modules too;  `cli.ts` lists
  `tools/frameworks`, `tools/smoke`, `tools/demo/fallback.html`. · spell/ui
- 2026-09-29 · Axe `heading-order` exemptions silently stopped matching when the element examples moved from
  `demo/examples/<name>/x.html` to `src/components/ui-<name>/examples/elements/x.html` (`path.endsWith("parts/header.html")`).
  · Match the full tail (`parts/examples/elements/header.html`). · spell/ui
- 2026-09-29 · The docs site's production build drew no icons:  `Icons` fetches `glyphs/<style>/<name>.js` relative
  to its own chunk (`import.meta.url`), and Astro's client chunks live in `_astro/`, where nothing copied the
  glyphs. · `emitGlyphs("_astro/glyphs")` (exported from `vite.config.ts`) in `site/astro.config.mjs`;  client
  builds only. · spell/ui
- 2026-09-29 · Yarn 4 runs no `pre<script>` hooks, so "build the fork before dev / test" can't be a `predev`. ·
  Nothing in dev / test / site / build needs the fork's `dist/` any more (source via the `development` condition,
  an alias in the site, the HMR plugin imported relatively);  `yarn vendor` / `yarn measure` call
  `ForkBuild.ensure()` (install + build when stale). · spell/ui
- 2026-09-29 · A preview server from an earlier session held the Astro preview port:  `yarn site:preview --port
  4399` printed `Preview server already running at http://localhost:4391` and exited. · `astro preview status` /
  use the running one (it serves `site/dist/` from disk, so a rebuild is picked up). · spell/ui
- 2026-09-29 · `yarn site:build` / `yarn site:check` inside `site/` say `Couldn't find a script named
  "site:build"` -- those scripts only exist in the ROOT `package.json` (`site/` has plain `build` / `check`). ·
  Run `yarn site:*` from the repo root, or `yarn build` / `yarn check` from `site/`. · spell/ui
- 2026-09-29 · Astro `<script>` in a `.astro` component: `demo.querySelector<UIDropdown>(...)` fails
  `astro check` (`Type 'UIDropdown' does not satisfy the constraint 'Element'`) and `.options` is typed `{}` --
  the element classes aren't `HTMLElement`s to the site's tsconfig. · Type the query as
  `HTMLElement & { options: unknown[] }` (see `site/src/components/DropdownDemo.astro`). · spell/ui
- 2026-09-29 · MDX attribute `<ui-label image>` (bare boolean) reaches the element as `image="true"` and the browser
  requests `/components/ui-parts/true` (404):  MDX makes bare attributes `="true"`, which is wrong for STRING
  attributes. · Give string attributes a real value in site examples. · spell/ui
- 2026-09-29 · A form layout test failed with every field full width:  Vitest's browser iframe is 414px wide
  by default, so `<ui-form>`'s container query (`@container ui-form (width < 768px)`) stacked the rows, even
  with `style="width: 800px"` on the slotted `<form>` (the CONTAINER is the form's shadow root box, sized by
  the `<ui-form>`'s parent). · Put the width on a WRAPPER around `<ui-form>` in tests. · spell/ui
- 2026-09-29 · `yarn smoke` failed every page with `The requested module '@spell/solid-element' does not provide
  an export named 'onFormAssociated'` after a component started using a fork export no family had used before:
  `vendor/` is tree-shaken to the bindings `dist/` imported LAST time. · `yarn vendor` again before
  `yarn smoke`. · spell/ui
- 2026-09-29 · A test spying `console.warn` never saw the `EFFECT_RELAY_TEAR` that `yarn screenshots` printed:
  Solid 2's relay / tear detectors live in the ATTRIBUTION engine (`@solidjs/signals/attribution`), which only
  runs after `attribution.enable()`, and "info"-severity findings never reach the console. · In the test:
  `attribution.enable()` (from `solid-js/attribution`), `OBSERVE!.diagnostics.capture()` (from `solid-js`), assert
  on `events.stop()` codes, `attribution.disable()` after (`ui-checkbox.test.tsx`). · spell/ui
- 2026-09-29 · A `<ui-menu>`'s items silently stopped updating after `interactive` was toggled -- only when an
  EARLIER test had loaded the runtime.  Chased as a stale memo for an hour. · The fork parents a slotted child's
  reactive root under the owner stamped on its `<slot>`;  a slot re-created by `<Switch>` disposes them.  Create the
  slot once per render and move it (`SUSPECTED-BUGS.md`).  Reproduce ordering bugs with a trivial first test that
  just renders something. · spell/ui
- 2026-09-29 · `UIElement.define()` without a tag registered a test owner (`x-item-owner`) as `ui-item-owner`;
  `customElements.get("x-item-owner")` was `undefined` and every test just saw un-owned items. · Pass the tag:
  `.define(vocabulary.tag)`. · spell/ui
- 2026-09-29 · Rules placed DIRECTLY in `@layer ui.components` (the old `native.css` table block) beat every rule
  in its sublayers (`ui.components.table.*`), silently overriding `ui-table.css`. · Never put rules directly in a
  parent layer that has sublayers;  a rule dump (`Sheets.rules`) found it. · spell/ui
- 2026-09-29 · The Vitest browser viewport is narrower than 768px by default, so static tables / menus render in
  their MOBILE (stacked) layout in CSS tests. · `page.viewport(1000, 800)` in the test (restore on finish), see
  `ui-menu.css.test.ts` `resize()`. · spell/ui
- 2026-09-29 · `getComputedStyle(el, "::before").content` returns the `counters(...)` expression, not the rendered
  number, so list numbering can only be checked by screenshot. · spell/ui
- 2026-09-29 · axe's `aria-required-children` fails a `role=menubar` whose children are focusable custom-element
  hosts:  it can't see `ElementInternals` roles (`role=none`), so a `tabindex` on the host reads as an unknown
  focusable child. · Rove focus over the items' inner boxes (`UIItem.focusTarget`), never the hosts. · spell/ui
- 2026-09-29 · Writing a fork test for owner adoption from a Solid "app":  `<Dynamic component={tag}>` does NOT
  stamp `_$owner` (only compiler-emitted literal custom-element tags and `<slot>`s are stamped), and in Solid 2
  `props.children` isn't a `Node` you can `append()` (the element came out `null`). · A test component that
  `createElement`s the tag, stamps `getOwner()` itself and appends `children(() => props.children).toArray()`
  (`Stamped` in `packages/solid-element/src/owner.test.tsx`). · spell/ui fork
- 2026-09-29 · Vite failed the whole `ui-popup.css` (`[lightningcss] Unexpected token Function("anchored")`):  Lightning
  CSS 1.30 can't parse anchored container queries (`@container anchored(fallback: flip-block)`), though Chrome
  ships them. · Moved those rules to `ui-popup.anchored.css`, imported `?raw` (skips the CSS pipeline, so it MUST be
  self-contained) and adopted as a second sheet (`CODE-DEBT.md`). · spell/ui popup
- 2026-09-29 · A popup anchored to `<ui-icon>` / `<ui-label>` sat at the top of the page:  an `anchor-name` on a
  `display: contents` host names no box, and a tree-scoped name can't reach the host's shadow box. · Anchor such
  targets implicitly:  `showPopover({ source: firstShadowBox })` + `position-anchor: auto` (works across the
  shadow boundary;  checked in a probe). · spell/ui popup
- 2026-09-29 · Removing one of two popups on a target wiped the page's own `aria-describedby`:  the host was already
  detached, so `getRootNode()` returned the host itself, the undo took the element-reflection branch, and setting
  `ariaDescribedByElements = null` REMOVES the content attribute. · The undo is a closure made at add time,
  remembering attribute vs reflection (`AriaRefs` in `UIPopup.tsx`). · spell/ui popup
- 2026-09-29 · A modal reopened right after closing closed itself again:  `<dialog>`'s `close` event is a queued
  task, so the first close's event arrived after the re-open and read as "the browser forced it". · Ignore
  `close` while `dialog.open` (`UIModal.onClose`). · spell/ui modal
- 2026-09-29 · `<button commandfor command="show-modal">` aimed at a custom element dispatches NO `command` event;
  only custom commands (`--show`) reach a non-dialog / non-popover target. · `MODAL_COMMANDS` are `--show` /
  `--close`. · spell/ui modal
- 2026-09-30 · A test expecting Fomantic's `display: inline-block` on a horizontal statistic's label read `block`:
  the label is a FLEX item (the statistic root is `inline-flex`), and flex items are blockified. · Assert what the
  rule really does (the label's start margin). · spell/ui statistic
- 2026-09-30 · Example markup lost its layout silently:  `<ui-segment style="margin-inline: 20em">` does nothing,
  the host is `display: contents` (no box). · Put layout styles on a wrapper `<div>` around the element. · spell/ui rail
- 2026-09-30 · `timeout 600 yarn vitest ...` failed with `command not found: timeout`:  macOS has no GNU `timeout`. ·
  Rely on the tool's own timeout. · spell/ui
- 2026-09-30 · A lazily `import()`ed data file in a family SUB-folder (`src/components/ui-emoji/data/s.json`) matched no
  bucket in `tools/package.config.ts` (the family rule only matches files directly in the family folder), so
  `yarn measure` would have counted it as `core` and failed `coreOutsideCore`. · A `data` bucket (lazy, checked by
  `lazyInEager`, its own row in the report's tier table). · spell/ui emoji
- 2026-09-30 · `sed -i '' 's/"\\u26A1"/.../'` on macOS rewrote the JS `\u` escapes of OTHER strings in the same test
  file into literal characters. · Edit escape sequences with the Edit tool or python, never sed. · spell/ui emoji
- 2026-09-30 · A component's `prefers-reduced-motion` rule setting `transition-duration: 0s` computes as `1e-05s`:
  `reset.css`'s own reduced-motion block wins with `0.01ms !important`. · Assert "under 1 ms", not `0s`. ·
  spell/ui reveal
- 2026-09-30 · `yarn site:build` failed on `popup.mdx` (`Unexpected character after '<', expected a valid JSX tag`) at
  a `<ui-button` whose attributes wrapped onto the next lines and whose text followed a lone `>` line -- though the
  page compiled fine with plain `@mdx-js/mdx`, so a helper's syntax check passed. · Keep an element's opening tag
  on ONE line in site MDX;  check pages with the real `yarn site:build`, not a bare MDX compile. · spell/ui site
- 2026-09-30 · Docs theming snippets that set `--ui-<family>-*` on the host tag did nothing:  each family declares
  its tokens on the shadow box, which beats the inherited value. · Set them through `::part(<root part>)`
  (checked per family in a Playwright probe);  logged in `SUSPECTED-BUGS.md`. · spell/ui site
- 2026-09-30 · A feed example with a `disabled` event failed axe `color-contrast` (faded text), though the card and
  item ones passed:  `$test/a11y` only exempts text under `.ui.disabled`, and a part-less box (`disabled event`) has
  no `ui`. · Render `aria-disabled="true"` on the disabled root (as `<ui-item>` already did):  axe skips text under
  an `aria-disabled` ancestor in the flat tree (`is_disabled`), and assistive tech gets the state too. · spell/ui feed
- 2026-09-30 · `class UIEvent` for `<ui-event>` would shadow the DOM's global `UIEvent` interface for anyone importing
  `* from "@spell/ui"`. · Named the class `UIFeedEvent`;  check a new `UI<Name>` against DOM globals
  (`name in globalThis`). · spell/ui feed
- 2026-09-30 · `yarn oxfmt test/fallback.cases.ts` (a shared wiring file) also rewrapped OTHER agents' new entries
  there. · Harmless (formatting only), but format shared files last, or leave them to the combined `yarn format`. ·
  spell/ui
- 2026-09-30 · Container queries:  in a card group, doubling's `.ui.doubling:is(.four ...).cards` (specificity 0,4,0)
  silently beat stackable's `.ui.stackable.cards` in the same mobile range -- Fomantic hides this with
  `!important`. · `.ui.ui.stackable.cards`;  caught by a static-example CSS test. · spell/ui card
- 2026-09-30 · `<ui-search>`'s no-results message read "No results found." (the DROPDOWN's text), not its own:
  `UI.i18n` keys are global and first-registered wins, and both vocabularies said `noResults`. · Prefix component
  text keys that aren't truly shared (`searchNoResults`);  logged in `SUSPECTED-BUGS.md`. · spell/ui search
- 2026-09-30 · A customizable-select `<option label="...">` rendered EMPTY in the picker (its child spans got no box):
  with `appearance: base-select` the `label` attribute replaces the option's content. · Never set `label` on rich
  options;  the text lives in a `<span class="text">`. · spell/ui select
- 2026-09-30 · A slider drag test dispatched `pointerup`, `pointerdown`, `pointermove` in ONE task and the move went
  to the OLD thumb:  the handler read the `dragging` Cell, whose writes land on a microtask.  (Also:  thumb index `0`
  read through `!!` looked like "not dragging".) · Handlers keep their own state in a plain field (`dragThumb`);
  the Cell only drives rendering and `:state(dragging)`. · spell/ui slider
- 2026-09-30 · A `ResizeObserver`-measured layout (slider label spacing) never showed up after
  `ElementFixture.settle()`:  observers report at the next rendering step, not on a microtask. · `expect.poll()` for
  anything measured by an observer. · spell/ui slider
- 2026-09-30 · A rating test asserting each icon's `<svg>` passed alone and failed in a combined run:  the first
  `Icons.get()` of a glyph is an async module import, so a cold cache renders no `<svg>` yet. · Poll for glyphs
  (`expect.poll`) in element tests. · spell/ui rating
- 2026-09-30 · Stopping an agent (`TaskStop`) did NOT stop the sub-agents it had spawned:  two docs sub-agents kept
  running, putting the session over Owen's agent cap. · Check `ListAgents` after every stop and stop orphans;  briefs
  now say "no subagents". · spell/ui orchestration
- 2026-09-30 · A marker set in a `keydown` capture listener and cleared with `queueMicrotask()` was already gone when
  the next listener (the roving tabindex's) ran:  for a BROWSER-dispatched event, a microtask checkpoint runs after
  every listener returns (only a script's `dispatchEvent()` keeps the stack non-empty). · Never clear it;  check
  `event.eventPhase !== Event.NONE` (still being dispatched) where it's read (`UITabs.onRovingChange()`). · spell/ui tab
- 2026-09-30 · A `tabindex="0"` host with `display: contents` is skipped by Tab:  an element without a box can't take
  focus, so the tabpanel host was unreachable. · The owned pane's host is `display: block` (`ui-tab.css`). · spell/ui tab
- 2026-09-30 · `userEvent.click()` on a `<button aria-disabled="true">` times out ("waiting for element to be ...
  enabled"):  Playwright's actionability check treats `aria-disabled` as disabled. · `element.click()` for that one
  click. · spell/ui tab
- 2026-09-30 · `yarn vitest run src/components/ui-tab` also ran `src/components/ui-table/` (a path filter is a PREFIX match). ·
  End the filter with a slash:  `src/components/ui-tab/`. · spell/ui
- 2026-09-30 · A CSS test of `ui-toast.css`'s 350px compact width failed with 414px:  the Vitest browser viewport is 414px
  wide, so every `@media (max-width: 420px)` phone rule applies in browser tests. · Make width assertions viewport
  aware (`matchMedia(...)`), or test in a fixed-width container. · spell/ui
- 2026-09-30 · `test/fallback.test.tsx` "every family renders its fallback root" failed for `<ui-visibility>` with
  "did the render really fail?":  `ElementFixture.breakRender()` breaks a render through the classes memo, and an
  element with NO class-emitting attribute (and an `extraClasses()` that reads nothing) never recomputes it. · Have
  `extraClasses()` read an attribute (visibility emits `image` for `type="image"`). · spell/ui
- 2026-09-30 · `this.attrs.sameSite` didn't exist for an attribute `samesite` with `property: "sameSite"`:  `attrs`
  keys are the camelCased attribute NAME, `property` only renames the host property. · Use `attrs.samesite`. · spell/ui
- 2026-09-30 · `FILES="a.ts b.ts"; yarn oxlint $FILES` said "No files found to lint", and `oxfmt` silently skipped the
  same list:  the shell is zsh, which does NOT word-split an unquoted `$FILES` (one argument with spaces). · Pass
  paths literally (or `${=FILES}` in zsh). · spell/ui
- 2026-09-30 · `<ui-transition>`'s box (`class="ui transition"`) never animated:  `UI.transitions` resolved at once.
  `animations.css`'s protocol reset `.ui.transition, [data-ui-animation] { --ui-animation-keyframes: none }` is
  (0,2,0) on the class, beating `[data-ui-animation="fade out"]` (0,1,0), so an element that is BOTH got no
  keyframes (and `expectedDuration` 0). · Wrapped the reset in `:where()` (zero specificity). · spell/ui
- 2026-09-30 · A Vitest browser `userEvent.click()` that can't click just times out ("locator.click: Timeout"), with
  the reason hidden. · Wrap it in `try { await userEvent.click(el, { timeout: 2000 }) } catch (e) { ... }` and assert
  on `String(e)`:  the Playwright call log says who intercepts the pointer (here a close icon over a button). · spell/ui
- 2026-09-30 · Focus moved into a just-shown sidebar went nowhere:  the panel's `visibility` TRANSITION (hidden =>
  visible) keeps it `hidden` at progress 0, so nothing inside is focusable in the same task. · Transition
  `visibility` only on the way OUT:  the showing rule sets `visibility 0s`. · spell/ui
- 2026-09-30 · Defining `<ui-shape>` threw `prop "flip" would shadow the element's own "flip"`:  the fork refuses an
  attribute whose property name is a method of the host class (`ShapeHost.flip()`). · Renamed the attribute
  (`direction`). · spell/ui
- 2026-09-30 · `getComputedStyle(el).transform` is `none` for a `display: none` element (percentages need a box),
  so a hidden static flyout's off-screen `translate3d(-100%, ...)` read as untransformed. · Lay it out
  (`display: flex` inline) in the test. · spell/ui
- 2026-09-30 · A modal `<dialog>` (`showModal()`) doesn't cycle Tab:  past its last element focus goes to the
  browser's own UI (the page stays `inert`), so "Tab wraps to the first" tests fail. · Assert the page behind is never
  reached instead;  only `UI.focus.trap()` (non-dialog sidebars) cycles. · spell/ui
- 2026-09-30 · New `.mdx` pages returned HTTP 500 (an empty "Error" page) from a `yarn site:dev` server that had been
  running for hours, while `yarn site:build` built them fine and older pages still served. · Restart it
  (`yarn --cwd site astro dev stop`, then `yarn site:dev`);  suspect a stale content-collection index. · spell/ui site
- 2026-09-30 · Forcing the Temporal POLYFILL in a Chromium test:  `import { Temporal } from "temporal-polyfill"`
  returns the NATIVE `Temporal` whenever `globalThis.Temporal` exists (its `root.js` reads the global at module
  evaluation), so stubbing `UI.browser.supports.temporal` alone still tested native code;  the "forced" entry
  (`temporal-polyfill/implementation`) also imports the full-calendars chunk. · Delete `globalThis.Temporal` inside
  `vi.hoisted()` at the top of a dedicated test file (runs before every import;  each browser test file gets its own
  page), so the flag, `I18n` and the polyfill all see a Temporal-less browser (`ui-calendar.polyfill.test.tsx`). ·
  spell/ui calendar
- 2026-09-30 · TypeScript 7's lib has no `Temporal` types. · Type it from the polyfill's `temporal-spec`
  (`import type { Temporal } from "temporal-polyfill"`, `TemporalAPI` in `runtime.types.ts`). · spell/ui calendar
- 2026-09-30 · A browser test's `commands.writeFile("../.cache/x.txt")` (from `vitest/browser`) fails with `Access
  denied to "/Users/owen/www/spell/.cache/x.txt"` -- the path resolves from the PROJECT ROOT, not the test file. ·
  `commands.writeFile("./.cache/x.txt", ...)`. · spell/ui
- 2026-09-30 · `import.meta.glob("/src/components/*/*.css", { query: "?inline" })` fails the whole test file
  ("Failed to fetch dynamically imported module"):  Lightning CSS rejects `ui-popup.anchored.css`
  (`@container anchored(...)`, see `CODE-DEBT.md`). · Exclude it:  `["/src/components/*/*.css",
  "!**/ui-popup.anchored.css"]`, or glob `?raw`. · spell/ui
- 2026-09-30 · `FILES=$(grep -l ...); perl -pi -e ... $FILES` edits nothing and says `File name too long`:  zsh
  doesn't word-split an unquoted `$FILES`. · Pipe to `xargs`, or `${=FILES}`. · spell/ui
- 2026-09-30 · A docs page's `<ui-toast type="info" icon>` requested `glyphs/solid/true.js` (404):  MDX / Astro render
  a bare JSX attribute on a custom element as `icon="true"`, and `icon` is a STRING attribute (bare = "the type's
  icon"). · Write `icon=""` in site MDX for bare string attributes;  logged in `SUSPECTED-BUGS.md`. · spell/ui site
- 2026-09-30 · A `UI.observeVisibility()` demo on a `<ui-segment>` never logged anything, with no error:  the host is
  `display: contents`, so its rect is all zeros and every check returns early. · Observe an element with a box (a
  plain `<div>`);  logged in `SUSPECTED-BUGS.md`. · spell/ui site
- 2026-09-30 · The `yarn site:dev` server returned HTTP 500 again for a newly added `.mdx` (see the earlier "HTTP 500" entry);
  `astro dev` now daemonizes (`astro dev stop` / `status` / `logs`), so `kill <pid>` then `yarn site:dev` restarts it
  and returns at once. · Restart the server after adding pages. · spell/ui site
- 2026-09-30 · A browser test's `commands.writeFile()` of a ~60MB JSON (computed styles of every example) crashed the
  vitest run with `WS_ERR_UNSUPPORTED_MESSAGE_LENGTH`:  the browser -> node websocket caps one message. · Write one
  file per example (a few MB each), skip pseudo-elements whose `content` is `none`. · spell/ui token conversion
- 2026-09-30 · A browser test that globbed EVERY component sheet (`import.meta.glob("/src/components/*/*.css",
  { query: "?inline" })`) failed to import:  lightningcss can't parse `ui-popup.anchored.css`'s
  `@container anchored(fallback: flip-block)`. · Glob only the families you need (brace list), or `?raw`. · spell/ui
  token conversion
- 2026-09-30 · `yarn oxfmt $PATHS` / `yarn oxlint $PATHS` said "Expected at least one target file" / "No files found
  to lint":  the shell is zsh, which does NOT word-split an unquoted `$PATHS`, so the tools got one bogus path. ·
  Spell the paths out (brace expansion `src/components/{a,b}` works) or use a zsh array. · spell/ui token conversion
- 2026-09-30 · `yarn -s tsx script.ts` printed yarn's whole command list ("Unsupported option name ("-s")"), and
  `timeout 590 yarn ...` said "command not found":  yarn 4 has no `-s` (silent) flag, and macOS ships no `timeout`. ·
  `yarn tsx ...` without `-s`;  bound long runs with the Bash tool's own timeout. · spell/ui token cleanup
- 2026-09-30 · Escape did nothing on a modal `<ui-sidebar>` opened by a CLICK, yet its tests passed:  they switch
  `UI.overlays.useCloseWatcher` off, and a property-opened one worked anyway.  Chromium gives a `show()`n
  (non-modal) `<dialog>` its own close watcher, DISABLED (`closedby` computes to `none`);  created during user
  activation it starts a new close-watcher group, and Escape only reaches the NEWEST group, so an earlier
  `CloseWatcher` never hears it. · Open the dialog / popover BEFORE `UI.overlays.open()`;  test Escape with the
  watcher ON and the overlay opened by `userEvent.click()` (`ui-sidebar.test.tsx`, `flyout` / `dimmer` too). · spell/ui
- 2026-09-30 · Vitest browser `page.screenshot({ path })` to a scratch dir outside the repo fails:  `Access denied
  ... server.fs strict`. · Write it under the repo (a throwaway folder next to the probe test) and delete it after. ·
  spell/ui
- 2026-09-30 · `yarn test:visual --os linux` couldn't start Docker:  `open -a Docker` exits 0 but no Docker process
  ever appears, and `docker desktop start` times out.  `open -W -a Docker --stderr <file>` showed why:  Docker
  Desktop 4.42.1 dies at launch on macOS 26.6 (`SIGSEGV` in `github.com/shoenig/go-m1cpu` init). · Update Docker
  Desktop;  the CLI now fails after 180 s with a pointer to `docs/visual-testing.md` "Troubleshooting".  `linux`
  baselines wait for it. · spell/ui visual
- 2026-09-30 · A visual baseline of an open top flyout was WRONG but stable:  its header border drawn on one 512px
  raster tile and not the next.  Cause:  `page.emulateMedia({ colorScheme })` on an already-loaded page makes
  Chromium repaint only some tiles of a top-layer `<dialog>`;  the stale tile then survives every screenshot. ·
  Load the page fresh per scheme, with the scheme emulated BEFORE `goto()` (`visual.spec.ts`). · spell/ui visual
- 2026-09-30 · After fixing that capture flow the bad baseline stayed:  `--update-snapshots=changed` only rewrites
  a baseline that differs beyond the tolerances, and during `toHaveScreenshot`'s retries a transient frame still
  matched it. · After changing HOW captures are taken, delete the affected baselines and regenerate. · spell/ui
  visual
- 2026-09-30 · `page.evaluate("async ({ a }) => ...", arg)` returned `undefined`:  a STRING page function is
  evaluated as an expression, and a function value isn't called with `arg`. · Build the call as a string,
  `` `(${FN})(${JSON.stringify(arg)})` `` (`visual.spec.ts` `COMPARE`). · spell/ui visual
- 2026-09-30 · Playwright's default screenshot `threshold` (0.2) passed a basic button whose 1px border went 0.05
  OKLCH lightness darker (338 pixels, all "same"). · Measured with Playwright's own comparator
  (`playwright-core/lib/coreBundle.js` `utils.getComparator("image/png")`) and set `threshold: 0.02`
  (`VisualSettings.TOLERANCE`, `docs/visual-testing.md` "Tolerances"). · spell/ui visual
- 2026-09-30 · `vitest` dies loading `vitest.config.ts` with `[PARSE_ERROR] Unexpected token` inside a comment:  the
  doc comment held a glob, `tools/**/*.test.ts`, whose `*/` ends the comment early. · Describe the glob in words
  in `/** */` comments (or use `//`). · spell/ui icon packs
- 2026-09-30 · `node --experimental-strip-types` can't load a tool (`tools/index.ts`):  `ERR_UNSUPPORTED_TYPESCRIPT_SYNTAX
  ... parameter property is not supported in strip-only mode`.  `tsx` and Vite accept it, so nothing else catches
  it. · In `tools/`, declare fields and assign them in the constructor, never `constructor(private readonly x)`.
  · spell/ui icon packs
- 2026-09-30 · `yarn smoke` in `packages/ui` dies with `no vendor/importmap.json:  run yarn vendor first` on a fresh
  checkout, and a stale `vendor/` after a rebuild tests old code. · `yarn vendor` after every `yarn build`, THEN
  `yarn smoke` (its own `vite build` rebuilds `dist/` but not `vendor/`). · ui
- 2026-09-30 · A `vite-plugin-dts` 5.x program rooted in `packages/ui` that reaches `#util` (`packages/util`) fails
  with TS6059 and writes `dist/ui/src/**`;  its `pathsToAliases` then rewrites `$/x` to `../packages/ui/src/x`
  (measured from the layout BEFORE a `beforeWriteFile` move). · `declarations()` in `packages/ui/vite.config.ts`:
  `pathsToAliases: false` and rewrite specifiers there. · ui

- 2026-09-30 · Deleted `nmHoistingLimits: workspaces` from `.yarnrc.yml` and `yarn install` STILL gave every package its
  own `node_modules` (three copies of Solid):  yarn merges `.yarnrc.yml` from every PARENT folder, and this worktree
  sits inside another checkout (`.claude/worktrees/…`) whose rc file still had the limit. · Set `nmHoistingLimits: none`
  explicitly (check: `yarn config get nmHoistingLimits`). · monorepo
- 2026-09-30 · After hoisting, `packages/<x>/node_modules/.bin/tsx` (and `oxfmt`, `tsc`...) no longer exist -- yarn only
  links a package's own `.bin` for what it could NOT hoist -- and `<package>/node_modules/<dep>/package.json` reads
  fail. · Search upward (`NodePackage` in `ui/tools`, `tsxBinary()` in `spell/src/test`, `findTsx()` in the extension,
  `findBinary()` in `to-spell.mjs`);  in shell, `yarn <bin>`. · monorepo
- 2026-09-30 · Hoisting picks ONE `tsx` for the root `node_modules/.bin/tsx`:  `spell` and `cli` pin `4.20.3` EXACTLY
  (4.23 can't import `~/packageVersion.node`), `ui` wants `^4.23.15` and keeps its own nested copy.  Bump either side
  and the root one may flip. · Keep `spell` / `cli` exact;  check `node_modules/.bin/tsx --version` is 4.20.3. · monorepo
- 2026-09-30 · `yarn docs:update` fails at "bundle @spell/ui" with `Cannot read file: packages/ui/dist/glyphs/solid/*.js`:
  `bundle-spell-ui.mjs` still expects `dist/glyphs/`, which `ui`'s build no longer emits (icons moved to
  `dist/icon-packs/`).  Not caused by hoisting. · Fixed:  `packages/docs/scripts/bundle-spell-ui.js` reads its `ICONS` from
  `fa7-free` at build time and `UI.icons.register()`s them, then `reset()`s the packs (a page on `file://` can't load
  one). · docs/ui
- 2026-09-30 · `yarn smoke` in `ui` dies with `no vendor/importmap.json` on a fresh checkout. · `yarn vendor` first. · ui
- 2026-10-01 · `yarn test:hmr` fails (8 cancelled):  `Failed to resolve import "$/ui/elements/HotDefinitions" from
  "src/components/ui-button/ui-button.css?inline"`.  Vite 8's `resolve.tsconfigPaths` only resolves aliases for TS / JS
  importers, and `solidElementHot()` injects that import into the `?inline` sheets too. · `vite.config.ts` injects
  `HotDefinitions` by file path (`${SRC}/elements/HotDefinitions.ts`).  The site's config has an explicit alias table,
  so it was fine. · ui
- 2026-10-01 · `yarn site:build` dies at "Rearranging server assets":  `Named export 'parseCookie' not found. The
  requested module 'cookie' is a CommonJS module`.  Astro 7 inlines its runtime into `site/dist/.prerender/` but leaves
  `cookie` external, and from `dist/` that resolves to the root's hoisted `cookie@0.7.1` (express's), not Astro's
  nested 2.0.1.  `ssr.noExternal` doesn't reach it:  Astro 7 prerenders in its own Vite environment. ·
  `environments.prerender.resolve.noExternal: [..., "cookie"]` in `site/astro.config.mjs`. · ui
- 2026-10-01 · First `yarn test:all` in a while:  92 failures (firefox 35, webkit 52, chromium 5), most keyboard /
  focus tests.  Vitest runs a browser's test files in parallel iframes of ONE page, which has one focus, and firefox
  / webkit hand it to whichever iframe asked last;  WebKit also needs Option+Tab to reach buttons and links. ·
  `fileParallelism: !process.env.UI_TEST_ALL` in `vitest.config.ts`;  `Keys.tab()` (`test/keys.ts`) for Tab in
  tests;  `yarn test:all` now ~10 min. · ui
- 2026-10-01 · `"files": ["dist", "CHANGELOG.md"]` packed `reference/Fomantic-UI/CHANGELOG.md` too:  yarn matches a
  bare name at any depth. · `"/CHANGELOG.md"`, anchored;  check with `yarn pack --dry-run`. · ui
- 2026-10-01 · `timeout 300 yarn tsc` printed nothing:  macOS has no `timeout`, so the shell failed silently. · Use the
  tool's own timeout, or `gtimeout` (coreutils). · ui
- 2026-10-01 · `yarn site:check` (astro check) crashes inside `@volar/kit` before checking anything. · `yarn tsc -p
  site/tsconfig.json --noEmit` type-checks the site instead. · ui
- 2026-10-01 · `<ui-icon class="x">` ignored `position: absolute` and sizing set on the host (the master plan's
  hero icon sat in the text flow).  The host is `display: contents` by design (`ui-icon.css`:  "no box of their
  own"). · Wrap the icon in a `<span>` and position / size the span;  the icon follows its font-size. · goals
- 2026-10-01 · The "UI component creation" Claude panel vanished mid-session right after `code --add <worktree>`:
  turning a single-folder VS Code window into a multi-root one restarts its extensions, Claude Code's included. ·
  Resume it from the panel's past conversations, or `claude --resume <session id>` in the worktree folder.  Avoid it
  by opening the window from a saved `.code-workspace` file, so adding folders later restarts nothing. · ui
- 2026-10-01 · Couldn't open a worktree session (`595c46a7`, started in `.claude/worktrees/ui-component-creation`) in
  the VS Code Claude panel of a window opened on `packages/ui`:  the panel's Session Manager lists only sessions
  saved for the window's OWN folder, its funnel filters only status / tabs, and `code --add <worktree>` doesn't add
  that folder's sessions.  The session's own advice ("reopen it in VS Code's Claude panel") was wrong. · Open a
  window ON the worktree (`code -n <worktree>`), then the extension's link `open
  "vscode://anthropic.claude-code/open?session=<id>"`;  or `cd <worktree> && claude --resume <id>`.  `/worktrees`
  (`~/.claude/skills/worktrees/`) says which session runs where. · ui
- 2026-10-01 · In `dist/` (and the docs' single-file bundle) `.ui-dark` / `<ui-root theme="dark">` changed nothing:
  `light-dark()` was lowered into `--lightningcss-light/-dark` variables, fixed where tokens are declared (`:root`).
  Dev and tests were fine:  `css.lightningcss.targets` (`CSS_TARGETS`) covers transforms, but the BUILD's CSS minify
  reads `build.cssTarget`, which defaulted to an old Safari. · `build.cssTarget` = the same browsers in
  `vite.config.ts`;  `yarn measure`'s `lightDarkLowered` check fails if it comes back. · ui
- 2026-10-01 · `<ui-table stack-by>` as a HOST STATE broke an unrelated WebKit test:  a later table's scroller kept the
  desktop row count after `page.viewport(414, …)`.  Two tries failed the same way:  `:host(:state(x))` setting
  `--_table-stack-by`, and page-sheet `:state(x) > table` rules.  Chromium / Firefox fine. · A private CLASS on the
  table (`stack-by-container`, via `extraClasses()`) instead of a state.  Prove a WebKit-only CSS idea with
  `UI_TEST_ALL=1 npx vitest run --project browser <family>` before building on it. · ui
- 2026-10-01 · Why sessions go missing from the VS Code Claude panel (extension 2.1.287, read from its source):  the
  list shows ONLY sessions filed under the window's FIRST folder, exact path (no subfolders, parents or worktrees;
  extra folders of a multi-root window don't count), and a session's file MOVES with it:  `EnterWorktree` files it
  under the worktree's folder until `ExitWorktree`.  So a session in a worktree vanishes from the window that started
  it, and is orphaned if it never exits.  `code --add` can't help (not the first folder), and the extension's own
  "Create Worktree" opens a NEW window.  `vscode://` links (session open, `yarn plan-doc open`) go to whichever window
  is focused. · Find live ones with `/worktrees`;  open a window whose first folder is the session's folder.  A
  worktree made by a `WorktreeCreate` hook keeps the session filed where it started (verified, CLI 2.1.287, even for
  a session that never leaves its worktree).  FIXED 2026-10-01:  windows from `packages/<pkg>/<pkg>.code-workspace`
  (repo root first), the hook `.claude/hooks/worktree.mjs`, `yarn window add` -- root `AGENTS.md` "Worktrees". · tooling
- 2026-10-01 · On a worktree made by a `WorktreeCreate` hook, `ExitWorktree` `action: "remove"` refuses ("Could not
  verify worktree state ... Refusing to remove without explicit confirmation") and the `WorktreeRemove` hook never
  runs;  with `discard_changes: true` it runs the hook, but Claude leaves the BRANCH (the hook owns it).  The hook's
  stdin is `{ name, cwd, session_id, transcript_path }` -- not the docs' `worktree_path` / `branch`. · Leave with
  `keep`;  the remove hook decides about the branch. · tooling
- 2026-10-01 · Lost the `/isolate doc-template` session (`c0f54984`) again:  its `code --add .` was the window's first
  extra folder, so VS Code restarted its extensions and killed the command (exit 137) and the session with it.  Also,
  built-in `EnterWorktree` (no `WorktreeCreate` hook loaded yet:  the session predated it) branched from
  `origin/main` (`bec84199`), 21 commits behind local `main`. · `cd .claude/worktrees/doc-template && claude --resume
  c0f54984`, then `git merge main` in the worktree.  The hook (`.claude/hooks/worktree.mjs`) branches from local
  `main`, once a session starts with it registered. · tooling
- 2026-10-02 · `yarn site:check` (`astro check`) crashes before checking anything:  `Cannot read properties of undefined (reading 'useCaseSensitiveFileNames')` in `@volar/kit/lib/createChecker.js`, with or without our changes (the repo's TS 7 vs the language server) · not fixed;  `yarn site:build` is the working gate · ui
- 2026-10-02 · `server.ssrLoadModule()` of `$/ui/server` from the repo's dev server threw "Client-only API called on
  the server side" (`ContentPart.tsx`):  `@solidjs/vite-plugin` compiles JSX `dom` even for SSR unless the config is
  in test mode (`mode: "test"`) or the plugin has `ssr: true`.  In test mode it then skips its own
  `ssr.noExternal: ["solid-js", "@solidjs/web"]` (vitest inlines them), so node resolved `solid-js`' imports without
  `development` and mixed dev / prod builds:  "Cannot set properties of undefined (setting 'server')". · A second,
  middleware-mode Vite server with `mode: "test"`, `test: { environment: "node" }` and that `noExternal`
  (`tools/visual/StaticPages.ts`, `yarn test:visual --static`) · ui
- 2026-10-02 · A test-only element defined as `<x-source>` never fired `ui-change` / `ui-load`:  `emit()` names events
  with the TAG's prefix (`ElementDefinition`), so they went out as `x-change`. · Give a test element a `ui-` tag
  (`ui-test-source`) when the test listens for `ui-*` events. · ui
- 2026-10-02 · Defining an element threw `prop "source" would shadow the element's own "source"`:  its host class had a
  PRIVATE getter named `source`.  The fork checks every host member against prop names, private ones too (TS
  `private` is compile-time only). · Name host internals so they can't match an attribute (`controllerApi`). · ui
- 2026-10-02 · Every visual test timed out in WebKit only (`window.visual` never set), not just the new family's:
  WebKit has HTML's new `headingoffset`, so `HTMLElement.prototype.headingOffset` exists there, and the fork refused
  `<ui-markdown>`'s `heading-offset` prop ("would shadow the element's own") -- one bad `define()` stops the whole
  `$/ui` bundle.  Chromium and Firefox have no such property, so unit tests passed. · Name the property something
  else (`property: "headingLevelOffset"`);  a `property` equal to the camelCased name doesn't count as a rename.
  Found by loading the fixture in Playwright's WebKit and logging `pageerror`. · ui
- 2026-10-02 · Playwright screenshots of `yarn dev` (`tools/demo/`) randomly lost the theme just applied, or never
  rendered:  parallel agents writing `src/styles/themes/*.css` made Vite log "`<x>.css` is shared by 58 element
  modules:  full reload", which reloaded the page mid-script;  and `ThemeSheets.apply("rtl")` threw "isn't a theme"
  because the running server's `import.meta.glob` result predated the new sheet. · Restart the dev server after
  adding a sheet, and re-run a shot that looks unthemed;  under parallel agents, prefer asserting in a vitest
  browser test. · ui
- 2026-10-02 · The site bundle (`yarn site:bundle`) loaded `_assets/ui-docs-example.js` (200, no error), yet
  `<ui-docs-example>` stayed undefined;  every test passed.  `package.json` `sideEffects` listed only
  `./src/components/*/index.ts`, so rolldown dropped the new `src/docs-components/*/index.ts` barrel's `define()` call
  (vitest doesn't tree-shake). · Add the folder's barrels to `sideEffects`;  a new folder of side-effect barrels needs
  the same.  Found by `import()`ing the chunk in the page and checking `customElements.get()`. · ui
- 2026-10-03 · Needed to SEE a docs element without the site bundle (the lead builds it once):  vitest browser's
  `page.screenshot({ path })` into the scratchpad failed "Access denied" (`server.fs`), and a relative `path` resolves
  against the TEST FILE's folder (`../../../../.cache/x.png` from `src/docs-components/ui-docs-nav/` landed in
  `packages/.cache/`, outside the ignored `packages/ui/.cache/`). · A throwaway `*.test.tsx` beside the element:
  render, `await` its hosts, `page.screenshot({ path: "<n x ../>.cache/x.png", element })`, then `Read` the PNG;
  `console.log` from a browser test is swallowed, so dump values with `throw new Error(...)`.  Delete both after. · ui
- 2026-10-03 · `yarn plan-doc add ... "<ui-docs-nav> ..."` with the title pre-escaped (`&lt;ui-docs-nav&gt;`) stored
  `&amp;lt;` -- the script escapes titles itself (details are raw HTML), and there's no retitle command. · Pass tags
  in titles RAW;  escape only inside `--details`. · ui / docs
- 2026-10-03 · A Playwright phone check (`isMobile: true`) read 0px horizontal overflow on a page with a 900px-wide
  element:  with `isMobile`, chromium widens the layout viewport to fit the content, so `innerWidth` grows to
  `scrollWidth` (925 === 925) while `visualViewport.width` and `documentElement.clientWidth` stay 390. · Measure
  overflow as `documentElement.scrollWidth - documentElement.clientWidth`, never against `innerWidth`
  (`tools/SiteCheck.ts` `overflowState`). · ui
- 2026-10-03 · `yarn site:check` failed with "Unable to attach ElementInternals to a customized built-in element"
  on one `<ui-docs-example>`:  its `description="... `widths="4"` is ..."` had raw double quotes, so the attribute
  ended early and the leftover words became attributes -- one of them `is`, which makes the element a CUSTOMIZED
  BUILT-IN. · Write `&quot;` for a quote inside an attribute (PAGES.md says so;  the error doesn't). · ui
- 2026-10-03 · `yarn site:check`'s `-desk-full.png` of the placeholder page showed every `<ui-placeholder>` below the
  first screen as an EMPTY box, which looked like a broken widget.  The shimmer gradient is
  `background-attachment: fixed` (one sweep shared by every shape), and Playwright's full-page screenshot paints
  fixed backgrounds against the first viewport only. · Not a bug:  check the viewport shots (`-phone-mid`,
  `-desk-examples`), which draw the shapes.  Any page with placeholders (skeletons) shows the same. · ui
- 2026-10-03 · `yarn site:new icons` refused ("site/components/ui-icon.html exists"):  a PAGE name that is a tag's
  name or plural (`icons` => `ui-icons`, a tag of the `ui-icon` family) is taken for that family. · Name it with the
  extension, `yarn site:new icons.html --title "Icons"`:  `ui-icons.html` matches no tag, so it falls through to a page.
  · ui
- 2026-10-03 · A helper script in the session scratchpad (`splice.py`) was rewritten mid-run:  parallel page agents
  share ONE scratchpad folder, so common file names collide. · Give scratch files an agent-unique folder
  (`tools/results/<agent>/`, git-ignored, or `scratchpad/<agent>/`). · ui
- 2026-10-02 · Several agents running `yarn test:visual` in ONE worktree:  each run rewrites `tools/results/visual/`
  (`parity.md`, `static-parity.md`, Playwright's `output/` is emptied first), so a report or diff image read a minute
  later belonged to another agent's run, or was gone. · Copy the report to the scratchpad right after each run, and
  read diff images before starting the next run. · ui

## app

- 2026-10-02 · `app`'s `browser` test project failed EVERY file on a cold `node_modules/.vite/vitest` cache once a test
  imported `$/app/editor`:  vite found `marked`, `semantic-ui-react`, lodash ... mid-run, re-optimized and reloaded
  ("Failed to fetch dynamically imported module");  a second run passed. · `optimizeDeps.entries: BROWSER_TESTS` in
  `vitest.config.ts` `browserConfig()`, so the dep scan crawls the tests up front.  Cold-cache run green. · app
- 2026-10-02 · The FIRST run of a new browser test that loads Monaco (`src/solid/InputEditor.browser.test.tsx`, via
  `LazyMonaco`'s `import()`) failed 6 of 9 with "Failed to fetch dynamically imported module .../solid/monaco/index.ts";
  the rerun passed, and every run since.  Same mid-run re-optimize as above, for `monaco-editor`'s deep imports (or
  another agent's run colliding). · Rerun before investigating;  if it recurs on cold caches, add the `monaco-editor/...`
  paths to `browserConfig()`'s `optimizeDeps.include`. · app
- 2026-10-02 · A scratch `vite build -c <scratchpad>/vite.x.config.ts` importing `packages/app/vite.config.ts` died with
  "`@solidjs/vite-plugin` ... default is not a function":  outside a `"type": "module"` package vite bundles the
  config as CJS.  Then `$/app/...` imports in a scratch ENTRY didn't resolve (the aliases come from the package's
  tsconfig). · Name it `.mts`;  import the app files by absolute path. · app
- 2026-10-02 · A browser test (`src/solid/TypeExplorer.browser.test.tsx`) hung ~6 minutes with NO output, then
  "Browser connection was closed", reported as `import 90%`:  it looked like a vite reload / collision.  Really a
  microtask loop starving the page:  `tree={buildScopeTree(ENTRIES)}` makes a NEW tree on every read of the Solid
  prop, the details cache was per tree object, so each answer asked again. · Bisect with a tiny probe test (passes
  in a second);  if the real file still hangs, suspect a loop.  Fixed in the component (`currentTree()` memo). · app
- 2026-10-02 · The built `dist-element/` drew fine, yet logged 27 404s per page:  vite's module preloading of `ui`'s
  lazy chunks asked for `/ui/UIRuntime.js` ... at the page's ROOT (default `base: "/"`), not beside the bundle.
  Same cause as the editor's worker 404 (`spell` section). · `base: "./"` in `vite.solid.config.ts`.  Any build whose
  chunks are served from a sub-folder needs it. · app
- 2026-10-02 · Two rolldown ENTRIES (`spell-solid`, `spell-ui`) both reaching Solid:  rolldown put Solid in a THIRD,
  shared chunk (named after a random module, `ui/customElement.js`), not in `spell-solid.js` -- even with
  `preserveEntrySignatures: "allow-extension"`. · One entry, the other its dynamic `import()`:  the lazy chunk then
  imports what the entry already holds from the entry. · app
- 2026-10-02 · `expect(spy).not.toHaveBeenCalledWith(runnerRoot)` FAILED although the spy only ever got `editorRoot`
  ("Compared values have no visual difference"):  vitest compares DOM elements by their MARKUP, and the editor's and
  the runner's `#spell-app-root` look alike. · Compare elements by identity:  `spy.mock.calls[0][0]` with `toBe()`.
  · app (solid-migration P8)
- 2026-10-02 · `<SplitPanel>`'s drag did nothing in a browser test, yet worked on the dev server:  `$/util`'s
  `getPadding()` reads `NaN` under vitest (`SUSPECTED-BUGS.md`, app), and one `NaN` in the measurements makes `drag()`
  bail silently. · Bisected by dumping the drag's measurements into a failing `expect`;  `SplitPanel.tsx` reads
  padding with `getComputedStyle()` itself. · app (solid-migration P8)
- 2026-10-02 · `/demo/spell-app.html` 404s `/element/spell-app.js` on the dev server (`spell serve`):  nothing there
  serves `dist-element/`, though the demo's comment says the dev server does.  The app's own pages work. · For a live
  check:  a tiny static server for `/demo/` + `/element/` that proxies `/api/` to the page server -- dropping
  `Origin` / `Referer`, or the page server answers 403. · app

## cli

Entries before 2026-09-30 are from when the command line lived in the parser repo, on its `CLI` branch.

- 2026-09-28 · New `tsx` entry point died with `ERR_MODULE_NOT_FOUND: Cannot find package '~'` -- looked like
  `tsconfig` `paths` weren't applied, so time went on probing `tsx`'s `register({ tsconfig })`.  Real cause:  the
  FILE was gone (`~/spellVersion.node` had just been renamed to `~/packageVersion.node` by another session).  `tsx`
  reports a missing `~/` file as a missing PACKAGE `~`. · `ls` the target file first;  `~/<dir>` imports resolving
  while one `~/<file>` doesn't means that file is missing, not path mapping. · spell/cli
- 2026-09-28 · `npm prefix -g`'s `bin` is NOT on `PATH` under volta (only volta's shims in `~/.volta/bin` are), so a
  command linked there silently isn't found. · `scripts/install-cli.mjs` picks the first writable folder actually
  on `PATH`, starting with `~/.local/bin`. · spell/cli
- 2026-09-29 · After `yarn cli:install`, `spell compile @library` failed with zsh's `cd: too many arguments`:  a
  `~/.zprofile` alias `spell="cd ~/www/spell/parser"` shadowed the new command.  Non-login shells (e.g. an agent's
  `zsh -ic 'type spell'`) don't read `.zprofile`, so they reported the right command and hid it. · Renamed the alias
  `sp`.  When a command "can't be what it says", check `type -a <name>` in a LOGIN shell (`zsh -l`). · spell/cli
- 2026-09-29 · Driving an Ink screen through `script -q /dev/null ...` showed broken borders -- boxes' right edges
  20 columns short.  Not a bug:  `script`'s pty reports 0 columns, so Ink lays out to its 80-column default while
  the screen sized itself to its own fallback.  Also, rows = 0 makes Ink clear the WHOLE terminal every frame. ·
  Size the pty first:  `script -q /dev/null zsh -fc 'stty rows 30 cols 110; <command>'`.  Or render with
  `ink-testing-library` at a fixed `size`.  Fallbacks now match Ink's (80 x 24). · spell/cli
- 2026-09-29 · `spell watch` compiled the OLD text after a save, and showed ✓ for a file with an error.  On macOS,
  `fs.watch()` reports a plain save as `rename` -- and also replays the folder's own creation events the moment
  watching starts -- so `rename` read as "new file", and the workspace's "created" path keeps loaded files' text. ·
  Ignore `fs.watch()`'s event type:  decide from what's on disk now (gone / one of the project's files / new).
  Also watch BEFORE the first build. · spell/cli
- 2026-09-30 · Stripping colour codes from a pty capture of `spell explore` with
  `sed 's/\x1b\[[0-9;?]*[a-zA-Z]//g'` died with `sed: RE error: illegal byte sequence`:  macOS `sed` chokes on the
  box-drawing characters' bytes. · `perl -pe 's/\e\[[0-9;?]*[a-zA-Z]//g' <file>` instead. · spell/cli
- 2026-10-01 · `check-spell.js` failed a plan doc with "116px horizontal scroll at phone width", and nothing in `main`
  looked wider than the screen:  the overflow was TEXT (an unbreakable path in a phase's Files line), which
  element rects don't show.  Bisected by deleting one section at a time in Playwright. · Shorten / `<code>`-split
  long paths in phase lines;  see `SUSPECTED-BUGS.md` `## docs`. · docs
- 2026-10-01 · `spell goals thoughts --all spell` lost `--all`:  commander takes a GLOBAL option (`--all`) wherever
  it appears, even after a subcommand whose arguments are passed through. · The `goals` subcommand reads its own
  arguments raw from `process.argv` (`main.ts`). · cli
- 2026-10-01 · In a worktree-isolated session, Bash commands with shell functions, `cd ..` chains or a Python
  heredoc are refused ("too complex to verify that it stays inside the worktree"). · Plain `&&` chains of simple
  commands;  write throwaway scripts with the Write tool, then run them. · tooling
- 2026-10-01 · Tab in an Ink prompt was typed into the text (`@te<TAB>Sol`) in a real terminal, but worked under
  `ink-testing-library`:  keys typed while the app is busy arrive as ONE chunk, and Ink only names a key (`key.tab`)
  when it arrives alone. · Split `input` into keys yourself, and queue them -- see `keysIn()` in
  `cli/src/ui/TargetPrompt.tsx`.  Test it with a chunk (`stdin.write("@te\tSol\t\r")`) and in a pty (`expect`). · cli
- 2026-10-01 · `/isolate`'s `yarn window which` died in a fresh worktree ("Couldn't find the node_modules state
  file"):  `yarn` runs no script before `yarn install`, and the skill installed only AFTER showing the window. ·
  `node scripts/window.mjs` directly:  it needs no dependencies.  The skill and root `AGENTS.md` now say so. · tooling
- 2026-10-01 · `window add .claude/worktrees/<name>/packages/<pkg>` failed with "no folder
  '.../worktrees/<name>/.claude/worktrees/<name>/...'":  the path resolves from the CURRENT folder, which after
  `EnterWorktree` is the worktree. · From the worktree's root, pass `packages/<pkg>` (or an absolute path). · tooling
- 2026-10-01 · `/isolate done` couldn't merge into `main`:  a worktree-isolated session refuses `git -C <main
  checkout>` ("redirects git to the shared checkout"), even a read-only `status`. · Get the branch ready in the
  worktree (`git log HEAD..main`, `git merge-tree --write-tree` to spot conflicts), `ExitWorktree`, then
  `git merge --ff-only <name>` from the main checkout.  The skill now does it in that order. · tooling
- 2026-10-02 · `spell speed --against HEAD` died at once ("Previous side failed:  }") after a change REMOVED a
  dependency (`easy-state`, P11):  the temp worktree of HEAD links OUR `node_modules`, where HEAD's import no longer
  resolves.  The message hides the cause. · Put the dependency back in `package.json` + `yarn install` for the run,
  then take it out again.  Better:  `speed` could print the child's stderr. · cli
- 2026-10-03 · `src/cli.test.ts > spell serve > --headless` failed (no editor URL, "Starting the page server ...
  (already running)", ~3 min with a retry) after an overnight run:  a page server an agent started the night before
  (`packages/server/src/page/cli.ts serve`, pid from `lsof -nP -iTCP -sTCP:LISTEN`) was still up with that evening's
  code, and the test reused it. · Kill the stale server (check its folder with `lsof -a -p <pid> -d cwd`) and
  rerun.  Better:  the test could refuse a page server it didn't start, or one older than the checkout. · cli

## docs

- 2026-10-01 · `tidy()` (`packages/docs/scripts/pages.js`) failed on a page outside `packages/docs`:  oxfmt
  refuses any path containing `..` ("PATH must not contain \"..\""), and `tidy()` runs in `packages/docs`. ·
  Pass ABSOLUTE paths to `tidy()`:  oxfmt and `doc-links.py` both accept them (`goals/_tools/goals.js`
  `tidyOrFail()`). · goals
- 2026-10-01 · The goals server said Claude Code was "not logged in" though `claude auth status` said it was:  a Node
  process found a stale npm-installed `claude` 1.0.98 (no `auth status`) in Volta's Node image, which Volta puts
  FIRST on a Node process's `PATH`;  the terminal finds the current native install in `~/.local/bin`. · Run the
  NEWEST `claude` on `PATH` or in the installers' folders, by absolute path (`goals/_tools/launch.js`
  `claudePath()`).  Or remove the stale one:  `npm uninstall -g @anthropic-ai/claude-code` under Volta's Node. · goals
- 2026-10-01 · `F="a.ts b.ts"; oxfmt --check $F` said "Expected at least one target file" and `oxlint $F` "No files
  found to lint" (exit 0!):  the Bash tool's shell is zsh, which does NOT word-split an unquoted `$F`, so both got
  ONE path with a space in it.  Also, `oxlint` prints NOTHING on a clean run unless given `--format=default`, so a
  silent exit 0 doesn't prove it linted anything. · An array, `F=(a.ts b.ts); oxlint "${F[@]}"`, and
  `oxlint --format=default` to see "Found 0 warnings ... on N files". · tooling
- 2026-10-01 · In a worktree session, Bash refused heredocs (`python3 - <<'EOF'`), `cd ... && ...` chains and
  `git -C <main checkout>` as "too complex to verify that it stays inside the worktree". · Write the script to a
  file (scratchpad or the worktree) and run it with one plain command;  use the Edit tool for multi-line edits;
  read the main checkout's files with `diff <path> <path>`, not `git -C`. · docs
- 2026-10-01 · A plan doc's link to `#d14` (a `<ui-item>`) landed 58px too high, then drifted:  the contents'
  short `<ui-sticky>` (301px) counted as a header in the page's new `scroll-padding-top`, and Chrome's scroll
  anchoring picks its anchor below that padding, so an opening panel shifted the page. · A sticky narrower than half
  the scroll area reserves nothing (`UISticky.reserve()`). · ui
- 2026-10-02 · Converted pages came out as `<ui-section dividing collapsible sticky header="..." id="...">`:
  linkedom's `setAttribute` puts each NEW attribute first, so a built element serializes its attributes reversed. ·
  Build elements from HTML instead (`createElement()` in `packages/docs/scripts/to-ui-section.js`, which
  `plan-doc.js` `element()` uses too). · docs
- 2026-10-02 · After moving a page to `<ui-section>`, a section ending in a card grid lost the cards' bottom border:
  the content part clips (`overflow-y: clip`) and a card's border is a box-shadow;  `overflow-clip-margin` did
  nothing because Chromium applies it only when BOTH axes clip. · `overflow: clip; overflow-clip-margin: 6px` on
  `ui-section::part(content)` (`spell-doc.css`;  `spell-ui-findings.md` 26). · docs
- 2026-10-02 · `yarn docs:update` failed at "check links" before any browser check, on pages nobody touched:
  `plans/ui-component-creation` links `packages/ui/reference/Fomantic-UI/`, a git-ignored clone that a fresh
  worktree (and here the main checkout too) doesn't have. · `mkdir -p packages/ui/reference/Fomantic-UI` for the
  run, then remove it;  or clone Fomantic there. · docs
- 2026-10-02 · `node scripts/plan-doc.js <command>` died with `Cannot find package '$'`:  since the unified-server
  merge `plan-doc.js` imports `$/server` (`SRV.FileLock`), an alias only `tsx` (or vitest's `tsconfigPaths`)
  resolves. · Run it as `yarn plan-doc ...` (the script is `tsx scripts/plan-doc.js`), or
  `npx tsx scripts/plan-doc.js ...`. · docs
- 2026-10-02 · `yarn docs:update` still fails at "check links" after the Fomantic fix:  `server.html` and
  `plans/unified-server` link the page server's runtime files (`.spell-server.json`, `.spell-server.log`,
  `.spell-server.astro.log`:  only there while it runs) and `packages/app/src/server/ts.zip` (deleted in P6). ·
  Not fixed:  `yarn server ensure` first creates the runtime files;  `--no-check` skips the browser checks only. ·
  docs
- 2026-10-02 · `yarn plan-doc check` failed with "undefined elements:  ui-include, ui-code" after `add-phase`:
  `--goal` / `--files` / `--verify` are HTML (unlike `add`'s title, which is escaped), so a goal saying
  `<ui-code>` became a real element. · Write `&lt;ui-code&gt;` (or `<code>&lt;...&gt;</code>`) in `add-phase`
  options;  the epic skill's cheat sheet shows them as `..`, not `html`. · docs
- 2026-10-02 · `yarn review` in `packages/docs` rewrote all 53 `_assets/emoji/<set>/<letter>.js` (quoted keys -> bare):
  `yarn format` (`oxfmt .`) formats the GENERATED emoji chunks, and the bundler writes them back quoted on every
  `bundle-spell-ui.js` run, so the two fight. · Not fixed:  `git checkout -- packages/docs/_assets/emoji` after a
  review;  the fix is an `ignorePatterns` entry for `**/docs/_assets/emoji/**` (as `_assets/lazy/` has). · docs
- 2026-10-02 · `yarn plan-doc add-phase` writes `--goal` / `--files` / `--verify` text into the page UNESCAPED:
  `<ui-*>`, `<For>`, `<spell-app>` became real tags and `check` failed with "undefined elements:  ui-*". ·
  Hand-escape them in the phase body (`<code>&lt;ui-*&gt;</code>`);  `add --details` takes HTML on purpose, but
  `add-phase` text should be escaped by the script. · docs
- 2026-10-02 · Plan docs' phase "Estimate" line (`icon="clock"`) draws nothing:  `clock` isn't in `ICONS` in
  `packages/docs/scripts/bundle-spell-ui.js` (only `clock rotate left`), so `check` notes "N icon(s) with no
  <svg> drawn", one per phase. · Not fixed:  add `clock` to `ICONS`, then `yarn docs:update`. · docs
- 2026-10-02 · Root `yarn review` (its `format` step) rewrote ~60 files nobody touched:  `main` holds unformatted
  files (generated `_assets/emoji/*.js`, `goals-live.js`, `bundle-spell-ui.js`, `templates/epics/plan.html`,
  `spell/src/node/environment.ts`), so every review drags them into the diff. · `git restore` them after the
  review;  the real fix is formatting them once on `main` (or ignoring the generated emoji chunks in `.oxfmtrc`). ·
  docs, spell
- 2026-10-02 · `yarn plan-doc add-phase` numbers a new phase by COUNTING phases, so after a phase was deleted by
  hand (solid-migration's P5) it handed out `P10` again:  two `#p10` sections, and `check` didn't flag it. ·
  Renumbered the new one by hand (`p11`) and moved it;  `add-phase` should use max id + 1, and `check` should fail
  on duplicate ids. · docs
- 2026-10-02 · `yarn plan-doc check` failed "fold:  #overview unfolded, but its content is not visible" after an
  UPDATE `<ui-message>` went first in `#overview`, as `plan-doc.md` says ("just before" the changed block):
  `check-spell.js` `foldState()` tests the FIRST unslotted child with `checkVisibility()`, which is `false` for a
  `display: contents` host such as `<ui-message>`. · Put the summary's UPDATE note just AFTER `p.plan-summary`;
  `foldState()` should skip `display: contents` children (or test their first box). · docs
- 2026-10-02 · `doc-links.py --check` failed on a plan doc with "target ... shared by" `solid/solid-2.md` and
  `solid/SOLID-2.md`:  on macOS's case-insensitive disk an old name (`<code>docs/solid/SOLID-2.md</code>`, kept as
  history) resolves, so `doc-links.py` links it to a second path for the same file;  unlinking it by hand gets
  re-linked on the next run. · Wrote the old name as plain text;  `doc-links.py` should resolve paths
  case-sensitively (compare against the real directory listing). · docs
- 2026-10-03 · `yarn docs:update` failed its link check on every run, so its page checks never ran:  links to
  gitignored runtime files (`.spell-server.json`, `goals/.server.json`) and local clones (`packages/ui/reference/`)
  count as "missing" in any checkout without them, plus one renamed skill and one deleted file.  Past those, the
  check crashed on `ui-import/examples/part.html`, an include fragment `findPages()` took for a page. ·
  `doc-links.py --check` accepts a missing target git ignores;  `findPages()` skips `examples/`;  the two real
  links fixed. · docs
- 2026-10-03 · `yarn review` in `packages/docs` (oxfmt) rewrote 50 GENERATED emoji chunks (`_assets/emoji/**`,
  every key unquoted) and collapsed the plan template's two spaces after a period (`templates/epics/plan.html`):
  `.oxfmtrc.json` ignores `docs/_assets/spell-ui.js` and `lazy/`, not `emoji/`. · Reverted with `git checkout`
  after the run;  `**/docs/_assets/emoji/**` (and maybe the templates) want an ignore pattern. · docs
- 2026-10-03 · Reviving a paused design from its zip handoff (`outstanding/precedence-and-types/`), an agent set out
  to port its experiments -- already ported and committed in `packages/docs/precedence/experiments/` (solid-migration
  P8). · Before restoring a handoff's files, `git ls-files | grep <topic>`:  the repo copy wins. · docs
- 2026-10-03 · Same `tsc` command, different compiler:  the root's `node_modules/.bin/tsc` is TypeScript 6.0.3
  (`@typescript/old`), `yarn tsc` inside `packages/docs` is 7.0.2.  Both gave 13 errors on 9 lines for
  `typescript-check.ts`, but TS7 words one code differently. · Say which one a doc means;  run it as `yarn tsc` from
  the package. · docs
- 2026-10-03 · The worktree guard refuses a Bash command whose TEXT mentions `git` (e.g. a python heredoc editing
  PAPERCUTS.md) as "cannot be shown to stay inside the worktree". · Use the Edit tool for such edits. · claude-code

## claude-code

- 2026-10-03 · In a worktree-isolated session, Bash refused `python3 - <<'EOF' ... EOF` heredocs holding backticks /
  quotes, `grep -l ... | xargs sed -i`, `for n in ...; do sips $n ...` and `sed -n "$VAR"` ("too complex to verify
  that it stays inside the worktree"), several retries each. · Write the script to the scratchpad and run
  `python3 <scratchpad>/x.py`;  edit exact strings with the Edit tool;  plain single commands with literal paths.
  · claude-code
- 2026-10-03 · Parallel subagents of one session (epic `spell-ui-pages` P4 page agents) share ONE scratchpad
  directory:  another agent overwrote my `scratchpad/p4/splice.py` with its own version mid-task. · Give each
  parallel agent its own scratchpad SUBFOLDER (named for its pages, e.g. `p4-collections/`), and say so in the brief.
  · claude-code
- 2026-10-02 · `vscode://anthropic.claude-code/open?session=<id>` (via `open` or `code --open-url`) "did nothing":
  VS Code delivered it to a DIFFERENT window, not the focused one. · Add `&windowId=<n>`;  a Claude process's
  window is the `window<n>` in the log paths its extension host (parent pid) holds open (`lsof -p`).
  `~/.claude/skills/session/scripts/session.py window` does it. · claude-code
- 2026-10-02 · The `claude-code-guide` agent said nothing can set a session's title but `/rename`. · Wrong for CLI
  2.1.287:  `UserPromptSubmit` / `SessionStart` hooks may return `hookSpecificOutput.sessionTitle` (in the
  binary's hook schema, not the docs).  Grep the binary (`strings ~/.local/share/claude/versions/<v>`) before
  trusting "not supported". · claude-code
- 2026-10-02 · Moving the package window files (`git mv packages/<pkg>/<pkg>.code-workspace workspaces/`) staged their
  OLD contents, and `git add` called them "outside of your sparse-checkout definition" in a checkout that isn't
  sparse:  they're `skip-worktree` (`git ls-files -v` shows `S`), so VS Code's edits (themes, worktree folders)
  never show as changes, and `git mv` carries the flag. · Stage the new contents with `git hash-object -w` +
  `git update-index --cacheinfo`, then `git update-index --skip-worktree` again. · tooling
- 2026-10-02 · A shell command chaining several `yarn plan-doc add-phase ...` calls with `&&` was refused in a
  worktree session ("names git in a form too complex to verify"). · Put the calls in a script in the scratchpad
  and run `bash <script>`. · tooling
- 2026-10-02 · `/session 2ae3516d` said "0 sessions match", and `/worktrees` showed the worktree as empty, for a
  titled session that holds a whole epic plan:  `session.py` dropped transcripts with no typed prompt, and this one
  started `/clear` -> `/epic` -> `/bedtime`, only slash commands (`<command-name>`, skipped as harness text). ·
  `session.py`'s `prompt_text` now reads a slash command as `/name args`, and a title alone keeps a session
  listed. · claude-code
- 2026-10-02 · A `/bedtime` session fanned out 5 background agents, then ended its turn:  the pending window
  `handoff` moved the session to the worktree's window, which RESTARTED its process, and every background agent
  stopped ("didn't finish before the previous session ended") with nothing saved but what was already on disk.
  The night was lost until Owen typed "restart". · Never end a turn with background agents running while a
  `handoff` is pending:  do the handoff turn first (or wait for the agents in the foreground);  stopped agents
  resume with `SendMessage` to their id, transcript intact. · claude-code
- 2026-10-02 · `yarn plan-doc ...` failed with `Couldn't find a script named "plan-doc"` run from `packages/ui`,
  though `/epic`'s cheat sheet says "from anywhere in the repo":  only the root (and `packages/docs`) define it. ·
  Run it from the worktree root. · claude-code
- 2026-10-03 · `yarn review` (oxfmt `--fix`) silently mangled `<ui-markdown>` text in Spell UI's site pages:
  markdown inside `<script type="text/markdown">` re-wrapped mid code span and bullets merged (`ui-table.html`,
  `ui-transition.html`, the `ui-button.html` pilot).  A small test file with the same lines came through untouched,
  so it depends on the page around it. · `.oxfmtrc.json` ignores `**/ui/site/**/*.html`;  repaired by hand. · ui
- 2026-10-03 · Parallel page agents share ONE session scratchpad:  another agent's `splice.py` silently replaced
  mine mid-task.  And in a worktree-isolated session, any Bash with a shell variable or `for` loop around
  `yarn` / `python3` / `sed` (`$S/splice.py`, `for f in ...; do yarn site:new ui-$f`) is refused as "can't verify
  it isn't git". · Give each agent its own subfolder (or the git-ignored `packages/ui/tools/results/<agent>/`), and
  spell commands out literally, chained with `&&`. · claude-code
- 2026-10-03 · Same guard, more shapes:  a `python3 - <<'EOF'` heredoc (and any command after a heredoc) is refused
  too;  and a stray `python3 - file.html` (meant as `python3 script.py file.html`) waits on stdin until the 5-minute
  Bash timeout. · Write the script to a file with the Write tool, run `python3 /abs/path/script.py`. · claude-code
- 2026-10-02 · `vscode://anthropic.claude-code/open?session=2ae3516d...` opened an idle tab of a DIFFERENT session
  (`f09af4f3`, the one `/clear` had replaced):  `2ae3516d`'s transcript was saved under the worktree's project
  folder (`...--claude-worktrees-ui-import/`), not the repo root's, which is where the window's panel looks. ·
  Copy the `.jsonl` (and its sidecar folder) into `~/.claude/projects/-Users-owen-www-spell-app-spell-app/`, then
  open it again;  `session.py open` now treats the two copies as one session. · claude-code
- 2026-10-02 · After merging `ui-import` into `main`, `yarn ts` in `packages/app` failed:  `Cannot find module
  'highlight.js/lib/languages/...'` from `ui`'s `CodeEngine.ts`.  The branch added a dependency, and the main
  checkout's `node_modules` was never reinstalled. · `yarn install` at the root after merging a branch that
  changes any `package.json`. · claude-code
- 2026-10-02 · In a worktree session, read-only commands were refused too:  a `for` loop over `git rev-list`, a
  `time ( ... )` subshell, and a `grep ... .gitignore` chained after `ls` ("names git in a form too complex").  The
  check is on the command TEXT, so even a file name with `git` in it trips it. · One plain command per Bash call;
  loops and git calls over other branches go in a Python script (`/whassup`'s `whassup.py`). · tooling
- 2026-10-03 · More worktree-session refusals:  `sed -n "$(grep -n ... | cut -d: -f1),+30p"` (a computed value where
  an option may stand) and `python3 -c "...open('$HOME/...')"` (a program computed from a variable). · Read with
  `Read` and its `offset`;  spell paths out, or put the script in a scratchpad file. · tooling
- 2026-10-03 · Testing what a `UserPromptSubmit` hook gets for a typed slash command, without running the skill. ·
  `claude -p "/epic x text" --settings <file> --permission-mode plan`, the settings holding one hook that saves
  its stdin and answers `{"decision":"block"}`:  the input has the raw prompt and `permission_mode`. · claude-code
- 2026-10-03 · `/isolate` "didn't switch" the session:  the move waits for the turn to end, and `/epic` kept the
  same turn going (`yarn install`, the doc, exploring, plan mode), so the new window sat empty for minutes. · The
  skills end the turn right after `window.mjs handoff`, and do the rest in the new window (`--prompt continue`
  types the next message in). · claude-code
- 2026-10-03 · After a move, the old tab stayed open, looking live (5 of 7 moves;  ~20 tabs titled `ui-import`):
  it's found by its label, and a new session has none (`no tabs titled ''`), while sessions opened in a worktree's
  window share that worktree's title. · `.claude/hooks/prompt-gate.mjs` renames the session on `/isolate|epic|unpark
  <name>` before Claude runs, and blocks those inside another worktree. · claude-code
- 2026-10-03 · In a worktree-isolated agent, the worktree guard refused three plain Bash commands as "too complex to
  verify":  a `for` loop calling `$P <args>` (command name in a variable), and `cat > file <<EOF` heredocs chained
  with `&&` / `;` and a `yarn` run.  Nothing in them touched git. · One plain command per Bash call, no command name
  in a variable;  write files with the Write / Edit tools, not heredocs. · claude-code

## vscode

- 2026-10-02 · A freshly installed extension feature (`DocView`) never showed after a reload:  docs still opened in a
  new editor tab.  The extension is installed ONCE for all of VS Code, and a `yarn vscode` in another checkout (the
  `solid-migration` worktree, 6 minutes later) had overwritten it with its own branch's build, which also runs THAT
  checkout's language server. · Check which checkout built it:
  `grep -o '"/Users/owen/www/spell-app/[^"]*"' ~/.vscode/extensions/spell-app.spell-language-*/out/extension.js`
  (its `REPO_ROOT`), then `yarn vscode` from the checkout you want and reload. · vscode
