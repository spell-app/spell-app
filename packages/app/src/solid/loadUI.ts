import { isServer } from "@solidjs/web"

/**
 * Loads `@spell-app/ui` for the app's Solid UI:  the ONE place the app does, imported by the `$/app/solid` barrel,
 * so any Solid component (which imports that barrel) has every `<ui-*>` it renders defined.
 * - SIDE EFFECT:  `$/ui`, its barrel, defines EVERY family as it's imported (as the docs' `spell-ui.js` does).
 *   Each element loads the `UI` runtime chunk on first connect;  starting it here lets us add icon packs first.
 * - A DYNAMIC `import()`:  `ui` (~2 MB unminified) is its own chunk, off the app's first paint;  a `<ui-*>` rendered
 *   before it arrives upgrades when it's defined.  And under node, where `customElements` doesn't exist, nothing
 *   loads at all.
 * - Why the whole barrel, not family by family:  from another package, import its barrel only (root `AGENTS.md`,
 *   "Imports").  Per-tag loading is `<ui-root>`'s job;  revisit if the app's first paint gets heavy.
 * - Icon names:  the app speaks Fomantic's (`"ellipsis horizontal"`, `"app store ios"`).  Each surface says so
 *   with a `<ui-root icons="fomantic">` around itself (the editor's `index.html`, `<spell-app>`'s shadow root, the
 *   VS Code webview):  NOT page-wide here, as `<spell-app>` loads this on HOST pages, whose own `<ui-*>` must keep
 *   their icons (27 names mean another icon in Font Awesome, `packages/ui/docs/icons.md` "Clashes";  plan doc
 *   C16).  The editor app also wants it page-wide, for dialogs opened outside its root:  `addAppIconsPageWide()`.
 * - Builds:  the packs load from beside `BuiltInPacks`' chunk;  the app's `vite.config.ts` emits them there
 *   (`appConfig({ iconPacks })`).  In dev and tests they're served from `packages/ui/src/icons/icon-packs/`.
 * - NEVER reachable from `spell-runtime.js` (`spellRuntime.ts`):  compiled spell runs without Solid or `$/ui`.
 * - Server (the `node` test project, `renderToString`):  nothing;  the tags render as plain markup.
 */
export const uiReady: Promise<void> = isServer ? Promise.resolve() : loadUI()

/**
 * Add the `fomantic` icon pack PAGE-wide, for `<ui-*>` outside any `<ui-root icons>`, e.g. dialogs on `<body>`.
 * - The editor app's, from its entry:  NEVER from code a host page loads (`<spell-app>`):  see above.
 */
export async function addAppIconsPageWide(): Promise<void> {
  if (isServer) return
  await uiReady
  const { UI: SpellUI } = await import("$/ui")
  void SpellUI.icons.use("fomantic")
}

/** Import `$/ui` (defining every tag) and start its runtime. */
async function loadUI() {
  const { UI: SpellUI } = await import("$/ui")
  await SpellUI.load()
}
