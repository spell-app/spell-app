import { CustomError, type CustomErrorProps } from "./CustomError"

/** Generic error found when instantiating a request, e.g. before it's even sent. */
export class RequestError extends CustomError<RequestErrorProps> {
  /** HTTP status derived from `props.response`, or `undefined` if there's no response yet. */
  get status() {
    if (this.props.response) return this.props.response.status
    return undefined
  }
}

/** Props shared by `RequestError`/`ResponseError` and all their subclasses below. */
export type RequestErrorProps = Prettify<
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

/** Generic error found when processing a `Response`, e.g. after request completed. */
export class ResponseError extends CustomError<RequestErrorProps> {
  /** HTTP status derived from `props.response`, or `undefined` if there's no response yet. */
  get status() {
    if (this.props.response) return this.props.response.status
    return undefined
  }
}

/** Thrown when `fetch()` failed because network is offline (see `$fetch()`'s `failure()`). */
export class OfflineError extends ResponseError {
  /** Sets default `message` -- override by passing `message` in `props`. */
  constructor(props: RequestErrorProps) {
    super({ message: "You must be online to do this.", ...props })
  }
}

/** Thrown for a 404 server response, unless caller supplied `defaultContents` (see `$fetch()`). */
export class MissingResourceError extends ResponseError {
  /** Sets default `message` -- override by passing `message` in `props`. */
  constructor(props: RequestErrorProps) {
    super({ message: "There was a problem loading this thing.", ...props })
  }
}

/** Thrown for authentication error 401/403. */
export class AuthenticationError extends ResponseError {
  /** Sets default `message` -- override by passing `message` in `props`. */
  constructor(props: RequestErrorProps) {
    super({ message: "You are not authorized to do this.", ...props })
  }
}

/** Thrown if we can't parse `response` according to specified `format` (see `$fetch()`). */
export class ResponseParseError extends ResponseError {
  /** Sets default `message` -- override by passing `message` in `props`. */
  constructor(props: RequestErrorProps) {
    super({ message: "There was an error understanding the response.", ...props })
  }
}

/** Thrown if request promise was aborted via an `AbortSignal` (see `abortableFetch()`/`isAbortError()`). */
export class AbortedRequestError extends ResponseError {
  /** Sets default `message` -- override by passing `message` in `props`. */
  constructor(props: RequestErrorProps) {
    super({ message: "The action was cancelled.", ...props })
  }
}

/** Thrown if there's a problem saving -- NOTE: not currently thrown anywhere in `util/`; kept for callers. */
export class SaveError extends ResponseError {
  /** Sets default `message` -- override by passing `message` in `props`. */
  constructor(props: RequestErrorProps) {
    super({ message: "There was a problem saving this thing.", ...props })
  }
}
