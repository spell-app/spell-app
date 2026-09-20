import { P, AST } from "~/parser"
// Import directly to avoid circular import
import { SpellParser } from "~/languages/spell/SpellParser"

/**
 * Narrow `node` (typed generically as `AST.ASTNode | undefined`) to concrete AST subclass `T`.
 * - `T` is chosen by inspection: referenced sub-rule's `getAST()` is known to always produce it.
 */
function ast<T extends AST.ASTNode>(node: AST.ASTNode | undefined): T {
  return node as T
}

export const JSX = new SpellParser({
  module: "JSX",
  rules: [
    /**
     * Match a JSX element (`<tag attr=.../>` or `<tag>...</tag>`) as an `expression`/`jsxChild`.
     * - Delegates tokenizing entirely to `P.Tokens.JSXElement`; `parse()` re-parses each attribute/child
     *   token through `jsxAttribute`/`jsxChild` (falling back to `parse_error` for unparseable children).
     * - Compiles to `spellCore.element({ tag, props, children })`.
     */
    {
      name: "jsxElement",
      alias: ["jsxChild", "expression"],
      tokenType: P.Tokens.JSXElement,
      constructor: class SpellJSX extends P.TokenType {
        /** Parse element's `attributes`/`children` tokens (see note below re: calling `parser.parse()` directly). */
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          if (match.matched.length !== 1) throw new TypeError("Can only handle a single JSXElement at a time!")
          const [element] = match.matched as [P.Tokens.JSXElement]
          // `Scope.parse()` only accepts a `string` for `text`, but we have actual `Token`s here -- call
          // `scope.parser.parse()` directly instead (same workaround `SpellCSSFile.parse()` uses).
          match.attributes = element.attributes?.map((attr) => scope.parser?.parse(attr, "jsxAttribute", scope))
          match.children = element.children?.map(
            (child) => scope.parser?.parse(child, "jsxChild", scope) || scope.parser?.parse(child, "parse_error", scope)
          )
          // console.warn(match)
          return match
        }

        /** Build `AST.JSXElement`; drops falsy child ASTs (e.g. blank `jsxText`) via `.filter(Boolean)`. */
        getAST(match: P.Match) {
          const { tagName } = match.matched[0] as P.Tokens.JSXElement
          const attrs = match.attributes?.map((attr) => ast<AST.JSXAttribute>(attr?.AST))
          const children =
            match.children
              ?.map((child) => ast<AST.JSXElement | AST.JSXEndTag | AST.JSXText | AST.JSXExpression>(child?.AST))
              .filter(Boolean) ?? []
          return new AST.JSXElement(match, { tagName, attrs, children })
        }
      },
      tests: [
        {
          title: "Simple nested elements",
          compileAs: "expression",
          tests: [
            [`<a/>`, `spellCore.element({ tag: "a" })`],
            [`<a></a>`, `spellCore.element({ tag: "a" })`],
            [`<a b=1 c="ccc"/>`, `spellCore.element({ tag: "a", props: { b: 1, c: "ccc" } })`],
            [
              `<a b=1 c="ccc" d></a>`,
              [
                `spellCore.element({`,
                `\ttag: "a",`,
                `\tprops: {`,
                `\t\tb: 1,`,
                `\t\tc: "ccc",`,
                `\t\td: true`,
                `\t}`,
                `})`
              ]
            ],

            [`<a><b/></a>`, [`spellCore.element({ tag: "a", children: [`, `\tspellCore.element({ tag: "b" })`, `] })`]],
            [
              `<a><b></b></a>`,
              [`spellCore.element({ tag: "a", children: [`, `\tspellCore.element({ tag: "b" })`, `] })`]
            ],
            [
              `<a A=1><b c=1>foo</b></a>`,
              [
                `spellCore.element({ tag: "a", props: { A: 1 }, children: [`,
                `\tspellCore.element({ tag: "b", props: { c: 1 }, children: [`,
                `\t\t"foo"`,
                `\t] })`,
                `] })`
              ]
            ],
            [
              `<a><b><c>d</c></b></a>`,
              [
                `spellCore.element({ tag: "a", children: [`,
                `\tspellCore.element({ tag: "b", children: [`,
                `\t\tspellCore.element({ tag: "c", children: [`,
                `\t\t\t"d"`,
                `\t\t] })`,
                `\t] })`,
                `] })`
              ]
            ],
            [
              `<a>\n\tBBB\n\t<c/>\n\tDDD</a>`,
              [
                'spellCore.element({ tag: "a", children: [',
                '\t"BBB",',
                '\tspellCore.element({ tag: "c" }),',
                '\t"DDD"',
                "] })"
              ]
            ],
            [
              ["<ui-button ", "\thidden={1} ", "\tonPress={print 2}", "\t/>"],
              [
                "spellCore.element({",
                '\ttag: "ui-button",',
                "\tprops: {",
                "\t\thidden: 1,",
                "\t\tonPress: (event) => {",
                "\t\t\treturn spellCore.console.log(2)",
                "\t\t}",
                "\t}",
                "})"
              ]
            ],
            [
              '<input attrOnly text="text" number=1 boolean={yes} expression={1 + 1} onClick={print the value of the target of the event} />',
              [
                `spellCore.element({`,
                `\ttag: "input",`,
                `\tprops: {`,
                `\t\tattrOnly: true,`,
                `\t\ttext: "text",`,
                `\t\tnumber: 1,`,
                `\t\tboolean: true,`,
                `\t\texpression: (1 + 1),`,
                `\t\tonClick: (event) => {`,
                `\t\t\treturn spellCore.console.log(event.target.value)`,
                `\t\t}`,
                `\t}`,
                `})`
              ]
            ]
          ]
        },
        {
          title: "Attribute expressions",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("card")
          },
          tests: [
            [`<div foo/>`, `spellCore.element({ tag: "div", props: { foo: true } })`],
            [
              `<div rank={the rank of the card} value={1 + 2 + 3}/>`,
              `spellCore.element({ tag: "div", props: { rank: card.rank, value: ((1 + 2) + 3) } })`
            ],
            [
              `<div rank={unknown expression} value={another unknown expression}/>`,
              `spellCore.element({ tag: "div", props: { rank: undefined /* PARSE ERROR: Don't understand "unknown expression" */, value: undefined /* PARSE ERROR: Don't understand "another unknown expression" */ } })`
            ],
            // DO parse a statement as an attribute expression
            [
              `<div on-click={print 1024}/>`,
              [
                `spellCore.element({`,
                `\ttag: "div",`,
                `\tprops: {`,
                `\t\t'on-click': (event) => {`,
                `\t\t\treturn spellCore.console.log(1024)`,
                `\t\t}`,
                `\t}`,
                `})`
              ]
            ],
            // don't match attribute expressions that don't eat the entire text
            [
              "<div foo={true true}/>",
              `spellCore.element({ tag: "div", props: { foo: undefined /* PARSE ERROR: Don't understand "true true" */ } })`
            ],
            // ignore newlines in attribute expression
            // NOTE: this was previously a comma expression `(a, b)` instead of a `[a, b]` tuple, which JS
            // silently evaluated to a single-element array (the comma operator discards `a`) -- a latent
            // bug surfaced by `RuleTest`'s tuple typing. Fixed to the evidently-intended 2-tuple.
            ["<div foo={\n1 + \n\t2\n\t}/>", `spellCore.element({ tag: "div", props: { foo: (1 + 2) } })`]
          ]
        },
        {
          title: "Inline expressions",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables?.add("card")
          },
          tests: [
            [
              `<div foo={<a><b><c>{1}</c></b></a>}/>`,
              [
                'spellCore.element({ tag: "div", props: { foo: spellCore.element({ tag: "a", children: [',
                '\tspellCore.element({ tag: "b", children: [',
                '\t\tspellCore.element({ tag: "c", children: [',
                "\t\t\t1",
                "\t\t] })",
                "\t] })",
                "] }) } })"
              ]
            ],
            // compound expression
            [`<div>{1 + 2 + 3}</div>`, ['spellCore.element({ tag: "div", children: [', "\t((1 + 2) + 3)", "] })"]],
            // multi-line expression is fine
            [
              "<div>{\n\t1 + \n2 + 3\t\n}</div>",
              ['spellCore.element({ tag: "div", children: [', "\t((1 + 2) + 3)", "] })"]
            ],
            //
            [
              `<div>{the rank of the card}</div>`,
              ['spellCore.element({ tag: "div", children: [', "\tcard.rank", "] })"]
            ],
            // fail if we don't eat entire expression
            [
              `<div>{true true}</div>`,
              [
                'spellCore.element({ tag: "div", children: [',
                '\tnull /* PARSE ERROR: Don\'t understand "true true" */',
                "] })"
              ]
            ],
            // fail on unknown expression
            [
              `<div>{unknown expression}</div>`,
              [
                'spellCore.element({ tag: "div", children: [',
                '\tnull /* PARSE ERROR: Don\'t understand "unknown expression" */',
                "] })"
              ]
            ],
            // DO NOT parse a inline statement as a JSXExpression
            [
              `<div>{print 1024}</div>`,
              [
                'spellCore.element({ tag: "div", children: [',
                '\tnull /* PARSE ERROR: Don\'t understand "print 1024" */',
                "] })"
              ]
            ]
          ]
        }
      ]
    },

    /**
     * Match a single JSX attribute (`name`, `name=value`, or `name={expression}`).
     * - `on*` attribute names (e.g. `onClick`) parse `value` as a `statement` inside a `MethodScope` with
     *   an implicit `event` argument, producing an inline event-handler method rather than an expression.
     * - Falls back to `parse_error` if neither an `expression` nor `on*` `statement` consumes the whole value.
     */
    {
      name: "jsxAttribute",
      tokenType: P.Tokens.JSXAttribute,
      constructor: class SpellJSXAttribute extends P.TokenType {
        /**
         * Parse `value` as an expression, or (for `on*` attribute names) as a `statement` with an
         * implicit `event` argument -- falls back to a `parse_error` match if neither consumes it all.
         */
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          if (match.matched.length !== 1) throw new TypeError("Can only handle a single JSXAttribute at a time!")
          // pull attribute name up to match
          const attributeToken = match.matched[0] as P.Tokens.JSXAttribute
          match.attribute = attributeToken.name
          // parse `value` if as a number or JSXExpression
          const { value } = match
          if (value) {
            const inputIsExpression = value instanceof P.Tokens.JSXExpression
            // `JSXExpression.contents` is typed `string | Token` (a bare, un-braced attribute value is
            // tokenized via `matchJSXAttributeValueIdentifier`, which sets `contents` to a `Token`), but this
            // rule (as in the original JS) only ever handles the braced/string form here.
            const input = inputIsExpression ? (value.contents as string).trim().replace(/\n/g, " ") : value
            // parse "onXXX" as an inline method with an `event` argument
            if (match.attribute.startsWith("on")) {
              const methodScopeProps: P.MethodScopeProps = {
                parentScope: scope,
                args: ["event"],
                mapItTo: "this"
              }
              const methodScope = new P.MethodScope(methodScopeProps)
              const statement = methodScope.parse(input, "statement")
              if (statement && statement.inputText.length === input.length) {
                match.statement = statement
              }
            } else {
              const expression = scope.parse(input, "expression")
              if (expression && (!inputIsExpression || expression.inputText.length === input.length)) {
                match.expression = expression
              }
            }
            // if neither worked, parse error
            if (!match.expression && !match.statement) match.error = scope.parse(input, "parse_error")
            // console.warn({ match, name: match.attribute, inputIsExpression, value, input })
          }
          return match
        }

        /**
         * Build `AST.JSXAttribute`.
         * - `statement` value becomes an inline `AST.MethodDefinition` (with an `event` arg for `on*` names).
         * - Missing `value` (bare attribute, e.g. `<input disabled/>`) becomes `true`.
         */
        getAST(match: P.Match) {
          const { attribute, expression, statement, error, value } = match
          let valueAST: AST.Expression | undefined
          if (expression) valueAST = ast<AST.Expression>(expression.AST)
          else if (statement) {
            valueAST = new AST.MethodDefinition(match, {
              inline: true,
              args: attribute!.toLowerCase().startsWith("on")
                ? [new AST.VariableExpression(match, { name: "event" })]
                : undefined,
              body: ast<AST.StatementBlock | AST.Statement | AST.Expression>(statement.AST)
            })
          } else if (value === undefined) {
            valueAST = new AST.BooleanLiteral(match, { value: true })
          } else if (value instanceof P.Tokens.Text) {
            valueAST = new AST.StringLiteral(match, { value: value.value })
          } else if (!error) {
            console.warn("jsxAttribute.getAST: don't know how to render value", value, " for match ", match)
            valueAST = new AST.UndefinedLiteral(match)
          }
          return new AST.JSXAttribute(match, {
            name: attribute!,
            value: valueAST,
            error: error?.AST as AST.ParseError | undefined
          })
        }
      }
    },

    /** Match literal text between JSX tags (`jsxChild`).  Blank text yields no AST node -- see below. */
    {
      name: "jsxText",
      alias: "jsxChild",
      tokenType: P.Tokens.JSXText,
      constructor: class SpellJSXText extends P.TokenType {
        /** Build `AST.JSXText`; returns `undefined` for blank text since there's nothing to render. */
        getAST(match: P.Match) {
          const { raw, quotedText } = match.matched[0] as P.Tokens.JSXText
          // Blank text has nothing to render -- return `undefined` for "no AST" (`Rule.getAST()`'s return
          // type already permits this; `Match.AST` treats a falsy return as "no AST").
          if (!quotedText) return undefined
          return new AST.JSXText(match, { raw, value: quotedText })
        }
      }
    },

    /** Match a JSX closing tag (`</tag>`), tracked as a `jsxChild` alongside element/text/expression children. */
    {
      name: "jsxEndTag",
      alias: "jsxChild",
      tokenType: P.Tokens.JSXEndTag,
      constructor: class SpellJSXEndTag extends P.TokenType {
        getAST(match: P.Match) {
          const { tagName } = match.matched[0] as P.Tokens.JSXEndTag
          return new AST.JSXEndTag(match, { tagName })
        }
      }
    },

    /**
     * Match a `{...}` JSX expression container (a `jsxChild`, e.g. `<div>{1 + 2}</div>`).
     * - Trims and collapses newlines in the raw contents before parsing as an `expression`.
     * - Falls back to `parse_error` if the expression doesn't consume the entire contents.
     */
    {
      name: "jsxExpression",
      alias: "jsxChild",
      tokenType: P.Tokens.JSXExpression,
      constructor: class SpellJSXExpression extends P.TokenType {
        /** Parse `contents` as an `expression`; falls back to `parse_error` if it doesn't consume it all. */
        parse(scope: P.Scope, tokens: P.Token[]) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // trim and remove newlines from expression (???)
          // See note above re: `JSXExpression.contents` being typed `string | Token`.
          const input = ((match.matched[0] as P.Tokens.JSXExpression).contents as string).trim().replace(/\n/g, " ")
          // only match expression if we used all of the input
          const expression = scope.parse(input, "expression")
          if (expression && expression.inputText.length === input.length) {
            match.expression = expression
          } else {
            match.error = scope.parse(input, "parse_error")
          }
          return match
        }
        getAST(match: P.Match) {
          const { expression, error } = match
          return new AST.JSXExpression(match, {
            expression: expression?.AST as AST.Expression | undefined,
            error: error?.AST as AST.ParseError | undefined
          })
        }
      }
    }
  ]
})
