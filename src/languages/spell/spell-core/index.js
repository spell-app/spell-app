////////////
//  Core library for JS code emitted from `spell` language
//
//  All compiled spell modules can assume that `spell` and `assert` are in scope.
//
////////////
import assert from "./assert"
import spell from "./core"
import "./collection-core"
import "./collection-other"
import "./ui"

export default spell
export { spell, assert }
