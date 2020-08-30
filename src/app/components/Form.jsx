import React from "react"
import cloneDeep from "lodash/cloneDeep"
import { store, view } from "@risingstack/react-easy-state"

import { Form as SUIForm, Button as SUIButton } from "semantic-ui-react"

import { UIError } from "~/util"

// Generic function to recursively map children
function recursivelyMapChildren(children, callback) {
  return React.Children.toArray(children).map((child, index) => {
    if (!React.isValidElement(child)) return child
    child = callback(child, child.key || index)
    if (child.props.children) {
      const newKids = recursivelyMapChildren(child.props.children, callback)
      if (newKids !== child.props.children)
        child = React.cloneElement(child, { key: child.key || index, children: newKids })
    }
    return child
  })
}

/**
 * Create a react-easy-state `store` for use in a form with form `value`.
 * Note that modifying the form will NOT update the `value` passed in directly!
 * Access properties as `formState.value.x.y.z` or `formState.getValue("x.y.z")`.
 *
 * Note that either of the above returns a `Proxy` object for an object or array value,
 * use `formState.raw.x.y.z` to get a POJO representation,
 * but be aware that accessing it this way will NOT be reactive!
 *
 * Set values as `formState.setValue("x.y.z", 10)` or `formState.value.x.y.z = 10`.
 *
 * Returned store has methods to `getValue(path)/setValue(path,value)`) by dotted path.
 * Also has `errors`/`hasErrors`/`getError(path)`/`setError(path,error)` with FLATTENED dotted path.
 */
export function makeFormStore(value) {
  const formStore = store({
    value,
    get raw() {
      return cloneDeep(value)
    },
    getValue(path) {
      return spellCore.getPath(formStore.value, path)
    },
    setValue(path, value) {
      spellCore.setPath(formStore.value, path, value)
    },
    errors: {},
    getError(path) {
      return formStore.errors[path]
    },
    setError(path, error) {
      if (error) formStore.errors[path] = error
      else delete formStore.errors[path]
    },
    get hasErrors() {
      return Object.keys(formStore.errors).length > 0
    }
  })
  // console.warn(formStore)
  return formStore
}

export class Form extends React.Component {
  /**
   * Create react-easy-state store on construction
   * NOTE: to get a handle to the store OUTSIDE the <Form>, do:
   *       `myStore = makeFormStore()`
   *       `return <Form store={myStore}... />`
   */
  store = this.props.store || makeFormStore(this.props.value)

  ////////////////////
  // upgrade children to point back to us as their `form`???
  // TODO: we're assuming children never change???
  ////////////////////
  enhanceFields = (children, parentPath = "") => {
    return React.Children.toArray(children).map((child, index) => {
      if (!React.isValidElement(child)) return child
      child = this.enhanceField(child, child.key || index, parentPath)
      if (child.props.children) {
        const newKids = this.enhanceFields(child.props.children, child.props.path || parentPath)
        if (newKids !== child.props.children)
          child = React.cloneElement(child, { key: child.key || index, children: newKids })
      }
      return child
    })
  }
  enhanceField = (child, key, parentPath) => {
    if (!child.type?.injectForm) return child
    if (child.props.form === this) console.warn("enhanceField(): form is already set!", child)
    const props = { key, form: this }

    // if component specifies `name`, set its path
    const name = child.props.name
    if (name) props.path = parentPath ? `${parentPath}.${name}` : name

    const clone = React.cloneElement(child, props)
    // console.info("enhancing", { props, clone })
    return clone
  }

  // On initial render, enhance descendent fields.
  // ASSUMES that fields will not change on re-render!!
  kids = this.enhanceFields(this.props.children)

  // Map of `{ <fieldId>: <fieldWrapper> }` set up when fields render.
  fields = {}

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
  get raw() {
    return this.store.raw
  }

  /**
   * Reactively get a value by nested `path`.
   */
  getValue(path) {
    return this.store.getValue(path)
  }

