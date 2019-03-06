//
//  # Rules for parsing `statements`
//

import {
  BlockStatement,
  Match,
  Rule,
  SpellParser,
  Token,
  Tokenizer,

  getTabs,
  isWhitespace,
  proto
} from "./all.js";

const parser = new SpellParser({ module: "statement" });
export default parser;


SpellParser.Comment = class comment extends Rule.TokenType {
  @proto name = "comment";
  @proto tokenType = Token.Comment;
  compile(match) {
    let { commentSymbol, initialWhitespace, value } = match.matched[0];
    if (commentSymbol !== "//") commentSymbol = "//" + commentSymbol;
    return `${commentSymbol}${initialWhitespace}${value}`;
  }
}

const commentRule = parser.defineRule({
  constructor: SpellParser.Comment,
  tests: [
    {
      compileAs: "comment",
      tests: [
        ["//", "//"],
        ["// foo", "// foo"],
        ["-- foo", "//-- foo"],
        ["## foo", "//## foo"],
        ["//    foo bar baz", "//    foo bar baz"],
      ]
    }
  ]
});

// Parse a single statement line.
// NOTE: we eat whitespace at the start and stick it on `match.whitespace` if found.
// NOTE: we eat a comment at the end and stick it on `match.comment` if found.
//       if ONLY comment was found, that will be the match.
// NOTE: if the parser wants to `outputSource`, match.source will be the input text.
const block_line = parser.defineRule({
  name: "block_line",
  rule: "statement",
  constructor: class block_line extends Rule.Subrule {
    parse(scope, tokens) {
      let start = 0;
      let end = tokens.length;

      // eat whitespace at front if found
      const whitespace = scope.getRuleOrDie("eat_whitespace").parse(scope, tokens);
      if (whitespace) start = whitespace.length;

      // pop comment off of the end if found
      const last = tokens[tokens.length - 1];
      const comment = commentRule.parse(scope, [last]);
      if (comment) end -= 1;

      // parse the statement
      const remainingTokens = tokens.slice(start, end);
      const match = super.parse(scope, remainingTokens);

      // If no match and no comment, forget it (ignoring whitespace).
      if (!match && !comment) return;

      if (match && match.length !== remainingTokens.length) {
        scope.warn(`statement didn't match '${Tokenizer.join(remainingTokens,match.length)}'`);
      }

      // If only comment, return that.
      if (!match) {
        comment.length = tokens.length;
        return comment;
      }

      // If we got whitespace or comment, add it to the match;
      if (whitespace) match.whitespace = whitespace;
      if (comment) match.comment = comment;

      // If the parser wants to output source, grab tokens now.
      if (scope.parser.outputSource) {
        match.source = Tokenizer.join(remainingTokens, 0, match.length);
      }

      // Assume we ate the entire line
      match.length = tokens.length;
      return match;
    }
  }
});

// `Statements` are a special case for a block of `Statement` rules
//  that understand nesting and comments.
//
// This is a top-level construct, e.g. used to parse an entire file.
parser.defineRule({
  name: "statements",
  constructor: class statements extends Rule {
    // Split statements up into blocks and parse 'em.
    parse(scope, tokens) {
      if (!tokens.length) return;
      return this.parseBlock(scope, tokens[0]);
    }

    // Parse an entire `block`, returning array of matched elements (NOT as a match).
    // NOTE: we assume we should reset `scope.rules` because we're entering a new parsing context
    parseBlock(scope, block) {
      let matched = [];
      for (var i = 0, item; item = block.contents[i]; i++) {
        if (item.length === 0) {
          matched.push(new Rule.BlankLine());
          length += 1;
        }
        // got a nested block
        else if (item instanceof Token.Block) {
          const nested = this.parseBlock(scope, item);
          if (!nested) {
            scope.info("expected nested result, didn't get anything");
            continue;
          }
          else {
            scope.warn("got a nested block when we weren't expecting one");
            matched.push(nested);
          }
        }
        // Got a single statement, parse the entire thing as a `block_line`
        else {
          const statement = block_line.parse(scope, item);
          if (!statement) return;
          matched = matched.concat(statement);

          // the statement is a BlockStatement and the next item is a Block
          // parse it and give it to the statement.
          if (statement.rule instanceof BlockStatement) {
            const next = block.contents[i+1];
            if (next instanceof Token.Block) {
              const nestedBlock = this.parseBlock(scope, next);
              if (nestedBlock) {
                nestedBlock.enclose = true;
                statement.block = nestedBlock;
                i++;
              }
            }
          }
        }
      };

      if (matched.length === 0) return undefined;

      return new Match({
        rule: this,
        matched,
        indent: block.indent,
        scope,
      })
    }

    // Output statements match parsed with `parseBlock`
    // Set `match.enclose` to enclose in curly braces
    // Set `match.indent` to add a tab to the start of each line.
    compile(match, scope) {
      let results = [],
        statement;

      for (var i = 0, line; line = match.matched[i]; i++) {
        try {
          // If we got a comment back, there was no statement.
          if (line.rule === commentRule) {
            statement = line.compile();
          }
          else {
            // Output text that was actually matched if provided
            const output = [];
            if (line.source) output.push("/" + `/ SPELL: '${line.source}'`);
            // Put comment FIRST, before translation
            if (line.comment) output.push(line.comment.compile());
            // Then the actual statement results
            output.push(`${line.compile()}`);
            statement = output.join("\n");
          }
        } catch (e) {
          scope.error(e);
          scope.warn("Error compiling statements: match\n", line.toPrint(), "\nstatement:", next);
        }

        if (isWhitespace(statement)) {
          results.push("");
        } else if (Array.isArray(statement)) {
          results = results.concat(statement);
        } else if (typeof statement === "string") {
          statement = statement.split("\n");
          results = results.concat(statement);
        } else {
          console.warn(
            "blockToSource(): DON'T KNOW HOW TO WORK WITH\n\t",
            statement,
            "\n\tfrom match",
            line
          );
        }
      }
      const tab = match.indent ? "\t" : "";
      let lines = `${tab}${results.join("\n"+tab)}`
      if (match.enclose) return `{\n${lines}\n${tab.slice(1)}}`;
      return lines;
    }
    // Return a simple data structure we'll use to visualize a match.
    getStructure(match, scope) {
      return match.matched.map(match => match.structure);
    }
  }
});

