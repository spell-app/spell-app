# WWOD spoke — Functions & types

House rules for function signatures and type design.
Read with `.agents/WWOD.md` (the hub).

## 11. Functions & types

- **Avoid `null`, use `undefined` instead**
  - Treat absence of value as logically "null".
  - `undefined` values work for e.g. argument or method spread where `null` does not.
- **Destructure options in the method signature with inline defaults:**
  - Lift environment defaults into the param list so tests can override:
    `async publish({ userId, autoPublish = false, quota = environment.publish.quota || 0 })`.
  - Not `params: {...}` then `params.x` in the body.
- **Named string constants + `typeof` types**, never inline literal unions at call sites.
  - `export const NEW = "published"; export type New = typeof NEW`; compare `P.CANCEL`.
  - Frozen result singletons: `export const CANCELLED_RESULT = { … } as const`.
- **Const-array unions**: `const PublishableTypes = [...] as const` +
  `(typeof PublishableTypes)[number]` + a type-predicate helper.
- **ALL-CAPS string sentinels over booleans for modes:**
  - `"ASK"`, `"RECURSIVE"`, `"LAST"`, `"DEBUG"`, `overwrite: boolean | "CHECK"`.
  - Never pass a bare `true`/`false` to control behavior:
    `forgetCacheState("SKIP_NOTIFICATION")`, not `forgetCacheState(true)`.
- **Type surgery over hand-written duplicates**: `Prettify<A & Omit<B, "x">>`,
  `Pick<UI, "showModal" | ...>` — never re-declare a near-copy interface.
- **`type` aliases, not `interface`**, for domain shapes; mix in framework base types at the
  boundary if only used once (`dynamoose.model<PS.PublishMetadata & Item>`).
- **Permissive `XInput` aliases at public boundaries**, normalized on line 1:
  `AppURLInput = string | AppURLString | AppURL` → `AppURL.orDie(input)`.
- **ONE input type for the whole class, not one per method:**
  - `ElementsOrSelectors<S>` = selector(s) | element(s) | a mix, and every `ElementRoot` method
    takes it, so "what does this input name?" has a single answer.
  - Normalize it ONCE in a module-private splitter that every method calls, rather than each
    method doing its own coercion.
  - Accepting the already-resolved form as well as the name is what lets a caller that HOLDS
    elements share the measuring code with one that only knows some ids.
- **Collapse `X | X[]` into ONE string when the domain already has a separator convention:**
  - `target?: TourTarget | TourTarget[]` → `target?: TourSelector`, comma-separated the way CSS
    does it (`"#cd-item-list, #cd-properties"`).
  - Exactly one function knows the convention (`splitSelectors()`); the union's own
    splitting helper (`targetsOf()`) disappears.
  - Keep the template-literal guarantee on the string (`` `#${string}` ``) so the useful half of
    the type survives the collapse.
- **Branded strings for encoded payloads**, constructed only at a boundary function:
  `type ZipDataURL = string & { readonly _brand: "ZipDataURL" }`.
- **Template-literal types encode string invariants**: (`Files.types.ts`)

  ```
  type AbsolutePath = `/${string}`
  type FolderPath = "/" | `${AbsolutePath}`
  ```

- **Const object + `keyof typeof`** for enum-with-payload maps (`AppAPIPaths`).
- **Ambient globals used bare**, no import (`globals.d.ts`):
  - `ISOTimestamp`, `Prettify`, `Nullable`, `Mutable`, `UUID`
  - Svelte's `Component`/`ComponentProps`/`Snippet`.
- **undefined-in/undefined-out tolerance** via overload pairs — never throw on nullish
  (`format.ts`):
  - string formatters return `""`
  - parsers return `undefined`.
- **Namespace modules take short generic names** (`format.date`, `prop.get`) — designed for
  `import { prop } from "$lib/util"` consumption.
- **Helper `function` declarations go BELOW the `return`** inside the enclosing function,
  keeping the happy path on top (hoisting).
- **Overload a static when a flag flips the return type**
  (`assembleURL(bits, { optional: true })`) rather than adding a second name.
- **`.filter((it) => it !== undefined)` after `.map()`**; anonymous item param is `it`.
- **Functions accept their dependencies as parameters with sensible defaults:**
  - Never reach into `window`/`document`/globals when a param works.
  - `(href = getGlobal("location.href")` unit-tests with a plain string.
- **Guard clauses first:**
  - Check preconditions and return early at the top.
  - Never nest the real logic inside `if (ok) { if (alsoOk) { … } }`.
  - Collapse notify+bail into one statement:
    `if (!record) return this.ui.showError("The circuit must be displayed before publishing.")`.
- **No redundant type annotations** TypeScript can infer: `width = "15%"`, not
  `width: string = "15%"`. Same for `undefined` values, e.g.
  `const { a = "default", b } = someVar` rather than `{ a = "default", b = undefined }`.
- **Structured objects over long parameter lists** in constructors.
- **Callback DI + optional `ui?`** so flows run headless.
  - Options carry `applyBlock`, `removeBlock`, `logEvent`.
  - Every use is `ui?.showX(...)`.
- **Injectable `fetch` as trailing default param**: `fetch = DEFAULT_FETCH`, threaded
  positionally — not an optional field which has to be added to each args bag.
