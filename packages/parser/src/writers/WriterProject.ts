import { P } from "$/parser"

/****************
 * ### `WriterProject`
 * What a javascript writer (`P.JSWriter`, `P.TSWriter`) must know about a whole project
 * BEFORE it writes any of it:
 * - how to name a member it reads
 * - what each value is
 * - which variables are set again
 * - which members move into their classes
 * - which lists become typed constants
 * - what values the program gives each member
 *
 * - Made once per compile, from every file's statements:
 *   `WriterProject.of(files)`, through `JSWriter.forProject()`.
 * - Both writers read what it knows of names and values;
 *   what moves, and the typed constants, are TypeScript's alone.
 * - Plain facts, worked out from the tree alone:  no scope lookups, nothing written.
 * - An empty one (`new WriterProject()`) knows nothing, e.g. for `JSWriter.instance` writing one node.
 *   Then no getter is renamed where it's read, every new variable is `let`, and nothing moves.
 ****************/
export class WriterProject {
  /**
   * Getters the project declares, by spell's name, e.g. `is_face_up`.
   * - A read of one is written by its member name, `isFaceUp`:  see `JSWriter.memberName()`.
   * - Also the methods of the types it imports, e.g. `is_face_up` from `card "is face up" if ...`:
   *   one read as a property is a getter there.
   * - Also their getters declared as properties (`the short name of a card is ...`):
   *   their declarations say `"getter": true` (`P.ScopeVariable.isGetter`).
   * - NOT a name some class also has as a property (`ASTReactiveProperty`):
   *   a property is named as a property, and a read can't tell which of the two it is.
   */
  readonly getters = new Set<string>()
  /** Variables set AFTER they're declared, by spell's name, e.g. `state`:  `let`;  any other new variable is `const`. */
  readonly reassigned = new Set<string>()
  /**
   * Members written OUTSIDE a class the project declares, by the class's name, with the comments above each.
   * - They're written inside the class instead:  one class body per type.
   * - e.g. `the pile of a card`, set first in `Pile.spell` (an `ASTPatchedMember`, which spell itself never moves).
   */
  readonly movedMembers = new Map<string, Array<P.ASTClassMember | P.ASTComment | P.ASTBlankLine>>()
  /** Every statement moved into a class, so it's written nowhere else. */
  readonly moved = new Set<P.ASTNode>()
  /** Each list class's own item type, e.g. `Card` for `Pile`:  names `<For>`'s item (`card`) -- see `itemTypeOf()`. */
  readonly itemTypes = new Map<string, string>()
  /** Each class's super-type, by name, e.g. `Pile` for `Tableau`. */
  readonly superTypes = new Map<string, string>()
  /**
   * What each class declares, by name:  its properties, getters and methods, by spell's names.
   * - Ours, an imported one's (`importedMembers`), and what it gets for TypeScript only (`undeclared`).
   * - See `isInherited()`.
   */
  readonly members = new Map<string, Set<string>>()
  /**
   * What each variable the files set at their top level is set to, by spell's name,
   * e.g. `all_piles` => `new List<Pile>(...)`.
   * - So the writer knows it's a list, even where it's read before it's set (in a class above it).
   */
  readonly moduleValues = new Map<string, P.ASTExpression>()
  /** Each class's lists of values written out, as `<Class>.<Static>`, e.g. `Deck.Suits`:  plain arrays. */
  readonly staticLists = new Set<string>()
  /** Each class's own getters, by spell's name:  see `getterOf()`. */
  readonly getterMethods = new Map<string, Map<string, P.ASTMethodDefinition>>()
  /** Each class's own properties, by name:  see `propertyOf()`. */
  readonly properties = new Map<string, Map<string, P.ASTReactiveProperty>>()
  /**
   * Each list a property's values come from, hoisted out of its class as a typed constant, by `<Class>.<Static>`:
   * e.g. `Card.Ranks` => `RANKS`, type `Rank`.  See `TSList`.
   */
  readonly lists = new Map<string, TSList>()
  /**
   * Members a class gets for TypeScript only, by the class's name (Q25):
   * ones its program uses on it, or on a class below it, but never declares there.  See `TSUndeclared`.
   * - A value given when one is made, `a new foundation with symbol = "♣️"`:
   *   on the class shared by every class it's given to, e.g. `droppable` on `Pile`, given to each kind of pile.
   * - A method two or more classes define, that the class they share doesn't:
   *   `can_pick_up_$card` on `Pile`, defined by each kind of pile.
   */
  readonly undeclared = new Map<string, TSUndeclared[]>()
  /**
   * Each class the project imports, by its name here, and the members its own project declares:
   * e.g. `Pile` from `Cards`.  The end of a class chain, for `undeclared`.
   */
  readonly importedMembers = new Map<string, Set<string>>()
  /**
   * Every value the program gives a member, by the member's name, e.g. `name` => `"stock"`, `"discards"` ...
   * - What types a property whose type the program never says (Q54):  see `JSWriter.givenKind()`.
   * - Given when one is made:  `a new stock-pile with name = "stock"`.
   * - Set on one:  `set the name of the pile to ...`.
   */
  readonly givenValues = new Map<string, GivenValue[]>()

