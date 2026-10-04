import { singularize, typeCase } from "$/util"
import { SPELL_CLASSES } from "$/core/spellCore.types"
import { P } from "$/parser"
import { SP } from "$/spell"
import { LSP } from "$/lsp"

/**
 * The live scope tree a project parses in, as plain `LSP.ScopeNode`s -- for scope explorers in editors.
 * - Top-down, though scopes only know their PARENT:  spell's root scope holds its built-in types,
 *   then each project imported compiled, then the project itself.
 * - A project holds its files, a file what's declared in it -- types, functions, variables -- and a type
 *   its properties, methods and constants, wherever they were declared.
 * - Worked out as FLAT `LSP.ScopeEntry`s, each with a `path` saying where it is -- then built into a tree by
 *   `LSP.buildScopeTree()`, which works out the rest, e.g. what a type inherits.  A scope pack holds the same
 *   entries, so a page with no parser builds the same tree -- see `exportPack()`.
 * - A compiled import's own scope holds just its declarations:  no sources, so no docs or locations.
 *   So its node shows that project's OWN parse instead -- the caller MUST parse those first, see `importedProjects()`
 *   -- and a type of ours inheriting from one of its types inherits from that project's own, e.g. its methods.
 * - Without its sources -- a compiled-only library -- its types show below the project importing them, with
 *   members from the declarations alone:  names, kinds and owners, and where they were declared.
 *   See `P.ImportedRuleDeclared`, `P.DeclaredAt`.
 * - The tree is just what the tree shows.  A node's details -- docstring, spell, compiled javascript,
 *   rules -- come from `details()`, when an explorer shows it.
 */
export class ScopeExplorer {
  /** Describes scope records, as hover would. */
  declare service: LSP.SpellLanguageService
  /** How to work out each node's details, by path -- from the last `tree()` of each project. */
  #details = new WeakMap<SP.SpellProject, Map<string, () => LSP.ScopeDetails>>()
  /** Details worked out, by the file they're in -- its root match -- then by path.  A new parse, a new cache. */
  #cache = new WeakMap<P.Match, Map<string, LSP.ScopeDetails>>()
  /** Heading comments of each file, by its root match -- see `sectionOf()`.  A new parse, a new cache. */
  #headings = new WeakMap<P.Match, Array<{ start: number; text: string }>>()

  constructor(service: LSP.SpellLanguageService) {
    this.service = service
  }

  /** Projects `project` imports compiled -- each MUST be parsed before `tree()`, to show their sources. */
  static importedProjects(project: SP.SpellProject): SP.SpellProject[] {
    return project.projectImports.filter((it) => !it.source).map((it) => new SP.SpellProject(it.projectId))
  }

  /**
   * Scope tree for `project`:  spell's root scope, holding its built-in types, the projects it imports, then `project`.
   * - SIDE EFFECT:  remembers how to work out each node's details, for `details()`.
   */
  tree(project: SP.SpellProject): LSP.ScopeNode {
    const { builtIns, projects } = this.entries(project)
    return LSP.buildScopeTree([...builtIns, ...projects])
  }

  /**
   * Details of node or member `path` of `project`'s tree -- `null` if it isn't in the last one.
   * - Worked out now, and cached until the file it's declared in is parsed again.
   */
  details(project: SP.SpellProject, path: string): LSP.ScopeDetails | null {
    const detailsOf = this.#details.get(project)?.get(path)
    return detailsOf ? detailsOf() : null
  }

  ////////////////
  // ## Scope packs
  ////////////////

  /** Id of the built-in types' pack -- see `exportBuiltIns()`. */
  static BUILT_INS_PACK_ID = "@spell/core"

