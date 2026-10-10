/**
 * Shared types for spell language layer.
 * - `import type` only, per `AGENTS.md` -- the `$/parser/rulex` registration this file used to carry
 *   now lives in `SpellParser.ts`, which every rule module imports anyway.
 * - NOTE: `rules/Statement.ts` imports `BODY_KEYWORDS` from here directly, so this MUST stay free of
 *   runtime imports.
 */

import type { P } from "$/parser"
import type { SpellLocation } from "./SpellLocation"
import type { SpellFile } from "./SpellFile"
import type { SpellJSFile } from "./SpellJSFile"
import type { SpellCSSFile } from "./SpellCSSFile"

// ## SpellFile

/** Any of the file classes a `SpellProject` can hold in its manifest. */
export type AnySpellFile = SpellFile | SpellJSFile | SpellCSSFile

/** The subset of `AnySpellFile` that can actually be `parse()`d/`compile()`d as spell source. */
export type CompilableSpellFile = SpellFile | SpellCSSFile

// ## SpellProject

/**
 * Name of the file in a project's folder saying what it is and what it imports -- see `ProjectFileJSON`
 * in `src/server/server.types.ts`.  Its folder IS the project, e.g. for `locationForDiskPath()`.
 */
export const PROJECT_FILE = "project.json"

/**
 * End of a project's compiled output file's name, e.g. `Solitaire.compiled.js` -- see `SpellProject.outputFile`.
 * - NEVER one of a project's own files:  the server leaves it out of the manifest.
 */
export const COMPILED_JS_SUFFIX = ".compiled.js"

/**
 * End of a project's declarations file's name, e.g. `Solitaire.declarations.json`:  what it offers importers, beside
 * its compiled output -- see `SpellProject.declarationsFile`, `SP.SpellDeclarationsData`.
 * - NEVER one of a project's own files:  the server lists only `.spell`, `.css`, `.js` and `.jsx`.
 */
export const DECLARATIONS_JSON_SUFFIX = ".declarations.json"

/**
 * End of a test fixture's snapshot file's name, e.g. `Solitaire.snapshot.js` -- its compiled output, which
 * `$/spell/test`'s `fixtures.test.ts` checks against.
 * - NEVER one of a project's own files:  the server leaves it out of the manifest, as `COMPILED_JS_SUFFIX`.
 */
export const SNAPSHOT_JS_SUFFIX = ".snapshot.js"

/**
 * End of a project's scope pack file's name, e.g. `Solitaire.scopes.js` -- what its Type Explorer shows, for pages
 * which run it without the parser, e.g. `<spell-app>`.  See `LSP.ScopePack`.
 * - NEVER one of a project's own files:  the server leaves it out of the manifest, as `COMPILED_JS_SUFFIX`.
 */
export const SCOPES_JS_SUFFIX = ".scopes.js"

/**
 * Start of the ES module specifier for another project's compiled JS, e.g. `@spell/project/@system:library:cards`.
 * - A runner fetches that project's compiled JS from the server's `/api/projects/compiled/<projectId>`, and points
 *   the specifier at it -- see `runCompiled()` in `src/app/runner/`.
 */
export const SPELL_PROJECT_MODULE = "@spell/project/"

/** JSON5 shape of a project's index file, as read/written by the server. */
export type ProjectManifestJSON5 = {
  /** All manifest-eligible files in project, keyed by `path`. */
  manifest: Record<string, ProjectManifestEntry>
  /** Ordered list of files to compile, synced against `manifest` -- plus other projects it imports. */
  imports: ProjectManifestImport[]
  /** This project's semver, from its `project.json` -- stamped on its declarations. */
  version?: string
  /** Names it offers importers, from its `project.json` -- default:  everything it declares. */
  exports?: string[]
  /** Targets it compiles to, from its `project.json`, e.g. `["ts/solid"]` -- `js/solid` always:  see `SP.TARGETS`. */
  targets?: string[]
}

