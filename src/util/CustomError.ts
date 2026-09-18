import global from "global"

export type CustomErrorProps = {
  /** Required: single error message string or array of strings. */
  message?: string
  /** Context in which the error happened, e.g. an instance. */
  context?: any
  /** Name of the method or action which failed. */
  activity?: string
  /** Any relevant parameters for the activity. */
  params?: any
  /** Original error thrown. */
  error?: any
}

/**
 * Generic `CustomError` class you can subclass which sets stack trace up property, etc.
 * You can pass in any properties you like, but it can be helpful to see:
 * - `messsage`   Required: single error message string or array of strings.
 * - `context`    Context in which the error happened, e.g. an instance.
 * - `activity`   Name of the method or action which failed.
 * - `params`     Any relevant parameters for the action.
 */

export class CustomError<Props extends CustomErrorProps = CustomErrorProps> extends Error {
  props: Props
  // `Function` matches the type Node's own `Error.captureStackTrace(target, constructorOpt?)` expects below.
  // NOTE: bare `Function` is deliberate here -- this is a dynamic boundary, not a known signature.
  constructor(props: string | Props, startStackAt?: Function) {
    if (typeof props === "string") {
      super(props)
      this.props = { message: props } as Props
    } else {
      super(props.message)
      this.props = props
    }

    // Hook stack trace up to where error was actually called, rather than this function.
    // NOTE: This is v8-specific!
    if (Error.captureStackTrace) Error.captureStackTrace(this, startStackAt || this.constructor)

    // Restore prototype chain to make stack traces work out ???
    // See: https://github.com/Microsoft/TypeScript/wiki/Breaking-Changes#extending-built-ins-like-error-array-and-map-may-no-longer-work
    // TODO: WTF does this actually do?
    // TODO: Which platforms need this???
    Object.setPrototypeOf(this, new.target.prototype)
  }

  // Make `error.name` reflect constructor name.
  get name() {
    return this.constructor.name
  }

  /** Return `header` for this error, e.g. for `<ErrorDisplay>`. */
  get header() {
    if (this.props.activity) return `${this.name} ${this.props.activity}`
    return this.name
  }
}

/** UI error -- something the user tried to do went wrong. */
export class UIError extends CustomError {
  get name() {
    return "UIError"
  }
}

// DEBUG
global.CustomError = CustomError
