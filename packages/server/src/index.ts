/**
 * `$/server` barrel:  serving pages locally, for every package.  One namespace, `SRV`.
 * - The parts:  content types, safe paths, static folders, an Express-shaped router with body parsing, ports,
 *   openers (browser, Chrome tab, VS Code), a file lock, and running until `Ctrl-C`.
 * - Node built-ins only:  json5 / esbuild come in as hooks from the caller, so anything may import this.
 * - NOTE: `page/` (the page server, its CLI, page edits) and `site/` (the site header, browser code) are NOT here:
 *   opt-in entry points `$/server/page/...` and `$/server/site/...`, since they bring dependencies and a CLI.
 */
export * from "./server.types"

export * from "./mime"
export * from "./safePath"
export * from "./ports"
export * from "./open"
export * from "./untilInterrupted"
export * from "./FileLock"

export * from "./Request"
export * from "./Reply"
export * from "./bodies"
export * from "./Router"
export * from "./listener"
export * from "./StaticHandler"

export * as SRV from "."
