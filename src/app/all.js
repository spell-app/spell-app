// Guarantee async/await works in all environments.
import "@babel/polyfill"

export * from "./redux/all"

// Parser bits
export * from "../parser/all"
export { spellParser, Spell, Scope } from "../languages/spell/all"

// Spell "core" library
export { default as spellCore } from "../languages/spell/spell-core"
