import { singularize, typeCase } from "~/util"
import { P } from "~/parser"
import { SP } from "~/languages/spell"
import { LSP } from "~/lsp"

/**
 * The live scope tree a project parses in, as plain `LSP.ScopeNode`s -- for scope explorers in editors.
 * - Top-down, though scopes only know their PARENT:  spell's root scope holds its built-in types,
 *   then each project imported compiled, then the project itself.
 * - A project holds its files, a file what's declared in it -- types, functions, variables -- and a type
 *   its properties, methods and constants, wherever they were declared.
 * - A compiled import's own scope holds just its declarations:  no sources, so no docs or locations.
 *   So its node shows that project's OWN parse instead -- the caller MUST parse those first, see `importedProjects()`
 *   -- and a type of ours inheriting from one of its types inherits from that project's own, e.g. its methods.
 * - Without its sources -- a compiled-only library -- its types' members come from the declarations alone:
 *   names, kinds and owners, and where they were declared.  See `P.ImportedRuleDeclared`, `P.DeclaredAt`.
 * - The tree is just what the tree shows.  A node's details -- hover, docstring, spell, compiled javascript,
 *   rules -- come from `details()`, when an explorer shows it.
 */
export class ScopeExplorer {
  /** Describes scope records, as hover would. */
  declare service: LSP.SpellLanguageService
  /** How to work out each node's details, by its id -- from the last `tree()` of each project. */
  #details = new WeakMap<SP.SpellProject, Map<string, () => LSP.ScopeDetails>>()
  /** Details worked out, by the file they're in -- its root match -- then by id.  A new parse, a new cache. */
  #cache = new WeakMap<P.Match, Map<string, LSP.ScopeDetails>>()

  constructor(service: LSP.SpellLanguageService) {
    this.service = service
  }

  /** Projects `project` imports compiled -- each MUST be parsed before `tree()`, to show its sources. */
  static importedProjects(project: SP.SpellProject): SP.SpellProject[] {
    return project.projectImports.filter((it) => !it.source).map((it) => new SP.SpellProject(it.projectId))
  }

  /**
   * Scope tree for `project`:  spell's root scope, holding its built-in types, the projects it imports, then `project`.
   * - SIDE EFFECT:  remembers how to work out each node's details, for `details()`.
   */
  tree(project: SP.SpellProject): LSP.ScopeNode {
    const root = SP.SpellParser.rootScope
    const imported = ScopeExplorer.importedProjects(project)
    const projects = [...imported, project]
    const tree: Tree = {
      methods: projects.flatMap((it) => ScopeExplorer.methodRules(it)),
      importedMethods: projects.flatMap((it) => ScopeExplorer.importedMethodRules(it)),
      rules: projects.flatMap((it) => it.scope?.rules.get() ?? []),
      constants: projects.flatMap((it) => it.scope?.constants.get() ?? []),
      typeIds: new Map(),
      sourceTypes: new Map(imported.flatMap((it) => it.scope?.types.get() ?? []).map((type) => [type.name, type])),
      details: new Map()
    }
    // every type's id first, so a member can point at the type it's inherited from
    const id = root.name
    for (const type of root.types.get()) tree.typeIds.set(type, `${id}/${type.name}`)
    for (const it of projects) {
      // a compiled import's types have no node, but their members need ids of their own
      const imports = it.scope?.parentScope
      if (imports instanceof P.ImportScope) {
        for (const type of imports.types.get()) tree.typeIds.set(type, `${this.projectId(it, id)}/import:${type.name}`)
      }
      for (const type of it.scope?.types.get() ?? []) {
        const file = type.declaredBy && this.service.fileOf(type.declaredBy)
        const parentId = file ? this.fileId(it, file, id) : this.projectId(it, id)
        tree.typeIds.set(type, `${parentId}/${type.name}`)
      }
    }
    const builtIns = root.types.get().map((type) => this.typeNode(type, tree))
    this.#details.set(project, tree.details)
    return {
      id,
      // for people -- its `id` stays the scope's name, so ids and what's open don't change
      name: "Spell",
      kind: "root",
      detail: "built in",
      members: ScopeExplorer.sorted(builtIns.map((node) => this.asMember(node))),
      children: [
        ...builtIns,
        ...projects.map((it, index) =>
          this.projectNode(it, id, tree, index < projects.length - 1 ? "imported" : undefined)
        )
      ]
    }
  }

  /**
   * Details of node or member `id` of `project`'s tree -- `null` if it isn't in the last one.
   * - Worked out now, and cached until the file it's declared in is parsed again.
   */
  details(project: SP.SpellProject, id: string): LSP.ScopeDetails | null {
    const detailsOf = this.#details.get(project)?.get(id)
    return detailsOf ? detailsOf() : null
  }

