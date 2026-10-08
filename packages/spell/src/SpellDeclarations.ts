import JSON5 from "json5"
import semver from "semver"

import { singularize, typeCase } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"

/**
 * A project's declarations:  everything it added to scope while parsing, as plain data -- see `SP.SpellDeclarationsData`.
 * - Why:  they live in `<Project>.declarations.json` beside its compiled output, so another project can import it
 *   WITHOUT re-parsing its `.spell` files.
 * - Gathered from the AST, in two steps:
 *   - while compiling, `commentFor()` gives each declaring statement a `/*! SPELL: DECLARES {...} *\/` comment
 *     above its code -- a MARKER, never written to disk
 *   - `split()` takes the markers back OUT of the project's compiled text, into the declarations, noting where each
 *     statement's code starts (`codeLines`), so a Type Explorer can still show it
 * - Each marker is a JS object literal, read back with `JSON5`.
 * - `read()` reads a declarations file;  `load()` replays it into another project's import layer.
 * - A project compiled before the file existed has its declarations in its compiled `.js` instead:
 *   `fromComments()`.
 */
export class SpellDeclarations {
  ////////////////
  // ## Writing
  ////////////////

  /**
   * Project `scope`'s compiled text with markers (see `commentFor()`) as its `code`, markers out, and its
   * `declarations`:  its versions, what it `provides`, each marker's statement and where its code starts.
   * - `version` / `exports` come from its `project.json` -- see `provides()`.
   * - A marker MUST start its line, and end one:  as `ASTPreservedComment` writes it, indented in a class body.
   */
  static split(
    compiled: string,
    scope: P.ProjectScope,
    { version, exports }: { version?: string; exports?: string[] } = {}
  ): { code: string; declarations: SP.SpellDeclarationsData } {
    const code: string[] = []
    const statements: SP.SpellDeclaration[] = []
    const codeLines: number[] = []
    const lines = compiled.split("\n")
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index]!
      if (!MARKER_START.test(line)) {
        code.push(line)
        continue
      }
      const body: string[] = []
      while (index < lines.length && !MARKER_END.test(lines[index]!)) body.push(lines[index++]!)
      body.push(lines[index] ?? "")
      const literal = body.join("\n")
      statements.push(
        JSON5.parse<SP.SpellDeclaration>(literal.slice(literal.indexOf("{"), literal.lastIndexOf("}") + 1))
      )
      codeLines.push(code.length)
    }
    const declarations = definedOnly({
      version,
      spellVersion: SP.SPELL_VERSION,
      provides: SpellDeclarations.provides(scope, exports),
      statements,
      codeLines
    })
    return { code: code.join("\n"), declarations }
  }

  /**
   * Names parsed project `scope` offers importers:  its own types, then its top-level functions.
   * - `exports` from its `project.json` limits them, default everything.  Throws if it names something the
   *   project doesn't declare.
   */
  static provides(scope: P.ProjectScope, exports?: string[]): string[] {
    const types = scope.types
      .get()
      .filter((type) => !type.stub)
      .map((type) => type.name)
    const functions = scope.rules
      .get()
      .filter(({ declaredBy }) => declaredBy?.rule.getDeclaration(declaredBy)?.kind === "function")
      .map((rule) => rule.name)
    const declared = [...types, ...functions]
    const unknown = exports?.find((name) => !declared.includes(name))
    if (unknown) {
      throw new P.ParserError({
        message: `'${scope.name}' exports '${unknown}', which it doesn't declare.`,
        activity: "SpellDeclarations.provides",
        params: { exports }
      })
    }
    return exports ?? declared
  }

  /**
   * `/*! SPELL: DECLARES {...} *\/` comment for `statement`, to compile just above its code -- `undefined` if it
   * declared nothing another project could see.  See `declarationFor()`.
   * - Props packed a few to a line, then where it is -- `defined` -- last on its own:  3-7 lines all told.
   */
  static commentFor(statement: P.Match): P.ASTPreservedComment | undefined {
    const declaration = SpellDeclarations.declarationFor(statement)
    if (!declaration) return undefined
    const { defined, ...props } = declaration
    const lines = [`${DECLARES_MARKER} {`, ...packProps(props)]
    lines.push(...packProps(definedOnly({ defined })))
    lines.push("}")
    return new P.ASTPreservedComment(statement, { lines })
  }

  /**
   * What `statement` declared, as ONE flat object -- from the scope records it noted while parsing
   * (`match.data.declared`, see `P.ScopeList.noteDeclared()`).  `undefined` if nothing another project could see.
   * - Records share keys, e.g. a method's `of` is also its rule's owner.  Throws if two disagree.
   * - Leaves out what loading works out again -- see `SP.SpellDeclaration`.
   * - Its `kind` and `name` are what its rule's `getDeclaration()` says -- unless a key already says, e.g. `type`.
   * - Skips what it no longer declares, e.g. a type it stubbed which a later `a card is a thing` claimed,
   *   and what never leaves its file, e.g. local variables.
   * - A record is ours if its `declaredBy` holds the SAME `declared` list -- this statement, or a clone of it
   *   which incremental parsing re-bodied (`BlockLine.reparseBody()`):  `Match.clone()` copies `data` shallowly.
   * - Throws if a rule it built wasn't `specialize()`d from a class with an `importableAs` -- another project
   *   couldn't rebuild it.  See `P.Rule.importableAs`.
   */
  static declarationFor(statement: P.Match): SP.SpellDeclaration | undefined {
    const declared = (statement.data as { declared?: unknown[] }).declared ?? []
    const mine = declared.filter(
      (item) => ((item as { declaredBy?: P.Match }).declaredBy?.data as { declared?: unknown[] })?.declared === declared
    )
    const declaration: SP.SpellDeclaration = {}
    const constants: string[] = []
    const constantOutputs: Record<string, string> = {}
    for (const item of mine) {
      if (item instanceof P.TypeScope) {
        if (!item.stub) merge({ type: item.name, superType: item.superType, itemType: item.itemType })
      } else if (item instanceof P.ScopeMethod) {
        merge(SpellDeclarations.methodDeclaration(item))
      } else if (item instanceof P.ScopeVariable) {
        if (item.scope instanceof P.TypeScope) merge(SpellDeclarations.variableDeclaration(item, item.scope, mine))
      } else if (item instanceof P.ScopeConstant) {
        constants.push(item.name)
        if (item.output !== `'${item.name}'`) constantOutputs[item.name] = item.output
      } else if (isScopeRule(item)) {
        merge({ ...SpellDeclarations.ruleDeclaration(item), of: SpellDeclarations.ownerOf(statement) })
      }
    }
    // constants an `enumeration` declares are loaded from it
    const fromEnumeration = enumerationConstants(declaration.enumeration)
    const others = constants.filter((name) => !fromEnumeration.includes(name))
    if (others.length) declaration.constants = others
    if (Object.keys(constantOutputs).length) declaration.constantOutputs = constantOutputs
    if (!Object.keys(declaration).length) return undefined

    const { kind, name } = statement.rule.getDeclaration(statement) ?? {}
    if (kind && !(kind in declaration)) {
      declaration.kind = kind
      if (name !== declaration.syntax) declaration.name = name
    }
    return orderedProps({ ...declaration, defined: SpellDeclarations.definedAt(statement) })

    /** Add `props`' defined values to `declaration` -- throws if one it already has says something else. */
    function merge(props: SP.SpellDeclaration) {
      for (const [key, value] of Object.entries(props)) {
        if (value === undefined) continue
        if (key in declaration && JSON.stringify(declaration[key]) !== JSON.stringify(value)) {
          throw new P.ParserError({
            message: `'${statement.inputText}' declares two different '${key}'s:  ${toLiteral(declaration[key])} and ${toLiteral(value)}.`,
            context: statement,
            activity: "SpellDeclarations.declarationFor",
            params: { key }
          })
        }
        declaration[key] = value
      }
    }
  }

  ////////////////
  // ## Reading
  ////////////////

  /**
   * Declarations in `json`, a project's `<Project>.declarations.json` -- `undefined` if it isn't one.
   * - Reads TEXT:  never runs anything.
   */
  static read(json: string): SP.SpellDeclarationsData | undefined {
    try {
      const data = JSON.parse(json) as Partial<SP.SpellDeclarationsData>
      if (typeof data.spellVersion !== "string" || !Array.isArray(data.statements)) return undefined
      return data as SP.SpellDeclarationsData
    } catch {
      return undefined
    }
  }

  /**
   * Declarations in `compiled`, a project's `<Project>.compiled.js` from before declarations had a file of their own
   * (epic `output-targets`, P5) -- `undefined` if it has no `/*! SPELL: PROJECT {...} *\/` header.
   * - Reads TEXT:  never runs the compiled code.
   */
  static fromComments(compiled: string): SP.SpellDeclarationsData | undefined {
    const header = compiled.match(new RegExp(`/\\*! ${PROJECT_MARKER} (\\{.*\\}) \\*/`))
    if (!header) return undefined
    const statements = [...compiled.matchAll(DECLARES_COMMENT)].map(([, body]) =>
      JSON5.parse<SP.SpellDeclaration>(body!)
    )
    return { ...JSON5.parse(header[1]!), statements } as SP.SpellDeclarationsData
  }

  /**
   * `compiled` without its `/*! SPELL: DECLARES` comments -- e.g. for a rule's unit tests, which are about its
   * code:  declarations have their own tests.
   */
  static stripComments(compiled: string): string {
    // with its indent, if it's in a class body
    return compiled.replace(new RegExp(`^[ \\t]*${DECLARES_COMMENT.source}\\n?`, "gm"), "")
  }

  ////////////////
  // ## Loading
  ////////////////

  /**
   * New `P.ImportScope` under `parentScope`, holding each of `imports` -- a project's import layer.
   * - A project's scope goes UNDER it, with a clone of its `parser` -- see `P.ImportScope`.
   * - Throws `P.ParserError` if any can't be loaded -- see `load()`.
   */
  static importScope(parentScope: P.Scope, imports: SP.DeclarationsImport[]): P.ImportScope {
    const scope = new P.ImportScope({
      name: "imports",
      parser: parentScope.parser!.clone({ module: "imports" }),
      parentScope
    })
    for (const it of imports) SpellDeclarations.load(scope, it)
    return scope
  }

  /**
   * Load one project's `declarations` into import layer `scope` -- just what `import` picks, replaying each
   * statement's in order.
   * - Each picked name brings its type dependencies (`superType`, property datatypes) and what it owns:
   *   its properties, constants and rules, e.g. `Card` brings `card suits`.
   * - A type picked as `Card:Playingcard` loads as `Playingcard`, everywhere a loaded record names it -- see
   *   `renamed()`.  Its `runtimeName` stays `Card`:  its class is still called that when the code runs.
   * - Records where each name came from in `scope.origins`, and what `module` provides in `scope.modules`.
   * - Each record keeps where it was declared, in `projectId`'s sources, for editors:  `declaredAt` on types,
   *   variables and constants, and `declared` on rules -- see `P.DeclaredAt`.  It has no `declaredBy`.
   * - Throws `P.ParserError`, rather than loading something half right, if
   *   - it was written by a compiler of another MAJOR version -- see `SP.SPELL_VERSION`
   *   - its `version` doesn't satisfy the importer's range
   *   - `import` names something it doesn't provide, or renames it badly -- see `picked()`
   *   - a type it declares was already imported, from elsewhere -- NOT a rule:  see `checkImportClashes()`
   */
  static load(
    scope: P.ImportScope,
    { from, projectId = from, declarations, import: picks = ["*"], version, module }: SP.DeclarationsImport
  ) {
    SpellDeclarations.checkVersions(from, declarations, version)
    const { names: originals, renames } = SpellDeclarations.picked(from, declarations, picks)
    // what the importer's compiled JS imports:  names its JS exports, which we loaded -- aliased if renamed
    const provided = declarations.provides
      .filter((name) => originals.has(name))
      .map((name) => (renames.has(name) ? `${name} as ${renames.get(name)}` : name))
    if (module) scope.modules.set(module, provided)
    // names as the importer knows them
    const names = new Set([...originals].map((name) => renames.get(name) ?? name))
    for (const original of declarations.statements) {
      const declaration = SpellDeclarations.renamed(original, renames)
      const declaredAt = SpellDeclarations.declaredAt(projectId, declaration.defined)
      if (declaration.type) {
        const runtimeName = declaration.type === original.type ? undefined : original.type
        const { type, superType, itemType } = declaration
        const props = { name: type, superType, itemType, runtimeName, declaredAt }
        SpellDeclarations.loadType(scope, from, names, props)
      }
      SpellDeclarations.loadVariables(scope, names, declaration, declaredAt)
      SpellDeclarations.loadConstants(scope, from, names, declaration, declaredAt)
      // an enumeration's rule, from before `class_member` read every type's class variables:  nothing to load
      const { rule } = declaration
      if (rule && rule !== LEGACY_ENUMERATION_RULE) {
        SpellDeclarations.loadRule(scope, from, names, rule, declaration, declaredAt)
      }
      SpellDeclarations.loadMethod(scope, names, declaration, declaredAt)
    }
  }

  /**
   * Throws `P.ParserError` if parsed project `scope` itself declares a type it also imports,
   * e.g. its own `a card is a thing` when `Card` comes from `@library/cards`.
   * - Its imports are the `P.ImportScope` above it -- nothing to check without one.
   * - Types only:  a RULE name may repeat, e.g. `draw` methods on two types merge into one `P.Group`, as they
   *   would parsing everything from source.
   * - Only a project's own names can clash:  parse it first.
   */
  static checkImportClashes(scope: P.ProjectScope) {
    const imports = scope.parentScope
    if (!(imports instanceof P.ImportScope)) return
    const clash = scope.types
      .get()
      .filter((type) => !type.stub)
      .map((type) => type.name)
      .find((name) => imports.origins.has(name))
    if (clash) {
      throw new P.ParserError({
        message: `'${scope.name}' declares '${clash}', which it also imports from '${imports.origins.get(clash)}'.`,
        activity: "SpellDeclarations.checkImportClashes",
        params: { name: clash }
      })
    }
  }

  /**
   * Type `type`, if picked -- throws if another import already declared it.
   * - `runtimeName`:  its class's name when the code runs, if it was renamed -- see `P.TypeScope.runtimeName`.
   */
  private static loadType(scope: P.ImportScope, from: string, names: Set<string>, type: P.TypeScopeProps) {
    const { name } = type
    if (!names.has(name)) return
    if (scope.types.get(name, "LOCAL_ONLY")) {
      SpellDeclarations.fail(from, `type '${name}' was already imported from '${scope.origins.get(name)}'`)
    }
    scope.types.add(definedOnly(type))
    scope.origins.set(name, from)
  }

  /**
   * `declaration`'s `property` and `classVariable`, if their type `of` was picked.
   * - A `classVariable` goes on instances too, with its `enumeration` as initializer -- as `define_property_has`
   *   declares it.
   * - An `exclusive` property is the member `a card belongs to one pile` gave, e.g. `pile` on `Card`:
   *   read-only, as there -- see `P.TypeScope.declareOwnerMember()`.
   */
  private static loadVariables(
    scope: P.ImportScope,
    names: Set<string>,
    declaration: SP.SpellDeclaration,
    declaredAt: P.DeclaredAt | undefined
  ) {
    const { property, asWritten, classVariable, of, datatype, initializer, enumeration, autoDeclared, exclusive } =
      declaration
    const typeScope = of && names.has(of) ? scope.types.get(of, "LOCAL_ONLY") : undefined
    if (!typeScope) return
    if (property) {
      typeScope.variables.add(
        definedOnly({ name: property, asWritten, datatype, initializer, autoDeclared, exclusive, declaredAt })
      )
    }
    if (classVariable) {
      const variable = definedOnly({
        name: classVariable,
        enumeration,
        initializer: enumerationInitializer(enumeration),
        declaredAt
      })
      typeScope.classVariables.add({ ...variable })
      typeScope.variables.add({ ...variable })
    }
  }

  /**
   * `declaration`'s constants -- its `constants`, plus `enumeration`'s strings -- if their owner `of` was picked.
   * - The same constant twice is fine, unless it means something else.
   */
  private static loadConstants(
    scope: P.ImportScope,
    from: string,
    names: Set<string>,
    { of, enumeration, constants = [], constantOutputs = {} }: SP.SpellDeclaration,
    declaredAt: P.DeclaredAt | undefined
  ) {
    if (of && !names.has(of)) return
    for (const name of [...enumerationConstants(enumeration), ...constants]) {
      const output = constantOutputs[name] ?? `'${name}'`
      const existing = scope.constants.get(name, "LOCAL_ONLY")
      if (existing?.output === output) continue
      if (existing) SpellDeclarations.fail(from, `constant '${name}' was already imported, as '${existing.output}'`)
      scope.constants.add(definedOnly({ name, output, declaredAt }))
    }
  }

  /**
   * `declaration`'s rule, if its owner was picked:  class `importableAs`, `specialize()`d with `declaration` --
   * which picks out what it needs.
   * - Owner:  type `of`, else itself, for a top-level function.
   * - Its `P.ScopeRule.declared` keeps its owner, what its statement declared and where -- for editors.
   */
  private static loadRule(
    scope: P.ImportScope,
    from: string,
    names: Set<string>,
    importableAs: string,
    declaration: SP.SpellDeclaration,
    declaredAt: P.DeclaredAt | undefined
  ) {
    const owner = declaration.of ?? declaration.output ?? ""
    if (!names.has(owner)) return
    const ruleClass = P.Rule.importableRule(importableAs)
    if (!ruleClass) SpellDeclarations.fail(from, `no rule class is importable as '${importableAs}'`)
    const rule = ruleClass.specialize(declaration as P.RuleStatics)
    const { syntax } = declaration
    const declared = definedOnly({ owner, declaration: SpellDeclarations.editorDeclaration(declaration), declaredAt })
    scope.addRule(rule, syntax === undefined ? {} : { syntax }, undefined, declared)
    if (rule.ruleName) scope.origins.set(rule.ruleName, from)
  }

  /**
   * `declaration`'s method record, if it declared a method or function and its owner was picked.
   * - See `P.ScopeMethod`.
   * - On its type `of`, else the import layer's own `methods`, for a free function.
   * - Keys a compiler from before P4 didn't write -- `params`, `returns` -- load as unknown.
   */
  private static loadMethod(
    scope: P.ImportScope,
    names: Set<string>,
    declaration: SP.SpellDeclaration,
    declaredAt: P.DeclaredAt | undefined
  ) {
    const { kind, output, of, params, returns, syntax } = declaration
    if ((kind !== "method" && kind !== "function") || !output) return
    const owner = of ?? output
    if (!names.has(owner)) return
    const methods = of ? scope.types.get(of, "LOCAL_ONLY")?.methods : scope.methods
    const asWritten = declaration.name ?? syntax
    methods?.add(definedOnly({ name: output, asWritten, params, returns, of, declaredAt }))
  }

  /**
   * What `declaration`'s statement declared, as its rule's `getDeclaration()` said when it was parsed --
   * `undefined` if it doesn't say.
   * - `kind` and `name` where `declarationFor()` left them out because a key says, e.g. `property`.
   * - `name` defaults to `syntax`, e.g. `play fizzbuzz`;  `detail` to `output()`, as `MethodDefinition` says.
   */
  private static editorDeclaration(declaration: SP.SpellDeclaration): P.ImportedRuleDeclared["declaration"] {
    const { type, property, classVariable, of, syntax, output } = declaration
    const kind = (declaration.kind ?? (type ? "type" : property || classVariable ? "property" : undefined)) as
      | P.DeclarationKind
      | undefined
    const name =
      declaration.name ?? (kind === "type" ? type : kind === "property" ? (property ?? classVariable) : syntax)
    if (!kind || name === undefined) return undefined
    const isMethod = kind === "method" || kind === "function"
    return definedOnly({ kind, name, of, detail: isMethod && output ? `${output}()` : undefined })
  }

  /**
   * Where a statement `defined` itself -- `<file>:<start>-<end>` -- in project `projectId`, e.g.
   * `{ path: "@system:library:cards/Card.spell", start: 23, end: 412 }`.  `undefined` if it doesn't say.
   * - Reverses `definedAt()`.
   */
  private static declaredAt(projectId: string, defined: string | undefined): P.DeclaredAt | undefined {
    const match = defined?.match(/^(.*):(\d+)-(\d+)$/)
    if (!match) return undefined
    return { path: `${projectId}${match[1]}`, start: Number(match[2]), end: Number(match[3]) }
  }

  /** Throws unless `declarations` suit this compiler, and the importer's `range`, if any. */
  private static checkVersions(from: string, declarations: SP.SpellDeclarationsData, range: string | undefined) {
    const { spellVersion, version } = declarations
    if (!semver.valid(spellVersion) || semver.major(spellVersion) !== semver.major(SP.SPELL_VERSION)) {
      SpellDeclarations.fail(from, `it was compiled by spell ${spellVersion}, this is spell ${SP.SPELL_VERSION}`)
    }
    if (range && !(version && semver.satisfies(version, range))) {
      SpellDeclarations.fail(from, `its version ${version ?? "(none)"} isn't '${range}'`)
    }
  }

  /**
   * What `picks` load:  each picked name, plus the types it depends on -- its `superType`, and types its
   * properties hold -- all by their names in `declarations`.  And what to rename, e.g. `Card` => `Playingcard`.
   * - `"*"` ~== everything `declarations` provides, under its own name -- bar what's renamed.
   * - `"Card:Playingcard"` picks `Card`, as `Playingcard`.  Throws unless it's a TYPE, and the new name is
   *   one word (dashes OK) that nothing else loaded is called.
   */
  private static picked(
    from: string,
    declarations: SP.SpellDeclarationsData,
    picks: string[]
  ): { names: Set<string>; renames: Map<string, string> } {
    const { provides, statements } = declarations
    const names = new Set<string>()
    const renames = new Map<string, string>()
    for (const pick of picks) {
      if (pick === "*") {
        provides.forEach((name) => names.add(name))
        continue
      }
      const [name = "", alias] = pick.split(":").map((part) => part.trim())
      if (!provides.includes(name)) SpellDeclarations.fail(from, `it doesn't provide '${name}'`)
      names.add(name)
      if (alias === undefined) continue
      if (!statements.some(({ type }) => type === name)) {
        SpellDeclarations.fail(from, `only a type can be renamed, not '${name}'`)
      }
      if (!P.ALPHANUMERIC_WORD_WITH_DASHES.test(alias)) {
        SpellDeclarations.fail(from, `'${alias}' isn't a type name:  one word, dashes OK`)
      }
      renames.set(name, typeCase(alias))
    }
    // what each type needs -- `names` grows as we go, so dependencies' dependencies come too
    const needs = new Map<string, string[]>()
    for (const { type, superType, property, of, datatype } of statements) {
      if (type) needs.set(type, [...(needs.get(type) ?? []), superType ?? ""])
      if (property && of && datatype) needs.set(of, [...(needs.get(of) ?? []), datatype])
    }
    for (const name of names) {
      for (const need of needs.get(name) ?? []) if (need && needs.has(typeCase(need))) names.add(typeCase(need))
    }
    // a new name MUST be unique among what's loaded
    const loaded = [...names].map((name) => renames.get(name) ?? name)
    const twice = loaded.find((name, index) => loaded.indexOf(name) !== index)
    if (twice) SpellDeclarations.fail(from, `two things it loads would both be called '${twice}'`)
    return { names, renames }
  }

  /**
   * `declaration` with each type it names renamed by `renames`, e.g. `of: "Card"` => `of: "Playingcard"`.
   * - Its `type`, `superType`, `of`, `datatype`, `itemType`, `returns` and its `params`' datatypes.
   * - A rule built from it takes the new name from `of`, e.g. a quoted alias `playingcard is a queen`.
   * - NOT method names, syntax or constants:  those don't hold type names.
   */
  private static renamed(declaration: SP.SpellDeclaration, renames: Map<string, string>): SP.SpellDeclaration {
    if (!renames.size) return declaration
    const renamed = { ...declaration }
    for (const key of ["type", "superType", "of", "datatype", "itemType", "returns"] as const) {
      const name = declaration[key]
      const to = name === undefined ? undefined : renames.get(typeCase(name))
      if (to) renamed[key] = to
    }
    if (declaration.params) {
      renamed.params = declaration.params.map((param) => {
        const to = param.datatype === undefined ? undefined : renames.get(typeCase(param.datatype))
        return to ? { ...param, datatype: to } : param
      })
    }
    return renamed
  }

  /** Throw a `P.ParserError` saying why import `from` can't be loaded. */
  private static fail(from: string, why: string): never {
    throw new P.ParserError({
      message: `Can't import '${from}':  ${why}.`,
      activity: "SpellDeclarations.load",
      params: { from }
    })
  }

  ////////////////
  // ## Declaring
  ////////////////

  /**
   * A variable on type `typeScope`, as `property` or `classVariable` props -- `{}` for what goes without saying.
   * - Instance twin of a `classVariable` in `declared` goes without saying -- `loadVariables()` adds it.
   * - Only a `classVariable` says its `enumeration` -- as `define_property_has` declares it.
   * - `initializer` left out when it's just `enumeration`, as `[a, b]`.
   */
  private static variableDeclaration(
    variable: P.ScopeVariable,
    typeScope: P.TypeScope,
    declared: unknown[]
  ): SP.SpellDeclaration {
    const { name, asWritten, datatype, enumeration, initializer, autoDeclared, exclusive } = variable
    const of = typeScope.name
    const derived = enumerationInitializer(enumeration)
    const ownInitializer = initializer === derived ? undefined : initializer
    if (variable.kind === "static") return { classVariable: name, of, enumeration, initializer: ownInitializer }
    const isTwin = declared.some(
      (it) => it instanceof P.ScopeVariable && it !== variable && it.kind === "static" && it.name === name
    )
    if (isTwin) return {}
    return { property: name, asWritten, of, datatype, autoDeclared, exclusive, initializer: ownInitializer }
  }

  /**
   * A method's record as props:  its `params` and what it `returns` -- only what's known.
   * - Its name, owner and syntax come from its rule -- see `ruleDeclaration()`.
   */
  private static methodDeclaration({ params, returns }: P.ScopeMethod): SP.SpellDeclaration {
    return definedOnly({ params: params.length ? params : undefined, returns })
  }

  /**
   * A rule built while parsing, as props:  `rule` names the class it was `specialize()`d from, by its
   * `importableAs`;  then what that class says to write -- see `P.Rule.declarationProps()`.
   * - Throws if it wasn't `specialize()`d from a class with an `importableAs`.
   */
  private static ruleDeclaration({ name, rule, definition }: P.ScopeRule): SP.SpellDeclaration {
    // `specializedFrom` / `specializedWith` are plain statics:  only a class `specialize()` made has its OWN
    const ruleClass = rule as P.RuleClass
    const base = Object.hasOwn(ruleClass, "specializedFrom") ? ruleClass.specializedFrom : undefined
    const statics = Object.hasOwn(ruleClass, "specializedWith") ? ruleClass.specializedWith : undefined
    // the base's OWN `importableAs`, which registered it -- a subclass merely inherits one
    const importableAs = base && Object.hasOwn(base.prototype, "importableAs") ? base.prototype.importableAs : undefined
    if (!base || !statics || !importableAs || P.Rule.importableRule(importableAs) !== base) {
      throw new P.ParserError({
        message: `Rule '${name}' wasn't specialize()d from a rule class with an 'importableAs', so it can't be declared.`,
        context: rule,
        activity: "SpellDeclarations.ruleDeclaration",
        params: { name, base }
      })
    }
    return { rule: importableAs, ...base.declarationProps(statics, definition.syntax) }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /**
   * Type_Case name of the type `statement` declares something ON, e.g. `Card` for `cards have a suit as ...`
   * -- from its `getDeclaration().of`.  `undefined` if it isn't on a type.
   */
  private static ownerOf(statement: P.Match): string | undefined {
    const of = statement.rule.getDeclaration(statement)?.of
    return of ? typeCase(singularize(of)) : undefined
  }

  /**
   * `<file>:<start>-<end>` character offsets of `match` in its file, e.g. `/FizzBuzz.spell:23-412` -- if it came
   * from a file.
   * - Project-relative, e.g. `/Card.spell` not `@system:library:cards/Card.spell`:  a library may move.
   */
  private static definedAt(match: P.Match): string | undefined {
    const path = match.getScopeOfType(P.FileScope)?.path
    const { start, end } = match
    if (!path || start === undefined || end === undefined) return undefined
    const file = path.startsWith("@") ? path.slice(path.indexOf("/")) : path
    return `${file}:${start}-${end}`
  }
}

