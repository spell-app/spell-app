import { isNode } from "browser-or-node"

import { instanceCase, typeCase, proto } from "~/util"
import { P } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement, type SpellStatementProps } from "./Statement"
import { SpellType } from "./types"
import { SpellIdentifier } from "./variables"
import { PostfixOperatorSuffix, InfixOperatorSuffix } from "./expressions"

/**
 * Rule module for dynamic method definitions (`to foo ...`, `animation ...`) and their call sites, plus
 * quoted ad-hoc expressions on a type (`a thing "..." if`), and the method-signature/method-arg building
 * blocks they all share.
 * - e.g. signature shapes handled by `method_signature`:
 *   - `to foo the bar`
 *   - `to foo (a thing)`
 *   - `to foo (a thing) in (a thing)`
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

/**
 * Data `method_signature`'s `parse()` builds into `match.data`, then `MethodDefinition.processSignature()`
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
   *  method -- set by `MethodDefinition.processSignature()` / `quoted_type_expression.processSignature()`. */
  asPostfixExpression?: boolean
  /** `true` when it compiles to an infix expression (e.g. `card.nerds_out_with_$another(thing)`) -- set by
   *  `MethodDefinition.processSignature()` / `quoted_type_expression.processSignature()`. */
  asInfixExpression?: boolean
  /** Given the matched `operator` token, `true` if output should be negated (e.g. `isn't`, `can't`) -- set
   *  by `quoted_type_expression.processSignature()`; defaults to always `false`. */
  shouldNegateOutput?: (operator: P.Match) => boolean
}

