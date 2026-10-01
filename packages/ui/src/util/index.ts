/**
 * Barrel for `$/util` -- general-purpose utilities with no dependency on the rest of the package.
 * - Re-exports `#util` (`packages/util`, shared with `spell`):  `@proto`, class / string / DOM helpers, `Prettify` ...
 *   They live there, not here, so every package shares ONE copy.
 * - Safe to import anywhere, including `*.types.ts` files and the runtime's lazily-loaded chunk.
 * - NOTE: no namespace here (unlike `UI` / `E`):  utilities are imported by name,
 *   e.g. `import { proto, kebabCase } from "$/util"`.
 * - Nothing package-specific lives here yet, so this is `#util` and nothing more.
 */

export * from "#util"
