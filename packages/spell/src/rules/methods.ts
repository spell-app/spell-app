import { isNode } from "browser-or-node"

import { instanceCase, typeCase, proto } from "$/util"
import { P } from "$/parser"
import { SP } from "$/spell"
// Import directly to avoid circular import
import { SpellParser } from "$/spell/SpellParser"
import { Priority } from "./rules.types"
import { SpellStatement, type SpellStatementProps } from "./Statement"
import { SpellType } from "./types"
import { SpellIdentifier } from "./variables"
import {
  PostfixOperatorSuffix,
  InfixOperatorSuffix,
  Negatable,
  Precedence,
  SuffixLeft,
  type SpellExpressionProps
} from "./expressions"

/**
 * Rule module for dynamic method definitions (`to foo ...`, `animation ...`) and their call sites, plus
 * quoted ad-hoc expressions on a type (`a thing "..." if`), and the method-signature/method-arg building
 * blocks they all share.
 * - e.g. signature shapes handled by `method_signature`:
 *   - `to foo the bar`
 *   - `to foo (a thing)`
 *   - `to foo (a thing) in (a thing)`
 *   - `to foo a thing in a pile` -- paren-free:  `a` / `an` + a KNOWN type is an argument (`bare_type_arg`)
 *   - `to foo (bar)`
 *   - `to foo the (bar as text)`
 *   - `to foo (with bar)`
 *   - `to foo (with a bar)`
 *   - `to foo (with baz = "baz")`
 *   - `to foo (with bar as text)`
 *   - `to foo (with bar and baz = "baz" and bong as text)`
 */
export const methods = new SpellParser({ module: "methods" })

////////////////
// ## Method-signature data types
////////////////

////////////////
// ## `DynamicMethodRule` base class
//    e.g. "notify 1", after "to notify (message): ..." defined it
////////////////

/**
 * Rule `constructor` for a plain (non-instance, non-operator) dynamically-defined method's CALL SITE,
 * e.g. matching `notify 1` after `to notify (message): ...` defined it.
 * - `MethodDefinition.getRule()` registers `DynamicMethodRule.specialize({ output, alias, of, params })`
 *   for every generated method that isn't a postfix/infix expression -- see `specialize()`.
 * - TYPED:  a call whose argument is KNOWN to be the wrong type isn't ours,
 *   so `put the chip on the pot` finds Chip's `put`, not Card's -- see `parse()`.
 * - As a statement, its LAST argument is a whole expression:  `notify x + y` => `notify(x + y)`.
 *   Inside an expression, an operand:  `if double x is 4` => `double(x) == 4`.  See `operandInExpressions`.
 * - NOTE: not made a generic pass-through like `MethodDefinition` -- every dynamically-generated rule built
 *   on top of it uses the same `thisArg`/`callArgs`/`props` syntax convention, so there's no subclass that
 *   needs a different `Groups`/`MatchData`.
 */
export class DynamicMethodRule extends SpellStatement<"thisArg?|callArgs[]?|props?", DynamicMethodData> {
  @proto static importableAs = "method_call"
  @proto static operandInExpressions = true

  /** Generated method name to invoke -- fixed per rule by `specialize()`, shared by every match of it. */
  declare methodName: string
  @proto static methodName?: string
  /** Type the method is ON, e.g. `Card` -- `undefined` for a free function.  See `parse()`. */
  declare thisType: P.Datatype | undefined
  /** Datatype of each `callArgs` slot, in order -- `undefined` where the signature doesn't say.  See `parse()`. */
  declare paramTypes: Array<P.Datatype | undefined> | undefined
  /** TYPE-ONLY: props `parser.addRule()` accepts for this rule -- see `P.Rule`'s `Props`. */
  declare readonly Props: DynamicMethodRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: MethodRuleDeclared & { alias?: string | string[] }
  /**
   * Call to generated method `output`, e.g. `play_fizzbuzz` -- also our `ruleName`.
   * - `of` / `params`:  the method's owner and parameters, as its `P.ScopeMethod` record says --
   *   our `thisType` and `paramTypes`, which `parse()` checks arguments against.
   * - What a project's `SPELL: DECLARES` comment holds for us -- see `SP.SpellDeclarations`.
   *   `of` / `params` are the method record's, in the same comment:  loading hands us the whole of it.
   */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { output, alias, of, params } = declared as (typeof DynamicMethodRule)["SpecializeWith"]
    const statics: P.RuleStatics<DynamicMethodRule> = {
      ruleName: output,
      methodName: output,
      alias,
      thisType: of,
      paramTypes: params?.map((param) => param.datatype)
    }
    return super.specialize(statics, declared) as unknown as T
  }

  /** What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`. */
  static declarationProps({ output, alias }: (typeof DynamicMethodRule)["SpecializeWith"], syntax: string | undefined) {
    return { syntax, output, alias }
  }

  /**
   * Match, unless an argument is the wrong type.
   * - Then note the method we call, while we can look it up (`MethodDefinition.findMethod()`):
   *   on `thisArg`'s type, if it has one, else a free function.
   * - Wrong type:  KNOWN, and can't be what the method takes (`scope.couldBeA()`),
   *   e.g. a `Chip` for Card's `put (a card) on (a pile)`, or a `Deck` for its pile.
   * - Unknown always fits, so untyped code parses as it did.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match || !this.argumentsFit(match)) return undefined
    match.data.method = MethodDefinition.findMethod(scope, this.methodName, match.groups.thisArg?.datatype)
    return match
  }

  /** Could each of `match`'s arguments be what we take?  See `parse()`. */
  argumentsFit(match: P.MatchFor<this>): boolean {
    const { scope } = match
    const { thisArg, callArgs = [] } = match.groups
    if (thisArg && !scope.couldBeA(thisArg.datatype, this.thisType)) return false
    return callArgs.every((arg, index) => scope.couldBeA(arg.datatype, this.paramTypes?.[index]))
  }

  /** What the method returns, if known -- see `P.ScopeMethod.returns`. */
  getDatatype(match: P.MatchFor<this>): P.Datatype | undefined {
    return match.data.method?.returns
  }

  /** Normalize `callArgs` to an array -- a single arg's `{callArgs:expression}` match isn't already one. */
  getGroupsForMatch(match: P.MatchFor<this>): DynamicMethodRuleGroups {
    const groups = super.getGroupsForMatch(match) as DynamicMethodRuleGroups
    const { callArgs } = groups
    if (callArgs && !Array.isArray(callArgs)) groups.callArgs = [callArgs]
    return groups
  }

  /**
   * Build the `P.ASTMethodInvocation` (loose function call) or `P.ASTScopedMethodInvocation` (instance
   * method call, when `thisArg` matched) for one call site.
   * - `props` (from a `with_props_arg`) is always appended as the LAST arg -- see the NOTE below on the
   *   required-args assumption this depends on.
   */
  getAST(match: P.MatchFor<this>): P.ASTMethodInvocation | P.ASTScopedMethodInvocation {
    const { methodName } = this
    const { thisArg, callArgs, props } = match.groups
    const thing = thisArg?.AST as P.ASTExpression | undefined
    // `match.AST` is typed as the generic `ASTNode` (from `Rule.getAST()`); `callArgs`/`props` are always
    // parsed via `{callArgs:expression}` / `object_literal_properties`, so their AST is always an Expression.
    const args = (callArgs?.map((arg) => arg.AST) ?? []) as P.ASTExpression[]
    // Add `props` to the end of the args if found.
    // NOTE: This assumes that all inline arguments are REQUIRED by the syntax.
    //       If we decide to match syntax with optional args we'll need to update this.
    if (props) args.push(props.AST as P.ASTExpression)

    // if `thing` is defined, method is scoped
    if (thing) return new P.ASTScopedMethodInvocation(match, { thing, methodName, args })
    return new P.ASTMethodInvocation(match, { methodName, args })
  }
}

/** What `DynamicMethodRule` stashes on its matches. */
type DynamicMethodData = {
  /** Record of the method it calls, found while parsing -- `undefined` if none known. */
  method?: P.ScopeMethod
}

/**
 * Props bag accepted by `DynamicMethodRule`.
 * - `methodName`:  the generated method it compiles a call to
 * - `thisType` / `paramTypes`:  what it takes -- see `DynamicMethodRule.parse()`
 */
export type DynamicMethodRuleProps = Prettify<
  SpellStatementProps & {
    methodName?: string
    thisType?: P.Datatype
    paramTypes?: Array<P.Datatype | undefined>
  }
>

/** `match.groups` for `DynamicMethodRule`, once `getGroupsForMatch()` has normalized `callArgs` to an array. */
type DynamicMethodRuleGroups = P.GroupsFor<"thisArg?|callArgs[]?|props?">

////////////////
// ## `MethodPostfixRule` base class
//    e.g. "the card is face up", once 'a card "is face up" if ...' made one
////////////////

/**
 * `card is face up` -- reads a quoted method defined as a postfix expression, e.g. `card.is_face_up`.
 * - Never registered as is:  `MethodDefinition.getRule()` makes one per such method, with
 *   `MethodPostfixRule.specialize({ output })`.
 * - `isn't face up` negates through the base class -- see `Negatable`.
 * - Reads ONLY its statics, so a project's declarations can rebuild it elsewhere -- see `P.Rule.specialize()`.
 */