  ////////////////
  // ## Scopes
  ////////////////

  /** Node for `project`:  the constants no type owns as members, and its files below. */
  private projectNode(project: SP.SpellProject, parentId: string, tree: Tree, detail?: string): LSP.ScopeNode {
    const id = this.projectId(project, parentId)
    const name = project.projectName ?? project.projectId
    const { scope } = project
    if (!scope) return { id, name, kind: "project", detail: "not parsed", members: [], children: [] }
    const constants = scope.constants
      .get()
      .filter((record) => !this.ownerOf(record.declaredBy))
      .map((record) =>
        this.asMember(
          this.leafNode(
            `${id}/constant:${record.name}`,
            record.name,
            "constant",
            { kind: "constant", record },
            record.declaredBy,
            tree
          )
        )
      )
    const files = project.spellFiles.filter((file) => file.scope instanceof P.FileScope)
    return {
      id,
      name,
      kind: "project",
      detail,
      members: ScopeExplorer.sorted(constants),
      children: files.map((file) => this.fileNode(project, file, parentId, tree))
    }
  }

  /**
   * Node for `file`:  the types, functions and variables it declares, in the order it declares them.
   * - Its description is the `#` heading comments at its top -- see `SpellLanguageService.fileDescription()`.
   * - A type's members are below the type, wherever they're declared.
   */
  private fileNode(project: SP.SpellProject, file: SP.SpellFile, parentId: string, tree: Tree): LSP.ScopeNode {
    const id = this.fileId(project, file, parentId)
    const types = (project.scope?.types.get() ?? []).filter(
      (type) => type.declaredBy && this.service.fileOf(type.declaredBy) === file
    )
    const functions = tree.methods.filter(
      (rule) => ScopeExplorer.declarationOf(rule)?.kind === "function" && this.service.fileOf(rule.declaredBy!) === file
    )
    const variables = (file.scope as P.FileScope).variables.get()
    const declared = [
      ...types.map((type) => ({ at: type.declaredBy, node: this.typeNode(type, tree) })),
      ...functions.map((rule) => ({ at: rule.declaredBy, node: this.methodNode(rule, "function", id, tree) })),
      ...variables.map((record) => ({
        at: record.declaredBy,
        node: this.leafNode(
          `${id}/variable:${record.name}`,
          record.name,
          "variable",
          { kind: "variable", record },
          record.declaredBy,
          tree,
          record.datatype
        )
      }))
    ].sort((a, b) => (a.at?.start ?? 0) - (b.at?.start ?? 0))
    const children = declared.map((it) => it.node)
    this.addDetails(tree, id, file.match, () => ({
      description: this.service.fileDescription(file),
      descriptionAt: { uri: this.service.addresses.uriFor(file), position: { line: 0, character: 0 }, file: true }
    }))
    return {
      id,
      name: file.file ?? file.path,
      kind: "file",
      members: ScopeExplorer.sorted(children.map((node) => this.asMember(node))),
      children
    }
  }