  /**
   * What `files`' statements say, and the import layer above `scope`, if any -- see the class docs.
   * - And what `scope`'s project says of its types, from their records.
   *   - For ONE file written alone (the editor's view of a file, `JSWriter.writeMatch()`):
   *     a type another of its files declares is known as an imported one is,
   *     and its getters are read by their member names.
   */
  static of(files: P.ASTNode[][], scope?: P.Scope): WriterProject {
    const project = new WriterProject()
    const projectLayers: P.Scope[] = []
    for (let layer = scope; layer; layer = layer.parentScope) {
      if (layer instanceof P.ImportScope) project.noteTypes(layer)
      else if (layer instanceof P.ProjectScope || layer instanceof P.FileScope) projectLayers.push(layer)
    }
    const classes = new Map<string, P.ASTClassDeclaration>()
    const properties = new Set<string>()
    for (const statements of files) {
      for (const statement of statements) {
        forEachNode(statement, (node) => {
          if (node instanceof P.ASTClassDeclaration) classes.set(node.type.name, node)
          else if (node instanceof P.ASTReactiveProperty) properties.add(node.property.value)
          else if (node instanceof P.ASTPropertyDefinition && node.get) project.getters.add(node.property.value)
          else if (node instanceof P.ASTAssignmentStatement && !node.isNewVariable) {
            if (node.thing instanceof P.ASTVariableExpression) project.reassigned.add(node.thing.name)
          } else if (node instanceof P.ASTDestructuredAssignment && !node.isNewVariable) {
            for (const variable of node.variables) project.reassigned.add(variable.name)
          }
        })
      }
    }
    for (const layer of projectLayers) project.noteTypes(layer, classes)
    for (const name of properties) project.getters.delete(name)
    for (const statements of files) project.moveMembers(statements, classes)
    for (const declaration of classes.values()) project.noteClass(declaration, classes)
    project.noteGivenValues(files, { methods: [] })
    project.noteUndeclared(classes)
    for (const statements of files) project.noteModuleValues(statements)
    return project
  }

  /** Does a class ABOVE class `typeName` declare member `name`, e.g. a card's `color` getter, above a joker? */
  isInherited(typeName: string, name: string): boolean {
    for (let type = this.superTypes.get(typeName); type; type = this.superTypes.get(type)) {
      if (this.members.get(type)?.has(name)) return true
    }
    return false
  }

  /** Class `typeName`'s property `name`, its own or a super-type's -- `undefined` if it has none. */
  propertyOf(typeName: string | undefined, name: string): P.ASTReactiveProperty | undefined {
    for (let type = typeName; type; type = this.superTypes.get(type)) {
      const property = this.properties.get(type)?.get(name)
      if (property) return property
    }
    return undefined
  }

  /** Is class `typeName` a spell `List`, or one of its sub-classes, e.g. `Pile`, `Tableau`? */
  isListClass(typeName: string | undefined): boolean {
    return this.isSubclassOf(typeName, "List")
  }

  /** Is class `typeName` class `ancestor`, or below it, e.g. a `Discard_Pile` a `Pile`? */
  isSubclassOf(typeName: string | undefined, ancestor: string): boolean {
    for (let type = typeName; type; type = this.superTypes.get(type)) {
      if (type === ancestor) return true
    }
    return false
  }

