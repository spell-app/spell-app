import { defineConfig } from "vite"

import { appConfig, sharedSolid } from "./vite.shared.ts"

/**
 * Build spell's code and markdown elements:  `yarn build:element` => `dist-element/`, after `vite.solid.config.ts`.
 * - Three entries:
 *   - `spell-code.js`:  `<spell-code>`, and `spell` registered with the page's `UI.code` (`src/app/components/spell-code/`)
 *   - `spell-markdown.js`:  `<spell-markdown>`, spell's markdown engine (`src/app/components/spell-markdown/`)
 *   - `spell-language.js`:  ONLY `spell` registered, for a page with Spell UI of its own (`src/app/spellLanguage.ts`):
 *     what the page server adds to the docs pages it serves
 * - The component pack, `spell.pack.js` (`vite.element.config.ts`), imports the first two too.
 * - Its own build, not more entries of `vite.element.config.ts`:
 *   that one puts everything its entries share in ONE chunk (`spell-shared.js`), which `<spell-app>` loads up front.
 * - The heavy halves are lazy chunks, `spell-code-*.js`:
 *   - spell's parser and rules, for the colours (`SpellLanguage`), the first time a page shows spell
 *   - spell's markdown engine (`MDEngine`), on the first render
 * - `SpellLanguage` is a chunk of its own (`spell-code-SpellLanguage.js`):  `spell-language.js` imports it, never
 *   `spell-code.js`, which would define `<spell-code>` and need Spell UI's families.
 *   - And `spell-language.js` imports it LAZILY:  so does nothing else up front (Vite's preload helper too is a chunk
 *     of its own, `spell-code-preload.js`).
 * - Solid and Spell UI are NOT bundled, as for `<spell-app>`:  `sharedSolid()`.
 *   - Solid and the core through `spell-solid-shared.js`;  the code and markdown families through
 *     `spell-ui-shared.js` (`SHARED_FAMILIES`).
 *   - Both the page's own, on a page with Spell UI of its own (a docs page):  one Solid, one Spell UI.
 * - Fixed names:  the pack and the page server name the entries.
 * - Plugins, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.
 *   `keepNames` MUST stay on:  the parser looks rules up by class name (`parser/build.test.ts`).
 */
const shared = appConfig()
export default defineConfig({
  ...shared,
  plugins: [...shared.plugins, sharedSolid()],
  base: "./",
  publicDir: false,
  build: {
    chunkSizeWarningLimit: 2000,
    outDir: "dist-element",
    // `vite.solid.config.ts` emptied it
    emptyOutDir: false,
    sourcemap: true,
    rolldownOptions: {
      input: {
        "spell-code": "../src/app/components/spell-code/index.ts",
        "spell-markdown": "../src/app/components/spell-markdown/index.ts",
        "spell-language": "../src/app/spellLanguage.ts"
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "spell-code-[name].js",
        keepNames: true,
        codeSplitting: {
          groups: [
            { name: "SpellLanguage", test: /\/components\/spell-code\/SpellLanguage\.ts$/ },
            // Vite's preload helper, which every entry's `import()` calls:  alone, NOT in `SpellLanguage`'s chunk,
            // which would make `spell-language.js` import the page's core up front, on a page with no Spell UI
            { name: "preload", test: /preload-helper/, priority: 10 }
          ]
        }
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})