/** Started the one-line header comment of a project's compiled JS, before declarations files -- see `fromComments()`. */
const PROJECT_MARKER = "SPELL: PROJECT"

/**
 * `rule` of an enumerated property's declaration from before `class_member`,
 * which compiled `card suits` with a rule per enumeration.
 * - Loading skips it:  `class_member` reads any type's class variables.
 * - Plan doc D37:  no version bump, so an old compiled library still loads.
 */
const LEGACY_ENUMERATION_RULE = "enumeration"

/** Starts each declaring statement's comment -- see `commentFor()`. */
const DECLARES_MARKER = "SPELL: DECLARES"

/**
 * One `/*! SPELL: DECLARES {...} *\/` comment, its object literal captured -- see `read()`.
 * - Ends at the first `} *` + `/`:  `toLiteral()` never writes one inside a string.
 */
const DECLARES_COMMENT = new RegExp(`/\\*! ${DECLARES_MARKER} (\\{[\\s\\S]*?\\}) \\*/`, "g")

/** A marker's first line, maybe indented -- see `split()`. */
const MARKER_START = new RegExp(`^[ \\t]*/\\*! ${DECLARES_MARKER} \\{`)

/** A marker's last line -- see `split()`. */
const MARKER_END = /\} \*\/\s*$/

