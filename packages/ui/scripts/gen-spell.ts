/**
 * `yarn gen:spell`:  write `src/languages/spell.<lang>.ts` (+ `.bundle.js`), the PRE-COMPILED spell highlighter
 * `<ui-code language="spell">` loads.
 * - Run after changing spell's grammar or `packages/spell/src/highlight/`;  the files are committed, so `ui` builds and
 *   tests without building spell.
 * - Why a bundle:  `ui` NEVER imports spell's source (root `AGENTS.md`, "Overview");  this generated file is the
 *   one exception.  It holds the parser and spell's rules (`packages/spell/src/highlight/browser.ts`, the entry).
 * - One file per language;  only English exists today (`LANGUAGES`).
 * - Writes three files per language (the build and the two files beside it:  `browserBundles.ts`, shared with
 *   `gen-markdown.ts`):
 *   - `spell.<lang>.bundle.js`:  the bundle (`.bundle`:  TS would map `./spell.<lang>.js` to the wrapper itself)
 *   - `spell.<lang>.bundle.d.ts`:  its type, for `tsc`
 *   - `spell.<lang>.ts`:  the wrapper `SpellLanguage` imports.  Why:  it imports `SourceError` (built into
 *     `core.js`) and uses it, so the chunk depends on core and Rolldown keeps its runtime helpers there -- a chunk
 *     needing them on its own splits a `rolldown-runtime-<hash>.js` EVERY page loads (see
 *     `src/runtime/TemporalPolyfill.ts`)
 */
import path from "node:path"
import { fileURLToPath } from "node:url"

import { REACT_DOM_STUB, buildBundle, declarationFile, wrapperFile } from "./browserBundles.ts"

/** The yarn script, named in every file it writes. */
const COMMAND = "gen:spell"

/** Where the bundles go. */
const OUTPUT = fileURLToPath(new URL("../src/languages/", import.meta.url))

/** Languages to build, each `spell.<lang>.js`. */
const LANGUAGES = ["en"]

for (const language of LANGUAGES) {
  const bundle = `spell.${language}.bundle.js`
  await buildBundle({
    command: COMMAND,
    packageFolder: "spell",
    entry: "src/highlight/browser.ts",
    outfile: path.join(OUTPUT, bundle),
    plugins: [REACT_DOM_STUB]
  })
  declarationFile({
    command: COMMAND,
    file: path.join(OUTPUT, `spell.${language}.bundle.d.ts`),
    name: "highlighter",
    doc: `Spell's highlighter (${language}):  highlight.js-scoped spans of a spell snippet.`,
    type: "{ highlight(code: string): { start: number; end: number; kind: string }[] }"
  })
  wrapperFile({
    command: COMMAND,
    file: path.join(OUTPUT, `spell.${language}.ts`),
    name: "highlighter",
    bundle,
    method: "highlight"
  })
}
