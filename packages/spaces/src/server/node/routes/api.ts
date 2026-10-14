/**
 * Router for all `/api/...` calls, and `spaceFiles`, the router for `/spaces/...`:  reading a file.
 * - Route table below just wires paths to `project-utils.ts` handlers -- see each `request_*` function
 *   there for its full contract (what client sends, what comes back, failure modes).
 * - A project or a file is named by its PLACE in a URL (`SP.SpellUrls`), e.g. `@spell/examples/solitaire`, with two
 *   slashes before a file:  `/spaces/@spell/examples/solitaire//Card.spell`.  Handlers split the URL as it arrived,
 *   at its first `//`, before any path on disk is made (decision J48).
 */

import chalk from "chalk"
import JSON5 from "json5"

import { SRV } from "$/server"
import * as projectUtils from "$/spaces/server/node/projects/project-utils"
import * as responseUtils from "$/spaces/server/node/projects/response-utils"
import { ProjectBuild } from "./ProjectBuild"

/** Router mounted at `/api` by `./cli.ts` and `./appRoutes.ts`:  `$/server`'s Express-shaped `SRV.Router`. */
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

// working with projects -- see `projectUtils.request_getProjectList` / `request_createProject` /
// `request_renameApp` / `request_duplicateApp` / `request_deleteApp` for each route's contract.
// A group's address (`@spell/examples`) holds `/`s:  `*` takes the rest of the path.
api.get("/projects/list/*", projectUtils.request_getProjectList)
api.post("/projects/create/project", projectUtils.request_createProject)
api.post("/projects/rename/project", projectUtils.request_renameApp)
api.post("/projects/duplicate/project", projectUtils.request_duplicateApp)
api.delete("/projects/remove/project", projectUtils.request_deleteApp)

// working with project files -- see `projectUtils.request_createFile` / `request_renameFile` /
// `request_deleteFile`.
api.post("/projects/create/file", projectUtils.request_createFile)
api.post("/projects/rename/file", projectUtils.request_renameFile)
api.delete("/projects/remove/file", projectUtils.request_deleteFile)

// a project's index, and saving one of its files -- see `projectUtils.request_getIndex` / `request_saveFile`.
// Reading a file is `/spaces/<project>//<file>`:  `spaceFiles`, below.
// `*` captures the REST of the URL, `/`s and the `//` included;  the handlers read it as it arrived.
api.get("/projects/index/*", projectUtils.request_getIndex)
api.post("/projects/file/*", projectUtils.request_saveFile)

// Compile random source file, not tied to a project -- see `projectUtils.request_compileFile`.
api.post("/compile/file", projectUtils.request_compileFile)
api.get("/compile/file", projectUtils.request_compileFile)

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
 * Router mounted at `/spaces` by `./cli.ts` and `./appRoutes.ts`:  a project's file, by its URL,
 * `/spaces/<project>//<file>` -- see `projectUtils.request_getFile`.
 * - Compiled files are files:  `/spaces/@spell/examples/solitaire//solitaire.spell.js` (its program),
 *   `.scopes.js` (its scope pack), `.declarations.json`, `.en.js`.  The handler finds a built one in `build/`.
 * - A file spell BUILDS (`<Project>.spell.js` ...), missing, is compiled first:  `projectBuild.builtFirst()`.
 */
export const spaceFiles = new SRV.Router()
spaceFiles.get("*", projectBuild.builtFirst(), projectUtils.request_getFile)