/** Widest line `packProps()` makes, indent included -- a longer prop gets a line to itself. */
const LINE_WIDTH = 100

/**
 * Order props are written in, so each comment reads the same way -- what it declares first, `defined` last.
 * - Others, e.g. a rule's `ruleData`, go after these, before `defined`.
 */
const PROP_ORDER = [
  "type",
  "superType",
  "property",
  "asWritten",
  "classVariable",
  "syntax",
  "output",
  "rule",
  "of",
  "alias",
  "kind",
  "name",
  "datatype",
  "autoDeclared",
  "itemType",
  "exclusive",
  "params",
  "returns",
  "initializer",
  "constants",
  "constantOutputs",
  "enumeration"
]

/** Is `item` a `P.ScopeRule`, the record `scope.addRule()` notes? */
function isScopeRule(item: unknown): item is P.ScopeRule {
  return !!item && typeof item === "object" && "rule" in item && "definition" in item
}

/** `declaration`'s defined props, in `PROP_ORDER`, with `defined` last. */
function orderedProps(declaration: SP.SpellDeclaration): SP.SpellDeclaration {
  // where it is last
  const rank = (key: string) => (key === "defined" ? 1000 : PROP_ORDER.indexOf(key) + 1 || PROP_ORDER.length + 1)
  const entries = Object.entries(definedOnly(declaration)).sort(([a], [b]) => rank(a) - rank(b))
  return Object.fromEntries(entries) as SP.SpellDeclaration
}

