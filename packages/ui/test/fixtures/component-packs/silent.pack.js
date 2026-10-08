/**
 * A broken test component pack (`src/components/ui-components/ComponentPacks.test.ts`):  it runs, but never calls
 * `SpellUI.registerPack()`, so its load must fail.
 */
;(() => {
  globalThis.__silentPackRuns = (globalThis.__silentPackRuns ?? 0) + 1
})()
