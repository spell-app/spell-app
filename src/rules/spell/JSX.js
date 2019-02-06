//
//	# Rules parsing jsx
//
import Parser from "../../Parser";
import Tokenizer from "../../Tokenizer";
import Rule from "../../RuleSyntax";

// Create "JSX" parser context.
const parser = Parser.forName("JSX");
export default parser;

parser.defineRules(
  {
    name: "jsx",
    alias: [ "expression", "statement" ],
    constructor: class jsxElement extends Rule {
      // Text strings get encoded as `text` objects in the token stream.
      parse(parser, tokens, start = 0, end = tokens.length) {
        let token = tokens[start];
        if (!(token instanceof Tokenizer.JSXElement)) return undefined;
        return this.clone({
          matched: token,
          nextStart: start + 1
        });
      }

      // Convert our attributes to source.
      // Returns `undefined` if no attributes.
      attrsToSource(context, jsxElement = this.matched) {
        let attributes = jsxElement.attributes;
        if (!attributes || !attributes.length) return undefined;

        let attrs = attributes.map( ({ name, value }) => {
          // if NO value, assume it's a variable of the same name
          if (value === undefined) value = name;
          // if it's an array, it's a spell expression, possibly with nested JSX elements...
          else if (value instanceof Tokenizer.JSXExpression) {
            value = this.jsxExpressionToSource(context, value);
          }
          // else if a JSX element, recurse
    //TODO: indent...
          else if (value instanceof Tokenizer.JSXElement) {
            value = value.toSource(context);
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
      childrenToSource(context, jsxElement = this.matched) {
        let children = jsxElement.children;
        if (!children || children.length === 0) return undefined;
        return children.map(child => {
    //TODO: escape inner quotes...
          if (typeof child === "string") {
            //forget it if whitespace only... ???
            let text = child.trim();
            if (!text) return undefined;
            return `"${text}"`;
          }
          if (child instanceof Tokenizer.JSXElement) {
            let childSource = this.jsxElementToSource(context, child);
            return childSource.split("\n").join("\n\t");
          }
          if (child instanceof Tokenizer.JSXExpression) {
            return this.jsxExpressionToSource(context, child);
          }
          throw new SyntaxError("childrenToSource(): don't understand child" +  child);
        })
        // remove undefined/empty string rules
        .filter(Boolean);
      }

      // Convert JSX expression ( `{...}` ) to JS source.
      jsxExpressionToSource(context, jsxExpression) {
        let tokens = jsxExpression.tokens;
    console.info(jsxExpression, tokens);
        return "/" + `*TODO: ${tokens.join(" ")}*` + "/";
      }

      jsxElementToSource(context, jsxElement = this.matched) {
        // get the bits of the output
        let tagName = `"${jsxElement.tagName}"`;
        let attrs = this.attrsToSource(context, jsxElement);
        let children = this.childrenToSource(context, jsxElement);

        let output = `createElement(${tagName}`;
        if (!attrs && children) attrs = "null";

        if (attrs) output += `, ${attrs}`;
        if (children) {
          output += ",\n\t" + children.join(",\n\t") + "\n";
        }
        output += ")"
        return output;
      }

      toSource(context) {
        return this.jsxElementToSource(context, this.matched);
      }
    }
  }
);