/**
 * `props` as `key: value,` lines, packed a few to a line up to `LINE_WIDTH`, indented 2 -- e.g.
 * `  syntax: "play fizzbuzz", output: "play_fizzbuzz",`
 */
function packProps(props: Record<string, unknown>): string[] {
  const lines: string[] = []
  let line = ""
  for (const [key, value] of Object.entries(props)) {
    const prop = `${literalKey(key)}: ${toLiteral(value)},`
    if (line && 2 + line.length + 1 + prop.length > LINE_WIDTH) {
      lines.push(`  ${line}`)
      line = prop
    } else {
      line = line ? `${line} ${prop}` : prop
    }
  }
  if (line) lines.push(`  ${line}`)
  return lines
}

/**
 * `value` as ONE line of JS object literal, spaced to read, e.g. `{ type: "Card", superType: "Thing" }`.
 * - Plain data only, so `JSON5.parse()` reads it back.
 * - A `*` + `/` inside a string is written `*\/` -- still the same string, and can't end the comment it's in.
 * - A string holding `"` but no `'` is single-quoted, to read as written, e.g. `'"is face up"'`.
 */
function toLiteral(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(toLiteral).join(", ")}]`
  if (value && typeof value === "object") {
    const entries = Object.entries(value).filter(([, entry]) => entry !== undefined)
    return `{ ${entries.map(([key, entry]) => `${literalKey(key)}: ${toLiteral(entry)}`).join(", ")} }`
  }
  let literal = JSON.stringify(value)
  // only `"` needed escaping -- nothing single quotes would read differently
  const onlyQuotes =
    typeof value === "string" && !value.includes("'") && literal === `"${value.replaceAll('"', '\\"')}"`
  if (onlyQuotes && value.includes('"')) literal = `'${value}'`
  return literal.replace(/\*\//g, "*\\/")
}

/** `key` bare if it's an identifier, else quoted, e.g. `ruleName` but `"is-a"`. */
function literalKey(key: string): string {
  return /^[A-Za-z_$][\w$]*$/.test(key) ? key : toLiteral(key)
}

/** Constants enumerated values declare:  their strings, unquoted, e.g. `["'up'", 2]` => `["up"]`. */
function enumerationConstants(enumeration: Array<string | number> | undefined): string[] {
  return (enumeration ?? [])
    .filter((value): value is string => typeof value === "string")
    .map((value) => value.replace(/^'(.*)'$/, "$1"))
}

/** Initializer of a variable holding `enumeration`, e.g. `['up', 'down']` -- as `define_property_has` writes it. */
function enumerationInitializer(enumeration: Array<string | number> | undefined): string | undefined {
  return enumeration && `[${enumeration.join(", ")}]`
}

/**
 * `record` without its `undefined` props -- so declarations hold only what's there, as JSON would.
 * - Shallow:  nested records clean themselves as they're built.
 */
function definedOnly<T extends object>(record: T): T {
  return Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined)) as T
}
