//----------------------------
//  Create a router for all api calls.
//----------------------------

import express from "express"
import chalk from "chalk"
import JSON5 from "json5"
import nodePath from "path"
import fse from "fs-extra"

// Express utility functions
import * as fileUtils from "./file-utils"
import * as responseUtils from "./response-utils"

// Create the router.
const router = express.Router()
export default router

function stringify(object, indent) {
  const result = JSON5.stringify(object, null, "  ")
  return result.split("\n").join(`\n${indent.substr(2)}`)
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

//----------------------------
//  Path utilities
//----------------------------
const projectsDir = nodePath.join(__dirname, "..", "projects")
function getProjectPath(...suffix) {
  // remove leading `/project/`
  const path = nodePath.join(...suffix).replace(/^\/project\//, "")
  return nodePath.join(projectsDir, path)
}

//----------------------------
//  Tests to make sure router is working
//----------------------------

/** Smoke test that router is available.  */
router.get("/test", (request, response) => {
  return responseUtils.sendJSON(response, "YO!")
})

/** Return a 404 (resource-not-found) error to test client logic. */
router.get("/missing", (request, response) => {
  return response.status(404).send("Nothing to see here")
})

/** Return a 403 (unauthorized) error to test client logic. */
router.get("/not-authorized", (request, response) => {
  return response.status(403).send("No can do")
})

/**  Return a 500 error to test client logic. */
router.get("/error", (request, response) => {
  return response.status(500).send("No soup for you!")
})

//----------------------------
//  Project manipulation
//----------------------------

/** List all project folders available to this user. */
router.get("/projects", (request, response) => {
  const options = { includeDirs: true, includeFiles: false, namesOnly: true }
  const dirs = fileUtils.listContents(getProjectPath(), options)
  responseUtils.sendJSON(response, dirs)
})

/** Return manifest for a project: all "unhidden" files in the project folder.  */
router.get("/project/:projectId/.manifest", (request, response) => {
  const { projectId } = request.params
  const options = { ignoreHidden: true, namesOnly: true }
  const files = fileUtils.listContents(getProjectPath(projectId), options)
  const index = {
    files: files.map(name => ({ name, path: `/project/${projectId}/${name}` }))
  }
  responseUtils.sendJSON(response, index)
})

/** Return index for a project, creating one if necessary.  */
router.get("/project/:projectId/.index", async (request, response) => {
  const { projectId } = request.params
  const path = getProjectPath(projectId, ".index.json5")
  const exists = await fileUtils.pathExists(path)
  console.warn(exists)
  if (exists) return responseUtils.sendJSONFile(response, path)

  const options = { ignoreHidden: true, namesOnly: true }
  const files = fileUtils.listContents(getProjectPath(projectId), options)
  const index = {
    imports: files.map(name => ({ path: `/project/${projectId}/${name}`, active: true }))
  }
  return responseUtils.sendJSON(response, index)
})

// Create a new project.
router.post("/projects/create", async (request, response) => {
  const { path, startFileName = "Untitled.spell", startFileContents = "" } = request.body
  const startFilePath = getProjectPath(path, startFileName)
  try {
    await fileUtils.saveFile(startFilePath, startFileContents)
    responseUtils.sendJSON(response, "OK")
  } catch (e) {
    responseUtils.sendError(response, 500, e)
  }
})

// Duplicate a project.
router.post("/projects/duplicate", async (request, response) => {
  const { path, newPath } = request.body
  try {
    await fse.copy(getProjectPath(path), getProjectPath(newPath))
    responseUtils.sendJSON(response, "OK")
  } catch (e) {
    responseUtils.sendError(response, 500, e)
  }
})

// Delete a project.
router.delete("/projects/delete", async (request, response) => {
  const { path } = request.body
  try {
    await fse.remove(getProjectPath(path))
    responseUtils.sendJSON(response, "OK")
  } catch (e) {
    responseUtils.sendError(response, 500, e)
  }
})

//----------------------------
//  Project file manipulation
//----------------------------

// Return a specific project file, including the index.
router.get("/project/:projectId/:filename", (request, response) => {
  const { projectId, filename } = request.params
  const path = getProjectPath(projectId, filename)
  responseUtils.sendJSONFile(response, path)
})

// Save a specific project file, including the index.
router.post("/project/:projectId/:filename", async (request, response) => {
  const { projectId, filename } = request.params
  const path = getProjectPath(projectId, filename)

  const contents = request.body
  try {
    await fileUtils.saveFile(path, contents)
    responseUtils.sendJSON(response, "OK")
  } catch (e) {
    responseUtils.sendError(response, 500, e)
  }
})

/** Create a new project file. */
router.post("/projects/create/file", async (request, response) => {
  const { path, contents } = request.body
  try {
    await fileUtils.saveFile(getProjectPath(path), contents)
    responseUtils.sendJSON(response, "OK")
  } catch (e) {
    responseUtils.sendError(response, 500, e)
  }
})

/** Delete specified file.  NOTE: we do not report an error if the path is not found. */
router.delete("/projects/delete/file", async (request, response) => {
  const { path } = request.body
  try {
    await fse.remove(getProjectPath(path))
    responseUtils.sendJSON(response, "OK")
  } catch (e) {
    responseUtils.sendError(response, 500, e)
  }
})

// DEPRECATED
// Delete a specific project file, including the index.
// NOTE: delete swallows the error if the file can't be found.
router.delete("/project/:projectId/:filename", async (request, response) => {
  const { projectId, filename } = request.params
  const path = getProjectPath(projectId, filename)

  try {
    await fse.remove(path, true)
    responseUtils.sendJSON(response, "OK")
  } catch (e) {
    responseUtils.sendError(response, 500, e)
  }
})

//----------------------------
// Log an error to the console for an unknown API path.
// NOTE: this MUST be after the require()s above.
//----------------------------
function _apiCallNotFound(request, response) {
  const error = new URIError(`API routine not defined on server:   '${request.url}'`)
  return responseUtils.sendError(response, 500, error)
}
router.get("*", _apiCallNotFound)
router.post("*", _apiCallNotFound)
