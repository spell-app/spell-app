# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Codex, and others)
when working with code in this package, `spell`.

Conventions every package shares -- Solid 2, Long-term debt, Documentation, Functions, Decorators,
Types / Exports, Imports -- are in the repo root's `AGENTS.md`:  READ it FIRST.  Only what's local is below.

## Overview

- `src/parser/` (`P`) is a generic rule-based parser;  `src/languages/spell/` (`SP`) is the spell language on it.
- `src/lsp/` (`LSP`) is spell's language server, and `vscode-extension/` the VS Code extension that runs it --
  its own yarn project (own `package.json` + `yarn.lock`), NOT a workspace of the repo's.  See "Language server" in `PARSING.md`.
- The `spell` command-line tool is NOT here:  it's its own package beside this one, `../cli`, which runs this package's
  SOURCE (`~/lsp`, `~/languages/spell` ...) through `tsx`.  See its `README.md`.
- `projects/` holds every spell project, OUTSIDE `src/`:  `system/examples/`, `system/library/`, `system/guides/`,
  `user/` and `test/` -- the `@system:examples` etc. roots.  See "Projects" in `PARSING.md`.
  - Tests read ONLY `projects/test/` (`@test:fixtures` ~== `@test/<Project>`, listed in the app in dev only):  frozen projects, never
    the live examples, which get edited.  Use `loadFixtureProject()`, `fixturePath()`, `fixtureProjectId()` from
    `~/test` -- and NEVER update a fixture to follow its example.
  - Each fixture's compiled output is checked against `<Project>.snapshot.js` beside it (`src/test/fixtures.test.ts`).
    Add a fixture by copying a project in;  after a deliberate change, `yarn test:fixtures:bless` and read the diff.
- `src/app/ui/monaco/` is the app's Monaco editor, whose language features call the SAME `LSP.SpellLanguageService`
  in-process.  `~/lsp` MUST stay browser-safe for it.
  - Loaded LAZILY, through `UI.LazyMonaco`:  NEVER import `~/app/ui/monaco` statically outside its folder -- types
    aside -- or Monaco (~4.4 MB) lands in the main bundle again.
- `src/app/runner/` runs compiled spell:  the pieces every runner shares -- the web app's editor, VS Code's
  "Run Project" webview (`VSCodeRunner`, `yarn build:runner`) and the `<spell-app>` web component
  (`SpellAppElement`, `yarn build:element` => `dist-element/`, demo at `/demo/spell-app.html` on the dev server).
  - Programs run on `spell-runtime.js` (`spellRuntime.ts`), NEVER the page's own `spellCore`:  the app loads it
    once (`editor.loadRuntime()`), the VS Code runner once, and each `<spell-app>` its OWN copy (`loadRuntime()`),
    so apps on a page don't share a `spellCore`.  No import map:  `runCompiled()` links each program's imports.
  - So ONLY `spellRuntime.ts` may value-import `~/spellCore`, in every bundle:  anything else -- the app, the
    parser, the forms -- puts it in a shared chunk, or loads a second one.  They read `~/spellCore/spellCore.types`
    (runtime-light), or the runtime's, e.g. `runtimeConsole()`.  Mind barrels:  `~/app/runner` holds
    `runCompiled()`, so a bundle's entry imports its runner's file directly.  Pinned by `element.build.test.ts`
    and `parser/build.test.ts`.
  - It runs in a shadow root:  `spellCore.appRoot` is where an app mounts, and `spellCore.domRoot()` where to look
    elements up and add styles -- NEVER `document`.
  - Its Type Explorer reads scope packs, `<Project>.scopes.js` (`LSP.ScopePack`) -- no parser in the page.
  - Its Thing Explorer reads the runtime copy's `spellCore.things` (`ThingRegistry`):  each `Thing`, and each
    instance of a `List` sub-class, registers itself as it's made;  the program's exports are its top-level things.
    `yarn scopes [--compile] <projectId...>` writes them;  so does the language server, after each clean compile.
