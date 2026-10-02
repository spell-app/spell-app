import { defineConfig } from "vite"

import { appConfig } from "./vite.shared.ts"

/**
 * Build the `<spell-editor>` web component into `dist-element/`, beside `<spell-app>` -- `yarn build:element` builds
 * both, `<spell-app>`'s first, as it empties the folder.
 * - `spell-editor.js`:  the element and the parser, for pages to load -- see `src/spellEditor/element.ts`.
 *   Monaco is a chunk of its own, `spell-editor-monaco.js`, loaded once there's a project to show.
 * - Its own build, NOT an entry of `vite.element.config.ts`, so Monaco's CSS stays out of `spell-app.css`:  every
 *   `<spell-app>` adopts that.  So they share nothing -- the editor has its own React.
 * - One `spell-editor.css` -- Monaco's and ours -- which the element puts in its shadow root.  See `shadowStyles.ts`.
 * - Monaco's worker is `spell-editor-editor.worker.js`.
 * - Fixed names, no hashes, as `<spell-app>`'s:  the element finds its styles beside itself.
 * - Plugins, aliases, dedupe and CSS:  `appConfig()`, as `vite.config.ts`.  `keepNames` MUST stay on:  a rule's
 *   class name is its name -- see `parser/build.test.ts`.
 */
export default defineConfig({
  ...appConfig(),
  // `vite.element.config.ts` copied `static/` in already
  publicDir: false,
  // relative:  Monaco's worker is found beside the bundle, wherever that's served from -- NOT `/` of the page
  base: "./",
  build: {
    chunkSizeWarningLimit: 6000,
    outDir: "dist-element",
    emptyOutDir: false,
    sourcemap: true,
    cssCodeSplit: false,
    rolldownOptions: {
      input: {
        "spell-editor": "src/spellEditor/element.ts"
      },
      output: {
        entryFileNames: "[name].js",
        chunkFileNames: "spell-editor-[name].js",
        assetFileNames: (asset) =>
          asset.names?.some((name) => name.endsWith(".css")) ? "spell-editor.css" : "[name][extname]",
        keepNames: true
      }
    }
  },
  worker: {
    format: "es",
    rolldownOptions: {
      output: {
        entryFileNames: "spell-editor-[name].js",
        keepNames: true
      }
    }
  },
  define: {
    global: {},
    "process.env": {}
  }
})
