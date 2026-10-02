//
//  ## Solid parts of the editor, for its React pages:  `<UI.InputRoot />`, `<Notice />` ...
//
//  The panes moved to Solid in P6 (`$/app/solid`);  the pages, the shell and the menus stay React until P8.  Each
//  export here is a React component that mounts the Solid one (`solidIsland()`), under the name the React one had,
//  so the pages didn't change.  P8 moves the pages to Solid, and this file goes.
//  NOTE: no JSX (React's and Solid's in one file), so `.ts`.
//

import * as Solid from "$/app/solid"

/** The source editor pane, with its toolbar:  `editor.file` in Monaco. */
export const InputRoot = Solid.solidIsland(Solid.InputRoot)

/** The program's console, with its toolbar. */
export const ConsoleRoot = Solid.solidIsland(Solid.ConsoleRoot)

/** The parsed `Match` of `editor.file`, with its toolbar. */
export const MatchRoot = Solid.solidIsland(Solid.MatchRoot)

/** The AST of `editor.file`, with its toolbar. */
export const ASTRoot = Solid.solidIsland(Solid.ASTRoot)

/** `editor.notice`, floating near the top of the page. */
export const Notice = Solid.solidIsland(Solid.Notice)

/** `editor.error`, floating near the top of the page. */
export const ErrorNotice = Solid.solidIsland(Solid.ErrorNotice)
