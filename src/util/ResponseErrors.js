/** Errors for use in LoadableFile */
export class ResponseError extends Error {
  constructor({ url, response, message, params, headers, body, error }) {
    super(message)
    // Restore prototype chain to make stack traces work out
    Object.setPrototypeOf(this, new.target.prototype)
    Object.assign(this, { url, error, response, params, headers, body })
    if (response) this.status = response.status
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