/** What `MethodDefinition` (and subclasses) stash in `match.data`, on top of whatever they declare via `MatchData`. */
type MethodDefinitionData = {
  /** Cached result of `getSignature()` -- see that method. */
  signature?: MethodSignatureData
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

////////////////
// ## `DynamicMethodRule` base class
//    e.g. "notify 1", after "to notify (message): ..." defined it
////////////////

/** `match.groups` for `DynamicMethodRule`, once `getGroupsForMatch()` has normalized `callArgs` to an array. */
type DynamicMethodRuleGroups = P.GroupsFor<"thisArg?|callArgs[]?|props?">

/**
 * Rule `constructor` for a plain (non-instance, non-operator) dynamically-defined method's CALL SITE, e.g.
 * matching `notify 1` after `to notify (message): ...` defined it.  Registered directly (no subclass
 * needed) by `MethodDefinition.getRule()`, for every generated method that isn't a postfix/infix expression.
 * - NOTE: not made a generic pass-through like `MethodDefinition` -- every dynamically-generated rule built
 *   on top of it uses the same `thisArg`/`callArgs`/`props` syntax convention, so there's no subclass that
 *   needs a different `Groups`/`MatchData`.
 */
export class DynamicMethodRule extends SpellStatement<"thisArg?|callArgs[]?|props?"> {
  /** Generated method name to invoke -- fixed per rule instance via the closure class `getRule()` builds,
   *  shared by every match of this rule. */
  declare methodName: string
  @proto static methodName?: string
  /** TYPE-ONLY: props `parser.addRule()` accepts for this rule -- see `P.Rule`'s `Props`. */
  declare readonly Props: DynamicMethodRuleProps

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

/** Props bag accepted by `DynamicMethodRule` -- `methodName` is the generated method it compiles a call to. */
export type DynamicMethodRuleProps = Prettify<SpellStatementProps & { methodName?: string }>

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
 * - Generic pass-through: each subclass has its own `signature` group typing, e.g. `to_do_something extends
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
   * - Only converts the FIRST type found, and only if it's not `isSimple` (i.e. a real declared type, not a
   *   primitive like `text`/`number`).
   * - SIDE EFFECT: mutates `signature` in place -- removes the type's arg/method/syntax bits and replaces the
   *   syntax bit with `{thisArg:expression}`; also adds an alias variable when the arg's own name differs
   *   from the type name (e.g. `to show (thing as a card)` aliases `thing` to `this`).
   * - Also promotes to a `test` method when `asTest`, prefixing `test` onto the method name and syntax.
   */
  processSignature(groups: P.MatchGroups, signature: MethodSignatureData): MethodSignatureData {
    const [initialType] = signature.types
    if (this.inlineInitialType && initialType && !initialType.isSimple) {
      signature.instanceType = initialType.name
      // remove instance bits from args and method signature
      signature.args.splice(initialType.argIndex, 1)
      signature.methodBits.splice(initialType.methodIndex, 1)
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
    const signature = this.processSignature(match.groups as P.MatchGroups, signatureMatch.data as MethodSignatureData)
    signature.methodName = signature.methodBits.join("_")
    signature.syntax = signature.syntaxBits.join(" ")
    return signature
  }

  /**
   * Build the `MethodScope` for the method body: adds `args` as scope variables, and (when `instanceType`
   * was set by `processSignature()`) aliases `it` to `this` via `mapItTo`/`thisVar`.
   * - SIDE EFFECT: adds `extraVars` (e.g. a `with_props_arg`'s prop names, or the promoted type's own
   *   var-name alias) directly onto the new scope's `variables`.
   */
  getNestedScopeForMatch(match: P.MatchFor<this>): P.MethodScope {
    const { methodName, args, extraVars, instanceType } = this.getSignature(match)!
    // Generic `Groups` keeps `MatchFor<this>` from narrowing to a plain `P.Match` -- cast once.
    const declaredBy = match as P.Match
    const methodScope = new P.MethodScope({
      parentScope: match.scope,
      name: methodName,
      args: args.map((arg) => new P.ScopeVariable(arg.name)),
      thisVar: instanceType,
      mapItTo: instanceType && "this",
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

  /** SIDE EFFECT: registers the generated call-site rule (`getRule()`) onto `scope.parser`, making the new
   *  syntax immediately usable after this definition. */
  mutateScope(match: P.MatchFor<this>): void {
    this.getRule(match)
  }

  /** Human-readable annotation text (wrapped in a comment by `getAST()`'s `ParserAnnotation`) -- differs for
   *  postfix/infix expressions (`added expression ...`) vs. plain statements (`added rule: ...`). */
  getRuleAnnotation(match: P.MatchFor<this>): string {
    const { syntax, asPostfixExpression, asInfixExpression } = this.getSignature(match)!
    if (asPostfixExpression || asInfixExpression) return `added expression \`{thing:simple_expression} ${syntax}\``
    return `added rule: \`${syntax}\``
  }

  /**
   * Register the CALL SITE rule directly onto `match.scope.parser` -- called by `mutateScope()`, this is
   * what makes `notify 1`, `card.play()`, `card is a bug`, etc. parseable after their
   * `to`/`animation`/quoted definitions.
   * - `asPostfixExpression`/`asInfixExpression` (set by `quoted_type_expression.processSignature()`) each
   *   register a closure class aliased `"expression_suffix"` extending `PostfixOperatorSuffix`/
   *   `InfixOperatorSuffix` that compiles to a `PropertyExpression`/`ScopedMethodInvocation` and applies
   *   `shouldNegateOutput()`.
   * - Otherwise registers `DynamicMethodRule` directly -- no subclass needed, aliased `"statement"` when
   *   `asTest` (so it can't be used as an expression), else `["statement", "expression"]`.
   * - Registers through `scope.addRule(RuleClass, definition)`, which puts the rule on the scope's parser and
   *   records the class + definition on the scope itself -- these generated rules MUST keep their alias so the
   *   parser finds them by category (`statement`/`expression`/`expression_suffix`) on the very next line,
   *   and the recorded pair is what lets a scope export the methods it defined.
   */
  getRule(match: P.MatchFor<this>): void {
    const { asTest } = match.groups as { asTest?: P.Match }
    const {
      methodName = "",
      syntax = "",
      asPostfixExpression,
      asInfixExpression,
      shouldNegateOutput = () => false
    } = this.getSignature(match)!
    const { scope } = match
    // Generic `Groups` keeps `MatchFor<this>` from narrowing to a plain `P.Match` -- cast once.
    const declaredBy = match as P.Match

    if (asPostfixExpression) {
      class _dynamicMethodRulePostfix extends PostfixOperatorSuffix {
        shouldNegateOutput(operator: P.Match): boolean {
          return shouldNegateOutput(operator)
        }
        compileASTExpression(_match: P.Match, { lhs }: OperatorOperands): P.ASTExpression {
          return new P.ASTPropertyExpression(_match, {
            object: lhs!,
            property: new P.ASTPropertyLiteral(_match, methodName)
          })
        }
      }
      scope.addRule(
        _dynamicMethodRulePostfix,
        {
          name: methodName,
          precedence: 20,
          alias: "expression_suffix",
          syntax
        },
        declaredBy
      )
      return
    }
    if (asInfixExpression) {
      class _dynamicMethodRuleInfix extends InfixOperatorSuffix {
        shouldNegateOutput(operator: P.Match): boolean {
          return shouldNegateOutput(operator)
        }
        compileASTExpression(_match: P.Match, { lhs, rhs }: OperatorOperands): P.ASTExpression {
          // `lhs`/`rhs` are always populated for an `InfixOperatorSuffix`.
          return new P.ASTScopedMethodInvocation(match, {
            thing: lhs!,
            methodName,
            args: [rhs!]
          })
        }
      }
      scope.addRule(
        _dynamicMethodRuleInfix,
        {
          name: methodName,
          precedence: 20,
          alias: "expression_suffix",
          syntax,
          parenthesize: true
        },
        declaredBy
      )
      return
    }
    scope.addRule(
      DynamicMethodRule,
      {
        name: methodName,
        alias: asTest ? "statement" : ["statement", "expression"],
        syntax,
        methodName
      },
      declaredBy
    )
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
   * Build the AST for a method DEFINITION: the annotation, the `P.ASTMethodDefinition` itself, and (depending
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
   * - `instanceType` set: emits a `PropertyDefinition` on `Type.prototype` -- a `get` accessor when
   *   `asPostfixExpression`, else a plain `value`.  No `instanceType`: emits a loose function, or (when
   *   `asTest`) a loose function whose body is itself a `test(...)` call.
   */
  getAST(match: P.MatchFor<this>): P.ASTStatementGroup {
    const { asTest, asAnimation } = match.groups as {
      asTest?: P.Match
      asAnimation?: P.Match
    }
    const signature = this.getSignature(match)!
    const { methodName = "", args, props, instanceType, asPostfixExpression } = signature
    const output: Array<P.ASTStatement | P.ASTExpression | P.ASTComment | P.ASTBlankLine> = [
      new P.ASTParserAnnotation(match, {
        value: this.getRuleAnnotation(match)
      })
    ]

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
      if (asPostfixExpression) {
        // console.warn("APE:", method)
        output.push(
          new P.ASTPropertyDefinition(match, {
            thing: new P.ASTPrototypeExpression(match, {
              type: typeCase(instanceType)
            }),
            property: methodName,
            get: method
          })
        )
      } else {
        output.push(
          new P.ASTPropertyDefinition(match, {
            thing: new P.ASTPrototypeExpression(match, {
              type: typeCase(instanceType)
            }),
            property: methodName,
            value: method
          })
        )
      }
    }
    // No instance type: create as a loose function
    else if (asTest) {
      output.push(
        new P.ASTMethodDefinition(match, {
          methodName,
          body: new P.ASTCoreMethodInvocation(match, {
            methodName: "test",
            args: [new P.ASTQuotedExpression(match, signature.methodBits.join(" ")), method]
          })
        })
      )
    } else {
      output.push(method)
    }

    return new P.ASTStatementGroup(match, { statements: output })
  }
}

/**
 * Props bag accepted by `MethodDefinition`.
 * - `inlineInitialType`:  first arg's type is part of the method name, e.g. `to draw a card` => `Card.draw()`.
 */
export type MethodDefinitionProps = Prettify<SpellStatementProps & { inlineInitialType?: boolean }>

////////////////
// ## `method_keyword` rule
//    e.g. "foo" in "to foo the bar"
////////////////

/**
 * One bare word in a method's keyword phrase, e.g. `foo`, `the`, `bar` in `to foo the bar`.
 * - `method` contributes the (dash-normalized) word to the signature's `methodBits`; `syntax` contributes
 *   its raw, unmodified text to the rule's rulex `syntax`.
 */
class method_keyword extends P.Pattern<never, MethodArgData> {
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
methods.addRule(method_keyword, {
  pattern: /^[a-zA-Z][\w-]*$/
})

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
 */
class var_method_arg extends SpellIdentifier<MethodArgData> {
  /** Stash this arg's contribution (`method` / `syntax` / `arg`) in `match.data`. */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { data } = match
    data.variable = match
    data.method = `$${match.value}`
    data.syntax = "{callArgs:expression}"
    data.arg = new P.ASTVariableExpression(match, { name: match.value, type: "argument" })
    return match
  }
}
methods.addRule(var_method_arg, {
  alias: ["method_arg", "simple_method_arg"]
})

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
class valued_var_method_arg extends SpellStatement<"identifier|value", MethodArgData> {
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
methods.addRule(valued_var_method_arg, {
  alias: ["method_arg", "simple_method_arg"],
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
 * - When this is the FIRST type found in a `to`/`animation` signature, `method_signature`'s
 *   `parse()` records it in `types`, and `MethodDefinition.processSignature()` later promotes
 *   it to an instance-method receiver (`thisArg`) rather than a call argument.
 */
class type_method_arg extends P.Sequence<"type", MethodArgData> {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { type } = match.groups
    match.data.type = type
    // TODO: instanceCase(type.value) ???
    match.data.method = `$${type.raw}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = new P.ASTVariableExpression(match, { name: instanceCase(type.value), type: "argument" })
    return match
  }
}
methods.addRule(type_method_arg, {
  alias: ["method_arg", "simple_method_arg"],
  syntax: `(a|an) {type}`
})

////////////////
// ## `typed_method_arg` rule
//    e.g. "thing as a card"
////////////////

/**
 * Variable arg with explicit type, e.g. `(thing as a card)` in `to show (thing as a card): ...`.
 * - `arg` keeps the ORIGINAL variable name (`thing`), not the type name -- contrast with
 *   `type_method_arg`, which has no variable and names the arg after the type instead.
 * - `arg.datatype` records the type name (`card`) for downstream type-checking/rendering.
 * - `method`/`syntax` match `var_method_arg`'s (`$name` / `{callArgs:expression}`) -- the type only
 *   annotates the arg, it doesn't change the generated method name or call syntax.
 */
class typed_method_arg extends P.Sequence<"identifier|type", MethodArgData> {
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens) as P.MatchFor<this> | undefined
    if (!match) return undefined
    const { identifier, type } = match.groups
    // `arg.datatype` is a real settable accessor inherited from `ASTNode`, and `VariableExpressionProps`
    // declares it too -- set here via the accessor after construction rather than through the
    // constructor props.
    // TODO: any reason not to just pass `datatype: type.value` into the constructor above?
    const arg = new P.ASTVariableExpression(match, { name: identifier.value, type: "argument" })
    arg.datatype = type.value
    match.data.variable = identifier
    match.data.type = type
    match.data.method = `$${identifier.value}`
    match.data.syntax = "{callArgs:expression}"
    match.data.arg = arg
    return match
  }
}
methods.addRule(typed_method_arg, {
  alias: ["method_arg", "simple_method_arg"],
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
export class with_props_arg extends P.Sequence<never, MethodArgData> {
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
methods.addRule(with_props_arg, {
  alias: ["method_arg"],
  syntax: "with [{simple_method_arg}(,|and)]"
})

////////////////
// ## `method_signature` rule
//    e.g. "foo the (bar as a thing)"
////////////////

/**
 * Full method signature: alternating keywords and parenthesized args, e.g. `foo the (bar as a thing)`.
 * - `({method_keyword}|\({method_arg}\))+` -- keywords and args can appear in ANY order/mix, any number
 *   of times; at least one repetition is required by the syntax, but see `parse()` for the additional
 *   keyword requirement.
 * - `parse()` walks the repeated items and assembles `methodBits`/`syntaxBits` (joined into
 *   `methodName`/`syntax` by `MethodDefinition.computeSignature()`), `args`, `types` (candidate
 *   instance-method receivers), `extraVars` and `props` into `match.data` -- see `MethodSignatureData`.
 */
class method_signature extends P.Repeat<never, MethodSignatureData> {
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
   * Flatten each matched `method_arg`/`method_keyword` item's `data` into `match.data`.
   * - `item.matched.length === 1` for a bare `method_keyword`; a parenthesized `method_arg` has 3
   *   matched tokens (`(`, arg, `)`) so its data lives on `item.matched[1]` instead.
   * - SIDE EFFECT: records `data.types` and their positions (`argIndex`/`methodIndex`/`syntaxIndex`)
   *   so `MethodDefinition.processSignature()` can later splice a promoted type back out of
   *   `args`/`methodBits`/`syntaxBits`.
   */
  buildSignatureData(match: P.MatchFor<this>): void {
    const data = match.data
    data.items = match.items.map(
      (item) => (item.matched.length === 1 ? item.data : (item.matched[1] as P.Match).data) as MethodArgData
    )
    // calculated as we run through the keywords
    data.startsWithKeyword = false // `true` if first item is a keyword.
    data.foundKeyword = false // `true` if we found at least one keyword.  arg-only signatures are invalid!
    data.methodBits = [] // method signature bits.  Converted to `methodName` string by `MethodDefinition.computeSignature()`.
    data.syntaxBits = [] // rule syntax bits.  Converted to string by `MethodDefinition.computeSignature()`.
    data.types = [] // types we found, as `{ name, varName, isSimple, argIndex, methodIndex, syntaxIndex }`
    data.args = [] // method arguments, as `P.ASTVariableExpression`s
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
      }

      // Recognize prop names in the method
      if (props) {
        data.props = props
        data.extraVars.push(...props.map((prop) => prop.name))
      }
    })
  }
}
methods.addRule(method_signature, {
  syntax: `({method_keyword}|\\({method_arg}\\))+`
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
 */
class quoted_method_signature extends P.TokenType {
  /**
   * Parse the token's text as JSON to get the raw signature string, then reparse THAT as
   * `method_signature`.
   * - SIDE EFFECT: swizzles the recovered match's `tokens`/`matched` to point at the outer quoted-text
   *   token, so it reads like a normal top-level match rather than a nested one.
   */
  parse(scope: P.Scope, tokens: P.Token[]) {
    const match = super.parse(scope, tokens)
    const signature =
      match && (scope.parse(JSON.parse(match.value), "method_signature") as P.MatchFor<method_signature> | undefined)
    if (!signature || !signature.data.foundKeyword) return undefined
    // Swizzle tokens & matched to reflect the original match
    signature.tokens = match.tokens
    signature.matched = [match]
    return signature
  }
}
methods.addRule(quoted_method_signature, {
  tokenType: P.TextToken
})

////////////////
// ## `to_do_something` rule
//    e.g. "to start the game"
////////////////

/**
 * Define a new method/statement: `to foo the bar`, `to create (a card)`, `to notify (message)`, etc.
 * - Optional `test` keyword (`to test foo: ...`) marks the definition as a test method -- see
 *   `MethodDefinition.processSignature()`/`getAST()`'s `asTest` handling.
 * - `inlineInitialType` is `true`: the FIRST bare-type arg found (e.g. `(a card)` in `to create (a
 *   card)`) is promoted to an instance method on that type's prototype instead of becoming a call
 *   argument.
 * - Trailing `:` is optional so both `to foo the bar` (no body) and `to foo the bar:` (body follows)
 *   parse.
 */
class to_do_something extends MethodDefinition<"asTest?|signature|body?"> {}
methods.addRule(to_do_something, {
  alias: "statement",
  // TODO: add tests for `test` case
  syntax: `to (asTest:test)? {signature:method_signature} :? {statement_body}?`,
  // promote the first captured type arg (e.g. `(a card)`) to an instance-method receiver
  inlineInitialType: true,
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
          output: ["/* SPELL: added rule: `start the game` */", "function start_the_game() {}"]
        },
        {
          title: "keyword-only signature - `it` is not defined",
          input: "to start the game: print it",
          output: [
            "/* SPELL: added rule: `start the game` */",
            "function start_the_game() {}",
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "non-escaped type arg in signature",
          input: "to create a card",
          output: ["/* SPELL: added rule: `create a card` */", "function create_a_card() {}"]
        },
        {
          title: "non-escaped type arg in signature - `it` is not defined",
          input: "to create a card: print it",
          output: [
            "/* SPELL: added rule: `create a card` */",
            "function create_a_card() {}",
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "simple arg in signature - arg is defined",
          input: "to notify (message): print the message",
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            `function notify_$message(message) {`,
            `\treturn spellCore.console.log(message)`,
            `}`
          ]
        },
        {
          title: "simple arg in signature - it is not defined",
          input: "to notify (message): print it",
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            "function notify_$message(message) {}",
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "typed simple arg in signature - arg is defined",
          input: "to notify (message as text): print the message",
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            `function notify_$message(message) {`,
            `\treturn spellCore.console.log(message)`,
            `}`
          ]
        },
        {
          title: "typed simple arg in signature - `it` is not defined",
          input: "to notify (message as text): print it",
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            "function notify_$message(message) {}",
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "valued simple arg in signature - arg is defined",
          input: 'to notify (message = "Really?"): print the message',
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            `function notify_$message(message = "Really?") {`,
            `\treturn spellCore.console.log(message)`,
            `}`
          ]
        },
        {
          title: "typed simple arg in signature - `it` is not defined",
          input: 'to notify (message = "Really?"): print it',
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            'function notify_$message(message = "Really?") {}',
            '/* PARSE ERROR: Don\'t understand "print it" */'
          ]
        },
        {
          title: "type arg in signature - thisVar",
          input: "to create (a card): print the card",
          output: [
            "/* SPELL: added rule: `create {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'create', {`,
            `\tvalue() {`,
            `\t\treturn spellCore.console.log(this)`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "type arg in signature - it",
          input: "to create (a card): print it",
          output: [
            "/* SPELL: added rule: `create {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'create', {`,
            `\tvalue() {`,
            `\t\treturn spellCore.console.log(this)`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "type arg in signature - its",
          input: "to create (a card): set its number to 1",
          output: [
            "/* SPELL: added rule: `create {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'create', {`,
            `\tvalue() {`,
            `\t\tthis.number = 1`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "multiple type args in signature - thisVar",
          input: "to add (a card) to (a pile): set the pile of the card to the pile",
          output: [
            "/* SPELL: added rule: `add {thisArg:expression} to {callArgs:expression}` */",
            `spellCore.define(Card.prototype, 'add_to_$pile', {`,
            `\tvalue(pile) {`,
            `\t\tthis.pile = pile`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "multiple type args in signature - it",
          input: "to add (a card) to (a pile): set the pile of it to the pile",
          output: [
            "/* SPELL: added rule: `add {thisArg:expression} to {callArgs:expression}` */",
            `spellCore.define(Card.prototype, 'add_to_$pile', {`,
            `\tvalue(pile) {`,
            `\t\tthis.pile = pile`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "multiple type args in signature - its",
          input: "to add (a card) to (a pile): set its pile to the pile",
          output: [
            "/* SPELL: added rule: `add {thisArg:expression} to {callArgs:expression}` */",
            `spellCore.define(Card.prototype, 'add_to_$pile', {`,
            `\tvalue(pile) {`,
            `\t\tthis.pile = pile`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "typed arg in signature -- arg name",
          input: "to show (thing as a card): print the thing",
          output: [
            "/* SPELL: added rule: `show {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'show', {`,
            `\tvalue() {`,
            `\t\treturn spellCore.console.log(this)`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "typed arg in signature -- thisVar",
          input: "to show (thing as a card): print the card",
          output: [
            "/* SPELL: added rule: `show {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'show', {`,
            `\tvalue() {`,
            `\t\treturn spellCore.console.log(this)`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "typed arg in signature -- it",
          input: "to show (thing as a card): print it",
          output: [
            "/* SPELL: added rule: `show {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'show', {`,
            `\tvalue() {`,
            `\t\treturn spellCore.console.log(this)`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "typed arg in signature -- its",
          input: "to show (thing as a card): print its name",
          output: [
            "/* SPELL: added rule: `show {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'show', {`,
            `\tvalue() {`,
            `\t\treturn spellCore.console.log(this.name)`,
            `\t}`,
            `})`
          ]
        },
        {
          title: "typed var in signature: implicit `it` gets remapped after `get`",
          input: ["to show (thing as a card)", "\tprint it", "\tget its name", "\tprint it"],
          output: [
            "/* SPELL: added rule: `show {thisArg:expression}` */",
            "spellCore.define(Card.prototype, 'show', {",
            "\tvalue() {",
            "\t\tspellCore.console.log(this)",
            "\t\tlet it = this.name",
            "\t\tspellCore.console.log(it)",
            "\t}",
            "})"
          ]
        },
        {
          title: "mixed vars in signature",
          input: "to prompt (message as text) and (reply)",
          output: [
            "/* SPELL: added rule: `prompt {callArgs:expression} and {callArgs:expression}` */",
            "function prompt_$message_and_$reply(message, reply) {}"
          ]
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
          output: [
            "/* SPELL: added rule: `start the game` */",
            `function start_the_game() {`,
            `\tspellCore.console.log(1)`,
            `}`,
            `start_the_game()`
          ]
        },
        {
          title: "top level simple argument method",
          input: ["to notify (message): print the message", "notify 1"],
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            `function notify_$message(message) {`,
            `\treturn spellCore.console.log(message)`,
            `}`,
            "notify_$message(1)"
          ]
        },
        {
          title: "top level typed simple argument method",
          input: ["to notify (message as text): print the message", "notify 1"],
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression}` */",
            `function notify_$message(message) {`,
            `\treturn spellCore.console.log(message)`,
            `}`,
            `notify_$message(1)`
          ]
        },
        {
          title: "type arg in signature",
          input: ["to show (a card): print the card", "show a new card"],
          output: [
            "/* SPELL: added rule: `show {thisArg:expression}` */",
            `spellCore.define(Card.prototype, 'show', {`,
            `\tvalue() {`,
            `\t\treturn spellCore.console.log(this)`,
            `\t}`,
            `})`,
            "new Card().show()"
          ]
        },
        {
          title: "multiple type args in signature",
          input: ["to play (a card) on (a pile): set its pile to the pile", "play a new card on a new pile"],
          output: [
            "/* SPELL: added rule: `play {thisArg:expression} on {callArgs:expression}` */",
            `spellCore.define(Card.prototype, 'play_on_$pile', {`,
            `\tvalue(pile) {`,
            `\t\tthis.pile = pile`,
            `\t}`,
            `})`,
            "new Card().play_on_$pile(new Pile())"
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
          output: '/* PARSE ERROR: Don\'t understand "to (foo)" */'
        },
        {
          title: "with arg is optional when calling",
          input: ["to notify (with message):", "\tprint the message", "notify"],
          output: [
            "/* SPELL: added rule: `notify (with {props:object_literal_properties})?` */",
            "function notify(props = {}) {",
            "\tlet { message } = props",
            "\tspellCore.console.log(message)",
            "}",
            "notify()"
          ]
        },

        {
          title: "simple variable props",
          input: ["to notify (with message):", "\tprint the message", 'notify with message = "It worked!"'],
          output: [
            "/* SPELL: added rule: `notify (with {props:object_literal_properties})?` */",
            "function notify(props = {}) {",
            "\tlet { message } = props",
            "\tspellCore.console.log(message)",
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
          output: [
            "/* SPELL: added rule: `play (with {props:object_literal_properties})?` */",
            "function play(props = {}) {",
            "\tlet { card } = props",
            "\tspellCore.console.log(card)",
            "}",
            "play({ card: new Card() })",
            'play({ card: new Card({ suit: "hearts" }) })'
          ]
        },
        {
          title: "default value props",
          input: ['to notify (with message = "nope"):', "\tprint the message", 'notify with message = "Ship it!!"'],
          output: [
            "/* SPELL: added rule: `notify (with {props:object_literal_properties})?` */",
            "function notify(props = {}) {",
            '\tlet { message = "nope" } = props',
            "\tspellCore.console.log(message)",
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
          output: [
            "/* SPELL: added rule: `notify (with {props:object_literal_properties})?` */",
            "function notify(props = {}) {",
            '\tlet { message = "nope", reply = "yep" } = props',
            "\tspellCore.console.log(message + reply)",
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
          output: [
            "/* SPELL: added rule: `notify (with {props:object_literal_properties})?` */",
            "function notify(props = {}) {",
            '\tlet { name, message, reply = "yep" } = props',
            "\tspellCore.console.log((name + message) + reply)",
            "}",
            "notify({",
            '\tname: "Bob",',
            '\tmessage: "How many?",',
            "\treply: 2",
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
          output: [
            "/* SPELL: added rule: `notify {callArgs:expression} (with {props:object_literal_properties})?` */",
            "function notify_$message(message, props = {}) {",
            '\tlet { reply = "yep" } = props',
            "\tspellCore.console.log(message)",
            "\tspellCore.console.log(reply)",
            "}",
            'notify_$message("Really?", { reply: "yes" })'
          ]
        },
        {
          title: "extra props passed in are OK",
          input: [
            "to notify (with message):",
            "\tprint the message",
            `notify with message = "It worked!" and reply = "No it didn't"`
          ],
          output: [
            "/* SPELL: added rule: `notify (with {props:object_literal_properties})?` */",
            "function notify(props = {}) {",
            "\tlet { message } = props",
            "\tspellCore.console.log(message)",
            "}",
            `notify({ message: "It worked!", reply: "No it didn't" })`
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
class create_animation extends MethodDefinition<"asAnimation|signature|body?"> {}
methods.addRule(create_animation, {
  alias: "statement",
  syntax: `(asAnimation:create? animation) {signature:method_signature} :? {statement_body}?`,
  // NOTE: `inlineInitialType` is declared as a plain field on `MethodDefinition` (TS doesn't allow a
  // subclass to override a field with an accessor), so set the default the same way `to_do_something` does.
  inlineInitialType: true,
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
          output: [
            "/* SPELL: added rule: `deal the cards` */",
            "async function deal_the_cards() {",
            "\tif (spellCore.processIsRunning('deal_the_cards')) { return }",
            "\tspellCore.startProcess('deal_the_cards', 'EXCLUSIVE')",
            "\ttry {}",
            "\tfinally {",
            "\t\tspellCore.stopProcess('deal_the_cards')",
            "\t}",
            "}"
          ]
        },
        {
          input: ["animation deal the cards", "\tpause for 10 seconds"],
          output: [
            "/* SPELL: added rule: `deal the cards` */",
            "async function deal_the_cards() {",
            "\tif (spellCore.processIsRunning('deal_the_cards')) { return }",
            "\tspellCore.startProcess('deal_the_cards', 'EXCLUSIVE')",
            "\ttry {",
            "\t\tawait spellCore.pauseFor(10, 'seconds')",
            "\t}",
            "\tfinally {",
            "\t\tspellCore.stopProcess('deal_the_cards')",
            "\t}",
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
 * - `precedence: 9` -- defers to more specific method-definition rules in `classes.ts` (e.g.
 *   `define_property_has`) when both could match the same tokens.
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
class quoted_type_expression extends MethodDefinition<"type|signature|body?"> {
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
    }
    return match
  }

  /**
   * Turn the quoted signature into a postfix (no args) or infix (one arg) expression on `groups.type`.
   * - SIDE EFFECT: sets `signature.instanceType` directly from the OUTER `{type:singular_type}`
   *   capture -- bypasses `MethodDefinition`'s normal inline-type-promotion path (`inlineInitialType`)
   *   entirely, since the type here is captured outside the (quoted) signature, not inside it.
   * - Zero args => `asPostfixExpression`; one arg => `asInfixExpression` and its single
   *   `{callArgs:expression}` syntax bit is rewritten to `{expression:simple_expression}` (see
   *   `getRule()`'s infix-rule branch).
   * - More than one arg isn't handled (see `parse()`'s rejection above) -- the `TODO` in the `else`
   *   branch notes the unimplemented `{thisArg:simple_expression}` prefix for that case.
   * - Rewrites the FIRST `is`/`can`/`will`/`has` bit found (scanning signature order) into an
   *   `(operator:...)` alternation so all its negated spellings (`is not`, `isn't`, `isnt`, etc.) share
   *   one compiled rule; `shouldNegateOutput()` then flips `P.ASTExpression` output for a match on
   *   anything other than the bare positive form.
   */
  processSignature(groups: P.MatchGroups & { type: P.Match }, signature: MethodSignatureData): MethodSignatureData {
    signature.instanceType = groups.type.raw
    if (signature.args.length === 0) {
      signature.asPostfixExpression = true
    } else if (signature.args.length === 1) {
      signature.asInfixExpression = true
      signature.syntaxBits = signature.syntaxBits.map((bit) =>
        bit.startsWith("{") ? "{expression:simple_expression}" : bit
      )
    } else {
      // TODO: we don't handle this currently...
      // signature.syntaxBits.unshift("{thisArg:simple_expression}")
    }
    // convert "is", "has", "can", "will" to negatable expression
    if (signature.asPostfixExpression || signature.asInfixExpression) {
      let foundOne = false
      const NEGATABLES: Record<string, [string, (operator: P.Match) => boolean]> = {
        is: ["(operator:is not?|isn't|isnt)", (op) => op.value !== "is"],
        can: ["(operator:can not?|cannot|can't|cant)", (op) => op.value !== "can"],
        will: ["(operator:will not?|won't|wont)", (op) => op.value !== "will"],
        has: ["(operator:has|does not have|doesn't have|doesnt have)", (op) => op.value !== "has"]
      }
      signature.syntaxBits = signature.syntaxBits.map((bit) => {
        const negatable = NEGATABLES[bit]
        if (foundOne || !negatable) return bit
        foundOne = true
        signature.shouldNegateOutput = negatable[1]
        return negatable[0]
      })
    }
    // console.warn(signature)
    return signature
  }
}
methods.addRule(quoted_type_expression, {
  precedence: 9, // defer to more-specific methods in `classes`, e.g. `define_property_has`, ...
  alias: "statement",
  syntax: "(a|an) {type:singular_type} {signature:quoted_method_signature} (if|is)? :? {expression_body}?",
  tests: [
    {
      title: "fails if",
      compileAs: "block",
      tests: [
        {
          title: "signature is empty",
          input: `a thing "" if`,
          output: `/* PARSE ERROR: Don't understand "a thing "" if" */`
        },
        {
          title: "signature doesn't start with a keyword",
          input: `a thing "(thing)" if`,
          output: `/* PARSE ERROR: Don't understand "a thing "(thing)" if" */`
        },
        {
          title: "more than one arg specified",
          input: `a thing "(thing) but (thing)" if`,
          output: `/* PARSE ERROR: Don't understand "a thing "(thing) but (thing)" if" */`
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
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} nerds out\` */`,
            `spellCore.define(Thing.prototype, 'nerds_out', {`,
            `\tget() {}`,
            `})`,
            `if (new Thing().nerds_out) {}`
          ]
        },
        {
          title: "no if",
          input: [`a thing "nerds out": never`, `if a new thing nerds out`],
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} nerds out\` */`,
            `spellCore.define(Thing.prototype, 'nerds_out', {`,
            `\tget() {`,
            `\t\treturn false`,
            `\t}`,
            `})`,
            `if (new Thing().nerds_out) {}`
          ]
        },
        {
          title: "inline expression",
          input: [`a thing "nerds out" if yes`, `if a new thing nerds out`],
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} nerds out\` */`,
            `spellCore.define(Thing.prototype, 'nerds_out', {`,
            `\tget() {`,
            `\t\treturn true`,
            `\t}`,
            `})`,
            `if (new Thing().nerds_out) {}`
          ]
        },
        {
          title: "indented method body",
          input: [`a thing "nerds out" if`, `\treturn yes`, `if a new thing nerds out`],
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} nerds out\` */`,
            `spellCore.define(Thing.prototype, 'nerds_out', {`,
            `\tget() {`,
            `\t\treturn true`,
            `\t}`,
            `})`,
            `if (new Thing().nerds_out) {}`
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
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} nerds out with {expression:simple_expression}\` */`,
            `spellCore.define(Thing.prototype, 'nerds_out_with_$another', {`,
            `\tvalue(another) {}`,
            `})`,
            `if (new Thing().nerds_out_with_$another(new Thing())) {}`
          ]
        },
        {
          title: "inline expression",
          input: [`a thing "nerds out with (another as a thing)" if yes`, `if a new thing nerds out with a new thing`],
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} nerds out with {expression:simple_expression}\` */`,
            `spellCore.define(Thing.prototype, 'nerds_out_with_$another', {`,
            `\tvalue(another) {`,
            `\t\treturn true`,
            `\t}`,
            `})`,
            `if (new Thing().nerds_out_with_$another(new Thing())) {}`
          ]
        },
        {
          title: "indented method body",
          input: [
            `a thing "nerds out with (another as a thing)" if`,
            `\treturn yes`,
            `if a new thing nerds out with a new thing`
          ],
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} nerds out with {expression:simple_expression}\` */`,
            `spellCore.define(Thing.prototype, 'nerds_out_with_$another', {`,
            `\tvalue(another) {`,
            `\t\treturn true`,
            `\t}`,
            `})`,
            `if (new Thing().nerds_out_with_$another(new Thing())) {}`
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
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} (operator:is not?|isn't|isnt) a bug\` */`,
            `spellCore.define(Thing.prototype, 'is_a_bug', {`,
            `\tget() {}`,
            `})`,
            `if (new Thing().is_a_bug) {}`,
            `if (!new Thing().is_a_bug) {}`,
            `if (!new Thing().is_a_bug) {}`,
            `if (!new Thing().is_a_bug) {}`
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
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} (operator:can not?|cannot|can't|cant) play\` */`,
            `spellCore.define(Thing.prototype, 'can_play', {`,
            `\tget() {}`,
            `})`,
            `if (new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`,
            `if (!new Thing().can_play) {}`
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
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} (operator:will not?|won't|wont) blow up\` */`,
            `spellCore.define(Thing.prototype, 'will_blow_up', {`,
            `\tget() {}`,
            `})`,
            `if (new Thing().will_blow_up) {}`,
            `if (!new Thing().will_blow_up) {}`,
            `if (!new Thing().will_blow_up) {}`,
            `if (!new Thing().will_blow_up) {}`
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
          output: [
            `/* SPELL: added expression \`{thing:simple_expression} (operator:has|does not have|doesn't have|doesnt have) a friend\` */`,
            `spellCore.define(Thing.prototype, 'has_a_friend', {`,
            `\tget() {}`,
            `})`,
            `if (new Thing().has_a_friend) {}`,
            `if (!new Thing().has_a_friend) {}`,
            `if (!new Thing().has_a_friend) {}`,
            `if (!new Thing().has_a_friend) {}`
          ]
        }
      ]
    }
  ]
})
