/**
 * `spell-app/page-server` barrel:  what only spell-app's page server does, on top of the generic one (`spell-kit/server/page`).
 * One namespace, `PS`.
 * - its route module, `pageServerRoutes` (the default export of `pageServerRoutes.ts`, loaded by path from the
 *   settings' `"routes"`):  the bundles' build, the offline highlight.js swap, the shared pages' bridge
 * - `BundleBuild`:  the bundles it serves, built with spell's own CLI
 * - Node only.  The component sets and engine routes it serves are settings, in the root `package.json`'s
 *   `"pageServer"` block, read by the generic server (epic `repo-split` P4).
 */
export * from "./page-server.types"

export * from "./BundleBuild"
export { localHighlight } from "./pageServerRoutes"

export * as PS from "."
