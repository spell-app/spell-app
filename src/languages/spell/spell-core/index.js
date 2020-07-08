//----------------------------
//  Core library for JS code emitted from `spell` language
//
//  All compiled spell modules can assume that `spell` and `assert` are in scope.
//
//----------------------------
import { assert } from "./assert"
import { spellCore } from "./core"
import "./collection-core"
import "./collection-other"
import "./string"
import "./tests"
import "./runtime"
import "./ui"

export { spellCore, assert }
export * from "./classes"
