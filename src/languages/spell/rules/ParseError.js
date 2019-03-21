import {
  Match,
  Rule,
  Spell,
  Tokenizer
} from "../all.js";

// Parser error representation in parser output.
Spell.Rule.ParseError = class parse_error extends Rule {
  // Eat all of the tokens.
  parse(scope, tokens) {
    return new Match({
      rule: this,
      matched: tokens,
      length: tokens.length
    });
  }

  compile(scope, match) {
    const unparsed = Tokenizer.join(match.matched);
    return "/" + "/ WARNING: Couldn't parse:  `" + unparsed + "`";
  }
};
