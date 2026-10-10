# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `@spell-app/spell` (`$/spell`, `SP`).

**READ the repo root's `AGENTS.md` and [WWOD](../../agents/wwod/WWOD.md) FIRST:**
- the root's:  the repo's layout
- WWOD:  the house style every package shares
- Only what's local is below.
  A section named like a WWOD rule extends it.

## Overview

- This package is the spell LANGUAGE:  `src/` (`SP`) is spell's rules, `SpellParser`, `SpellProject` and friends,
  on the generic parser.
- The pieces around it are packages of their own, beside this one:
  - `../parser` (`$/parser`, `P`):  the generic rule-based parser.
    [PARSING.md](PARSING.md), here, maps its pipeline.
  - `../core` (`$/core`, `SC`):  the runtime compiled spell runs on.
  - `../util` (`$/util`):  utilities.
  - `../lsp` (`$/lsp`, `LSP`):  spell's language server.
    See "Language server" in `PARSING.md`.
  - `../vscode`:  the VS Code extension that runs it.
    Its own yarn project, NOT a workspace.
  - `../app` (`$/app`):  the web app, its server, the runner, and `<spell-app>` / `<spell-editor>`.
    `yarn start` is run THERE.
  - `../cli`:  the `spell` command line, which runs this package's SOURCE (and the others') through `tsx`.
- `src/rules/`:  spell's rule modules (see "Parser rules" below).
- `src/parserTests/`:  parser tests that need the spell grammar.
  The generic ones are in `../parser`.
- `src/node/` (`$/spell/node/...`) is NODE-ONLY.
  - Its files:
    `environment`, `packageVersion.node`, `disk-fetch`, `file-utils`, `project-utils`, `response-utils`, `server.types`
  - The barrel NEVER exports it.
  - Other packages may import these files by name:  one of the deep-import exceptions
    (WWOD §4 › "Package aliases, never `../`").
    The app's server does.
  - Nothing reachable from `$/spell`'s barrel may import it (WWOD §8 › "Barrels").
- `src/highlight/`:  `SpellHighlighter` (`SP.SpellHighlighter.spans(text)`).
  - It colours a snippet without a project, for `<ui-code language="spell">`.
  - [The browser entry](src/highlight/browser.ts) is what `@spell-app/ui`'s `yarn gen:spell` bundles.
  - After changing the grammar, run it there, so `ui`'s committed bundle follows.
- `src/test/` (`$/spell/test`):  the test helpers, e.g. `loadFixtureProject()`, `fixturePath()`, `fixtureProjectId()`.
- `projects/` holds every spell project, OUTSIDE `src/`.
  - Its folders are the `@system:examples` etc roots:
    `system/examples/`, `system/library/`, `system/guides/`, `user/` and `test/`.
  - See "Projects" in `PARSING.md`.
  - Tests read ONLY `projects/test/`:  frozen projects, never the live examples, which get edited.
    - Its root:  `@test:fixtures` ~== `@test/<Project>`, listed in the app in dev only.
    - Use `loadFixtureProject()`, `fixturePath()`, `fixtureProjectId()`, from `$/spell/test`.
    - NEVER update a fixture to follow its example.
  - Each fixture's compiled output is checked against the snapshots beside it
    ([fixtures.test.ts](src/test/fixtures.test.ts)):
    - `<Project>.snapshot.js`:  the javascript target
    - `<Project>.snapshot.tsx`:  the TypeScript target, type-checked by `tsc` too
    - `<Project>.snapshot.declarations.json`:  its declarations
    - Add a fixture by copying a project in.
    - After a deliberate change, `yarn test:fixtures:bless`, and read the diff.
- [readme.md](readme.md) is the project's front page.
  Docs live in `packages/docs/` (see "Creating docs").
- [The barrel](src/index.ts) is loaded in browsers AND the app's server (WWOD §8 › "Barrels").
  - It imports `$/core`'s TYPES only, never its code.

## How parsing works

- [PARSING.md](PARSING.md) is a compact map of the parse pipeline.
  - tokens, block / line / statement
  - when scope changes
  - how projects share a parser
  - Read it BEFORE digging into parser internals.
