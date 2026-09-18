//
//  ## The actual form field / layout components.
//
//  NOTE: built on `./wrappers`, which is intentionally not part of the public `~/app/ui` surface.
//

import React from "react"
import * as SUI from "semantic-ui-react"

import { FieldWrapper, WithField, WithForm, recursivelyMapChildren, type WithFormProps } from "./wrappers"

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

/** Narrow an unknown form value to something `<FormRepeat>` can iterate. */
function isMappable(value: unknown): value is Mappable {
  return typeof (value as Partial<Mappable> | null)?.map === "function"
}

/** Anything with a `.map()` method, e.g. a plain array or a spellCore `List`. */
type Mappable = { map<T>(callback: (item: unknown, index: number) => T): T[] }
