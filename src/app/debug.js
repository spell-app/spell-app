// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "global"
import _ from "lodash"
import JSON5 from "json5"

import { projects, spellCore, spellParser, Spell } from "."

// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  // global.global / window.global
  global,
  // all of lodash
  _,
  // JSON5 for parsing
  JSON5,

  //   ParseError,
  //   Parser,
  //   Rule,
  //   Scope,
  Spell,
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
  spellCore,

  // rulex language stuff
  //  rulex,

  // Redux/app stuff
  //  ReduxFactory,
  projects // package/file manipulation reduxFactory

  // test language
  //   prec: precedence,

  // string utils
  //   singularize,
  //   pluralize,
})
