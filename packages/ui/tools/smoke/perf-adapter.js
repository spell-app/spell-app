/**
 * The `PerfAdapter` for the smoke perf page (`tools/frameworks/perf.html`):  Solid 2 applies writes on a microtask,
 * and `flush()` applies them now.  Mapped as `@spell/ui-tools/perf-adapter` by `SmokeRunner`.
 * - `solid-js` resolves through the import map, i.e. the SAME copy the components use.
 */
import { flush } from "solid-js"

export const adapter = { settle: () => flush() }
