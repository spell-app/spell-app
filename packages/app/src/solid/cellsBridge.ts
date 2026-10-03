/**
 * Spell cells -> Solid:  every Solid computation (JSX expression, memo, effect compute) re-runs when a spell cell it
 * read changes -- spell Things, the editor, `SP.*`.  Import for its SIDE EFFECT, before rendering anything that reads
 * spell state.
 * - HERE, in the host, not in `$/util` / `$/core`:  they never import Solid, so `spell-runtime.js` holds none
 *   (`element.build.test.ts`).  Each host imports this:  the editor app, the VS Code runner, `<spell-app>`,
 *   `<spell-editor>` -- and `tracked()`.
 * - ONCE per Solid, however many hosts on a page:  `bridgeSolid()` remembers it in the page's shared cells context,
 *   which every `spell-runtime.js` copy shares too -- so one bridge sees every runtime's Things.
 * - SIDE EFFECT:  `spellCore.flush()` / `flushCells()` now also flush this Solid.
 */

import { enableExternalSource, flush } from "solid-js"

import { bridgeSolid } from "$/util"

bridgeSolid({ enableExternalSource, flush })
