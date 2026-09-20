import _get from "lodash/get"
import _set from "lodash/set"
import queryString from "query-string"

import { parseJSON, parseJSON5 } from "./json"
import { abortableFetch, isAbortError } from "./abortableFetch"
import { KnownFormat, BINARY_FORMATS, type KnownFormatMimeType } from "./constants"
import {
  ResponseError,
  OfflineError,
  MissingResourceError,
  AuthenticationError,
  ResponseParseError,
  AbortedRequestError
} from "./ResponseErrors"

/**
 * Merge multiple sets of `$fetch()` `params` and set up defaults.
 * - Later entries in `allParams` win.
 * - Falsy `params` entries are skipped, so callers can pass conditional spreads without filtering first.
 * - NOTE: a nested object value (e.g. `headers`) from a later `params` entirely replaces one from an
 *   earlier entry -- it does not get merged field-by-field.  Only its first occurrence is cloned, to
 *   avoid aliasing caller's original object.
 * - TODO: is the non-merge of nested objects across entries intentional, or should e.g. `headers` merge
 *   field-by-field like a real deep merge?
 */
export function merge$fetchParms(...allParams: Array<Partial<$FetchParams>>) {
  const output: RequestInit = {}
  allParams.forEach((params) => {
    if (!params) return
    Object.keys(params).forEach((key) => {
      const value = _get(params, key)
      if (typeof value === "object") {
        if (key in output) _set(output, key, value)
        else _set(output, key, { ...value })
      } else if (value !== undefined) {
        _set(output, key, value)
      }
    })
  })
  return output as $FetchParams
}

/** Request-shaping subset of `$FetchParams` -- also reused standalone by `LoadableFile` for its param types. */
export type $FetchRequestParams = {
  /** HTTP method.  Defaults to `POST` if `contents` provided, otherwise `GET`. */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE"
  /** HTTP headers. */
  headers?: Record<string, any>
  /** Input format, used to set `Content-Type` header.  See `KnownFormat`. */
  requestFormat?: KnownFormatMimeType
  /** URL query params, as string or object which will be serialized. */
  query?: string | Record<string, any>
}

/** Full param set accepted by `$fetch()`. */
export type $FetchParams = Prettify<
  {
    /** URL to load. */
    url: string
  } & $FetchRequestParams & {
      /** Request body as string or object which will be `JSON.stringify()`ed. */
      contents?: any
      /** Output format, used to format output.  Defaults to `text`.  See `KnownFormat`. */
      format?: string
      /** On a 404, return `defaultContents` rather than throwing. */
      defaultContents?: any
    }
>

/**
 * Fetch some `url` and return decoded results.
 * - Server errors (404 etc) will be `reject()`ed -- see `ResponseErrors` for specific error classes thrown.
 * - Returned promise has a `cancel()` method (see `abortableFetch()` for caveats).
 * - `$params` consists of following (all optional except `url`) -- see `$FetchParams` for details:
 *   - `url` URL to load.
 *   - `query` URL query params, as string or object which will be serialized.
 *   - `contents` Request body as string or object which will be `JSON.stringify()`ed.
 *   - `method` HTTP method.  Defaults to `POST` if `contents` provided, otherwise `GET`.
 *   - `headers` HTTP headers.
 *   - `requestFormat` Input format, used to set `Content-Type` header.  See `KnownFormat`.
 *   - `format` Output format, used to format output.  Defaults to `text`.  See `KnownFormat`.
 *   - `defaultContents` On a 404, return `defaultContents` rather than throwing.
 */
export function $fetch<T = any>($params: $FetchParams): Promise<T> {
  const {
    url,
    query,
    contents,
    method = contents != null ? "POST" : "GET",
    headers = {},
    requestFormat,
    format = "text/plain",
    defaultContents
  } = $params

  const fetchParams: RequestInit = { method }
  // Set `Content-Type` header if necessary.
  if (requestFormat) headers["Content-Type"] = requestFormat
  fetchParams.headers = headers

  // Set up body if provided.
  if (contents != null) {
    fetchParams.body = typeof contents === "string" ? contents : JSON.stringify(contents)
  }

  let fullURL = url
  if (typeof query === "string") fullURL += `?${query}`
  else if (query) fullURL += queryString.stringify(query)
  // console.warn("$fetch:", fullURL, fetchParams)
  const request = abortableFetch(fullURL, fetchParams)

  /** Response completed, but it might actually be signalling an error -- check `response.ok` first. */
  async function success(response: Response) {
    const errorParams = { url, status: response.status, ...fetchParams }
    if (!response.ok) {
      const message = await response.text()
      switch (response.status) {
        // If we got a resource-not-found error and we have `defaultContents`,
        // return that as a successful response.
        case 404:
          if (defaultContents !== undefined) return defaultContents
          throw new MissingResourceError({ ...errorParams, message })

        case 401:
        case 403:
          throw new AuthenticationError({ ...errorParams, message })

        default:
          throw new ResponseError({ ...errorParams, message })
      }
    }

    // Attempt to process response according to our format.
    // TODO: attempt to determine format from `Content-Type` in response header.
    try {
      if (BINARY_FORMATS.includes(format as any)) return await response.blob()
      // Pull text out to process json/json5 separately below.
      const text = await response.text()
      if (format === KnownFormat.json || format.toLowerCase() === "json") return parseJSON(text)
      if (format === KnownFormat.json5 || format.toLowerCase() === "json5") return parseJSON5(text)
      return text
    } catch (error) {
      throw new ResponseParseError({ ...errorParams, error })
    }
  }

  /** Transport failure, e.g. if we're offline or the request was aborted. */
  async function failure(error: Error) {
    if (defaultContents !== undefined) return defaultContents
    if (isAbortError(error)) throw new AbortedRequestError({ url, error, ...fetchParams })
    throw new OfflineError({ url, error, ...fetchParams })
  }

  return request.then(success, failure)
}