  /** Class `typeName`'s getter `name`, its own or a super-type's -- `undefined` if it has none. */
  getterOf(typeName: string | undefined, name: string): P.ASTMethodDefinition | undefined {
    for (let type = typeName; type; type = this.superTypes.get(type)) {
      const getter = this.getterMethods.get(type)?.get(name)
      if (getter) return getter
    }
    return undefined
  }

  /** Is `typeName` a class the project declares or imports, e.g. `Tableau`? */
  isClass(typeName: string): boolean {
    return this.members.has(typeName) || this.importedMembers.has(typeName)
  }

  /** SIDE EFFECT:  notes each variable `statements` set at the top of a file, in `moduleValues`.  Looks inside groups. */
  private noteModuleValues(statements: P.ASTNode[]) {
    for (const statement of statements) {
      if (statement instanceof P.ASTStatementGroup && !(statement instanceof P.ASTTryCatchBlock)) {
        this.noteModuleValues(statement.statements ?? [])
      } else if (statement instanceof P.ASTAssignmentStatement && statement.isNewVariable) {
        if (statement.thing instanceof P.ASTVariableExpression)
          this.moduleValues.set(statement.thing.name, statement.value)
      }
    }
  }

  /** Class `typeName`'s item type, its own or a super-type's, e.g. `Card` for a `Tableau`, which is a `Pile`. */
  itemTypeOf(typeName: string | undefined): string | undefined {
    for (let type = typeName; type; type = this.superTypes.get(type)) {
      const itemType = this.itemTypes.get(type)
      if (itemType) return itemType
    }
    return undefined
  }

  /**
   * The list `oneOf` names, if it's one we hoist, e.g. `Card.Ranks` -- see `lists`.
   * - Or read when set, `() => Deck.Suits`:  for a list on a class further down.
   */
  listFor(oneOf: P.ASTExpression | undefined): TSList | undefined {
    const list = oneOf && listNamedBy(oneOf)
    if (!(list instanceof P.ASTPropertyExpression) || !(list.object instanceof P.ASTTypeExpression)) return undefined
    return this.lists.get(`${list.object.name}.${list.property.value}`)
  }

  ////////////////
  // ## Working it out
  ////////////////

  /**
   * SIDE EFFECT:  notes what the types `layer` declares say they have.
   * - Their getters, in `getters`:  their methods (one read as a property is a getter),
   *   and their derived properties (`P.ScopeVariable.isGetter`).
   * - Each type NOT in `written` (the classes the files declare), and not noted already, is noted as imported:
   *   its members in `importedMembers`, its super-type in `superTypes`.
   */
  private noteTypes(layer: P.Scope, written = new Map<string, P.ASTClassDeclaration>()) {
    for (const type of layer.types?.get() ?? []) {
      const members = new Set<string>()
      for (const method of type.methods?.get() ?? []) {
        this.getters.add(method.name)
        members.add(method.name)
      }
      for (const variable of type.variables?.get() ?? []) {
        members.add(variable.name)
        if (variable.isGetter) this.getters.add(variable.name)
      }
      if (written.has(type.name) || this.importedMembers.has(type.name)) continue
      this.importedMembers.set(type.name, members)
      if (type.superType) this.superTypes.set(type.name, type.superType)
    }
  }

  /**
   * SIDE EFFECT:  notes each member in `statements` written outside a class in `classes`,
   * and the comments right above it, into `movedMembers` and `moved`.
   * - Looks inside groups, never inside a class or a method.
   */
  private moveMembers(statements: P.ASTNode[], classes: Map<string, P.ASTClassDeclaration>) {
    let comments: Array<P.ASTComment | P.ASTBlankLine> = []
    for (const statement of statements) {
      if (statement instanceof P.ASTComment) {
        comments.push(statement)
        continue
      }
      if (statement instanceof P.ASTBlankLine) {
        comments = []
        continue
      }
      const member = statement instanceof P.ASTPatchedMember ? statement.member : statement
      if (member instanceof P.ASTClassMember && classes.has(member.typeName)) {
        const moved = this.movedMembers.get(member.typeName) ?? []
        if (moved.length) moved.push(new P.ASTBlankLine(member.match))
        moved.push(...comments, member)
        this.movedMembers.set(member.typeName, moved)
        for (const comment of comments) this.moved.add(comment)
        this.moved.add(statement)
      } else if (statement instanceof P.ASTStatementGroup && statement.statements) {
        this.moveMembers(statement.statements, classes)
      }
      comments = []
    }
  }

