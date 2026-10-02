/** @jsxImportSource react */
//
//  ## Field/form wrapper machinery.
//
//  NOTE: `FieldWrapper`, `WithField()`, `WithForm()` are what `./components` is BUILT from, not
//  meant to be reached for directly by app code -- stick to `F.Form`, `F.Input`, `F.Select`, etc.
//  Import from here if you are adding a new field component.
//  NOTE: the `./Form` import is type-only, so this file has no runtime dependency on it.
//

import React from "react"
import { findDOMNode } from "react-dom"
import { view } from "@risingstack/react-easy-state"

import { UIError } from "$/util"

import type { Form } from "./Form"

/** Counter for `FieldWrapper.id`, incremented on each field instance so ids stay unique app-wide. */
let fieldId = 0

/****************
 * ### `<FieldWrapper>`
 * Base class every form field component subclasses (directly, or via `WithField()`).  Handles
 * reading/writing its value and error either through an enclosing `form`/`path`, or standalone via
 * `props.value`/`onChange` -- and validates itself against the DOM element's `validationMessage`.
 ****************/
export const FieldWrapper = view(
  class FieldWrapper extends React.Component<FieldWrapperProps> {
    static injectForm = true

    /**
     * Generate a unique id for this field.
     * We'll use this to link the field with its label, etc.
     */
    id = `spell-field-${fieldId++}`

    /** Component we should render. Subclasses hold heterogeneous SUI field components (Input/Checkbox/Dropdown/etc). */
    get Component(): ReactComponentType<any> {
      throw new TypeError("FieldWrapper subclasses must implement `get Component()`")
    }

    /** Form `value` for this field according to our `path`. */
    getValue(): unknown {
      const { form, path } = this.props
      if (form && path) return form.getValue(path)
      return this.props.value
    }
    /** Update the `value`. Override in your subclass if necessary. */
    setValue(value: unknown): void {
      const { form, path } = this.props
      if (form && path) form.setValue(path, value)
      else {
        this.props.onChange?.(value)
        this.forceUpdate()
      }
    }

    /** Standalone error, used only when we're not inside a `form`/`path`. */
    _error?: string
    /** Form `error` for this field according to our `path`. */
    getError(): string | undefined {
      const { form, path } = this.props
      if (form && path) return form.getError(path)
      return this._error
    }
    /** Update the `error`. Override in your subclass if necessary. */
    setError(error: string | undefined): void {
      if (error === this.getError()) return
      const { form, path } = this.props
      if (form && path) return form.setError(path, error)
      else {
        this._error = error
        this.forceUpdate()
      }
    }

    /**
     * Pointer to HTML `<input>` etc element.
     * - Looked up by `id` in the document or shadow root WE'RE drawn in, NOT `document`:  a spell app may live in a
     *   shadow root, e.g. `<spell-app>`'s.
     * - NOT via `spellCore.domRoot()`:  the forms are the app's too, and MUST NOT import `spellCore` -- each runner
     *   runs its own copy.  See `spellRuntime.ts`.
     * - NOTE: `findDOMNode()` is deprecated, and gone in React 19 -- as Semantic UI's own `Ref` uses it, we'll
     *   meet that together.
     */
    getHtmlElement(): (HTMLElement & { validationMessage?: string }) | null {
      // oxlint-disable-next-line react/no-find-dom-node
      const root = (findDOMNode(this)?.getRootNode() ?? document) as Document | ShadowRoot
      const found = root.getElementById?.(this.id) ?? document.getElementById(this.id)
      return found as (HTMLElement & { validationMessage?: string }) | null
    }

    /**
     * Validate the current value, setting form error if invalid.
     * Currently uses DOM `element.validationMessage`.
     * TODO: custom validators.
     * TODO: custom validation messages for DOM errors.
     */
    validate = (): void => {
      // get validationMessage from HTML element ???
      const error = this.getHtmlElement()?.validationMessage
      this.setError(error)
    }

    /**
     * Given `onChange()` arguments, return the current element value.
     */
    getEventValue(event: React.ChangeEvent<HTMLInputElement>, ..._rest: unknown[]): unknown {
      // console.info("getEventValue", ...arguments)
      const { value } = event.target
      const { type } = this.props
      if (type === "number" || type === "range") return parseFloat(value)
      return value
    }

    /** Properties to pass to component we render. */
    get fieldProps() {
      return {
        id: this.id,
        onChange: (...args: [React.ChangeEvent<HTMLInputElement>, ...unknown[]]) => {
          const value = this.getEventValue(...args)
          if (this.props.form?.props.debug) console.info("onChange", { value, field: this })
          //if (value !== this.getValue())
          this.setValue(value)
          this.validate()
        },
        onBlur: () => {
          if (this.props.form?.props.debug) console.info("onBlur", this)
          this.validate()
        },
        onKeyUp: ({ key }: React.KeyboardEvent<HTMLInputElement>) => {
          if (this.props.form?.props.debug) console.info("onKeyUp", this)
          this.validate()
          if (key !== "Enter") return
          const { submitOnEnter, form, onEnter } = this.props
          if (submitOnEnter && form) form.submit()
          else if (onEnter) onEnter(this.getValue())
        }
      }
    }

    /**
     * Return props for field `value` and `error` as they should be passed to the rendered component.
     * Override in a subclass that needs different properties -- e.g. `Checkbox` sets `{ checked, error }` instead.
     */
    getValueProps(): Record<string, unknown> {
      return {
        value: this.getValue() ?? "",
        error: this.getError()
      }
    }

    render() {
      // take out props we've added or that we manage separately
      const { form, path, submitOnEnter, onEnter, onChange, ...elementProps } = this.props

      // add us to our form's `fields` on render
      if (form) form.fields[this.id] = this

      // validate right after render
      // this is not optimal, but it makes SubmitButton semantics work out
      setTimeout(this.validate, 0)

      // console.info("rendering field", { id: this.id, path, value: this.value, props: this.props })
      const props = {
        "data-path": this.props.path, // debug
        ...elementProps,
        ...this.fieldProps,
        ...this.getValueProps()
      }

      return React.createElement(this.Component, props)
    }

    /** Show an error on initial render if things aren't set up properly. */
    componentDidMount() {
      const { form, path, onChange } = this.props
      if (!(form && path) && !onChange) {
        const error = new UIError({
          message: "Error rendering <Field>: you must either specify `name` and wrap in a <Form> or provide `onChange`",
          context: this,
          activity: "rendering",
          params: this.props
        })
        console.error(error, "\n", this.props)
      }
    }

    /** Remove us from `form.fields` on unmount. */
    componentWillUnmount() {
      const { form } = this.props
      if (form) delete form.fields[this.id]
    }
  }
)