/** A single entry in `contents.manifest`, augmented with `path`/`location`/`file` once loaded. */
export type ProjectManifestEntry = {
  /** File creation time (ms epoch), from the server. */
  created: number
  /** File last-modified time (ms epoch), from the server. */
  modified: number
  /** File size in bytes, from the server. */
  size: number
  /** Full path, added by the `manifest` getter once loaded. */
  path?: string
  /** `SpellLocation` for `path`, added by the `manifest` getter once loaded. */
  location?: SpellLocation
  /** Pointer to the loaded file, added by the `manifest` getter once loaded. */
  file?: AnySpellFile
}

/**
 * A single entry in `contents.imports`, as read/written to `project.json` on the server.
 * - A FILE of ours, e.g. `/Card.spell`, or ANOTHER PROJECT, e.g. `@library/cards` -- see `SpellProject.projectImports`.
 */
export type ProjectManifestImport = {
  /**
   * Local `filePath`, e.g. `/Card.spell`.
   * - Or another project:  `@library/<name>` (~== `@system:library:<name>`) or a full `@owner:domain:name`.
   */
  path: string
  /** `true` if file should be included when compiling the project. */
  active: boolean
  /** File contents, preloaded server-side -- only set for `active` imports of preloadable extensions. */
  contents?: string
  /** Another project:  names to import, e.g. `["Card"]` -- default everything.  See `DeclarationsImport.import`. */
  import?: string[]
  /** Another project:  semver range its `version` must satisfy, e.g. `"^1.2"`. */
  version?: string
  /** Another project:  `true` to parse its `.spell` files ahead of ours, rather than its compiled declarations. */
  source?: boolean
}

/** Another project a project imports -- see `SpellProject.projectImports`. */
export type ProjectImport = {
  /** Its `imports` entry's `path` as written, e.g. `@library/cards` -- named in errors, and `P.ImportScope.origins`. */
  from: string
  /** Its project id, e.g. `@system:library:cards`. */
  projectId: string
  /** Names to import -- see `DeclarationsImport.import`. */
  import?: string[]
  /** Semver range its `version` must satisfy. */
  version?: string
  /** `true` to parse its `.spell` files ahead of ours, rather than load its compiled declarations. */
  source?: boolean
}

/** Derived (client-side) import reference, as returned by `project.imports`. */
export type ProjectImportRef = {
  /** Full `path` of import, resolved against owning project. */
  path: string
  /** `true` if file should be included when compiling project. */
  active: boolean
  /** `SpellLocation` for `path`. */
  location: SpellLocation
  /** Pointer to loaded file for `path`. */
  file: AnySpellFile
}

/** Contents of a `SpellProjectRoot`: list of project paths, e.g. `@user:projects:Foo`. */
export type ProjectPathList = string[]

// ## SpellProjectRoot

/** The BUILT-IN project root `path`s, e.g. `@user:projects` -- `SpellSetup.projectRoots` starts with these. */
export const ProjectRootPaths = ["@user:projects", "@system:examples", "@system:guides"] as const
/**
 * A project root `path`, `@owner:domain`:  one of `ProjectRootPaths`,
 * or one added at runtime with `SpellSetup.addProjectRoot()`, e.g. `@workspace:my-folder`.
 */
export type ProjectRootPath = `@${string}:${string}`

/**
 * One entry in the set of "roots" a project can live under.
 * - Describes an `@owner:domain` pair plus the display strings the UI needs for it.
 * - `Type`/`type` are both kept so callers can concatenate without case-munging at the call site.
 */