  /** SIDE EFFECT:  notes `declaration`'s item type, and the lists its properties' values come from. */
  private noteClass(declaration: P.ASTClassDeclaration, classes: Map<string, P.ASTClassDeclaration>) {
    if (declaration.superType) this.superTypes.set(declaration.type.name, declaration.superType.name)
    const members = [...(declaration.members ?? []), ...(this.movedMembers.get(declaration.type.name) ?? [])]
    for (const member of members) {
      if (member instanceof P.ASTStaticDefinition && isListLiteral(member.value)) {
        this.staticLists.add(`${declaration.type.name}.${member.name}`)
      }
      if (member instanceof P.ASTStaticDefinition && member.name === "instanceType") {
        if (member.value instanceof P.ASTTypeExpression) this.itemTypes.set(declaration.type.name, member.value.name)
      }
      // read when made, for an item class further down:  `static get instanceType() { return Card }`
      if (member instanceof P.ASTStaticMethod && member.getter && member.name === "instanceType") {
        const returned = listNamedBy(member.method)
        if (returned instanceof P.ASTTypeExpression) this.itemTypes.set(declaration.type.name, returned.name)
      }
      if (member instanceof P.ASTPropertyDefinition && member.get) {
        const getters = this.getterMethods.get(declaration.type.name) ?? new Map()
        this.getterMethods.set(declaration.type.name, getters.set(member.property.value, member.get))
      }
      if (!(member instanceof P.ASTReactiveProperty)) continue
      const own = this.properties.get(declaration.type.name) ?? new Map()
      this.properties.set(declaration.type.name, own.set(member.property.value, member))
      const oneOf = member.check?.properties?.find(
        (property): property is P.ASTObjectLiteralProperty =>
          property instanceof P.ASTObjectLiteralProperty && property.property.value === "oneOf"
      )?.value
      this.noteList(oneOf, member, classes)
    }
  }

  /** SIDE EFFECT:  notes in `undeclared` what each class gets for TypeScript only -- see there. */
  private noteUndeclared(classes: Map<string, P.ASTClassDeclaration>) {
    // what each class declares itself, by name:  its properties, getters and methods
    const declared = this.members
    // each method name, and the classes defining it
    const definedBy = new Map<string, Array<{ type: string; method: P.ASTMethodDefinition }>>()
    for (const [type, declaration] of classes) {
      const names = new Set<string>()
      for (const member of [...(declaration.members ?? []), ...(this.movedMembers.get(type) ?? [])]) {
        if (!(member instanceof P.ASTReactiveProperty || member instanceof P.ASTPropertyDefinition)) continue
        names.add(member.property.value)
        if (member instanceof P.ASTPropertyDefinition && member.method) {
          const defining = definedBy.get(member.property.value) ?? []
          definedBy.set(member.property.value, [...defining, { type, method: member.method }])
        }
      }
      declared.set(type, names)
    }
    for (const [type, members] of this.importedMembers) declared.set(type, new Set(members))
    // a class's chain:  itself and the classes above it, ours, then an imported one, e.g. `Tableau`, `Pile`
    const chainOf = (type: string) => {
      const chain: string[] = []
      for (let it: string | undefined = type; it && declared.has(it); it = this.superTypes.get(it)) chain.push(it)
      return chain
    }
    const shared = (types: string[]) =>
      chainOf(types[0]!).find((it) => types.every((type) => chainOf(type).includes(it)))
    const isDeclaredAbove = (type: string, name: string) => chainOf(type).some((it) => declared.get(it)?.has(name))
    const add = (type: string, undeclared: TSUndeclared) => {
      this.undeclared.set(type, [...(this.undeclared.get(type) ?? []), undeclared])
      declared.get(type)!.add(undeclared.name)
    }

    // values given when one is made:  `new Foundation({ symbol: "♣️" })`
    for (const [name, given] of this.givenValues) {
      const made = new Set(given.flatMap((it) => (it.made && classes.has(it.made) ? [it.made] : [])))
      const type = made.size ? shared([...made]) : undefined
      if (type && !isDeclaredAbove(type, name)) add(type, { name, isValue: true })
    }

    // a method two or more classes define, which the class they share doesn't
    for (const [name, defining] of definedBy) {
      if (defining.length < 2) continue
      const type = shared(defining.map((it) => it.type))
      if (type && !isDeclaredAbove(type, name)) add(type, { name, method: defining[0]!.method, definitions: defining })
    }
  }

