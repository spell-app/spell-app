import { isServer } from "@solidjs/web"

import { UI as SpellUI } from "$/ui"

/**
 * Loads `@spell-app/ui` for the app's Solid UI:  the ONE place the app does, imported by the `$/app/solid` barrel,
 * so any Solid component (which imports that barrel) has every `<ui-*>` it renders defined.
 * - SIDE EFFECT:  `$/ui`, its barrel, defines EVERY family as it's imported (as the docs' `spell-ui.js` does).
 *   Each element loads the `UI` runtime chunk on first connect;  starting it here lets us add icon packs first.
 * - Why the whole barrel, not family by family:  from another package, import its barrel only (root `AGENTS.md`,
 *   "Imports").  Per-tag loading is `<ui-root>`'s job;  revisit if the app's first paint gets heavy.
 * - Icon names:  the app speaks Fomantic's (`"ellipsis horizontal"`, `"app store ios"`), so the PAGE set adds
 *   the `fomantic` pack over the default `fa7-free`.  The last pack wins:  27 names mean another icon in Font
 *   Awesome (`packages/ui/docs/icons.md`, "Clashes").  Added before any element can ask:  our `then` is the
 *   first one on `UI.load()`'s shared promise.
 * - Builds:  the packs load from beside `BuiltInPacks`' chunk;  the app's `vite.config.ts` emits them there
 *   (`appConfig({ iconPacks })`).  In dev and tests they're served from `packages/ui/src/icons/icon-packs/`.
 * - NEVER reachable from `spell-runtime.js` (`spellRuntime.ts`):  compiled spell runs without Solid or `$/ui`.
 * - Server (the `node` test project, `renderToString`):  defines the tags only;  no runtime, no icons.
 */
export const uiReady: Promise<void> = isServer ? Promise.resolve() : SpellUI.load().then(useAppIcons)

/** Add the icon packs the app's names come from, over the default. */
function useAppIcons() {
  void SpellUI.icons.use("fomantic")
}
