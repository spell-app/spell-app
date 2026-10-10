import { proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
import { MemberReadExpression } from "$/spell/rules/properties"
// Import directly to avoid circular import
import { SpellStatement } from "$/spell/rules/Statement"
import { assignment } from "./assignment.parser"

/**
 * `assignment` rule:  assignment, via any of 4 equivalent surface forms:
 * `{thing} = {value}`, `let {thing} = {value}`, `set {thing} to {value}`, or `{variable} is {value}`.
 * - e.g. `unknown-var = yes`
 * - Class named `AssignmentStatement`, for what it is;  `static ruleName` keeps the rule name, `assignment`.
 * - `thing` may be a plain `{variable}` (declares/updates a scope variable), or an arbitrary `{expression}`.
 *   - e.g. property assignment `let the name of X = ...`, which only compiles if `X` already exists
 * - SIDE EFFECT: `mutateScope()` declares a new scope variable for `thing`,
 *   if it's a `{variable}` and isn't already declared (or is only an alias, e.g. `it`).
 *   - See `match.data.isNewVariable` / `originalVar`.
 *   - An alias `thing` is redefined as a real variable.
 *   - Safe even if `value` refers to the alias:
 *     identifiers remember what they named when PARSED (see `SpellIdentifier`).
 * - A new variable holds what `value` is, its `datatype`, e.g. `Card` for `the card is a new card`.
 *   An existing one keeps its own:  the first datatype wins.
 * - SIDE EFFECT: `set the X of Y to V` declares property `X` if `Y`'s type doesn't -- see `declareProperty()`.
 * - Asks for a type its value doesn't say, with a warning (see `SP.SpellWarnings`):
 *   - a new variable's list of nothing said, `set state to []`
 *   - a property it declares from a value which doesn't say what it is
 * - A built-in type's member is read-only, e.g. `set the length of the name to 3`:  a parse error -- see `parse()`.
 * - So is the pile a card belongs to, e.g. `set the pile of the card to x`:  move the card to the pile instead.
 * - Compiles to `let thing = value` (new variable) or `thing = value` (existing).
 */
export class AssignmentStatement extends SpellStatement<"thing|value", AssignmentMatchData> {
  static ruleName = "assignment"
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "variable", name: "thing" }

  /**
   * Refused when `thing` reads a built-in type's member, e.g. `the length of the name`:  spell works those out.
   * - Its `readAs`, e.g. `spellCore.itemCountOf(deck)`, is no place to put a value.  See `SP.BUILT_IN_TYPE_TABLE`.
   * - And when it reads the pile a card belongs to (`a card belongs to one pile`), e.g. `the pile of the card`:
   *   it's whichever pile holds the card -- see `P.ScopeVariable.exclusive`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    const read = match && MemberReadExpression.memberRead(match.groups.thing)
    const member = read?.member
    if (!match || !read || !(member instanceof P.ScopeVariable) || !(member.readAs || member.exclusive)) return match
    const type = read.type ? ` of a ${SP.typeName(read.type.name)}` : ""
    const why = member.exclusive
      ? `it's the ${member.datatype} holding it -- move it to a ${member.datatype} instead`
      : "spell works it out"
    return SpellStatement.refuse(match, `Can't set the ${read.property.raw}${type}:  ${why}`)
  }

  /**
   * PER MATCH, what we change:
   * - `"global"` if we declared a property (`data.autoDeclared`), which later lines -- and files -- read
   * - else `"internal"`:  a variable goes in our own `match.scope`, so `set x to 1` stays cheap to re-parse
   */
  getScopeChanges(match?: P.MatchFor<this>): P.ScopeChanges {
    return match?.data.autoDeclared ? "global" : "internal"
  }

  /**
   * Declares a new scope variable for `thing` (if it's a `{variable}` and not already declared,
   * or only an alias) so later statements in the block see it -- see rule doc above.
   */
  mutateScope(match: P.MatchFor<this>) {
    const { thing, value } = match.groups
    // If `thing` is a variable...
    // TODO: this is not necessarily the best check...
    if (thing.rule.name === "variable" || thing.rule.name?.endsWith("_variable")) {
      // get just the `identifier` bit to ignore leading "the "
      // `thing.rule.name` check above guarantees `thing` came from `variable`/`*_variable`, whose own
      // syntax always includes a single, non-repeated `{identifier}` group.
      const identifier = thing.groups.identifier as P.Match
      const varName: string = identifier.value
      // `match.scope` is typed as `P.Scope`, whose `.variables` getter can be `undefined` (it just
      // forwards to `parentScope.variables`) -- cast to `P.BlockScope` for its non-optional override,
      // which already accepts a plain name string as `.add()`/`.get()` input.
      const scope = match.scope as P.BlockScope
      const { variables } = scope
      // `set it to ...` always declares a new `it` -- see `AssignmentStatement.declareIt()`
      const { datatype } = value
      if (varName === "it") {
        match.data.newIt = AssignmentStatement.declareIt(scope, match, datatype)
        match.data.isNewVariable = true
        return
      }
      const scopeVar = variables.get(varName)
      match.data.isNewVariable = !scopeVar || scopeVar.isAlias
      // define a new variable in `scope` if not already defined, or redefine an alias as a real one
      if (!scopeVar) variables.add({ name: varName, datatype, declaredBy: match })
      else if (scopeVar.isAlias) variables.replace({ name: scopeVar.name, datatype, declaredBy: match })
      // Remember the original scopeVar for `getAST()` below
      match.data.originalVar = scopeVar
      if (match.data.isNewVariable && datatype === "list") AssignmentStatement.warnListOfNothing(match, identifier)
    } else {
      this.declareProperty(match)
    }
  }

  /**
   * Ask what a new variable's list holds, when its value doesn't say (epic `output-targets`, Q24):
   * a warning, e.g. `set state to []` => `Say what "state" holds, e.g. "set state to a new list of text"`.
   * - Any list spell can't say the items of, e.g. `[]`, `a new list`, `[1, "a"]`.
   * - NOT a list it can, e.g. `a new list of piles`, `[1, 2]`.
   */
  private static warnListOfNothing(match: P.MatchFor<AssignmentStatement>, identifier: P.Match): void {
    const words = identifier.raw ?? `${identifier.value}`
    const example = `set ${words} to a new list of ${SP.SpellWarnings.exampleItemType(match.scope, words)}`
    SP.SpellWarnings.note(match, `Say what "${words}" holds, e.g. "${example}"`, match.groups.value)
  }

  /**
   * SIDE EFFECT:  `set the X of Y to V`, where `X` isn't on `Y`'s type,
   * and that type is one this project declares (not a stub, an import or a built-in):
   * - declares `X` there, holding `V`'s datatype, marked `autoDeclared` -- journaled, as any record
   * - notes it as `match.data.autoDeclared` (plan doc D10)
   * - Why:  only a declared property is reactive -- its accessor goes through the instance's spell cells.
   * - Its FILE compiles `Card.declareProp('pile', ...)` + the accessor, once, at its top (or after its class):
   *   under our `SPELL: DECLARES` comment, NOT on our own line.  See `SP.Block.autoDeclarationAST()`.
   * - Later lines read it as declared, e.g. `the pile of the card` is a `Pile`.  Earlier ones read it loose.
   * - A property an earlier parse of this statement declared is ours again -- see `P.TypeScope.sameStatement()`.
   * - `V` doesn't say what it is, e.g. `nothing`:  a warning asks for a declaration instead
   *   (epic `output-targets`, Q24), e.g. `Say what "name" is:  declare it, e.g. "a pile has a name as text"`.
   */
  private declareProperty(match: P.MatchFor<this>) {
    const { thing, value } = match.groups
    const read = MemberReadExpression.memberRead(thing)
    const type = read?.type
    if (!read || !type || type.stub || !type.declaredBy) return
    const { member, property } = read
    const isOurs =
      member instanceof P.ScopeVariable && !!member.autoDeclared && P.TypeScope.sameStatement(member.declaredBy, match)
    if (member && !isOurs) return
    // `nothing` says nothing about what it'll hold
    const datatype = value.datatype === "nothing" ? undefined : value.datatype
    const name = `${property.value}`
    type.declareProperty(name, match, { asWritten: property.raw, datatype, autoDeclared: true })
    match.data.autoDeclared = {
      typeName: type.name,
      property: name,
      checkType: AssignmentStatement.checkTypeFor(match.scope, datatype),
      typeDeclaredBy: type.declaredBy
    }
    // what it holds, when `V` doesn't say:  ask for its declaration (epic `output-targets`, Q24)
    if (!datatype) {
      const words = property.raw ?? name
      const typeWords = type.name.toLowerCase().replace(/_/g, "-")
      const has = `${/^[aeiou]/i.test(typeWords) ? "an" : "a"} ${typeWords} has a ${words}`
      const example = `${has} as ${SP.SpellWarnings.exampleType(match.scope, words)}`
      SP.SpellWarnings.note(match, `Say what "${words}" is:  declare it, e.g. "${example}"`, thing)
    }
  }

  /**
   * What a property holding `datatype` checks its values against, as `SC.PropCheck.type`:
   * - a value type as is, e.g. `text`
   * - any list:  `list`
   * - a class by its name when the code runs, e.g. `Card`
   * - `undefined` if we can't say, e.g. a type nobody declared yet
   */
  private static checkTypeFor(scope: P.Scope, datatype: P.Datatype | undefined): string | undefined {
    if (!datatype) return undefined
    if (P.isValueType(datatype)) return datatype
    if (P.itemTypeOf(datatype)) return "list"
    const type = scope.getType(datatype)
    if (!type || type.stub) return undefined
    return type.runtimeName ?? type.name
  }
  /** Only a NEW variable is a declaration, and not `it`:  every `get` makes a fresh one. */
  getDeclaration(match: P.MatchFor<this>): P.Declaration | undefined {
    if (!match.data.isNewVariable || match.data.newIt) return undefined
    return super.getDeclaration(match)
  }
  /** Build `P.ASTAssignmentStatement` -- a clean variable for `thing` if it's a new `it`, or was an alias. */
  getAST(match: P.MatchFor<this>): P.ASTAssignmentStatement {
    const { thing, value } = match.groups
    const { originalVar, newIt } = match.data
    const cleanName = newIt ? (newIt.output ?? newIt.name) : originalVar?.isAlias ? originalVar.name : undefined
    return new P.ASTAssignmentStatement(match, {
      thing: cleanName ? new P.ASTVariableExpression(match, { name: cleanName }) : (thing.AST as P.ASTExpression),
      value: value.AST as P.ASTExpression,
      isNewVariable: match.data.isNewVariable
    })
  }

  /**
   * Declare a NEW `it` variable in `scope`, for `get` / `set it to` (its `declaredBy`), and return it.
   * - Every `it` value gets its own javascript variable, so a callback which captured an earlier `it` keeps it:
   *   plain `it` if no real `it` is visible, else the next of `it_2`, `it_3`, ...
   * - NEVER reuses a name visible here:
   *   - an outer `it` -- `let it = it.name` in a nested block would read the NEW, unset `it`
   *   - a user's own variable which happens to be called `it_2`
   * - An alias `it`, e.g. a method's `it` meaning `this`, doesn't count as visible:  its javascript name isn't `it`.
   * - Numbered from the visible `it`'s `output`, NOT a counter, so incremental parsing's journal covers it.
   * - Static, as `get` declares an `it` too.
   * - SIDE EFFECT: replaces `scope`'s own `it` with the new one, so later lines' `it` means it.
   * - `datatype`:  what it holds, e.g. `Card` for `get the first card of the deck`.
   */
  static declareIt(scope: P.BlockScope, declaredBy: P.Match, datatype?: P.Datatype): P.ScopeVariable {
    const { variables } = scope
    const visible = variables.get("it")
    let number = visible && !visible.isAlias ? AssignmentStatement.itNumber(visible) + 1 : 1
    while (number > 1 && variables.get(`it_${number}`)) number++
    const output = number === 1 ? undefined : `it_${number}`
    const [it] = variables.replace({ name: "it", output, datatype, declaredBy })
    return it!
  }

  /** Which `it` `variable` is:  1 for plain `it`, 2 for `it_2`... */
  private static itNumber(variable: P.ScopeVariable): number {
    const number = /^it_(\d+)$/.exec(variable.output ?? "")?.[1]
    return number ? Number(number) : 1
  }
}
assignment.addRule(AssignmentStatement, {
  syntax: "(thing:{expression}|{variable}) = {value:expression}",
  tests: [
    {
      ...setupAssignmentStatement(),
      tests: [
        {
          title: "non-existing var",
          input: "unknown-var = yes",
          js: "export const unknownVar = true",
          ts: "export const unknownVar: boolean = true"
        },
        { title: "existing var", input: "thing = yes", js: "thing = true" }
      ]
    }
  ]
})
assignment.addRule(AssignmentStatement, {
  syntax: "let (thing:{expression}|{variable}) = {value:expression}",
  tests: [
    {
      ...setupAssignmentStatement(),
      tests: [
        {
          title: "non-existing var: property set (won't work)",
          input: `let the name of unknown-var = "bob"`,
          js: `/* PARSE ERROR: Don't understand "let the name of unknown-var = "bob"" */`
        },
        {
          title: "existing var: property set",
          input: `let the name of thing = "bob"`,
          js: `thing.name = "bob"`
        }
      ]
    }
  ]
})
assignment.addRule(AssignmentStatement, {
  syntax: "set (thing:{expression}|{variable}) to {value:expression}",
  tests: [
    {
      ...setupAssignmentStatement(),
      tests: [
        {
          title: "non-existing var",
          input: "set unknown-var to yes",
          js: "export const unknownVar = true",
          ts: "export const unknownVar: boolean = true"
        },
        { title: "existing var", input: "set thing to yes", js: "thing = true" },
        {
          title: "alias var reassign works",
          input: "set it to the name of it",
          js: "const it = this.name"
        },
        {
          title: "assignment to alias property doesn't redefine alias",
          input: "set the title of it to the name of it",
          js: "this.title = this.name"
        }
      ]
    }
  ]
})
assignment.addRule(AssignmentStatement, {
  syntax: "{thing:variable} is {value:expression}",
  tests: [
    {
      ...setupAssignmentStatement(),
      tests: [
        {
          title: "non-existing var",
          input: `bob is a new person whose name is "bob"`,
          js: 'export const bob = new Person({ name: "bob" })'
        },
        { title: "existing var", input: "thing is a new person", js: "thing = new Person()" }
      ]
    }
  ]
})

