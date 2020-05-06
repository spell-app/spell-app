// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "global"
import _ from "lodash"
import JSON5 from "json5"

import { spellParser, SpellParser } from "~/languages/spell"
import { spellCore } from "~/languages/spell/spell-core"

// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  global,
  _, // lodash
  JSON5,
  spellCore,
  SpellParser,
  spellParser,
  parse: spellParser.parse.bind(spellParser),
  compile: spellParser.compile.bind(spellParser),
  exp: (expression, scope) => spellParser.parse(expression, "expression", scope),
  tokenizer: spellParser.tokenizer,
  tokenize: spellParser.tokenize.bind(spellParser)
})