export type ProjectRootSpec = {
  /** Full path, e.g. `@user:projects`. */
  path: ProjectRootPath
  /** Owner of project, as `@user` or `@system`. */
  owner: string
  /** Domain of project, as `projects`, `examples` or `guides`. */
  domain: string
  /** User-friendly title of project. */
  title: string
  /** Type of project for string concatenation, as `Project`, `Example` or `Guide`. */
  Type: string
  /** Type of project for string concatenation, as `project`, `example` or `guide`. */
  type: string
  /** User friendly description of project. */
  description: string
  /**
   * Folder on disk holding this root's projects (one sub-folder each) -- SERVER ONLY.
   * - Built-in roots leave it out:  `project-utils.ts` derives theirs from `environment` and `folder`.
   */
  serverPath?: string
  /**
   * Built-in root's folder under its owner's files root, e.g. `examples` -- default its `domain`.
   * - `""` ~== the files root itself, e.g. `@user:projects` in `projects/user`.
   * - See `serverPathForRoot()` in `project-utils.ts`.
   */
  folder?: string
  /** Shown in the app's UI only in dev, e.g. `@test:fixtures` -- it's there in every build, just not listed. */
  devOnly?: boolean
  /**
   * Short name for paths in this root:  `<alias>/<project>...` ~== `<path>:<project>...`, e.g. `@test/FizzBuzz`
   * ~== `@test:fixtures:FizzBuzz`.  See `SpellSetup.expandAlias()`.
   * - Only ever written:  a `SpellLocation` stores the full path.
   */
  alias?: `@${string}`
  /** Semantic UI icon of project. */
  icon: string
}

// ## Statements

/** What a `SpellStatement` takes as its body -- decoded from the body keyword ending its `syntax`. */
export type StatementBodySpec = {
  /** Rule to parse rest of the line as, if we take an inline body. */
  inlineAs?: "statement" | "expression"
  /** How to parse the indented block after us, if we take one:  every line as a `"block"`, or ONE line. */
  nestedAs?: "block" | "expression"
  /** Body keyword rule from `syntax`, e.g. `{statement_body}?`, echoed back by `toRulexSyntax()`. */
  syntaxRule: P.Rule
  /**
   * `true`:  the keyword is ALSO a registered rule, matching the words which open the body at the end of our line,
   * e.g. `{with_nested_statements}` matching `where:`.  It stays in `rules`, and we take a nested body only when it
   * matched -- see `SpellStatement.takesNestedBody()`.
   */
  leadIn?: boolean
}

/**
 * Body keywords which may END a `SpellStatement`'s `syntax`, alone or as a choice,
 * e.g. `({inline_statement}|{nested_statements})?`.
 * - Not registered rules:  `SpellStatement` takes them out of `rules`, so they're never parsed as rules.
 * - Except a `leadIn` one, which matches words on our line, e.g. `{with_nested_statements}`.
 */
export const BODY_KEYWORDS: Record<string, Omit<StatementBodySpec, "syntaxRule">> = {
  // Statement bodies, e.g. `if`, `for each`, method definitions.
  /** Usual case:  `{statement_body}` ~== `({inline_statement}|{nested_statements})`. */
  statement_body: { inlineAs: "statement", nestedAs: "block" },
  /** Rest of the line, as a statement. */
  inline_statement: { inlineAs: "statement" },
  /** Indented block of statements after the line, wrapped in `{}` when compiled. */
  nested_statements: { nestedAs: "block" },
  /**
   * `where:`, `with:` or `:` ending the line, then an indented block, e.g. a type's outline body.
   * - A registered rule matching those words (`classes.ts`), so it stays in `rules` -- see `leadIn`.
   */
  with_nested_statements: { nestedAs: "block", leadIn: true },

  // Expression bodies, e.g. property getters, `where` clauses, `return`.
  /** Getter-style body:  `{expression_body}` ~== `({inline_expression}|{nested_statements})`. */
  expression_body: { inlineAs: "expression", nestedAs: "block" },
  /** Rest of the line, as an expression. */
  inline_expression: { inlineAs: "expression" },
  /**
   * ONE indented line after the line, as an expression, e.g. `return` + indented JSX.
   * - TODO: review -- only `return` uses it, and only because a line can't see the indented lines under it.
   */
  nested_expression: { nestedAs: "expression" }
}

/**
 * A property `set the X of Y to ...` declared at its first set, as `Y`'s type never did.
 * - Noted on that `set`'s match as `data.autoDeclared` (see `AssignmentStatement`), for its FILE to compile once:
 *   `Card.declareProp('pile', { type: 'Pile' })` + `Object.defineProperty(Card.prototype, 'pile', ...)`.
 * - See `SP.Block.autoDeclarations()`.
 */
