# WWOD spoke — Architecture & module layout

House rules for laying out new features and modules.
Read with `.agents/WWOD.md` (the hub).

## 8. Architecture & module layout

- [ADAPT:  $lib/<feature>/ → package or src folder;  README per D8d] **Feature-cohesive folders beat layer-cohesive:**
  - A feature gets `$lib/<feature>/` with its own README.md, components/, and tests.
  - [DROP:  construct-app infra (APITransaction, DynamoAPI)] `$lib/api/` is reserved for cross-cutting infra (`APITransaction`, `fetchAPI`, `DynamoAPI`).
- [CONFLICT → D8g:  one class per file stays;  families share a file] **Fewer, bigger, capability-named files:**
  - [HAVE → AGENTS.md "Documentation"] Separate functional groups with `//////` banner sections
  - Avoid single-concept micro-modules.
  - [ADAPT:  .server/.client → src/node/ folder or .node.ts] Naming taxonomy: `<feature><Role><.runtime>.ts` (`publishAPI.client.ts`, `publishAPI.types.server.ts`).
- [ADAPT:  = <folder>.types.ts + class files + barrel;  README per D8d] **A feature folder is FOUR OR FIVE runtime files.** Consolidate to that shape before you
  ship it, not in a later pass:
  - [HAVE → AGENTS.md "Types / Exports"] `<feature>.types.ts` -- every type, the constants, and the pure helpers over them.
  - [HAVE → AGENTS.md "Types / Exports"] one file per stateful class, named for the class (`ToursApp.ts`, `TourRun.ts`).
  - [ADOPT] one pure-arithmetic/helpers file if the feature has any (`tourGeometry.ts`).
  - `components/`, `README.md`, `index.ts`.
  - [DROP:  construct-app example ($lib/ui/tours)] `$lib/ui/tours/` is the worked example: it went from EIGHT modules (a registry, a signal
    bus, a menu one-liner, a targets module) down to four, with nothing lost.
- [ADOPT] **File naming**: PascalCase when the module IS one class and nothing else (`ToursApp.ts`,
  `ElementTracker.ts`); camelCase capability name when it holds a family
  (`elements.ts` = `getElement` + `splitSelectors` + `ElementRoot`).
- [ADOPT] **A module-level singleton with no per-instance state belongs on the owning app class as
  `static` members**, not in its own module:
  - [DROP:  construct-app example (tour modules)] `tourRegistry.ts` + `tourSignals.ts` + `tourMenu.ts` → `ToursApp.add()` /
    `ToursApp.tourFor()` / `ToursApp.fireSignal()` / `ToursApp.runGroup()`.
  - Callers read better (`ToursApp.fireSignal("cd:circuit-saved")`), and the folder's import
    graph loses three edges.
  - See `wwod/classes-state.md` §15 for when it stays an object literal instead.
- [HAVE → AGENTS.md "Types / Exports"] **"types" files:**
  - For each module, co-locate types, constants, guard functions etc in `<feature>.types.ts`.
  - These should NOT include anything from model files other than TS types (circular imports).
  - [ADAPT:  .types.server.ts → types under src/node/] If there are server-specific types, use e.g. `publish.types.ts` and `publish.types.server.ts`.
- [ADOPT] **The folder's import graph is a DAG, with `<feature>.types.ts` at the BOTTOM:**
  - [CONFLICT → D4:  barrel namespace;  else import type * as PT, never T] It imports no feature module, no DOM, no Svelte -- ideally no VALUES at all, so
    `import type * as T` erases completely. `tours.types.ts` gave up its last value import
    (`splitSelectors`) to hold that line.
  - [CONFLICT → D4:  import { P } from "$/name", one per package] Everything above it takes it as `import * as T from "./<feature>.types"` or `import { T }) from "$lib/feature"` (§4).
  - Write the position into the module docstring (§6), and keep the arrows one-way:
    `tours.types` ← `tourGeometry` ← `ToursApp`, and `TourRun` ← `ToursApp`.
  - [ADAPT:  to package util;  $/util only if 2+ packages (D8f)] Two modules that both need a helper and can't agree who owns it is the signal that the
    helper is generic -- promote it.
- [ADAPT:  = <folder>.types.ts + class file;  no DOM in types] **Multi-file features split** for complex, interrelated features
  - `CircuitDrag.types.ts` (types + guards + shared constants + DOM entry points)
  - `CircuitDrag.ts` (business logic)
  - [CONFLICT → D4:  no per-feature namespace;  the package's one] Access split features through the namespace (`CD.onDragStart()`).
- [ADAPT:  apps → hosts (editor, runner, web components)] **Cross-app functionality:** (`/publish`)
  - Locate in `<feature>Controller.ts` of free exported functions — NOT private methods on the app class.
  - Implement as a controller class if there is shared state.
- [CONFLICT → D4:  ONE namespace per package, not per folder] **Barrel + one-to-two-letter namespace exports:**
  - e.g. `publish/index.ts` does `export * from ...` plus `export * as P from ...`
  - Consumers write e.g. `import { P } from $lib/publish` and reference as `P.PublishBlock`
  - [HAVE → AGENTS.md "Imports"] Avoid leaf-module named-import lists with more than one or two entries.
- [ADAPT:  apps → hosts (editor, runner, web components)] **Apps are thin adapters:**
  - Public entry method <10 lines that delegates to a shared controller.
- [ADOPT] **Consolidate options bag gather for related functions**: (see `CDApp:getPublishOptions()`)
  - If options are passed to many controller routines, have one private `get<X>Options()`
    that validates and returns an options bag with model-specific callbacks.
- [DROP:  construct-app's sibling apps (Construct/Circuits)] **Symmetric copy-paste across apps over abstract base classes:**
  - Mirror adapters near-verbatim in multiple apps which use the same controller methods.
- [DROP:  addFileSpec registry is construct-app's] **Register file types at module load:**
  - `addFileSpec("qre", {...})` at the top of the model file (`QRE.ts`).
- [CONFLICT → D8f:  $/util only if 2+ packages, else package util] **Promotion path -- a helper generic enough to lose its feature vocabulary moves to
  `$lib/util/`, and gets RENAMED on the way:**
  - [ADOPT] Strip the feature word from the file, the exports AND every doc comment. `tourTargets.ts`
    → `elements.ts` (`ElementRoot`); `TourTargetTracker` → `ElementTracker.ts` ("step's target"
    became "watched elements"); `clamp` → `math.ts`; `safely`/`disposeAll`/`settle`/`runHook`
    → `hooks.ts`; `Rect` → `css/CSS.types.ts`.
  - [HAVE → packages/util/AGENTS.md "Overview"] Barrel it through `$lib/util/index.ts`.
  - [ADOPT] **It must not import back down into the feature.** Swap feature types for general ones
    (`T.Disposer` → `SafeCallback`), and where the shared home would invert the dependency,
    keep a small private copy instead (hub §2's DRY boundary).
  - [ADAPT:  re-export from the $/util barrel, never a deep path] A promoted type can be RE-EXPORTED from the feature's types module so call sites keep their
    local vocabulary: `export type { Rect } from "$lib/util/css/CSS.types"` keeps `T.Rect`
    working everywhere.
  - [ADOPT] Moving it is usually also a chance to fix it: `waitForElements()` observes the shadow root
    rather than always `document`, which the tour-shaped version could never have done.
