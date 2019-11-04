/* eslint-disable no-use-before-define */
//----------------------------
//
//  Express API utility functions to `send` various responses conveniently/consistently.
//
//  This is mostly generic express/node stuff.
//  See `APP SPECIFIC` below for app-specific stuff.
//
//----------------------------
import chalk from "chalk"

// File manipulation utilities and path config
import * as fileUtils from "./file-utils"

//----------------------------
//  Id utilities
//----------------------------

// If `id` passed in is a string which converts EXACTLY to a number, return the number.
// Otherwise return the string.
// Useful for dealing with provisional ids.
export function convertNumericId(id) {
  if (id == null) return undefined

  if (typeof id === "number") return id
  if (typeof id === "string") {
    const number = parseInt(id, 10)
    if (`${number}` === id) return number
    return id
  }
  throw new TypeError(`convertNumericId(): don't know how to process id: ${id}`)
}

// Given an express `request`, return an array of id properties.
// Uses `convertNumericId` to convert to numbers as appropriate.
export function getIdParams(request, ...idProperties) {
  return idProperties.map(property => convertNumericId(request.params[property]))
}

//----------------------------
//  Text responses
//----------------------------

// Return `text` as `response` to `request`.
export function sendText(response, text) {
  response.set("Content-Type", "text/plain")
  return response.send(text)
}

// Return `javascript` as `response` to `request`.
export function sendJavascript(response, javascript) {
  response.set("Content-Type", "application/javascript")
  return response.send(javascript)
}

// Return text file at `path` (as text/plain) as `response` to `request`.
export async function sendTextFile(response, path, defaultValue) {
  response.set("Content-Type", "text/plain")

  if (await fileUtils.pathExists(path)) return response.sendFile(path)

  if (defaultValue !== undefined) return response.send(defaultValue)

  return sendError(response, 404, new Error(`File not found: '${path}'`))
}

// Return js file at `path` (as text/plain) as `response` to `request`.
export async function sendJSFile(response, path) {
  response.set("Content-Type", "application/javascript")

  if (await fileUtils.pathExists(path)) return response.sendFile(path)

  return sendError(response, 404, new Error(`File not found: '${path}'`))
}

//----------------------------
//  JSON responses
//----------------------------

// Return `json` as string or object to stringify as `response` to `request`.
export function sendJSON(response, json) {
  response.set("Content-Type", "application/json")
  if (typeof json !== "string") json = JSON.stringify(json)
  return response.send(json)
}

// Return contents of a single file at `path` as as JSON `response` to `request`.
export function sendJSONFile(response, path) {
  response.set("Content-Type", "application/json")

  console.warn("Sending JSON file:\n  ", path)
  return response.sendFile(path)
}

// Return contents of multiple files at `paths` as as JSON `response` to `request`.
// File results will be wrapped in an array.
// If `optional` is `true`, we'll just write `null` for any file that can't be found.
// Otherwise we'll return an error result if ANY file can't be found.
export function sendJSONFiles(response, paths, optional = false) {
  return fileUtils.loadFiles(paths, "utf8", optional).then(jsonBlocks => {
    // Log what we're sending
    console.warn("Sending JSON files:")
    jsonBlocks.forEach((json, index) => {
      // Log missing / empty files in lighter color
      if (json === null) console.warn(chalk.grey(`  ${paths[index]}`))
      else console.warn(`  ${paths[index]}`)
    })

    // remove any null blocks
    jsonBlocks = jsonBlocks.filter(block => block != null)

    // group them all in an array
    return sendJSON(response, `[\n\n${jsonBlocks.join(",\n\n")}\n\n]`)
  })
}

// Return a map of `{ <path.filename> => <path contents> }` for a mess of JSON files.
// NOTE: the returned map really only works if all `paths` are in the same folder
//     or otherwise have unique leaf file names.
export function sendJSONFileMap(response, paths, optional = false) {
  return fileUtils.loadFiles(paths, "utf8", optional).then(jsonBlocks => {
    const fileMap = {}

    // Log what we're sending
    console.warn("Sending JSON map with:")
    jsonBlocks.forEach((json, index) => {
      const path = paths[index]
      const fileName = fileUtils.filename(path)
      const message = `  ${fileName}: ${path}`

      // Log missing / empty files in lighter color
      if (json === null) {
        console.warn(chalk.grey(message))
      } else {
        // Got a live one
        console.warn(message)
        fileMap[fileName] = json
      }
    })

    // group them all in an array
    return sendJSON(response, fileMap)
  })
}

// Send a simple JSON "ok" response.
// Pass `extraData` as JSON object to merge into response.
export function sendOK(response, extraData) {
  const result = {
    status: "OK",
    ...extraData
  }
  return sendJSON(response, result)
}

//----------------------------
//  Error responses
//----------------------------

// Return an error response.
export function sendError(response, statusCode, error, errorMessage = error && error.message) {
  if (!statusCode || !error) throw new TypeError("sendError() requires both statusCode and error params")

  fileUtils.logError(error, errorMessage)

  return response.status(statusCode).send({
    errors: [
      {
        message: errorMessage,
        trace: error && error instanceof Error && error.stack
      }
    ]
  })
}

//----------------------------
//  Request utilities
//----------------------------

// Return a POJO with relevant details from the request:
//  - url       Url called
//  - method    "GET", "POST", etc
//  - params    (optional) Named request params from the router
//  - query     (optional) Query params from URL string
//  - body      (optional) Body
export function getRequestDetails(request) {
  const result = {
    url: request.originalUrl,
    method: request.method
  }
  // Add URL query params if there are any
  const { query, params, body } = request
  if (Object.keys(query).length) result.query = { ...query }

  // Add URL params from router if there are any
  if (Object.keys(params).length) result.params = { ...params }

  // Add request body if provided
  if (body) {
    if (typeof body === "string") result.body = body
    else if (Object.keys(body).length) result.body = { ...body }
  }
  return result
}
