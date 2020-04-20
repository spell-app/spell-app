import global from "global"

// Guarantee async/await works in all environments.
import "@babel/polyfill"

import {
  abortableFetch,
  $fetch,
  Loadable,
  Saveable,
  LoadableFile,
  TextFile,
  JSONFile,
  JSON5File,
  ImageFile
} from "../util"

export * from "./redux"

// Parser bits
export * from "../parser"
export { spellParser, Spell } from "../languages/spell"

// Spell "core" library
export { default as spellCore } from "../languages/spell/spell-core"

// DEBUG
Object.assign(global, {
  abortableFetch,
  $fetch,
  Loadable,
  Saveable,
  LoadableFile,
  TextFile,
  JSONFile,
  JSON5File,
  ImageFile
})
