/**
 * `$/spaces` (`SPACES`):  where projects and people live -- the barrel, safe in a browser.
 * - Its models (`./models`), flattened in.
 * - NOTE: node-only code is left out, imported by path:  `$/spaces/server/node/...` (the editor's server, and later
 *   projects on disk).  Python's web server, `src/server/py/`, is a uv project, not TypeScript.
 */
export * from "./models"

export * as SPACES from "."
