/**
 * Vitest `setupFiles` entry, run before every test file:  Spell UI's own (`vitest.config.ts`), and the browser tests
 * of the other sets written on `$/spell-element` that draw on Spell UI (the epics', the brand's, the app's).
 * - `$/spell-element`'s own tests don't:  they install stand-in settings of their own (its `test/TestSettings.ts`).
 * - Loads Spell UI's core, which installs Spell UI's settings (`SpellSolid.install()`), as a page has them:
 *   a test that defines a pack's element straight from its source (`EpicNote`, written on `$/spell-element` alone)
 *   would otherwise find none.
 * - NOTE: per-test DOM cleanup is NOT here -- `Fixture.render()` registers its own `afterEach`.
 */

import "$/ui/core"
