//////////////////////////////
//
//  # `apiUtils`
//  API utility functions, not specific to this app.
//
//  These are a bunch of convenience routines for doing client/server communication
//  in a rational, consistent manner.
//
//////////////////////////////

import JSON5 from "json5";
import { parseJSON, parseJSON5 } from "./utils/json.js";

export class APIError extends Error {
  constructor(_props) {
  const { message, props } =_props;
  super(message);
  Object.assign(this, props);
  // Fix up stack trace to refer to throwing line
  if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
  }
}

//////////////////////////////
//
//  Make an API call to the server.
//
//  Similar to standard web `fetch` API call which:
//    - sends credentials to the server by default (see `credentials` param)
//    - considers a non-200ish response an error
//    - returns promise which:
//      - on success, resolves with response data (rather than the response itself)
//      (see `responseType` param)
//      - on error (including network error, non-200 response or error parsing response)
//      rejects with an `APIError` object
//
//  Params:
//  - `url`       REQUIRED:   url to call
//  - `params`      OPTIONAL:   Params to the `GlobalFetch.fetch()` call.
//  - `apiMethod`     OPTIONAL:   API method name, used for formatting error responses.
//  - `credentials`   OPTIONAL:   one of [*`include`, `same-origin`, `omit`]
//                  Set credentials, overridden by `params.credentials`.
//  - `responseType`  REQUIRED:   one of [*`text`, `json`, `blob`, `dataURL`]
//                  Determines which response body parser we'll use on successful response.
//
//  For description of how `fetch` works, see:
//    See https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
//
//  Note:  ALL API routines should eventually get down to this one method.
//       This standardizes error handling
//       and will allow us to eventually batch requests to the server if desired.
//
const RESPONSE_TYPES = [ "text", "json", "json5", "blob", "dataURL" ];
export function makeAPICall({ url, params = {}, apiMethod, credentials = "include", responseType = "text" }) {
  // Default credentials
  if (params.credentials === undefined)
    params.credentials = credentials;

  // Make sure we got a valid `responseType`
  if (!RESPONSE_TYPES.includes(responseType))
    throw new TypeError(`apiUtils.makeAPICall('${url}'): don't understand responseType '${responseType}'`);

  // If debugging, log calls
  console.debug(`CALLING: '${url}' with params:`, params);

  return fetch(url, params)
    // Catch CORS, server-not-found or other network error.
    // Reject with an `APIError` with `isNetworkError` set to true.
    .catch(exception => {
      const error = new APIError({
        message: "Network error:",
        isNetworkError: true,
        error: exception,
        url,
        params,
        apiMethod,
      });
      console.warn(error.message, error);
      return Promise.reject(error.message, error);
    })
    // Catch normal response, regardless of status code
    .then(response => {
      // Convert a non `ok` response to an `APIError`
      if (!response.ok) {
        // Log authentication errors specially
        // The promise handler will pick these up automatically.
        const isAuthError = (response.status === 401 || response.status === 403);

        const error = new APIError({
          isAuthError,
          message: (isAuthError ? "Authentication error:" : "Server returned error:"),
          apiMethod,
          url,
          params,
          response
        });
        console.warn(error.message, error);
        return Promise.reject(error);
      }

      // Return result according to `responseType`
      let responsePromise;
      if (responseType === "json")
        responsePromise = parseJSONResponse(response);

      else if (responseType === "json5")
        // NOTE: `parseJSONResponse()` logs meaningful error messages
        responsePromise = parseJSON5Response(response);

      else if (responseType === "blob")
        responsePromise = response.blob();

      else if (responseType === "text")
        responsePromise = response.text();

      else if (responseType === "dataURL")
        responsePromise = response.blob()
          //... and convert to a base64 blob we can use as an `<img src>`
          .then(blob => toDataURL(blob, "Error parsing image"));

      // Convert an error in the above into an APIError
      return responsePromise.catch(exception => {
        const error = new APIError({
          message: `Error parsing ${responseType}: ${exception.message}`,
          apiMethod,
          url,
          params,
          response,
          error: exception
        });
        console.warn(error.message, error);
        return Promise.reject(error);
      });
    });
}


//////////////////////////////
// HTTP "GET" methods
//////////////////////////////

// Get a text resource at `url`.
// Returns a promise which yields the reponse as a text string.
export function getText({ url, params, apiMethod }) {
  return makeAPICall({ url, params, apiMethod });
}

// Get a JSON resource at `url`.
// Returns a promise which yields the reponse as a json object.
// Throws if the json is not valid.
export function getJSON({ url, params, apiMethod }) {
  return makeAPICall({ url, params, apiMethod, responseType: "json" });
}

// Get a JSON5 resource at `url`.
// Returns a promise which yields the reponse as a json object.
// Throws if the json is not valid.
export function getJSON5({ url, params, apiMethod }) {
  return makeAPICall({ url, params, apiMethod, responseType: "json5" });
}


// Get a binary resource (e.g. an image) at `url`.
// Returns a promise which yields the reponse as a blob.
export function getBlob({ url, params = {}, apiMethod }) {
  return makeAPICall({ url, params, apiMethod, responseType: "blob" });
}