  /**
   * `project`'s scope pack:  its entries, and those of the projects it imports compiled, each with its details --
   * for a page with no parser to show, e.g. `<spell-app>`.  See `LSP.ScopePack`.
   * - NOT the built-in types:  they're in their own pack, see `exportBuiltIns()`.
   * - Its `file:` URIs are made portable -- see `portable()`.
   * - The caller MUST parse `importedProjects()` first, as for `tree()`.
   * - SIDE EFFECT:  works out a new tree, which `details()` then answers from.
   */
  exportPack(project: SP.SpellProject): LSP.ScopePack {
    const entries = this.entries(project).projects.map((entry) =>
      ScopeExplorer.packEntry(entry, this.details(project, entry.path))
    )
    return this.portable({ id: project.projectId, entries }, [...ScopeExplorer.importedProjects(project), project])
  }

  /**
   * Pack of spell's built-in types, e.g. `Thing` and `List`, from `SP.BUILT_IN_TYPE_TABLE` -- see `LSP.ScopePack`.
   * - What `yarn scopes --builtins` writes to `core`'s `src/spellCore.scopes.js`, for pages with no parser:  that
   *   file is GENERATED, so its docs live in the table.
   */
  exportBuiltIns(): LSP.ScopePack {
    const tree = this.newTree([])
    this.addBuiltIns(tree)
    const entries = tree.entries.map((entry) => ScopeExplorer.packEntry(entry, tree.details.get(entry.path)?.()))
    return { id: ScopeExplorer.BUILT_INS_PACK_ID, entries }
  }

  /**
   * `entry` with its `details`, for a pack -- keys in `PACK_KEYS` order, so every entry reads, and diffs, alike:
   * where it is first, then what it says.
   * - NOT its `spell` or `compiled`:  a page shows them from the sources and compiled output -- see
   *   `LSP.ScopeDetails`.
   */
  private static packEntry(entry: LSP.ScopeEntry, details?: LSP.ScopeDetails | null): LSP.ScopeEntry {
    const all: Record<string, unknown> = { ...entry, ...details }
    const ordered = PACK_KEYS.filter((key) => all[key] !== undefined).map((key) => [key, all[key]])
    return Object.fromEntries(ordered) as LSP.ScopeEntry
  }

  /**
   * `pack` with each `file:` URI of `projects`' files -- files' own, where things are declared, markdown links --
   * swapped for a portable `spell:/<file.path>`, the scheme the app's editor uses (see `AppAddresses`).
   * - Why:  NO absolute local paths in a file we publish -- they'd leak, and mean nothing anywhere else.
   * - Longest URI first, so one that starts another can't clip it.
   */
  private portable(pack: LSP.ScopePack, projects: SP.SpellProject[]): LSP.ScopePack {
    const files = projects.flatMap((project) => [...project.spellFiles, project.outputFile])
    const swaps = files
      .map((file) => ({ uri: this.service.addresses.uriFor(file), portable: `spell:/${encodeURI(file.path)}` }))
      .sort((a, b) => b.uri.length - a.uri.length)
    let json = JSON.stringify(pack)
    for (const { uri, portable } of swaps) json = json.replaceAll(uri, portable)
    return JSON.parse(json) as LSP.ScopePack
  }

  ////////////////
  // ## Scopes
  ////////////////

  /**
   * Flat entries of `project`'s tree, in tree order:  the built-in types, then the projects -- see `tree()`.
   * - SIDE EFFECT:  remembers how to work out each one's details, for `details()`.
   */
  private entries(project: SP.SpellProject): { builtIns: LSP.ScopeEntry[]; projects: LSP.ScopeEntry[] } {
    const imported = ScopeExplorer.importedProjects(project)
    const projects = [...imported, project]
    const tree = this.newTree(projects)
    // every type's path first, so a type can point at its super-type, wherever that is
    for (const it of projects) {
      const projectPath = ScopeExplorer.projectPath(it)
      const imports = it.scope?.parentScope
      if (imports instanceof P.ImportScope) {
        for (const type of imports.types.get()) tree.typePaths.set(type, LSP.scopePath(projectPath, "type", type.name))
      }
      for (const type of it.scope?.types.get() ?? []) {
        const file = type.declaredBy && this.service.fileOf(type.declaredBy)
        const parentPath = file ? ScopeExplorer.filePath(it, file) : projectPath
        tree.typePaths.set(type, LSP.scopePath(parentPath, "type", type.name))
      }
    }
    this.addBuiltIns(tree)
    const builtIns = tree.entries
    tree.entries = []
    projects.forEach((it, index) => this.addProject(it, tree, index < projects.length - 1 ? "imported" : undefined))
    this.#details.set(project, tree.details)
    return { builtIns, projects: tree.entries }
  }

