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
- Centralize type definitions and helper functions in a single `types.ts` file in each folder, rather than spreading them amongst leaf files.
- If a particular file has complex type requirements, ok to define a `x.types.ts` file for it, and re-export from the main file. e.g. File `Match.types.ts` for `Match.ts` => `Match.ts` should `export * from ./Match.types`.
- Create barrel `index.ts` for each folder, including most functionality in the folder. At the end of the barrel, come up with a 1-2 letter barrel name as `export * as P from "."`.

## Imports

- ALWAYS import starting from `~`, NEVER start import from `../`.
- OK to import from direct peer directories: `import thing from "./thing`, but not subdirectories -- use `~/...` instead.
- Prefer barrel-style imports, e.g. `import { P } from "~/parser`, `import React from "react"`.
  - Exception: Import base classes or other circular references directly from the file which defines them.
- Import order (blank line between groups):
  - node_modules
  - `~/util` and other general utilities, general-to-specific
  - imports from other sub-systems
  - local models / helper files
  - css (`./` as `~/...`)
