//----------------------------
// Base classes for spell
//--------
import _ from "lodash"

import { Observable } from "~/util"
import { spellCore } from "."

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
}
spellCore.addExport("Thing", Thing)

//----------------------------
// `Drawable`: something that can be used for rendering... ???
//--------
export class Drawable extends Thing {}
spellCore.addExport("Drawable", Drawable)

//----------------------------
// `App`: a Drawable that renders a full application. ????
//--------
export class App extends Drawable {}
spellCore.addExport("App", App)

//----------------------------
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
spellCore.addExport("List", List)
