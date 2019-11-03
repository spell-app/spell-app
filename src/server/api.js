//////////////////////////////
//  Create a router for all api calls.
//////////////////////////////

import express from "express"
import chalk from "chalk"
import JSON5 from "json5"
import nodePath from "path"

// Express utility functions
import * as fileUtils from "./file-utils.js"
import * as responseUtils from "./response-utils.js"

// Create the router.
const router = express.Router()
export default router

function stringify(object, indent) {
  const result = JSON5.stringify(object, null, "  ")
  return result.split("\n").join("\n" + indent.substr(2))
}

// Log every api request
router.use((request, response, next) => {
  const info = responseUtils.getRequestDetails(request)

  console.warn("\n\n==========================================================")
  console.warn(` ${info.method}: ${info.url}`)
  console.warn("----------------------------------------------------------")

  if (info.query) console.warn(chalk.grey(` query: ${stringify(info.query, "      ")}`))

  if (info.params) console.warn(chalk.grey(` params: ${stringify(info.params, "       ")}`))

  if (info.body) console.warn(chalk.grey(` body: ${stringify(info.body, "     ")}`))

  next()
})

//////////////////////////////
//  Smoke test that router is working!
//////////////////////////////

router.get("/test", (request, response) => {
  return responseUtils.sendText(response, "YO!")
})

//////////////////////////////
//  Examples support
//////////////////////////////
const projectsDir = nodePath.join(__dirname, "..", "projects")
function getProjectPath(...suffix) {
  return nodePath.join(projectsDir, ...suffix)
}

// List all project folders.
router.get("/projects", (request, response) => {
  const options = { includeDirs: true, includeFiles: false, namesOnly: true }
  const dirs = fileUtils.listContents(getProjectPath(), options)
  responseUtils.sendJSON(response, dirs)
})

// Return index for a project: all "unhidden" files in the project folder.
router.get("/projects/:folder/index", (request, response) => {
  const folder = request.params.folder
  const options = { ignoreHidden: true, namesOnly: true }
  const files = fileUtils.listContents(getProjectPath(folder), options)
  const index = {
    modules: files.map(fileName => ({ id: fileName }))
  }
  responseUtils.sendJSON(response, index)
})

// Return a specific project file, including the index.
router.get("/projects/:folder/:file", (request, response) => {
  const folder = request.params.folder
  const file = request.params.file
  const path = getProjectPath(folder, file)
  responseUtils.sendTextFile(response, path)
})

// Save a specific project file, including the index.
router.post("/projects/:folder/:file", async (request, response) => {
  const folder = request.params.folder
  const file = request.params.file
  const path = getProjectPath(folder, file)

  const contents = request.body
  try {
    await fileUtils.saveFile(path, contents)
    responseUtils.sendText(response, "OK")
  } catch (e) {
    return responseUtils.sendError(response, 500, e)
  }
})

// Delete a specific project file, including the index.
// NOTE: delete swallows the error if the file can't be found.
router.delete("/projects/:folder/:file", async (request, response) => {
  const folder = request.params.folder
  const file = request.params.file
  const path = getProjectPath(folder, file)

  const contents = request.body
  try {
    await fileUtils.removeFile(path, true)
    responseUtils.sendText(response, "OK")
  } catch (e) {
    return responseUtils.sendError(response, 500, e)
  }
})

//////////////////////////////
// Log an error to the console for an unknown API path.
// NOTE: this MUST be after the require()s above.
//////////////////////////////
function _apiCallNotFound(request, response) {
  const error = new URIError(`API routine not defined on server:   '${request.url}'`)
  return responseUtils.sendError(response, 500, error)
}
router.get("*", _apiCallNotFound)
router.post("*", _apiCallNotFound)