  /**
   * SIDE EFFECT:  notes in `givenValues` each value `node`, and everything under it, gives a member,
   * with `where` it's given:  in which class, inside which methods.
   */
  private noteGivenValues(node: unknown, where: ProgramPlace) {
    if (Array.isArray(node)) {
      for (const item of node) this.noteGivenValues(item, where)
      return
    }
    if (!(node instanceof P.ASTNode)) return
    if (node instanceof P.ASTClassDeclaration) where = { ...where, typeName: node.type.name }
    else if (node instanceof P.ASTClassMember) where = { ...where, typeName: node.typeName }
    else if (node instanceof P.ASTMethodDefinition) where = { ...where, methods: [...where.methods, node] }
    else if (node instanceof P.ASTNewInstanceExpression) {
      for (const property of node.props?.properties ?? []) {
        if (!(property instanceof P.ASTObjectLiteralProperty) || !property.value) continue
        this.noteGiven(property.property.value, { value: property.value, made: node.type.name, where })
      }
    } else if (node instanceof P.ASTAssignmentStatement && node.thing instanceof P.ASTPropertyExpression) {
      const { object, property } = node.thing
      this.noteGiven(property.value, { value: node.value, object, where })
    }
    for (const [key, value] of Object.entries(node)) {
      if (key !== "match") this.noteGivenValues(value, where)
    }
  }

  /** SIDE EFFECT:  notes `given`, a value the program gives member `name`, in `givenValues`. */
  private noteGiven(name: string, given: GivenValue) {
    this.givenValues.set(name, [...(this.givenValues.get(name) ?? []), given])
  }

  /**
   * SIDE EFFECT:  notes the list `oneOf` names in `lists`, if it's a list of values on a class of ours,
   * e.g. `Card.Ranks`, `static Ranks = ['ace', 2, ...]` -- named for `property`, the first that uses it.
   */
  private noteList(
    oneOf: P.ASTExpression | undefined,
    property: P.ASTReactiveProperty,
    classes: Map<string, P.ASTClassDeclaration>
  ) {
    const list = oneOf && listNamedBy(oneOf)
    if (!(list instanceof P.ASTPropertyExpression) || !(list.object instanceof P.ASTTypeExpression)) return
    const owner = list.object.name
    const key = `${owner}.${list.property.value}`
    if (this.lists.has(key)) return
    const ownerMembers = [...(classes.get(owner)?.members ?? []), ...(this.movedMembers.get(owner) ?? [])]
    const definition = ownerMembers.find(
      (member): member is P.ASTStaticDefinition =>
        member instanceof P.ASTStaticDefinition && member.name === list.property.value
    )
    if (!definition || !isListLiteral(definition.value)) return

    const taken = new Set([...classes.keys(), ...[...this.lists.values()].flatMap((it) => [it.constant, it.type])])
    let constant = constantCaseOf(definition.name)
    if (taken.has(constant)) constant = `${constantCaseOf(owner)}_${constant}`
    const type = typeCaseOf(property.property.value)
    this.lists.set(key, { definition, constant, type: taken.has(type) ? undefined : type })
  }
}

/**
 * A list a property's values come from, hoisted out of its class as a typed constant:
 * ```
 * const RANKS = ["ace", 2, ...] as const
 * export type Rank = (typeof RANKS)[number]
 * ```
 * then `static Ranks = RANKS` in its class.
 * - Why out of the class:  a decorator's arguments run while its class is being made,
 *   so `@prop({ oneOf: RANKS })` can't read `Card.Ranks` yet.
 */
export type TSList = {
  /** Its `static` in its class, e.g. `static Ranks = [...]`:  its values. */
  definition: P.ASTStaticDefinition
  /** The constant's name, e.g. `RANKS`. */
  constant: string
  /** The type of one of its values, e.g. `Rank`;  none if that name's taken:  `(typeof RANKS)[number]` instead. */
  type: string | undefined
}