  /** A new `Tree` for `projects`:  what's declared in them, to find each type's and file's. */
  private newTree(projects: SP.SpellProject[]): Tree {
    const imported = projects.slice(0, -1)
    return {
      methods: projects.flatMap((it) => ScopeExplorer.methodRules(it)),
      importedMethods: projects.flatMap((it) => ScopeExplorer.importedMethodRules(it)),
      rules: projects.flatMap((it) => it.scope?.rules.get() ?? []),
      constants: projects.flatMap((it) => it.scope?.constants.get() ?? []),
      typePaths: new Map(ScopeExplorer.builtInTypes().map((type) => [type, LSP.scopePath("", "type", type.name)])),
      fileOrder: new Map(projects.flatMap((it) => it.spellFiles).map((file, index) => [file, index])),
      sourceTypes: new Map(imported.flatMap((it) => it.scope?.types.get() ?? []).map((type) => [type.name, type])),
      fileUris: new Map(),
      entries: [],
      details: new Map()
    }
  }

  /**
   * Built-in types a Type Explorer lists, from the root scope:  those in `SP.BUILT_IN_TYPE_TABLE`, in its order, then
   * any other spell class (`SPELL_CLASSES`), bare.
   * - NOT the rest of its root types, e.g. javascript's `Object`, which spell knows by name but isn't a spell class,
   *   or `integer`, which has no members of its own.  A project's type made from one says so in its `detail`
   *   instead, e.g. `is a Object`.
   */
  private static builtInTypes(): P.TypeScope[] {
    const { types } = SP.SpellParser.rootScope
    const listed = SP.BUILT_IN_TYPE_TABLE.map((entry) => types.get(entry.name, "LOCAL_ONLY")!)
    const classes = types.get().filter((type) => SPELL_CLASSES.includes(type.name) && !listed.includes(type))
    return [...listed, ...classes]
  }

  /**
   * Entries for spell's built-in types -- see `builtInTypes()` -- each followed by its members, from its
   * `SP.BUILT_IN_TYPE_TABLE` entry, with their docs and the built-in rules which spell them.
   * - Why the table:  the types are javascript, so there's no spell to find their docs in.
   * - A type with no entry shows bare, as its scope has it.
   */
  private addBuiltIns(tree: Tree) {
    for (const type of ScopeExplorer.builtInTypes()) {
      const table = SP.builtInTypeEntry(type.name)
      if (!table) {
        this.addType(type, tree)
        continue
      }
      const path = tree.typePaths.get(type)!
      const parent = type.chain()[1]
      const superPath = parent && tree.typePaths.get(parent)
      tree.entries.push({
        path,
        ...(superPath ? { super: superPath } : {}),
        ...(table.detail ? { detail: table.detail } : {})
      })
      tree.details.set(path, () => ScopeExplorer.builtInDetails(table))
      for (const member of table.members) {
        const name = member.kind === "property" ? SP.builtInMemberName(member.words) : member.words
        const memberPath = LSP.scopePath(path, member.kind, name)
        tree.entries.push({
          path: memberPath,
          ...(name !== member.words ? { name: member.words } : {}),
          ...(member.kind === "property" && member.datatype ? { detail: member.datatype } : {})
        })
        tree.details.set(memberPath, () => ScopeExplorer.builtInDetails(member))
      }
    }
  }

  /** Details of a built-in type or member, from its table entry:  its docs, and the rules which spell it. */
  private static builtInDetails({ doc, rules }: { doc?: string; rules?: string[] }): LSP.ScopeDetails {
    const syntaxes = ScopeExplorer.builtInRules(rules ?? [])
    return { ...(doc ? { description: doc } : {}), ...(syntaxes.length ? { rules: syntaxes } : {}) }
  }

