/**
 * Barrel for `$/util` -- general-purpose utilities with no dependency on the rest of the package.
 * - Safe to import anywhere, including `*.types.ts` files and the runtime's lazily-loaded chunk.
 * - NOTE: no namespace here (unlike `UI` / `E`):  utilities are imported by name,
 *   e.g. `import { proto, kebabCase } from "$/util"`.
 */

export * from "./util.types"

export * from "./class"
export * from "./decorators"
export * from "./string"
export * from "./dom"
