# Debt candidates (for P4)

Places where today's code disagrees with a rule the merged WWOD adopts (D3:  rules only, code mismatches become
`CODE-DEBT.md` entries).  Gathered by the P1 / P2 agents;  P4 checks each, then writes the entries.

## util

- `die()` returns an `Error` instead of throwing (Q9 / D12:  deferred, todo T3 -- not debt yet)
- `CustomError`:  `get name()` from `this.constructor.name`, details in `props.error` (WWOD §5:  `prototype.name`,
  typed `cause`);  `getDier()` throws `UIError` with `props.error`
- `src/spell/constants.ts`:  a bare `constants.ts` (WWOD §8;  I1)
- helpers WWOD's rules assume, none built (D14):  `setDebugGlobal()`, `safelyCall()` / `safelyCallAll()`,
  `debounce()`, `makeErrorWrapper()`
- `assert = { string, number, boolean }`:  a stateless object-literal singleton (D15:  classes everywhere)
- `Loadable.getSaver()` is `abstract`;  WWOD §14:  optional capability = concrete method that throws + `canBeSaved`
- `Logger`:  used once (`parser`'s `Tokenizer`);  default level `WARN`;  no nesting
- `ResponseErrors.ts` subclasses:  user-facing default messages hard-coded in constructors (fine);  `name` via
  `CustomError`

## spell

- `src/node/environment.ts`:  `console.warn({ environment })` on import;  `api_server` snake_case;  `expressPort`
  stale;  inline `Number(...) ||` parsing, no helpers
- `src/node/response-utils.ts` `respondWithJSON()` / `sendError()`:  every throw → 500 `{ errors: [{ message, trace }] }`
  (leaks stacks);  WWOD §10:  honour `SRV.HttpError`, one error-body shape per server (`{ error }`)
- kebab-case files in `src/node/` (`response-utils.ts`, `file-utils.ts`, `project-utils.ts`, `disk-fetch.ts`) (D17)
- `src/node/packageVersion.node.ts`:  node-only suffix is `.server.ts` (WWOD §8, review round 2)
- `SpellLocation`:  constructor returns the interned registry entry;  public `registry`;  segment pattern a local
  `const` (WWOD §15:  protected constructor + static factories, `private static readonly` registry, `static X_PATTERN`)
- `console.*`:  ~80 in `src/` (busiest:  `rules/methods.ts`) (WWOD §19:  `Logger`)

## app

- `process.env` outside an `environment.ts`:  `src/server/EditorServer.ts` (`SPELL_NO_EDITOR`, `SPELL_EDITOR_PORT`)
- `Actions = { ... }`:  object-literal singleton (D15)
- `editor.ts:157` `window.project = project`;  `LazyMonaco.tsx`, `VSCodeRunner.tsx` `Object.assign(globalThis, ...)`
  (WWOD §1:  `setDebugGlobal()`)
- `compileAppSoon()` / `compileSoon()` / `publishSoon()`:  hand-rolled timers (D14:  `debounce()`)
- CSS:  literal colours (`TypeExplorer.css`, `SplitPanel.css`, `ThingExplorer.css`:  `white`, `grey`, `darkblue`,
  `#4183c4`, `rgba(...)`);  `rem` in `SplitPanel.css`;  `.dark` class instead of tokens;  no `--Root-x` properties
  (indents computed in TS) (WWOD §18)
- `src/server/api.ts`:  logs every request with `console.warn` + chalk (WWOD §19)
- tests:  `it()` in some files (D6 codemod)

## server

- `HttpError`, `FileLockError` (`src/server.types.ts`):  no `prototype.name` (D7)
- `process.env` outside an `environment.ts`:  `src/open.ts`, `src/page/PageServer.ts`, `src/page/cli.ts`
- tests:  all 8 files use `it()` (I2;  D6 codemod)

## ui

- `ApiError`, `SourceError` (`src/runtime/runtime.types.ts`):  `this.name =` in the constructor (D7:  `prototype.name`)
- tests:  ~3100 `it()` (D6 codemod)
- env vars without `SPELL_`:  `UI_TEST_ALL`, `UI_SOLID_PROD` → `SPELL_UI_*` (D20);  `FA_PACKAGE_DIR`
- `process.env` in `tools/` and `scripts/`

## cli

- `CliError` (`src/cli.types.ts`):  no `prototype.name` (D7)
- `process.env` in `src/runner/*`, `src/commands/goalsCommand.ts` (`GOALS_DIR` unprefixed)

## vscode, docs, lsp

- `vscode/src/WindowBridge.ts` `BridgeError`:  no `prototype.name`;  `process.env` (`SPELL_WINDOWS_DIR`)
- `docs/scripts/*.js`:  `process.env` reads
- `lsp/src/SpellLanguageServer.ts:228`:  `{ ok: false }` result (WWOD §5 / §7);  also in vscode, ui/tools (8 in all)

## Every package

- READMEs missing:  app, core, lsp, parser, server, spell, vscode (D8d;  T2)
- `it()` → `test()` codemod (D6):  319 files use `it`, 83 `test`;  no file mixes them
