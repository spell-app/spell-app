/**
 * The entry of `spell-language.js` (`yarn build:element`, `vite.code.config.ts`):
 * colours spell on a page with Spell UI of its own, and does nothing else.
 * - It registers `spell` with the page's `UI.code` (`SpellLanguage`), so EVERY `<ui-code language="spell">` there is
 *   coloured, a spell block in any `<ui-markdown>` too.
 * - What the page server adds to the docs pages it serves (the root `package.json`'s `"pageServer"`, `"pageScripts"`;
 *   epic `repo-split` Q23):  epic pages and guides colour spell, though spell-epic imports nothing of the app.
 * - Unlike `spell-code.js`, it defines no element, so it needs nothing of Spell UI's families:
 *   any page's Spell UI will do (only its core, `spell-solid-shared.js`).
 * - A page with no Spell UI (no `globalThis.SpellUI`) gets nothing:  no Solid or Spell UI loads for it.
 *   Hence the `import()`, which loads the page's core only where there is one.
 */

if ("SpellUI" in globalThis) {
  import("$/app/components/spell-code/SpellLanguage")
    .then(({ SpellLanguage }) => SpellLanguage.registerWhenLoaded())
    .catch((error: unknown) => console.error("spell-language.js:  spell's colouring didn't load", error))
}
