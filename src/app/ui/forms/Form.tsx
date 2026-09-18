//
//  ## `<Form>` itself, plus the reactive store backing it.
//
//  NOTE: this file knows nothing about fields -- `./wrappers` and `./components` depend on it,
//  never the other way round.  Keep that direction so the folder stays acyclic.
//

import React from "react"
import cloneDeep from "lodash/cloneDeep"
import * as SUI from "semantic-ui-react"

import { createStore } from "~/util"

import { spellCore } from "~/spellCore"

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

export type FormProps<V extends object> = Omit<SUI.FormProps, "onSubmit"> & {
  /** Existing store to use, e.g. one created outside the `<Form>` via `makeFormStore()`. */
  store?: FormStore<V>
  /** Initial form value, used to create a store if `store` isn't passed. */
  value?: V
  /** Called with the form's raw POJO value on successful submission. */
  onSubmit?: (raw: V) => void
  debug?: boolean
}
/** Minimal duck-type for a mounted field, as registered in `form.fields`. */
type MountedField = {
  forceUpdate?: () => void
  validate?: () => void
}

/**
 * Create a react-easy-state `store` for use in a form with form `value`.
 * See `FormStore` for details.
 */
export function makeFormStore<V extends object>(value: V): FormStore<V> {
  const formStore: FormStore<V> = createStore<FormStore<V>>({
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

/**
 * Reactive store backing a `<Form>`.
 * - Holds the editable `value` plus per-path validation `errors`.
 * - `raw` is the un-proxied value, for reading without subscribing.
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
