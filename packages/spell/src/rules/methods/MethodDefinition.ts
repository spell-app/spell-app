import { typeCase, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellStatement, type SpellStatementProps } from "$/spell/rules/Statement"
import { DynamicMethodRule } from "./DynamicMethodRule"
import { MethodInfixRule } from "./MethodInfixRule"
import { MethodPostfixRule } from "./MethodPostfixRule"
import type { MethodSignatureData } from "./methods.shared"

/**
 * Base for method-DEFINITION rules built on `method_signature`: `to_do_something`, `create_animation` and
 * `quoted_type_expression`.  See `to_do_something` below.
 * - Turns a parsed signature into either a loose function, an instance method (when a captured type is
 *   promoted via `inlineInitialType`), or a postfix/infix expression (`quoted_type_expression` only).
 * - Also registers the generated call-site rule (`getRule()`) onto `scope.parser` (`mutateScope()`), so the
 *   new syntax is usable immediately after the definition.
 * - Generic pass-through: each subclass has its own `signature` group typing, e.g. `ToDoSomething extends
 *   MethodDefinition<"asTest?|signature|body?">`.  `MethodDefinitionData` (`signature`,
 *   the processed/cached result of `getSignature()`) is ALWAYS added on top of whatever `MatchData` a
 *   subclass declares.
 */
export class MethodDefinition<
  Groups extends string | P.AnyGroups = P.AnyGroups,
  MatchData extends P.AnyMatchData = P.AnyMatchData
