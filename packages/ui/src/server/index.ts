/**
 * Barrel for `$/ui/server` -- the static server render:  `ui-*` pages => plain light-DOM HTML, no shadow DOM,
 * no JS, for crawlers and no-JS readers (`StaticRender`).
 * - Node only:  runs under `@solidjs/web`'s server build and imports linkedom.  NEVER import it from a component
 *   or `$/ui`'s barrel:  browser bundles must not carry it.
 */

export * from "./server.types"

export * from "./ServerRuntime"
export * from "./ServerHost"
export * from "./StaticFlattener"
export * from "./StaticRender"

export * as SSR from "."
