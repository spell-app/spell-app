/**
 * Barrel for `$/app/solid`:  the app's Solid plumbing while React and Solid live side by side.
 * - `tracked()`:  Solid sees `easy-state` (spell Things, the editor store) change.
 * - NOTE: no namespace of its own (the app's are `UI` and `F`):  import by name,
 *   e.g. `import { tracked } from "$/app/solid"`.
 */

export * from "./tracked"
