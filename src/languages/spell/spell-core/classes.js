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
    this.create()
  }

  // Called automatially at end of `thing` constructor.
  create() {}
}
spell.addExport("Thing", Thing)


//////////
// `List`: our array concept (1-based)
//--------
export class List extends Array {
  constructor(...values) {
    super(...values)
    if (values.length) this.push(...values)
    this.create()
  }

  // Called automatially at end of `List` constructor.
  create() {}
}
spell.addExport("List", List)