/**
 * Test setup shared by each `assignment` syntax:
 * spread into a test block, e.g. `{ ...setupAssignmentStatement(), tests: [...] }`.
 * - `beforeEach` adds variable `thing`, alias `it` (=> `this`) and type `Person`.
 */
function setupAssignmentStatement(): Pick<P.RuleTestBlock, "compileAs" | "beforeEach"> {
  return {
    compileAs: "block",
    beforeEach(scope: P.Scope) {
      // `scope` is typed as `P.Scope`, whose `.variables`/`.types` getters can be `undefined` --
      // cast to `P.RootScope` for their non-optional override, which already accepts a plain
      // name string as `.add()`/`.get()` input.
      const { variables, types } = scope as P.RootScope
      variables.add("thing")
      variables.add({ name: "it", output: "this", isAlias: true })
      types.add("Person")
    }
  }
}

/** What `assignment` stashes on its match. */
type AssignmentMatchData = {
  /** Whether the assigned-to variable is newly declared by this statement. */
  isNewVariable?: boolean
  /** Original scope `ScopeVariable` for `thing`, before any alias redefinition hackery. */
  originalVar?: P.ScopeVariable
  /** When `thing` is `it`:  the NEW `it` variable we declared -- see `AssignmentStatement.declareIt()`. */
  newIt?: P.ScopeVariable
  /** When `thing` is a property its type never declared:  what we declared -- see `declareProperty()`. */
  autoDeclared?: SP.AutoDeclaredProperty
}
