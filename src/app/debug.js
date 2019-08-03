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
  spellParser,
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

//   ParseError,
//   Parser,
//   Rule,
//   Scope,
//   Spell,
//   SpellParser: Spell.Parser,
//   Token,
//   Tokenizer,

  // spell language stuff
  spellParser,
  rules: spellParser.rules,
  parse: spellParser.parse.bind(spellParser),
  compile: spellParser.compile.bind(spellParser),
  exp: (expression, scope) => spellParser.parse(expression, "expression", scope),
  tokenizer: spellParser.tokenizer,
  tokenize: spellParser.tokenize.bind(spellParser),

  // spell core library
  spell,

  // rulex language stuff
//  rulex,

  // Redux/app stuff
//  ReduxFactory,
  projects,    // package/file manipulation reduxFactory

  // test language
//   prec: precedence,

  // string utils
//   singularize,
//   pluralize,
});
