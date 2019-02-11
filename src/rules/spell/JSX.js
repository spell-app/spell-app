//
//  # Rules parsing jsx
//
import Parser from "../../Parser";
import Tokenizer from "../../Tokenizer";
import Rule from "../../Rule";

// Create "JSX" parser.
const parser = Parser.forModule("JSX");
export default parser;

parser.defineRules(
  {
    name: "jsx",
    alias: ["expression"], // TODO: statement ???
    constructor: class jsxElement extends Rule {
      // Text strings get encoded as `text` objects in the token stream.
      parse(parser, tokens, start = 0) {
        let token = tokens[start];
        if (!(token instanceof Tokenizer.JSXElement)) return undefined;
        return this.clone({
          matched: token,
          nextStart: start + 1
        });
      }

      // Convert our attributes to source.
      // Returns `undefined` if no attributes.
      attrsToSource(jsxElement = this.matched) {
        let attributes = jsxElement.attributes;
        if (!attributes || !attributes.length) return undefined;

        let attrs = attributes.map(({ name, value }) => {
          // if NO value, assume it's a variable of the same name
          if (value === undefined) value = "true";
          // if it's an array, it's a spell expression, possibly with nested JSX elements...
          else if (value instanceof Tokenizer.JSXExpression) {
            value = this.jsxExpressionToSource(value);
          }
          // else if a JSX element, recurse
          //TODO: indent...
          else if (value instanceof Tokenizer.JSXElement) {
            value = value.toSource();
          }
          // Otherwise if a number or Text literal, just use it

          // special case `class` to `className` because React is effing persnickety.
          if (name === "class") name = "className";
          //TODO: escape names which are invalid JS identifiers
          return `${name}: ${value}`;
        });

        return `{ ${attrs.join(", ")} }`;
      }

      // Return an array with source for each of our children.
      // Returns `undefined` if we don't have any children.
      childrenToSource(jsxElement = this.matched) {
        let children = jsxElement.children;
        if (!children || children.length === 0) return undefined;
        return (
          children
            .map(child => {
              //TODO: escape inner quotes...
              if (typeof child === "string") {
                //forget it if whitespace only... ???
                let text = child.trim();
                if (!text) return undefined;
                return `"${text}"`;
              }
              if (child instanceof Tokenizer.JSXElement) {
                let childSource = this.jsxElementToSource(child);
                return childSource.split("\n").join("\n\t");
              }
              if (child instanceof Tokenizer.JSXExpression) {
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
        let tokens = jsxExpression.tokens;
        //    console.info(jsxExpression, tokens);
        return "/" + `*TODO: ${tokens.join(" ")}*` + "/";
      }

      jsxElementToSource(jsxElement = this.matched) {
        // get the bits of the output
        let tagName = `'${jsxElement.tagName}'`;
        let attrs = this.attrsToSource(jsxElement);
        let children = this.childrenToSource(jsxElement);

        let output = "spell.createElement(" + tagName;
        if (!attrs && children) attrs = "null";

        if (attrs) output += `, ${attrs}`;
        if (children) {
          output += ",\n\t" + children.join(",\n\t") + "\n";
        }
        output += ")";
        return output;
      }

      toSource() {
        return this.jsxElementToSource(this.matched);
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
  },

  // Here so prettier leaves formatting above alone
  { skip: true }
);
