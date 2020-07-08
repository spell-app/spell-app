//----------------------------
// Base classes for spell
//--------
import React from "react"
import _ from "lodash"

import { memoize, view } from "~/util"
import { spellCore } from ".."
import { Thing } from "."

//------------------
/**
 * `Drawable`: component that can be used for rendering.
 * Define a draw method as `to draw (a <thing>)` which returns JSX.
 * `draw the thing` will then draw it reactively.
 */
export class Drawable extends Thing {
  /**
   * Return a React.Component which renders an instance.
   * Note that we use a class component to get around hook issues with `react-easy-state`.
   */
  @memoize
  get Component() {
    const render = () => this.draw()
    class DrawableC extends React.Component {
      render = render
    }
    return view(DrawableC)
  }
}
/** Safer `drawThing()` routine --  */
spellCore.drawThing = function (drawable /*, props, children */) {
  if (!drawable?.Component) return null
  return spellCore.element({ tag: drawable.Component })
}
