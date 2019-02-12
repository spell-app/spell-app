// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "../utils/global.js";
import Parser from "../Parser.js";
import parseRule from "../RuleSyntax.js";
import Rule from "../Rule.js";
import Tokenizer from "../Tokenizer.js";

import parser from "../languages/spell/spell.js";

Object.assign(global, {
  Parser,
  parseRule,

  Rule,

  Tokenizer,
  tokenize: Tokenizer.tokenizeWithoutWhitespace,  // HACK

  parser,
  rules: parser.rules,
  parse: parser.parse.bind(parser),
  compile: parser.compile.bind(parser)
});