  /**
   * Built-in rules `names`, each syntax it was registered with, e.g. two for `create_list_type` -- from the live
   * grammar, so they never go stale.
   */
  private static builtInRules(names: string[]): Array<{ name: string; syntax: string }> {
    return names.flatMap((name) => {
      const rule = SP.spellParser.rules[name]
      const instances = rule instanceof P.Group ? rule.rules : rule ? [rule] : []
      return instances.flatMap((it) => (typeof it.syntax === "string" ? [{ name, syntax: it.syntax }] : []))
    })
  }

  /**
   * Entries for `project`:  its files -- see `addFile()` -- then the types it imports compiled with no sources
   * to show instead, then the constants no type owns.
   */
  private addProject(project: SP.SpellProject, tree: Tree, detail?: string) {
    const path = ScopeExplorer.projectPath(project)
    const { scope } = project
    if (!scope) {
      tree.entries.push({ path, detail: "not parsed" })
      return
    }
    tree.entries.push(detail ? { path, detail } : { path })
    for (const file of project.spellFiles.filter((it) => it.scope instanceof P.FileScope))
      this.addFile(project, file, tree)
    const imports = scope.parentScope
    if (imports instanceof P.ImportScope) {
      for (const type of imports.types.get().filter((it) => !tree.sourceTypes.has(it.name))) this.addType(type, tree)
    }
    for (const record of scope.constants.get().filter((it) => !this.ownerOf(it.declaredBy))) {
      this.addLeaf(LSP.scopePath(path, "constant", record.name), { kind: "constant", record }, record.declaredBy, tree)
    }
  }

  /**
   * Entries for `file`:  the file, then the types, functions and variables it declares, in the order it declares
   * them -- each type followed by its members, wherever they're declared.
   * - Its description is the `#` heading comments at its top -- see `SpellLanguageService.fileDescription()`.
   */
  private addFile(project: SP.SpellProject, file: SP.SpellFile, tree: Tree) {
    const path = ScopeExplorer.filePath(project, file)
    const uri = this.service.addresses.uriFor(file)
    tree.fileUris.set(path, uri)
    tree.entries.push({ path, uri })
    this.addDetails(tree, path, file.match, () => {
      const description = this.service.fileDescription(file)
      return description ? { description } : {}
    })
    const types = (project.scope?.types.get() ?? []).filter(
      (type) => type.declaredBy && this.service.fileOf(type.declaredBy) === file
    )
    const functions = tree.methods.filter(
      (rule) => ScopeExplorer.declarationOf(rule)?.kind === "function" && this.service.fileOf(rule.declaredBy!) === file
    )
    const variables = (file.scope as P.FileScope).variables.get()
    const declared: DeclaredEntries[] = [
      ...types.map((type) => ({ at: type.declaredBy, add: () => this.addType(type, tree) })),
      ...functions.map((rule) => ({ at: rule.declaredBy, add: () => this.addMethod(rule, "function", path, tree) })),
      ...variables.map((record) => ({
        at: record.declaredBy,
        add: () =>
          this.addLeaf(
            LSP.scopePath(path, "variable", record.name),
            { kind: "variable", record },
            record.declaredBy,
            tree,
            record.datatype
          )
      }))
    ]
    for (const { add } of this.inDocumentOrder(declared, tree)) add()
  }

