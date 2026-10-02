/** @jsxImportSource react */
/**
 * Base classes for spell.
 */
import { createRoot } from "react-dom/client"

import { spellCore } from "$/core/core"
import { Thing } from "./Thing"

/**
 * `App`: a `Thing` (Drawable) that renders a full application -- what `a game is an app` extends.
 * - Set the `draw` method (e.g. via a spell-compiled `to draw`) and start things with `start the game`.
 */
export class App extends Thing {
  /**
   * Mount this app's `.Component` into the DOM:  into `spellCore.appElement()`, creating a
   * `spellCore.REACT_APP_ROOT_ID` container `div` if there's none.
   * - Compiles from `start the game` -- see `draw.ts` (a method call on the app instance, not a global).
   * - SIDE EFFECT: appends a `div` to `document.body` the first time it's called, if the host set no `appRoot`.
   */
  start(): void {
    let element = spellCore.appElement()
    if (!element) {
      element = document.createElement("div")
      element.id = spellCore.REACT_APP_ROOT_ID
      document.body.appendChild(element)
    }
    const root = createRoot(element)
    root.render(<this.Component />)
    // assign `root` to element so we can unmount it later
    ;(element as HTMLElement & { REACT_ROOT?: ReturnType<typeof createRoot> }).REACT_ROOT = root
  }
}