- `src/app/spellEditor/` is `<spell-editor>` (`SpellEditorElement`, `yarn build:element` => `spell-editor.js`, demo at
  `/demo/spell-editor.html`):  the app's Monaco editor as a web component, editing a server project and feeding
  `<spell-app>`s what it compiles (`SPELL_COMPILED_EVENT`, `SpellCompiled` in `runner.types.ts`).
  - Its OWN build, `vite.editor.config.ts`, so Monaco's CSS stays out of `spell-app.css`.  Monaco is a lazy chunk:
    the parser compiles, and apps run, before it loads.  Pinned by `element.build.test.ts`.
  - Several on a page edit several projects:  each `SpellModels.use()`s its own, and listens with
    `SpellMonaco.onEdit()` / `onOpen()` -- NOT the app's `editor`.  NEVER import `UI` or `LazyMonaco` there.
- Styles are plain `.css`:  native nesting, custom properties (`spell.css`, `syntax.css`) -- no Less.

## How parsing works

- `PARSING.md` is a compact map of the parse pipeline:  tokens, block / line / statement, when scope changes,
  how projects share a parser.  Read it BEFORE digging into parser internals.
- MUST keep it up to date in the same change whenever the parsing mechanism changes -- generic `Parser`, `SpellParser`,
  scopes, or the `Block` / `BlockLine` / `SpellStatement` machinery.

## Creating docs

HTML docs for people -- design notes, research, references -- live in `docs/<topic>/`.  Model:
`docs/solid/SOLID-2.html`.

- Start from `docs/_template.html`.  Link the shared `../_assets/doc.css` and `../_assets/doc.js` (+ highlight.js from
  cdnjs, as the template does).  NEVER inline copies:  improve the shared files instead, and every doc gets it.
- `doc.js` builds the page from plain headings:
  - contents sidebar:  sticky right column that scrolls on its own, expandable per section, follows the scroll;
    a drawer on narrow screens
  - sticky h2 / h3 section headers (it wraps `section.s2` / `section.s3`)
  - heading ids, folded code, syntax colors
  - NEVER hand-write a TOC, sections or ids -- except an explicit `id` on a heading other docs link to
