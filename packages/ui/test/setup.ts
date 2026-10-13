/**
 * Vitest `setupFiles` entry, run before every test file:  Spell UI's own (`vitest.config.ts`), and the browser tests
 * of every set written on `$/spell-solid` (`spell-solid`'s, the epics', the brand's, the app's).
 * - Loads Spell UI's core, which installs Spell UI's settings (`SpellSolid.install()`), as a page has them:
 *   a test that defines a pack's element straight from its source (`EpicNote`, written on `$/spell-solid` alone)
 *   would otherwise find none.
 * - NOTE: per-test DOM cleanup is NOT here -- `Fixture.render()` registers its own `afterEach`.
 */

import "$/ui/core"
