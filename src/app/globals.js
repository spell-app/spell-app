// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "global";
import _ from "lodash";

import Parser from "../Parser.js";
import ParseError from "../ParseError.js";
import Rule from "../Rule.js";
import parseRule, { parseSyntax, tokeniseRuleSyntax } from "../RuleSyntax.js";
import Tokenizer from "../Tokenizer.js";

import parser from "../languages/spell/spell.js";

Object.assign(global, {
  _,
  Parser,
  ParseError,
  parseRule,
  parseSyntax,
  tokeniseRuleSyntax,

  Rule,

  Tokenizer,
  tokenize: Tokenizer.tokenizeWithoutWhitespace,  // HACK

  parser,
  rules: parser.rules,
  parse: parser.parse.bind(parser),
  compile: parser.compile.bind(parser),
});
