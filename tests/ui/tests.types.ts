/**
 * `packages/ui/test/test.types.ts`'s two Vitest augmentations, again, for the tests here.
 * - Why twice:  `ui` has its own copy of `vite-plus` (and so of `vitest`) in `packages/ui/node_modules/`, while a
 *   test in this folder finds the repo root's copy.  An augmentation reaches only the copy its file resolves, so
 *   that file's reaches the helpers, and this one the tests.
 * - Keep the two the same.  Gone once `ui` shares the root's copy, or its helpers move here too.
 */

declare module "vitest" {
  /** What `provide` hands the browser tests, read with `inject()` (`packages/ui/vitest.config.ts`). */
  export interface ProvidedContext {
    /** Running on CI:  skip timing budgets a shared runner can't hold. */
    ci: boolean
  }
}

declare module "vitest/browser" {
  /** Custom commands of `packages/ui/vitest.config.ts` (`browser.commands`). */
  interface BrowserCommands {
    /** Emulate (or stop emulating) `prefers-reduced-motion: reduce`, through Playwright, in every browser. */
    emulateReducedMotion(reduce: boolean): Promise<void>
  }
}

export {}