export type AutoDeclaredProperty = {
  /** Its type's name, e.g. `Card`. */
  typeName: string
  /** Its name as it compiles, e.g. `pile`. */
  property: string
  /** What its setter checks values against, e.g. `Pile` -- see `SC.PropCheck.type`.  None if unknown. */
  checkType?: string
  /** Statement declaring its type:  if that's in the same file, the property goes right after it. */
  typeDeclaredBy: P.Match
}

// ## Warnings

/**
 * Something a program should say, but which doesn't stop it parsing or running,
 * e.g. what a property is:  `a calculator has an input` => "Say what "input" is, e.g. ...".
 * - Noted by the rule which spotted it, on its match, while parsing -- see `SP.SpellWarnings`.
 */
export type SpellWarning = {
  /** What to say, e.g. `Say what "input" is, e.g. "a calculator has an input as text"`. */
  message: string
  /** What it's about:  editors show it under this match's text, e.g. `(digit)` in a method's signature. */
  at: P.Match
}

// ## Built-in types

/**
 * One built-in type in `SP.BUILT_IN_TYPE_TABLE`:  what it is, and its members.
 * - DATA, read by the parser, editors and the Type Explorer's pack.  See `builtinTypes.ts`.
 * - Why data, not a `.spell` file or statics on runtime classes:  nothing to parse at startup,
 *   and the parser never imports runtime code (plan doc D25).
 */
export type BuiltInType = {
  /** Its datatype, in spell's words, e.g. `text`, `list` -- one of `P.BUILT_IN_TYPES`. */
  name: P.Datatype
  /** Its super-type, if any, e.g. `thing` for `app` -- MUST be what `P.BUILT_IN_TYPES` says. */
  superType?: P.Datatype
  /** What it holds, if it's a sort of list, e.g. `character` for `text` -- see `P.TypeScope.itemType`. */
  itemType?: P.Datatype
  /** One-line summary, for the Type Explorer, e.g. `counts from 1`. */
  detail?: string
  /** Its docs, as markdown. */
  docstring?: string
  /** Built-in rules which make or declare one, e.g. `create_type`, by name. */
  rules?: string[]
  /** What it has, in the order the Type Explorer lists them. */
  members: BuiltInMember[]
}

/**
 * One member of a `BuiltInType` -- read through its `readAs` template, or written with its own built-in `rules`.
 * - With `readAs`:  a property READ, resolved by the type of what it's read from:
 *   - `the length of the name` => `name.length`
 *   - `the length of the deck` => `spellCore.itemCountOf(deck)`
 *   - loaded into its type's `TypeScope` as a `P.ScopeVariable`, so `TypeScope.getMember()` finds it
 * - With `rules` (and no `readAs`):  docs for what built-in rules already say, e.g. `shuffle (a list)`.
 *   - Their rules compile them;  NOT loaded into scope -- see `loadBuiltInTypes()`.
 */
export type BuiltInMember = {
  /**
   * Its words, e.g. `length`, `first character`.
   * - A method's with its arguments, e.g. `add (a thing) to (a list)`.
   */
  words: string
  /** What the Type Explorer files it under. */
  kind: "property" | "method"
  /** What it is, or returns, in spell's words, e.g. `number`. */
  datatype?: P.Datatype
  /** A method's parameters, if it takes any, e.g. `[{ name: "thing" }]`. */
  params?: P.ScopeParam[]
  /**
   * How a read of it compiles:  a template, `{it}` standing for what it's read from.  One of:
   * - `{it}.length`:  a javascript property
   * - `{it}.getFullYear()`:  a javascript method, no arguments
   * - `spellCore.itemCountOf({it})`:  a `spellCore` helper, `{it}` its one argument
   * - Pinned to a real property or method by `builtinTypes.test.ts`.  See `parseReadAsTemplate()`.
   */
  readAs?: string
  /** Built-in rules which spell it, by name, e.g. `list_shuffle` -- their syntax shows in the Type Explorer. */
  rules?: string[]
  /** Its docs, as markdown. */
  docstring?: string
}