  /**
   * Node for `type`:  what it declares below it, grouped as `LSP.SCOPE_MEMBER_GROUPS` -- see `ownMemberNodes()`.
   * - Its `members` add what it inherits from its super-types, after its own in each group.
   *   One a sub-type re-declares shows once, as its own.
   * - A super-type from a compiled import is that project's own -- see `sourceType()`.
   */
  private typeNode(type: P.TypeScope, tree: Tree): LSP.ScopeNode {
    const id = tree.typeIds.get(type)!
    const children = this.ownMemberNodes(type, id, tree)
    const chain = LSP.SpellLanguageService.typeChain(type).map((it) => {
      const ancestor = it === type ? type : this.sourceType(it, tree)
      const nodes = ancestor === type ? children : this.ownMemberNodes(ancestor, tree.typeIds.get(ancestor) ?? id, tree)
      return { ancestor, nodes }
    })
    const members = new Map<string, LSP.ScopeMember>()
    for (const { kinds } of LSP.SCOPE_MEMBER_GROUPS) {
      for (const { ancestor, nodes } of chain) {
        for (const node of nodes.filter((it) => kinds.includes(it.kind as LSP.ScopeMember["kind"]))) {
          const key = `${node.kind}:${node.name}`
          if (members.has(key)) continue
          const member = this.asMember(node)
          members.set(key, ancestor === type ? member : { ...member, inheritedFrom: ancestor.name })
        }
      }
    }
    this.addSubjectDetails(tree, id, { kind: "type", record: type }, type.declaredBy)
    return {
      id,
      name: type.name,
      kind: "type",
      detail: type.superType ? `is a ${type.superType}` : undefined,
      members: [...members.values()],
      children
    }
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
   * Nodes for what `type` itself declares, in the order `LSP.SCOPE_MEMBER_GROUPS` shows them:
   * - its properties, then its methods among `tree.methods`, each alphabetical
   * - then its constants -- see `constantNodes()`
   */
  private ownMemberNodes(type: P.TypeScope, typeId: string, tree: Tree): LSP.ScopeNode[] {
    const properties = LSP.SpellLanguageService.propertiesOf(type).map((record) =>
      this.leafNode(
        `${typeId}/property:${record.name}`,
        record.name,
        "property",
        { kind: "property", name: record.name, owner: type, record },
        record.declaredBy,
        tree,
        record.datatype
      )
    )
    // a compiled import's type -- not swapped for its source, see `sourceType()` -- has just its imported rules
    const methodRules = ScopeExplorer.isImported(type) ? tree.importedMethods : tree.methods
    const methods = methodRules.flatMap((rule) => {
      const declaration = ScopeExplorer.declarationOf(rule)
      if (declaration?.kind !== "method" || !declaration.of || ScopeExplorer.typeNameOf(declaration.of) !== type.name)
        return []
      return [this.methodNode(rule, "method", typeId, tree)]
    })
    return [
      ...ScopeExplorer.alphabetical(properties),
      ...ScopeExplorer.alphabetical(methods),
      ...this.constantNodes(type, typeId, tree)
    ]
  }

  /**
   * Nodes for the constants `type` owns -- those a statement about it declared, e.g. `ace` and `clubs` by
   * `cards have a rank as one of ace, 2, 3 ...`:
   * - each enumeration, then the constants the same statement made, in the order it declared them
   * - then any other constants, alphabetical, e.g. `red` from `the color of a card is red if ...`
   */
  private constantNodes(type: P.TypeScope, typeId: string, tree: Tree): LSP.ScopeNode[] {
    const owned = tree.constants.filter((record) => this.ownerOf(record.declaredBy) === type.name)
    const listed = new Set<P.ScopeConstant>()
    const enumerations = ScopeExplorer.alphabetical([...type.classVariables.get()]).flatMap((record) => {
      const made = owned.filter((constant) => record.declaredBy && constant.declaredBy === record.declaredBy)
      made.forEach((constant) => listed.add(constant))
      const node = this.leafNode(
        `${typeId}/enumeration:${record.name}`,
        record.name,
        "enumeration",
        { kind: "variable", record },
        record.declaredBy,
        tree
      )
      return [node, ...made.map(constantNode, this)]
    })
    const others = owned.filter((constant) => !listed.has(constant))
    return [...enumerations, ...ScopeExplorer.alphabetical(others).map(constantNode, this)]

    /** Node for constant `record`. */
    function constantNode(this: ScopeExplorer, record: P.ScopeConstant): LSP.ScopeNode {
      const id = `${typeId}/constant:${record.name}`
      return this.leafNode(id, record.name, "constant", { kind: "constant", record }, record.declaredBy, tree)
    }
  }

  /** Node for method or function `rule`, under the node `parentId`. */
  private methodNode(rule: P.ScopeRule, kind: "method" | "function", parentId: string, tree: Tree): LSP.ScopeNode {
    const declared = ScopeExplorer.unquoted(ScopeExplorer.declarationOf(rule)!.name)
    // a test method's declaration names it WITHOUT the `test` its syntax starts with:  put it back
    const isTest = /^test\b/.test(ScopeExplorer.syntaxOf(rule)) && !/^test\b/.test(declared)
    const name = isTest ? `test ${declared}` : declared
    const id = `${parentId}/${kind}:${name}`
    return this.leafNode(id, name, kind, { kind: "method", record: rule }, rule.declaredBy, tree)
  }

  /**
   * Node for something declared, with nothing below it -- and how to work out its details, as `subject`,
   * from its `declaredBy` statement.
   */
  private leafNode(
    id: string,
    name: string,
    kind: LSP.ScopeMember["kind"],
    subject: LSP.ScopeRecord,
    declaredBy: P.Match | undefined,
    tree: Tree,
    detail?: string
  ): LSP.ScopeNode {
    this.addSubjectDetails(tree, id, subject, declaredBy)
    return { id, name, kind, detail, members: [], children: [] }
  }

  /** `node` as a member of its parent, for listing. */
  private asMember(node: LSP.ScopeNode): LSP.ScopeMember {
    const { id, name, kind, detail } = node
    return { id, name, kind: kind as LSP.ScopeMember["kind"], detail }
  }

  ////////////////
  // ## Details
  ////////////////

  /** Remember how to work out the details of `id`:  `subject` as hover describes it, and its source. */
  private addSubjectDetails(tree: Tree, id: string, subject: LSP.ScopeRecord, declaredBy: P.Match | undefined) {
    const file = declaredBy && this.service.fileOf(declaredBy)
    this.addDetails(tree, id, file?.match, () => {
      const details = { ...this.service.describeRecord(subject), ...this.sourceOf(declaredBy, tree) }
      // imported from compiled declarations:  where they say it was declared, if we can place it
      if (!declaredBy && !details.location) details.location = this.importedLocation(subject.record)
      return details
    })
  }

  /**
   * Where `record` -- imported from compiled declarations, so with no `declaredBy` -- was declared, as its
   * `declaredAt` says.  See `P.DeclaredAt`.
   * - Only if that file's text is loaded, to turn offsets into lines:  a compiled-only library's usually isn't.
   */
  private importedLocation(record: LSP.ScopeRecord["record"]): LSP.ScopeDetails["location"] {
    const at = "declared" in record ? record.declared?.declaredAt : (record as { declaredAt?: P.DeclaredAt }).declaredAt
    const file = at && SP.SpellFile.registry.get(at.path)
    if (!at || !file?.parseText) return undefined
    const range = { start: this.service.positionAt(file, at.start), end: this.service.positionAt(file, at.end) }
    return { uri: this.service.addresses.uriFor(file), range }
  }

  /**
   * Remember how to work out the details of `id`, with `work()` -- cached per parse of the file `fileMatch` roots,
   * if any.  Built-ins have no file, and aren't worth caching.
   * - The FILE, not the statement:  a docstring edit re-parses its comment line, but not the statement it documents.
   */
  private addDetails(tree: Tree, id: string, fileMatch: P.Match | undefined, work: () => LSP.ScopeDetails) {
    tree.details.set(id, () => {
      if (!fileMatch) return work()
      let cache = this.#cache.get(fileMatch)
      if (!cache) this.#cache.set(fileMatch, (cache = new Map()))
      let details = cache.get(id)
      if (!details) cache.set(id, (details = work()))
      return details
    })
  }

  /**
   * Spell source of statement `declaredBy` -- whole lines, and its body if any -- what it compiles to,
   * the rules it made, and where its docstring can be changed.  Nothing if it isn't in a spell file.
   */
  private sourceOf(
    declaredBy: P.Match | undefined,
    tree: Tree
  ): Pick<LSP.ScopeDetails, "spell" | "compiled" | "rules" | "descriptionAt"> {
    const file = declaredBy && this.service.fileOf(declaredBy)
    if (!file || declaredBy.start === undefined) return {}
    const text = file.parseText
    const body = declaredBy.data.body as P.Match | undefined
    const start = text.lastIndexOf("\n", declaredBy.start - 1) + 1
    const end = body?.end ?? declaredBy.end ?? declaredBy.start
    const rules = tree.rules
      .filter((rule) => rule.declaredBy === declaredBy)
      .map((rule) => ({ name: rule.name, syntax: ScopeExplorer.syntaxOf(rule) }))
    return {
      spell: text.slice(start, end).trimEnd(),
      compiled: LSP.SpellLanguageService.compileQuietly(declaredBy),
      rules: rules.length ? rules : undefined,
      descriptionAt: {
        uri: this.service.addresses.uriFor(file),
        position: this.service.positionAt(file, declaredBy.start)
      }
    }
  }

  ////////////////
  // ## Helpers
  ////////////////

  /** Id of `project`'s node, under the node `parentId`. */
  private projectId(project: SP.SpellProject, parentId: string): string {
    return `${parentId}/${project.projectName ?? project.projectId}`
  }

  /** Id of `file`'s node in `project`. */
  private fileId(project: SP.SpellProject, file: SP.SpellFile, rootId: string): string {
    return `${this.projectId(project, rootId)}/${file.file ?? file.path}`
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

  /** `members` in alphabetical order, ignoring case. */
  private static sorted(members: LSP.ScopeMember[]): LSP.ScopeMember[] {
    return members.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: "base" }))
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

/** What building one tree needs to know throughout -- see `ScopeExplorer.tree()`. */
type Tree = {
  /** Every method and function rule of the projects in the tree, to find each type's and file's. */
  methods: P.ScopeRule[]
  /** Method and function rules imported from compiled declarations, for types with no sources to show. */
  importedMethods: P.ScopeRule[]
  /** Every rule of the projects in the tree, to find what each statement made. */
  rules: P.ScopeRule[]
  /** Every constant of the projects in the tree, to find each type's. */
  constants: P.ScopeConstant[]
  /** Id of each type's node. */
  typeIds: Map<P.TypeScope, string>
  /** Types of the projects imported compiled, by name, from their OWN parse -- see `ScopeExplorer.sourceType()`. */
  sourceTypes: Map<string, P.TypeScope>
  /** How to work out each node's details, by id -- see `ScopeExplorer.details()`. */
  details: Map<string, () => LSP.ScopeDetails>
}
