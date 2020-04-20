import queryString from "query-string"

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

/**
 * Fetch some file and return the decoded results.
 * Server errors (404 etc) will be `reject()`ed.
 * Returned promise has a `cancel()` method (see `abortableFetch` for caveats).
 *
 * `callParams` consists of the following (all optional):
 * - `params`       Query Params, as string or object which will be serialized.
 * - `body`         Request body as string object which will be `JSON.stringified()`
 * - `method`       `GET`, `POST` etc.  If undefined, we'll assume `POST` if there's a `body`, otherwise `GET`.
 * - `headers`      HTTP headers.
 * - `inputFormat`  Input format, used to set `Content-Type` header. See KNOWN_FORMATS.
 * - `format`       Output format, defaulting to `text`. See KNOWN_FORMATS.
 */
// eslint-disable-next-line import/prefer-default-export
export function $fetch(url, callParams = {}) {
  const {
    params,
    body,
    method = body ? "POST" : "GET",
    headers = {},
    inputFormat,
    format = KNOWN_FORMATS.text,
    defaultContents
  } = callParams

  const fetchParams = { method, headers }
  // Set Content-Type header if necessary
  if (inputFormat) fetchParams.headers["Content-Type"] = inputFormat

  // Set up body if provided
  if (body != null) {
    fetchParams.body = typeof body === "string" ? body : JSON.stringify(body)
  }

  const fullUrl = params ? `${url}?${queryString.stringify(params)}` : url
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
      if (format === KNOWN_FORMATS.JSON || format.toUpperCase() === "JSON") return await response.json()
      return await response.text()
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