> extends SpellStatement<Groups, MatchData & MethodDefinitionData> {
  /**
   * `true` to promote the signature's FIRST captured type arg (e.g. `(a card)`) into an instance-method
   * receiver instead of a call argument -- see `processSignature()`.  Defaults `false`; `to_do_something`
   * and `create_animation` turn it on.
   */
  declare inlineInitialType: boolean
  @proto static inlineInitialType = false
  /** TYPE-ONLY: props `parser.addRule()` accepts for this rule -- see `P.Rule`'s `Props`. */
  declare readonly Props: MethodDefinitionProps

  /**
   * Promote a captured type argument to an instance-method receiver (`thisArg`), when `inlineInitialType`.
   * - Only converts the FIRST type found that isn't `isSimple` (i.e. a real declared type, not a
   *   primitive like `text`/`number`).
   *   - So a typed parameter before it doesn't stop it:  `to append (digit as text) to (a calculator)` is still
   *     `Calculator.append_$digit_to_calculator(digit)` (epic `output-targets`, Q24:  spell asks for that type).
   *     Was the FIRST type, simple or not:  a free function, whose `its` read a `this` it hadn't got.
   * - The method's NAME drops the type, unless that leaves a little word dangling (epic `output-targets`, Q44):
   *   then it keeps the type's name, e.g. `to update the total of (a calculator)` => `update_the_total_of_calculator`,
   *   not `update_the_total_of`.  See `DANGLING_WORDS`.
   *   - Nothing dangles with the receiver first:  `to move (a card) to (a pile)` => `move_to_$pile`.
   * - SIDE EFFECT: mutates `signature` in place -- removes the type's arg/method/syntax bits and replaces the
   *   syntax bit with `{thisArg:expression}`; also adds an alias variable when the arg's own name differs
   *   from the type name (e.g. `to show (thing as a card)` aliases `thing` to `this`).
   * - Also promotes to a `test` method when `asTest`, prefixing `test` onto the method name and syntax.
   */
  processSignature(groups: P.MatchGroups, signature: MethodSignatureData, _scope: P.Scope): MethodSignatureData {
    const initialType = signature.types.find((type) => !type.isSimple)
    if (this.inlineInitialType && initialType) {
      signature.instanceType = initialType.name
      // remove instance bits from args and method signature
      signature.args.splice(initialType.argIndex, 1)
      const wordBefore = signature.methodBits[initialType.methodIndex - 1]
      if (wordBefore && DANGLING_WORDS.test(wordBefore)) {
        // keep the type's name in its place, as a word:  `of_calculator`, not `of_$calculator`
        signature.methodBits[initialType.methodIndex] = initialType.name.replace(/-/g, "_")
      } else {
        signature.methodBits.splice(initialType.methodIndex, 1)
      }
      // replace in syntax with `thisArg` and add a variable alias for `this`
      signature.syntaxBits[initialType.syntaxIndex] = "{thisArg:expression}"
      if (initialType.varName && initialType.varName !== initialType.name) {
        signature.extraVars.push({ name: initialType.varName, output: "this", type: "alias" })
      }
    }
    if (groups.asTest) {
      signature.methodBits.unshift("test")
      signature.syntaxBits.unshift("test")
    }
    return signature
  }

  /**
   * Compute (and cache in `match.data.signature`) the processed method signature -- see `computeSignature()`.
   */
  getSignature(match: P.MatchFor<this>): MethodSignatureData | undefined {
    return (match.data.signature ??= this.computeSignature(match))
  }

  /**
   * Process the matched `signature` sub-match into a flattened `MethodSignatureData`: runs `processSignature()`
   * then joins `methodBits`/`syntaxBits` into final `methodName`/`syntax` strings.
   * - Bails (`undefined`) if `signature` didn't match at all -- e.g. a quoted-signature parse failed upstream.
   * - `signature` is a REQUIRED group on every `MethodDefinition` subclass (`to_do_something`,
   *   `create_animation`, `quoted_type_expression`), but `Groups` is generic here so TS can't see that
   *   structurally -- cast once.
   * - SIDE EFFECT: mutates (and returns) the `method_signature` match's OWN `data` object in place --
   *   `processSignature()` splices its `args`/`methodBits`/`syntaxBits` -- so this must run exactly once per
   *   match.  `getSignature()`'s `??=` caching is what guarantees that.
   */
  private computeSignature(match: P.MatchFor<this>): MethodSignatureData | undefined {
    const signatureMatch = (match.groups as { signature?: P.Match }).signature
    if (!(signatureMatch instanceof P.Match)) return undefined
    const signature = this.processSignature(
      match.groups as P.MatchGroups,
      signatureMatch.data as MethodSignatureData,
      match.scope
    )
    signature.methodName = signature.methodBits.join("_")
    signature.syntax = signature.syntaxBits.join(" ")
    return signature
  }

  /**
   * Build the `MethodScope` for the method body.
   * - Adds `args` as scope variables, each with its datatype.
   * - When `processSignature()` set `instanceType`, aliases `it` to `this` via `mapItTo`/`thisVar` --
   *   both of that type, e.g. `Card`.
   * - SIDE EFFECT: adds `extraVars` (e.g. a `with_props_arg`'s prop names, or the promoted type's own
   *   var-name alias) directly onto the new scope's `variables`.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { methodName, args, extraVars, instanceType, valueKindOf } = this.getSignature(match)!
    // Generic `Groups` keeps `MatchFor<this>` from narrowing to a plain `P.Match` -- cast once.
    const declaredBy = match as P.Match
    // a value kind's phrase:  `it` / `the rank` are its argument, the value -- see `MethodSignatureData.valueKindOf`
    if (valueKindOf && instanceType) {
      const datatype = SP.typeName(valueKindOf)
      return new P.MethodScope({
        parentScope: match.scope,
        name: methodName,
        args: [new P.ScopeVariable({ name: instanceType, datatype })],
        mapItTo: instanceType,
        itDatatype: datatype,
        declaredBy
      })
    }
    const methodScope = new P.MethodScope({
      parentScope: match.scope,
      name: methodName,
      // each keeps its type, e.g. `Pile` for `(a pile)`, `text` for `(x as text)`
      args: args.map((arg) => new P.ScopeVariable({ name: arg.name, datatype: MethodDefinition.argDatatype(arg) })),
      thisVar: instanceType,
      mapItTo: instanceType && "this",
      itDatatype: instanceType && SP.typeName(instanceType),
      declaredBy
    })

    // add other random variables
    if (extraVars.length) {
      methodScope.variables.add(
        ...extraVars.map((it) => (typeof it === "string" ? { name: it, declaredBy } : { ...it, declaredBy }))
      )
    }
    return methodScope
  }

  /**
   * The method `match` defines:  an instance method of `instanceType` if it has one, else a loose function.
   * - Reads the signature `getSignature()` cached while parsing -- pure, like `getAST()`.
   */
  getDeclaration(match: P.MatchFor<this>): P.Declaration | undefined {
    const signature = (match.data as Partial<MethodDefinitionData>).signature
    const nameMatch = (match.groups as { signature?: P.Match }).signature
    if (!signature || !nameMatch) return undefined
    return {
      kind: signature.instanceType ? "method" : "function",
      name: nameMatch.inputText.trimEnd(),
      nameMatch,
      of: signature.instanceType,
      detail: signature.methodName && `${P.JSWriter.instance.nameOf(signature.methodName)}()`
    }
  }

  /**
   * SIDE EFFECT: registers the generated call-site rule (`getRule()`) onto `scope.parser`,
   * making the new syntax immediately usable after this definition -- and its record (`addMethod()`).
   */
  mutateScope(match: P.MatchFor<this>): void {
    this.getRule(match)
    this.addMethod(match)
  }

  /**
   * SIDE EFFECT:  now our body has parsed, record what the method returns on its record --
   * `P.ScopeMethod.returns`, which a call's `datatype` is.  See `getReturnedDatatype()`.
   * - Journaled.  Returns it, so `BlockLine.reparseBody()` can tell when an edit changes it.
   */
  mutateScopeFromBody(match: P.Match): string | undefined {
    const method = (match.data as MethodDefinitionData).scopeMethod
    const returns = this.getReturnedDatatype(match)
    if (method && method.returns !== returns) P.ParseJournal.assign(match.scope.parser?.journal, method, { returns })
    return returns
  }

  /**
   * Record the method `match` defines as a `P.ScopeMethod`, so a call knows what it returns, and editors what it takes:
   * - its words
   * - its parameters, with their types
   * - its owner
   * - A method of a type this project declares:  in that type's `methods`.
   * - Else in the project's `methods`, with `of` saying whose:  a free function,
   *   or a method of a type from elsewhere, e.g. `Thing` or an import.
   *   - Why:  so the project's journal can take it back.
   *     A built-in or imported type's lists belong to every project using it.
   * - Through `ScopeList.add()`:  journaled, and noted as what `match` declared -- see `SP.SpellDeclarations`.
   */
  addMethod(match: P.MatchFor<this>): void {
    const { methodName } = this.getSignature(match)!
    if (!methodName) return
    // Generic `Groups` keeps `MatchFor<this>` from narrowing to a plain `P.Match` -- cast once.
    const declaredBy = match as P.Match
    const project = declaredBy.getScopeOfType(P.RootScope) as P.RootScope | undefined
    const { type, of, params } = this.getOwnerAndParams(match)
    const record: P.ScopeMethodProps = {
      name: methodName,
      asWritten: (match.groups as { signature?: P.Match }).signature?.inputText.trimEnd(),
      params,
      of,
      declaredBy
    }
    const [added] =
      type && type.parentScope === project ? type.methods.add(record) : (project?.methods.add(record) ?? [])
    match.data.scopeMethod = added
  }

  /**
   * What the method `match` defines takes -- what its `P.ScopeMethod` record and its call rule both hold:
   * - `type`, `of`:  the type it's ON -- its record, if known, and its name
   * - `params`:  its parameters, each with its datatype if the signature says
   * - A lookup:  call it from `mutateScope()`.
   */
  getOwnerAndParams(match: P.MatchFor<this>): { type?: P.TypeScope; of?: string; params: P.ScopeParam[] } {
    const { args, instanceType } = this.getSignature(match)!
    const type = instanceType ? match.scope.types?.get(instanceType) : undefined
    return {
      type,
      of: type?.name ?? (instanceType && typeCase(instanceType)),
      params: args.map((arg) => MethodDefinition.paramOf(arg))
    }
  }

  /**
   * Record of method `name`:  of the type `datatype` names (or a super-type), else a free function.
   * - `undefined` if none known.  See `addMethod()`.
   * - A lookup:  call it WHILE PARSING.
   */
  static findMethod(scope: P.Scope, name: string, datatype: P.Datatype | undefined): P.ScopeMethod | undefined {
    const type = scope.getType(datatype)
    if (type) {
      const member = type.getMember(name)
      if (member instanceof P.ScopeMethod) return member
      // a method of a type from elsewhere, recorded in the project -- see `addMethod()`
      const recorded = scope.methods?.get(name)
      return recorded?.of && type.isA(recorded.of) ? recorded : undefined
    }
    const recorded = datatype ? undefined : scope.methods?.get(name)
    return recorded && !recorded.of ? recorded : undefined
  }

  /**
   * Register the CALL SITE rule directly onto `match.scope.parser` -- called by `mutateScope()`, this is
   * what makes `notify 1`, `card.play()`, `card is a bug`, etc. parseable after their
   * `to`/`animation`/quoted definitions.
   * - `asPostfixExpression`/`asInfixExpression` (set by `QuotedTypeExpression.processSignature()`) register
   *   a `MethodPostfixRule`/`MethodInfixRule`.
   * - Otherwise registers a `DynamicMethodRule`, aliased `"statement"` when
   *   `asTest` (so it can't be used as an expression), else `["statement", "expression"]`.
   * - Each is `specialize()`d with the generated method's name as `output`, which it works out the rest from,
   *   plus `alias`, and the owner `of` and `params` it checks arguments against -- see `getOwnerAndParams()`.
   *   So the definition is just `{ syntax }`, as for every other spell rule,
   *   and a project's declarations can rebuild it elsewhere.
   * - Registers through `scope.addRule(RuleClass, definition)`, which puts the rule on the scope's parser and
   *   records the class + definition on the scope itself -- these generated rules MUST keep their alias so the
   *   parser finds them by category (`statement`/`expression`/`expression_suffix`) on the very next line,
   *   and the recorded pair is what lets a scope export the methods it defined.
   */
  getRule(match: P.MatchFor<this>): void {
    const { asTest } = match.groups as { asTest?: P.Match }
    const signature = this.getSignature(match)!
    const { methodName = "", syntax = "", asPostfixExpression, asInfixExpression, valueKindOf } = signature
    const { scope } = match
    // Generic `Groups` keeps `MatchFor<this>` from narrowing to a plain `P.Match` -- cast once.
    const declaredBy = match as P.Match

    const output = methodName
    const { of, params } = this.getOwnerAndParams(match)
    if (asPostfixExpression) {
      const declared = valueKindOf ? { output, of, staticOf: valueKindOf } : { output, of }
      scope.addRule(MethodPostfixRule.specialize(declared), { syntax }, declaredBy)
      return
    }
    if (asInfixExpression) {
      scope.addRule(MethodInfixRule.specialize({ output, of, params }), { syntax }, declaredBy)
      return
    }
    const alias = asTest ? "statement" : ["statement", "expression"]
    scope.addRule(DynamicMethodRule.specialize({ output, alias, of, params }), { syntax }, declaredBy)
  }

  /** If `signature.props` return `DestructuredAssignment` to pull those props into scope. */
  getPropsAssignment(match: P.MatchFor<this>): P.ASTDestructuredAssignment | undefined {
    const { props } = this.getSignature(match)!
    if (!props) return undefined
    return new P.ASTDestructuredAssignment(match, {
      // `props` argument will be the last thing in args
      thing: new P.ASTVariableExpression(match, { name: "props" }),
      variables: props,
      isNewVariable: true
    })
  }

  /**
   * Build the AST for a method DEFINITION: the `P.ASTMethodDefinition` itself, and (depending
   * on `instanceType`/`asTest`/`asPostfixExpression`) either a `PropertyDefinition` on the type's prototype
   * or a loose function/`test(...)` wrapper.
   * - `asTest`: SIDE EFFECT -- rewrites the body to `echoInTests`-wrap every top-level statement/expression
   *   (via `EchoInvocation`) so test output shows what ran, unless a node opts out with `echoInTests ===
   *   false`; also wraps the whole thing in a `test(...)` call instead of a bare function when there's no
   *   `instanceType`.
   * - `props`: SIDE EFFECT -- unshifts a `DestructuredAssignment` (from `getPropsAssignment()`) onto the
   *   START of the body so prop variables are in scope before the rest of the method runs.
   * - `asAnimation`: SIDE EFFECT -- makes the method `async` and wraps its body in `StartProcessInvocation`
   *   (`exclusive: true`) / `try { ... } finally { StopProcessInvocation }`.
   * - `instanceType` set: emits a `PropertyDefinition` for `Type` -- a getter when `asPostfixExpression`,
   *   else a method.  No `instanceType`: emits a loose function, or (when
   *   `asTest`) a loose function whose body is itself a `test(...)` call.
   */
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { asTest, asAnimation } = match.groups as {
      asTest?: P.Match
      asAnimation?: P.Match
    }
    const signature = this.getSignature(match)!
    const { methodName = "", args, props, instanceType, asPostfixExpression } = signature
    // what it declared is said by its `/*! SPELL: DECLARES` comment -- see `SP.SpellDeclarations.commentFor()`
    const output: Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine> = []

    const method = new P.ASTMethodDefinition(match, {
      methodName,
      args,
      // body's `.AST` is generically typed `ASTNode`, but is always a
      // StatementBlock/Statement/Expression by construction of block / inline-statement parsing.
      body: this.getBody(match)?.AST as P.ASTStatementBlock | P.ASTStatement | P.ASTExpression | undefined
    })

    if (asTest) {
      // HACK: echo all non-console / non-expect lines inside the test so we can tell what's going on!
      const statements: Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine> = []
      method.body.statements?.forEach((line) => {
        // `echoInTests` is only declared on some AST node subclasses (e.g. `EchoInvocation`, `StatementGroup`),
        // not on the shared `Statement`/`Expression` base -- read it duck-typed here.
        const echoInTests = (line as unknown as { echoInTests?: boolean }).echoInTests
        if ((line instanceof P.ASTStatement || line instanceof P.ASTExpression) && echoInTests !== false) {
          statements.push(
            new P.ASTEchoInvocation(line.match, { methodName: "echoTestAction", expression: line.match.value })
          )
        }
        statements.push(line)
      })
      method.body.statements = statements
    }

    // Add props assignment to START of method body
    if (props) {
      const propsAssignment = this.getPropsAssignment(match)
      if (propsAssignment) (method.body.statements ??= []).unshift(propsAssignment)
    }

    if (asAnimation) {
      method.async = true
      method.body = new P.ASTStatementBlock(match, {
        statements: [
          new P.ASTStartProcessInvocation(match, { name: methodName, exclusive: true }),
          new P.ASTTryCatchBlock(match, {
            body: method.body || new P.ASTStatementBlock(match),
            finallyBlock: new P.ASTStopProcessInvocation(match, { name: methodName })
          })
        ]
      })
    }

    if (instanceType) {
      // a value kind's phrase:  its static method, given the value -- see `MethodSignatureData.valueKindOf`
      if (asPostfixExpression && signature.valueKindOf) {
        const value = new P.ASTVariableExpression(match, { name: instanceType })
        const { body } = method
        output.push(
          new P.ASTStaticMethod(match, {
            type: signature.valueKindOf,
            name: methodName,
            method: new P.ASTMethodDefinition(match, { args: [value], body, datatype: "choice" })
          })
        )
      } else if (asPostfixExpression) {
        // console.warn("APE:", method)
        output.push(
          new P.ASTPropertyDefinition(match, {
            type: typeCase(instanceType),
            property: methodName,
            get: method
          })
        )
      } else {
        output.push(
          new P.ASTPropertyDefinition(match, {
            type: typeCase(instanceType),
            property: methodName,
            method
          })
        )
      }
    }
    // No instance type: create as a loose function -- `export`ed at file level, so another project can import it.
    // NOTE: not a scope LOOKUP, just where it was written -- as `ASTAssignmentStatement.exportVar` decides.
    else if (asTest) {
      output.push(
        new P.ASTMethodDefinition(match, {
          methodName,
          exported: isTopLevel(match.scope),
          body: new P.ASTCoreMethodInvocation(match, {
            methodName: "test",
            args: [new P.ASTQuotedExpression(match, signature.methodBits.join(" ")), method]
          })
        })
      )
    } else {
      method.exported = isTopLevel(match.scope)
      output.push(method)
    }

    return new P.ASTStatementGroup(match, { statements: output })
  }

  /**
   * Datatype method argument `arg` was declared with, e.g. `Card` for `(a card)` -- `undefined` if none.
   * - `ASTNode.datatype` may be a `RegExp` constructor, for a regex literal:  never an argument's.
   */
  private static argDatatype(arg: P.ASTVariableExpression): P.Datatype | undefined {
    const { datatype } = arg
    return typeof datatype === "string" ? datatype : undefined
  }

  /** Parameter record for method argument `arg`:  its name, and its datatype if it was declared with one. */
  private static paramOf(arg: P.ASTVariableExpression): P.ScopeParam {
    const datatype = MethodDefinition.argDatatype(arg)
    return datatype ? { name: arg.name, datatype } : { name: arg.name }
  }
}

