/**
 * Barrel for `$/ui/static` -- the static server render:  `ui-*` pages => plain light-DOM HTML, no shadow DOM,
 * no JS, for crawlers and no-JS readers (`StaticRender`).
 * - Node only:  runs under `@solidjs/web`'s server build and imports linkedom.  NEVER import it from a component
 *   or `$/ui`'s barrel:  browser bundles must not carry it.
 * - Every file it re-exports runs on the server, so it ends `.server.ts` (WWOD §10 › "Server code stays out of the
 *   browser bundle");  this barrel is `index.ts`, what the `$/ui/static` alias resolves.
 * - Its graph, bottom up:  `static.types.server` <- `ServerIds`, `ServerHost`, `StaticSelectors` <- `ServerRuntime`,
 *   `StaticFlattener`, `StaticInteractions`, `StaticPageStyles` <- `StaticStylesheet`, `StaticRender`;
 *   `StaticCatalog` (every family's classes) beside them.
 * - Its files import each other through `SSR` (`import { SSR } from "$/ui/static"`), resolved at call time;  what
 *   one needs while it EVALUATES (the marks its module constants read) it imports from the defining file
 *   (`barrel.ssr.test.ts` checks every route in).
 * - NOTE: `StaticCatalog` loads every family's classes, so importing this barrel does too.
 */

export * from "./static.types.server"

export * from "./ServerIds.server"
export * from "./ServerHost.server"
export * from "./StaticSelectors.server"
export * from "./ServerRuntime.server"
export * from "./StaticFlattener.server"
export * from "./StaticInteractions.server"
export * from "./StaticPageStyles.server"
export * from "./StaticStylesheet.server"
export * from "./StaticRender.server"
export * from "./StaticCatalog.server"

export * as SSR from "."
