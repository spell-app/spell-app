/**
 * Entry of `spell-page.js`:  a page that draws a program running ELSEWHERE,
 * e.g. a Python program served by Quart (epic `python-target` P20).
 * - Built by `yarn build:page` into `dist-page/`, after `vite.solid.config.ts`:  see `vite.page.config.ts`.
 * - It IS the page's `@spell/core`:  the program's drawing half, `<Project>.elements.spell.js`, imports from it,
 *   through the page's import map.
 * - It exports what `spell-runtime.js` exports for compiled javascript (`spellPage.test.ts` pins it),
 *   plus the page's side (`page.ts` in `$/core`):
 *   `connectPage()`, `startPage()`, `sendCall()`, `sendTrigger()`.
 * - Unlike a runner's, it sets up the page itself:  Spell UI's elements, Solid following spell's cells,
 *   and a drawable thing's own element, e.g. `<solitaire-card>`.
 *
 * ```html
 * <script type="importmap">{ "imports": { "@spell/core": "/spell/spell-page.js" } }</script>
 * <script type="module">
 *   import { connectPage } from "@spell/core"
 *   import * as elements from "/Solitaire.elements.spell.js"
 *   connectPage({ modules: [elements], url: "/ws" })
 * </script>
 * ```
 */
import "$/app/solid/cellsBridge"
import "$/app/solid/loadUI"
import {
  core,
  Thing,
  List,
  App,
  Drawable,
  DrawableList,
  h,
  css,
  on,
  off,
  once,
  trigger,
  positionOf,
  position,
  spellPosition,
  endPosition,
  withSpellPositions,
  connectPage,
  startPage,
  sendCall,
  sendTrigger
} from "$/core"
import { installSpellElements } from "./SpellElement"

// a drawable thing's element, e.g. `<solitaire-card>`:  Spell UI's, which core can't make itself
installSpellElements(core)

export {
  core,
  Thing,
  List,
  App,
  Drawable,
  DrawableList,
  h,
  css,
  on,
  off,
  once,
  trigger,
  positionOf,
  position,
  spellPosition,
  endPosition,
  withSpellPositions,
  connectPage,
  startPage,
  sendCall,
  sendTrigger
}
