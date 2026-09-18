import React from "react"
import cloneDeep from "lodash/cloneDeep"
import { store, view } from "@risingstack/react-easy-state"

import * as SUI from "semantic-ui-react"

import { UIError } from "~/util"
import { spellCore } from "~/spellCore"

/** Export everything including types as `F`. */
export * as F from "./Form.tsx"

// Generic function to recursively map children
function recursivelyMapChildren(
  children: ReactNode,
  callback: (child: ReactElement, key: string | number) => ReactElement
): ReactNode[] {
  return React.Children.toArray(children).map((child, index) => {
    if (!React.isValidElement(child)) return child
    let mapped = callback(child, child.key || index)
    if (mapped.props.children) {
      const newKids = recursivelyMapChildren(mapped.props.children, callback)
      if (newKids !== mapped.props.children)
        mapped = React.cloneElement(mapped, { key: mapped.key || index, children: newKids })
    }
    return mapped
  })
}

/**
 * Reactive store for use in a form with form `value`, generic over the value object shape `V`.
 * Note that modifying the form will NOT update the `value` passed in directly!
 * Access properties as `formState.value.x.y.z` or `formState.getValue("x.y.z")`.
 *
 * Note that either of the above returns a `Proxy` object for an object or array value,
 * use `formState.raw.x.y.z` to get a POJO representation,
 * but be aware that accessing it this way will NOT be reactive!
 *
 * Set values as `formState.setValue("x.y.z", 10)` or `formState.value.x.y.z = 10`.
 *
 * Has methods to `getValue(path)/setValue(path,value)`) by dotted path.
 * Also has `errors`/`hasErrors`/`getError(path)`/`setError(path,error)` with FLATTENED dotted path.
 */
export type FormStore<V extends object> = {
  value: V
  readonly raw: V
  getValue(path: string): unknown
  setValue(path: string, value: unknown): void
  errors: Record<string, string | undefined>
  getError(path: string): string | undefined
  setError(path: string, error: string | undefined): void
  readonly hasErrors: boolean
}

/**
 * Create a react-easy-state `store` for use in a form with form `value`.
 * See `FormStore` for details.
 */
export function makeFormStore<V extends object>(value: V): FormStore<V> {
  const formStore: FormStore<V> = store<FormStore<V>>({
    value,
    get raw() {
      return cloneDeep(value)
    },
    // NOTE: read/write the raw `value` closure reference directly, NOT `formStore.value`.
    // react-easy-state auto-wraps nested object properties in their own reactive proxy the first time
    // they're read during a render. If `value` is already its own reactive object (e.g. a spellCore
    // `Thing`), going through that second wrapper invokes `value`'s getters/setters with `this` bound to
    // the WRAPPING proxy instead of the real instance -- writes then land in a different reactive slot
    // than the one everything else (e.g. a spell `onClick` handler doing `app.x = y` directly) reads from,
    // so e.g. a bound `<UI.Button disabled={...}>` never sees the change. Using `value` directly keeps
    // every read/write going through the exact same getter/setter with `this` always the real instance.
    getValue(path) {
      return spellCore.getPath(value, path)
    },
    setValue(path, newValue) {
      spellCore.setPath(value, path, newValue)
    },
    errors: {},
    getError(path) {
      return formStore.errors[path]
    },
    setError(path, error) {
      if (error) formStore.errors[path] = error
      else delete formStore.errors[path]
    },
    get hasErrors(): boolean {
      return Object.keys(formStore.errors).length > 0
    }
  })
  // console.warn(formStore)
  return formStore
}

/** Minimal duck-type for a mounted field, as registered in `form.fields`. */
type MountedField = {
  forceUpdate?: () => void
  validate?: () => void
}

export type FormProps<V extends object> = Omit<SUI.FormProps, "onSubmit"> & {
  /** Existing store to use, e.g. one created outside the `<Form>` via `makeFormStore()`. */
  store?: FormStore<V>
  /** Initial form value, used to create a store if `store` isn't passed. */
  value?: V
  /** Called with the form's raw POJO value on successful submission. */
  onSubmit?: (raw: V) => void
  debug?: boolean
}

