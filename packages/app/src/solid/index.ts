/**
 * Barrel for `$/app/solid`:  the app's Solid plumbing while React and Solid live side by side.
 * - `tracked()`:  Solid sees `easy-state` (spell Things, the editor store) change.
 * - `solidIsland()`:  a React component around a Solid one, for React pages until they move (P8).
 * - `solid.types.ts`:  `<ui-*>` tags in Solid JSX.
 * - NOTE: no namespace of its own (the app's are `UI` and `F`):  import by name,
 *   e.g. `import { tracked } from "$/app/solid"`.
 */

export * from "./solid.types"

export * from "./tracked"
export * from "./solidIsland"
