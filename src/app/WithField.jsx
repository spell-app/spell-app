import React from "react"
import _get from "lodash/get"
import _set from "lodash/set"
import { store, view, batch } from "@risingstack/react-easy-state"

import { Form as SUIForm, Button as SUIButton } from "semantic-ui-react"

function recursiveMapChildren(children, callback) {
  const count = React.Children.count(children)
  if (count === 0) return undefined
  const kids = count === 1 ? [children] : React.Children.toArray(children)
  return kids.map((child, index) => {
    if (!React.isValidElement(child)) return child
    if (child.props.children) {
      const newKids = recursiveMapChildren(child.props.children, callback)
      if (newKids !== child.props.children)
        child = React.cloneElement(child, { key: child.key || index, children: newKids })
    }
    return callback(child, child.key || index)
  })
}

export class Form extends React.Component {
  // Create react-easy-state store on construction
  store = store({
    value: this.props.value,
    fields: [],
    errors: {},
    isSubmitting: false
  })

  ////////////////////
  // upgrade children to point back to us as their `form`???
  // TODO: we're assuming children never change???
  ////////////////////
  enhanceField = (child, key) => {
    if (!child.type?.isFieldWrapper) return child
    console.warn("enhancing", { type: child.type, child })
    if (child.props.form === this) console.warn("enhanceField(): form is already set!", child)
    return React.cloneElement(child, { key, form: this })
  }
  kids = recursiveMapChildren(this.props.children, this.enhanceField)

  ////////////////////
  // `value` API for children
  ////////////////////
  getValue = (path) => {
    return _get(this.store.value, path)
  }

  // NOTE: look at `this.errors[path]` to get current error
  setValue = (path, value) => {
    // forget it if no change
    if (value === this.getValue(path)) return
    // update!!!
    _set(this.store.value, path, value)
    console.info("form.setValue(", { form: this, path, value, type }, "): after:", this.store)
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
    // this.fields.forEach(field => field.validate())
    if (!this.hasErrors) this.props.onSubmit(this.store.value)
    this.store.isSubmitting = false
  }

  ////////////////////
  // rendering
  ////////////////////

  render() {
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
class FieldWrapper extends React.Component {
  static isFieldWrapper = true

  id = `spell-field-${UI.fieldId++}`
  get form() {
    return this.props.form
  }
  get value() {
    return this.form.getValue(this.props.path)
  }
  get error() {
    return this.form.getError(this.props.path)
  }
  get element() {
    return document.getElementById(this.id)
  }
  validate = (value = this.value) => {
    let error = this.element?.validationMessage
    if (!error && this.props.required && (this.form.isSubmitting || this.touched) && value === "") {
      error = "This field is required."
    }
    if (error !== this.error) {
      this.form.setError(this.props.path, error)
      this.forceUpdate()
    }
  }
  touched = false
  fieldProps = {
    id: this.id,
    onChange: (event) => {
      let value = event.target.value
      if (value === "") value = undefined
      else if (this.props.type === "number" || this.props.type === "range") value = parseFloat(value, 10)
      if (value === this.value) return
      batch(() => {
        this.validate(value)
        this.form.setValue(this.props.path, value)
      })
    },
    onBlur: () => {
      this.touched = true
      this.validate()
    },
    onKeyUp: ({ key }) => {
      if (key === "Enter" && this.props.submitOnEnter) this.form.submit()
    }
  }
  render() {
    console.info("rendering field", this.props)
    const { form, path, submitOnEnter, ...elementProps } = this.props
    return React.createElement(this.Component, {
      ...elementProps,
      ...this.fieldProps,
      defaultValue: this.value || "",
      error: this.error
    })
  }
}

export function WithField(Component) {
  const _view = view(Component)
  return class WithField extends FieldWrapper {
    static isFieldWrapper = true
    get Component() {
      return _view
    }
  }
}

export const Input = WithField(SUIForm.Input)

export const SubmitButton = view(function SubmitButton({ ...props }) {
  const { form, ...btnProps } = props
  return <SUIButton primary {...btnProps} disabled={form.hasErrors} onClick={() => form.submit()} />
})
SubmitButton.isFieldWrapper = true
