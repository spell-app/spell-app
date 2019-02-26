// HACK: expose a bunch of stuff on `global` for browser debugging

import {
  _,
  global,
  packages,
  ParseError,
  Parser,
  ReduxFactory,
  Rule,
  rulex,
  Scope,
  spell,
  Token,
  Tokenizer,
} from "./all.js";

// Set Parser / Tokenizer debug flags
Parser.WARN = true;
Parser.DEBUG = true;
Parser.TIME = true;
Tokenizer.WARN = true;

// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  _,
  ParseError,
  Parser,
  Rule,
  Scope,
  Token,
  Tokenizer,

  // spell language stuff
  spell,
  rules: spell.rules,
  parse: spell.parse.bind(spell),
  compile: spell.compile.bind(spell),
  exp: spell.parse.bind(spell, "expression"),
  tokenizer: spell.tokenizer,
  tokenize: spell.tokenize.bind(spell),

  // rulex language stuff
  rulex,

  // Redux/app stuff
  ReduxFactory,
  packages,
});
