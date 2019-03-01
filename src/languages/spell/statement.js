//
//  # Rules for parsing `statements`
//

import {
  Match,
  Rule,
  SpellParser,
  Token,

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
    let { commentSymbol, initialWhitespace, comment } = match.matched[0];
    if (commentSymbol !== "//") commentSymbol = "//" + commentSymbol;
    return `${commentSymbol}${initialWhitespace}${comment}`;
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
// NOTE: we pop any comment off the end manually in `parse()`
//       and then add it to the `matched` array if we found one.
const blockLine = parser.defineRule({
  name: "blockLine",
  syntax: "{whitespace}* {statement}",
  constructor: class blockLine extends Rule.Sequence {
    parse(scope, tokens) {
      // pop comment off of the end if found
      let comment;
      const last = tokens[tokens.length - 1];
      if (last instanceof Token.Comment) {
        comment = commentRule.parse(scope, [last]);
      }

      const remainingTokens = comment ? tokens.slice(0, -1) : tokens;
      const match = super.parse(scope, remainingTokens);
      if (!match && !comment) return;

      if (match && match.matchLength !== remainingTokens.length) {
        console.warn("statement didn't match", remainingTokens.slice(match.matchLength));
      }
      if (!match) {
        comment.matchLength = tokens.length;
        comment.tokens = tokens;
        return comment;
      }
      if (comment) {
        match.matched.push(comment);
        match.tokens = tokens;
        match.matchLength += comment.matchLength;
      }
      return match;
    }
    compile(match, scope) {
      let { whitespace = "", statement, comment} = match.results;
      const output = [];
      // Output text that was actually matched
      if (scope.parser.outputSource) {
        const matchedText = match.tokens.slice(0, match.matchLength).join("").trim();
        output.push("// SPELL: '" + matchedText + "'");
      }
      // Put comment FIRST, before translation
      else if (comment) {
       output.push(comment);
      }
      output.push(`${whitespace}${statement}`);
      return output;
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
      scope = scope.resetRules();
      const statementRule = scope.getRuleOrDie("statement");

      let matched = [];
      let matchLength = 0;

      block.contents.forEach(item => {
        if (item.length === 0) {
          matched.push(new Rule.BlankLine());
          matchLength += 1;
        }
        // got a nested block
        else if (item instanceof Token.Block) {
          const nested = this.parseBlock(scope, item);
          if (!nested) {
            console.info("expected nested result, didn't get anything");
            return;
          }
          nested.indent = item.indent;
          nested.enclose = true;

          // If the last statement is a `BlockStatement`,
          //  give it the block
          const lastMatch = matched[matched.length - 1]?.matches.statement;
          if (lastMatch.rule instanceof SpellParser.BlockStatement) {
            lastMatch.block = nested;
            lastMatch.matchLength += nested.matchLength;
          }
          // otherwise just add it to the matched items
          else {
            console.warn("got a nested block when we weren't expecting one");
            matched.push(nested);
          }
          matchLength += nested.matchLength;
        }
        // Got a single statement, parse the entire thing as a `blockLine`
        else {
          const match = blockLine.parse(scope, item);
          if (!match) return;
          matched = matched.concat(match);
          matchLength += match.matchLength;

          // if statement has an updateScope() rule, call it!
          match.matches?.statement.updateScope();
        }
      });

      if (matched.length === 0) return undefined;

      return new Match({
        rule: this,
        matched,
        tokens: block.tokens,
        matchLength,
        indent: block.indent,
        scope,
      })
    }

    // Output statements match parsed with `parseBlock`
    // Set `match.enclose` to enclose in curly braces
    // Set `match.indent` to add a tab to the start of each line.
    compile(match) {
      let results = [],
        statement;

      for (var i = 0, next; next = match.matched[i]; i++) {
        try {
          statement = next.compile() || "";
        } catch (e) {
          console.error(e);
          console.warn("Error compiling statements: match\n", match.toPrint(), "\nstatement:", next);
        }

//console.info(next, "\n", statement);

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
            next
          );
        }
      }
      const tabs = getTabs(match.indent || 0);
      let lines = `${tabs}${results.join("\n"+tabs)}`
      if (match.enclose) return `{\n${lines}\n${tabs.slice(1)}}`;
      return lines;
    }
  }
});


// A `BlockStatement` (e.g. an `if` or `repeat`):
//  - is assumed to have an initial partial `statement`
//  - MAY have an inline `statement` (on the same line, possibly after a `:`)
//  - MAY have contents as an embedded `block`
// Note that it's considered an error to have BOTH an inline statement AND a nested block.
//
//  e.g. a `BlockStatement` with syntax `if {expression} then {statement}?` will attemt to:
//  - match the optional `statement` as an inline-statement (as `results.statement`)
//  - match an INDENTED block starting on the next line (as `result.block`)
//
//  For your convenience in `compile()`, you can just look at `results.statements`
//  which will be one of the following (whichever comes first):
//    - the block and its statements, enclosed in curly braces and indented, or
//    - the formatted `statement`, enclosed in curly brackets,
//    - `{}` if neither statement or block was matched.
//
SpellParser.BlockStatement = class block_statement extends Rule.Sequence {
  // Add `statements` to the results.
  getResults(match) {
    const results = super.getResults(match);
    if (!results) return undefined; // TODO???

    // If we got a block, use that for our `statements`
    const { block } = match;
    if (block) {
      results.statements = block.compile(block);
    }
    // otherwise use the `statement`, if it's empty this will return the empty string.
    else {
      results.statements = this.encloseStatement(results.statement);
    }
    return results;
  }

  encloseStatement(statement, forceWrap) {
    if (!statement) return "{}";
    if (!forceWrap && !statement.includes("\n") && statement.length < 40) {
      return `{ ${statement.trim()} }`;
    }
    if (statement[0] !== "\t") statement = `\t${statement}`;
    return `{\n${statement}\n}`;
  }
};

// Parser error representation in parser output.
SpellParser.StatementParseError = class parse_error extends Rule {
  get message() {
    if (this.parsed) {
      return (
        "CANT PARSE ENTIRE STATEMENT\n" +
        "PARSED      : `" +
        this.parsed +
        "`\n" +
        "CAN'T PARSE : `" +
        this.unparsed +
        "`"
      );
    }
    return "CAN'T PARSE STATEMENT: `" + this.unparsed + "`";
  }

  compile(match) {
    return "// " + match.message.split("\n").join("\n// ");
  }
};
