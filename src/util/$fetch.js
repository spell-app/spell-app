import queryString from "query-string"

import { parseJSON, parseJSON5 } from "./json"
import { abortableFetch, isAbortError } from "./abortableFetch"
import { KNOWN_FORMATS, BINARY_FORMATS } from "./constants"
import {
  ResponseError,
  OfflineError,
  MissingResourceError,
  AuthenticationError,
  ResponseParseError,
  AbortedRequestError
} from "./ResponseErrors"

/** Merge miltiple sets of `$fetch()` `params` and set up defaults. */
export function merge$fetchParms(...allParams) {
  const output = {}
  allParams.forEach(params => {
    if (!params) return
    Object.keys(params).forEach(key => {
      const value = params[key]
      if (typeof value === "object") {
        if (output[key]) Object.assign(output[key], value)
        else output[key] = { ...value }
      } else if (value !== undefined) {
        output[key] = value
      }
    })
  })
  return output
}

/**
 * Fetch some file and return the decoded results.
 * Server errors (404 etc) will be `reject()`ed.
 * Returned promise has a `cancel()` method (see `abortableFetch` for caveats).
 *
 * `$params` consists of the following (all optional except for `url`):
 * - `url`            URL to load.
 * - `query`          URL query params, as string or object which will be serialized.
 * - `contents`       Request body as string or object which will be `JSON.stringified()`
 * - `method`         HTTP method.  `POST` if `contents` provided, otherwise `GET`.
 * - `headers`        HTTP headers.
 * - `requestFormat`  Input format, used to set `Content-Type` header. See KNOWN_FORMATS.
 * - `format`         Output format, used to format output.  Defaults to `text`. See KNOWN_FORMATS.
 */
export function $fetch($params) {
  const {
    url,
    query,
    contents,
    method = contents ? "POST" : "GET",
    headers = {},
    requestFormat,
    format = "text",
    defaultContents
  } = $params

  const fetchParams = { method, headers }
  // Set Content-Type header if necessary
  if (requestFormat) fetchParams.headers["Content-Type"] = requestFormat

  // Set up body if provided
  if (contents != null) {
    fetchParams.body = typeof contents === "string" ? contents : JSON.stringify(contents)
  }

  const fullUrl = query ? `${url}?${queryString.stringify(query)}` : url
  const request = abortableFetch(fullUrl, fetchParams)

  async function success(response) {
    if (!response.ok) {
      const message = await response.text()
      switch (response.status) {
        // If we got a `resource-not-found` error and we have `defaultContents`
        // return that as a successful response.
        case 404:
          if (defaultContents !== undefined) return defaultContents
          throw new MissingResourceError({ url, response, message, ...fetchParams })

        case 401:
        case 403:
          throw new AuthenticationError({ url, response, message, ...fetchParams })

        default:
          throw new ResponseError({ url, response, message, ...fetchParams })
      }
    }

    // Attempt to process the response according to our format
    try {
      if (BINARY_FORMATS.includes(format)) return await response.blob()
      // Pull text out to process json/json5 separately below.
      const text = await response.text()
      if (format === KNOWN_FORMATS.json || format.toUpperCase() === "JSON") return parseJSON(text)
      if (format === KNOWN_FORMATS.json5 || format.toUpperCase() === "JSON5") return parseJSON5(text)
      return text
    } catch (e) {
      throw new ResponseParseError({ url, response, e, ...fetchParams })
    }
  }

  async function failure(error) {
    if (defaultContents !== undefined) return this.defaultContents
    if (isAbortError(error)) throw new AbortedRequestError({ url, error, ...fetchParams })
    throw new OfflineError({ url, error, ...fetchParams })
  }

  return request.then(success, failure)
}
