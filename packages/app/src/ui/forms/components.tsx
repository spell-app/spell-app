/** @jsxImportSource react */
//
//  ## The actual form field / layout components.
//
//  NOTE: built on `./wrappers`, which is intentionally not part of the public `$/app/ui` surface.
//

import React from "react"
import * as SUI from "semantic-ui-react"

import { F } from "$/app/ui/forms"

/////////////////////
// ## Wrapped simple fields
/////////////////////

/****************
 * ### `<Input>`
 * `SUI.Form.Input` wrapped as a `Field` -- see `F.WithField()`.
 ****************/
export const Input = F.WithField(SUI.Form.Input)

/****************
 * ### `<Output>`
 * `<Input>`, but readonly by default -- for showing a field-styled value with no editing.
 ****************/
export const Output = F.WithField(SUI.Form.Input, { readonly: true })

/****************
 * ### `<Checkbox>`
 * `SUI.Form.Checkbox` wrapped as a `Field`.  Overrides value handling because SUI's checkbox uses
 * `checked`/`onChange(e, { checked })` rather than the `value`/`onChange(e)` every other field uses.
 ****************/
export class Checkbox extends F.FieldWrapper {
  get Component() {
    return SUI.Form.Checkbox
  }
  /** `checked` (not `value`) is what `SUI.Form.Checkbox` wants. */
  getValueProps = () => {
    return {
      checked: !!this.getValue() || false,
      error: this.getError()
    }
  }
  /** Read the DOM checkbox's `checked` state, since it isn't in `onChange()`'s event args. */
  getElementValue = () => {
    return !!(this.getHtmlElement() as HTMLInputElement | undefined)?.checked
  }
}

/****************
 * ### `<Select>`
 * `SUI.Form.Dropdown` wrapped as a `Field`.
 * TODO: normalize `options` (as state?)
 * TODO: auto-support for `allowAdditions` and `onAddItem()`
 * TODO: `autoFocus` (set: `search:true, searchInput:{{ autoFocus: true }}`)
 ****************/
export class Select extends F.FieldWrapper {
  get Component() {
    return SUI.Form.Dropdown
  }
  /** Default to a single-select dropdown that lazy-loads its menu. */
  static defaultProps = {
    selection: true,
    lazyLoad: true
  }
  /** SUI's dropdown passes `(event, { value })`, not a plain DOM change event -- read `value` off `select`. */
  getEventValue(_event: React.ChangeEvent<HTMLInputElement>, select: { value: unknown }) {
    return select.value
  }
}

/****************
 * ### `<SubmitButton>`
 * Submit button, disabled when `form` has errors.  Injected `form`/`path` come from `F.WithForm()`.
 ****************/
export const SubmitButton = F.WithForm(function SubmitButton(props: F.WithFormProps & Record<string, unknown>) {
  const { form, path, ...btnProps } = props
  return <SUI.Button primary {...btnProps} disabled={form.hasErrors} onClick={() => form.submit()} />
})

/****************
 * ### `<FormGroup>`
 * `SUI.Form.Group` that scopes its children's field `path`s under its own `name`.
 ****************/
export const FormGroup = F.WithForm(function FormGroup(props: F.WithFormProps & Record<string, unknown>) {
  const { form, path, ...groupProps } = props
  return <SUI.Form.Group data-path={path} {...groupProps} />
})

/////////////////////
// ## FormRepeat -- repeat a set of children elements
/////////////////////

/****************
 * ### `<FormRepeat>`
 * Repeat `children` once per entry of the form array value at `path`, rewriting each descendant
 * field's `path` to point at that array entry (`<path>[<index>].<rest>`).
 * TODO: how to render array index in child?
 ****************/
export const FormRepeat = F.WithForm(
  class FormRepeat extends React.Component<F.WithFormProps & { children?: ReactNode }> {
    /** Render one `SUI.Form.Group` per array entry, with `children` cloned to point at that entry's `path`. */
    render() {
      const { form, path, children } = this.props
      const arrayValue = path ? (form.getValue(path) as Array<any>) : undefined
      if (!arrayValue || typeof arrayValue["map"] !== "function") {
        return null
      }

      return arrayValue.map((_, index) => {
        const itemPath = `${path}[${index}]`
        const kids = FormRepeat.recursivelyMapChildren(children, (child, key) => {
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

    /**
     * Walk `children` recursively, replacing each element with `callback(child, key)`'s result,
     * then recursing into whatever children that result has.
     */
    static recursivelyMapChildren(
      children: ReactNode,
      callback: (child: ReactElement, key: string | number) => ReactElement
    ): ReactNode[] {
      return React.Children.toArray(children).map((child, index) => {
        if (!React.isValidElement(child)) return child
        let result = callback(child, child.key || index)
        if (result.props.children) {
          const newKids = FormRepeat.recursivelyMapChildren(result.props.children, callback)
          if (newKids !== result.props.children)
            result = React.cloneElement(result, { key: result.key || index, children: newKids })
        }
        return result
      })
    }
  }
)
