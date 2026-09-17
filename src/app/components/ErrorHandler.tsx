import React from "react"

export type ErrorHandlerState = {
  error?: Error
}

export type ErrorHandlerWrapperProps<Props> = {
  component: React.ReactNode
  error?: Error
  props: Props
}

/**
 * Generic `ErrorHandler` component.
 * DOCME
 *
 * NOTE: `Wrapper`/`Component`/`ErrorComponent` below are declared as plain prototype methods
 * (not class-field arrow functions) so that subclasses can override them with EITHER a method
 * OR a field (e.g. `Component = view(() => ...)`) and have it correctly take precedence --
 * an instance field set by a subclass always shadows an inherited prototype method.
 */
export class ErrorHandler<Props extends object = object> extends React.Component<Props, ErrorHandlerState> {
  /**
   * Component used to draw a wrapper around `Component` or `ErrorComponent`.
   * Default is just to return the `contents` passed in.
   * - `component` is the rendered Component or ErrorComponent
   * - `error` is the error, if any
   * - `props` are props passed in to this element
   */
  Wrapper(props: ErrorHandlerWrapperProps<Props>): React.ReactNode {
    return props.component
  }

  /**
   * Component or Fn which should be used to render your thing if all is well.
   * You'll be passed all of the props as passed to the root element and:
   *  - `wrapperRef` DOM ref to the wrapper element.
   */
  Component(_props: Props): React.ReactNode {
    return null
  }

  /**
   * Component or Fn which should be used to render an error.
   * - `error` is the error which was caught
   * - will also contain all `props` passed to the root element.
   */
  ErrorComponent({ error }: Props & { error: Error }): React.ReactNode {
    return <h4>Error: {error.message}</h4>
  }

  /**
   * You may want to clear `state.error` if we re-render and one or more props change.
   * Something like:
   *  `static getDerivedStateFromProps(props, oldState) {`
   *  `  const newState = { relevant: props.someRelevantProp }`
   *  `  if (oldState.relevant !== newState.relevant) newState.error = null`
   *  `  return newState`
   *  `}`
   */
  static getDerivedStateFromProps(
    _props: unknown,
    _oldState: ErrorHandlerState
  ): Partial<ErrorHandlerState> | undefined {
    return undefined
  }

  /** Override to do something when we catch an error. */
  componentDidCatch(_error: Error, _errorInfo: React.ErrorInfo) {}

  //////////////
  // Generic stuff below this line
  ///////////////

  state: ErrorHandlerState = { error: undefined }
  static getDerivedStateFromError(error: Error): ErrorHandlerState {
    return { error }
  }

  render() {
    const {
      props,
      state: { error }
    } = this
    const component = error
      ? React.createElement(this.ErrorComponent, { ...props, error })
      : React.createElement(this.Component, props)
    return React.createElement(this.Wrapper, { component, error, props })
  }
}