// Get a binary resource (e.g. an image) at `url`.
// Returns a promise which yields the reponse as a data URL,
// e.g. for using as an `<img src>`.
export function getBlobAsDataURL({ url, params = {}, apiMethod }) {
  return makeAPICall({ url, params, apiMethod, responseType: "dataURL" });
}


// Load the file at `url` and present in a new window/tab.
// Note that there is no return from this, and no error message if the file is not found.
// NOTE: this uses a special `<a>` tag to force the browser to download.
// See: https://developers.google.com/web/updates/2011/08/Downloading-resources-in-HTML5-a-download
export function openFile({ url, filename }) {
  window.open(url, "_blank");
}

// Download the file at `url` to user's disk as `filename`.
// Note that there is no return from this, and no error message if the file is not found.
// NOTE: this uses a special `<a>` tag to force the browser to download.
// See: https://developers.google.com/web/updates/2011/08/Downloading-resources-in-HTML5-a-download
export function downloadFile({ url, filename }) {
  const anchor = document.createElement("a");
  anchor.setAttribute("href", url);
  anchor.setAttribute("download", filename);
  anchor.click();
}


//////////////////////////////
// HTTP "POST" methods
//////////////////////////////

// Post `body` to the server at `url` as text.
// Also used for `PUT`, specify `params: { method: "PUT" }`
//
// If `body` is not a string, we'll `JSON.strigify()` it.
// Rejects with APIError immediately if `stringify()` fails.
//
// Use `postJSON` to post as JSON and return results as parsed JSON.
//
export function post({ url, body, params = {}, apiMethod, responseType = "text" }) {
  if (!params.method) params.method = "POST";
  if (body != null) {
    if (typeof body === "string") params.body = body;
    else {
      try {
        params.body = JSON.stringify(body, null, "  ");
      }
      catch (exception) {
        const error = new APIError({
          message: "Error JSON.stringifying body",
          apiMethod,
          url,
          params,
          body,
          error: exception
        });
        console.warn(error.message, error);
        return Promise.reject(error);
      }
    }
  }
  return makeAPICall({ url, params, apiMethod, responseType });
}

// Post text `body` to the server at `url` (stringifying if necessary).
// Throws and logs to console if if `JSON.stringify()` fails.
export function postText({ url, body, params = {}, apiMethod }) {
  setTextHeader(params);
  return post({ url, body, params, apiMethod, responseType: "text" });
}

// Post json `body` to the server at `url` (stringifying if necessary).
// Yields JSON parse of response.
// Throws and logs to console if if `JSON.stringify()` fails.
export function postJSON({ url, body, params = {}, apiMethod }) {
  // Set JSON content-type header
  setJSONHeader(params);
  return post({ url, body, params, apiMethod, responseType: "json" });
}

// Post json5 `body` to the server at `url` (stringifying if necessary).
// Yields JSON5 parse of response.
// Throws and logs to console if if `JSON5.stringify()` fails.
export function postJSON5({ url, body, params = {}, apiMethod }) {
  // Set JSON5 content-type header
  setJSON5Header(params);
  return post({ url, body, params, apiMethod, responseType: "json5" });
}



//////////////////////////////
//  Utilities
//////////////////////////////

// Convert a simple (non-nested) object into a query parameter string
export function getQueryParamsString(queryObject) {
  const params = Object.keys(queryObject).map(key => {
    return `${key}=${queryObject[key]}`;
  });
  return "?" + params.join("&");
}

// Parse JSON `response` from a `fetch`.
// Throws any error encountered in the `JSON.parse()`.
// NOTE: This grabs the `text()` from the call, then parses that into JSON as a separate step.
//     This allows us to log a better error message, including source url and line number.
export function parseJSONResponse(response) {
  return response.text()
    .then(text => parseJSON(text, response.url));
}

// Parse JSON5 `response` from a `fetch`.
// Throws any error encountered in the `JSON5.parse()`.
// NOTE: This grabs the `text()` from the call, then parses that into JSON5 as a separate step.
//     This allows us to log a better error message, including source url and line number.
export function parseJSON5Response(response) {
  return response.text()
    .then(text => parseJSON5(text, response.url));
}

// Set a header in fetch `params`, creating `params` object if necessary.
// Returns `params`.
export function setFetchHeader(params, headerName, headerValue) {
  if (!params.headers)
    params.headers = new Headers();
  params.headers.set(headerName, headerValue);
  return params;
}

// Add application/json content type header to fetch params.
export function setTextHeader(params) {
  return setFetchHeader(params, "Content-Type", "text/plain");
}

// Add application/json content type header to fetch params.
export function setJSONHeader(params) {
  return setFetchHeader(params, "Content-Type", "application/json");
}

// Add application/json5 content type header to fetch params.
export function setJSON5Header(params) {
  return setFetchHeader(params, "Content-Type", "application/json5");
}



// Export everything as a lump for easy import as a "module".
// e.g.  `import apiUtils from "./api-utils"`
export default {...exports};
