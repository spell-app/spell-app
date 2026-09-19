import { isNode } from "browser-or-node"

import { instanceCase, typeCase } from "~/util"
import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"
import { SpellStatement } from "./Statement"
import { SpellType } from "./types"
import { VariableIdentifier } from "./variables"
import { PostfixOperatorSuffix, InfixOperatorSuffix } from "./expressions"

/** Info about a `{type}` capture within a method signature, e.g. the `(a card)` in `to create (a card)`. */
type MethodTypeInfo = {
  name: string
  varName: string | undefined
  isSimple: boolean
  argIndex: number
  methodIndex: number
  syntaxIndex: number
}

/** Extra random variable to add to a method's nested scope, e.g. an alias for `this`. */
type MethodExtraVar = string | { name: string; output?: string; type?: string }

/**
 * `match.groups` shape shared by the `method_arg`/`simple_method_arg` alternatives
 * (`var_method_arg`, `valued_var_method_arg`, `type_method_arg`, `typed_method_arg`, `with_props_arg`)
 * and by `method_keyword`. Each of these rules only ever fills in a subset of these fields.
 */
type MethodArgGroups = P.MatchGroups & {
  keyword?: P.Match
  variable?: P.Match
  type?: P.Match
  method?: string
  syntax?: string
  arg?: AST.VariableExpression
  props?: AST.VariableExpression[]
  items?: P.Match[]
}

/**
 * Data built up by `method_signature`'s `getGroupsForMatch()`, then further mutated by
 * `MethodDefinition.processSignature()` (and overrides, e.g. `quoted_type_expression`).
 */
type MethodSignatureData = {
  items: MethodArgGroups[]
  /** `true` if the first item is a keyword. */
  startsWithKeyword: boolean
  /** `true` if we found at least one keyword. Arg-only signatures are invalid! */
  foundKeyword: boolean
  /** Method signature bits. Converted to `methodName` string at end of `getGroupsForMatch()`. */
  methodBits: string[]
  /** Rule syntax bits. Converted to a string at end of `getGroupsForMatch()`. */
  syntaxBits: string[]
  /** Types we found in the signature. */
  types: MethodTypeInfo[]
  /** Method arguments, as `AST.VariableExpression`s. */
  args: AST.VariableExpression[]
  /** Random extra vars we should enable (e.g. aliases for `this`). */
  extraVars: MethodExtraVar[]
  /** `with_props_arg`'s props, if any. */
  props: AST.VariableExpression[] | undefined
  /** Full methodName from `methodBits`, set at the end of `getGroupsForMatch()`. */
  methodName: string | undefined
  /** Full method syntax, set at the end of `getGroupsForMatch()`. */
  syntax: string | undefined
  /** Type to add an instance method to, set by `processSignature()`. */
  instanceType: string | undefined
  // Set by `MethodDefinition.processSignature()` / `quoted_type_expression.processSignature()`:
  asPostfixExpression?: boolean
  asInfixExpression?: boolean
  shouldNegateOutput?: (operator: P.Match) => boolean
}

/** `match.groups` returned by `method_signature`'s own `getGroupsForMatch()`. */
type MethodSignatureGroups = P.MatchGroups & MethodSignatureData

/** `match.groups` for `MethodDefinition` (and subclasses), once `getGroupsForMatch()` has processed `signature`. */
type MethodDefinitionGroups = P.MatchGroups & {
  signature: MethodSignatureData
  asTest?: P.Match
  asAnimation?: P.Match
  inlineStatement?: P.Match
  nestedBlock?: P.Match
}

/** `match.groups` for `DynamicMethodRule`, once `getGroupsForMatch()` has normalized `callArgs` to an array. */
type DynamicMethodRuleGroups = P.MatchGroups & {
  thisArg?: P.Match
  callArgs?: P.Match[]
  props?: P.Match
}

/** Operands passed to `compileASTExpression()` -- matches the (unexported) type of the same name in `./expressions`. */
type OperatorOperands = {
  operator: P.Match
  lhs?: AST.Expression
  rhs?: AST.Expression
}

/**
 * Abstract class for a dynamic method created with `to_do_something` below.
 */
export class DynamicMethodRule extends SpellStatement {
  declare methodName: string
  static {
    Object.defineProperty(this.prototype, "methodName", { value: undefined, writable: true })
  }

  // Normalize `callArgs` to an array
  getGroupsForMatch(match: P.Match): DynamicMethodRuleGroups {
    const groups = super.getGroupsForMatch(match) as P.MatchGroups
    const { callArgs } = groups
    if (callArgs && !Array.isArray(callArgs)) groups.callArgs = [callArgs]
    return groups as DynamicMethodRuleGroups
  }

