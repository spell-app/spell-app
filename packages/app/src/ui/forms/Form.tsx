/** @jsxImportSource react */
//
//  ## `<Form>` itself, plus the reactive store backing it.
//
//  NOTE: this file knows nothing about fields -- `./wrappers` and `./components` depend on it,
//  never the other way round.  Keep that direction so the folder stays acyclic.
//

import React from "react"
import * as SUI from "semantic-ui-react"

import { F } from "$/app/ui/forms"

/****************
 * ### `<Form>`
 * Wraps `SUI.Form`, walking `children` to wire `form`/`path` props into any field whose type declares
 * static `injectForm` (see `F.WithField()` / `F.WithForm()`), and backing them all with a shared
 * `F.FormStore`.
 ****************/
export class Form<V extends object> extends React.Component<FormProps<V>> {
  /**
   * Create react-easy-state store on construction.
   * NOTE: to get a handle to the store OUTSIDE the `<Form>`, do:
   *       `myStore = makeFormStore()`
   *       `return <Form store={myStore}... />`
   */
  store: F.FormStore<V> = this.props.store || F.makeFormStore(this.props.value ?? ({} as V))

  /**
   * Walk `children` recursively, calling `enhanceField()` on each element so it points back to us as
   * its `form`.
   * TODO: we're assuming children never change???
   */
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

  /**
   * Clone `child` with `form`/`path` props injected, if its type declares static `injectForm`
   * (see `F.WithField()` / `F.WithForm()`).  Non-field children pass through unchanged.
   * - `parentPath` scopes a nested field's dotted `path` under any enclosing `<F.FormGroup name=...>`.
   */
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

  /** Map of `{ <fieldId>: <fieldWrapper> }`, set up when fields render (see `FieldWrapper.render()`). */
  fields: Record<string, MountedField> = {}

  /** Have our fields re-render. */
  updateFields() {
    Object.values(this.fields).forEach((field) => field.forceUpdate?.())
  }

  ////////////////////
  // ## `value` API for children
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
  // ## Errors API as a FLAT object (e.g. no nesting of paths)
  ////////////////////

  /** Reactively get the error for a field by nested `path`. */
  getError(path: string): string | undefined {
    return this.store.getError(path)
  }
  /** Reactively set the error for a field by nested `path`.  `undefined` clears it. */
  setError(path: string, error: string | undefined): void {
    this.store.setError(path, error)
  }
  /** Whether any field currently has an error. */
  get hasErrors(): boolean {
    return this.store.hasErrors
  }

  ////////////////////
  // ## Submission -- only submit if we're error free!!
  ////////////////////

  /** Force every mounted field to (re)validate, whether touched or not. */
  validateFields(): void {
    Object.values(this.fields).forEach((field) => field?.validate?.())
  }
  /** Validate all fields, then call `props.onSubmit(raw)` unless any field has an error. */
  submit(): void {
    // Have all fields check their validation, whether touched or not
    this.validateFields()
    // TODO: focus in first error field!
    if (this.hasErrors) return
    this.props.onSubmit?.(this.raw)
  }

  ////////////////////
  // ## Rendering
  ////////////////////

  /** Render `SUI.Form` wrapping `enhanceFields(children)`. */
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

/** Props for `<Form>`. */
export type FormProps<V extends object> = Omit<SUI.FormProps, "onSubmit"> & {
  /** Existing store to use, e.g. one created outside the `<Form>` via `makeFormStore()`. */
  store?: F.FormStore<V>
  /** Initial form value, used to create a store if `store` isn't passed. */
  value?: V
  /** Called with the form's raw POJO value on successful submission. */
  onSubmit?: (raw: V) => void
  /** Log field renders / value changes / submit to the console. */
  debug?: boolean
}
/** Minimal duck-type for a mounted field, as registered in `form.fields`. */
type MountedField = {
  /** Force the field to re-render, e.g. after `form.setValue()`. */
  forceUpdate?: () => void
  /** Re-run the field's validation, e.g. from `form.validateFields()`. */
  validate?: () => void
}
