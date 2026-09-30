# Graph Report - src  (2026-09-15)

## Corpus Check
- 197 files · ~121,034 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 2079 nodes · 3975 edges · 116 communities (81 shown, 27 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 29 edges (avg confidence: 0.84)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- Console Logging
- AST Rendering
- AST Viewer UI
- Form Components
- Rulex Language
- App Preferences Store
- Tokenizer Token Types
- Spell Project Model
- Error Notice UI
- Parser Rule Patterns
- Match Constants
- Collection Utility Methods
- Console Method AST Nodes
- AST Stringification
- Binary Format Constants
- App Bootstrap & Notices
- Assignment Rule
- Lists Rule
- Spellcore Core Runtime
- Async & Expressions Rules
- Block Parsing & Matching
- Custom Error Class
- SpellFile Model
- Console Viewer UI
- Solitaire Example
- JSX & Object Literal AST
- Nested Split Rule
- Server File Utils
- Server Project Utils
- App Actions & Container
- Constants & Types Rules
- SpellCSSFile Model
- Await & Constant Expression AST
- Tokenizer Core
- Array Literal & Enumeration AST
- Blank Line & Literal Rules
- Block/File Scope
- SpellLocation (JS variant)
- Class Declaration AST
- Spellcore List Class
- Infix Operator Suffix Rule
- Project Compile & Task List
- Backtick Expression AST
- Task Class
- Split Panel Component
- Blockline & Core Rules
- Classes Rule & String Utils
- SpellLocation (TS variant)
- Statement Group AST
- Base AST Node
- Echo/Expect Method Invocation AST
- SpellJSFile Model
- SplitPanel Rationale Notes
- SpellProjectRoot
- Spell Page & Project Chooser UI
- Comment AST Nodes
- SpellEvent Rationale Notes
- Classes Rule Rationale Notes
- Literals Rule
- Tokenizer Rationale Notes
- Collection Core Methods
- Server Response Utils
- UI Rule Rationale Notes
- Boolean Literal & JSX Attribute AST
- Scope Variables & IndexedList
- Server File & Lock Utils
- Project File Operations
- Spellcore Runtime State
- TaskList Rationale Notes
- Global Types & Rule Pattern
- Assignment Statement AST
- Expression-with-Comment & JSX Expr AST
- Method Definition AST
- Token Block & Line
- Spellcore App & Thing Classes
- Logger Utility
- Spell Constant Rule & Scope
- SpellFile Rationale & Parser Scope
- Environment Config & Server API
- SpellLocation Rationale & Setup
- Prototype & Type Expression AST
- Type Scope
- Path Stat Wrapper
- Spellcore Test Helpers
- Abortable Fetch & Loadable File
- Task Status Rationale Notes
- Project Setup Rationale
- Invocation Args AST
- Spellcore Assert
- CodeMirror Component
- Todos (Form-based) Example
- Todos Example
- RenderAST Wrapping Helpers
- Choice Rule
- Match View Component
- Parser Helpers
- Unit Test Module Rules
- File Loading Utils
- Spellcore UI Elements
- SpellType Rule
- Calculator Example
- Tokenizer Tests
- Spellcore Paths
- RenderAST Named Component Helper
- Project SaveFile
- Express JSON5 Types
- Global TS Types
- CodeMirror Classes List

## God Nodes (most connected - your core abstractions)
1. `Match` - 71 edges
2. `Token` - 66 edges
3. `Scope` - 56 edges
4. `Rule` - 53 edges
5. `Tokenizer` - 52 edges
6. `SpellProject` - 48 edges
7. `spellCore` - 47 edges
8. `SpellParser` - 36 edges
9. `Task` - 32 edges
10. `SpellFile` - 30 edges

## Surprising Connections (you probably didn't know these)
- `SpellCSSFile` --inherits--> `TextFile`  [EXTRACTED]
  languages/spell/SpellCSSFile.js → util/LoadableFile.ts
- `SpellFile` --inherits--> `TextFile`  [EXTRACTED]
  languages/spell/SpellFile.js → util/LoadableFile.ts
- `getIndex()` --calls--> `SpellLocation`  [EXTRACTED]
  server/project-utils.ts → languages/spell/SpellLocation.ts
- `SpellParser` --inherits--> `Parser`  [EXTRACTED]
  languages/spell/SpellParser.ts → parser/Parser.js
- `SpellProject` --inherits--> `JSON5File`  [EXTRACTED]
  languages/spell/SpellProject.js → util/LoadableFile.ts

## Import Cycles
- 2-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/index.js`
- 2-file cycle: `languages/spell/SpellParser.ts -> languages/spell/index.js -> languages/spell/SpellParser.ts`
- 2-file cycle: `languages/spell/index.js -> languages/spell/rules/ParseError.js -> languages/spell/index.js`
- 2-file cycle: `parser/Parser.js -> parser/index.js -> parser/Parser.js`
- 2-file cycle: `languages/rulex/rulex.js -> parser/index.js -> languages/rulex/rulex.js`
- 2-file cycle: `parser/Match.ts -> parser/index.js -> parser/Match.ts`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/tests.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/Block.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/BlockLine.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/JSX.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/ParseError.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/Statement.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/UI.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/assignment.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/async.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/classes.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/constants.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/core.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/draw.js -> languages/spell/index.js`
- 3-file cycle: `languages/spell/index.js -> languages/spell/rules/index.js -> languages/spell/rules/events.js -> languages/spell/index.js`

## Communities (116 total, 27 thin omitted)

### Community 0 - "Console Logging"
Cohesion: 0.06
Nodes (15): SpellConsole, SpellConsoleGroup, Assertable, checkType(), OPTIONAL, Derivative, Loadable, LoadableProps (+7 more)

### Community 1 - "AST Rendering"
Cohesion: 0.04
Nodes (42): ASYNC, AWAIT, BACK_TICK, BANG, CATCH, CLASS, CLOSE_COMMENT, COLON_AND_SPACE (+34 more)

### Community 2 - "AST Viewer UI"
Cohesion: 0.06
Nodes (21): ASTViewer, MatchViewer, borderSize, centerElementInParent(), CSS_TLBR_VALUES, ElementScroll, getBorderSize(), getComputedStyle() (+13 more)

### Community 3 - "Form Components"
Cohesion: 0.06
Nodes (21): Checkbox, FieldWrapper, Form, FormGroup, FormRepeat, Input, Output, NOTE: this is NOT REACTIVE!!! (+13 more)

### Community 4 - "Rulex Language"
Cohesion: 0.10
Nodes (15): compile(), TODO: how is this used?, TODO: inline `isAdorned`, NOTE: many of the below are created as custom Pattern subclasses for debugging., NOTE: THIS INSTANCE is used by other parsers, to pick up the rules defined…, rulex, RulexParser, Parser (+7 more)

### Community 5 - "App Preferences Store"
Cohesion: 0.10
Nodes (23): AppPrefStore, getSuperHierarchy(), hasOwnProp(), clearDerived(), dependenciesMatch(), derivedFor(), EXTEND_MAP, ExtendedData (+15 more)

### Community 6 - "Tokenizer Token Types"
Cohesion: 0.06
Nodes (25): BlockTokenRecord, CommentTokenRecord, Indent, InlineWhitespace, JSXAttribute, JSXAttributeTokenRecord, JSXAttributeValue, JSXElement (+17 more)

### Community 8 - "Error Notice UI"
Cohesion: 0.09
Nodes (23): outputOptions, ErrorNotice, FIXED_ERROR_STYLE, TODO: do we need to cache the timer id?, FileDropdown, FileDropdownAction, OutputEditor, NOTE: not currently used. (+15 more)

### Community 9 - "Parser Rule Patterns"
Cohesion: 0.09
Nodes (4): Pattern, Rule, Subrule, Scope

### Community 10 - "Match Constants"
Cohesion: 0.09
Nodes (24): TestLocation, MatchGroups, MatchProps, TODO: can we get `tokens` out of here?, ChoiceProps, Group, NOTE: we run this BACKWARDS to put later-defined rules first, NOTE: Don't use this -- use `Rules.Keyword` or `Rules.Symbol` instead! (+16 more)

### Community 11 - "Collection Utility Methods"
Cohesion: 0.11
Nodes (22): append(), duplicateCollection(), filter(), forEach(), map(), mergeCollections(), mergeCollectionsInto(), randomItemOf() (+14 more)

### Community 12 - "Console Method AST Nodes"
Cohesion: 0.08
Nodes (16): ConsoleMethodInvocation, InfixExpression, MultiInfixExpression(), PropertyExpression, TODO: define this in `constants` or some such?, TODO: datatype???, NOTE: you can use this interchangably whenever something takes a single…, TODO: ??? (+8 more)

### Community 13 - "AST Stringification"
Cohesion: 0.07
Nodes (26): Args(), Array(), BACK_TICK, Block(), COMMA, DOUBLE_QUOTE, EMPTY_ARRAY, EMPTY_BLOCK (+18 more)

### Community 14 - "Binary Format Constants"
Cohesion: 0.10
Nodes (16): BINARY_FORMATS, BinaryFormats, KnownFormat, KnownFormatMimeType, KnownFormatName, REQUIRED, $FetchParams, $FetchRequestParams (+8 more)

### Community 15 - "App Bootstrap & Notices"
Cohesion: 0.23
Nodes (5): Notice, HACK: expose a bunch of stuff on `global` for browser debugging, spellParser, spellCore, unitTestModuleRules()

### Community 16 - "Assignment Rule"
Cohesion: 0.12
Nodes (19): assignment, NOTE: we also mutate scope in `getAST()`... :-(, HACK: if `match.itVar` was an alias, redefine as a normal variable, HACK: we also mutate scope in `getAST()`... :-(, TODO: this is not necessarily the best check..., HACK: if `originalVar` was an alias, redefine as a normal variable., draw, events (+11 more)

### Community 17 - "Lists Rule"
Cohesion: 0.06
Nodes (30): TODO: `remove last card from the deck`, TODO: `remove last two cards from the deck`, TODO: can work for object enumeration as well (maybe with 'of'?), TODO: return values e.g. array.map() ???, TODO: this only works if you `from 1 to 10`, a more general solution which also…, TODO: `down` is not accounted for in the output, TODO: `create list with <exp>, <exp>, <exp>`, TODO: `duplicate list` (+22 more)

### Community 18 - "Spellcore Core Runtime"
Cohesion: 0.08
Nodes (22): addExport(), define(), defineProperty(), getRange(), globalizeExports(), isANumber(), isDefined(), isOfType() (+14 more)

### Community 19 - "Async & Expressions Rules"
Cohesion: 0.13
Nodes (17): _async, TODO: add test to make sure parents are made async properly,, TODO: "a second", "a little bit", "a while", "a noticeable amount", expressions, TODO: we have one case ("is the queen of spades") where `thing` match is an…, TODO: QuotedExpression feels wrong here..., SpellExpression, JSX (+9 more)

### Community 20 - "Block Parsing & Matching"
Cohesion: 0.09
Nodes (5): parse(), parse(), value(), Match, ScopeConstructor

### Community 21 - "Custom Error Class"
Cohesion: 0.10
Nodes (16): CustomError, CustomErrorProps, NOTE: This is v8-specific!, TODO: WTF does this actually do?, TODO: Which platforms need this???, UIError, die(), success() (+8 more)

### Community 23 - "Console Viewer UI"
Cohesion: 0.08
Nodes (7): ConsoleGroup, ConsoleViewer, TODO: ObjectInspector popup or modal, TODO: these aren't spell names for types..., TODO: `List`, `match`, ErrorHandler, InputEditor

### Community 24 - "Solitaire Example"
Cohesion: 0.12
Nodes (25): all_piles, auto_play(), Card, cheat(), deal_the_cards(), debug_the_game(), deck, Discard_Pile (+17 more)

### Community 25 - "JSX & Object Literal AST"
Cohesion: 0.09
Nodes (5): JSXElement, ObjectLiteral, ObjectLiteralProperty, PropertyDefinition, PropertyLiteral

### Community 26 - "Nested Split Rule"
Cohesion: 0.10
Nodes (4): NestedSplit, Comment, Text, Token

### Community 27 - "Server File Utils"
Cohesion: 0.10
Nodes (16): caseInsensitiveSort(), EncodingFormat, FORMAT, getFolderContents(), GetFolderContentsOptions, getPathFile(), joinPath(), normalizePath() (+8 more)

### Community 28 - "Server Project Utils"
Cohesion: 0.11
Nodes (23): compileFile(), createProject(), DEFAULT_FILE, deleteApp(), duplicateApp(), getProjectList(), ImportEntryJSON, ImportsFileJSON (+15 more)

### Community 29 - "App Actions & Container"
Cohesion: 0.15
Nodes (13): Action(), actions, NOTE: we assume this will be memoized by the caller if appropriate., AppRoot, ASTRoot, inputOptions, InputRoot, MatchRoot (+5 more)

### Community 30 - "Constants & Types Rules"
Cohesion: 0.12
Nodes (16): constants, identifierBlacklist, NOTE: the output type name will be SINGULAR!, NOTE: `match.type?.name` is the class name, TYPE_VALUE_MAP, types, NOTE: when compiling, we'll look for `scope.variables.get(varName)`:, TODO: type based on scope variable type? (+8 more)

### Community 32 - "Await & Constant Expression AST"
Cohesion: 0.08
Nodes (7): AwaitExpression, ConstantExpression, Expression, JSXEndTag, ListExpression, NewInstanceExpression, NotExpression

### Community 34 - "Array Literal & Enumeration AST"
Cohesion: 0.08
Nodes (7): ArrayLiteral, Enumeration, KeywordLiteral, Literal, NumericLiteral, RegExpLiteral, ThisLiteral

### Community 35 - "Blank Line & Literal Rules"
Cohesion: 0.13
Nodes (9): BlankLine, Keyword, Literal, LiteralProps, Symbol, TokenConstructor, TokenType, TokenTypeProps (+1 more)

### Community 36 - "Block/File Scope"
Cohesion: 0.17
Nodes (11): getNestedScopeForMatch(), BlockScope, FileScope, MethodScope, MethodScopeProps, TODO: scope:this ??, TODO: scope:this ??, TODO: how is this used? (+3 more)

### Community 37 - "SpellLocation (JS variant)"
Cohesion: 0.10
Nodes (6): isValid(), isValidPathSegment(), SpellLocation, TODO: enhance with regex?, IMPORTANT: this file MUST NOT import from anything other than `spellSetup`, SEGMENT_BLACKLIST

### Community 38 - "Class Declaration AST"
Cohesion: 0.10
Nodes (7): ClassDeclaration, convertStatementsToBlock(), ElseIfStatement, ElseStatement, IfStatement, ParenthesizedExpression, Statement

### Community 40 - "Infix Operator Suffix Rule"
Cohesion: 0.13
Nodes (15): InfixOperatorSuffix, PostfixOperatorSuffix, getAST(), getGroupsForMatch(), getPropsAssignment(), getRule(), getRuleAnnotation(), methods (+7 more)

### Community 42 - "Backtick Expression AST"
Cohesion: 0.10
Nodes (5): BackTickExpression, BacktickSubstitution, JSXText, StringLiteral, TripleBackTickExpression

### Community 45 - "Blockline & Core Rules"
Cohesion: 0.11
Nodes (14): TODO: not sure if this is needed anymore, core, TODO: better name for this? "flag"? "truism"?, TODO: `integer` and `decimal`? too techy?, properties, TODO: property_name, TODO: `{property}` converts to `foo_bar` before we get here, TODO: `{property}` converts to `foo_bar` before we get here (+6 more)

### Community 46 - "Classes Rule & String Utils"
Cohesion: 0.14
Nodes (16): classes, getExistingOrTransform(), INSTANCE_CASE, instanceCase(), pluralize(), PLURALS, TODO: flag for lower case??, singularize() (+8 more)

### Community 48 - "Statement Group AST"
Cohesion: 0.10
Nodes (4): StatementGroup, TernaryExpression, TryCatchBlock, VariableExpression

### Community 49 - "Base AST Node"
Cohesion: 0.11
Nodes (3): ASTNode, BlankLine, StatementBlock

### Community 50 - "Echo/Expect Method Invocation AST"
Cohesion: 0.12
Nodes (7): CoreMethodInvocation, EchoInvocation, ExpectMethodInvocation, ExportInvocation, QuotedExpression, StartProcessInvocation, StopProcessInvocation

### Community 52 - "SplitPanel Rationale Notes"
Cohesion: 0.15
Nodes (11): NOTE: we don't store sizes in state because we update it during drag-resize., TODO: `hidden` children shouldn't be counted!, TODO: take `minSize` for child elements into account, TODO: this will be off if CSS transform has been applied to the panel., TODO:, SplitPane, getPref(), getPrefKey() (+3 more)

### Community 54 - "Spell Page & Project Chooser UI"
Cohesion: 0.17
Nodes (10): ConsoleRoot, SpellPage(), ProjectChooser, ProjectChooserRoute(), ProjectRootDisplay, Routes(), SpellEditorRoute(), HACK: Actually navigate on a timeout to avoid hook / rerender problems. (+2 more)

### Community 55 - "Comment AST Nodes"
Cohesion: 0.12
Nodes (5): BlockComment, Comment, LineComment, ParseError, ParserAnnotation

### Community 56 - "SpellEvent Rationale Notes"
Cohesion: 0.19
Nodes (8): NOTE: we use a `WeakMap` to store the event handlers here, by `target`., NOTE: To apply for all instances of a class, use `Eventful` HOC below:, NOTE: you should consider these objects immutable! ???, TODO: event heiarchy, TODO: pass/etc events, TODO: surface as an `eventError` event?, SpellEvent, value()

### Community 57 - "Classes Rule Rationale Notes"
Cohesion: 0.13
Nodes (13): NOTE: we assume that all types take an object of properties????, NOTE: we assume that all types take an object of properties????, TODO: in `statement` form, put into `it`???, FIXME: `list`, `text`, etc don't follow these semantics???, FIXME: the following don't make sense if they have arguments..., FIXME: the following don't make sense in JS but are legal parse-wise, TODO: complain if existing type is set up differently!, TODO: scope.constants.addMissing(value.raw) (+5 more)

### Community 58 - "Literals Rule"
Cohesion: 0.18
Nodes (7): Keywords, LiteralMatcher, Literals, LiteralsProps, makeMatcher(), NOTE: Don't use this -- use `Rules.Keywords` or `Rules.Symbols` instead!, Symbols

### Community 59 - "Tokenizer Rationale Notes"
Cohesion: 0.13
Nodes (14): TODO: error checking / reporting, especially in JSX expressions., TODO: have normal `tokenize` stick whitespace elements in the stream, then…, TODO: clean this stuff up, maybe with findFirstAtHead?, TODO: check whitespace before/after tag, TODO: how to surface this error???, TODO: newline and indent?, TODO: `contents` as the token???, TODO: ??? seems like this should be a top-level error??? (+6 more)

### Community 60 - "Collection Core Methods"
Cohesion: 0.24
Nodes (12): addAtPosition(), clear(), getItemOf(), getIteratorFor(), isEmpty(), itemCountOf(), itemOf(), keysOf() (+4 more)

### Community 61 - "Server Response Utils"
Cohesion: 0.25
Nodes (10): convertNumericId(), ExtendedSendFileOptions, getIdParams(), respondWithJSON(), sendError(), sendFile(), sendJSFile(), sendJSON() (+2 more)

### Community 62 - "UI Rule Rationale Notes"
Cohesion: 0.15
Nodes (12): NOTE: we'll `await` the promise!, TODO: `the result = await ...` ?, NOTE: we'll `await` the promise!, TODO: `the result = await ...` ?, NOTE: we'll `await` the promise!, TODO: `the result = await ...` ?, TODO: `as number`, `as date`, etc?, NOTE: we'll `await` the promise! (+4 more)

### Community 63 - "Boolean Literal & JSX Attribute AST"
Cohesion: 0.15
Nodes (3): BooleanLiteral, JSXAttribute, UndefinedLiteral

### Community 64 - "Scope Variables & IndexedList"
Cohesion: 0.21
Nodes (3): IndexedList, IndexedListProps, TODO: this doesn't seem like a good idea...

### Community 65 - "Server File & Lock Utils"
Cohesion: 0.22
Nodes (8): getPathFolder(), makeFolder(), saveBinaryFile(), saveFile(), DEFAULT_LOCK_OPTIONS, LockError, lockFile(), NOTE: this doesn't seem like the best way to do this...

### Community 66 - "Project File Operations"
Cohesion: 0.21
Nodes (13): createFile(), deleteFile(), getImportsLocation(), getIndex(), isManifestFile(), isPreloadFile(), loadImports(), renameFile() (+5 more)

### Community 67 - "Spellcore Runtime State"
Cohesion: 0.23
Nodes (9): getProcessFlags(), initializer(), getRuntimeState(), processIsRunning(), TODO: second `exclusively` parameter so we can tell if it's running exclusively?, resetRuntime(), SpellRuntime, startProcess() (+1 more)

### Community 68 - "TaskList Rationale Notes"
Cohesion: 0.15
Nodes (11): TaskResolveWith, TODO: number of `concurrentTasks` to do at once, TODO: TaskQueue <= endlessly running, handles things put on it in order (or…, TODO: TaskList.forEach(list, createTaskForItem), TODO: TaskList.while(condition, createTask), TODO: TaskList.if(condition, task1, task2), TODO: TaskList.confirm(message, okBtn, cancelBtn) <= rejects() if they cancel, TODO: TaskList.prompt(message, default, okBtn, cancelBtn) <= passes value to… (+3 more)

### Community 69 - "Global Types & Rule Pattern"
Cohesion: 0.21
Nodes (4): Prettify, PatternProps, Repeat, RepeatProps

### Community 71 - "Expression-with-Comment & JSX Expr AST"
Cohesion: 0.17
Nodes (3): ExpressionWithComment, JSXExpression, NullLiteral

### Community 75 - "Spellcore App & Thing Classes"
Cohesion: 0.26
Nodes (3): App, Thing, Eventful()

### Community 76 - "Logger Utility"
Cohesion: 0.26
Nodes (3): DEBUG_LEVELS, DebugLevel, Logger

### Community 77 - "Spell Constant Rule & Scope"
Cohesion: 0.24
Nodes (3): SpellConstant, ScopeConstant, ScopeConstantProps

### Community 78 - "SpellFile Rationale & Parser Scope"
Cohesion: 0.22
Nodes (5): NOTE: if `this.match` is set, we'll assume that's OK., HACK: things get wierd downstream if we don't get a `match` at all, TODO: offset + 1?, ProjectScope, RootScope

### Community 79 - "Environment Config & Server API"
Cohesion: 0.24
Nodes (6): environment, serverBaseFile, srcDir, staticDir, api, app

### Community 80 - "SpellLocation Rationale & Setup"
Cohesion: 0.22
Nodes (6): TODO: enhance with regex?, TODO: do we need to export this?, IMPORTANT: this file MUST NOT import from anything other than `spellSetup`, ProjectRoot, ProjectRootMap, spellSetup

### Community 82 - "Type Scope"
Cohesion: 0.29
Nodes (4): TypeScope, TypeScopeProps, snakeCase(), typeCase()

### Community 84 - "Spellcore Test Helpers"
Cohesion: 0.31
Nodes (7): endTest(), expect(), _getTestResultIcon(), TODO: merge this with SpellCore.console so `print XXX` in a test goes to…, TODO: print result of "executing" e.g. Executing `display the deck` returned…, startTest(), test()

### Community 85 - "Abortable Fetch & Loadable File"
Cohesion: 0.20
Nodes (5): abortableFetch(), isAbortError(), failure(), AbortedRequestError, OfflineError

### Community 86 - "Task Status Rationale Notes"
Cohesion: 0.20
Nodes (8): TaskStatus, TODO: status = cancelled?, TODO: throw???, TODO: `retry` to retry N times if we fail., TODO: `failAfter` to fail a promise if it doesn't complete for certain amount…, TaskExecution, TaskProps, TaskState

### Community 87 - "Project Setup Rationale"
Cohesion: 0.25
Nodes (5): spellSetup, NOTE: don't create these directly, use the ones set up by `SpellInstall`., NOTE: this will throw if server sends invalid paths!!!, CONFIRM, JSON5File

### Community 90 - "Spellcore Assert"
Cohesion: 0.25
Nodes (4): assert(), TODO: some way to control output, CustomCollection, Foo

### Community 91 - "CodeMirror Component"
Cohesion: 0.36
Nodes (5): advanceStreamPastToken(), codeMirrorOptions, getToken(), getTokenType(), token()

### Community 92 - "Todos (Form-based) Example"
Cohesion: 0.32
Nodes (5): app, create_a_task(), Task, Todos_App, value()

### Community 93 - "Todos Example"
Cohesion: 0.32
Nodes (5): app, create_a_task(), Task, Todos_App, value()

### Community 94 - "RenderAST Wrapping Helpers"
Cohesion: 0.25
Nodes (8): Fragment(), InBackTicks(), InCurlies(), InDoubleQuotes(), InParens(), InSingleQuotes(), InSquareBrackets(), InTripleBackTicks()

### Community 97 - "Parser Helpers"
Cohesion: 0.33
Nodes (4): Class, die(), MEMOIZED, rejectOnUndefinedProp()

### Community 98 - "Unit Test Module Rules"
Cohesion: 0.29
Nodes (6): SKIP, compileMatch(), executeRuleTests(), executeTest(), executeTestBlock(), normalizeInitialWhitespace()

### Community 99 - "File Loading Utils"
Cohesion: 0.33
Nodes (6): loadBinaryFile(), loadFile(), loadFiles(), loadJSONFile(), loadTextFile(), isFileOrFolderNotFoundError()

### Community 104 - "Tokenizer Tests"
Cohesion: 0.50
Nodes (3): TODO: describe() blocks for the below..., FIXME: this is only working with our default tokenizer..., tokenizer

### Community 105 - "Spellcore Paths"
Cohesion: 0.83
Nodes (3): getPath(), setPath(), splitPath()

## Knowledge Gaps
- **176 isolated node(s):** `codeMirrorOptions`, `ConsoleGroup`, `FIXED_ERROR_STYLE`, `FileDropdownAction`, `Input` (+171 more)
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 1025 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **27 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `Match` connect `Block Parsing & Matching` to `Console Logging`, `Blank Line & Literal Rules`, `Literals Rule`, `Global Types & Rule Pattern`, `Parser Rule Patterns`, `Match Constants`, `Console Method AST Nodes`, `Blockline & Core Rules`, `Assignment Rule`, `Base AST Node`, `Async & Expressions Rules`, `Console Viewer UI`, `Nested Split Rule`, `Constants & Types Rules`, `Choice Rule`?**
  _High betweenness centrality (0.057) - this node is a cross-community bridge._
- **Why does `SpellProject` connect `Spell Project Model` to `Error Notice UI`, `Project Compile & Task List`, `Blockline & Core Rules`, `SpellFile Rationale & Parser Scope`, `Assignment Rule`, `SpellJSFile Model`, `SpellProjectRoot`, `SpellFile Model`, `Project Setup Rationale`, `SpellCSSFile Model`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Why does `spellCore` connect `App Bootstrap & Notices` to `Spellcore Runtime State`, `Spellcore UI Elements`, `Spellcore String Helpers`, `Error Notice UI`, `Spellcore Paths`, `Spellcore App & Thing Classes`, `Collection Utility Methods`, `SpellFile Rationale & Parser Scope`, `Assignment Rule`, `Spellcore Core Runtime`, `Spellcore Test Helpers`, `Console Viewer UI`, `SpellEvent Rationale Notes`, `Spellcore Assert`, `Collection Core Methods`, `App Actions & Container`, `Constants & Types Rules`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **What connects `codeMirrorOptions`, `ConsoleGroup`, `FIXED_ERROR_STYLE` to the rest of the system?**
  _176 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Console Logging` be split into smaller, more focused modules?**
  _Cohesion score 0.055811571940604196 - nodes in this community are weakly interconnected._
- **Should `AST Rendering` be split into smaller, more focused modules?**
  _Cohesion score 0.04081632653061224 - nodes in this community are weakly interconnected._
- **Should `AST Viewer UI` be split into smaller, more focused modules?**
  _Cohesion score 0.06105457909343201 - nodes in this community are weakly interconnected._