/* eslint-disable react/prop-types */
import React from "react"

export class ErrorHandler extends React.Component {
  /**
   * Component used to draw a wrapper around `Component` or `ErrorComponent`.
   * Default is just to return the `contents` passed in.
   * - `contents` are rendered Component or ErrorComponent
   * - `error` is the error
   * - `props` are props passed in to this element
   */
  Wrapper({ contents, error, props }) {
    return contents
  }

  /** Component or Fn which should be used to render your thing if all is well. */
  Component(props) {
    return null
  }

  /**
   * Component or Fn which should be used to render an error.
   * - `error` is the error which was caught
   * - `props` are the **current** props passed to this component.
   */
  ErrorComponent({ error, props }) {
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
  static getDerivedStateFromProps(props, oldState) {
    return undefined
  }

  /** Override to do something when we catch an error. */
  componentDidCatch(error, errorInfo) {}

  //////////////
  // Generic stuff below this line
  ///////////////

  state = { error: undefined }
  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    const {
      props,
      state: { error },
    } = this
    const contents = error
      ? React.createElement(this.ErrorComponent, { error, props })
      : React.createElement(this.Component, props)
    return this.Wrapper({ contents, error, props })
  }
}
