import global from "global"

// Guarantee async/await works in all environments.
import "@babel/polyfill"

import { abortableFetch, $fetch, Loadable, LoadableFile, TextFile, JSONFile, JSON5File, ImageFile } from "../util"

// Parser bits
export * from "../parser"
export { spellParser, SpellParser } from "../languages/spell"

// Spell "core" library
export { default as spellCore } from "../languages/spell/spell-core"

// DEBUG
Object.assign(global, {
  abortableFetch,
  $fetch,
  Loadable,
  LoadableFile,
  TextFile,
  JSONFile,
  JSON5File,
  ImageFile
})