/**
 * A member a class gets for TypeScript only:  see `WriterProject.undeclared`.  The javascript doesn't change.
 * - A value given when one is made:  `declare symbol: string` in its class.
 * - A method:  merged in after its class, `export interface Pile { canPickUpCard(card: Card): boolean }`.
 *   A `declare` property would clash with the classes below that define it as a method.
 */
export type TSUndeclared = {
  /** Its name, spell's. */
  name: string
  /** A value given when one is made:  typed by every value the program gives it -- see `WriterProject.givenValues`. */
  isValue?: boolean
  /** For a method:  one class's definition of it, typing its parameters. */
  method?: P.ASTMethodDefinition
  /** For a method:  each class defining it, with its definition there.  What they all return types it (Q54). */
  definitions?: Array<{ type: string; method: P.ASTMethodDefinition }>
}

/**
 * A value the program gives a member -- see `WriterProject.givenValues`.
 * - Given when one is made:  `a new stock-pile with name = "stock"`.
 * - Set on one:  `set the name of the pile to ...`.
 */
export type GivenValue = {
  /** The value given, e.g. `"stock"`. */
  value: P.ASTExpression
  /** Given when one is made:  the class made, e.g. `Stock_Pile`. */
  made?: string
  /** Set on one:  what it's set on, e.g. `the pile`. */
  object?: P.ASTExpression
  /** Where it's given:  so the writer can tell what `object` and `value` are. */
  where: ProgramPlace
}

/** Where in a program something is:  in which class's members, if any, and inside which methods. */
export type ProgramPlace = {
  /** The class whose member it's in, e.g. `Tableau`:  what `this` is there. */
  typeName?: string
  /** The methods it's inside, outermost first:  their parameters are known there. */
  methods: P.ASTMethodDefinition[]
}

////////////////
// ## Helpers
////////////////

/**
 * Call `callback` for `node` and every AST node under it:  its fields, and arrays of them.
 * - Skips `match`, and anything that isn't an AST node, e.g. a scope record (`ASTVariableExpression.variable`).
 */
export function forEachNode(node: unknown, callback: (node: P.ASTNode) => void): void {
  if (Array.isArray(node)) {
    for (const item of node) forEachNode(item, callback)
    return
  }
  if (!(node instanceof P.ASTNode)) return
  callback(node)
  for (const [key, value] of Object.entries(node)) {
    if (key !== "match") forEachNode(value, callback)
  }
}

/**
 * The list a `oneOf` check names:  `value` itself, or what it returns when it's read when set, `() => Deck.Suits`.
 */
export function listNamedBy(value: P.ASTExpression): P.ASTExpression {
  if (!(value instanceof P.ASTMethodDefinition)) return value
  const [returned] = value.body.statements ?? []
  return returned instanceof P.ASTReturnStatement && returned.value ? returned.value : value
}

/** Is `value` a list written out, e.g. `['ace', 2, ...]`? */
function isListLiteral(value: P.ASTExpression): boolean {
  return value instanceof P.ASTArrayLiteral || value instanceof P.ASTEnumeration || value instanceof P.ASTListExpression
}

/** `Ranks` => `RANKS`, `Short_Names` => `SHORT_NAMES`, `ShortNames` => `SHORT_NAMES`. */
export function constantCaseOf(name: string): string {
  return name
    .replace(/([a-z0-9])([A-Z])/g, "$1_$2")
    .replace(/[$_]+/g, "_")
    .toUpperCase()
}

/** `rank` => `Rank`, `short_suit` => `ShortSuit`. */
export function typeCaseOf(name: string): string {
  const camel = camelCaseOf(name)
  return camel.charAt(0).toUpperCase() + camel.slice(1)
}

/**
 * Spell's `name` in camelCase, as javascript and TypeScript write a member's name (`JSWriter.nameOf()`):
 * `is_a_$suit` => `isASuit`, `turn_face_up` => `turnFaceUp`, `it_2` => `it2`.
 * - `$` marks where a value goes in a spell name:  dropped, as `_` is.
 * - A name with neither is as is, e.g. `play`, `Card`.
 */
export function camelCaseOf(name: string): string {
  if (!/[_$]/.test(name)) return name
  const [first = "", ...rest] = name.split(/[_$]+/).filter(Boolean)
  return first + rest.map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join("")
}