- Headings:
  - one `h1`;  numbered `h2` per major section (`2. Read-after-write`)
  - `h3` for EVERY distinct sub-item, `h4` for sub-sub-items:  a list item with a bold title and several lines of
    body becomes a heading, and long lists of such items are grouped under themed `h3`s
  - headings are short labels (they're the contents entries);  the claim goes in the body
- Text:  bullets, not dense prose.
  - 3+ sentences => a short lead plus bullets, one idea each, nested for sub-points
  - keep every fact, number and caveat when you condense
  - `.callout` (`good` / `bad` / `warn`) for recommendations and warnings, `.table-wrap > table` for comparisons
    (`td.num`, `.yes` / `.no` / `.meh`), `.tag` for small badges
- Code:
  - `<pre><code class="language-ts">`, TypeScript by default, formatted by oxfmt:  write the snippet to a `.ts` / `.tsx`
    file and run `node_modules/.bin/oxfmt -c .oxfmtrc.json <file>` (docs' `.md` files are NOT formatted by
    `yarn format`)
  - valid code only:  no bare JSX statements after other statements -- assign them to a `const`
  - prefer excerpts pasted from a real, runnable file over hand-typed examples
  - `doc.js` folds every block:  30 lines or fewer start open.  Name a long listing:
    `<details class="code"><summary>What it is (path)</summary><pre>...</pre></details>`
- Claims backed by measurement:  runnable scripts in `docs/<topic>/experiments/`, each with a header comment on how to
  run it.  Tables quote medians of several runs, never a single run.  Keep the scripts:  they re-measure on upgrades.
- Source links:  every reference to a file, folder or external page is a link that opens a NEW TAB with its own
  named target per destination (re-clicks reuse that tab).
  - `python3 scripts/doc-links.py <doc>` links `<code>path</code>` references and targets existing links (idempotent)
  - `python3 scripts/doc-links.py --check <doc>` must pass:  every local link resolves, one target per destination,
    no nested links
- Finish, in this order:
  1. `python3 scripts/doc-links.py <doc>`
  2. `node_modules/.bin/oxfmt <doc>` (`yarn format` would reformat it anyway)
  3. `python3 scripts/doc-links.py --check <doc>`
  4. `node scripts/doc-shots.mjs <doc>` must pass (errors, phone overflow, contents vs headings, sticky headers) --
     and LOOK at its four screenshots:  the checks can't see overlap, clipping or bad wrapping
- Colors only from the `doc.css` tokens, so dark mode keeps working.
- `.spell.html`:  `yarn docs:update` re-creates `<name>.spell.html` beside every source doc, rendered with the LATEST
  @spell/ui widgets (`../ui`, rebuilt each run) instead of `doc.css` / `doc.js`.  How it works:
  `docs/_assets/SPELL-DOCS.md`.
  - The plain `<name>.html` is the SOURCE:  edit it, then run `yarn docs:update`.  NEVER hand-edit a `.spell.html`
    (it says GENERATED at the top), and commit both.
  - It must pass:  bundle, `doc-links.py --check`, convert (a self-check:  identical code, ids, links, one contents
    link per heading), then `scripts/docs/check-spell.mjs` per page -- and LOOK at its screenshots.
  - A @spell/ui problem:  fix it in `../ui` when it's a real `ui` bug (the same change may touch both), else work
    around it here;  either way, add it to `docs/SPELL-UI-FINDINGS.md`.
  - New markup in a source (a new kind of block) needs a mapping in `scripts/docs/to-spell.mjs` and a line in
    `SPELL-DOCS.md`'s mapping table.
- When agents need a doc's rules, also write a distilled `.md` beside it (bullets, `ts` code blocks), and point to it
  from the top of an `AGENTS.md` with an "if working with X, READ file" line -- this file's, or the root's when
  other packages need it too.  See `docs/solid/SOLID-2.md`, pointed to from the root's.

## Parser rules

- A rule is a CLASS (behaviour AND what the rule is) plus its `syntax` + `tests`, passed when registering it:
  `parser.addRule(RuleClass, { syntax, tests })`.
  - Everything else -- `alias`, `precedence`, `declares`, `highlightAs`, `datatype`, `tokenType`, `pattern` ... --
    goes ON THE CLASS as `@proto static` (from `~/util`), e.g. `@proto static alias = "expression"`.
    Why:  the class is the rule, reusable by other languages' parsers with their own `syntax`.
  - `@proto` only accepts a prop the rule declares -- `@proto static alais` is a compile error.
  - Class name IS the rule name.  Use plain `static ruleName = "if"` only for reserved words (`class _if`)
    or when class name isn't rule case (`class Block` => `"block"`).
    Prod build MUST keep `output.keepNames` (`vite.config.ts`), pinned by `parser/build.test.ts`.
  - ONE `syntax` per registration.  A rule with several calls `addRule()` once per syntax, each with the
    `tests` for that syntax, e.g. `assignment_statement`.  Instances merge into a `P.Group` under the rule's name.
  - `@proto static` values are INHERITED:  a subclass of a registered rule gets its parent's `alias` etc.
    State its own value to differ.  `syntax`, `tests` and `ruleName` are NOT inherited --
    share syntax with a constant, e.g. `VARIABLE_SYNTAX`.
  - Put a prop on a base class when EVERY subclass wants the same value, e.g. `SpellExpression`'s
    `alias = "expression"`, `MethodDefinition`'s `inlineInitialType = false`.  A subclass just states its own
    value for an exception.
  - Constructor defaults (`super({ pattern, blacklist, ...props })`, see `SpellIdentifier`) also work for
    what every rule of a base class has in common.
  - See `languages/spell/rules/variables.ts` for the finished shape, and the top docstring in
    `parser/rules/Rule.ts` for all the ways to make a rule.
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
  - NEVER treat a class name or rule name as a stable identifier -- for saved data, lookups, or anything which
    must survive a rename or a translation.  Names are for people, and change.  Add an explicit property
    for it instead, e.g. `@proto static importableAs = "enumeration"`.
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

As the root's, plus:

- `vite.decorators.ts` (repo root) is used by every `vite*.config.ts` and `vitest.config.ts` here.
  Server is fine as `tsx` is esbuild already.

## Types / Exports

As the root's, plus our self-namespaces:

- `P` ~== `~/parser`
- `SP` ~== `~/languages/spell`
- `UI` ~== `~/app/ui`
- `F` ~== `~/app/ui/forms`
- `SC` ~== `~/spellCore`
