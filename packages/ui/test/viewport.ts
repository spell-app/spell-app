import { onTestFinished } from "vitest"
import { page } from "vitest/browser"

/****************
 * ### `Viewport`
 * Resize the test iframe for one test, put back when it finishes -- for `stack-with="page"` and other `@media` rules.
 * - Render FIRST, then resize:  WebKit keeps a shared adopted sheet's `@media` results stale when no element using it
 *   is alive at the resize (`SUSPECTED-BUGS.md`, `## ui`, `Styles.ts`)
 ****************/
export class Viewport {
  /** Viewport `width` x `height` until the test ends;  waits a frame for the media queries to follow. */
  static async resize(width: number, height = 900) {
    const [previousWidth, previousHeight] = [window.innerWidth, window.innerHeight]
    // a frame first, so what the test just rendered has been styled:  WebKit kept a just-inserted grid's `@media`
    // results from BEFORE the resize when its style had never been resolved (measured, `ui-grid.test.tsx`)
    await Viewport.frame()
    await page.viewport(width, height)
    onTestFinished(() => page.viewport(previousWidth, previousHeight))
    await Viewport.frame()
  }

  /** Wait one animation frame:  layout and container / media queries caught up with a size change. */
  static frame(): Promise<void> {
    return new Promise((resolve) => requestAnimationFrame(() => resolve()))
  }
}
