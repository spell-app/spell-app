# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/spell` (`$/spell`, `SP`).

**READ the repo root's `AGENTS.md` and WWOD (`agents/wwod/WWOD.md`) FIRST:**  the repo's layout, and the
house style every package shares.  Only what's local is below;  a section named like a WWOD rule extends it.

## Overview

- This package is the spell LANGUAGE:  `src/` (`SP`) is spell's rules, `SpellParser`, `SpellProject` and friends,
  on the generic parser.  The pieces around it are packages of their own, beside this one:
  - `../parser` (`$/parser`, `P`) -- the generic rule-based parser.  `PARSING.md` (here) maps its pipeline.
  - `../core` (`$/core`, `SC`) -- the runtime compiled spell runs on.
  - `../util` (`$/util`) -- utilities.
  - `../lsp` (`$/lsp`, `LSP`) -- spell's language server.  See "Language server" in `PARSING.md`.
  - `../vscode` -- the VS Code extension that runs it:  its own yarn project, NOT a workspace.
  - `../app` (`$/app`) -- the web app, its server, the runner and `<spell-app>` / `<spell-editor>`.
    `yarn start` is run THERE.
  - `../cli` -- the `spell` command line, which runs this package's SOURCE (and the others') through `tsx`.
- `src/rules/` is spell's rule modules (see "Parser rules" below);  `src/parserTests/` holds parser tests that
  need the spell grammar (the generic ones are in `../parser`).
- `src/node/` (`$/spell/node/...`) is NODE-ONLY:  `environment`, `packageVersion.node`, `disk-fetch`, `file-utils`,
  `project-utils`, `response-utils`, `server.types`.
  - The barrel NEVER exports it.  Other packages may import these files by name, one of the deep-import exceptions
    (WWOD §4 › "Package aliases, never `../`");  the app's server does.
  - Nothing reachable from `$/spell`'s barrel may import it (WWOD §8 › "Barrels").
- `src/highlight/` -- `SpellHighlighter` (`SP.SpellHighlighter.spans(text)`):  colours a snippet without a project, for
  `<ui-code language="spell">`.  `browser.ts` is the entry `@spell-app/ui`'s `yarn gen:spell` bundles:  after changing
  the grammar, run it there so `ui`'s committed bundle follows.
- `src/test/` (`$/spell/test`) holds the test helpers, e.g. `loadFixtureProject()`, `fixturePath()`,
  `fixtureProjectId()`.
- `projects/` holds every spell project, OUTSIDE `src/`:  `system/examples/`, `system/library/`, `system/guides/`,
  `user/` and `test/` -- the `@system:examples` etc. roots.  See "Projects" in `PARSING.md`.
  - Tests read ONLY `projects/test/` (`@test:fixtures` ~== `@test/<Project>`, listed in the app in dev only):  frozen projects, never
    the live examples, which get edited.  Use `loadFixtureProject()`, `fixturePath()`, `fixtureProjectId()` from
    `$/spell/test` -- and NEVER update a fixture to follow its example.
  - Each fixture's compiled output is checked against `<Project>.snapshot.js` beside it (`src/test/fixtures.test.ts`).
    Add a fixture by copying a project in;  after a deliberate change, `yarn test:fixtures:bless` and read the diff.
- `readme.md` is the project's front page.  Docs live in `packages/docs/` (see "Creating docs").
- `src/index.ts` is the barrel, loaded in browsers AND the app's server (WWOD §8 › "Barrels").  It imports
  `$/core`'s TYPES only, never its code.

## How parsing works

- `PARSING.md` is a compact map of the parse pipeline:  tokens, block / line / statement, when scope changes,
  how projects share a parser.  Read it BEFORE digging into parser internals.
- MUST keep it up to date in the same change whenever the parsing mechanism changes -- generic `Parser`, `SpellParser`,
  scopes, or the `Block` / `BlockLine` / `SpellStatement` machinery.

## Creating docs

- Docs for people -- design notes, research, references -- live in `packages/docs/` (`@spell-app/docs`), for every
  package.  How to write one:  `packages/docs/AGENTS.md`.

## Parser rules