export class MethodPostfixRule extends PostfixOperatorSuffix {
  @proto static importableAs = "method_postfix"
  /** A user's alias wins over a built-in suffix matching the same words, e.g. `is face up` over `is {x}`. */
  @proto static priority = Priority.userDeclared
  @proto static precedence = Precedence.comparison

  /** Generated method to read, e.g. `is_face_up`. */
  declare methodName: string
  /** A value kind's phrase:  the kind whose static method it calls, e.g. `Rank` -- see `MethodRuleDeclared`. */
  declare staticOf: string | undefined
  /** Our method's owner, e.g. `Card`, if known -- see `parse()`. */
  declare thisType: P.Datatype | undefined
  /** TYPE-ONLY: what `specialize()` accepts for this rule -- see `P.RuleStatics`. */
  declare readonly Props: MethodOperatorRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: MethodRuleDeclared
  /** Reads generated method `output`, e.g. `is_face_up` -- also our `ruleName`.  See `DynamicMethodRule.specialize()`. */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { output, staticOf, of } = declared as MethodRuleDeclared
    const statics: P.RuleStatics<MethodPostfixRule> = { ruleName: output, methodName: output, staticOf, thisType: of }
    return super.specialize(statics, declared) as unknown as T
  }

  /**
   * Match, unless what we follow is KNOWN, and can't be our method's owner (`thisType`), e.g. a deck's
   * `a rank "is a face card"` on `the card is a face card` -- see `SuffixLeft`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    if (!SuffixLeft.couldBeA(scope, this.thisType)) return undefined
    return super.parse(scope, tokens)
  }

  /** What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`. */
  static declarationProps({ output, staticOf }: MethodRuleDeclared, syntax: string | undefined) {
    return staticOf ? { syntax, output, staticOf } : { syntax, output }
  }

  compileASTExpression(match: P.Match, { lhs }: OperatorOperands): P.ASTExpression {
    // a value kind's phrase:  `Rank.is_a_face_card(card.rank)`
    if (this.staticOf) {
      const thing = new P.ASTTypeExpression(match, { name: this.staticOf })
      return new P.ASTScopedMethodInvocation(match, { thing, methodName: this.methodName, args: [lhs!] })
    }
    return new P.ASTPropertyExpression(match, {
      object: lhs!,
      property: new P.ASTPropertyLiteral(match, this.methodName)
    })
  }
}

/** Props bag accepted by `MethodPostfixRule` / `MethodInfixRule` -- the generated method, and what it takes. */
type MethodOperatorRuleProps = Prettify<
  SpellExpressionProps & {
    methodName: string
    paramTypes?: Array<P.Datatype | undefined>
    staticOf?: string
    thisType?: P.Datatype
  }
>

/**
 * What a generated method's call-site rule is declared with -- see `DynamicMethodRule.specialize()`.
 * - `output`:  the method's name in compiled JS, e.g. `play_fizzbuzz`
 * - `of` / `params`:  its owner and parameters, as its `P.ScopeMethod` record --
 *   loading passes the whole declaration, which holds the record's too
 */
type MethodRuleDeclared = { output: string; of?: string; params?: P.ScopeParam[]; staticOf?: string }

////////////////
// ## `MethodInfixRule` base class
//    e.g. "the card nerds out with another", once 'a card "nerds out with (another)" ...' made one
////////////////

/**
 * `card nerds out with thing` -- calls a quoted method defined as an infix expression,
 * e.g. `card.nerds_out_with_$another(thing)`.
 * - Never registered as is:  `MethodDefinition.getRule()` makes one per such method, with
 *   `MethodInfixRule.specialize({ output })`.
 * - Negates through the base class -- see `Negatable`.
 * - Reads ONLY its statics, so a project's declarations can rebuild it elsewhere -- see `P.Rule.specialize()`.
 */
export class MethodInfixRule extends InfixOperatorSuffix {
  @proto static importableAs = "method_infix"
  /** A user's alias wins over a built-in suffix matching the same words -- see `MethodPostfixRule`. */
  @proto static priority = Priority.userDeclared
  @proto static precedence = Precedence.comparison
  @proto static parenthesize = true

  /** Generated method to call, e.g. `nerds_out_with_$another`. */
  declare methodName: string
  /** Datatype of its one parameter, if the signature says -- see `parse()`. */
  declare paramTypes: Array<P.Datatype | undefined> | undefined
  /** Our method's owner, e.g. `Card`, if known -- see `parse()`. */
  declare thisType: P.Datatype | undefined
  /** TYPE-ONLY: what `specialize()` accepts for this rule -- see `P.RuleStatics`. */
  declare readonly Props: MethodOperatorRuleProps

  /** TYPE-ONLY: what `specialize()` takes -- see `P.SpecializeWith`. */
  declare static readonly SpecializeWith: MethodRuleDeclared
  /**
   * Calls generated method `output` -- also our `ruleName`.
   * - Its `of` / `params` are our `thisType` / `paramTypes`.  See `DynamicMethodRule.specialize()`.
   */
  static specialize<T extends AbstractClass<P.Rule>>(this: T, declared: P.SpecializeWith<T>): T {
    const { output, of, params } = declared as MethodRuleDeclared
    const statics: P.RuleStatics<MethodInfixRule> = {
      ruleName: output,
      methodName: output,
      thisType: of,
      paramTypes: params?.map((param) => param.datatype)
    }
    return super.specialize(statics, declared) as unknown as T
  }

  /**
   * Match, unless a side is KNOWN to be the wrong type -- as `DynamicMethodRule.parse()`.
   * - Our left side, when `CompoundExpression` knows it:  see `SuffixLeft`.
   */
  parse(scope: P.Scope, tokens: P.Token[]): P.Match | undefined {
    if (!SuffixLeft.couldBeA(scope, this.thisType)) return undefined
    const match = super.parse(scope, tokens)
    const rhs = (match?.groups as { expression?: P.Match } | undefined)?.expression
    if (match && rhs && !scope.couldBeA(rhs.datatype, this.paramTypes?.[0])) return undefined
    return match
  }

  /** What we write into our statement's `SPELL: DECLARES` comment -- see `P.Rule.declarationProps()`. */
  static declarationProps({ output }: MethodRuleDeclared, syntax: string | undefined) {
    return { syntax, output }
  }

  compileASTExpression(match: P.Match, { lhs, rhs }: OperatorOperands): P.ASTExpression {
    // `lhs`/`rhs` are always populated for an `InfixOperatorSuffix`.
    return new P.ASTScopedMethodInvocation(match, {
      thing: lhs!,
      methodName: this.methodName,
      args: [rhs!]
    })
  }
}

////////////////
// ## `MethodDefinition` base class
//    e.g. "to notify (message): print the message"
////////////////

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
      detail: signature.methodName && `${signature.methodName}()`
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

