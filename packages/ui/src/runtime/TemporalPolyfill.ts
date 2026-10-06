import { Temporal } from "temporal-polyfill"

import { TEMPORAL_POLYFILL } from "./runtime.types"

/**
 * The lazy chunk `I18n.loadTemporal()` imports:  `temporal-polyfill`'s `Temporal`, checked.
 * - Why a wrapper, not `import("temporal-polyfill")`:  its static import of `runtime.types` (built into `core.js`)
 *   makes this chunk depend on core, so Rolldown keeps its runtime helpers (`__name`, from `keepNames`) there.  The
 *   bare package chunk needed them WITHOUT depending on core, and Rolldown split them into a
 *   `rolldown-runtime-<hash>.js` that EVERY page then loaded (`yarn measure`'s `runtimeChunks` check).
 * - NEVER drop the `TEMPORAL_POLYFILL` use below:  an unused import is tree-shaken, and the split comes back.
 */
if (!Temporal?.PlainDate) {
  throw new Error(`I18n.loadTemporal():  ${TEMPORAL_POLYFILL} has no \`Temporal\` export;  check its version`)
}

export { Temporal }
