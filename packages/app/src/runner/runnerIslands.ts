//
//  ## Solid parts of the runners, for their React components:  `<TypeExplorer>`, `<ThingExplorer>`, `<ConsoleLines>`
//
//  The explorers and the console's lines moved to Solid in P6 (`$/app/solid`);  the runners stay React until P7.
//  Each export here is a React component that mounts the Solid one (`solidIsland()`), under its old name.
//  - Imports each file DIRECTLY, NOT the `$/app/solid` barrel, which pulls in the editor:  every runner bundle
//    (`<spell-app>`, VS Code's webview) would get it.  `loadUI` too, for the `<ui-*>` the explorers draw.
//  - NOTE: no JSX (React's and Solid's in one file), so `.ts`.
//

import { solidIsland } from "$/app/solid/solidIsland"
import { TypeExplorer as SolidTypeExplorer } from "$/app/solid/TypeExplorer"
import { ThingExplorer as SolidThingExplorer } from "$/app/solid/ThingExplorer"
import { ConsoleLines as SolidConsoleLines } from "$/app/solid/ConsoleLines"

import "$/app/solid/loadUI"

/** A program's scopes:  its types and their members, from scope packs. */
export const TypeExplorer = solidIsland(SolidTypeExplorer)

/** A running program's things, live. */
export const ThingExplorer = solidIsland(SolidThingExplorer)

/**
 * A console's lines.
 * - Pass a NEW array when a line is logged (`[...console.lines]`):  the console grows its array in place, and Solid
 *   skips a prop that's the same array as before.
 */
export const ConsoleLines = solidIsland(SolidConsoleLines)
