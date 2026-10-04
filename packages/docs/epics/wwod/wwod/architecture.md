# WWOD spoke -- Architecture & module layout

Where code lives:  folders, files, barrels, namespaces, singletons, promotion to `util`.
Read with `packages/agents/wwod/WWOD.md` (the hub).
From:  original WWOD §8, root `AGENTS.md` "Types / Exports" (files, barrels, namespaces).

## 8. Architecture & module layout

- **Feature-cohesive folders beat layer-cohesive:**
  - A feature gets its own folder -- a package, or a folder under a package's `src/` -- with its own barrel, its
    tests beside the files they test, and a `README.md` where a reader needs one (every package has one, WWOD §6).
  - Why:  a change to one feature stays in one folder, rather than touching a `models/`, a `controllers/` and a
    `views/`.

- **One exported class per file:**
  - One exported class per file, file named for the class.  e.g. `Keyword.ts`, `Symbol.ts`
    rather than both living in `Literal.ts`.
  - A family of helper functions shares ONE capability-named file:  `packages/server/src/ports.ts` (`isFree` +
    `freePort` + `listenPreferred`), `packages/server/src/safePath.ts` (`resolveInside` + `isInside`).
  - Avoid single-concept micro-modules:  a one-function file, a one-constant file.
  - Separate a file's functional groups with `////////////////` group headers (WWOD §6).
  - Tests follow their module:  `Router.ts` => `Router.test.ts`.  Rename the test with the module.
  - NOT:  "fewer, bigger files" holding several classes -- a class is found by its file name, and a barrel lists
    its leaf files base-classes-first.

- **File naming:**
  - PascalCase when the module IS one class and nothing else:  `Router.ts`, `FileLock.ts`, `Logger.ts`.
  - camelCase capability name when it holds a family:  `ports.ts`, `safePath.ts`, `bodies.ts`.
  - The folder's types:  `<folder>.types.ts` (below).
  - Node-only code:  a `src/node/` folder (`packages/spell/src/node/`), or a `.node.ts` suffix
    (`packageVersion.node.ts`).  Its types live beside it, e.g. `packages/spell/src/node/server.types.ts`.
  - A custom element's files take its tag:  `ui-button/ui-button.types.ts` ...  SEE:  `packages/ui/AGENTS.md`
    "Overview".
  - NEVER any other kebab-case name.  Existing ones (`packages/spell/src/node/disk-fetch.ts`, `file-utils.ts` ...)
    are `CODE-DEBT.md` entries.

- **A folder's shape:  types file, class files, barrel.**  Consolidate to that shape before you ship it, not in a
  later pass:
  - `<folder>.types.ts` -- every type, the constants, the small error classes and the pure helpers over them.
  - one file per class, named for the class.
  - one pure-helpers file if the folder has any, capability-named.
  - `index.ts` (the barrel), and a `README.md` where a reader needs one.
  - e.g. `packages/server/src/page/`:  `page.types.ts`, `PageServer.ts`, `PageEditor.ts`, `RunningEpics.ts`,
    `index.ts`, plus `cli.ts`, the `yarn server` entry point the barrel leaves out.

- **Class first, its types and helpers below:**
  - Types and helper functions appear AFTER the durable JS structure that uses them, e.g. `ScopeProps` goes
    directly below `class Scope`.

- **`<folder>.types.ts`:**
  - Centralize shared types in a single `<folder>.types.ts` per folder, e.g. `parser.types.ts`, `rules.types.ts`.
  - NEVER bare `types.ts` or `constants.ts` -- constants, small error classes and pure helpers
    for those types live in `<folder>.types.ts` too.
    - Error classes:  WWOD §5.
  - Group with `// ## Group Name` headers.
  - MUST be runtime-light:  `import type` only, apart from the package's utilities (`$/util`, `$/ui/util`).
    - Why:  a types file that imports VALUES from its folder's class files is a circular import.
  - Exception:  props types live in the defining file -- WWOD §9 › "Props types live with their class".

- **The folder's import graph is a DAG, with `<folder>.types.ts` at the BOTTOM:**
  - It imports no class module of its folder, no DOM, no Solid -- ideally no VALUES at all, so its imports erase
    completely.
  - Everything above it takes it through the package's ONE namespace, `import { P } from "$/parser"` (WWOD §4).
  - Only where the barrel can't load:  a types-only namespace import of the leaf, named `<NS>T`, never a bare `T`.
    `packages/app/src/editor.ts`:  `import type * as UIT from "$/app/ui/ui.types"`.
  - Write the file's position into its module docstring (WWOD §6), and keep the arrows one-way:
    `page.types` <- `PageServer` <- `cli`, and `PageEditor` / `RunningEpics` <- `PageServer`.
  - Two modules that both need a helper and can't agree who owns it:  the helper is generic -- promote it
    (below, "Promotion path").

- **Split a complex feature into types and logic:**
  - `<feature>.types.ts` -- types, guards, shared constants.  NO DOM:  DOM entry points go in the logic file.
  - `<Feature>.ts` -- the logic, a class named for the file.
  - Callers reach both through the package's namespace (`P.X`).
  - NOT:  a namespace per feature (`CD.onDragStart()`) -- ONE namespace per package (below).

