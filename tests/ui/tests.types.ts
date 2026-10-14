/**
 * What `ui`'s Vitest settings (`packages/ui/vitest.config.ts`) add to Vitest's types, for `ui`'s tests:
 * - `inject("ci")`:  running on CI, so a timing test skips its budget (the dropdown's speed test)
 * - `commands.emulateReducedMotion()`:  a browser command turning "reduced motion" on (the reveal's test)
 * - Here, beside the tests that use them (decision J28 of epic `people-and-orgs`):  an augmentation reaches only the
 *   copy of Vitest its own file finds, and a test in this folder finds the repo root's copy.
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