/** Operands passed to `compileASTExpression()` -- matches the (unexported) type of the same name in `./expressions`. */
type OperatorOperands = {
  /** Matched operator token, e.g. `is`/`isn't` -- passed to `shouldNegateOutput()`. */
  operator: P.Match
  /** Left-hand expression -- always populated for `PostfixOperatorSuffix`/`InfixOperatorSuffix`. */
  lhs?: P.ASTExpression
  /** Right-hand expression -- always populated for `InfixOperatorSuffix`, never for a postfix suffix. */
  rhs?: P.ASTExpression
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

////////////////
// ## `method_keyword` rule
//    e.g. "foo" in "to foo the bar"
////////////////

/**
 * One bare word in a method's keyword phrase, e.g. `foo`, `the`, `bar` in `to foo the bar`.
 * - `method` contributes the (dash-normalized) word to the signature's `methodBits`; `syntax` contributes
 *   its raw, unmodified text to the rule's rulex `syntax`.
 */
class MethodKeyword extends P.Pattern<never, MethodArgData> {
  @proto static pattern = /^[a-zA-Z][\w-]*$/
  @proto static highlightAs: P.HighlightKind = "function"

  /** Convert dashes to underscores so e.g. `at-rest` becomes `at_rest` in the generated method name. */
  mapValue<T = string>(value: string): T {
    return `${value}`.replace(/-/g, "_") as T
  }

  /** Stash this keyword's contribution to the signature (`method`/`syntax` bits) on `match.data`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    match.data.keyword = match
    match.data.method = match.value
    match.data.syntax = match.raw
    return match
  }
}
methods.addRule(MethodKeyword)

////////////////
// ## `var_method_arg` rule
//    e.g. "message" in "(message)"
////////////////

/**
 * Untyped variable inside parens, e.g. `(message)` in `to notify (message): ...`.
 * - `method` prefixes the var name with `$` so it's distinguishable from a keyword bit in the generated
 *   method name, e.g. `notify_$message`.
 * - `syntax` always contributes `{callArgs:expression}` -- the call-site value is parsed as a plain
 *   expression.
 * - It says nothing of what it holds, so it asks (epic `output-targets`, Q24):  a warning,
 *   e.g. `Say what "digit" is, e.g. "(digit as text)"` -- see `typed_method_arg`.
 */
class VarMethodArg extends SpellIdentifier<MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]
  @proto static highlightAs: P.HighlightKind = "parameter"

  /** Stash this arg's contribution (`method` / `syntax` / `arg`) in `match.data`, and ask for its type. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { data } = match
    data.variable = match
    data.method = `$${match.value}`
    data.syntax = "{callArgs:expression}"
    data.arg = new P.ASTVariableExpression(match, { name: match.value, type: "argument" })
    const words = match.raw ?? `${match.value}`
    const example = `(${words} as ${SP.SpellWarnings.exampleType(scope, words)})`
    SP.SpellWarnings.note(match, `Say what "${words}" is, e.g. "${example}"`)
    return match
  }
}
methods.addRule(VarMethodArg)

////////////////
// ## `valued_var_method_arg` rule
//    e.g. `message = "Really?"`
////////////////

/**
 * Variable arg with a default value, e.g. `(message = "Really?")` in
 * `to notify (message = "Really?"): ...`.
 * - Accepts `=`, `is`, `of`, `as` or `set to` before the default expression -- all synonyms here for
 *   "defaults to".
 * - `method`/`syntax` are the same as `var_method_arg`'s (`$name` / `{callArgs:expression}`) -- the default
 *   value only affects the generated function parameter (`arg.default`), not the call syntax.
 */
class ValuedVarMethodArg extends SpellStatement<"identifier|value", MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { identifier, value } = match.groups
    match.data.variable = identifier
    match.data.method = `$${identifier.value}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = new P.ASTVariableExpression(match, {
      name: identifier.value,
      default: value.AST as P.ASTExpression,
      type: "argument"
    })
    return match
  }
}
methods.addRule(ValuedVarMethodArg, {
  syntax: `{identifier} (=|is|of|as|set to) {value:expression}`
})

////////////////
// ## `type_method_arg` rule
//    e.g. "a card"
////////////////

/**
 * Bare type name inside parens, e.g. `(a card)` in `to create (a card): ...`.
 * - `method` bit uses the raw matched text (`type.raw`); `arg.name` uses `instanceCase(type.value)` --
 *   see the existing `TODO` on `method` below.
 * - When this is the FIRST type found in a `to`/`animation` signature, `MethodSignature`'s
 *   `parse()` records it in `types`, and `MethodDefinition.processSignature()` later promotes
 *   it to an instance-method receiver (`thisArg`) rather than a call argument.
 */
class TypeMethodArg extends P.Sequence<"type", MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type } = match.groups
    match.data.type = type
    // TODO: instanceCase(type.value) ???
    match.data.method = `$${type.raw}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = new P.ASTVariableExpression(match, {
      name: instanceCase(type.value),
      type: "argument",
      // what it holds, e.g. `Card` for `(a card)`
      datatype: SP.typeName(`${type.value}`)
    })
    return match
  }
}
methods.addRule(TypeMethodArg, {
  syntax: `(a|an) {type}`
})

////////////////
// ## `bare_type_arg` rule
//    e.g. "a card" in "to give a card to a pile"
////////////////

/**
 * A KNOWN type after `a` / `an`, with no parens, in a method's signature:  a parameter, as `(a card)` is.
 * - `to give a card to a pile` ~== `to give (a card) to (a pile)` => `Card.give_to_$pile(pile)`.
 * - "a card" is "any card", so it's what the method takes.
 * - A word that isn't a type stays words:  `to make a mess` => `make_a_mess()`.
 *   So does anything after `the`:  `to reset the stock pile`.
 * - Read by `method_signature` exactly as `type_method_arg` is -- see `buildSignatureData()`.
 * - NOT a `method_arg`:  only `method_signature` takes it, outside parens.
 */
class BareTypeArg extends TypeMethodArg {
  @proto static alias = []
  /** Editors colour its type's word, `card`, as the parameter it names. */
  @proto static highlightAs: P.HighlightKind = "parameter"
}
methods.addRule(BareTypeArg, {
  syntax: `(a|an) {type:known_type}`
})

////////////////
// ## `typed_method_arg` rule
//    e.g. "thing as a card"
////////////////

/**
 * Variable arg with explicit type, e.g. `(thing as a card)` in `to show (thing as a card): ...`.
 * - `arg` keeps the ORIGINAL variable name (`thing`), not the type name -- contrast with
 *   `type_method_arg`, which has no variable and names the arg after the type instead.
 * - `arg.datatype` records what it holds, in spell's words (`Card`, `text`) -- its scope variable's `datatype`.
 * - `method`/`syntax` match `var_method_arg`'s (`$name` / `{callArgs:expression}`) -- the type only
 *   annotates the arg, it doesn't change the generated method name or call syntax.
 */
class TypedMethodArg extends P.Sequence<"identifier|type", MethodArgData> {
  @proto static alias = ["method_arg", "simple_method_arg"]

  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { identifier, type } = match.groups
    // what it holds, in spell's words, e.g. `text` for `(x as a string)`
    const arg = new P.ASTVariableExpression(match, {
      name: identifier.value,
      type: "argument",
      datatype: SP.typeName(`${type.value}`)
    })
    match.data.variable = identifier
    match.data.type = type
    match.data.method = `$${identifier.value}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = arg
    return match
  }
}
methods.addRule(TypedMethodArg, {
  syntax: `{identifier} as (a|an)? {type}`
})

////////////////
// ## `with_props_arg` rule
//    e.g. "with bar and baz = \"baz\" and bong as text"
////////////////

/**
 * `with`-prefixed prop list, e.g. `(with bar and baz = "baz" and bong as text)` in
 * `to foo (with bar and baz = "baz" and bong as text)`.
 * - Only aliases `method_arg`, not `simple_method_arg` -- can't nest a `with_props_arg` inside another
 *   one.
 * - Each comma/`and`-separated item is itself a `simple_method_arg` (`var_method_arg`,
 *   `valued_var_method_arg`, `typed_method_arg`); their individual `arg`s become the destructured `props`
 *   variables.
 * - `method` is `undefined`: prop names don't appear in the generated method name.
 * - `syntax` always contributes an OPTIONAL trailing `(with {props:object_literal_properties})?` --
 *   calling without `with ...` is valid, and the generated `props` param defaults to `{}`.
 * - `arg` is a single synthetic `props` argument (defaulting to `{}`); `MethodDefinition.
 *   getPropsAssignment()` destructures `props` back out into the individual prop variables at the top of
 *   the method body.
 * - `match.data.props` (an array of `P.ASTVariableExpression`) is also what `events.ts`'s `on` rule reads
 *   directly off a matched `{props:with_props_arg}` group -- see `on.getNestedScopeForMatch()`/`getAST()`.
 */
export class WithPropsArg extends P.Sequence<never, MethodArgData> {
  @proto static alias = ["method_arg"]

  /** Map each comma/`and`-joined item's `arg` into `props`, and build the synthetic `props` catch-all arg. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { items } = match.matched[1] as P.Match
    const props = items.map((item) => (item.data as MethodArgData).arg) as P.ASTVariableExpression[]
    match.data.items = items
    match.data.method = undefined // not part of method signature
    match.data.syntax = "(with {props:object_literal_properties})?"
    match.data.props = props
    match.data.arg = new P.ASTVariableExpression(match, {
      name: "props",
      default: new P.ASTObjectLiteral(match),
      type: "argument"
    })
    return match
  }
}
methods.addRule(WithPropsArg, {
  syntax: "with [{simple_method_arg} (,|and)]"
})

////////////////
// ## `method_signature` rule
//    e.g. "foo the (bar as a thing)"
////////////////

/**
 * Full method signature: alternating keywords and args, e.g. `foo the (bar as a thing)`, `give a card to a pile`.
 * - `({bare_type_arg}|{method_keyword}|\({method_arg}\))+`:
 *   keywords and args can appear in ANY order/mix, any number of times.
 * - The syntax requires at least one repetition, but see `parse()` for the additional keyword requirement.
 * - `a card` is an arg if `card` is a KNOWN type (`bare_type_arg`, the longer match), else two keywords.
 * - `parse()` walks the repeated items and assembles `methodBits`/`syntaxBits` (joined into
 *   `methodName`/`syntax` by `MethodDefinition.computeSignature()`), `args`, `types` (candidate
 *   instance-method receivers), `extraVars` and `props` into `match.data` -- see `MethodSignatureData`.
 */
class MethodSignature extends P.Repeat<never, MethodSignatureData> {
  /** Build `match.data`, then reject the match entirely if no keyword was found -- arg-only signatures
   *  (e.g. `to (foo)`) are invalid. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    this.buildSignatureData(match)
    // forget it if we didn't find at least one keyword
    return match.data.foundKeyword ? match : undefined
  }

  /**
   * Flatten each matched `method_arg`/`method_keyword`/`bare_type_arg` item's `data` into `match.data`.
   * - A `method_keyword` or `bare_type_arg` item holds its own data;
   *   a parenthesized `method_arg` matched 3 things (`(`, arg, `)`), so its data lives on `item.matched[1]` instead.
   * - Told apart by RULE, not length:  `a card` is 2 tokens, like a keyword pair.
   * - SIDE EFFECT: records `data.types` and their positions (`argIndex`/`methodIndex`/`syntaxIndex`)
   *   so `MethodDefinition.processSignature()` can later splice a promoted type back out of
   *   `args`/`methodBits`/`syntaxBits`.
   */
  buildSignatureData(match: P.MatchFor<this>): void {
    const data = match.data
    data.items = match.items.map(
      (item) =>
        (item.is(MethodKeyword) || item.is(BareTypeArg)
          ? item.data
          : (item.matched[1] as P.Match).data) as MethodArgData
    )
    // calculated as we run through the keywords
    data.startsWithKeyword = false // `true` if first item is a keyword.
    data.foundKeyword = false // `true` if we found at least one keyword.  arg-only signatures are invalid!
    data.methodBits = [] // method signature bits.  Converted to `methodName` string by `MethodDefinition.computeSignature()`.
    data.syntaxBits = [] // rule syntax bits.  Converted to string by `MethodDefinition.computeSignature()`.
    data.types = [] // types we found, as `{ name, varName, isSimple, argIndex, methodIndex, syntaxIndex }`
    data.args = [] // method arguments, as `P.ASTVariableExpression`s
    data.argMatches = [] // each argument's item, e.g. `(a card)` or `a card` -- for editors
    data.extraVars = [] // random extra vars we should enable (e.g. aliases for `this`)
    // calculated elsewhere
    data.props = undefined // array of P.ASTVariableExpression for `with_props_arg`
    data.methodName = undefined // full methodName from `methodBits` array, set elsewhere
    data.syntax = undefined // full method syntax, set elsewhere
    data.instanceType = undefined // type to add instance method to, set elsewhere

    // Set up the method signature and rule syntax
    // We'll get one of the following combos: keyword, type, variable, variable + type
    data.items.forEach(({ method, syntax, arg, props, keyword, type /* , variable */ }, index) => {
      // TODO: HOW to know if we should sequester type???

      // arg-only methods are not allowed
      if (keyword) {
        data.foundKeyword = true
        if (index === 0) data.startsWithKeyword = true
      }

      const varName = arg?.name

      // Convert to an instance method???
      if (type) {
        // `type` is always a `SpellType`/`Pattern` match, which always sets `.raw`.
        const typeRaw = type.raw!
        data.types.push({
          name: typeRaw,
          varName,
          isSimple: SpellType.isSimpleType(typeRaw),
          argIndex: data.args.length,
          methodIndex: data.methodBits.length,
          syntaxIndex: data.syntaxBits.length
        })
      }

      if (method) data.methodBits.push(method)
      if (syntax) data.syntaxBits.push(syntax)
      if (arg) {
        data.args.push(arg)
        // NOT a `(with ...)` clause:  its call takes it as an optional extra
        if (!props) data.argMatches.push(match.items[index]!)
      }

      // Recognize prop names in the method
      if (props) {
        data.props = props
        data.extraVars.push(...props.map((prop) => prop.name))
      }
    })
  }
}
methods.addRule(MethodSignature, {
  syntax: `({bare_type_arg}|{method_keyword}|\\( {method_arg} \\))+`
})

////////////////
// ## `quoted_method_signature` rule
//    e.g. "\"nerds out with (another as a thing)\""
////////////////

/**
 * Method signature surrounded by quotes.  A "good idea"???
 * - Re-parses the token's raw JSON string VALUE as a fresh `method_signature`, e.g. the `"nerds out with
 *   (another as a thing)"` in `a thing "nerds out with (another as a thing)" if`.
 * - `parse()` swizzles `tokens`/`matched` back onto the outer text-token match, so it behaves
 *   indistinguishably from a normal `method_signature` match to callers (e.g. `quoted_type_expression`).
 * - SIDE EFFECT: bails (`undefined`) if the recovered signature has no keyword, same rule as plain
 *   `method_signature`.
 * - Its parameters' warnings are noted again on it, about the quoted text -- see `SP.SpellWarnings.in()`.
 */
class QuotedMethodSignature extends P.TokenType {
  @proto static tokenType = P.TextToken
  @proto static highlightAs: P.HighlightKind = "function"

