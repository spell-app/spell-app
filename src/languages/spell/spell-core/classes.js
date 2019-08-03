//////////
// Base classes for spell
//--------
import _ from "lodash"
import { spell, assert } from "."


//////////
// `Thing`: base for all object-like things
//--------
export class Thing {
  constructor(props) {
    Object.assign(this, props)
  }
}
spell.addExport("Thing", Thing)


//////////
// `List`: our array concept (1-based)
//--------
export class List extends Array {
  constructor(...values) {
    if (values.length) this.splice(0, 0, ...values)
  }
}
spell.addExport("List", List)
