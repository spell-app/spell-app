//
//  ## Field/form wrapper machinery.
//
//  NOTE: deliberately NOT re-exported from `./index` (and so not from `~/app/ui`).  This is what
//  `./components` is BUILT from -- `FieldWrapper`, `WithField()`, `WithForm()` -- not part of the
//  app's UI surface.  Import it from here if you are adding a new field component.
//  NOTE: the `./Form` import is type-only, so this file has no runtime dependency on it.
//

import React from "react"
import { view } from "@risingstack/react-easy-state"

import { UIError } from "~/util"

import type { Form } from "./Form"

/** DOCME */
let fieldId = 0

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

    /** Form `error` for this field according to our `path`. */
    _error?: string
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

    /** Pointer to HTML `<input>` etc element. */
    getHtmlElement(): (HTMLElement & { validationMessage?: string }) | null {
      return document.getElementById(this.id) as (HTMLElement & { validationMessage?: string }) | null
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
     * Return props to for field `value` and `error` as they should be passed to the rendered component.  If a subclass sets a different property
     * Some subclasses will set other properties, e.g. `checkbox` sets `{ checked, error }` instead.
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

export type FieldWrapperProps = {
  form?: Form<Record<string, unknown>>
  path?: string
  name?: string
  type?: string
  value?: unknown
  error?: string
  submitOnEnter?: boolean
  onEnter?: (value: unknown) => void
  onChange?: (value: unknown) => void
} & Record<string, unknown>

/////////////////////
// WithField wrapper
/////////////////////

/**
 * DOCME: NO LONGER TRUE
 * Take an ordinary `Component` and set it up as a `Field`,
 * where it will get the following props on instantiation:
 *  `{ form, defaultValue, error, id, onChange, onBlur, onKeyUp }`
 * It will be reactive, meaning it will draw when accessed form properties
 * (such as `defaultValue` or `error`) change.
 */
export function WithField(Component: ReactComponentType<any>, defaultProps?: Record<string, unknown>) {
  return class WithField extends FieldWrapper {
    static defaultProps = defaultProps
    get Component() {
      return Component
    }
  }
}

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
  form: Form<Record<string, unknown>>
  path?: string
}

/**
 * Recursively map `callback()` value for all `children` ReactNodes.
 */
export function recursivelyMapChildren(
  children: ReactNode,
  callback: (child: ReactElement, key: string | number) => ReactElement
): ReactNode[] {
  return React.Children.toArray(children).map((child, index) => {
    if (!React.isValidElement(child)) return child
    let result = callback(child, child.key || index)
    if (result.props.children) {
      const newKids = recursivelyMapChildren(result.props.children, callback)
      if (newKids !== result.props.children)
        result = React.cloneElement(result, { key: result.key || index, children: newKids })
    }
    return result
  })
}
