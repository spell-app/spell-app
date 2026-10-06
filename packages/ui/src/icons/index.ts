/**
 * Barrel for `$/ui/icons` -- the icon PACK format and the names around it.
 * - Loading and caching live in the runtime (`UI.icons`, `src/runtime/IconPacks.ts`);  this is the part that is
 *   shared with node tooling (`tools/IconPackBuilder.ts`, the CLI's `spell icons`) and the built-in pack locations.
 * - Its place in the import graph:  a LEAF -- no DOM, no element core, no runtime;  `core.ts` re-exports it, so
 *   component files reach it as `E.IconName`, `E.BuiltInPacks`.
 * - NOTE: no self-namespace:  `IconName` / `BuiltInPacks` already read as namespaces.
 * - NOTE: the packs themselves (`./icon-packs/<id>/`) and the docs-site data (`./data/*.json`) are files, not exports.
 */

export * from "./icons.types"

export * from "./IconName"
export * from "./BuiltInPacks"
