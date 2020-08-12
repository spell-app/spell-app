import React from "react"
import _get from "lodash/get"
import _set from "lodash/set"
import { store, view } from "@risingstack/react-easy-state"

import { Form as SUIForm, Button as SUIButton } from "semantic-ui-react"

import { UIError } from "~/util"

// Generic function to recursively map children
// function recursivelyMapChildren(children, callback) {
//   const count = React.Children.count(children)
//   const kids = count === 1 ? [children] : React.Children.toArray(children)
//   return kids.map((child, index) => {
//     if (!React.isValidElement(child)) return child
//     if (child.props.children) {
//       const newKids = recursivelyMapChildren(child.props.children, callback)
//       if (newKids !== child.props.children)
//         child = React.cloneElement(child, { key: child.key || index, children: newKids })
//     }
//     return callback(child, child.key || index)
//   })
// }

export class Form extends React.Component {
  // Create react-easy-state store on construction
  store = store({
    value: this.props.value,
    errors: {},
    isSubmitting: false
  })

  ////////////////////
  // upgrade children to point back to us as their `form`???
  // TODO: we're assuming children never change???
  ////////////////////
  enhanceFields = (children, parentPath = "") => {
    const count = React.Children.count(children)
    const kids = count === 1 ? [children] : React.Children.toArray(children)
    return kids.map((child, index) => {
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
    // if component specifies `name` or `field`, set its path
    const name = child.props.name
    if (name) props.path = parentPath ? `${parentPath}.${name}` : name

    const clone = React.cloneElement(child, props)
    console.warn("enhancing", { props, clone })
    return clone
  }
  joinPath = (parentPath, childField) => {
    if (!childField) return parentPath
    if (!parentPath) return childField
    return `${parentPath}.${childField}`
  }
  fields = {}
  kids = this.enhanceFields(this.props.children)

  ////////////////////
  // `value` API for children
  ////////////////////
  getValue = (path) => {
    return _get(this.store.value, path)
  }

  // NOTE: look at `this.store.errors[path]` to get current error
  setValue = (path, value) => {
    // forget it if no change
    if (value === this.getValue(path)) return
    // update!!!
    _set(this.props.value, path, value)
    console.info("form.setValue(", { form: this, path, value }, "): after:", this.store)
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
  }
  get hasErrors() {
    return Object.keys(this.store.errors).length > 0
  }

  ////////////////////
  // submission -- only submit if we're error free!!
  ////////////////////
  submit() {
    this.store.isSubmitting = true
    // TODO: focus in error field!
    Object.values(this.fields).forEach((field) => field?.validate?.())
    // this.fields.forEach(field => field.validate())
    if (!this.hasErrors) this.props.onSubmit(this.props.value)
    this.store.isSubmitting = false
  }

  ////////////////////
  // rendering
  ////////////////////

  render() {
    console.info("Rendering form")
    window.form = this
    const { children, value, onSubmit, ...props } = this.props
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
    /** Pointer back to our `form`, passed as `props`. */
    get form() {
      return this.props.form
    }
    /** Syntactic sugar for our `path` */
    get path() {
      return this.props.path
    }
    /** Form `value` for this field according to our `path`. */
    get value() {
      const { form, path } = this
      if (form && path) return form.getValue(path)
      return this.props.value
    }
    /** Update the `value`. Override in your subclass if necessary. */
    set value(value) {
      const { form, path } = this
      if (form && path) form.setValue(path, value)
      else this.props.onChange(value)
    }
    /** Form `error` for this field according to our `path`. */
    get error() {
      const { form, path } = this
      if (form && path) return form.getError(path)
      return this._error
    }
    /** Update the `error`. Override in your subclass if necessary. */
    set error(error) {
      if (error === this.error) return
      const { form, path } = this
      if (form && path) return form.setError(path, error)
      else {
        this._error = error
        this.forceUpdate()
      }
    }
    /** Pointer to HTML `<input>` etc element. */
    get htmlElement() {
      return document.getElementById(this.id)
    }
    /**
     * Return the current value according to our html element.
     * Override this if you have an exotic way to get the value.
     * Coerce to appropriate output type or `undefined`.
     */
    get elementValue() {
      const value = this.htmlElement?.value
      if (value === "") return undefined
      const { type } = this.props
      if (type === "number" || type === "range") return parseFloat(value, 10)
      return value
    }

    /**
     * Validate the current value, setting form error if invalid.
     * Currently uses DOM `element.validationMessage`.
     * TODO: custom validators.
     * TODO: custom validation messages.
     */
    validate = () => {
      // get validationMessage from HTML element ???
      let error = this.htmlElement?.validationMessage
      if (error !== this.error) this.error = error
    }
    /** Properties to pass to component we render. */
    fieldProps = {
      id: this.id,
      onChange: () => {
        let { elementValue } = this
        if (elementValue === this.value) return
        this.validate()
        this.value = elementValue
      },
      onBlur: () => {
        this.validate()
      },
      onKeyUp: ({ key }) => {
        if (key === "Enter" && this.props.submitOnEnter && this.form) this.form.submit()
        else this.validate()
      }
    }
    /** Remove us from `form.fields` on unmount. */
    componentWillUnmount() {
      const { form, path } = this
      if (form && path) delete form.fields[path]
    }
    render() {
      console.info("rendering field", this, this.props)
      // take out props we've added
      const { form, field, path, submitOnEnter, onChange, ...elementProps } = this.props

      if (!(form && path) && !onChange) {
        const error = new UIError({
          message: "Error rendering Field: you must either specify `name` and wrap in a <Form> or provide `onChange`",
          context: this,
          activity: "rendering",
          params: this.props
        })
        console.error(error.message, this.props)
      }

      // add us to our form's `fields` on render
      if (path && form) form.fields[path] = this

      // validate right after render
      // this is not optimal, but it makes SubmitButton semantics work out
      setTimeout(this.validate, 0)

      return React.createElement(this.Component, {
        ...elementProps,
        ...this.fieldProps,
        defaultValue: this.value || "", // must not be `undefined`!
        error: this.error
      })
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
export const Checkbox = WithField(SUIForm.Checkbox)
// TODO: Output => <Input readOnly .../>

/////////////////////
// Formulaic components
/////////////////////

// export const FormWrapper = view(
//   class FormWrapper extends React.Component {
//     get form() {
//       return this.props.form
//     }
//     get path() {
//       return this.props.path
//     }
//     render() {
//       const { form, field, path, ...elementProps } = this.props
//       return React.createElement(this.Component, elementProps)
//     }
//   }
// )

// /** Take an ordinary `Component` and set it up to point to a `form`,
//  * adding the following props on `instantiation`:
//  *  `{ form, path }`
//  * It will be reactive, meaning it will redraw when accessed form properties change.
//  */
// export function WithForm(Component) {
//   return class WithForm extends FormWrapper {
//     get Component() {
//       return Component
//     }
//   }
// }

export function WithForm(Component) {
  const formComponent = view(Component)
  formComponent.injectForm = true
  return formComponent
}

/**
 * Submit button, disabled when `form` is invalid.
 */
export const SubmitButton = WithForm(function SubmitButton(props) {
  const { form, field, path, ...btnProps } = props
  return <SUIButton primary {...btnProps} disabled={form.hasErrors} onClick={() => form.submit()} />
})

/** FormGroup: can set `field` to scope children. */
export const FormGroup = WithForm(function FormGroup(props) {
  const { form, field, path, ...groupProps } = props
  return <SUIForm.Group {...groupProps} />
})
