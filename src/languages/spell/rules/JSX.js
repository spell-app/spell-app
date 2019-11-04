//
//  # Rules for parsing jsx
//

import { Rule, Spell, Token } from "../all"

export default new Spell.Parser({
  module: "JSX",
  rules: [
    {
      name: "jsx",
      alias: ["expression", "single_expression"],
      tokenType: Token.JSXElement,
      constructor: class SpellJSX extends Rule.TokenType {
        parse(scope, tokens) {
          const match = super.parse(scope, tokens)
          if (!match) return undefined
          // recursively parse jsxExpressions in attributes and children
          match.matched.forEach(element => this.parseElementExpressions(scope, element))
          return match
        }
      },

      parseElementExpressions(scope, element) {
        if (element.attributes) {
          element.attributes.forEach(attribute => {
            if (attribute.value instanceof Token.JSXExpression)
              attribute.value.expression = scope.parse(attribute.value.contents, "expression")
          })
        }
        if (element.children) {
          element.children.forEach(child => this.parseElementExpressions(scope, child))
        }
      },

      compile(scope, match) {
        return this.jsxElementToSource(scope, match.matched[0])
      },

      jsxElementToSource(scope, jsxElement) {
        // get the bits of the output
        const tagName = `'${jsxElement.tagName}'`
        const children = this.childrenToSource(scope, jsxElement)
        const attrs = this.attrsToSource(scope, jsxElement) || (children ? "null" : "")

        let output = `spellCore.createElement(${tagName}`
        if (attrs) output += `, ${attrs}`
        if (children) {
          output += `,\n\t${children.join(",\n\t")}\n`
        }
        output += ")"
        return output
      },

      // Convert our attributes to source.
      // Returns `undefined` if no attributes.
      attrsToSource(scope, jsxElement) {
        const { attributes } = jsxElement
        if (!attributes || !attributes.length) return undefined

        const attrs = attributes.map(({ name, value }) => {
          // if NO value, assume it's a variable of the same name
          if (value === undefined) value = "true"
          // if it's a jsx expression, possibly with nested JSX elements...
          else if (value instanceof Token.JSXExpression) {
            value = this.jsxExpressionToSource(scope, value)
          }
          // else if a JSX element, recurse
          // TODO: indent...
          else if (value instanceof Token.JSXElement) {
            value = value.compile(jsxElement)
          } else {
            // eslint-disable-next-line prefer-destructuring
            value = value.value
          }

          // special case `class` to `className` because React is effing persnickety.
          if (name === "class") name = "className"
          // TODO: escape names which are invalid JS identifiers
          return `${name}: ${value}`
        })

        return `{ ${attrs.join(", ")} }`
      },

      // Return an array with source for each of our children.
      // Returns `undefined` if we don't have any children.
      childrenToSource(scope, jsxElement) {
        // ignore end tags!
        const children = jsxElement.children && jsxElement.children.filter(child => !(child instanceof Token.JSXEndTag))
        if (!children || children.length === 0) return undefined

        return (
          children
            .map(child => {
              // ignore end tags
              if (child instanceof Token.JSXEndTag) return undefined

              if (child instanceof Token.JSXText) {
                return child.quotedText
              }
              if (child instanceof Token.JSXElement) {
                const childSource = this.jsxElementToSource(scope, child)
                return childSource.split("\n").join("\n\t")
              }
              if (child instanceof Token.JSXExpression) {
                return this.jsxExpressionToSource(scope, child)
              }

              throw new SyntaxError(`childrenToSource(): don't understand child${child}`)
            })
            // remove undefined/empty string rules
            .filter(Boolean)
        )
      },

      // Convert JSX expression ( `{...}` ) to JS source.
      jsxExpressionToSource(scope, jsxExpression) {
        const { expression } = jsxExpression
        if (jsxExpression.expression && !jsxExpression.expression.incomplete) return expression.js
        // eslint-disable-next-line no-useless-concat
        return "/" + `*INCOMPLETE: ${jsxExpression.contents}*` + "/"
      },

      tests: [
        {
          compileAs: "expression",
          tests: [
            [`<a/>`, `spellCore.createElement('a')`],
            [`<a b=1 c="ccc"/>`, `spellCore.createElement('a', { b: 1, c: "ccc" })`],
            [`<a b=1 c="ccc" d></a>`, `spellCore.createElement('a', { b: 1, c: "ccc", d: true })`],

            [`<a><b/></a>`, `spellCore.createElement('a', null,\n\tspellCore.createElement('b')\n)`],
            [`<a><b></b></a>`, `spellCore.createElement('a', null,\n\tspellCore.createElement('b')\n)`],
            [
              `<a A=1><b c=1>foo</b></a>`,
              `spellCore.createElement('a', { A: 1 },\n\tspellCore.createElement('b', { c: 1 },\n\t\t"foo"\n\t)\n)`
            ]
          ]
        },
        {
          compileAs: "expression",
          beforeEach(scope) {
            scope.variables.add("card")
          },
          tests: [
            [
              `<div rank={the rank of the card} suit={the suit of the card}/>`,
              `spellCore.createElement('div', { rank: card.rank, suit: card.suit })`
            ]
          ]
        }
      ]
    }
  ]
})