/** A `BuiltInMember.readAs` template, taken apart -- see `parseReadAsTemplate()`. */
export type ReadAsTemplate = {
  /**
   * Which form it is:
   * - `property`:  `{it}.name`
   * - `method`:  `{it}.name()`
   * - `spellCore`:  `spellCore.name({it})`
   * - `static`:  `Type.name({it})` -- a VALUE kind's property, e.g. `Suit.color({it})` (epic `outline-spell`)
   */
  form: "property" | "method" | "spellCore" | "static"
  /** Property or method name, e.g. `length`, `itemCountOf`. */
  name: string
  /** `static` form:  the class it's called on, e.g. `Suit`. */
  type?: string
}

// ## Declarations

/**
 * Semver of the spell LANGUAGE and its compiler -- stamped on every project's declarations as `spellVersion`.
 * - Set by hand, NOT from `package.json`:  the app's version (`PACKAGE_VERSION` in `$/util`) changes for
 *   reasons that don't touch what compiled projects can read.
 * - Bump the MAJOR when declarations' shape, or generated-name mangling (e.g. `frobnicate_$thing`), changes:
 *   declarations from another major are refused.
 */
export const SPELL_VERSION = "0.8.0"

/**
 * Everything a project added to scope while parsing, as plain data -- see `SpellDeclarations`.
 * - Lives in `<Project>.declarations.json`, beside its compiled output, so another project can import it WITHOUT
 *   re-parsing its `.spell` files -- whatever language that output is in.
 * - JSON:  no `Match`es, classes or functions.
 */
export type SpellDeclarationsData = {
  /** This project's own semver, from its `project.json` -- if it has one. */
  version?: string
  /** Semver of the compiler which wrote these -- see `SPELL_VERSION`. */
  spellVersion: string
  /**
   * Names this project offers importers:  its types, then its top-level functions.
   * - Each an `export` of its compiled JS.
   */
  provides: string[]
  /** What each declaring statement declared, in source order. */
  statements: SpellDeclaration[]
  /**
   * Where each of `statements` starts in the compiled output:  its line, from 0 -- so a Type Explorer can show a
   * declaration's code.  Missing in declarations read from an older compiled `.js`.
   */
  codeLines?: number[]
}

/**
 * What ONE statement declared, flat -- a `/*! SPELL: DECLARES {...} *\/` comment, e.g.
 * `{ property: "suit", classVariable: "Suits", of: "Card", enumeration: [...] }`.
 * - Only what can't be worked out from the rest, e.g. `constants` are left out when they're just
 *   `enumeration`'s strings.
 * - Keys are shared by what it declared:  `of` is both a property's type and its rules' owner.
 */
