/**
 * Readers OUTSIDE spell state:  how Solid, and plain code, follow cells -- see `cells.ts`.
 * - `bridgeSolid()` -- every Solid computation reads cells, installed ONCE per Solid by the HOST (the app, a
 *   runner, `<spell-app>`):  `util` and `core` never import Solid, so `spell-runtime.js` holds none.
 * - `observe()` -- a plain function re-run synchronously as what it read changes, e.g. `SpellModels`.
 * - (React's was `view()`, gone with React:  epic `output-targets` P11.)
 */

import { addCellsHostFlush, cellsContext, untrackCells } from "./cells"
import { Reaction } from "./Reaction"

////////////////
// ## Solid
////////////////

/**
 * Make every Solid computation (memo, effect compute, JSX expression) re-run when a cell it read changes.
 * - Pass the page's Solid:  `bridgeSolid({ enableExternalSource, flush })` from `solid-js`.
 * - ONCE per Solid, however many hosts call it:  Solid PIPES each `enableExternalSource()` call into the last, so a
 *   second registration would wrap every computation twice.  Remembered in the page's shared context, so a
 *   `<spell-app>` and the editor on one page share the one bridge -- and every runtime copy's cells reach it.
 * - Applies to computations made AFTER it:  call it before the host renders anything that reads spell state.
 * - SIDE EFFECT:  `flushCells()` (`spellCore.flush()`) now also calls this Solid's `flush()`.
 * - A changed cell triggers its readers at once, but Solid re-runs them on ITS schedule (a microtask, or
 *   `flushCells()`):  never in the middle of a program's own writes, and ten writes re-run a reader once.
 */
export function bridgeSolid(solid: SolidForBridge): void {
  const context = cellsContext
  if (context.bridged.has(solid.enableExternalSource)) return
  context.bridged.add(solid.enableExternalSource)
  solid.enableExternalSource({
    factory(compute, trigger) {
      const reaction = new Reaction(trigger)
      return {
        track: (previous) => reaction.run(() => compute(previous)),
        dispose: () => reaction.dispose()
      }
    },
    untrack: untrackCells
  })
  addCellsHostFlush(solid.flush)
}

/** The bits of Solid (`solid-js`) `bridgeSolid()` needs -- typed here, so `util` never imports Solid. */
export type SolidForBridge = {
  /** `solid-js`'s `enableExternalSource`. */
  enableExternalSource(config: {
    factory(compute: (previous: any) => any, trigger: () => void): { track(previous: any): any; dispose(): void }
    untrack?<T>(fn: () => T): T
  }): void
  /** `solid-js`'s `flush`. */
  flush(): void
}

////////////////
// ## Plain code
////////////////

/**
 * Run `fn` now, and again -- synchronously -- each time a cell it read changes.  Returns what stops it.
 * - Only a derived value it read changed:  re-run on a microtask, if its value really
 *   changed (`flushCells()` settles it).
 * - NEVER re-runs for a change `fn` makes itself while running -- see `Reaction`.
 * - For code outside Solid, e.g. following a file's `contents` into a Monaco model.
 */
export function observe(fn: () => void): () => void {
  const reaction = new Reaction(rerun)
  rerun()
  return () => reaction.dispose()

  /** Run `fn` again, collecting what it reads. */
  function rerun() {
    reaction.run(fn)
  }
}
