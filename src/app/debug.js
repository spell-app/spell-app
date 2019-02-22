// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "global";
import _ from "lodash";

import Parser from "../parser/Parser.js";
import ParseError from "../parser/ParseError.js";
import Rule from "../parser/Rule.js";
import parseRule, { parseSyntax, tokeniseRuleSyntax } from "../parser/parseRule.js";
import Scope from "../parser/Scope.js";
import Tokenizer from "../parser/Tokenizer.js";
import Token from "../parser/Token.js";

import ReduxFactory from "./redux/ReduxFactory.js";
import { getPref, setPref, clearAllPrefs } from "./redux/utils/prefs.js";

// Spell parser
import spell from "../languages/spell/spell.js";
import rulex from "../languages/rulex/rulex.js";


// Set Parser / Tokenizer debug flags
Parser.WARN = true;
Parser.DEBUG = true;
Parser.TIME = true;
Tokenizer.WARN = true;


// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  _,
  Scope,
  Parser,
  ParseError,
  parseRule,
  parseSyntax,
  tokeniseRuleSyntax,

  Rule,
  Tokenizer,
  Token,
  tokenize: Tokenizer.tokenizeWithoutWhitespace,  // HACK

  spell,
  rules: spell.rules,
  parse: spell.parse.bind(spell),
  compile: spell.compile.bind(spell),
  exp: spell.parse.bind(spell, "expression"),

  rulex,

  getPref,
  setPref,
  clearAllPrefs,

  ReduxFactory
});