  /**
   * Parse the token's text as JSON to get the raw signature string, then reparse THAT as
   * `method_signature`.
   * - SIDE EFFECT: swizzles the recovered match's `tokens`/`matched` to point at the outer quoted-text
   *   token, so it reads like a normal top-level match rather than a nested one.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    const signature =
      match && (scope.parse(JSON.parse(match.value), "method_signature") as P.MatchFor<MethodSignature> | undefined)
    if (!signature || !signature.data.foundKeyword) return undefined
    // its warnings are about words in the quotes, whose positions are the string's:  shown under the quotes
    for (const { message } of SP.SpellWarnings.in(signature)) SP.SpellWarnings.note(signature, message, match)
    // Swizzle tokens & matched to reflect the original match
    signature.tokens = match.tokens
    signature.matched = [match]
    return signature
  }
}
methods.addRule(QuotedMethodSignature)

////////////////
// ## `to_do_something` rule
//    e.g. "to start the game"
////////////////

/**
 * Define a new method/statement,
 * e.g. `to foo the bar`, `to create a card`, `to create (a card)`, `to notify (message)`.
 * - Optional `test` keyword (`to test foo: ...`) marks the definition as a test method -- see
 *   `MethodDefinition.processSignature()`/`getAST()`'s `asTest` handling.
 * - `inlineInitialType` is `true`: the FIRST bare-type arg found (e.g. `(a card)` in `to create (a
 *   card)`) is promoted to an instance method on that type's prototype instead of becoming a call
 *   argument.
 * - Trailing `:` is optional so both `to foo the bar` (no body) and `to foo the bar:` (body follows)
 *   parse.
 */
class ToDoSomething extends MethodDefinition<"asTest?|signature|body?"> {
  @proto static alias = "statement"
  // promote the first captured type arg (e.g. `(a card)`) to an instance-method receiver
  @proto static inlineInitialType = true
}
methods.addRule(ToDoSomething, {
  // TODO: add tests for `test` case
  syntax: `to (asTest:test)? {signature:method_signature} :? {statement_body}?`,
  tests: [
    {
      title: "inline method signatures & variables",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
        scope.types?.add("deck")
        scope.constants?.add("up")
        scope.constants?.add("down")
      },
      tests: [
        {
          title: "keyword-only signature",
          input: "to start the game",
          js: ["export function start_the_game() {}"],
          ts: "export function startTheGame() {}"
        },
        {
          title: "keyword-only signature - `it` is not defined",
          input: "to start the game: print it",
          js: ["export function start_the_game() {}", '/* PARSE ERROR: Don\'t understand "print it" */'],
          ts: ["export function startTheGame() {}", '/* PARSE ERROR: Don\'t understand "print it" */']
        },
        {
          title: "paren-free type arg in signature:  a known type is a parameter",
          input: "to create a card",
          js: ["Card.prototype.create = function () {}"],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {}"
          ]
        },
        {
          title: "paren-free type arg in signature - it",
          input: "to create a card: print it",
          js: [`Card.prototype.create = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "paren-free type args in signature ~== parenthesized",
          input: "to give a card to a pile: set its pile to the pile",
          js: [`Card.prototype.give_to_$pile = function (pile) {`, `  this.pile = pile`, `}`],
          ts: [
            "export interface Card { giveToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.giveToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "paren-free:  a word that isn't a type stays words",
          input: "to make a mess",
          js: ["export function make_a_mess() {}"],
          ts: "export function makeAMess() {}"
        },
        {
          title: "paren-free:  `the` + a type stays words",
          input: "to shuffle the deck",
          js: ["export function shuffle_the_deck() {}"],
          ts: "export function shuffleTheDeck() {}"
        },
        {
          title: "simple arg in signature - arg is defined",
          input: "to notify (message): print the message",
          js: [`export function notify_$message(message) {`, `  return spellCore.console.log(message)`, `}`],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */) {",
            "  return spellCore.console.log(message)",
            "}"
          ]
        },
        {
          title: "simple arg in signature - it is not defined",
          input: "to notify (message): print it",
          js: ["export function notify_$message(message) {}", '/* PARSE ERROR: Don\'t understand "print it" */'],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */) {}",
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "typed simple arg in signature - arg is defined",
          input: "to notify (message as text): print the message",
          js: [`export function notify_$message(message) {`, `  return spellCore.console.log(message)`, `}`],
          ts: ["export function notifyMessage(message: string) {", "  return spellCore.console.log(message)", "}"]
        },
        {
          title: "typed simple arg in signature - `it` is not defined",
          input: "to notify (message as text): print it",
          js: ["export function notify_$message(message) {}", '/* PARSE ERROR: Don\'t understand "print it" */'],
          ts: ["export function notifyMessage(message: string) {}", '/* PARSE ERROR: Don\'t understand "print it" */']
        },
        {
          title: "valued simple arg in signature - arg is defined",
          input: 'to notify (message = "Really?"): print the message',
          js: [
            `export function notify_$message(message = "Really?") {`,
            `  return spellCore.console.log(message)`,
            `}`
          ],
          ts: [
            'export function notifyMessage(message: string = "Really?") {',
            "  return spellCore.console.log(message)",
            "}"
          ]
        },
        {
          title: "typed simple arg in signature - `it` is not defined",
          input: 'to notify (message = "Really?"): print it',
          js: [
            'export function notify_$message(message = "Really?") {}',
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ],
          ts: [
            'export function notifyMessage(message: string = "Really?") {}',
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "type arg in signature - thisVar",
          input: "to create (a card): print the card",
          js: [`Card.prototype.create = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "type arg in signature - it",
          input: "to create (a card): print it",
          js: [`Card.prototype.create = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "type arg in signature - its",
          input: "to create (a card): set its number to 1",
          js: [`Card.prototype.create = function () {`, `  this.number = 1`, `}`],
          ts: [
            "export interface Card { create(): any /* spell: type unknown */ }",
            "Card.prototype.create = function (this: Card) {",
            "  this.number = 1",
            "}"
          ]
        },
        {
          title: "multiple type args in signature - thisVar",
          input: "to add (a card) to (a pile): set the pile of the card to the pile",
          js: [`Card.prototype.add_to_$pile = function (pile) {`, `  this.pile = pile`, `}`],
          ts: [
            "export interface Card { addToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.addToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "multiple type args in signature - it",
          input: "to add (a card) to (a pile): set the pile of it to the pile",
          js: [`Card.prototype.add_to_$pile = function (pile) {`, `  this.pile = pile`, `}`],
          ts: [
            "export interface Card { addToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.addToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "multiple type args in signature - its",
          input: "to add (a card) to (a pile): set its pile to the pile",
          js: [`Card.prototype.add_to_$pile = function (pile) {`, `  this.pile = pile`, `}`],
          ts: [
            "export interface Card { addToPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.addToPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- arg name",
          input: "to show (thing as a card): print the thing",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- thisVar",
          input: "to show (thing as a card): print the card",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- it",
          input: "to show (thing as a card): print it",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}"
          ]
        },
        {
          title: "typed arg in signature -- its",
          input: "to show (thing as a card): print its name",
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this.name)`, `}`],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this.name)",
            "}"
          ]
        },
        {
          title: "typed var in signature: implicit `it` gets remapped after `get`",
          input: ["to show (thing as a card)", "\tprint it", "\tget its name", "\tprint it"],
          js: [
            "Card.prototype.show = function () {",
            "  spellCore.console.log(this)",
            "  let it = this.name",
            "  spellCore.console.log(it)",
            "}"
          ],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  spellCore.console.log(this)",
            "  const it = this.name",
            "  spellCore.console.log(it)",
            "}"
          ]
        },
        {
          title: "mixed vars in signature",
          input: "to prompt (message as text) and (reply)",
          js: ["export function prompt_$message_and_$reply(message, reply) {}"],
          ts: "export function promptMessageAndReply(message: string, reply: any /* spell: type unknown */) {}"
        }
      ]
    },
    {
      title: "calling signature arguments",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
      },
      tests: [
        {
          title: "top level keyword-only method",
          input: ["to start the game", "\tprint 1", "start the game"],
          js: [`export function start_the_game() {`, `  spellCore.console.log(1)`, `}`, `start_the_game()`],
          ts: ["export function startTheGame() {", "  spellCore.console.log(1)", "}", "startTheGame()"]
        },
        {
          title: "top level simple argument method",
          input: ["to notify (message): print the message", "notify 1"],
          js: [
            `export function notify_$message(message) {`,
            `  return spellCore.console.log(message)`,
            `}`,
            "notify_$message(1)"
          ],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */) {",
            "  return spellCore.console.log(message)",
            "}",
            "notifyMessage(1)"
          ]
        },
        {
          title: "top level typed simple argument method",
          input: ["to notify (message as text): print the message", 'notify "hi"'],
          js: [
            `export function notify_$message(message) {`,
            `  return spellCore.console.log(message)`,
            `}`,
            `notify_$message("hi")`
          ],
          ts: [
            "export function notifyMessage(message: string) {",
            "  return spellCore.console.log(message)",
            "}",
            'notifyMessage("hi")'
          ]
        },
        {
          title:
            "typed call:  an argument KNOWN to be the wrong type isn't a call to it -- here, the built-in `notify`",
          input: ["to notify (message as text): print the message", "notify 1"],
          js: [
            `export function notify_$message(message) {`,
            `  return spellCore.console.log(message)`,
            `}`,
            `spellCore.notify(1)`
          ],
          ts: [
            "export function notifyMessage(message: string) {",
            "  return spellCore.console.log(message)",
            "}",
            "spellCore.notify(1)"
          ]
        },
        {
          title: "typed call:  a sub-type fits, an unrelated type doesn't",
          input: [
            "a joker is a card",
            "to show (a card) on (a pile): print 1",
            "show a new joker on a new pile",
            "show a new card on a new card"
          ],
          js: [
            "export class Joker extends Card {}",
            `Card.prototype.show_on_$pile = function (pile) {`,
            `  return spellCore.console.log(1)`,
            `}`,
            "new Joker().show_on_$pile(new Pile())",
            `/* PARSE ERROR: Don't understand "show a new card on a new card" */`
          ],
          ts: [
            "export class Joker extends Card {}",
            "export interface Card { showOnPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.showOnPile = function (this: Card, pile: Pile) {",
            "  return spellCore.console.log(1)",
            "}",
            "(new Joker()).showOnPile(new Pile())",
            '/* PARSE ERROR: Don\'t understand "show a new card on a new card" */'
          ]
        },
        {
          title: "type arg in signature",
          input: ["to show (a card): print the card", "show a new card"],
          js: [`Card.prototype.show = function () {`, `  return spellCore.console.log(this)`, `}`, "new Card().show()"],
          ts: [
            "export interface Card { show(): any /* spell: type unknown */ }",
            "Card.prototype.show = function (this: Card) {",
            "  return spellCore.console.log(this)",
            "}",
            "(new Card()).show()"
          ]
        },
        {
          title: "multiple type args in signature",
          input: ["to play (a card) on (a pile): set its pile to the pile", "play a new card on a new pile"],
          js: [
            `Card.prototype.play_on_$pile = function (pile) {`,
            `  this.pile = pile`,
            `}`,
            "new Card().play_on_$pile(new Pile())"
          ],
          ts: [
            "export interface Card { playOnPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.playOnPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}",
            "(new Card()).playOnPile(new Pile())"
          ]
        },
        {
          title: "paren-free type args in signature",
          input: ["to play a card on a pile: set its pile to the pile", "play a new card on a new pile"],
          js: [
            `Card.prototype.play_on_$pile = function (pile) {`,
            `  this.pile = pile`,
            `}`,
            "new Card().play_on_$pile(new Pile())"
          ],
          ts: [
            "export interface Card { playOnPile(pile: Pile): any /* spell: type unknown */ }",
            "Card.prototype.playOnPile = function (this: Card, pile: Pile) {",
            "  this.pile = pile",
            "}",
            "(new Card()).playOnPile(new Pile())"
          ]
        }
      ]
    },
    {
      title: "props",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
      },
      tests: [
        {
          title: "signature with no keywords is not matched",
          input: "to (foo)",
          js: '/* PARSE ERROR: Don\'t understand "to (foo)" */'
        },
        {
          title: "with arg is optional when calling",
          input: ["to notify (with message):", "\tprint the message", "notify"],
          js: [
            "export function notify(props = {}) {",
            "  let { message } = props",
            "  spellCore.console.log(message)",
            "}",
            "notify()"
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            "notify()"
          ]
        },

        {
          title: "simple variable props",
          input: ["to notify (with message):", "\tprint the message", 'notify with message = "It worked!"'],
          js: [
            "export function notify(props = {}) {",
            "  let { message } = props",
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "It worked!" })'
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "It worked!" })'
          ]
        },
        {
          title: "typed variable props",
          input: [
            "to play (with a card):",
            "\tprint the card",
            "play with card = a new card",
            'play with card = a new card with suit of "hearts"'
          ],
          js: [
            "export function play(props = {}) {",
            "  let { card } = props",
            "  spellCore.console.log(card)",
            "}",
            "play({ card: new Card() })",
            'play({ card: new Card({ suit: "hearts" }) })'
          ],
          ts: [
            "export function play(props: { card?: Card } = {}) {",
            "  const { card } = props",
            "  spellCore.console.log(card)",
            "}",
            "play({ card: new Card() })",
            'play({ card: new Card({ suit: "hearts" }) })'
          ]
        },
        {
          title: "default value props",
          input: ['to notify (with message = "nope"):', "\tprint the message", 'notify with message = "Ship it!!"'],
          js: [
            "export function notify(props = {}) {",
            '  let { message = "nope" } = props',
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "Ship it!!" })'
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            '  const { message = "nope" } = props',
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "Ship it!!" })'
          ]
        },
        {
          title: "multiple default value props",
          input: [
            'to notify (with message = "nope" and reply = "yep"):',
            "\tprint the message + the reply",
            'notify with message = "How many?"',
            'notify with message = "How many?" and reply = 2'
          ],
          js: [
            "export function notify(props = {}) {",
            '  let { message = "nope", reply = "yep" } = props',
            "  spellCore.console.log(message + reply)",
            "}",
            'notify({ message: "How many?" })',
            'notify({ message: "How many?", reply: 2 })'
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            '  const { message = "nope", reply = "yep" } = props',
            "  spellCore.console.log(message + reply)",
            "}",
            'notify({ message: "How many?" })',
            'notify({ message: "How many?", reply: 2 })'
          ]
        },
        {
          title: "mixed props",
          input: [
            'to notify (with name, message as text and reply = "yep"):',
            "\tprint the name + the message + the reply",
            'notify with name = "Bob", message = "How many?" and reply = 2'
          ],
          js: [
            "export function notify(props = {}) {",
            '  let { name, message, reply = "yep" } = props',
            "  spellCore.console.log((name + message) + reply)",
            "}",
            "notify({",
            '  name: "Bob",',
            '  message: "How many?",',
            "  reply: 2",
            "})"
          ],
          ts: [
            "export function notify(props: { name?: any /* spell?: type unknown */; message?: string; reply?: any /* spell?: type unknown */ } = {}) {",
            '  const { name, message, reply = "yep" } = props',
            "  spellCore.console.log(name + message + reply)",
            "}",
            "notify({",
            '  name: "Bob",',
            '  message: "How many?",',
            "  reply: 2",
            "})"
          ]
        },
        {
          title: "mixed props and signature",
          input: [
            'to notify (message) (with reply = "yep"):',
            "\tprint the message",
            "\tprint the reply",
            'notify "Really?" with reply = "yes"'
          ],
          js: [
            "export function notify_$message(message, props = {}) {",
            '  let { reply = "yep" } = props',
            "  spellCore.console.log(message)",
            "  spellCore.console.log(reply)",
            "}",
            'notify_$message("Really?", { reply: "yes" })'
          ],
          ts: [
            "export function notifyMessage(message: any /* spell: type unknown */, props: Object = {}) {",
            '  const { reply = "yep" } = props',
            "  spellCore.console.log(message)",
            "  spellCore.console.log(reply)",
            "}",
            'notifyMessage("Really?", { reply: "yes" })'
          ]
        },
        {
          title: "extra props passed in are OK",
          input: [
            "to notify (with message):",
            "\tprint the message",
            `notify with message = "It worked!" and reply = "No it didn't"`
          ],
          js: [
            "export function notify(props = {}) {",
            "  let { message } = props",
            "  spellCore.console.log(message)",
            "}",
            `notify({ message: "It worked!", reply: "No it didn't" })`
          ],
          ts: [
            "export function notify(props: Object = {}) {",
            "  const { message } = props",
            "  spellCore.console.log(message)",
            "}",
            'notify({ message: "It worked!", reply: "No it didn\'t" })'
          ]
        }
      ]
    }
  ]
})