  /**
   * Entries for `type`, then what it declares below it -- properties, methods and constants -- in document order.
   * - What has no source, e.g. a compiled import's, after the rest:  its properties, then its methods, each
   *   alphabetical, then its constants -- see `addConstants()`.
   * - Its `super` is its super-type's entry -- a compiled import's type swapped for that project's own, see
   *   `sourceType()` -- so it inherits that one's members.  See `LSP.buildScopeTree()`.
   */
  private addType(type: P.TypeScope, tree: Tree) {
    const path = tree.typePaths.get(type)!
    const parent = type.chain()[1]
    const superPath = parent && tree.typePaths.get(this.sourceType(parent, tree))
    const entry: LSP.ScopeEntry = { path }
    if (superPath) entry.super = superPath
    else if (type.superType) entry.detail = `is a ${type.superType}`
    const section = this.sectionOf(type.declaredBy)
    if (section) entry.section = section
    tree.entries.push(entry)
    this.addSubjectDetails(tree, path, { kind: "type", record: type }, type.declaredBy)

    // each member's entries, as `add()`ed, then sorted into document order -- see `inDocumentOrder()`
    const members: DeclaredEntries[] = []
    for (const record of ScopeExplorer.alphabetical(LSP.SpellLanguageService.propertiesOf(type))) {
      const subject = { kind: "property", name: record.name, owner: type, record } as const
      const propertyPath = LSP.scopePath(path, "property", record.name)
      members.push({
        at: record.declaredBy,
        add: () => this.addLeaf(propertyPath, subject, record.declaredBy, tree, record.datatype, record.words)
      })
    }
    // a compiled import's type -- not swapped for its source, see `sourceType()` -- has just its imported rules
    const methodRules = ScopeExplorer.isImported(type) ? tree.importedMethods : tree.methods
    const methods = methodRules.filter((rule) => {
      const declaration = ScopeExplorer.declarationOf(rule)
      return (
        declaration?.kind === "method" && !!declaration.of && ScopeExplorer.typeNameOf(declaration.of) === type.name
      )
    })
    const named = methods.map((rule) => ({ rule, name: ScopeExplorer.methodName(rule) }))
    for (const { rule } of ScopeExplorer.alphabetical(named)) {
      members.push({ at: rule.declaredBy, add: () => this.addMethod(rule, "method", path, tree) })
    }
    members.push(...this.constantsOf(type, path, tree))
    for (const { add } of this.inDocumentOrder(members, tree)) add()
  }

  /**
   * `type`, or -- if it's from a compiled import, with just its declarations -- the same type in that project's
   * own parse, with its sources:  docs, locations, methods.  Else `type`.
   */
  private sourceType(type: P.TypeScope, tree: Tree): P.TypeScope {
    if (!ScopeExplorer.isImported(type)) return type
    return tree.sourceTypes.get(type.name) ?? type
  }

  ////////////////
  // ## Declarations
  ////////////////

  /**
   * How to add entries for the constants `type` owns -- those a statement about it declared, e.g. `ace` and
   * `clubs` by `cards have a rank as one of ace, 2, 3 ...` -- for `addType()` to sort into document order:
   * - each enumeration, then the constants the same statement made, in the order it declared them -- one `add()`
   * - then any other constants, alphabetical, e.g. `red` from `the color of a card is red if ...`
   */
  private constantsOf(type: P.TypeScope, typePath: string, tree: Tree): DeclaredEntries[] {
    const owned = tree.constants.filter((record) => this.ownerOf(record.declaredBy) === type.name)
    const listed = new Set<P.ScopeConstant>()
    const constants: DeclaredEntries[] = []
    for (const record of ScopeExplorer.alphabetical([...type.classVariables.get()])) {
      const made = owned.filter((constant) => record.declaredBy && constant.declaredBy === record.declaredBy)
      made.forEach((constant) => listed.add(constant))
      constants.push({
        at: record.declaredBy,
        add: () => {
          const path = LSP.scopePath(typePath, "enumeration", record.name)
          this.addLeaf(path, { kind: "variable", record }, record.declaredBy, tree)
          made.forEach((constant) => addConstant.call(this, constant))
        }
      })
    }
    for (const record of ScopeExplorer.alphabetical(owned.filter((constant) => !listed.has(constant)))) {
      constants.push({ at: record.declaredBy, add: () => addConstant.call(this, record) })
    }
    return constants

    /** Entry for constant `record`. */
    function addConstant(this: ScopeExplorer, record: P.ScopeConstant) {
      const path = LSP.scopePath(typePath, "constant", record.name)
      this.addLeaf(path, { kind: "constant", record }, record.declaredBy, tree)
    }
  }