  getAST(match: P.Match<DynamicMethodRuleGroups>): AST.MethodInvocation | AST.ScopedMethodInvocation {
    const { methodName } = this
    const { thisArg, callArgs, props } = match.groups
    const thing = thisArg?.AST as AST.Expression | undefined
    // `match.AST` is typed as the generic `ASTNode` (from `Rule.getAST()`); `callArgs`/`props` are always
    // parsed via `{callArgs:expression}` / `object_literal_properties`, so their AST is always an Expression.
    const args = (callArgs?.map((arg) => arg.AST) ?? []) as AST.Expression[]
    // Add `props` to the end of the args if found.
    // NOTE: This assumes that all inline arguments are REQUIRED by the syntax.
    //       If we decide to match syntax with optional args we'll need to update this.
    if (props) args.push(props.AST as AST.Expression)

    // if `thing` is defined, method is scoped
    if (thing) return new AST.ScopedMethodInvocation(match, { thing, methodName, args })
    return new AST.MethodInvocation(match, { methodName, args })
  }
}
SpellParser.Rules.DynamicMethodRule = DynamicMethodRule

/** Base for method definitions with dynamic syntax via `method_signature`. See `to_do_something` below. */
export class MethodDefinition extends SpellStatement {
  declare inlineInitialType: boolean
  static {
    Object.defineProperty(this.prototype, "inlineInitialType", { value: false, writable: true })
    Object.defineProperty(this.prototype, "wantsInlineStatement", { value: true, writable: true })
    Object.defineProperty(this.prototype, "wantsNestedBlock", { value: true, writable: true })
  }

  // Iniline initial type epression, making an instance method?
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

  getGroupsForMatch(match: P.Match): MethodDefinitionGroups {
    const groups = super.getGroupsForMatch(match) as P.MatchGroups
    const signatureMatch = groups.signature
    if (!(signatureMatch instanceof P.Match)) return groups as MethodDefinitionGroups

    const signature = this.processSignature(groups, signatureMatch.groups as MethodSignatureGroups)
    signature.methodName = signature.methodBits.join("_")
    signature.syntax = signature.syntaxBits.join(" ")

    // `signature` group starts out as a `Match` (from `{signature:method_signature}`); replace it here with
    // the processed, flattened `MethodSignatureData` -- see `MethodDefinitionGroups`.
    return { ...groups, signature } as MethodDefinitionGroups
  }

  getNestedScopeForMatch(match: P.Match<MethodDefinitionGroups>): P.MethodScope {
    const { methodName, args, extraVars, instanceType } = match.groups.signature
    const methodScope = new P.MethodScope({
      parentScope: match.scope,
      name: methodName,
      args: args.map((arg) => new P.ScopeVariable(arg.name)),
      thisVar: instanceType,
      mapItTo: instanceType && "this"
    })

    // add other random variables
    if (extraVars.length) methodScope.variables.add(...extraVars)
    return methodScope
  }

  mutateScope(match: P.Match<MethodDefinitionGroups>): void {
    match.scope.rules?.add(this.getRule(match))
  }

  getRuleAnnotation(match: P.Match<MethodDefinitionGroups>): string {
    const { syntax, asPostfixExpression, asInfixExpression } = match.groups.signature
    if (asPostfixExpression) return `added expression \`{thing:simple_expression} ${syntax}\``
    if (asInfixExpression) return `added expression \`{thing:simple_expression} ${syntax}\``
    return `added rule: \`${match.groups.signature.syntax}\``
  }

  getRule(match: P.Match<MethodDefinitionGroups>): P.RuleDefinition {
    const {
      asTest,
      signature: {
        methodName = "",
        syntax = "",
        asPostfixExpression,
        asInfixExpression,
        shouldNegateOutput = () => false
      }
    } = match.groups

    if (asPostfixExpression) {
      return {
        name: methodName,
        precedence: 20,
        alias: "expression_suffix",
        syntax,
        constructor: class _dynamicMethodRulePostfix extends PostfixOperatorSuffix {
          shouldNegateOutput(operator: P.Match): boolean {
            return shouldNegateOutput(operator)
          }
          compileASTExpression(_match: P.Match, { lhs }: OperatorOperands): AST.Expression {
            return new AST.PropertyExpression(_match, {
              // `lhs` is always populated for a `PostfixOperatorSuffix`.
              object: lhs!,
              property: new AST.PropertyLiteral(_match, methodName)
            })
          }
        }
      }
    }
    if (asInfixExpression) {
      return {
        name: methodName,
        precedence: 20,
        alias: "expression_suffix",
        syntax,
        parenthesize: true,
        constructor: class _dynamicMethodRuleInfix extends InfixOperatorSuffix {
          shouldNegateOutput(operator: P.Match): boolean {
            return shouldNegateOutput(operator)
          }
          compileASTExpression(_match: P.Match, { lhs, rhs }: OperatorOperands): AST.Expression {
            // `lhs`/`rhs` are always populated for an `InfixOperatorSuffix`.
            return new AST.ScopedMethodInvocation(match, {
              thing: lhs!,
              methodName,
              args: [rhs!]
            })
          }
        }
      }
    }
    return {
      name: methodName,
      alias: asTest ? "statement" : ["statement", "expression"],
      constructor: DynamicMethodRule,
      syntax,
      methodName
    }
  }

