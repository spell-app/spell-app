/** Rules for assignment and returning values. */

import { proto } from "$/util"
import { P } from "$/parser"
import type { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { memberRead } from "./properties"

/** Rule module for assignment / return rules (`assignment`, `get`, `return_statement`). */
export const assignment = new SpellParser({ module: "assignment" })

////////////////
// ## `assignment` rule
//    e.g. "unknown-var = yes"
////////////////

/**
 * Assignment, via any of 4 equivalent surface forms:  `{thing} = {value}`, `let {thing} = {value}`,
 * `set {thing} to {value}`, or `{variable} is {value}`.
 * - Named `assignment_statement` to avoid colliding with the `assignment` module export below --
 *   `name: "assignment"` keeps the actual rule name.
 * - `thing` may be a plain `{variable}` (declares/updates a scope variable) or an arbitrary
 *   `{expression}` (e.g. property assignment `let the name of X = ...`, which only compiles if `X`
 *   already exists).
 * - SIDE EFFECT: `mutateScope()` declares a new scope variable for `thing` if it's a `{variable}` and
 *   isn't already declared (or is only an alias, e.g. `it`) -- see `match.data.isNewVariable`/`originalVar`.
 *   An alias `thing` is redefined as a real variable.  Safe even if `value` refers to the alias:
 *   identifiers remember what they named when PARSED -- see `SpellIdentifier`.
 * - A new variable holds what `value` is, its `datatype`, e.g. `Card` for `the card is a new card`.  An existing
 *   one keeps its own:  the first datatype wins.
 * - SIDE EFFECT: `set the X of Y to V` declares property `X` if `Y`'s type doesn't -- see `declareProperty()`.
 * - Compiles to `let thing = value` (new variable) or `thing = value` (existing).
 */
class assignment_statement extends SpellStatement<"thing|value", AssignmentMatchData> {
  static ruleName = "assignment"
  @proto static alias = "statement"
  @proto static declares: P.DeclaresSpec = { kind: "variable", name: "thing" }

  /**
   * PER MATCH:  `"global"` if it declared a property (`data.autoDeclared`), which later lines -- and files -- read;
   * else `"internal"`:  a variable goes in our own `match.scope`, so `set x to 1` stays cheap to re-parse.
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
      // `set it to ...` always declares a new `it` -- see `assignment_statement.declareIt()`
      const { datatype } = value
      if (varName === "it") {
        match.data.newIt = assignment_statement.declareIt(scope, match, datatype)
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
    } else {
      this.declareProperty(match)
    }
  }

  /**
   * SIDE EFFECT:  `set the X of Y to V`, where `Y`'s type is one this project declares (not a stub, an import or a
   * built-in) and `X` isn't on it:  declares `X` there, holding `V`'s datatype, marked `auto` -- journaled, as any
   * record -- and notes it as `match.data.autoDeclared` (plan doc D10).
   * - Why:  only a declared property is reactive -- its accessor goes through the instance's spell cells.
   * - Its FILE compiles `Card.declareProp('pile', ...)` + the accessor, once, at its top (or after its class) --
   *   under our `SPELL: DECLARES` comment, NOT on our own line.  See `SP.Block.autoDeclarationAST()`.
   * - Later lines read it as declared, e.g. `the pile of the card` is a `Pile`.  Earlier ones read it loose.
   * - A property an earlier parse of this statement declared is ours again -- see `P.TypeScope.sameStatement()`.
   */
  private declareProperty(match: P.MatchFor<this>) {
    const { thing, value } = match.groups
    const read = memberRead(thing)
    const type = read?.type
    if (!read || !type || type.stub || !type.declaredBy) return
    const { member, property } = read
    const isOurs =
      member instanceof P.ScopeVariable && !!member.auto && P.TypeScope.sameStatement(member.declaredBy, match)
    if (member && !isOurs) return
    // `nothing` says nothing about what it'll hold
    const datatype = value.datatype === "nothing" ? undefined : value.datatype
    const name = `${property.value}`
    type.declareProperty(name, match, { words: property.raw, datatype, auto: true })
    match.data.autoDeclared = {
      typeName: type.name,
      property: name,
      checkType: assignment_statement.checkTypeFor(match.scope, datatype),
      typeDeclaredBy: type.declaredBy
    }
  }

  /**
   * What a property holding `datatype` checks its values against, as `SC.PropCheck.type` -- `undefined` if we can't
   * say, e.g. a type nobody declared yet.
   * - a value type as is, e.g. `text`;  any list `list`;  a class by its name when the code runs, e.g. `Card`.
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
    let number = visible && !visible.isAlias ? assignment_statement.itNumber(visible) + 1 : 1
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
assignment.addRule(assignment_statement, {
  syntax: "(thing:{expression}|{variable}) = {value:expression}",
  tests: [
    {
      ...setup_assignment_statement(),
      tests: [
        { title: "non-existing var", input: "unknown-var = yes", output: "export let unknown_var = true" },
        { title: "existing var", input: "thing = yes", output: "thing = true" }
      ]
    }
  ]
})
assignment.addRule(assignment_statement, {
  syntax: "let (thing:{expression}|{variable}) = {value:expression}",
  tests: [
    {
      ...setup_assignment_statement(),
      tests: [
        {
          title: "non-existing var: property set (won't work)",
          input: `let the name of unknown-var = "bob"`,
          output: `/* PARSE ERROR: Don't understand "let the name of unknown-var = "bob"" */`
        },
        {
          title: "existing var: property set",
          input: `let the name of thing = "bob"`,
          output: `thing.name = "bob"`
        }
      ]
    }
  ]
})
assignment.addRule(assignment_statement, {
  syntax: "set (thing:{expression}|{variable}) to {value:expression}",
  tests: [
    {
      ...setup_assignment_statement(),
      tests: [
        { title: "non-existing var", input: "set unknown-var to yes", output: "export let unknown_var = true" },
        { title: "existing var", input: "set thing to yes", output: "thing = true" },
        {
          title: "alias var reassign works",
          input: "set it to the name of it",
          output: "let it = this.name"
        },
        {
          title: "assignment to alias property doesn't redefine alias",
          input: "set the title of it to the name of it",
          output: "this.title = this.name"
        }
      ]
    }
  ]
})
assignment.addRule(assignment_statement, {
  syntax: "(thing:{variable}) is {value: expression}",
  tests: [
    {
      ...setup_assignment_statement(),
      tests: [
        {
          title: "non-existing var",
          input: `bob is a new person whose name is "bob"`,
          output: `export let bob = new Person({ name: "bob" })`
        },
        { title: "existing var", input: "thing is a new person", output: "thing = new Person()" }
      ]
    }
  ]
})

/**
 * Test setup shared by each `assignment` syntax:  spread into a test block, e.g.
 * `{ ...setup_assignment_statement(), tests: [...] }`.
 * - `beforeEach` adds variable `thing`, alias `it` (=> `this`) and type `Person`.
 */
function setup_assignment_statement(): Pick<P.RuleTestBlock, "compileAs" | "beforeEach"> {
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
  /** When `thing` is `it`:  the NEW `it` variable we declared -- see `assignment_statement.declareIt()`. */
  newIt?: P.ScopeVariable
  /** When `thing` is a property its type never declared:  what we declared -- see `declareProperty()`. */
  autoDeclared?: SP.AutoDeclaredProperty
}

////////////////
// ## `get` rule
//    e.g. "get thing"
////////////////

/**
 * `get {value}` -- assign `value` to a NEW `it`.
 * - SIDE EFFECT: `mutateScope()` declares that `it`:  plain `it` the first time, then `it_2`, `it_3`...
 *   so a callback which captured an earlier `it` keeps it -- see `assignment_statement.declareIt()`.
 * - Compiles to `let it = value`, `let it_2 = value`, ...
 */
class get extends SpellStatement<"value", GetMatchData> {
  @proto static alias = ["assignment", "statement"]
  @proto static changesScope: P.ScopeChanges = "internal"

  /** Declare a new `it`, holding what `value` is -- see `assignment_statement.declareIt()`. */
  mutateScope(match: P.MatchFor<this>) {
    // `match.scope` is typed as `P.Scope`, whose `.variables` getter can be `undefined` -- we know it's a block.
    const scope = match.scope as P.BlockScope
    match.data.itVar = assignment_statement.declareIt(scope, match, match.groups.value.datatype)
  }
  /** Build `P.ASTAssignmentStatement` declaring our new `it` as `value`. */
  getAST(match: P.MatchFor<this>): P.ASTAssignmentStatement {
    const { value } = match.groups
    const { itVar } = match.data
    return new P.ASTAssignmentStatement(match, {
      thing: new P.ASTVariableExpression(match, { name: itVar?.output ?? "it" }),
      value: value.AST as P.ASTExpression,
      isNewVariable: true
    })
  }
}
assignment.addRule(get, {
  syntax: "get {value:expression}",
  tests: [
    {
      title: "`it` is not already defined",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("thing")
      },
      tests: [
        ["get thing", "let it = thing"],
        ["get the foo of the thing", "let it = thing.foo"]
      ]
    },
    {
      title: "`it` is already defined",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add("it")
        variables.add("thing")
      },
      tests: [
        ["get thing", "let it_2 = thing"],
        ["get the foo of the thing", "let it_2 = thing.foo"]
      ]
    },
    {
      title: "each `get` declares a new `it`, so a callback which captured an earlier one keeps it",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("thing")
      },
      tests: [
        {
          input: ["get thing", "get the foo of the thing", "print it"],
          output: ["let it = thing", "let it_2 = thing.foo", "spellCore.console.log(it_2)"]
        }
      ]
    },
    {
      title: "numbered `it`s skip names already in use",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add("thing")
        variables.add("it-2")
      },
      tests: [
        {
          input: ["get thing", "get the foo of the thing"],
          output: ["let it = thing", "let it_3 = thing.foo"]
        }
      ]
    },
    {
      title: "`it` gets redefined if defined as an alias",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        const { variables } = scope as P.BlockScope
        variables.add({ name: "it", output: "this", isAlias: true })
        variables.add("thing")
      },
      tests: [
        {
          input: ["print it", "get the thing", "print it"],
          output: ["spellCore.console.log(this)", "let it = thing", "spellCore.console.log(it)"]
        },
        {
          input: ["print it", "get its name", "print it"],
          output: ["spellCore.console.log(this)", "let it = this.name", "spellCore.console.log(it)"]
        }
      ]
    }
  ]
})

/** What `get` stashes on its match. */
type GetMatchData = {
  /** The NEW `it` variable we declared -- see `assignment_statement.declareIt()`. */
  itVar?: P.ScopeVariable
}

////////////////////////////////////////
// # Returns
////////////////////////////////////////

////////////////
// ## `return_statement` rule
//    e.g. "return"
////////////////

/**
 * `(return|exit with?) {expression}? {nested_expression}?` -- return a value.
 * - `(return|exit with?)` accepts `return`, `exit`, or `exit with` as equivalent keywords.
 * - Accepts the returned expression inline (`return thing`) or as ONE line in a nested indented block
 *   (`return\n\t1 + 2`).
 */
class return_statement extends SpellStatement<"expression?|body?"> {
  @proto static alias = "statement"

  /** We return what follows `return`, or what's indented under it -- see `SpellStatement.getReturnedDatatype()`. */
  getReturned(match: P.MatchFor<this>): { value: P.Match | undefined } {
    return { value: match.groups.expression || this.getBody(match) }
  }

  getAST(match: P.MatchFor<this>): P.ASTReturnStatement {
    const result = match.groups.expression || this.getBody(match)
    return new P.ASTReturnStatement(match, { value: result?.AST as P.ASTExpression | undefined })
  }
}
assignment.addRule(return_statement, {
  syntax: "(return|exit with?) {expression}? {nested_expression}?",
  tests: [
    {
      title: "Simple return with inline expression",
      compileAs: "statement",
      beforeEach(scope: P.Scope) {
        ;(scope as P.BlockScope).variables.add("thing")
      },
      tests: [
        ["return", "return"],
        ["return thing", "return thing"],
        ["exit", "return"],
        ["exit with false", "return false"]
      ]
    },
    {
      title: "Return with nested block expression",
      compileAs: "block",
      tests: [
        // simple expression
        ["return\n\t1 + 2", "return (1 + 2)"],
        // inline JSX
        ["return\n\t<div/>", 'return spellCore.element({ tag: "div" })'],
        ["return\n\t1 + <div/>", 'return (1 + spellCore.element({ tag: "div" }))'],
        // multi-line JSX
        [
          ["return", "\t<div>", "\t\t<span/>", "\t</div>"],
          ['return spellCore.element({ tag: "div", children: [', '  spellCore.element({ tag: "span" })', "] })"]
        ],
        // fails for more than one indented line
        [
          "return\n\t<div/>\n\t1",
          ["return", '/* PARSE ERROR: Don\'t understand "<div/>" */', '/* PARSE ERROR: Don\'t understand "1" */']
        ]
      ]
    }
  ]
})
