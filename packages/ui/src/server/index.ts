/**
 * Barrel for `$/ui/server` -- the static server render:  `ui-*` pages => plain light-DOM HTML, no shadow DOM,
 * no JS, for crawlers and no-JS readers (`StaticRender`).
 * - Node only:  runs under `@solidjs/web`'s server build and imports linkedom.  NEVER import it from a component
 *   or `$/ui`'s barrel:  browser bundles must not carry it.
 */

export * from "./server.types"

export * from "./ServerRuntime"
export * from "./ServerHost"
export * from "./ServerIds"
export * from "./StaticFlattener"
export * from "./StaticInteractions"
export * from "./StaticPageStyles"
export * from "./StaticSelectors"
export * from "./StaticStylesheet"
export * from "./StaticRender"
export * from "./StaticCatalog"

export * as SSR from "."