  /** If `signature.props` return `DestructuredAssignment` to pull those props into scope. */
  getPropsAssignment(match: P.Match<MethodDefinitionGroups>): AST.DestructuredAssignment | undefined {
    const { props } = match.groups.signature
    if (!props) return undefined
    return new AST.DestructuredAssignment(match, {
      // `props` argument will be the last thing in args
      thing: new AST.VariableExpression(match, { name: "props" }),
      variables: props,
      isNewVariable: true
    })
  }

  getAST(match: P.Match<MethodDefinitionGroups>): AST.StatementGroup {
    const { asTest, asAnimation, signature, inlineStatement, nestedBlock } = match.groups
    const { methodName = "", args, props, instanceType, asPostfixExpression } = signature
    const output: Array<AST.Statement | AST.Expression | AST.Comment | AST.BlankLine> = [
      new AST.ParserAnnotation(match, {
        value: this.getRuleAnnotation(match)
      })
    ]

    const method = new AST.MethodDefinition(match, {
      methodName,
      args,
      // `nestedBlock`/`inlineStatement`'s `.AST` is generically typed `ASTNode`, but is always a
      // StatementBlock/Statement/Expression by construction of block / inline-statement parsing.
      body: (nestedBlock || inlineStatement)?.AST as AST.StatementBlock | AST.Statement | AST.Expression | undefined
    })

    if (asTest) {
      // HACK: echo all non-console / non-expect lines inside the test so we can tell what's going on!
      const statements: Array<AST.Statement | AST.Expression | AST.Comment | AST.BlankLine> = []
      method.body.statements?.forEach((line) => {
        // `echoInTests` is only declared on some AST node subclasses (e.g. `EchoInvocation`, `StatementGroup`),
        // not on the shared `Statement`/`Expression` base -- read it duck-typed here.
        const echoInTests = (line as unknown as { echoInTests?: boolean }).echoInTests
        if ((line instanceof AST.Statement || line instanceof AST.Expression) && echoInTests !== false) {
          statements.push(
            new AST.EchoInvocation(line.match, { methodName: "echoTestAction", expression: line.match.value })
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
      method.body = new AST.StatementBlock(match, {
        statements: [
          new AST.StartProcessInvocation(match, { name: methodName, exclusive: true }),
          new AST.TryCatchBlock(match, {
            body: method.body || new AST.StatementBlock(match),
            finallyBlock: new AST.StopProcessInvocation(match, { name: methodName })
          })
        ]
      })
    }

    if (instanceType) {
      if (asPostfixExpression) {
        // console.warn("APE:", method)
        output.push(
          new AST.PropertyDefinition(match, {
            thing: new AST.PrototypeExpression(match, {
              type: typeCase(instanceType)
            }),
            property: methodName,
            get: method
          })
        )
      } else {
        output.push(
          new AST.PropertyDefinition(match, {
            thing: new AST.PrototypeExpression(match, {
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
        new AST.MethodDefinition(match, {
          methodName,
          body: new AST.CoreMethodInvocation(match, {
            methodName: "test",
            args: [new AST.QuotedExpression(match, signature.methodBits.join(" ")), method]
          })
        })
      )
    } else {
      output.push(method)
    }

    return new AST.StatementGroup(match, { statements: output })
  }
}
SpellParser.Rules.MethodDefinition = MethodDefinition

// to foo the bar
// to foo (a thing)
// to foo (a thing) in (a thing)
// to foo (bar)
// to foo the (bar as text)
// to foo (with bar)
// to foo (with a bar)
// to foo (with baz = "baz")
// to foo (with bar as text)
// to foo (with bar and baz = "baz" and bong as text)
export const methods = new SpellParser({
  module: "methods",
  rules: [
    {
      name: "method_keyword",
      pattern: /^[a-zA-Z][\w-]*$/,
      constructor: class method_keyword extends P.Pattern {
        // convert dashes to underscores when compiling
        mapValue<T = string>(value: string): T {
          return `${value}`.replace(/-/g, "_") as T
        }
        getGroupsForMatch(match: P.Match): MethodArgGroups {
          return {
            keyword: match,
            method: match.value,
            syntax: match.raw
          } as MethodArgGroups
        }
      }
    },
    {
      name: "var_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      constructor: class method_arg extends VariableIdentifier {
        getGroupsForMatch(match: P.Match): MethodArgGroups {
          return {
            variable: match,
            method: `$${match.value}`,
            syntax: "{callArgs:expression}",
            arg: new AST.VariableExpression(match, { name: match.value, type: "argument" })
          } as MethodArgGroups
        }
      }
    },
    {
      name: "valued_var_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      syntax: `{variable_identifier} (=|is|of|as|set to) {value:expression}`,
      constructor: class valued_var_method_arg extends SpellStatement {
        getGroupsForMatch(match: P.Match): MethodArgGroups {
          const [variable, , value] = match.matched as P.Match[]
          const groups = {
            variable,
            method: `$${variable.value}`,
            syntax: "{callArgs:expression}",
            arg: new AST.VariableExpression(match, {
              name: variable.value,
              default: value.AST as AST.Expression,
              type: "argument"
            })
          }
          // console.warn("valued_method_arg:", variable, value, "\n", groups)
          return groups as MethodArgGroups
        }
      }
    },
    {
      name: "type_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      syntax: `(a|an) {type}`,
      constructor: class type_method_arg extends P.Sequence {
        getGroupsForMatch(match: P.Match): MethodArgGroups {
          const type = match.matched[1] as P.Match
          return {
            type,
            method: `$${type.raw}`, // TODO: instanceCase(type.value) ???
            syntax: "{callArgs:expression}",
            arg: new AST.VariableExpression(match, { name: instanceCase(type.value), type: "argument" })
          } as MethodArgGroups
        }
      }
    },
    {
      name: "typed_method_arg",
      alias: ["method_arg", "simple_method_arg"],
      syntax: `{variable_identifier} as (a|an)? {type}`,
      constructor: class type_method_arg extends P.Sequence {
        getGroupsForMatch(match: P.Match): MethodArgGroups {
          const [variable, , type] = match.matched as P.Match[]
          // `VariableExpressionProps` doesn't declare `datatype` (even though it's a real, settable field
          // inherited from `ASTNode`) -- set it via the accessor instead of the constructor props.
          const arg = new AST.VariableExpression(match, { name: variable.value, type: "argument" })
          arg.datatype = type.value
          return {
            variable,
            type,
            method: `$${variable.value}`,
            syntax: "{callArgs:expression}",
            arg
          } as MethodArgGroups
        }
      }
    },
    {
      name: "with_props_arg",
      alias: ["method_arg"],
      syntax: "with [{simple_method_arg}(,|and)]",
      constructor: class type_method_arg extends P.Sequence {
        getGroupsForMatch(match: P.Match): MethodArgGroups {
          const { items } = match.matched[1] as P.Match
          const props = items.map((item) => (item.groups as MethodArgGroups).arg) as AST.VariableExpression[]
          const groups = {
            items,
            method: undefined, // not part of method signature
            syntax: "(with {props:object_literal_properties})?",
            props,
            arg: new AST.VariableExpression(match, {
              name: "props",
              default: new AST.ObjectLiteral(match),
              type: "argument"
            })
          }
          return groups as MethodArgGroups
        }
      }
    },
    {
      name: "method_signature",
      syntax: `({method_keyword}|\\({method_arg}\\))+`,
      constructor: class method_signature extends P.Repeat {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens) as P.Match<MethodSignatureGroups> | undefined
          // forget it if we didn't find at least one keyword
          if (match && match.groups.foundKeyword) return match
          return undefined
        }
        getGroupsForMatch(match: P.Match): MethodSignatureGroups {
          const groups: MethodSignatureData = {
            items: match.items.map(
              (item) =>
                (item.matched.length === 1 ? item.groups : (item.matched[1] as P.Match).groups) as MethodArgGroups
            ),
            // calculated as we run through the keywords
            startsWithKeyword: false, // `true` if first item is a keyword.
            foundKeyword: false, // `true` if we found at least one keyword.  arg-only signatures are invalid!
            methodBits: [], // method signature bits.  Converted to `methodName` string at end of getGroupsForMatch().
            syntaxBits: [], // rule syntax bits.  Converted to string at end of this method.
            types: [], // types we found, as `{ raw: instanceCase, simple, arg: number, method: number, syntax: number }`
            args: [], // method arguments, as `AST.VariableExpression`s
            extraVars: [], // random extra vars we should enable (e.g. aliases for `this`)
            // calculated at the end
            props: undefined, // array of AST.VariableExpression for `with_props_arg`
            methodName: undefined, // full methodName from `methodBits` array, set elsewhere
            syntax: undefined, // full method syntax, set elsewhere
            instanceType: undefined // type to add instance method to, set elsewhere
          }
          // Set up the method signature and rule syntax
          // We'll get one of the following combos: keyword, type, variable, variable + type
          groups.items.forEach(({ method, syntax, arg, props, keyword, type /* , variable */ }, index) => {
            // TODO: HOW to know if we should sequester type???

            // arg-only methods are not allowed
            if (keyword) {
              groups.foundKeyword = true
              if (index === 0) groups.startsWithKeyword = true
            }

            const varName = arg?.name

            // Convert to an instance method???
            if (type) {
              // `type` is always a `SpellType`/`Pattern` match, which always sets `.raw`.
              const typeRaw = type.raw!
              groups.types.push({
                name: typeRaw,
                varName,
                isSimple: SpellType.isSimpleType(typeRaw),
                argIndex: groups.args.length,
                methodIndex: groups.methodBits.length,
                syntaxIndex: groups.syntaxBits.length
              })
            }

            if (method) groups.methodBits.push(method)
            if (syntax) groups.syntaxBits.push(syntax)
            if (arg) {
              groups.args.push(arg)
            }

            // Recognize prop names in the method
            if (props) {
              groups.props = props
              groups.extraVars.push(...props.map((prop) => prop.name))
            }
          })

          return groups as MethodSignatureGroups
        }
      }
    },
    /** Method signature surrounded by quotes.  A "good idea"??? */
    {
      name: "quoted_method_signature",
      tokenType: P.Tokens.Text,
      constructor: class quoted_method_signature extends P.TokenType {
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          const signature =
            match &&
            (scope.parse(JSON.parse(match.value), "method_signature") as P.Match<MethodSignatureGroups> | undefined)
          if (!signature || !signature.groups.foundKeyword) return undefined
          // Swizzle tokens & matched to reflect the original match
          signature.tokens = match.tokens
          signature.matched = [match]
          return signature
        }
      }
    },
    {
      name: "to_do_something",
      alias: "statement",
      // TODO: add tests for `test` case
      syntax: `to (asTest:test)? {signature:method_signature} :?`,
      constructor: class to_do_something extends MethodDefinition {
        static {
          Object.defineProperty(this.prototype, "inlineInitialType", { value: true, writable: true })
        }
      },
      tests: [
        {
          title: "inline method signatures & variables",
          compileAs: "block",
          beforeEach(scope) {
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
          beforeEach(scope) {
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
          beforeEach(scope) {
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
    },

    {
      name: "create_animation",
      alias: "statement",
      syntax: `(asAnimation:create? animation) {signature:method_signature} :?`,
      constructor: class create_animation extends MethodDefinition {
        // NOTE: `inlineInitialType` is declared as a plain field on `MethodDefinition` (TS doesn't allow a
        // subclass to override a field with an accessor), so set the default the same way `to_do_something` does.
        static {
          Object.defineProperty(this.prototype, "inlineInitialType", { value: true, writable: true })
        }
      },
      tests: [
        {
          title: "inline method signatures & variables",
          compileAs: "block",
          beforeEach(scope) {
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
    },

    {
      name: "quoted_type_expression",
      precedence: 9, // defer to more-specific methods in `classes`, e.g. `define_property_has`, ...
      alias: "statement",
      syntax: "(a|an) {type:singular_type} {signature:quoted_method_signature} (if|is)? :?",
      constructor: class quoted_type_expression extends MethodDefinition {
        // NOTE: `parseInlineStatementAs` is declared as a plain field on `SpellStatement` (TS doesn't allow a
        // subclass to override a field with an accessor), so set the default via `Object.defineProperty` instead.
        static {
          Object.defineProperty(this.prototype, "parseInlineStatementAs", { value: "expression", writable: true })
        }
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens) as P.Match<MethodDefinitionGroups> | undefined
          if (match) {
            const { signature } = match.groups
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
        processSignature(
          groups: P.MatchGroups & { type: P.Match },
          signature: MethodSignatureData
        ): MethodSignatureData {
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
      },
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
              input: [
                `a thing "nerds out with (another as a thing)" if yes`,
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
    }
  ]
})
