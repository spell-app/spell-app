/**
 * Base classes for spell.
 */
import { core } from "$/core/core"
import { Thing } from "./Thing"

/**
 * `App`: a `Thing` that draws a whole application -- what `a game is an app` extends.
 * - Set the `draw` method (e.g. via a spell-compiled `to draw`) and start things with `start the game`.
 */
export class App extends Thing {
  /**
   * Mount this app's drawing into `core.appElement()` (`core.mountApp()`), creating a
   * `core.REACT_APP_ROOT_ID` container `div` if there's none.
   * - Compiles from `start the game` -- see `rules/draw/StartApp.ts` (a method call on the app instance, not a global).
   * - Starting again replaces the app drawn there.
   * - SIDE EFFECT: appends a `div` to `document.body` the first time it's called, if the host set no `appRoot`.
   * - With `core.appLayout` (a `<spell-app>` with markup inside it):  draws nothing, saying so on the console.
   */
  start(): void {
    if (core.appLayout) {
      core.console.log(`${this.constructor.name}:  its page's markup draws it, not its \`to draw\``)
      return
    }
    let element = core.appElement()
    if (!element) {
      element = document.createElement("div")
      element.id = core.REACT_APP_ROOT_ID
      document.body.appendChild(element)
    }
    core.mountApp(this, element)
  }
}
