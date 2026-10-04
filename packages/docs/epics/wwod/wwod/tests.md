# WWOD spoke -- Tests

Unit and integration tests:  style, fakes, structure.  Read with `packages/agents/wwod/WWOD.md` (the hub).
From:  original WWOD §22 "Tests".

SEE ALSO, per package (runners, helpers, fixtures stay there):
- `packages/ui/AGENTS.md` -- real-browser tests, `ElementFixture.settle()` / `tick()`, `yarn test:visual`
- `packages/spell/AGENTS.md` -- tests read ONLY the frozen projects in `projects/test/`;  rule `tests` blocks
- `packages/server/AGENTS.md` -- `$/server/test/serve`:  real HTTP, never `fetch`
- `packages/cli/AGENTS.md` "Tests", `packages/app/AGENTS.md` (node vs `*.browser.test.tsx`)

## 20. Tests

- **`test()` for new test files;  one style per file:**
  - A NEW test file uses `test()`.
  - An existing file keeps its style:  adding to an `it()` file, write `it()`.  NEVER mix the two in one file.
  - NOT:  "`test` never `it`" by rewriting every `it()` file -- churn with nothing gained;  one style per file is
    what keeps a file readable.
  - `describe()` names the call path, with parens:  `describe("Sources.resolve()")`
    (`packages/ui/src/runtime/Sources.test.ts`).
  - Test names are lowercase sentences that carry the why, invariants in CAPS:
    `"disables ONLY the element whose render throws;  its sibling keeps updating"`
    (`packages/ui/test/isolation.test.tsx`).
- **Tests sit beside their module:**
  - `<module>.test.ts(x)` next to `<module>.ts(x)`;  cross-cutting tests in the package's `test/`.
  - Shared helpers come from the package's test entry point:  `$/parser/test`, `$/spell/test`, `$/ui/test/...`,
    `$/server/test/...` (root "Imports", WWOD §4).
- **Hand-rolled fakes over mock libraries:**
  - Hooks objects of `vi.fn()`:  `const hooks = { onChange: vi.fn() }`.
  - `vi.mock()` only to cut a module seam, e.g. `vi.mock("./loadRuntime", ...)`
    (`packages/app/src/runner/runner.browser.test.tsx`).  When the test imports the module under test
    dynamically, `vi.mock()` comes before the `await import(...)`.
  - Mock paths follow the import rules:  `./peer` in the same folder, else `$/name/...`, e.g.
    `vi.mock("$/app/runner/shadowStyles", ...)` (`packages/app/src/spellEditor/spellEditor.browser.test.tsx`).
  - UPPERCASE fixture consts at module level:  `BOMB`, `OWNER_VOCABULARY`, `REAL_DATA`.
  - Factory helpers as function declarations, e.g. `owned(items)` in
    `packages/ui/src/components/ui-item/ui-item.test.tsx`.
  - `expect.assertions(n)` to pin how many checks a catch path makes.
- **Tests follow the logic:**
  - When behaviour moves to another class or module, its tests move with it:  the old file's test dies, a new one
    is born where the logic now lives.
  - Test files track modules as they merge, not one file per concept.
  - Delete redundant tests;  merge overlapping assertions.
  - The test file is RENAMED with the module it follows, in the same commit (WWOD §8).
  - `describe()` names the NEW call path, e.g. `describe("Sources.load()")`, not the old free function's name.
  - DELETE a test whose surface no longer exists rather than reworking it to assert something else.
    - Inlining a helper removes the separately-testable seam;  if a surviving test covers the behaviour, the orphan
      goes.
    - Say so in the review notes, with the test-count delta (WWOD §1).
- **Bigger fakes are real subclasses:**
  - Subclass the real base, implementing only what the test needs, e.g. `ItemTestOwner extends UIElement
    implements ItemOwner` (`packages/ui/src/components/ui-item/ui-item.test.tsx`).
  - Shared across files:  in the package's `test/`, e.g. `StubOwner` (`packages/ui/test/StubOwner.tsx`).
  - `vi.fn()` class fields, a declarative reply table, and `_`-prefixed test-only helpers.
- **Control time, never sleep:**
  - `vi.useFakeTimers()` + `vi.setSystemTime(START_TIME)` per test;  move with `vi.advanceTimersByTimeAsync(ms)`
    (`packages/ui/src/runtime/Api.test.ts`).
  - Derive time constants at module level:  `LONG_AGO`, `RECENTLY`.
  - Waiting on the UI:  `await ElementFixture.settle()` (`packages/ui/AGENTS.md`).
- **Group banners in long test files:**
  - The house `////` banners (WWOD §6) between `describe` groups, e.g. `// ## Classes under test`, `// ## Tests`
    (`packages/core/src/classes/construction.test.ts`).
  - NOT:  full-width `//========` banners -- one banner style across source and tests.
- **Assert a parsed value whole:**
  - One `toEqual()` / `toMatchObject()` on the whole value, not one `expect()` per field:  the failure diff shows
    every wrong field at once.
  - Spread a class instance to compare its own fields:  `expect({ ...value }).toEqual({ ... })`;
    `toMatchObject()` when the fields are getters.

  ```ts
  expect(new SpellLocation("@user:projects:PROJECT")).toMatchObject({
    projectId: "@user:projects:PROJECT",
    owner: "@user",
    domain: "projects",
    projectName: "PROJECT",
    isProjectPath: true,
    isUserProject: true
  })
  ```

- **Custom matchers via module augmentation:**
  - `expect.extend({...})` plus a `declare module "vitest"` augmentation, in one file in the package's `test/`.
  - Loaded by side-effect import (or the package's vitest `setupFiles`), so a test file gets them without importing
    names.
- **Reusable suites are exported, parameterized functions:**
  - One function runs the same checks over each implementation or module, e.g.
    `unitTestModuleRules(parser, moduleName)` (`$/parser/test`).
  - Runner-agnostic case tables when the cases outlive the runner, e.g. `FALLBACK_CASES`
    (`packages/ui/test/fallback.cases.ts`).
  - Gate a long suite by a level argument (`"smoke" | "all"`);  namespace its fixtures with a unique test id so runs
    can't collide.
