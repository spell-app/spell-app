import React from "react"
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

export class Form extends React.Component {
  // Create react-easy-state store on construction
  store = store({
    value: this.props.value,
    errors: {}
  })

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
  getValue = (path) => {
    return spellCore.getPath(this.store.value, path)
  }

  // NOTE: look at `this.store.errors[path]` to get current error
  setValue = (path, value) => {
    // forget it if no change
    // if (value === this.getValue(path)) return
    // update!!!
    spellCore.setPath(this.props.value, path, value)
    spellCore.setPath(this.store.value, path, value)
    if (this.props.debug) {
      console.info(
        "form.setValue(",
        { form: this, path, value },
        "): props.value after:\n",
        JSON.stringify(this.props.value, null, "  ")
      )
    }
    this.updateFields()
  }

  ////////////////////
  // errors API as a FLAT object (e.g. no nesting of paths)
  ////////////////////
  getError(path) {
    return this.store.errors[path]
  }
  setError(path, error) {
    if (!error) delete this.store.errors[path]
    else this.store.errors[path] = error
    // this.updateFields()
  }
  get hasErrors() {
    return Object.keys(this.store.errors).length > 0
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
    this.props.onSubmit(this.props.value)
  }

  ////////////////////
  // rendering
  ////////////////////

  render() {
    console.info("Rendering form")
    window.form = this
    const { children, value, onSubmit, debug, ...props } = this.props
    return <SUIForm {...props}>{this.kids}</SUIForm>
  }
}

//
//
//
//
//
//
const FieldWrapper = view(
  class FieldWrapper extends React.Component {
    static injectForm = true

    /** Generate a unique id for this field. */
    id = `spell-field-${UI.fieldId++}`

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
     * Return the current value according to our html element.
     * Override this if you have an exotic way to get the value.
     * Coerce to appropriate output type or `undefined`.
     */
    getElementValue() {
      const value = this.getHtmlElement()?.value
      if (value === "") return undefined
      const { type } = this.props
      if (type === "number" || type === "range") return parseFloat(value, 10)
      return value
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

    /** Properties to pass to component we render. */
    fieldProps = {
      id: this.id,
      onChange: () => {
        console.info("onChange", this)
        const value = this.getValue()
        const elementValue = this.getElementValue()
        if (value !== elementValue) this.setValue(elementValue)
        this.validate()
      },
      onBlur: () => {
        console.info("onBlur", this)
        this.validate()
      },
      onKeyUp: ({ key }) => {
        console.info("onKeyUp", this)
        this.validate()
        if (key !== "Enter") return
        const { submitOnEnter, form, onEnter } = this.props
        if (submitOnEnter && form) form.submit()
        else if (onEnter) onEnter(this.getElementValue())
      }
    }

    /** Return props to set `value` and `error` according to this component. */
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
// TODO: Output => <Input readOnly .../>

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
