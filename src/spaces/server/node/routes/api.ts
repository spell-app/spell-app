/**
 * Router for all `/api/...` calls, and `spaceFiles`, the router for `/spaces/...`:  reading a file.
 * - The route table below just wires paths to `project-utils.ts` handlers.
 *   Each `request_*` function there has its full contract:  what the client sends, what comes back, failure modes.
 * - A project or a file is named by its ADDRESS in a URL (`SP.SpellUrls`):
 *   - a project:  `@spell/examples/drawable-solitaire`
 *   - a file in it:  `/spaces/@spell/examples/drawable-solitaire/Card.spell`
 * - Handlers split the URL as it arrived, by its group and project, before any path on disk is made
 *   (`SP.SpellUrls.split()`).
 */

import chalk from "chalk"
import JSON5 from "json5"

import { SRV } from "spell-kit/server"
import * as peopleRoutes from "spell-app/spaces/server/node/people/peopleRoutes"
import * as projectUtils from "spell-app/spaces/server/node/projects/project-utils"
import * as responseUtils from "spell-app/spaces/server/node/projects/response-utils"
import { ProjectBuild } from "./ProjectBuild"

/** Router mounted at `/api` by `./cli.ts` and `./appRoutes.ts`:  `spell-kit/server`'s Express-shaped `SRV.Router`. */
export const api = new SRV.Router()

/**
 * Compiles a project when a request needs a file it builds, and it isn't there -- see `ProjectBuild`.
 * - The page server's route module (`appRoutes.ts`) also starts it compiling the built-in projects as it starts.
 */
export const projectBuild = new ProjectBuild()

/** Stringify `object` as indented `JSON5`, re-indenting continuation lines to line up under `indent`. */
function stringify(object: any, indent: string) {
  const result = JSON5.stringify(object, null, "  ")
  return result.split("\n").join(`\n${indent.substring(2)}`)
}

// Log every api request -- dev-time visibility only, not auth/audit logging.
api.use((request, _response, next) => {
  const info = responseUtils.getRequestDetails(request)

  console.warn("\n\n==========================================================")
  console.warn(` ${info.method}: ${info.url}`)
  console.warn("----------------------------------------------------------")

  if (info.query) console.warn(chalk.grey(` query: ${stringify(info.query, "      ")}`))
  if (info.params) console.warn(chalk.grey(` params: ${stringify(info.params, "       ")}`))
  if (info.body) console.warn(chalk.grey(` body: ${stringify(info.body, "     ")}`))

  next()
})

////////////////
// ## Project manipulation
////////////////

// working with projects:  each route's contract is on its `projectUtils.request_*` handler
// A group's address (`@spell/examples`) holds `/`s:  `*` takes the rest of the path.
api.get("/projects/list/*", projectUtils.request_getProjectList)
api.post("/projects/create/project", projectUtils.request_createProject)
api.post("/projects/rename/project", projectUtils.request_renameApp)
api.post("/projects/duplicate/project", projectUtils.request_duplicateApp)
api.post("/projects/settings/project", projectUtils.request_saveProjectSettings)
api.delete("/projects/remove/project", projectUtils.request_deleteApp)

// working with project files:  each route's contract is on its `projectUtils.request_*` handler
api.post("/projects/create/file", projectUtils.request_createFile)
api.post("/projects/rename/file", projectUtils.request_renameFile)
api.delete("/projects/remove/file", projectUtils.request_deleteFile)

// a project's index, and saving one of its files:  see `projectUtils.request_getIndex` / `request_saveFile`
// - reading a file is `/spaces/<project>/<file>`:  `spaceFiles`, below
// - `*` captures the REST of the URL, `/`s included;  the handlers read it as it arrived
api.get("/projects/index/*", projectUtils.request_getIndex)
api.post("/projects/file/*", projectUtils.request_saveFile)

// Compile random source file, not tied to a project -- see `projectUtils.request_compileFile`.
api.post("/compile/file", projectUtils.request_compileFile)
api.get("/compile/file", projectUtils.request_compileFile)

////////////////
// ## People
////////////////

// this machine's person, and their orgs -- see `peopleRoutes.ts`.
api.get("/people/me", peopleRoutes.request_getMe)
api.post("/people/me", peopleRoutes.request_saveMe)

////////////////
// ## Tests to make sure api is working
////////////////

/** Smoke test that api is available.  */
api.get("/test", (request, response) => responseUtils.sendJSON(response, { message: "YO!" }))

/** Return a 404 (resource-not-found) error to test client logic. */
api.get("/missing", (request, response) => response.status(404).send("Nothing to see here."))

/** Return a 403 (unauthorized) error to test client logic. */
api.get("/not-authorized", (request, response) => response.status(403).send("No can do."))

/**  Return a 500 error to test client logic. */
api.get("/error", (request, response) => response.status(500).send("No soup for you!"))

////////////////
// ## Error handling
//
// Log an error to the console for an unknown API path.
// NOTE: THIS MUST BE AT THE END OF THE FILE!
////////////////
// every verb:  Express answered only GET / POST here, so an unknown DELETE got its default HTML 404
api.all("*", (request, response) => response.status(404).send(`API routine not defined on server:   '${request.url}'`))

/**
 * Router mounted at `/spaces` by `./cli.ts` and `./appRoutes.ts`:
 * a project's file, by its URL, `/spaces/<project>/<file>` -- see `projectUtils.request_getFile`.
 * - Compiled files are files, e.g. `/spaces/@spell/examples/drawable-solitaire/drawable-solitaire.spell.js` (its program):
 *   - `.scopes.js`, its scope pack
 *   - `.declarations.json5`, `.en.js`
 *   - The handler finds a built one in `build/`.
 * - A file spell BUILDS (`<Project>.spell.js` ...), missing, is compiled first:  `projectBuild.builtFirst()`.
 */
export const spaceFiles = new SRV.Router()
spaceFiles.get("*", projectBuild.builtFirst(), projectUtils.request_getFile)
