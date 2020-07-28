//----------------------------
// Base classes for spell
//--------
import _ from "lodash"

import { Observable } from "~/util"
import { spellCore, Eventful } from ".."

//----------------------------
// `Thing`: base for all object-like things
//--------
export class Thing extends Observable {
  constructor(props) {
    super(props)
    this.create()
  }

  // Called automatially at end of `thing` constructor.
  create() {}

  // Default `type` to the name of our constructor.  Instances can override.
  // TESTME
  get type() {
    return "type" in this._props ? this._props.type : this.constructor.name
  }
  set type(type) {
    this._props.type = type
  }
}
spellCore.addExport("Thing", Thing)
