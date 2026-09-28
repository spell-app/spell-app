# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this repository.

## Overview

- `src/parser/` (`P`) is a generic rule-based parser;  `src/languages/spell/` (`SP`) is the spell language on it.
- `src/lsp/` (`LSP`) is spell's language server, and `vscode-extension/` the VS Code extension that runs it --
  its own yarn project (own `package.json` + `yarn.lock`), NOT a workspace of the repo's.  See "Language server" in `PARSING.md`.

## How parsing works

- `PARSING.md` is a compact map of the parse pipeline:  tokens, block / line / statement, when scope changes,
  how projects share a parser.  Read it BEFORE digging into parser internals.
- MUST keep it up to date in the same change whenever the parsing mechanism changes -- generic `Parser`, `SpellParser`,
  scopes, or the `Block` / `BlockLine` / `SpellStatement` machinery.

## Long-term debt

- `CODE-DEBT.md` tracks structural debt we have knowingly chosen NOT to fix yet.
- Add an entry when a problem is structural, too big to fix in passing, and being tolerated
  deliberately -- especially when a test or lint rule is pinned, skipped or widened to
  accommodate it.  Record the mechanism, not a guess, so nobody rediscovers it.
- NOT for local cleanups (inline `REFACTOR:` marker), suspected bugs (`SUSPECTED-BUGS.md`)
  or tooling papercuts (`PAPERCUTS.md`).
- See that file's header for the entry format.

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
- Always place a blank line before a group header like the below.
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

## Functions

- An inner helper that doesn't use `this` is NOT an inline arrow (`const visit = (...) => ...`).  Either:
  - make it a private helper function, or
  - declare it `function visit(...) {...}` at the BOTTOM of the enclosing function, after any `return`,
    with a docstring saying what it does -- hoisting makes it callable from above.
- Arrow functions stay fine for short callbacks passed inline, e.g. `tokens.map((token) => token.value)`.

## Parser rules