////////////////
// ## `create_animation` rule
//    e.g. "animation deal the cards"
////////////////

/**
 * Define an animation method: `animation deal the cards`, or `create animation deal the cards`.
 * - `create` is optional filler -- `asAnimation` just records that the `animation` keyword matched, it
 *   doesn't distinguish the two spellings.
 * - `inlineInitialType` is `true`, same promotion-to-instance-method behavior as `to_do_something`.
 * - SIDE EFFECT: `MethodDefinition.getAST()`'s `asAnimation` handling makes the method `async` and wraps
 *   its body in `StartProcessInvocation` (`exclusive: true`) / `try { ... } finally {
 *   StopProcessInvocation }` -- which is what makes re-invoking a running animation a no-op (see
 *   `spellCore.processIsRunning()` in the compiled output) and always stops the process on the way out.
 */
class CreateAnimation extends MethodDefinition<"asAnimation|signature|body?"> {
  @proto static alias = "statement"
  // promote the first captured type arg (e.g. `(a card)`) to an instance-method receiver
  @proto static inlineInitialType = true
}
methods.addRule(CreateAnimation, {
  syntax: `(asAnimation:create? animation) {signature:method_signature} :? {statement_body}?`,
  tests: [
    {
      title: "inline method signatures & variables",
      compileAs: "block",
      beforeEach(scope: P.Scope) {
        scope.types?.add("card")
        scope.types?.add("pile")
        scope.types?.add("deck")
        scope.constants?.add("up")
        scope.constants?.add("down")
      },
      tests: [
        {
          input: "animation deal the cards",
          js: [
            "export async function deal_the_cards() {",
            "  if (spellCore.processIsRunning('deal_the_cards')) { return }",
            "  spellCore.startProcess('deal_the_cards', 'EXCLUSIVE')",
            "  try {}",
            "  finally {",
            "    spellCore.stopProcess('deal_the_cards')",
            "  }",
            "}"
          ],
          ts: [
            "export async function dealTheCards() {",
            '  if (spellCore.processIsRunning("deal_the_cards")) return',
            '  spellCore.startProcess("deal_the_cards", "EXCLUSIVE")',
            "  try {}",
            "  finally {",
            '    spellCore.stopProcess("deal_the_cards")',
            "  }",
            "}"
          ]
        },
        {
          input: ["animation deal the cards", "\tpause for 10 seconds"],
          js: [
            "export async function deal_the_cards() {",
            "  if (spellCore.processIsRunning('deal_the_cards')) { return }",
            "  spellCore.startProcess('deal_the_cards', 'EXCLUSIVE')",
            "  try {",
            "    await spellCore.pauseFor(10, 'seconds')",
            "  }",
            "  finally {",
            "    spellCore.stopProcess('deal_the_cards')",
            "  }",
            "}"
          ],
          ts: [
            "export async function dealTheCards() {",
            '  if (spellCore.processIsRunning("deal_the_cards")) return',
            '  spellCore.startProcess("deal_the_cards", "EXCLUSIVE")',
            "  try {",
            '    await spellCore.pauseFor(10, "seconds")',
            "  }",
            "  finally {",
            '    spellCore.stopProcess("deal_the_cards")',
            "  }",
            "}"
          ]
        }
      ]
    }
  ]
})