- MUST keep it up to date, in the same change, whenever the parsing mechanism changes:
  - the generic `Parser`, `SpellParser`, scopes
  - the `Block` / `BlockLine` / `SpellStatement` machinery

## Creating docs

- Docs for people (design notes, research, references) live in `packages/docs/` (`@spell-app/docs`),
  for every package.
- How to write one:  [docs' AGENTS.md](../docs/AGENTS.md).

## Parser rules

- A rule is a CLASS (behaviour AND what the rule is), plus its `syntax` + `tests`, passed when registering it:
  `parser.addRule(RuleClass, { syntax, tests })`.
  - Everything else goes ON THE CLASS, as `@proto static` (from `$/util`).
    - e.g. `alias`, `priority`, `declares`, `highlightAs`, `datatype`, `tokenType`, `pattern` ...
    - e.g. `@proto static alias = "expression"`
    - Why:  the class is the rule, reusable by other languages' parsers with their own `syntax`.
    - As WWOD §12 › "`@proto static` defaults" (declared props only;  inherited), plus:
      `syntax`, `tests` and `ruleName` are NOT inherited.
      Share syntax with a constant, e.g. `VARIABLE_SYNTAX`.
  - `priority` and `precedence` are different:
    - `priority` (from the `Priority` table, `rules.types.ts`) only breaks a tie between rules matching the SAME words
    - `precedence` (from the `Precedence` table) is how tightly an operator binds
    - A new expression or operator:  `PARSING.md`, "Adding an expression rule".
  - Rule CLASSES are PascalCase;  rule NAMES are snake_case, worked out from the class name.
    - `class ListAddRelative` => `list_add_relative`, `class If` => `if`:  `P.Rule.ruleNameFor()`.
    - The rule name is what everything else says:  `syntax` (`{list_add_relative}`), `parser.rules`,
      declarations, error messages, the `__snapshots__`.
    - Plain `static ruleName = "..."` only where the class name doesn't give it,
      e.g. `class BlockLine` => `"line"`, `class SpellJSXText` => `"jsxText"`.
      - Also where the PascalCase name would hide a javascript or DOM global (`Number`, `Boolean`, `Text`,
        `Comment` ...) or reads as a parser class (`Keyword`):  a fuller class name, keeping the rule name,
        e.g. `class NumberLiteral` + `static ruleName = "number"`.
    - So the prod build keeps class names:  [parser's AGENTS.md](../parser/AGENTS.md), `keepNames`.
    - [ruleNames.test.ts](src/rules/ruleNames.test.ts) pins every rule's name, module and registration order:
      a renamed class that changes a rule's name fails it.
  - ONE `syntax` per registration.
    - A rule with several calls `addRule()` once per syntax, each with the `tests` for that syntax,
      e.g. `assignment` (`AssignmentStatement`).
    - Instances merge into a `P.Group`, under the rule's name.
  - Put a prop on a base class when EVERY subclass wants the same value.
    - e.g. `SpellExpression`'s `alias = "expression"`
    - e.g. `MethodDefinition`'s `inlineInitialType = false`
    - A subclass just states its own value, for an exception.
  - Constructor defaults also work, for what every rule of a base class has in common.
    - e.g. `super({ pattern, blacklist, ...props })`:  see `SpellIdentifier`
  - The finished shape:  [events/](src/rules/events/), one rule per file (see "Rule module layout" below).
    All the ways to make a rule:  the top docstring in [Rule.ts](../parser/src/rules/Rule.ts).
  - `SpellParser.addRule()` and `scope.addRule()` only TYPE `{ syntax, tests }` (`P.SyntaxAndTests`).
    So a stray `alias` there is a compile error.
  - Rules built WHILE PARSING (`scope.addRule()`) are a named class, `specialize()`d with plain-data statics.
    - e.g. `DynamicMethodRule.specialize({ output: "play_fizzbuzz", alias })`
    - The definition is still just `{ syntax }`.
    - NEVER a closure class:  its behaviour reads ONLY its statics.
      So a project's declarations can rebuild it in another project.
      - Give its base class `@proto static importableAs = "<id>"`, e.g. `"quoted_property"`.
    - What it's `specialize()`d with is written out as is.
      - So an importable class overrides `specialize()` to take a MINIMAL set,
        named in `declare static readonly SpecializeWith`.
      - It works out the rest, for `super.specialize(statics, declared)`.
      - See `P.SpecializeWith`.
    - Its `static declarationProps(declared, syntax)` says what goes in the declaration:  tune output there.
  - A class or rule name is NOT a stable identifier (WWOD §3 › "Names aren't identifiers").
    - Here, the explicit property is e.g. `@proto static importableAs = "quoted_property"`.
  - A word with negated forms is a [`Negatable`](src/rules/expressions/Negatable.ts) rule.
    - `{operator:is}` matches `is`, `is not`, `isn't` and `isnt`.
    - `Negatable.isNegated(operator)` says which.
    - Plain `is` matches just the word.
    - So far:  `is`, `can`, `will`, `has`.
    - A translation registers its own;  the forms in its `negated` group are the negated ones:

      ```ts
      addRule(Negatable.specialize({ ruleName: "es" }), { syntax: "(es|(negated:no es))" })
      ```

- A rule which is a statement AND an expression, ending in a whole `{x:expression}` (a method call, `wait for`):
  - `@proto static operandInExpressions = true` makes that last slot an `operand` when used INSIDE an expression.
  - So `if double x is 4` => `double(x) == 4`, while the statement `notify x + y` keeps `notify(x + y)`.
  - `SpellParser.addRule()` registers the statement and an expression twin:  see "Expressions" in `PARSING.md`.
- A statement with a BODY (an inline statement, or an indented block under it) says so with a body keyword,
  at the END of its `syntax`.
  - e.g. `if {condition:expression} (then|:)? {statement_body}?`
  - `{statement_body}` ~== `({inline_statement}|{nested_statements})`
  - `{expression_body}` ~== `({inline_expression}|{nested_statements})`
  - the rest:  `BODY_KEYWORDS`, in `Statement.ts`
  - Read the parsed body with `this.getBody(match)`, NEVER `match.groups.body`:  see `SpellStatement`.
- A statement that DECLARES something says so with `@proto static declares`, for editors' symbol lists.
  - something:  a type, property, method, variable, event handler
  - It names the groups that hold the name and the owning type,
    e.g. `@proto static declares = { kind: "property", name: "property", of: "type" }`.
  - Override `getDeclaration(match)` for what a spec can't say, e.g. when only SOME matches declare something.
  - NEVER make editor code switch on rule names:  see `Rule.getDeclaration()`.
- A rule whose matches hold words an editor should colour says how with `highlightAs`.
  - e.g. `@proto static highlightAs = "property"`;  see `P.HighlightKind`.
  - Base classes set it for their family, so most rules need nothing:
    - `SpellIdentifier` => `"variable"`
    - `Keyword` => `"keyword"`
- Rule module layout:  a module is a FOLDER, one rule class per file (epic `output-targets` P18).
  - The model:  [events/](src/rules/events/).
    Every module has this layout now.
  - `rules/<module>/<module>.parser.ts`:  the module's parser, and nothing else.
    - `export const <module> = new SpellParser({ module: "<module>" })`
    - A file of its own, so each rule file can import it without importing its siblings.
  - `rules/<module>/<RuleClass>.ts`:  ONE rule class, the file named for it, e.g. `events/Trigger.ts`.
    - Top to bottom:
      - imports:  `./<module>.parser`, peer files (a base class), `$/spell/rules/<other module>` for another's
      - constants the class or its registration reads (`LOWER_INITIAL_WORD`, in `properties/Property.ts`):
        a `const` isn't hoisted
      - docstring + `export class Trigger extends ... {}`, its `@proto static` props FIRST in the body
      - `<module>.addRule(Trigger, { syntax, tests })`, right after the class, once per syntax
      - THEN the types and helpers only this rule uses (`type VariableMatchData`, `setupAssignmentStatement()`)
        - Types and function declarations are hoisted, so they can follow what uses them.
    - The class docstring's first line starts with the RULE name, so a search for `{list_add_relative}` finds it:
      `` `list_add_relative` rule:  adds an item before or after another ``, then `- e.g. ...` from its own `tests`.
    - Every rule class is exported:  one exported class per file (WWOD §8).
    - A base class shared by several rules (registered or not):  a file of its own, named for it.
  - `rules/<module>/<module>.shared.ts`:  types, constants and helper functions SHARED by several of its rule files.
    - Only if there are any.
      What one rule alone uses stays in that rule's file.
    - e.g. `VARIABLE_SYNTAX`, in `variables/variables.shared.ts`:  two rule files read it.
    - `.shared`, not `.types`:  rule helpers build AST nodes (`new P.AST...`), values a `.types.ts` mustn't import.
  - `rules/<module>/index.ts`:  `export * from` each file, in TIE-BREAK order.
    - When two rules tie on `priority` and length, the one registered FIRST wins (`Choice.getBestMatch()`).
      Each rule registers as its file loads, so this list IS the registration order:  keep the module's old order.
    - `./<module>.parser` first, then `./<module>.shared`, then the rule files.
    - A rule file that imports a peer (its base class) loads it first:
      fine as long as the base came first in the old order too.
    - Other modules and `rules/index.ts` import the folder (`$/spell/rules/<module>`, `./<module>`) as before.
  - `rules/<module>/<module>.test.ts`:  `unitTestModuleRules(spellParser, "<module>", ...)` (from `$/spell/test`),
    or its tests never run.
    - Its `__snapshots__` (the group specs) are beside it, in `rules/<module>/__snapshots__/`.
- A rule's `tests`:  `{ input, js, ts }`, or a tuple `[input, js, ts?]` (`P.RuleTest`).
  - `js`:  what the javascript writer writes;  `ts`:  what the TypeScript writer writes.
    Leave `ts` out where it's the same as `js`.
  - `input` is parsed ONCE, then written by both:  a change to either writer fails the rule's own tests.
  - A rule alone has no project around it but its test's scope, so its `js` and `ts` show what the writers do
    without one, e.g. a type they can't know.
  - `yarn test:rules:bless` writes each test's `js` and `ts` into the source (`BLESS_RULE_TESTS=1`, then `vp fmt`).
    - Read the diff after:  it's the review.
    - It finds each test by its `input` and old `js`;  one it can't place fails the run, saying why.
  - Test setup shared by a rule's registrations:  `setup<RuleClass>()`, returning `{ compileAs, beforeEach }`.
    - It's spread into each block:  `{ ...setupAssignmentStatement(), tests: [...] }`.
  - Tests need no type annotations there.
  - `yarn test:rules` runs every rule module's tests, and `ruleNames.test.ts`.
- Type arguments:  `Rule<Props, Groups, MatchData>`, all defaulted, so bare `P.Rule` / `P.Sequence` / `P.Match` work.
  - Rule base classes fix `Props`, so authors write `SpellStatement<"type|property|specifier?", { ruleComment?: ... }>`.
  - `rule.matchGroup` (was `argument`) is the name a rule's match goes under in `match.groups`,
    e.g. `{thing:expression}`.
  - `Groups` is a `P.GroupsFor` spec:
    - `name` required, `name?` optional, `name[]` array
    - Copy it from the module's `__snapshots__` file, which is computed from real `syntax` (`rule.groupSpec`).
    - Use an object type when `getGroupsForMatch()` derives non-`Match` values.
  - `MatchData` is what a rule stashes on its matches, read as `match.data.foo`.
  - Hooks take `match: P.MatchFor<this>`.
    To read another rule's match, narrow with `match.is(OtherRule)`.
- `match.groups` holds ONLY what the syntax matched (`Match | Match[]`).
  - Anything a rule works out for itself goes in `match.data`, typically via a caching method:
    `getBits(match) { return (match.data.bits ??= ...) }`.
  - NEVER override `getGroupsForMatch()` to add derived values.
- In `match.data`, use `NONE` (from `$/util`) for "looked, not found", rather than `null`.
  - Name scope lookups `scopeVar` / `scopeConstant` / `scopeType`.
- ONLY `mutateScope()` changes scope.
  - And `mutateScopeFromBody()`, for what a statement knows only once its BODY has parsed,
    e.g. what a method returns.
  - `mutateScopeFromBody()` returns what it recorded, so an edit changing it re-parses what follows.
  - `getAST()` MUST be pure:  NEVER change scope, NEVER look it up.
    - ASTs are built lazily, when scope may have moved on.
    - Look up what the AST needs WHILE PARSING, into `match.data`.
- What a statement's `mutateScope()` changes, for incremental parsing:  `@proto static changesScope`.
  - Or override `getScopeChanges(match)`, when only SOME matches change what later lines see.
  - It reads only `match.data`, e.g. `AssignmentStatement` is `"global"` only when it auto-declared a property.
  - See "Incremental parsing" in `PARSING.md`.
- A slot NAMING a member (a property's declaration, a read of one) is `{property:member_words}`:
  several words, blacklisted ones too, up to a structural word.
  - A READ resolves them through its type in `parse()`, else rejects.
  - A single undeclared word is the loose `{property}`.
  - See "Members" in `PARSING.md`.
- A built-in type's members (`the length of the name`) are DATA in `SP.BUILT_IN_TYPE_TABLE`, NOT rules.
  - The table:  [builtinTypes.ts](src/builtinTypes.ts).
  - Add one there, with the real `spellCore` method or javascript property its `readAs` names.
  - Then `yarn scopes --builtins`, in `../lsp`.
  - See "Built-in types" in `PARSING.md`.
- A `parse()` which understood a statement but mustn't take it returns `SpellStatement.refuse(match, "why")`,
  NOT `undefined`:  the line's error then says why.
  - e.g. a property declared on a built-in type
- A rule built WHILE PARSING goes through `scope.addRule(RuleClass, definition, match)`.
  - Never `parser.addRule()` directly.
  - So the scope records the class + definition pair, and can hand on the rules it created.
- A `mutateScope()` that adds a scope record passes `declaredBy: match`, so editors can find where it was declared.
  - a record:  a variable, constant, type, rule or `ScopeMethod`
  - for `scope.addRule()`, it's the third argument
- What a rule's match IS:  `match.datatype`, in spell's words (`text`, `Card`, `list of cards`;  see `P.Datatype`).
  - `@proto static datatype`, or override `getDatatype(match)`, which reads ONLY `match.data` and child matches.
  - A scope lookup it needs (a member, a list's item type) happens in `parse()`, into `match.data`.
  - Type names a user WRITES go through `SP.typeName()`.
  - See "Datatypes" in `PARSING.md`.
- Rules are IMMUTABLE (frozen on registration), and shared by every parse.
  - NEVER store per-parse state on a rule.
  - NEVER add ad hoc fields to a `Match`:  use `match.data`.
- Other modules reach a rule by NAME, through `syntax` / `parser.rules`;  by its CLASS only to subclass it,
  or to narrow a match with `match.is()`.
- A base rule class for a category of spell things is `Spell<Thing>`, paired with the lowercase rule it fathers.
  - `SpellConstant` / `constant`
  - `SpellType` / `type`
  - `SpellIdentifier` / `identifier`
- Name rules for what they MATCH, not just what they mean.
  - In [variables/](src/rules/variables/), `identifier` / `singular_identifier` / `plural_identifier` match a bare word.
  - `variable` / `known_variable` also allow a leading `the`.
  - A family sharing a prefix should share its shape.

## Decorators

As WWOD §12, plus:

- `vite.decorators.ts` (repo root) is used by `vitest.config.ts` here.

## Imports

- As WWOD §4, with our own `src/` as `$/spell` / `$/spell/*`.
- Imports `$/parser` (`P`), `$/core` (types only) and `$/util`.
  - NEVER import `$/lsp`, `$/app` or `$/cli`.
- A rule module imports the generic parser's rule classes from `$/parser`, and registers on `SpellParser` here.

## Types / Exports

As WWOD §8, plus our self-namespace:

- `SP` ~== `$/spell`

The other namespaces live in their own packages:
- `P`:  `../parser`
- `SC`:  `../core`
- `LSP`:  `../lsp`
- `UI`:  `../app`