  /**
   * `declared` in document order:  by the file each is declared in, in parse order, then where in it.
   * - Stable:  what's declared together, or has no source, keeps the order it came in -- the latter after the rest.
   */
  private inDocumentOrder(declared: DeclaredEntries[], tree: Tree): DeclaredEntries[] {
    const keyed = declared.map((it) => {
      const file = it.at && this.service.fileOf(it.at)
      const order = file && tree.fileOrder.get(file)
      return { it, order: order ?? Infinity, start: order === undefined ? 0 : (it.at?.start ?? 0) }
    })
    return keyed.sort((a, b) => a.order - b.order || a.start - b.start).map(({ it }) => it)
  }

  /**
   * Nearest heading comment above statement `declaredBy`, in its file -- see `LSP.ScopeEntry.section`.
   * - `undefined` if there's none above it, or it isn't in a spell file.
   */
  private sectionOf(declaredBy: P.Match | undefined): string | undefined {
    const start = declaredBy?.start
    const file = declaredBy && this.service.fileOf(declaredBy)
    if (!file?.match || start === undefined) return undefined
    let headings = this.#headings.get(file.match)
    if (!headings) this.#headings.set(file.match, (headings = this.service.headingsOf(file)))
    let section: string | undefined
    for (const heading of headings) {
      if (heading.start >= start) break
      section = heading.text
    }
    return section
  }

  /** Entry for method or function `rule`, below `parentPath`. */
  private addMethod(rule: P.ScopeRule, kind: "method" | "function", parentPath: string, tree: Tree) {
    const path = LSP.scopePath(parentPath, kind, ScopeExplorer.methodName(rule))
    this.addLeaf(path, { kind: "method", record: rule }, rule.declaredBy, tree)
  }

  /**
   * Entry for something declared, with nothing below it -- and how to work out its details, as `subject`,
   * from its `declaredBy` statement.
   */
  private addLeaf(
    path: string,
    subject: LSP.ScopeRecord,
    declaredBy: P.Match | undefined,
    tree: Tree,
    detail?: string,
    written?: string
  ) {
    const entry: LSP.ScopeEntry = detail ? { path, detail } : { path }
    // its name as written, if `path` doesn't say it, e.g. `short rank` -- see `LSP.ScopeEntry.name`
    if (written && written !== LSP.scopeSegment(path).name) entry.name = written
    const section = this.sectionOf(declaredBy)
    if (section) entry.section = section
    tree.entries.push(entry)
    this.addSubjectDetails(tree, path, subject, declaredBy)
  }

  ////////////////
  // ## Details
  ////////////////

  /**
   * Remember how to work out the details of `path`:  `subject`'s docstring, as hover finds it, and its source.
   * - Its declaring file's URI only if it's NOT the file its entry is below -- see `LSP.ScopeDetails.uri`.
   */
  private addSubjectDetails(tree: Tree, path: string, subject: LSP.ScopeRecord, declaredBy: P.Match | undefined) {
    const file = declaredBy && this.service.fileOf(declaredBy)
    this.addDetails(tree, path, file?.match, () => {
      const { description } = this.service.describeRecord(subject)
      const details: LSP.ScopeDetails = { ...(description ? { description } : {}), ...this.sourceOf(declaredBy, tree) }
      // imported from compiled declarations:  where they say it was declared, if we can place it
      const where = file ? { uri: this.service.addresses.uriFor(file) } : this.importedLocation(subject.record)
      if (where && "line" in where) details.line = where.line
      if (where && where.uri !== ScopeExplorer.fileUriOf(path, tree)) details.uri = where.uri
      return details
    })
  }

  /**
   * Where `record` -- imported from compiled declarations, so with no `declaredBy` -- was declared, as its
   * `declaredAt` says.  See `P.DeclaredAt`.
   * - Only if that file's text is loaded, to turn offsets into lines:  a compiled-only library's usually isn't.
   */
  private importedLocation(record: LSP.ScopeRecord["record"]): { uri: string; line: LSP.ScopeLine } | undefined {
    const at = "declared" in record ? record.declared?.declaredAt : (record as { declaredAt?: P.DeclaredAt }).declaredAt
    const file = at && SP.SpellFile.registry.get(at.path)
    if (!at || !file?.parseText) return undefined
    const first = this.service.positionAt(file, at.start).line + 1
    const last = this.service.positionAt(file, Math.max(at.start, at.end - 1)).line + 1
    return { uri: this.service.addresses.uriFor(file), line: LSP.scopeLine(first, last) }
  }