////////////////
// ## `quoted_type_expression` rule
//    e.g. `a thing "nerds out" if`
////////////////

/**
 * Define an ad-hoc expression on a type from a QUOTED signature, e.g. `a thing "nerds out" if`,
 * `a thing "is a bug" if`, `a thing "nerds out with (another as a thing)" if`.
 * - `Priority.belowDeclaration`:  defers to more specific method-definition rules in `classes.ts`
 *   (e.g. `define_property_has`) when both could match the same tokens.
 * - Quoting the signature (`quoted_method_signature`) lets it start with plain english words (`is`,
 *   `has`, `can`, `will`, ...) that would otherwise collide with other statement/expression rules.
 * - Trailing `if`/`is` is a no-op keyword purely for readability (`a thing "is a bug" if` vs. plain
 *   `a thing "is a bug"`); neither is captured into `match.groups`.
 * - `{expression_body}?` -- the inline body (`a thing "nerds out" if yes`) parses as an
 *   `expression`, not a `statement` like other `MethodDefinition` subclasses, since the result compiles
 *   to a getter/method returning a value.
 * - `parse()` rejects signatures that don't start with a keyword, or that captured more than one
 *   argument -- only zero- or one-arg expressions are supported.
 * - `processSignature()` decides postfix (`asPostfixExpression`, zero args, e.g. `card.is_a_bug`) vs.
 *   infix (`asInfixExpression`, one arg, e.g. `card.nerds_out_with_$another(thing)`) form, and rewrites
 *   `is`/`can`/`will`/`has` into a negatable `{operator}` group so both the positive and negative
 *   phrasing (`is`/`is not`/`isn't`/`isnt`) compile to the same rule with `shouldNegateOutput()` flipping
 *   the output.
 */
class QuotedTypeExpression extends MethodDefinition<"type|signature|body?"> {
  @proto static priority = Priority.belowDeclaration
  @proto static alias = "statement"

  /**
   * Reject the match if its (quoted) signature doesn't start with a keyword, or captured more than one
   * arg -- `quoted_type_expression` only supports plain (`nerds out`) or single-arg (`nerds out with
   * (x as y)`) forms.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (match) {
      const signature = this.getSignature(match)!
      if (!signature.startsWithKeyword) {
        if (!isNode) {
          // console.warn("quoted_type_expression: must start with a keyword. Skipping match.", { tokens, match })
        }
        return undefined
      }
      if (signature.args.length > 1) {
        if (!isNode) {
          // console.warn("quoted_type_expression: too many arguments. Skipping match.", { tokens, match })
        }
        return undefined
      }
      const refused = SpellStatement.refuseUnknownType(match, match.groups.type)
      if (refused !== match) return refused
      if (QuotedTypeExpression.isPropertySlip(scope, tokens)) {
        const whole = match.clone({ matched: tokens, tokens: [...tokens] })
        const name = (tokens[1] as P.TextToken).innerText
        return SpellStatement.refuse(whole, `A property starts "its":  write its "${name}" is ...`)
      }
      if (QuotedTypeExpression.isBodiless(match, tokens)) {
        const phrase = match.groups.signature.inputText.trim()
        return SpellStatement.refuse(match, `${phrase} has no body:  write ${phrase} always, or ${phrase} if ...`)
      }
    }
    return match
  }

  /**
   * Is `match` the quoted phrase and NOTHING more:  no `if` / `is` / `:`, no body, e.g. `- it "can move"` (plan doc
   * `outline-spell` I6)?
   * - Refused, saying so:  it'd compile to an empty method, `get can_move() {}`, always `undefined`.
   * - A dangling `if` is fine:  its body may be the indented lines below.
   */
  private static isBodiless(match: P.MatchFor<QuotedTypeExpression>, tokens: P.Token[]): boolean {
    const lastOfSignature = match.groups.signature.tokens.at(-1)
    const after = tokens.slice(tokens.indexOf(lastOfSignature!) + 1)
    return !after.join("").trim()
  }

