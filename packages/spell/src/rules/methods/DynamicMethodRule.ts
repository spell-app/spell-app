import { proto } from "$/util"
import { P } from "$/parser"
// Import directly to avoid circular import
import { SpellStatement, type SpellStatementProps } from "$/spell/rules/Statement"
import { MethodDefinition } from "./MethodDefinition"
import type { MethodRuleDeclared } from "./methods.shared"

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
