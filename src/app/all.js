// Guarantee async/await works in all environments.
import "@babel/polyfill"

export * from "./redux/all.js"

// Parser bits
export * from "../parser/all.js"
export spellParser, { Spell, Scope } from "../languages/spell/all.js"
export rulex from "../languages/rulex/all.js"

// Spell "core" library
export spell from "../languages/spell/spell-core"
