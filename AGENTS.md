# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this repository.

## Overview

## Documentation

- Create and maintain a markdown docstring comments before:
  - types and each property in a type
  - classes and class methods/fields
  - loose methods
- Explain _why_, don't just restate the code.
- Make sure to note side effects and unexpected conventions.
- Format:
  - informal style, one line and then `-` bullets
  - DO NOT use jsdoc `@param` etc
  - terse text, e.g. `last server version`, not `the last known server version`
  - two spaces after a period
  - backticked identifiers/types
  - format lists as bullets rather than inline commas
  - `~==` for "equivalent to" and `===` for exactly equals
- Marker vocabulary / invariants: NOTE, TODO, SIDE EFFECT, HACK, NEVER, MUST, DOCME, RENAME, DEPRECATED
- Wrap comments at english phrase boundaries, not mid-clause. Avoid single or double widow words,
  wrap `e.g.` clauses if they don't fit on the original line, etc.
  and drop filler articles (`the`, `a`) that don't earn their place
- Write or clarify docstrings and comments where you see marker `DOCME`.
- Separate function code groups like so:

```
////////////////
// ## Group Name
////////////////
```

- Separate React components with a header like so:

```

/****************
 * ### `<ComponentName>`
 * Description of the component.
 ****************/
```

## Types / Exports

- ALWAYS use `type` rather than `interface`. Wrap with `Prettify` when combining types.
- One exported class per file, file named for the class.  e.g. `Keyword.ts`, `Symbol.ts`
  rather than both living in `Literal.ts`.
- Types and helper functions appear AFTER the durable JS structure that uses them,
  e.g. `ScopeProps` goes directly below `class Scope`.
- Centralize shared types in a single `<folder>.types.ts` per folder, e.g. `parser.types.ts`, `rules.types.ts`.
  - NEVER bare `types.ts` or `constants.ts` -- constants, small error classes
    and pure helpers for those types live in `<folder>.types.ts` too.
  - Group with `// ## Group Name` headers.
  - MUST be runtime-light:  `import type` only, apart from `~/util`.
  - Exception: class constructor props (`XProps`) and React component props live in the defining file.
    Move to `<folder>.types.ts` once a second file needs them.
- Create barrel `index.ts` for each folder:
  - header comment block explaining the barrel, with `NOTE:` for anything deliberately left out or namespaced
  - `export * from "./<folder>.types"` first, then leaf files base-classes-first
  - sub-folder barrels are flattened in:  `export * from "./rules"`
- Each sub-system has ONE self-namespace, exported from its top barrel:  `export * as P from "."`
  - `P` ~== `~/parser`
  - `SP` ~== `~/languages/spell`
  - `UI` ~== `~/app/ui`
  - `F` ~== `~/app/ui/forms`
  - `SC` ~== `~/spellCore`
  - NEVER create a second namespace for a sub-folder (no `R` for rules) -- flatten into parent.
  - Exception: namespace a file whose names would collide when flattened, and flatten only its base class:
    `export { Token } from "./Tokens"` + `export * as Tokens from "./Tokens"`.
    Same for `AST` / `ASTNode`, `render`, `stringify`.
- Barrels MUST NOT pull in optional sub-systems.  Make them opt-in via side-effect import,
  e.g. `import "~/languages/rulex"` registers itself on `Parser.rulexParser`.
- When refactoring imports and exports, if you encounter circular import problems 
  create smoke tests (`barrel.test.ts`)  ensuring no circular import problems in 
  TS/rollup/browser for various entry points.

## Imports

- ALWAYS import starting from `~`, NEVER start import from `../`.
- OK to import from direct peers: `import { Rule } from "./Rule"`, but not subdirectories -- use `~/...` instead.
- Prefer ONE namespace import per sub-system and qualify at use site:
  `import { P, AST } from "~/parser"` => `P.Match`, `new P.Symbol(...)`, `AST.Expression`.
  - Applies INSIDE the sub-system as well.
  - Self-import uses full path too, even from same folder as the barrel:
    `import { P } from "~/parser"`, NEVER `import { P } from "."`.
    Only the barrel itself says `"."`:  `export * as P from "."`.
  - NEVER reach into another sub-system's leaf file for something its barrel exports.
  - OK to refer to file's own class unqualified.
  - Tests may mix: `import { P, Match, Parser } from "~/parser"`.
- Circularity rules for files inside a barrel:
  - `P.X` as a VALUE is fine inside function / method bodies -- resolved at call time.
  - NEVER use `P.X` at module-evaluation time:  `extends` clauses, static initializers,
    top-level `new`.  Circular reentry silently yields `undefined` / broken `instanceof`.
  - Import base classes directly from the defining file, with comment:
    `// Import directly to avoid circular import`
  - Use `import type { P }` when file only needs types, e.g. `*.types.ts`, `Tokens.ts`.
- Import order:
  - node_modules
  - (blank line)
  - `~/util` and other general utilities, general-to-specific
  - other sub-system barrels
  - own barrel
  - direct peer files, base classes first
  - (blank line)
  - side-effect imports (`import "~/languages/rulex"`)
  - css or less files (`./foo.css` if in same folder, else `~/path/to/foo.less`)
- One import statement per module.  Inline type imports:  `import { P, type AST } from "~/parser"`.
