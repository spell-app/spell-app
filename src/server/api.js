//////////////////////////////
//  Create a router for all api calls.
//////////////////////////////

import JSON5 from "json5";
import express from "express";
import chalk from "chalk";
import nodePath from "path";

// Express utility functions
import * as fileUtils from "./file-utils.js";
import * as responseUtils from "./response-utils.js";

// Create the router.
const router = express.Router();
export default router;


function stringify(object, indent) {
  const result = JSON5.stringify(object, null, "  ");
  return result.split("\n").join("\n" + indent.substr(2));
}

// Log every api request
router.use((request, response, next) => {
  const info = responseUtils.getRequestDetails(request);

  console.warn("\n\n==========================================================");
  console.warn(` ${info.method}: ${info.url}`);
  console.warn("----------------------------------------------------------");

  if (info.query)
    console.warn(chalk.grey(` query: ${stringify(info.query, "      ")}`));

  if (info.params)
    console.warn(chalk.grey(` params: ${stringify(info.params, "       ")}`));

  if (info.body)
    console.warn(chalk.grey(` body: ${stringify(info.body, "     ")}`));

  next()
});


//////////////////////////////
//  Smoke test that router is working!
//////////////////////////////

router.get("/test", (request, response) => {
  return responseUtils.sendText(response, "YO!");
});



//////////////////////////////
//  Examples support
//////////////////////////////
const packagesDir = nodePath.join(__dirname, "..", "packages");
function getExamplePath(...suffix) {
  return nodePath.join(packagesDir, ...suffix);
}

// List all package folders.
router.get("/packages", (request, response) => {
  const options = { includeDirs: true, includeFiles: false, namesOnly: true };
  const dirs = fileUtils.listContents(getExamplePath(), options);
  responseUtils.sendJSON(response, dirs);
});

// Return the index for an package folder.
router.get("/packages/:folder", (request, response) => {
  const folder = request.params.folder;
  const path = getExamplePath(folder, "index.json5");
  responseUtils.sendJSONFile(response, path);
});

// Return a specific package file.
router.get("/packages/:folder/:file", (request, response) => {
  const folder = request.params.folder;
  const file = request.params.file;
  const path = getExamplePath(folder, file);
  responseUtils.sendTextFile(response, path);
});

// Save the index for an package folder.
router.post("/packages/:folder", async (request, response) => {
  const folder = request.params.folder;
  const path = getExamplePath(folder, "index.json5");

  const contents = request.body;
  try {
    await fileUtils.saveFile(path, contents);
    responseUtils.sendText("OK");
  }
  catch (e) {
    return responseUtils.sendError(response, 500, error);
  }
});

// Save a specific package file.
router.post("/packages/:folder/:file", async (request, response) => {
  const folder = request.params.folder;
  const file = request.params.file;
  const path = getExamplePath(folder, file);

  const contents = request.body;
  try {
    await fileUtils.saveFile(path, contents);
    responseUtils.sendText("OK");
  }
  catch (e) {
    return responseUtils.sendError(response, 500, error);
  }
});


//////////////////////////////
// Log an error to the console for an unknown API path.
// NOTE: this MUST be after the require()s above.
//////////////////////////////
function _apiCallNotFound(request, response) {
  const error = new URIError(`API routine not defined on server:   '${request.url}'`);
  return responseUtils.sendError(response, 500, error);
}
router.get("*", _apiCallNotFound);
router.post("*", _apiCallNotFound);
