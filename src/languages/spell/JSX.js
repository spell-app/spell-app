//
//  # Rules for parsing jsx
//

import {
  Rule,
  SpellParser,
  Token,
} from "./all.js";

const parser = new SpellParser({ module: "JSX" });
export default parser;

parser.defineRule({
  name: "jsx",
  alias: "expression", // TODO: statement ???
  tokenType: Token.JSXElement,
  constructor: class jsxElement extends Rule.TokenType {
    compile(match) {
      return this.jsxElementToSource(match.matched[0]);
    }

    // Convert our attributes to source.
    // Returns `undefined` if no attributes.
    attrsToSource(jsxElement) {
      let attributes = jsxElement.attributes;
      if (!attributes || !attributes.length) return undefined;

      let attrs = attributes.map(({ name, value }) => {
        // if NO value, assume it's a variable of the same name
        if (value === undefined) value = "true";
        // if it's an array, it's a spell expression, possibly with nested JSX elements...
        else if (value instanceof Token.JSXExpression) {
          value = this.jsxExpressionToSource(value);
        }
        // else if a JSX element, recurse
        //TODO: indent...
        else if (value instanceof Token.JSXElement) {
          value = value.compile(jsxElement);
        }
        else {
          value = value.value;
        }

        // special case `class` to `className` because React is effing persnickety.
        if (name === "class") name = "className";
        //TODO: escape names which are invalid JS identifiers
        return `${name}: ${value}`;
      });

      return `{ ${attrs.join(", ")} }`;
    }

    // Return an array with source for each of our children.
    // Returns `undefined` if we don't have any children.
    childrenToSource(jsxElement) {
      // ignore end tags!
      const children = jsxElement.children
        && jsxElement.children.filter(child => !(child instanceof Token.JSXEndTag));
      if (!children || children.length === 0) return undefined;

      return (
        children
          .map(child => {
            // ignore end tags
            if (child instanceof Token.JSXEndTag) return;

            if (child instanceof Token.JSXText) {
              return child.quotedText;
            }
            if (child instanceof Token.JSXElement) {
              const childSource = this.jsxElementToSource(child);
              return childSource.split("\n").join("\n\t");
            }
            if (child instanceof Token.JSXExpression) {
              return this.jsxExpressionToSource(child);
            }

            throw new SyntaxError("childrenToSource(): don't understand child" + child);
          })
          // remove undefined/empty string rules
          .filter(Boolean)
      );
    }

    // Convert JSX expression ( `{...}` ) to JS source.
    jsxExpressionToSource(jsxExpression) {
      const tokens = jsxExpression.tokens;
      //    console.info(jsxExpression, tokens);
      return "/" + `*TODO: ${tokens.join(" ")}*` + "/";
    }

    jsxElementToSource(jsxElement) {
      // get the bits of the output
      const tagName = `'${jsxElement.tagName}'`;
      const children = this.childrenToSource(jsxElement);
      const attrs = this.attrsToSource(jsxElement) || (children ? "null" : "");

      let output = "spell.createElement(" + tagName;
      if (attrs) output += `, ${attrs}`;
      if (children) {
        output += ",\n\t" + children.join(",\n\t") + "\n";
      }
      output += ")";
      return output;
    }

  },
  tests: [
    {
      compileAs: "expression",
      showAll: true,
      tests: [
        [`<a/>`, `spell.createElement('a')`],
        [`<a b=1 c="ccc"/>`, `spell.createElement('a', { b: 1, c: "ccc" })`],
        [`<a b=1 c="ccc" d></a>`, `spell.createElement('a', { b: 1, c: "ccc", d: true })`],

        [`<a><b/></a>`, `spell.createElement('a', null,\n\tspell.createElement('b')\n)`],
        [`<a><b></b></a>`, `spell.createElement('a', null,\n\tspell.createElement('b')\n)`],
        [
          `<a A=1><b c=1>foo</b></a>`,
          `spell.createElement('a', { A: 1 },\n\tspell.createElement('b', { c: 1 },\n\t\t"foo"\n\t)\n)`
        ]
      ]
    }
  ]
});