- A rule is a CLASS (behaviour AND what the rule is) plus its `syntax` + `tests`, passed when registering it:
  `parser.addRule(RuleClass, { syntax, tests })`.
  - Everything else -- `alias`, `precedence`, `declares`, `highlightAs`, `datatype`, `tokenType`, `pattern` ... --
    goes ON THE CLASS as `@proto static` (from `$/util`), e.g. `@proto static alias = "expression"`.
    Why:  the class is the rule, reusable by other languages' parsers with their own `syntax`.
    As WWOD §12 › "`@proto static` defaults" (declared props only;  inherited), plus:  `syntax`, `tests` and
    `ruleName` are NOT inherited -- share syntax with a constant, e.g. `VARIABLE_SYNTAX`.
  - Class name IS the rule name.  Use plain `static ruleName = "if"` only for reserved words (`class _if`)
    or when class name isn't rule case (`class Block` => `"block"`).
    So the prod build keeps class names:  `../parser/AGENTS.md`, `keepNames`.
  - ONE `syntax` per registration.  A rule with several calls `addRule()` once per syntax, each with the
    `tests` for that syntax, e.g. `assignment_statement`.  Instances merge into a `P.Group` under the rule's name.
  - Put a prop on a base class when EVERY subclass wants the same value, e.g. `SpellExpression`'s
    `alias = "expression"`, `MethodDefinition`'s `inlineInitialType = false`.  A subclass just states its own
    value for an exception.
  - Constructor defaults (`super({ pattern, blacklist, ...props })`, see `SpellIdentifier`) also work for
    what every rule of a base class has in common.
  - See `src/rules/variables.ts` for the finished shape, and the top docstring in
    `../parser/src/rules/Rule.ts` for all the ways to make a rule.
  - `SpellParser.addRule()` and `scope.addRule()` only TYPE `{ syntax, tests }` (`P.SyntaxAndTests`),
    so a stray `alias` there is a compile error.
  - Rules built WHILE PARSING (`scope.addRule()`) are a named class `specialize()`d with plain-data statics,
    e.g. `DynamicMethodRule.specialize({ output: "play_fizzbuzz", alias })` -- and the definition is still
    just `{ syntax }`.
    - NEVER a closure class:  its behaviour reads ONLY its statics, so a project's declarations can rebuild it
      in another project.  Give its base class `@proto static importableAs = "<id>"`, e.g. `"enumeration"`.
    - What it's `specialize()`d with is written out as is -- so an importable class overrides `specialize()`
      to take a MINIMAL set, named in `declare static readonly SpecializeWith`, and works out the rest
      for `super.specialize(statics, declared)`.  See `P.SpecializeWith`.
    - Its `static declarationProps(declared, syntax)` says what goes in the declaration -- tune output there.
  - A class or rule name is NOT a stable identifier (WWOD §3 › "Names aren't identifiers"):  here, the explicit
    property is e.g. `@proto static importableAs = "enumeration"`.
  - A word with negated forms is a `Negatable` rule (`expressions.ts`):  `{operator:is}` matches `is` / `is not` /
    `isn't` / `isnt`, and `Negatable.isNegated(operator)` says which -- plain `is` matches just the word.
    `is`, `can`, `will`, `has` so far;  a translation registers its own, e.g.
    `addRule(Negatable.specialize({ ruleName: "es" }), { syntax: "(es|(negated:no es))" })` --
    forms in its `negated` group are the negated ones.
- A statement with a BODY -- an inline statement, or an indented block under it -- says so with a body
  keyword at the END of its `syntax`, e.g. `if {condition:expression} (then|:)? {statement_body}?`:
  - `{statement_body}` ~== `({inline_statement}|{nested_statements})`
  - `{expression_body}` ~== `({inline_expression}|{nested_statements})`
  - see `BODY_KEYWORDS` in `Statement.ts` for the rest
  - read the parsed body with `this.getBody(match)`, NEVER `match.groups.body` -- see `SpellStatement`
- A statement that DECLARES something -- a type, property, method, variable, event handler -- says so for
  editors' symbol lists with `@proto static declares`, naming the groups that hold the name and owning type,
  e.g. `@proto static declares = { kind: "property", name: "property", of: "type" }`.
  - Override `getDeclaration(match)` for what a spec can't say, e.g. when only SOME matches declare something.
  - NEVER make editor code switch on rule names -- see `Rule.getDeclaration()`.
- A rule whose matches hold words an editor should colour says how with `highlightAs`, e.g.
  `@proto static highlightAs = "property"` -- see `P.HighlightKind`.  Base classes set it for their family
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
    - constants the rule's registration reads (`VARIABLE_SYNTAX`) -- the header goes ABOVE these, it marks
      where the rule starts, not where its class starts.  They MUST precede `addRule()`:  a `const` isn't hoisted
    - docstring + `class known_variable extends ... {}` (exported only if something outside the file needs it),
      its `@proto static` props FIRST in the class body
    - `<module>.addRule(known_variable, { syntax, tests })` immediately after the class, once per syntax
    - THEN types and helper functions only this rule uses (`type VariableMatchData`, `setup_assignment_statement()`)
      -- types and function declarations are hoisted, so they can follow what uses them
  - Types and helpers SHARED by several rules go in a section at the BOTTOM of the module, e.g.
    `// ## Shared types`, so none sits above a rule that needs it.
  - Test setup shared by a rule's registrations:  `setup_<rule_class>()` returning `{ compileAs, beforeEach }`,
    spread into each block -- `{ ...setup_assignment_statement(), tests: [...] }`.
  - Tests need no type annotations there.  Each module needs a sibling `<module>.test.ts` calling
    `unitTestModuleRules()` (from `$/parser/test`), or its tests never run.
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
- In `match.data`, use `NONE` (from `$/util`) for "looked, not found" rather than `null`;  name scope lookups
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

As WWOD §12, plus:

- `vite.decorators.ts` (repo root) is used by `vitest.config.ts` here.

## Imports

- As WWOD §4, with our own `src/` as `$/spell` / `$/spell/*`.
- Imports `$/parser` (`P`), `$/core` (types only) and `$/util`.  NEVER import `$/lsp`, `$/app` or `$/cli`.
- A rule module imports the generic parser's rule classes from `$/parser`, and registers on `SpellParser` here.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SP` ~== `$/spell`

The other namespaces live in their own packages:  `P` (`../parser`), `SC` (`../core`), `LSP` (`../lsp`),
`UI` / `F` (`../app`).
