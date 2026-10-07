/**
 * Router for all `/api/...` calls.
 * - Route table below just wires paths to `project-utils.ts` handlers -- see each `request_*` function
 *   there for its full contract (what client sends, what comes back, failure modes).
 */

import chalk from "chalk"
import JSON5 from "json5"

import { SRV } from "$/server"
import * as responseUtils from "$/spell/node/response-utils"
import * as projectUtils from "$/spell/node/project-utils"

/** Router mounted at `/api` by `server/index.ts`:  `$/server`'s Express-shaped `SRV.Router`. */
export const api = new SRV.Router()

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
api.get("/projects/list/:domainId", projectUtils.request_getProjectList)
api.post("/projects/create/project", projectUtils.request_createProject)
api.post("/projects/rename/project", projectUtils.request_renameApp)
api.post("/projects/duplicate/project", projectUtils.request_duplicateApp)
api.delete("/projects/remove/project", projectUtils.request_deleteApp)

// working with project files -- see `projectUtils.request_createFile` / `request_renameFile` /
// `request_deleteFile`.
api.post("/projects/create/file", projectUtils.request_createFile)
api.post("/projects/rename/file", projectUtils.request_renameFile)
api.delete("/projects/remove/file", projectUtils.request_deleteFile)

// returning project files -- see `projectUtils.request_getIndex` / `request_getFile` / `request_saveFile`.
// NOTE: `:filePath*` captures the REST of the URL including `/`s, so nested folder paths reach the handler as one
// string (`SRV.Router`;  Express 4 kept only the first segment);  see `SpellLocation`/`fileUtils` for how that gets
// validated and turned back into a real path.
api.get("/projects/index/:projectId", projectUtils.request_getIndex)
api.get("/projects/file/:projectId/:filePath*", projectUtils.request_getFile)
api.post("/projects/file/:projectId/:filePath*", projectUtils.request_saveFile)
// a project's compiled JS, as another project's compiled output `import`s it -- see `SP.SPELL_PROJECT_MODULE`
api.get("/projects/compiled/:projectId", projectUtils.request_getCompiled)
// a project's scope pack, what its Type Explorer shows -- see `LSP.ScopePack`
api.get("/projects/scopes/:projectId", projectUtils.request_getScopes)
// a project's declarations, where its Type Explorer finds each one's code -- see `SP.SpellDeclarations`
api.get("/projects/declarations/:projectId", projectUtils.request_getDeclarations)

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