  /**
   * Is `tokens` a property written with `it` for `its` in an outline body, e.g. `- it "rank" is a number`
   * (plan doc `outline-spell`, todo T3)?
   * - `it`, a quoted member name (no verb, so not a phrase like `"is face up"`), then `is`.
   * - Refused, saying so:  read as a phrase, it'd make an empty `get rank() {}`, and say only
   *   "Don't understand `a number`".
   */
  private static isPropertySlip(scope: P.Scope, tokens: P.Token[]): boolean {
    const [subject, name, is] = tokens
    return (
      `${subject?.value}`.toLowerCase() === "it" &&
      !!name &&
      !!scope.getRuleOrDie("quoted_member").test(scope, [name]) &&
      `${is?.value}`.toLowerCase() === "is"
    )
  }

  /**
   * Turn the quoted signature into a postfix (no args) or infix (one arg) expression on `groups.type`.
   * - SIDE EFFECT: sets `signature.instanceType` directly from the OUTER `{type:singular_type}`
   *   capture -- bypasses `MethodDefinition`'s normal inline-type-promotion path (`inlineInitialType`)
   *   entirely, since the type here is captured outside the (quoted) signature, not inside it.
   * - Zero args => `asPostfixExpression`.
   * - One arg => `asInfixExpression`, and its single `{callArgs:expression}` syntax bit is rewritten
   *   to `{expression:operand}` -- see `getRule()`'s infix-rule branch.
   * - More than one arg isn't handled (see `parse()`'s rejection above) -- the `TODO` in the `else`
   *   branch notes the unimplemented `{thisArg:operand}` prefix for that case.
   * - Rewrites the FIRST `is`/`can`/`will`/`has` bit found (scanning signature order) into an
   *   `(operator:...)` alternation so all its negated spellings (`is not`, `isn't`, `isnt`, etc.) share
   *   one compiled rule; `shouldNegateOutput()` then flips `P.ASTExpression` output for a match on
   *   anything other than the bare positive form.
   */
  processSignature(
    groups: P.MatchGroups & { type: P.Match },
    signature: MethodSignatureData,
    scope: P.Scope
  ): MethodSignatureData {
    signature.instanceType = groups.type.raw
    if (signature.args.length === 0) {
      signature.asPostfixExpression = true
      // a value kind's phrase:  its static method -- see `MethodSignatureData.valueKindOf`
      const { scopeType } = groups.type.data as { scopeType?: unknown }
      if (scopeType instanceof P.TypeScope && scopeType.valueKind) signature.valueKindOf = scopeType.name
    } else if (signature.args.length === 1) {
      signature.asInfixExpression = true
      signature.syntaxBits = signature.syntaxBits.map((bit) => (bit.startsWith("{") ? "{expression:operand}" : bit))
    } else {
      // TODO: we don't handle this currently...
      // signature.syntaxBits.unshift("{thisArg:operand}")
    }
    // FIRST negatable word, e.g. `is`, matches all its forms, e.g. `isn't` -- see `Negatable`
    if (signature.asPostfixExpression || signature.asInfixExpression) {
      const rules = scope.parser?.rules
      let foundOne = false
      signature.syntaxBits = signature.syntaxBits.map((bit) => {
        if (foundOne || !(rules?.[bit] instanceof Negatable)) return bit
        foundOne = true
        return `{operator:${bit}}`
      })
    }
    // console.warn(signature)
    return signature
  }
}
methods.addRule(QuotedTypeExpression, {
  syntax: "(a|an) {type:singular_type} {signature:quoted_method_signature} (if|is)? :? {expression_body}?",
  tests: [
    {
      title: "fails if",
      compileAs: "block",
      tests: [
        {
          title: "signature is empty",
          input: `a thing "" if`,
          js: `/* PARSE ERROR: Don't understand "a thing "" if" */`
        },
        {
          title: "signature doesn't start with a keyword",
          input: `a thing "(thing)" if`,
          js: `/* PARSE ERROR: Don't understand "a thing "(thing)" if" */`
        },
        {
          title: "more than one arg specified",
          input: `a thing "(thing) but (thing)" if`,
          js: `/* PARSE ERROR: Don't understand "a thing "(thing) but (thing)" if" */`
        }
      ]
    },
    {
      title: "no args, no negatables",
      compileAs: "block",
      tests: [
        {
          title: "no body",
          input: [`a thing "nerds out" if`, `if a new thing nerds out`],
          js: [
            `Object.defineProperty(Thing.prototype, 'nerds_out', {`,
            `  get() {},`,
            `  configurable: true`,
            `})`,
            `if (new Thing().nerds_out) {}`
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        },
        {
          title: "no if",
          input: [`a thing "nerds out": never`, `if a new thing nerds out`],
          js: [
            `Object.defineProperty(Thing.prototype, 'nerds_out', {`,
            `  get() {`,
            `    return false`,
            `  },`,
            `  configurable: true`,
            `})`,
            `if (new Thing().nerds_out) {}`
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {",
            "    return false",
            "  },",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        },
        {
          title: "inline expression",
          input: [`a thing "nerds out" if yes`, `if a new thing nerds out`],
          js: [
            `Object.defineProperty(Thing.prototype, 'nerds_out', {`,
            `  get() {`,
            `    return true`,
            `  },`,
            `  configurable: true`,
            `})`,
            `if (new Thing().nerds_out) {}`
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {",
            "    return true",
            "  },",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        },
        {
          title: "indented method body",
          input: [`a thing "nerds out" if`, `\treturn yes`, `if a new thing nerds out`],
          js: [
            `Object.defineProperty(Thing.prototype, 'nerds_out', {`,
            `  get() {`,
            `    return true`,
            `  },`,
            `  configurable: true`,
            `})`,
            `if (new Thing().nerds_out) {}`
          ],
          ts: [
            "export interface Thing { readonly nerdsOut: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "nerdsOut", {',
            "  get(this: Thing) {",
            "    return true",
            "  },",
            "  configurable: true",
            "})",
            "if ((new Thing()).nerdsOut) {}"
          ]
        }
      ]
    },
    {
      title: "one arg",
      compileAs: "block",
      tests: [
        {
          title: "no body",
          input: [`a thing "nerds out with (another as a thing)" if`, `if a new thing nerds out with a new thing`],
          js: [
            `Thing.prototype.nerds_out_with_$another = function (another) {}`,
            `if (new Thing().nerds_out_with_$another(new Thing())) {}`
          ],
          ts: [
            "export interface Thing { nerdsOutWithAnother(another: Thing): any /* spell: type unknown */ }",
            "Thing.prototype.nerdsOutWithAnother = function (this: Thing, another: Thing) {}",
            "if ((new Thing()).nerdsOutWithAnother(new Thing())) {}"
          ]
        },
        {
          title: "inline expression",
          input: [`a thing "nerds out with (another as a thing)" if yes`, `if a new thing nerds out with a new thing`],
          js: [
            `Thing.prototype.nerds_out_with_$another = function (another) {`,
            `  return true`,
            `}`,
            `if (new Thing().nerds_out_with_$another(new Thing())) {}`
          ],
          ts: [
            "export interface Thing { nerdsOutWithAnother(another: Thing): any /* spell: type unknown */ }",
            "Thing.prototype.nerdsOutWithAnother = function (this: Thing, another: Thing) {",
            "  return true",
            "}",
            "if ((new Thing()).nerdsOutWithAnother(new Thing())) {}"
          ]
        },
        {
          title: "indented method body",
          input: [
            `a thing "nerds out with (another as a thing)" if`,
            `\treturn yes`,
            `if a new thing nerds out with a new thing`
          ],
          js: [
            `Thing.prototype.nerds_out_with_$another = function (another) {`,
            `  return true`,
            `}`,
            `if (new Thing().nerds_out_with_$another(new Thing())) {}`
          ],
          ts: [
            "export interface Thing { nerdsOutWithAnother(another: Thing): any /* spell: type unknown */ }",
            "Thing.prototype.nerdsOutWithAnother = function (this: Thing, another: Thing) {",
            "  return true",
            "}",
            "if ((new Thing()).nerdsOutWithAnother(new Thing())) {}"
          ]
        }
      ]
    },
    {
      title: "negatables",
      compileAs: "block",
      tests: [
        {
          title: "is",
          input: [
            `a thing "is a bug" if`,
            `if a new thing is a bug`,
            `if a new thing is not a bug`,
            `if a new thing isnt a bug`,
            `if a new thing isn't a bug`
          ],
          js: [
            `Object.defineProperty(Thing.prototype, 'is_a_bug', {`,
            `  get() {},`,
            `  configurable: true`,
            `})`,
            `if (new Thing().is_a_bug) {}`,
            `if (!new Thing().is_a_bug) {}`,
            `if (!new Thing().is_a_bug) {}`,
            `if (!new Thing().is_a_bug) {}`
          ],
          ts: [
            "export interface Thing { readonly isABug: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "isABug", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).isABug) {}",
            "if (!(new Thing()).isABug) {}",
            "if (!(new Thing()).isABug) {}",
            "if (!(new Thing()).isABug) {}"
          ]
        },
        {
          title: "can",
          input: [
            `a thing "can play" if`,
            `if a new thing can play`,
            `if a new thing cannot play`,
            `if a new thing can not play`,
            `if a new thing cant play`,
            `if a new thing can't play`
          ],
          js: [
            `Object.defineProperty(Thing.prototype, 'can_play', {`,
            `  get() {},`,
            `  configurable: true`,
            `})`,
            `if (new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`
          ],
          ts: [
            "export interface Thing { readonly canPlay: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "canPlay", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}",
            "if (!(new Thing()).canPlay) {}"
          ]
        },
        {
          title: "will",
          input: [
            `a thing "will blow up" if`,
            `if a new thing will blow up`,
            `if a new thing will not blow up`,
            `if a new thing wont blow up`,
            `if a new thing won't blow up`
          ],
          js: [
            `Object.defineProperty(Thing.prototype, 'will_blow_up', {`,
            `  get() {},`,
            `  configurable: true`,
            `})`,
            `if (new Thing().will_blow_up) {}`,
            `if (!new Thing().will_blow_up) {}`,
            `if (!new Thing().will_blow_up) {}`,
            `if (!new Thing().will_blow_up) {}`
          ],
          ts: [
            "export interface Thing { readonly willBlowUp: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "willBlowUp", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).willBlowUp) {}",
            "if (!(new Thing()).willBlowUp) {}",
            "if (!(new Thing()).willBlowUp) {}",
            "if (!(new Thing()).willBlowUp) {}"
          ]
        },
        {
          title: "has",
          input: [
            `a thing "has a friend" if`,
            `if a new thing has a friend`,
            `if a new thing does not have a friend`,
            `if a new thing doesnt have a friend`,
            `if a new thing doesn't have a friend`
          ],
          js: [
            `Object.defineProperty(Thing.prototype, 'has_a_friend', {`,
            `  get() {},`,
            `  configurable: true`,
            `})`,
            `if (new Thing().has_a_friend) {}`,
            `if (!new Thing().has_a_friend) {}`,
            `if (!new Thing().has_a_friend) {}`,
            `if (!new Thing().has_a_friend) {}`
          ],
          ts: [
            "export interface Thing { readonly hasAFriend: any /* spell: type unknown */ }",
            'Object.defineProperty(Thing.prototype, "hasAFriend", {',
            "  get(this: Thing) {},",
            "  configurable: true",
            "})",
            "if ((new Thing()).hasAFriend) {}",
            "if (!(new Thing()).hasAFriend) {}",
            "if (!(new Thing()).hasAFriend) {}",
            "if (!(new Thing()).hasAFriend) {}"
          ]
        }
      ]
    }
  ]
})
// in an outline body:  `- it "is face up" if its direction is up` -- tests in `parserTests/outline.test.ts`
methods.addRule(QuotedTypeExpression, {
  syntax: "{type:subject_it} {signature:quoted_method_signature} (if|is)? :? {expression_body}?"
})

////////////////
// ## Method-signature data types
////////////////

/**
 * Data `MethodSignature`'s `parse()` builds into `match.data`, then `MethodDefinition.processSignature()`
 * (and overrides, e.g. `quoted_type_expression`) further mutates.
 */
type MethodSignatureData = {
  items: MethodArgData[]
  /** `true` if the first item is a keyword. */
  startsWithKeyword: boolean
  /** `true` if we found at least one keyword. Arg-only signatures are invalid! */
  foundKeyword: boolean
  /** Method signature bits. Converted to `methodName` string at end of `parse()`. */
  methodBits: string[]
  /** Rule syntax bits. Converted to a string at end of `parse()`. */
  syntaxBits: string[]
  /** Types we found in the signature. */
  types: MethodTypeInfo[]
  /** Method arguments, as `P.ASTVariableExpression`s. */
  args: P.ASTVariableExpression[]
  /**
   * Each argument's item as written, in order, e.g. `(a card)` or `a card` -- NOT a `(with ...)` clause.
   * - For editors, e.g. signature help's parameter ranges.  The same order as its call rule's `{slots}`.
   */
  argMatches: P.Match[]
  /** Random extra vars we should enable (e.g. aliases for `this`). */
  extraVars: MethodExtraVar[]
  /** `with_props_arg`'s props, if any. */
  props: P.ASTVariableExpression[] | undefined
  /** Full methodName from `methodBits`, set at the end of `parse()`. */
  methodName: string | undefined
  /** Full method syntax, set at the end of `parse()`. */
  syntax: string | undefined
  /** Type to add an instance method to, set by `processSignature()`. */
  instanceType: string | undefined
  /** `true` when the definition compiles to a postfix expression (e.g. `card.is_a_bug`) instead of a callable
   *  method -- set by `MethodDefinition.processSignature()` / `QuotedTypeExpression.processSignature()`. */
  asPostfixExpression?: boolean
  /** `true` when it compiles to an infix expression (e.g. `card.nerds_out_with_$another(thing)`) -- set by
   *  `MethodDefinition.processSignature()` / `QuotedTypeExpression.processSignature()`. */
  asInfixExpression?: boolean
  /**
   * A phrase on a VALUE kind, e.g. `Rank` for `a rank "is a face card" if ...` (plan doc `outline-spell`, P3):
   * its values are plain text, so the method is the kind's STATIC one, given the value -- `Rank.is_a_face_card(r)`.
   * Set by `QuotedTypeExpression.processSignature()`;  postfix only.
   */
  valueKindOf?: string
}

/**
 * `match.data` shape shared by the `method_arg`/`simple_method_arg` alternatives (`var_method_arg`,
 * `valued_var_method_arg`, `type_method_arg`, `typed_method_arg`, `with_props_arg`) and by `method_keyword`.
 * Each of these rules only ever fills in a subset of these fields.
 * - NOTE: these are all DERIVED values (strings, AST nodes, arrays) the rule computes from its real matched
 *   groups while parsing -- not real `Match`-valued groups themselves, so they live in `match.data`, not
 *   `match.groups` -- see `GROUPS ARE ONLY WHAT THE SYNTAX MATCHED` in the migration guide.
 */
type MethodArgData = {
  /** Matched bare word, set by `method_keyword`. */
  keyword?: P.Match
  /** Matched `identifier`, set by `var_method_arg` / `valued_var_method_arg` / `typed_method_arg`. */
  variable?: P.Match
  /** Matched type name, set by `type_method_arg` / `typed_method_arg`. */
  type?: P.Match
  /** Bit contributed to the generated `methodName`, e.g. a raw keyword, or `$varName` -- `undefined` for
   *  `with_props_arg`, since prop names don't appear in the method name. */
  method?: string
  /** Bit contributed to the rule's rulex `syntax`, e.g. a raw keyword or `{callArgs:expression}`. */
  syntax?: string
  /** This arg as a `P.ASTVariableExpression`, used for the generated method's parameter list. */
  arg?: P.ASTVariableExpression
  /** `with_props_arg` only: the individual prop `arg`s pulled out of its comma/`and`-joined item list. */
  props?: P.ASTVariableExpression[]
  /** `with_props_arg` only: raw matched items behind `props`, before mapping to `arg`s. */
  items?: P.Match[]
}

/** Info about a `{type}` capture within a method signature, e.g. the `(a card)` in `to create (a card)`. */
type MethodTypeInfo = {
  /** Raw matched type name, e.g. `card`. */
  name: string
  /** Arg's own variable name, if the type came from a `typed_method_arg` (e.g. `another` in `(another as a
   *  thing)`) -- `undefined` for a bare `type_method_arg` like `(a card)`. */
  varName: string | undefined
  /** `true` for a built-in/primitive type (`SpellType.isSimpleType()`) -- these are never promoted to an
   *  instance-method receiver by `MethodDefinition.processSignature()`. */
  isSimple: boolean
  /** Index into `MethodSignatureData.args` at the moment this type was found -- lets `processSignature()`
   *  splice the promoted arg back out. */
  argIndex: number
  /** Index into `MethodSignatureData.methodBits` at the moment this type was found -- same splice purpose. */
  methodIndex: number
  /** Index into `MethodSignatureData.syntaxBits` at the moment this type was found -- `processSignature()`
   *  overwrites this slot with `{thisArg:expression}` when promoting. */
  syntaxIndex: number
}

/** Extra random variable to add to a method's nested scope, e.g. an alias for `this`. */
type MethodExtraVar = string | { name: string; output?: string; type?: string }

////////////////
// ## Shared helpers
////////////////

/** Is `scope` a file's (or project's) top level, where a definition is `export`ed? */
function isTopLevel(scope: P.Scope): boolean {
  return scope instanceof P.FileScope || scope instanceof P.ProjectScope
}
