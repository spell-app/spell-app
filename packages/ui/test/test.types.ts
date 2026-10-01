/**
 * Types shared by the test helpers and the example hooks under `src/components/ui-<family>/examples/`.
 * - MUST stay runtime-light:  `import type` only.  The visual spec (node) and the fixture page (browser) both
 *   import the `.visual.ts` hooks that use these.
 */

////////////////
// ## Provided by `vitest.config.ts`
////////////////

declare module "vitest" {
  /**
   * What `provide` hands the browser tests, read with `inject()`.
   * - NOTE: an `interface`, not a `type`:  module augmentation only merges interfaces.
   */
  export interface ProvidedContext {
    /** Running on CI (`CI` set, as GitHub Actions does):  skip timing budgets a shared runner can't hold. */
    ci: boolean
  }
}

declare module "vitest/browser" {
  /** Custom commands of `vitest.config.ts` (`browser.commands`). */
  interface BrowserCommands {
    /** Emulate (or stop emulating) `prefers-reduced-motion: reduce`, through Playwright, in every browser. */
    emulateReducedMotion(reduce: boolean): Promise<void>
  }
}

////////////////
// ## Visual tests
////////////////

/**
 * Hooks of one element example for `yarn test:visual`:  the default export of
 * `examples/elements/<example>.visual.ts`, next to `<example>.html`.
 * - Optional:  an example without one gets its closed state captured, light and dark.
 * - Discovered by file name, so adding the file is all it takes (`docs/visual-testing.md`).
 * - NOTE: the node side only reads the NAMES, `capture` and `mask`;  `open()` runs in the page.
 */
export type VisualHooks = {
  /**
   * Selectors (Playwright CSS, which pierces open shadow roots) painted over in every capture of this example
   * - for regions that can't be made deterministic at their source;  prefer freezing (time, animations)
   */
  mask?: readonly string[]
  /** extra states to capture after the closed one, by name (kebab case:  it becomes part of a file name) */
  states?: Readonly<Record<string, VisualState>>
}

/**
 * One extra state of an example, e.g. a modal shown.
 * - Each state is its own test on a fresh page:  states never see each other's leftovers.
 */
export type VisualState = {
  /**
   * Puts the example in this state;  runs IN THE PAGE, after the example settled, and is settled after.
   * - `root` ~== `#example`, the box holding the example markup
   * - set the element's own API (`open`, `visible`, `UI.toast()`), not clicks:  the capture shows the state,
   *   not the interaction
   */
  open: (root: HTMLElement) => void | Promise<void>
  /**
   * What to capture
   * - `example` (default) -- the example's box;  an overlay drawn beyond it is cut off
   * - `viewport` -- the whole 1024 x 768 viewport, for top-layer overlays placed by the viewport (modal,
   *   flyout, toast container)
   */
  capture?: "example" | "viewport"
}
