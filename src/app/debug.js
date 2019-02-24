// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "global";
import _ from "lodash";

import {
  Parser,
  ParseError,
  parseRule,
  parseSyntax,
  Rule,
  Scope,
  Tokenizer,
  Token
} from "../parser/index.js";

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

  Rule,
  Tokenizer,
  Token,

  spell,
  rules: spell.rules,
  parse: spell.parse.bind(spell),
  compile: spell.compile.bind(spell),
  exp: spell.parse.bind(spell, "expression"),
  tokenizer: spell.tokenizer,
  tokenize: spell.tokenize.bind(spell),

  rulex,

  getPref,
  setPref,
  clearAllPrefs,

  ReduxFactory
});