/**
 * Props bag accepted by `MethodDefinition`.
 * - `inlineInitialType`:  first arg's type is part of the method name, e.g. `to draw a card` => `Card.draw()`.
 */
export type MethodDefinitionProps = Prettify<SpellStatementProps & { inlineInitialType?: boolean }>

/** What `MethodDefinition` (and subclasses) stash in `match.data`, on top of whatever they declare via `MatchData`. */
type MethodDefinitionData = {
  /** Cached result of `getSignature()` -- see that method. */
  signature?: MethodSignatureData
  /** Record of the method it declared -- see `addMethod()`. */
  scopeMethod?: P.ScopeMethod
}

/**
 * Little words a method's name may not END a phrase with, where its receiver's type was:
 * `MethodDefinition.processSignature()` keeps the type's name after one (epic `output-targets`, Q44).
 * - `to update the total of (a calculator)` => `update_the_total_of_calculator`
 * - `to set the operator of (a calculator) to (op as text)` => `set_the_operator_of_calculator_to_$op`
 * - Prepositions only:  a verb or noun before the receiver reads fine without it, `turn_face_up`, `move_to_$pile`.
 *   So do a verb's own little words (`up`, `over`, `out`, `off`, `down`):  `to pick up (a card)` => `pick_up`.
 */
const DANGLING_WORDS =
  /^(of|to|from|in|into|on|onto|at|by|for|with|without|before|after|about|under|through|between|within|upon|against|toward|towards)$/i

/** Is `scope` a file's (or project's) top level, where a definition is `export`ed? */
function isTopLevel(scope: P.Scope): boolean {
  return scope instanceof P.FileScope || scope instanceof P.ProjectScope
}
