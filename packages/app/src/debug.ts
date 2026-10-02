// HACK: expose a bunch of stuff on `global` for browser debugging
import global from "global"
import _ from "lodash"
import JSON5 from "json5"

import { P } from "$/parser"
import { SP } from "$/spell"
import { editor, runtimeSpellCore } from "$/app/editor"

// Stick interesting bits on `global` to make console debugging easier.
Object.assign(global, {
  global,
  _, // lodash
  JSON5,
  SpellParser: SP.SpellParser,
  spellParser: SP.spellParser,
  parse: SP.spellParser.parse.bind(SP.spellParser),
  compile: SP.spellParser.compile.bind(SP.spellParser),
  exp: SP.parseExpression,
  tokenizer: SP.spellParser.tokenizer,
  tokenize: SP.spellParser.tokenize.bind(SP.spellParser),
  rulex: P.Parser.rulexParser,
  editor
})

// the `spellCore` programs run on -- the runtime's, NOT one of our own:  see `runtimeSpellCore()`
Object.defineProperty(global, "spellCore", { get: runtimeSpellCore, configurable: true })