/** Props for `<FieldWrapper>` and its subclasses. */
export type FieldWrapperProps = {
  /** Enclosing form -- when set with `path`, value/error read and write through it instead of standalone. */
  form?: Form<Record<string, unknown>>
  /** Dotted path into `form`'s value, e.g. set by `Form.enhanceField()` from a `name` prop. */
  path?: string
  /** Field name -- `Form.enhanceField()` reads this to compute `path` when nested under a parent. */
  name?: string
  /** `<input type>` -- also used by `getEventValue()` to parse `"number"`/`"range"` values as floats. */
  type?: string
  /** Standalone value, used only when we're not inside a `form`/`path`. */
  value?: unknown
  /** Standalone error, used only when we're not inside a `form`/`path`. */
  error?: string
  /** Submit the enclosing `form` on Enter, instead of calling `onEnter`. */
  submitOnEnter?: boolean
  /** Called with the current value on Enter, when `submitOnEnter` is not set. */
  onEnter?: (value: unknown) => void
  /** Called with the new value on change, used only when we're not inside a `form`/`path`. */
  onChange?: (value: unknown) => void
} & Record<string, unknown>

/////////////////////
// ## WithField wrapper
/////////////////////

/**
 * Take a plain `Component` (e.g. `SUI.Form.Input`) and make it a `Field`: a `FieldWrapper` subclass
 * whose `Component` getter returns it, optionally seeded with `defaultProps`.
 * - Reactive, because it subclasses `FieldWrapper`, which is already wrapped in `view()`.
 * - `Component` is rendered with `id`/`onChange`/`onBlur`/`onKeyUp` (see `FieldWrapper.fieldProps`)
 *   plus `value`/`error` (see `getValueProps()`) and any other props passed through -- but NOT
 *   `form`/`path`/`submitOnEnter`/`onEnter`, which `FieldWrapper` consumes itself.
 */
export function WithField(Component: ReactComponentType<any>, defaultProps?: Record<string, unknown>) {
  return class WithField extends FieldWrapper {
    static defaultProps = defaultProps
    get Component() {
      return Component
    }
  }
}

/////////////////////
// ## WithForm wrapper
/////////////////////

/**
 * Make a reactive `view()` of `Component` and flag it `injectForm`, so an enclosing `<Form>` will
 * clone in `form`/`path` props via `Form.enhanceField()` -- see `<SubmitButton>`/`<FormGroup>`/`<FormRepeat>`.
 */
export function WithForm<P extends object>(Component: ReactComponentType<P>) {
  const formComponent = view(Component) as ReactComponentType<P> & { injectForm?: boolean }
  formComponent.injectForm = true
  return formComponent
}

/**
 * Props injected at runtime by the enclosing `<Form>` -- see `WithForm()`/`injectForm` above.
 * - Mixed into `<SubmitButton>`/`<FormGroup>`/`<FormRepeat>` props as `WithFormProps & ...`.
 */
export type WithFormProps = {
  /** Enclosing form. */
  form: Form<Record<string, unknown>>
  /** Dotted path this element was mounted under, if nested inside a named `<FormGroup>`/`<FormRepeat>`. */
  path?: string
}
