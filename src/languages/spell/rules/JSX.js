import { Rule, Token, MethodScope } from "~/parser"
import { SpellParser } from "~/languages/spell"
import { AST } from "../ast"

export const JSX = new SpellParser({
  module: "JSX",
  rules: [
    {
      name: "jsxElement",
      alias: ["jsxChild", "expression"],
      tokenType: Token.JSXElement,
      constructor: class SpellJSX extends Rule.TokenType {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          if (match.matched.length !== 1) throw new TypeError("Can only handle a single JSXElement at a time!")
          const [element] = match.matched
          match.attributes = element.attributes?.map((attr) => scope.parse(attr, "jsxAttribute"))
          match.children = element.children?.map(
            (child) => scope.parse(child, "jsxChild") || scope.parse(child, "parse_error")
          )
          // console.warn(match)
          return match
        }

        getAST(match) {
          const { tagName } = match.matched[0]
          const attrs = match.attributes?.map((attr) => attr.AST)
          const children = match.children?.map((child) => child.AST).filter(Boolean)
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
            scope.variables.add("card")
          },
          tests: [
            [`<div foo/>`, `spellCore.element({ tag: "div", props: { foo: true } })`],
            [
              `<div rank={the rank of the card} value={1 + 2 + 3}/>`,
              `spellCore.element({ tag: "div", props: { rank: card.rank, value: ((1 + 2) + 3) } })`
            ],
            [
              `<div rank={unknown expression} value={another unknown expression}/>`,
              `spellCore.element({ tag: "div", props: { rank: undefined /* PARSE ERROR: Don\'t understand \"unknown expression\" */, value: undefined /* PARSE ERROR: Don\'t understand \"another unknown expression\" */ } })`
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
              `spellCore.element({ tag: "div", props: { foo: undefined /* PARSE ERROR: Don\'t understand \"true true\" */ } })`
            ],
            [
              // ignore newlines in attribute expression
              ("<div foo={\n1 + \n\t2\n\t}/>", `spellCore.element({ tag: "div", props: { foo: (1 + 2) } })`)
            ]
          ]
        },
        {
          title: "Inline expressions",
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("card")
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

    {
      name: "jsxAttribute",
      tokenType: Token.JSXAttribute,
      constructor: class SpellJSXAttribute extends Rule.TokenType {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          if (match.matched.length !== 1) throw new TypeError("Can only handle a single JSXAttribute at a time!")
          // pull attribute name up to match
          match.attribute = match.matched[0].name
          // parse `value` if as a number or JSXExpression
          const { value } = match
          if (value) {
            const inputIsExpression = value instanceof Token.JSXExpression
            const input = inputIsExpression ? value.contents.trim().replace(/\n/g, " ") : value
            // parse "onXXX" as an inline method with an `event` argument
            if (match.attribute.startsWith("on")) {
              const methodScope = new MethodScope({
                scope,
                args: ["event"],
                mapItTo: "this"
              })
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

        getAST(match) {
          const { attribute, expression, statement, error, value } = match
          let valueAST
          if (expression) valueAST = expression.AST
          else if (statement) {
            valueAST = new AST.MethodDefinition(match, {
              inline: true,
              args: attribute.toLowerCase().startsWith("on")
                ? [new AST.VariableExpression(match, { name: "event" })]
                : undefined,
              body: statement.AST
            })
          } else if (value === undefined) {
            valueAST = new AST.BooleanLiteral(match, { value: true })
          } else if (value instanceof Token.Text) {
            valueAST = new AST.StringLiteral(match, { value: value.value })
          } else if (!error) {
            console.warn("jsxAttribute.getAST: don't know how to render value", value, " for match ", match)
            valueAST = new AST.UndefinedLiteral(match)
          }
          return new AST.JSXAttribute(match, {
            name: attribute,
            value: valueAST,
            error: error?.AST
          })
        }
      }
    },

    {
      name: "jsxText",
      alias: "jsxChild",
      tokenType: Token.JSXText,
      getAST(match) {
        const { raw, quotedText } = match.matched[0]
        if (!quotedText) return null
        return new AST.JSXText(match, { raw, value: quotedText })
      }
    },

    {
      name: "jsxEndTag",
      alias: "jsxChild",
      tokenType: Token.JSXEndTag,
      getAST(match) {
        const { tagName } = match.matched[0]
        return new AST.JSXEndTag(match, { tagName })
      }
    },

    {
      name: "jsxExpression",
      alias: "jsxChild",
      tokenType: Token.JSXExpression,
      constructor: class SpellJSXExpression extends Rule.TokenType {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // trim and remove newlines from expression (???)
          const input = match.matched[0].contents.trim().replace(/\n/g, " ")
          // only match expression if we used all of the input
          const expression = scope.parse(input, "expression")
          if (expression && expression.inputText.length === input.length) {
            match.expression = expression
          } else {
            match.error = scope.parse(input, "parse_error")
          }
          return match
        }
        getAST(match) {
          const { expression, error } = match
          return new AST.JSXExpression(match, {
            expression: expression?.AST,
            error: error?.AST
          })
        }
      }
    }
  ]
})
