/* eslint-disable no-use-before-define */
//----------------------------
//
//  Express API utility functions to `send` various responses conveniently/consistently.
//
//  This is mostly generic express/node stuff.
//  See `APP SPECIFIC` below for app-specific stuff.
//
//----------------------------
import type { Request, Response } from "express"
import type { SendFileOptions } from "express-serve-static-core"
// File manipulation utilities and path config
import * as fileUtils from "./file-utils"

//----------------------------
//  Id utilities
//----------------------------

// If `id` passed in is a string which converts EXACTLY to a number, return the number.
// Otherwise return the string.
// Useful for dealing with provisional ids.
export function convertNumericId(id: string): number | string | undefined {
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
export function getIdParams(request: Request, ...idProperties: string[]) {
  return idProperties.map((property) => convertNumericId(request.params[property]))
}

//----------------------------
//  Generic response wrappers
//----------------------------

/**
 * Wrap `await callback(request, response)` in standard API semantics:
 * - if `callback` returns result, return that to the browser as JSON.
 * - if `callback` throws, return a 500 server error with the result.
 */
export function respondWithJSON(callback: (request: Request, response: Response) => Promise<any>) {
  return async function (request: Request, response: Response) {
    try {
      const result = await callback(request, response)
      sendJSON(response, result || "OK")
    } catch (error) {
      sendError(response, 500, error as Error)
    }
  }
}

//----------------------------
//  Text responses
//----------------------------

// Return `text` as `response` to `request`.
export function sendText(response: Response, text: string) {
  response.set("Content-Type", "text/plain")
  return response.send(text)
}

// Return `javascript` as `response` to `request`.
export function sendJavascript(response: Response, javascript: string) {
  response.set("Content-Type", "application/javascript")
  return response.send(javascript)
}

type ExtendedSendFileOptions = SendFileOptions & {
  defaultValue?: any
}

/**
 * Return file at `path`as `response` to `request`.
 * Uses express `sendFile()` to do the magic, which should set mime type automatically.
 * Pass `options` as per: https://expressjs.com/en/api.html#res.sendFile
 * Sends a 404 if the file was not found, unless you set `options.defaultValue` string
 * in which case we'll return that instead of failing.
 */
export async function sendFile(
  response: Response,
  path: string,
  { defaultValue, ...options }: ExtendedSendFileOptions = {}
) {
  const fileExists = await fileUtils.pathExists(path)
  console.warn(path, fileExists, options)
  if (fileExists) return response.sendFile(path, options)
  if (defaultValue !== undefined) return response.send(defaultValue)
  return sendError(response, 404, new Error(`File not found: '${path}'`))
}

// Return text file at `path` (as text/plain) as `response` to `request`.
export async function sendTextFile(
  response: Response,
  path: string,
  { defaultValue, ...options }: ExtendedSendFileOptions = {}
) {
  response.set("Content-Type", "text/plain")
  if (await fileUtils.pathExists(path)) return response.sendFile(path, options)
  if (defaultValue !== undefined) return response.send(defaultValue)
  return sendError(response, 404, new Error(`File not found: '${path}'`))
}

// Return js file at `path` (as text/plain) as `response` to `request`.
export async function sendJSFile(response: Response, path: string, options: SendFileOptions = {}) {
  response.set("Content-Type", "application/javascript")
  if (await fileUtils.pathExists(path)) return response.sendFile(path, options)
  return sendError(response, 404, new Error(`File not found: '${path}'`))
}

//----------------------------
//  JSON responses
//----------------------------

// Return `json` as string or object to stringify as `response` to `request`.
export function sendJSON(response: Response, json: any) {
  response.set("Content-Type", "application/json")
  if (typeof json !== "string") json = JSON.stringify(json, null, "  ")
  return response.send(json)
}

// Return contents of a single file at `path` as as JSON `response` to `request`.
export function sendJSONFile(response: Response, path: string) {
  response.set("Content-Type", "application/json")
  console.warn("Sending JSON file:\n  ", path)
  return response.sendFile(path)
}

//----------------------------
//  Error responses
//----------------------------

export function isFileOrFolderNotFoundError(error: any): error is Error {
  return (error as any).code === "ENOENT"
}

// Return an error response.
export function sendError(
  response: Response,
  statusCode: number,
  error: Error,
  errorMessage: string = error && error.message
) {
  if (!statusCode || !error) throw new TypeError("sendError() requires both statusCode and error params")

  fileUtils.logError(error, errorMessage)

  return response.status(statusCode).send({
    errors: [
      {
        message: errorMessage,
        trace: error && error instanceof Error && error.stack,
      },
    ],
  })
}

//----------------------------
//  Request utilities
//----------------------------

// Return a POJO with relevant details from the request:
//  - url       URL called
//  - method    "GET", "POST", etc
//  - params    Clone of named request params from the router, if any provided.
//  - query     Clone of query params from URL string, if any provided.
//  - body      Body as string or CLONE OF body object, if any provided.
export function getRequestDetails(request: Request) {
  const { query, params, body } = request
  return {
    method: request.method,
    url: request.originalUrl,
    query: Object.keys(query).length ? { ...query } : undefined,
    params: Object.keys(params).length ? { ...params } : undefined,
    body: typeof body === "string" ? body : Object.keys(body).length ? { ...body } : undefined,
  }
}