  /**
   * Reactively set a `value` by nested `path`.
   */
  setValue(path, value) {
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
  getError(path) {
    return this.store.getError(path)
  }
  setError(path, error) {
    this.store.setError(path, error)
  }
  get hasErrors() {
    return this.store.hasErrors
  }

  ////////////////////
  // submission -- only submit if we're error free!!
  ////////////////////
  validateFields() {
    Object.values(this.fields).forEach((field) => field?.validate?.())
  }
  submit() {
    // Have all fields check their validation, whether touched or not
    this.validateFields()
    // TODO: focus in first error field!
    if (this.hasErrors) return
    this.props.onSubmit(this.props.raw)
  }

  ////////////////////
  // rendering
  ////////////////////

  render() {
    if (this.props.debug) console.info("Rendering form")
    window.form = this // DEBUG
    const { store, value, children, onSubmit, debug, ...props } = this.props
    return <SUIForm {...props}>{this.kids}</SUIForm>
  }
}

//
//
//
//
//
//
let fieldId = 0
const FieldWrapper = view(
  class FieldWrapper extends React.Component {
    static injectForm = true

    /**
     * Generate a unique id for this field.
     * We'll use this to link the field with its label, etc.
     */
    id = `spell-field-${fieldId}`

    /** Form `value` for this field according to our `path`. */
    getValue() {
      const { form, path } = this.props
      if (form && path) return form.getValue(path)
      return this.props.value
    }
    /** Update the `value`. Override in your subclass if necessary. */
    setValue(value) {
      const { form, path } = this.props
      if (form && path) form.setValue(path, value)
      else {
        this.props.onChange(value)
        this.forceUpdate()
      }
    }

    /** Form `error` for this field according to our `path`. */
    getError() {
      const { form, path } = this.props
      if (form && path) return form.getError(path)
      return this._error
    }
    /** Update the `error`. Override in your subclass if necessary. */
    setError(error) {
      if (error === this.getError()) return
      const { form, path } = this.props
      if (form && path) return form.setError(path, error)
      else {
        this._error = error
        this.forceUpdate()
      }
    }

    /** Pointer to HTML `<input>` etc element. */
    getHtmlElement() {
      return document.getElementById(this.id)
    }

    /**
     * Validate the current value, setting form error if invalid.
     * Currently uses DOM `element.validationMessage`.
     * TODO: custom validators.
     * TODO: custom validation messages for DOM errors.
     */
    validate = () => {
      // get validationMessage from HTML element ???
      const error = this.getHtmlElement()?.validationMessage
      this.setError(error)
    }

    /**
     * Given `onChange()` arguments, return the current element value.
     */
    getEventValue(event) {
      // console.info("getEventValue", ...arguments)
      const { value } = event.target
      const { type } = this.props
      if (type === "number" || type === "range") return parseFloat(value, 10)
      return value
    }

    /** Properties to pass to component we render. */
    fieldProps = {
      id: this.id,
      onChange: (...args) => {
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
      onKeyUp: ({ key }) => {
        if (this.props.form?.props.debug) console.info("onKeyUp", this)
        this.validate()
        if (key !== "Enter") return
        const { submitOnEnter, form, onEnter } = this.props
        if (submitOnEnter && form) form.submit()
        else if (onEnter) onEnter(this.getValue())
      }
    }

    /**
     * Return props to for field `value` and `error` as they should be passed to the rendered component.  If a subclass sets a different property
     * Some subclasses will set other properties, e.g. `checkbox` sets `{ checked, error }` instead.
     */
    getValueProps() {
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
export function WithField(Component) {
  return class WithField extends FieldWrapper {
    get Component() {
      return Component
    }
  }
}

/////////////////////
// Field components
/////////////////////

export const Input = WithField(SUIForm.Input)

export const Output = WithField(SUIForm.Input)
Output.defaultProps = { readonly: true }

export class Checkbox extends FieldWrapper {
  get Component() {
    return SUIForm.Checkbox
  }
  getValueProps = () => {
    return {
      checked: !!this.getValue() || false,
      error: this.getError()
    }
  }
  getElementValue = () => {
    return !!this.getHtmlElement()?.checked
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
    return SUIForm.Dropdown
  }
  static defaultProps = {
    selection: true,
    lazyLoad: true
  }
  /**
   * Non-standard way to get element value `onChange()`...
   */
  getEventValue(event, select) {
    return select.value
  }
}

/////////////////////
// WithForm wrapper
/////////////////////

export function WithForm(Component) {
  const formComponent = view(Component)
  formComponent.injectForm = true
  return formComponent
}

/////////////////////
// WithForm components
/////////////////////

/**
 * Submit button, disabled when `form` is invalid.
 */
export const SubmitButton = WithForm(function SubmitButton(props) {
  const { form, path, ...btnProps } = props
  return <SUIButton primary {...btnProps} disabled={form.hasErrors} onClick={() => form.submit()} />
})

/**
 * FormGroup:
 * - set `name` to scope children's paths.
 */
export const FormGroup = WithForm(function FormGroup(props) {
  const { form, path, ...groupProps } = props
  return <SUIForm.Group data-path={path} {...groupProps} />
})

/**
 * FormRepeat:
 * - repeat children for form array value
 * TODO: how to render array index in child?
 */
export const FormRepeat = WithForm(
  class FormRepeat extends React.Component {
    render() {
      const { form, path, children, ...groupProps } = this.props
      const arrayValue = form.getValue(path)
      // TODO: won't work with List etc
      if (typeof arrayValue?.map !== "function") return null

      return arrayValue.map((_, index) => {
        const itemPath = `${path}[${index}]`
        const kids = recursivelyMapChildren(children, (child, key) => {
          if (!child.type?.injectForm || !child.props.path) return child
          let childPath = child.props.path.substr(path.length)
          return React.cloneElement(child, {
            key,
            path: itemPath + childPath
          })
        })
        // console.warn(children, kids)
        return React.createElement(SUIForm.Group, { key: index, "data-path": itemPath }, ...kids)
      })
    }
  }
)
