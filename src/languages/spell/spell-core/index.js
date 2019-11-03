// //////////
//  Core library for JS code emitted from `spell` language
//
//  All compiled spell modules can assume that `spell` and `assert` are in scope.
//
// //////////
import { default as assert } from "./assert"
import { default as spell } from "./core"
import "./collection-core"
import "./collection-other"
import "./ui"
import { Thing, List } from "./classes"

export default spell
export { spell, assert, Thing, List }
