import { Prettify } from "~/types"
import { CustomError, type CustomErrorProps } from "./CustomError"

export type ResponseErrorProps = Prettify<
  Partial<CustomErrorProps> & {
    /** Request URL. */
    url?: string
    /** `fetch()` response object. */
    response?: Response
    /** Request params. */
    params?: Record<string, any>
    /** Request headers. */
    headers?: Record<string, any>
    /** Request body. */
    body?: any
  }
>

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
export class ResponseError extends CustomError<ResponseErrorProps> {
  /** Derive HTTP status from response, if set. */
  get status() {
    if (this.props.response) return this.props.response.status
    return undefined
  }
}

/** Error we'll throw if fetch() failed because the network is offline. */
export class OfflineError extends ResponseError {
  constructor(props: ResponseErrorProps) {
    super({ message: "You must be online to do this.", ...props })
  }
}

/** Specific error we'll throw for a 404 server response. */
export class MissingResourceError extends ResponseError {
  constructor(props: ResponseErrorProps) {
    super({ message: "There was a problem loading this thing.", ...props })
  }
}

/** Specific error we'll throw for authentication error 401/403. */
export class AuthenticationError extends ResponseError {
  constructor(props: ResponseErrorProps) {
    super({ message: "You are not authorized to do this.", ...props })
  }
}

/** Specific error we'll throw if we can't parse `response` according to specified `responseType`. */
export class ResponseParseError extends ResponseError {
  constructor(props: ResponseErrorProps) {
    super({ message: "There was an error understanding the response.", ...props })
  }
}

/** Specific error we'll throw if we request promise was aborted via an AbortSignal. */
export class AbortedRequestError extends ResponseError {
  constructor(props: ResponseErrorProps) {
    super({ message: "The action was cancelled.", ...props })
  }
}

/** Specific error we'll throw if there's a problem saving. */
export class SaveError extends ResponseError {
  constructor(props: ResponseErrorProps) {
    super({ message: "There was a problem saving this thing.", ...props })
  }
}
