// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "global";
import _ from "lodash";

import Parser from "../parser/Parser.js";
import ParseError from "../parser/ParseError.js";
import Rule from "../parser/Rule.js";
import parseRule, { parseSyntax, tokeniseRuleSyntax } from "../parser/parseRule.js";
import Tokenizer from "../parser/Tokenizer.js";
import Token from "../parser/Token.js";

import ReduxFactory from "../redux/ReduxFactory.js";
import { getPref, setPref, clearAllPrefs } from "../utils/prefs.js";

// Spell parser
import parser from "../languages/spell/spell.js";


// Set Parser / Tokenizer debug flags
Parser.WARN = true;
Parser.DEBUG = true;
Parser.TIME = true;
Tokenizer.WARN = true;


// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  _,
  Parser,
  ParseError,
  parseRule,
  parseSyntax,
  tokeniseRuleSyntax,

  Rule,

  Tokenizer,
  Token,
  tokenize: Tokenizer.tokenizeWithoutWhitespace,  // HACK

  parser,
  rules: parser.rules,
  parse: parser.parse.bind(parser),
  compile: parser.compile.bind(parser),
  exp: parser.parse.bind(parser, "expression"),

  getPref,
  setPref,
  clearAllPrefs,

  ReduxFactory
});