export class Form<V extends object> extends React.Component<FormProps<V>> {
  /**
   * Create react-easy-state store on construction
   * NOTE: to get a handle to the store OUTSIDE the <Form>, do:
   *       `myStore = makeFormStore()`
   *       `return <Form store={myStore}... />`
   */
  store: FormStore<V> = this.props.store || makeFormStore(this.props.value ?? ({} as V))

  ////////////////////
  // upgrade children to point back to us as their `form`???
  // TODO: we're assuming children never change???
  ////////////////////
  enhanceFields = (children: ReactNode, parentPath = ""): ReactNode[] => {
    return React.Children.toArray(children).map((child, index) => {
      if (!React.isValidElement(child)) return child
      let enhanced = this.enhanceField(child, child.key || index, parentPath)
      if (enhanced.props.children) {
        const newKids = this.enhanceFields(enhanced.props.children, enhanced.props.path || parentPath)
        if (newKids !== enhanced.props.children)
          enhanced = React.cloneElement(enhanced, { key: enhanced.key || index, children: newKids })
      }
      return enhanced
    })
  }
  enhanceField = (child: ReactElement, key: string | number, parentPath: string): ReactElement => {
    const type = child.type as { injectForm?: boolean }
    if (!type?.injectForm) return child
    if (child.props.form === this) console.warn("enhanceField(): form is already set!", child)
    const props: { key: string | number; form: Form<V>; path?: string } = { key, form: this }

    // if component specifies `name`, set its path
    const name = child.props.name
    if (name) props.path = parentPath ? `${parentPath}.${name}` : name

    const clone = React.cloneElement(child, props)
    // console.info("enhancing", { props, clone })
    return clone
  }

  // Map of `{ <fieldId>: <fieldWrapper> }` set up when fields render.
  fields: Record<string, MountedField> = {}

  // Have our fields re-render
  updateFields() {
    Object.values(this.fields).forEach((field) => field.forceUpdate?.())
  }

  ////////////////////
  // `value` API for children
  ////////////////////

  /**
   * Get the raw `value` of the form as a POJO.
   * NOTE: this is NOT REACTIVE!!!
   */
  get raw(): V {
    return this.store.raw
  }

  /**
   * Reactively get a value by nested `path`.
   */
  getValue(path: string): unknown {
    return this.store.getValue(path)
  }

  /**
   * Reactively set a `value` by nested `path`.
   */
  setValue(path: string, value: unknown): void {
    this.store.setValue(path, value)
    if (this.props.debug) {
      console.info(
        "form.setValue(",
        { form: this, path, value },
        "): store.value after:\n",
        JSON.stringify(this.store.value, null, "  ")
      )
    }
    this.updateFields()
  }

  ////////////////////
  // errors API as a FLAT object (e.g. no nesting of paths)
  ////////////////////
  getError(path: string): string | undefined {
    return this.store.getError(path)
  }
  setError(path: string, error: string | undefined): void {
    this.store.setError(path, error)
  }
  get hasErrors(): boolean {
    return this.store.hasErrors
  }

  ////////////////////
  // submission -- only submit if we're error free!!
  ////////////////////
  validateFields(): void {
    Object.values(this.fields).forEach((field) => field?.validate?.())
  }
  submit(): void {
    // Have all fields check their validation, whether touched or not
    this.validateFields()
    // TODO: focus in first error field!
    if (this.hasErrors) return
    this.props.onSubmit?.(this.raw)
  }

  ////////////////////
  // rendering
  ////////////////////