export type SpellDeclaration = {
  /** Type it declares, e.g. `Card`. */
  type?: string
  /** `type`'s supertype, e.g. `Thing`. */
  superType?: string
  /**
   * What `type` holds, if it's a list type, e.g. `Card` for `a deck is a list of cards`.
   * - See `P.TypeScope.itemType`.
   */
  itemType?: string
  /**
   * `true` if `property` names the ONE list of a family holding its item,
   * e.g. `pile` on `Card` for `a card belongs to one pile` -- its `datatype` is the list type.
   * - Read-only:  see `P.ScopeVariable.exclusive`.
   */
  exclusive?: boolean
  /** Instance property it declares, e.g. `suit`. */
  property?: string
  /**
   * `property`'s words as written, when not its name, e.g. `short rank` for `short_rank`.
   * - So an importer's editors show what the author typed.  See `P.ScopeVariable.asWritten`.
   */
  asWritten?: string
  /**
   * Class variable holding an enumerated property's values, e.g. `Suits` -- instances see it too.
   * - Its values are `enumeration`.
   */
  classVariable?: string
  /** Type it declares things ON, e.g. `Card` -- also its rule's owner.  None for a top-level function. */
  of?: string
  /** `property`'s datatype, e.g. `text`. */
  datatype?: string
  /**
   * `property` was declared by its first `set`, as its type never declared it.
   * - See `P.ScopeVariable.autoDeclared`.
   */
  autoDeclared?: boolean
  /**
   * `property` is DERIVED:  a getter works it out, e.g. `the short rank of a card is: ...`.
   * - Loads as `P.ScopeVariable.isGetter`, so the TypeScript writer reads it by TypeScript's name (`shortRank`).
   * - Left out for an `exclusive` member, which is always one:  loading works it out.
   */
  getter?: boolean
  /** A method's parameters, with their datatypes where known -- see `P.ScopeMethod.params`. */
  params?: P.ScopeParam[]
  /** What a method returns, if known -- see `P.ScopeMethod.returns`. */
  returns?: string
  /** `property`'s compiled initial value. */
  initializer?: string
  /** `classVariable`'s values as parsed, e.g. `["'clubs'", "'diamonds'"]`. */
  enumeration?: Array<string | number>
  /** Constants it declares, e.g. `["red", "black"]` -- default:  `enumeration`'s strings, unquoted. */
  constants?: string[]
  /** Compiled output of any `constants` NOT output as just their name, quoted. */
  constantOutputs?: Record<string, string>
  /**
   * `importableAs` name of the class its rule was `specialize()`d from, e.g. `"method_call"` -- see
   * `P.Rule.importableRule()`.
   * - Its OTHER keys here are what that class's `specialize()` takes, e.g. `output` + `alias`.
   */
  rule?: string
  /**
   * Its rule's syntax.
   * - None in an OLD `rule: "enumeration"` declaration, from before `class_member`:  loading skips those.
   */
  syntax?: string
  /** Name of the generated method its rule calls, in compiled JS, e.g. `play_fizzbuzz`. */
  output?: string
  /** What it declares, for editors, e.g. `function` -- left out when a key above says, e.g. `type`. */
  kind?: string
  /**
   * Its name as written, for editors, e.g. `draw (a card)` -- only with `kind`, and left out when it's `syntax`.
   * - See `P.Declaration.name`.
   */
  name?: string
  /**
   * Where it is, as `<file>:<start>-<end>` character offsets, e.g. `/FizzBuzz.spell:23-412` -- for editors.
   * - Project-relative:  a library may move.
   */
  defined?: string
} & Record<string, unknown>

/**
 * One project another imports, for `SpellDeclarations.importScope()` -- from a `project.json` `imports` entry.
 */
export type DeclarationsImport = {
  /** Where it came from, e.g. `@library/cards` -- recorded in `P.ImportScope.origins`, and named in errors. */
  from: string
  /** Its declarations. */
  declarations: SpellDeclarationsData
  /**
   * Names to import, e.g. `["Card"]`;  `"*"` ~== everything else it provides.  Default `["*"]`.
   * - Each brings its type dependencies, and the constants and rules it owns.
   * - `Name:Alias` renames a type, e.g. `Card:Playingcard` -- see `SpellDeclarations.picked()`.
   */
  import?: string[]
  /**
   * Its project id, e.g. `@system:library:cards` -- what loaded records' `declaredAt` paths start with.
   * - Default `from`.
   */
  projectId?: string
  /** Semver range its `version` must satisfy, e.g. `"^1.2"`. */
  version?: string
  /**
   * ES module specifier its compiled JS is imported by at runtime, e.g. `@spell/project/@system:library:cards`.
   * - Recorded with the names loaded in `P.ImportScope.modules`, so the importer's compiled output imports them.
   */
  module?: string
}

////////////////
// ## Highlighting
////////////////

/**
 * One coloured stretch of spell source, from `SpellHighlighter.spans()`.
 * - `kind` is a highlight.js scope (`keyword`, `title.function`, `section` ...), so `<ui-code>` colours spell with
 *   the same `hljs-*` classes as every other language.
 */
export type SpellHighlightSpan = {
  /** first character */
  start: number
  /** one past the last */
  end: number
  /** highlight.js scope */
  kind: string
}