  /**
   * Remember how to work out the details of `path`, with `work()` -- cached per parse of the file `fileMatch`
   * roots, if any.  Built-ins have no file, and aren't worth caching.
   * - The FILE, not the statement:  a docstring edit re-parses its comment line, but not the statement it documents.
   */
  private addDetails(tree: Tree, path: string, fileMatch: P.Match | undefined, work: () => LSP.ScopeDetails) {
    tree.details.set(path, () => {
      if (!fileMatch) return work()
      let cache = this.#cache.get(fileMatch)
      if (!cache) this.#cache.set(fileMatch, (cache = new Map()))
      let details = cache.get(path)
      if (!details) cache.set(path, (details = work()))
      return details
    })
  }

  /**
   * Spell source of statement `declaredBy` -- whole lines, and its body if any -- the line(s) it's on, what it
   * compiles to, and the rules it made.  Nothing if it isn't in a spell file.
   */
  private sourceOf(
    declaredBy: P.Match | undefined,
    tree: Tree
  ): Pick<LSP.ScopeDetails, "spell" | "compiled" | "rules" | "line"> {
    const file = declaredBy && this.service.fileOf(declaredBy)
    if (!file || declaredBy.start === undefined) return {}
    const text = file.parseText
    const body = declaredBy.data.body as P.Match | undefined
    const start = text.lastIndexOf("\n", declaredBy.start - 1) + 1
    const end = body?.end ?? declaredBy.end ?? declaredBy.start
    const rules = tree.rules
      .filter((rule) => rule.declaredBy === declaredBy)
      .map((rule) => ({ name: rule.name, syntax: ScopeExplorer.syntaxOf(rule) }))
    const compiled = LSP.SpellLanguageService.compileQuietly(declaredBy)
    const spell = text.slice(start, end).trimEnd()
    const first = this.service.positionAt(file, declaredBy.start).line + 1
    return {
      line: LSP.scopeLine(first, first + (spell.match(/\n/g)?.length ?? 0)),
      spell,
      ...(compiled ? { compiled } : {}),
      ...(rules.length ? { rules } : {})
    }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Path of `project`'s entry. */
  private static projectPath(project: SP.SpellProject): string {
    return LSP.scopePath("", "project", project.projectName ?? project.projectId)
  }

  /** Path of `file`'s entry, in `project`. */
  private static filePath(project: SP.SpellProject, file: SP.SpellFile): string {
    return LSP.scopePath(ScopeExplorer.projectPath(project), "file", file.file ?? file.path)
  }

  /** URI of the file entry `path` is below, if any. */
  private static fileUriOf(path: string, tree: Tree): string | undefined {
    for (let at = path; at; at = LSP.parentScopePath(at)) {
      const uri = tree.fileUris.get(at)
      if (uri) return uri
    }
    return undefined
  }

  /** Name of method or function `rule` -- a test method's with its `test`, which its declaration leaves out. */
  private static methodName(rule: P.ScopeRule): string {
    const declared = ScopeExplorer.unquoted(ScopeExplorer.declarationOf(rule)!.name)
    const isTest = /^test\b/.test(ScopeExplorer.syntaxOf(rule)) && !/^test\b/.test(declared)
    return isTest ? `test ${declared}` : declared
  }

  /** Rules `project`'s own parse made for methods and functions -- those with a declaration saying so. */
  private static methodRules(project: SP.SpellProject): P.ScopeRule[] {
    return (project.scope?.rules.get() ?? []).filter((rule) => {
      const kind = ScopeExplorer.declarationOf(rule)?.kind
      return kind === "method" || kind === "function"
    })
  }

  /**
   * What `rule`'s declaring statement declares -- from the statement if we have it, else, for a rule imported
   * from compiled declarations, from what those say.  See `P.ImportedRuleDeclared`.
   */
  private static declarationOf(rule: P.ScopeRule): Omit<P.Declaration, "nameMatch"> | undefined {
    return rule.declaredBy ? rule.declaredBy.rule.getDeclaration(rule.declaredBy) : rule.declared?.declaration
  }

  /** Rules imported from `project`'s compiled imports for methods and functions -- see `P.ImportedRuleDeclared`. */
  private static importedMethodRules(project: SP.SpellProject): P.ScopeRule[] {
    const imports = project.scope?.parentScope
    if (!(imports instanceof P.ImportScope)) return []
    return imports.rules.get().filter((rule) => {
      const kind = rule.declared?.declaration?.kind
      return kind === "method" || kind === "function"
    })
  }

  /** Is `type` from compiled declarations -- no statement of ours declared it? */
  private static isImported(type: P.TypeScope): boolean {
    return !type.declaredBy && type.parentScope instanceof P.ImportScope
  }

  /** Type_Case name of the type a declaration is `of`, as written, e.g. `cards` => `Card`. */
  private static typeNameOf(of: string): string {
    return typeCase(singularize(of))
  }

  /** `name` without the quotes it may be declared in, e.g. `"is face up"`. */
  private static unquoted(name: string): string {
    return name.replace(/^"(.*)"$/, "$1")
  }

  /**
   * Syntax of `rule` as written -- or as its rule has it, e.g. for a rule `specialize()` made with no `syntax`.
   * - One line per syntax, for a rule with several.
   */
  private static syntaxOf(rule: P.ScopeRule): string {
    const written = [rule.definition.syntax].flat().filter(Boolean).join("\n")
    return written || rule.instance?.toRulexSyntax() || ""
  }

  /** `items` in alphabetical order of `name`, ignoring case. */
  private static alphabetical<T extends { name: string }>(items: T[]): T[] {
    return items.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
  }

  /** Type_Case name of the type statement `declaredBy` declares something on, e.g. `Card`, if any. */
  private ownerOf(declaredBy: P.Match | undefined): string | undefined {
    const of = declaredBy?.rule.getDeclaration(declaredBy)?.of
    return of ? ScopeExplorer.typeNameOf(of) : undefined
  }
}

/** Keys of a pack's entries, in the order they're written -- see `ScopeExplorer.packEntry()`. */
const PACK_KEYS: Array<keyof LSP.ScopeEntry> = [
  "path",
  "name",
  "super",
  "detail",
  "section",
  "uri",
  "line",
  "description",
  "rules"
]

/** What working out one tree's entries needs to know throughout -- see `ScopeExplorer.entries()`. */
type Tree = {
  /** Every method and function rule of the projects in the tree, to find each type's and file's. */
  methods: P.ScopeRule[]
  /** Method and function rules imported from compiled declarations, for types with no sources to show. */
  importedMethods: P.ScopeRule[]
  /** Every rule of the projects in the tree, to find what each statement made. */
  rules: P.ScopeRule[]
  /** Every constant of the projects in the tree, to find each type's. */
  constants: P.ScopeConstant[]
  /** Path of each type's entry. */
  typePaths: Map<P.TypeScope, string>
  /** Place of each spell file of the projects in the tree, in parse order -- see `ScopeExplorer.inDocumentOrder()`. */
  fileOrder: Map<SP.SpellFile, number>
  /** Types of the projects imported compiled, by name, from their OWN parse -- see `ScopeExplorer.sourceType()`. */
  sourceTypes: Map<string, P.TypeScope>
  /** URI of each file entry, by path -- see `ScopeExplorer.fileUriOf()`. */
  fileUris: Map<string, string>
  /** Entries so far, in tree order. */
  entries: LSP.ScopeEntry[]
  /** How to work out each entry's details, by path -- see `ScopeExplorer.details()`. */
  details: Map<string, () => LSP.ScopeDetails>
}

/** Entries for something declared, to add in document order -- see `ScopeExplorer.inDocumentOrder()`. */
type DeclaredEntries = {
  /** Statement declaring it, if it has a source. */
  at?: P.Match
  /** Add its entries to the tree. */
  add: () => void
}
