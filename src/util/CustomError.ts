/**
 * Generic error class you can subclass which sets stack trace up property, etc.
 * - You can pass in any properties you like, but see `CustomErrorProps` below for common ones.
 */
export class CustomError<Props extends CustomErrorProps = CustomErrorProps> extends Error {
  /** Arbitrary properties passed at construction -- see `CustomErrorProps` for common ones. */
  props: Props

  /**
   * Build error from either a plain `message` string or full `props` object.
   * - `startStackAt` lets a wrapper function (e.g. `getDier()`'s returned `die()`) trim itself out of
   *   the stack trace by passing itself as the point stack capture should start from.
   * - `Function` matches type Node's own `Error.captureStackTrace(target, constructorOpt?)` expects below.
   * - NOTE: bare `Function` is deliberate here -- this is a dynamic boundary, not a known signature.
   */
  constructor(props: string | Props, startStackAt?: Function) {
    if (typeof props === "string") {
      super(props)
      this.props = { message: props } as Props
    } else {
      super(props.message)
      this.props = props
    }

    // Hook stack trace up to where error was actually called, rather than this function.
    // NOTE: this is v8-specific!
    if (Error.captureStackTrace) Error.captureStackTrace(this, startStackAt || this.constructor)

    // Restore prototype chain to make stack traces work out.
    // See: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // TODO: what does this actually do, and which platforms need it?
    Object.setPrototypeOf(this, new.target.prototype)
  }

  /** `error.name` reflects constructor name rather than base `Error`. */
  get name() {
    return this.constructor.name
  }

  /** `header` for this error, e.g. for `<ErrorDisplay>` -- includes `activity` when set. */
  get header() {
    if (this.props.activity) return `${this.name} ${this.props.activity}`
    return this.name
  }
}

/** UI error -- something the user tried to do went wrong. */
export class UIError extends CustomError {
  /** Hardcoded to `"UIError"` rather than deriving from constructor name like base `CustomError`. */
  get name() {
    return "UIError"
  }
}

/**
 * Props for `CustomError` and subclasses.
 * - None are required at the type level, but `message` should always be set in practice.
 */
export type CustomErrorProps = {
  /** Error message string. */
  message?: string
  /** Context in which error happened, e.g. an instance. */
  context?: any
  /** Name of method or action which failed. */
  activity?: string
  /** Any relevant parameters for activity. */
  params?: any
  /** Original error thrown. */
  error?: any
}
