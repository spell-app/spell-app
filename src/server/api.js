//----------------------------
//  Create a router for all api calls.
//----------------------------

import express from "express"
import chalk from "chalk"
import JSON5 from "json5"

import { spellSetup } from "../languages/spell/projectSetup"
import { ProjectRoot } from "./ProjectRoot"
import * as responseUtils from "./response-utils" // Express utility functions

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
//  Tests to make sure api is working
//----------------------------

/** Smoke test that api is available.  */
api.get("/test", (request, response) => {
  return responseUtils.sendJSON(response, "YO!")
})

/** Return a 404 (resource-not-found) error to test client logic. */
api.get("/missing", (request, response) => {
  return response.status(404).send("Nothing to see here")
})

/** Return a 403 (unauthorized) error to test client logic. */
api.get("/not-authorized", (request, response) => {
  return response.status(403).send("No can do")
})

/**  Return a 500 error to test client logic. */
api.get("/error", (request, response) => {
  return response.status(500).send("No soup for you!")
})

//----------------------------
//  User projects manipulation
//----------------------------

/** Path specification for working with user projects. */
const projects = new ProjectRoot(spellSetup.projectRoots.projects)
const library = new ProjectRoot(spellSetup.projectRoots.library)
const examples = new ProjectRoot(spellSetup.projectRoots.examples)
const guides = new ProjectRoot(spellSetup.projectRoots.guides)

// working with projects
api.get("/projects/list", projects.request_getProjectList)
api.post("/projects/create/project", projects.request_createProject)
api.post("/projects/rename/project", projects.request_renameProject)
api.post("/projects/duplicate/project", projects.request_duplicateProject)
api.delete("/projects/remove/project", projects.request_removeProject)

// working with project files
api.post("/projects/create/file", projects.request_createFile)
api.post("/projects/rename/file", projects.request_renameFile)
api.delete("/projects/remove/file", projects.request_removeFile)

// returning project files
api.get("/projects/manifest/:projectId", projects.request_getManifest)
api.get("/projects/index/:projectId", projects.request_getIndex)
api.get("/projects/file/:projectId/:filePath*", projects.request_getFile)
api.post("/projects/file/:projectId/:filePath*", projects.request_saveFile)

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
