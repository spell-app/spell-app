# WWOD spoke — Tests

House rules for unit + integration tests.
Read with `.agents/WWOD.md` (the hub).

## 22. Tests

- **`test` never `it`; `describe("functionName()")` with parens:**
  - Lowercase sentence names that carry the why, invariants in CAPS
    (`"serves DECOMPRESSED bytes (no Content-Encoding) with the stored-XSS headers"`).
- **Hand-rolled fakes over mock libraries:**
  - `hooks = { x: vi.fn() }` objects; `vi.mock` before `await import(...)`.
  - Relative mock paths within a feature folder.
  - UPPERCASE fixture consts (`ID`, `META`, `V1`); factory helpers (`makeUI`, `baseOpts`).
  - `expect.assertions(n)` to pin catch-path counts.
- **Tests follow the logic:**
  - When flow moves to a controller, the app-class test dies and a controller test is born.
  - Test files track merged modules, not 1:1 per concept.
  - Delete redundant tests; merge overlapping assertions.
  - **The test file is RENAMED with the module it follows**, in the same commit:
    `tourRegistry.test.ts` → `tours.types.test.ts`; the finding/measuring tests moved out to
    `util/elements.test.ts`; `clamp`'s two tests collapsed into one in `math.test.ts`.
  - `describe()` names the NEW call path -- `describe("TourRun.planSteps()")`, not the old
    free-function name.
  - **DELETE a test whose surface no longer exists** rather than reworking it to assert
    something else. Inlining a helper removes the separately-testable seam; if a surviving
    test already covers the behaviour, the orphan goes. Say so in the review notes, with the
    count delta (hub §1).
- **Bigger fakes are real subclasses** with `vi.fn()` class fields, a declarative reply
  table, and `_`-prefixed test-only helpers (`CachedResource-test-helpers.ts`).
- **Freeze time per test**: `vi.useFakeTimers()` + `vi.setSystemTime(START_TIME)`; derive
  time constants (`LONG_AGO`, `RECENTLY`) at module level.
- **Full-width `//========` banners** between describe groups in long test files.
- **Assert parsers by whole-spread equality**: `expect({ ...AppURL.orDie(x) }).toEqual({…})`.
- **Custom matchers via module augmentation** + side-effect import (`repo-test-matchers.ts`).
- **Reusable integration suites are exported parameterized functions** gated by a level flag
  (`testFilesAPI(factory, "smoke" | "all")`), fixtures namespaced with a unique test id.
