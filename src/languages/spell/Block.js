import {
  Match,
  Rule,
  SpellParser,
  Token,
  Tokenizer,

  isWhitespace,
  proto
} from "./all.js";

// `Blocks` are generally the root entity that we parse in spell.
//  This is a top-level construct, e.g. used to parse an entire file.
//
//  They are composed of `blockLines` and nested `blocks`,
//  and correspond roughly to a `Scope` (see `parser/Scope.js`).
//
export class Block extends Rule {
  // Split statements up into blocks and parse 'em.
  parse(scope, tokens) {
    if (!tokens.length) return;
    return this.parseBlock(scope, tokens[0]);
  }

  // Parse an entire `block`, returning array of matched elements (NOT as a match).
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
        const statement = scope.parse(item, "block_line");
        if (!statement) return;
        matched = matched.concat(statement);

        // We've locked in this statement -- have it update it's scope.
        // This may create other rules/vars/etc that later statements will use.
        statement.updateScope();

        // If `statement.results.$scope` exists and the next item is a block,
        // parse the block and add it to the `statement`.
        const next = block.contents[i+1];
        if (!(next instanceof Token.Block)) continue;
        if (!statement.results.$scope) continue;

        const blockMatch = this.parseBlock(scope, next);
        if (!blockMatch) continue;

        statement.results.$scope.addBlock(blockMatch);
        // We've already processed this item
        i++;
      }
    }

    if (matched.length === 0) return undefined;

    return new Match({
      rule: this,
      matched,
      indent: block.indent,
      scope,
      length: 1   // matched one block...
    })
  }

  // Output statements match parsed with `parseBlock`
  // Set `match.enclose` to enclose in curly braces
  // Set `match.indent` to add a tab to the start of each line.
  compile(scope, match) {
    let results = [],
      statement;

    for (var i = 0, line; line = match.matched[i]; i++) {
      try {
        // If we got a comment back, there was no statement.
        if (line.rule?.name === "comment") {
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
        scope.warn("Error compiling statements: match\n", line.toPrint());
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
  getStructure(scope, match) {
    return match.matched.map(match => match.structure);
  }
}
