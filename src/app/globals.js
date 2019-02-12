// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "../utils/global.js";
import Parser from "../Parser.js";
import Rule from "../Rule.js";
import parseRule, { parseSyntax } from "../RuleSyntax.js";
import Tokenizer from "../Tokenizer.js";

import parser from "../languages/spell/spell.js";

Object.assign(global, {
  Parser,
  parseRule,
  parseSyntax,

  Rule,

  Tokenizer,
  tokenize: Tokenizer.tokenizeWithoutWhitespace,  // HACK

  parser,
  rules: parser.rules,
  parse: parser.parse.bind(parser),
  compile: parser.compile.bind(parser),
});
