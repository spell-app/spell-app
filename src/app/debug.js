// HACK: expose a bunch of stuff on `global` for browser debugging
export global from "global";
import _ from "lodash";
import JSON5 from "JSON5";

import {
  projects,
  ParseError,
  Parser,
  ReduxFactory,
  Rule,
  rulex,
  Scope,
  spell,
  SpellParser,
  Token,
  Tokenizer,
} from "./all.js";

import precedence from "../languages/precedence/precedence.js";
precedence.setDebugLevel("INFO");

// Output source when rendering statements
SpellParser.prototype.outputSource = true;
SpellParser.prototype.setDebugLevel("INFO");

// Set Parser / Tokenizer debug flags
spell.TIME = true;

// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  _,
  JSON5,

  ParseError,
  Parser,
  Rule,
  Scope,
  SpellParser,
  Token,
  Tokenizer,

  // spell language stuff
  spell,
  rules: spell.rules,
  parse: spell.parse.bind(spell),
  compile: spell.compile.bind(spell),
  exp: (expression, scope) => spell.parse(expression, "expression", scope),
  tokenizer: spell.tokenizer,
  tokenize: spell.tokenize.bind(spell),

  // rulex language stuff
  rulex,

  // Redux/app stuff
  ReduxFactory,
  projects,    // package/file manipulation reduxFactory

  // test language
  prec: precedence
});