- A rule is a CLASS (behaviour) plus a DEFINITION (props) passed when registering it:
  `parser.addRule(RuleClass, { syntax, alias, precedence, testRule, tests, ... })`.
  - Definition is type-checked against that class's `Props` -- a typo'd prop is a compile error.
  - Class name IS the rule name.  Pass `name: "if"` only for reserved words (`class _if`) or computed names.
    Prod build MUST keep `output.keepNames` (`vite.config.ts`), pinned by `parser/build.test.ts`.
  - `syntax` may be an array:  one rule instance per variant, each optionally `{ syntax, testRule }`.
  - Nothing is inherited from a parent rule's definition.  Share with a constant, e.g. `VARIABLE_SYNTAX`.
  - What EVERY rule of a base class has in common (e.g. `SpellIdentifier`'s `pattern` + `blacklist`) goes in
    that base class's constructor as defaults:  `super({ pattern, blacklist, ...props })`.
  - See `languages/spell/rules/variables.ts` for the finished shape, and the top docstring in
    `parser/rules/Rule.ts` for all the ways to make a rule.
  - `@proto static` (from `~/util`) is for a shared base class's DEFAULTS -- values true of every subclass,
    e.g. `SpellExpression`'s `alias = "expression"`, `InfixOperatorSuffix`'s `alias = "expression_suffix"`,
    `MethodDefinition`'s `inlineInitialType = false`.  A rule's own definition OVERRIDES the default
    (props are assigned after the prototype), so an exception just states its own value.
  - Put a prop on the base class when EVERY subclass wants the same value;  leave it in the definition when
    rules differ (e.g. `precedence`).
    A REGISTERED rule never uses `@proto static` -- its values go in its `addRule()` definition.
- A statement with a BODY -- an inline statement, or an indented block under it -- says so with a body
  keyword at the END of its `syntax`, e.g. `if {condition:expression} (then|:)? {statement_body}?`:
  - `{statement_body}` ~== `({inline_statement}|{nested_statements})`
  - `{expression_body}` ~== `({inline_expression}|{nested_statements})`
  - see `BODY_KEYWORDS` in `Statement.ts` for the rest
  - read the parsed body with `this.getBody(match)`, NEVER `match.groups.body` -- see `SpellStatement`
- A statement that DECLARES something -- a type, property, method, variable, event handler -- says so for
  editors' symbol lists with `declares` in its definition, naming the groups that hold the name and owning type,
  e.g. `declares: { kind: "property", name: "property", of: "type" }`.
  - Override `getDeclaration(match)` for what a spec can't say, e.g. when only SOME matches declare something.
  - NEVER make editor code switch on rule names -- see `Rule.getDeclaration()`.
- A rule whose matches hold words an editor should colour says how with `highlightAs`, e.g.
  `highlightAs: "property"` -- see `P.HighlightKind`.  Base classes set it for their family
  (`SpellIdentifier` => `"variable"`, `Keyword` => `"keyword"`), so most rules need nothing.
- Rule module layout, top to bottom:
  - header docstring, imports
  - `export const <module> = new SpellParser({ module: "<module>" })` -- at the TOP, classes can't be hoisted to it
  - then for EACH rule, in tie-break order (when two rules tie on precedence and length, the EARLIER wins):
    - a group header naming the rule and showing what it matches, exactly this shape -- `e.g.` indented 4
      so it lines up under the rule name, and the example taken from the rule's own `tests` so it stays true:
      ```
      ////////////////
      // ## `known_variable` rule
      //    e.g. "the thing", if `thing` is in scope
      ////////////////
      ```
      A base class which is never registered gets `` // ## `SpellIdentifier` base class ``;  a rule whose class
      name differs gets `` // ## `number` rule (class `numeric`) ``.  A broad SECTION spanning several rules
      uses a wider banner one level up:  `// # Various flavors of whitespace`.
    - supporting constants / types for that rule (`VARIABLE_SYNTAX`, `type VariableMatchData`) -- the header
      goes ABOVE these, it marks where the rule starts, not where its class starts
    - docstring + `class known_variable extends ... {}` (exported only if something outside the file needs it)
    - `<module>.addRule(known_variable, {...})` immediately after the class, `tests` LAST in the definition
  - Tests need no type annotations there.  Each module needs a sibling `<module>.test.ts` calling
    `unitTestModuleRules()`, or its tests never run.
- Type arguments:  `Rule<Props, Groups, MatchData>`, all defaulted so bare `P.Rule` / `P.Sequence` / `P.Match` work.
  Rule base classes fix `Props` so authors write `SpellStatement<"type|property|specifier?", { ruleComment?: ... }>`.
  - `rule.matchGroup` (was `argument`) is the name a rule's match goes under in `match.groups`, e.g. `{thing:expression}`.
  - `Groups` is a `P.GroupsFor` spec:  `name` required, `name?` optional, `name[]` array.
    Copy it from the module's `__snapshots__` file, which is computed from real `syntax` (`rule.groupSpec`).
    Use an object type when `getGroupsForMatch()` derives non-`Match` values.
  - `MatchData` is what rule stashes on its matches, read as `match.data.foo`.
  - Hooks take `match: P.MatchFor<this>`.  To read another rule's match, narrow with `match.is(other_rule)`.
- `match.groups` holds ONLY what the syntax matched (`Match | Match[]`).  Anything a rule works out for itself
  goes in `match.data`, typically via a caching method:  `getBits(match) { return (match.data.bits ??= ...) }`.
  NEVER override `getGroupsForMatch()` to add derived values.
- In `match.data`, use `NONE` (from `~/util`) for "looked, not found" rather than `null`;  name scope lookups
  `scopeVar` / `scopeConstant` / `scopeType`.
- ONLY `mutateScope()` changes scope.  `getAST()` MUST be pure:  NEVER change scope, NEVER look it up -- ASTs are
  built lazily, when scope may have moved on.  Look up what the AST needs WHILE PARSING, into `match.data`.
- A rule built WHILE PARSING goes through `scope.addRule(RuleClass, definition, match)` -- never `parser.addRule()`
  directly -- so the scope records the class + definition pair and can hand on the rules it created.
- A `mutateScope()` that adds a scope record -- a variable, constant, type, rule or `MethodScope` -- passes
  `declaredBy: match` (the third argument for `scope.addRule()`), so editors can find where it was declared.
- Rules are IMMUTABLE (frozen on registration) and shared by every parse.
  NEVER store per-parse state on a rule, NEVER add ad hoc fields to a `Match` -- use `match.data`.
- Exception to "one exported class per file":  a rule module holds many snake_case rule classes.
  Export ONLY what something outside the file needs -- a base class to subclass, or a rule to narrow with
  `match.is()`.  Leaf rules stay unexported;  other modules reach them by NAME, through `syntax` / `parser.rules`.
- A base rule class for a category of spell things is `Spell<Thing>`, paired with the lowercase rule it fathers:
  `SpellConstant`/`constant`, `SpellType`/`type`, `SpellIdentifier`/`identifier`.
- Name rules for what they MATCH, not just what they mean.  In `variables.ts`, `identifier` /
  `singular_identifier` / `plural_identifier` match a bare word, while `variable` / `known_variable` also
  allow a leading `the`;  a family sharing a prefix should share its shape.

## Decorators

- Use STANDARD (TC39 2023-11) decorators, NEVER `experimentalDecorators`.  General-purpose ones live in `~/util/decorators.ts`.
- Lowered by esbuild via `vite.decorators.ts`, used by BOTH `vite.config.ts` and `vitest.config.ts` -- vite 8's own
  transformer (oxc) doesn't do it yet.  Server is fine as `tsx` is esbuild already.
- A decorator MUST be the first thing on its line (`@proto static inlineInitialType = false` is fine,
  and preferred) or that plugin won't notice the file.

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
  - Exception: namespace a file whose names would collide when flattened:
    `export * as render from "./renderAST"` + `export * as stringify from "./stringifyAST"`,
    which deliberately export the same names with different return types.
  - Prefer a disambiguating affix over a namespace when the names allow it -- token and AST classes
    are `WordToken` / `ASTLiteral` etc. and flatten straight into `~/parser`.
  - NOTE: `export *` through a circular barrel is riskier than a named re-export -- it must read the
    leaf's key list EAGERLY, so a mid-body leaf contributes nothing.  See `parser/barrel.test.ts`.
- Barrels MUST NOT pull in optional sub-systems.  Make them opt-in via side-effect import,
  e.g. `import "~/languages/rulex"` registers itself on `Parser.rulexParser`.
- When refactoring imports and exports, if you encounter circular import problems 
  create smoke tests (`barrel.test.ts`)  ensuring no circular import problems in 
  TS/rollup/browser for various entry points.

## Imports

- ALWAYS import starting from `~`, NEVER start import from `../`.
- OK to import from direct peers: `import { Rule } from "./Rule"`, but not subdirectories -- use `~/...` instead.
- Prefer ONE namespace import per sub-system and qualify at use site:
  `import { P } from "~/parser"` => `P.Match`, `new P.Symbol(...)`, `P.ASTExpression`.
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
- One import statement per module.  Inline type imports:  `import { P, type AnyMatch } from "~/parser"`.