- **Hosts are thin adapters:**
  - Our hosts:  the editor (`packages/app/src/editor.ts`), the runner (`packages/app/src/runner/`), the web
    components `<spell-app>` / `<spell-editor>` (`SpellAppElement.tsx`, `SpellEditorElement.tsx`).
  - A host's public entry method is under 10 lines, and delegates to shared code.
  - Code more than one host uses lives in a capability-named file of free exported functions -- NOT private methods
    on a host class.  `packages/app/src/runner/runCompiled.ts` (`runCompiled()`, `unmountApp()`) serves
    `SpellAppRunner`, `VSCodeRunner` and `<spell-app>`.
  - A class instead once that code has shared state.

- **Gather related options in one place:**
  - When many routines take the same options, one private `get<X>Options()` validates them and returns the bag,
    callbacks for the caller's model included.

- **Singleton services are classes, stateless ones too:**
  - A service with no per-instance state is `static` members on the class that owns its domain, with a docstring
    saying why static (WWOD §12).
  - No owning class:  a small class of its own, all `static`.  `ExampleSource`
    (`packages/ui/src/docs-components/ui-docs-example/ExampleSource.ts`):  `ExampleSource.snapshot()`,
    `ExampleSource.of(host)`.
  - A registry, signal bus or menu module with no per-instance state folds into its owner's statics:  callers read
    better (`Owner.add()`, `Owner.fire()`), and the folder's import graph loses edges.
  - `ui`'s runtime services are classes on ONE per-page instance (`UI.keyboard` ...) -- SEE:  `packages/ui/AGENTS.md`
    "Overview" and "UI rules".
  - NOT:  an object literal with an extension registry when no class owns the domain
    (`Serializer.addClass({ ... })`) -- one shape for every service, and a class gains state, `@proto static`
    defaults or a subclass without its callers changing.

- **Barrels:**
  - Create barrel `index.ts` for each folder:
    - header comment block explaining the barrel, with `NOTE:` for anything deliberately left out or namespaced
    - `export * from "./<folder>.types"` first, then leaf files base-classes-first
    - sub-folder barrels are flattened in:  `export * from "./rules"`
  - Barrels MUST NOT pull in optional sub-systems.  Make them opt-in via side-effect import, e.g.
    `import "$/parser/rulex"` registers itself on `Parser.rulexParser`.
  - When refactoring imports and exports, if you encounter circular import problems create smoke tests
    (`barrel.test.ts`) ensuring no circular import problems in TS/rollup/browser for various entry points.

- **ONE self-namespace per package:**
  - Each sub-system has ONE self-namespace, exported from its top barrel:  `export * as P from "."`
    - each package's `AGENTS.md` lists its own, e.g. `P` ~== `$/parser`
    - NEVER create a second namespace for a sub-folder (no `R` for rules) -- flatten into parent.
    - Exception:  namespace a file whose names would collide when flattened:
      `export * as render from "./renderAST"` + `export * as stringify from "./stringifyAST"`,
      which deliberately export the same names with different return types.
    - Prefer a disambiguating affix over a namespace when the names allow it -- token and AST classes
      are `WordToken` / `ASTLiteral` etc. and flatten straight into `$/parser`.
    - NOTE:  `export *` through a circular barrel is riskier than a named re-export -- it must read the
      leaf's key list EAGERLY, so a mid-body leaf contributes nothing.  See `parser`'s `src/barrel.test.ts`.
  - Consumers import the namespace and qualify at the use site:  `import { P } from "$/parser"` => `P.Match`
    (WWOD §4).
  - A package's deliberate extra namespaces are listed in its own `AGENTS.md` "Types / Exports", with the reason
    (`ui`:  `E`, `SSR`, `UIT`;  `app`:  `UI`, `F`).
  - NOT:  a one-to-two-letter namespace per feature folder (`export * as P from "./publish"`) -- one per package.

- **Promotion path:**  a helper generic enough to lose its feature vocabulary moves up, and is RENAMED on the way.
  - Where to:  the package's own util (`$/ui/util` ...) while one package uses it;  `$/util` only once 2+ packages
    do.  SEE:  `packages/util/AGENTS.md` "Overview" for what may land there (generic files vs `src/spell/`).
  - Strip the feature word from the file, the exports AND every doc comment.
  - Barrel it through its new home's barrel, e.g. `packages/util/src/index.ts`.
  - It MUST NOT import back down into the feature.  Swap feature types for general ones, and where the shared home
    would invert the dependency, keep a small private copy instead (WWOD §2's DRY boundary).
  - A promoted type may be RE-EXPORTED from the feature's types file so call sites keep their local vocabulary:
    `export type { X } from "$/util"` -- from the barrel, never a deep path.
  - Moving it is usually also a chance to fix it:  the general version can take a parameter the feature-shaped
    one never needed (a root to search, not always `document`).
