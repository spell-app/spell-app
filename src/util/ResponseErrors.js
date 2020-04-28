import { CustomError } from "./CustomError"

/**
 * Errors for use in Loadable.
 * Expeced props:
 *  - message       Error message string
 *  - url           Request URL
 *  - error         Original error encountered.
 *  - response      `fetch()` response object.
 *  - params        Request params
 *  - headers       Request headers.
 *  - body          Request body.
 */
export class ResponseError extends CustomError {
  constructor({ message = "Unknown ResponseError", ...otherProps } = {}) {
    super(message)
    Object.assign(this, otherProps)
  }
  /** Derive HTTP status from response, if set. */
  get status() {
    if (this.response) return this.response.status
    return undefined
  }
}

/** Error we'll throw if fetch() failed because the network is offline. */
export class OfflineError extends ResponseError {
  constructor({ message = "You must be online to do this.", ...props }) {
    super({ message, ...props })
  }
}

/** Specific error we'll throw for a 404 server response. */
export class MissingResourceError extends ResponseError {
  constructor({ message = "There was a problem loading something.", ...props }) {
    super({ message, ...props })
  }
}

/** Specific error we'll throw for authentication error 401/403. */
export class AuthenticationError extends ResponseError {
  constructor({ message = "You are not authorized to do this.", ...props }) {
    super({ message, ...props })
  }
}

/** Specific error we'll throw if we can't parse `response` according to specified `responseType`. */
export class ResponseParseError extends ResponseError {
  constructor({ message = "There was an error understanding the response.", ...props }) {
    super({ message, ...props })
  }
}

/** Specific error we'll throw if we request promise was aborted via an AbortSignal. */
export class AbortedRequestError extends ResponseError {
  constructor({ message = "Operation was cancelled.", ...props }) {
    super({ message, ...props })
  }
}

/** Specific error we'll throw if there's a problem saving. */
export class SaveError extends ResponseError {}
