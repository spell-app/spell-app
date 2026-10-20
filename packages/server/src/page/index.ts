/**
 * `$/server/page` barrel:  the page server, one per checkout, and its page editor.
 * - Opt-in:  NOT in `$/server`'s barrel, since it brings `parse5` and loads route modules.
 * - Generic:  what it serves beyond the checkout and its content folder (component sets, engine routes, page scripts,
 *   route modules) comes from the root `package.json`'s `"pageServer"` settings (`pageServerSettings()`).
 *   What only spell-app's page server does is its own package's route module, `$/page-server`.
 * - NOTE: `cli.ts` is left out:  it's the `spell dev server` entry point, and runs on import.
 */
export * from "./page.types"
export * from "./settings"

export * from "./PageEditor"
export * from "./PageServer"
export * from "./prune"
