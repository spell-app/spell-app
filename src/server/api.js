//----------------------------
//  Create a router for all api calls.
//----------------------------

import express from "express"
import chalk from "chalk"
import JSON5 from "json5"

import * as responseUtils from "./response-utils"
import * as projectUtils from "./project-utils"

// Create the api api.
export const api = express.Router()

function stringify(object, indent) {
  const result = JSON5.stringify(object, null, "  ")
  return result.split("\n").join(`\n${indent.substr(2)}`)
}

// Log every api request
api.use((request, response, next) => {
  const info = responseUtils.getRequestDetails(request)

  console.warn("\n\n==========================================================")
  console.warn(` ${info.method}: ${info.url}`)
  console.warn("----------------------------------------------------------")

  if (info.query) console.warn(chalk.grey(` query: ${stringify(info.query, "      ")}`))
  if (info.params) console.warn(chalk.grey(` params: ${stringify(info.params, "       ")}`))
  if (info.body) console.warn(chalk.grey(` body: ${stringify(info.body, "     ")}`))

  next()
})

//----------------------------
//  Project manipulation
//----------------------------

// working with projects
api.get("/projects/list/:domainId", projectUtils.request_getProjectList)
api.post("/projects/create/project", projectUtils.request_createProject)
api.post("/projects/rename/project", projectUtils.request_renameProject)
api.post("/projects/duplicate/project", projectUtils.request_duplicateProject)
api.delete("/projects/remove/project", projectUtils.request_removeProject)

// working with project files
api.post("/projects/create/file", projectUtils.request_createFile)
api.post("/projects/rename/file", projectUtils.request_renameFile)
api.delete("/projects/remove/file", projectUtils.request_removeFile)

// returning project files
api.get("/projects/manifest/:projectId", projectUtils.request_getManifest)
api.get("/projects/index/:projectId", projectUtils.request_getIndex)
api.get("/projects/file/:projectId/:filePath*", projectUtils.request_getFile)
api.post("/projects/file/:projectId/:filePath*", projectUtils.request_saveFile)

//----------------------------
//  Tests to make sure api is working
//----------------------------

/** Smoke test that api is available.  */
api.get("/test", (request, response) => responseUtils.sendJSON(response, "YO!"))

/** Return a 404 (resource-not-found) error to test client logic. */
api.get("/missing", (request, response) => response.status(404).send("Nothing to see here"))

/** Return a 403 (unauthorized) error to test client logic. */
api.get("/not-authorized", (request, response) => response.status(403).send("No can do"))

/**  Return a 500 error to test client logic. */
api.get("/error", (request, response) => response.status(500).send("No soup for you!"))

//----------------------------
//  Error handling
//
//  Log an error to the console for an unknown API path.
//  NOTE: THIS MUST BE AT THE END OF THE FILE!
//----------------------------
function _apiCallNotFound(request, response) {
  const error = new URIError(`API routine not defined on server:   '${request.url}'`)
  return responseUtils.sendError(response, 500, error)
}
api.get("*", _apiCallNotFound)
api.post("*", _apiCallNotFound)
