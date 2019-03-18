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
  Spell,
  Token,
  Tokenizer,
  singularize,
  pluralize,
} from "./all.js";

import precedence from "../languages/precedence/precedence.js";

// Output source when rendering statements
Spell.Parser.prototype.outputSource = false;       // TODO: add a control for this to the UI

// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  _,
  JSON5,

  ParseError,
  Parser,
  Rule,
  Scope,
  SpellParser: Spell.Parser,
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
  prec: precedence,

  // string utils
  singularize,
  pluralize,
});