  render() {
    if (this.props.debug) console.info("Rendering form")
    const { store, value, children, onSubmit, debug, ...props } = this.props
    // Re-enhance children on every render (rather than freezing a snapshot from the first render) so that
    // non-Field children computed from reactive values (e.g. a plain `<Button disabled={...}>`) pick up
    // fresh props each time our parent re-renders us with new `children`. `enhanceField()`/`React.cloneElement()`
    // reuse each child's existing `key`, so Field component instances stay mounted across renders.
    return <SUI.Form {...props}>{this.enhanceFields(children)}</SUI.Form>
  }
}

//
//
//
//
//
//
let fieldId = 0

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

const FieldWrapper = view(
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

/////////////////////
// Field components
/////////////////////

export const Input = WithField(SUI.Form.Input)

export const Output = WithField(SUI.Form.Input, { readonly: true })

export class Checkbox extends FieldWrapper {
  get Component() {
    return SUI.Form.Checkbox
  }
  getValueProps = () => {
    return {
      checked: !!this.getValue() || false,
      error: this.getError()
    }
  }
  getElementValue = () => {
    return !!(this.getHtmlElement() as HTMLInputElement | undefined)?.checked
  }
}

/**
 * `Select` field component (based on SUIForm.dropdown).
 * TODO: normalize `options` (as state?)
 * TODO: auto-support for `allowAdditions` and `onAddItem()`
 * TODO: `autoFocus` (set: `search:true, searchInput:{{ autoFocus: true }}`)
 */
export class Select extends FieldWrapper {
  get Component() {
    return SUI.Form.Dropdown
  }
  static defaultProps = {
    selection: true,
    lazyLoad: true
  }
  /**
   * Non-standard way to get element value `onChange()`...
   */
  getEventValue(_event: React.ChangeEvent<HTMLInputElement>, select: { value: unknown }) {
    return select.value
  }
}

/////////////////////
// WithForm wrapper
/////////////////////

export function WithForm<P extends object>(Component: ReactComponentType<P>) {
  const formComponent = view(Component) as ReactComponentType<P> & { injectForm?: boolean }
  formComponent.injectForm = true
  return formComponent
}

/////////////////////
// WithForm components
/////////////////////

export type WithFormProps = {
  form: Form<Record<string, unknown>>
  path?: string
}

/**
 * Submit button, disabled when `form` is invalid.
 */
export const SubmitButton = WithForm(function SubmitButton(props: WithFormProps & Record<string, unknown>) {
  const { form, path, ...btnProps } = props
  return <SUI.Button primary {...btnProps} disabled={form.hasErrors} onClick={() => form.submit()} />
})

/**
 * FormGroup:
 * - set `name` to scope children's paths.
 */
export const FormGroup = WithForm(function FormGroup(props: WithFormProps & Record<string, unknown>) {
  const { form, path, ...groupProps } = props
  return <SUI.Form.Group data-path={path} {...groupProps} />
})

/** Anything with a `.map()` method, e.g. a plain array or a spellCore `List`. */
type Mappable = { map<T>(callback: (item: unknown, index: number) => T): T[] }

function isMappable(value: unknown): value is Mappable {
  return typeof (value as Partial<Mappable> | null)?.map === "function"
}

/**
 * FormRepeat:
 * - repeat children for form array value
 * TODO: how to render array index in child?
 */
export const FormRepeat = WithForm(
  class FormRepeat extends React.Component<WithFormProps & { children?: ReactNode }> {
    render() {
      const { form, path, children } = this.props
      const arrayValue = path ? form.getValue(path) : undefined
      if (!isMappable(arrayValue)) return null

      return arrayValue.map((_, index) => {
        const itemPath = `${path}[${index}]`
        const kids = recursivelyMapChildren(children, (child, key) => {
          const type = child.type as { injectForm?: boolean }
          if (!type?.injectForm || !child.props.path) return child
          const childPath = (child.props.path as string).substr((path as string).length)
          return React.cloneElement(child, {
            key,
            path: itemPath + childPath
          })
        })
        // console.warn(children, kids)
        return React.createElement(SUI.Form.Group, { key: index, "data-path": itemPath }, ...kids)
      })
    }
  }
)
