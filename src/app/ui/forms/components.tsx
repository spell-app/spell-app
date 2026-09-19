//
//  ## The actual form field / layout components.
//
//  NOTE: built on `./wrappers`, which is intentionally not part of the public `~/app/ui` surface.
//

import React from "react"
import * as SUI from "semantic-ui-react"

import { F } from "~/app/ui/forms"

/////////////////////
// Wrapped simple fields
/////////////////////

export const Input = F.WithField(SUI.Form.Input)

export const Output = F.WithField(SUI.Form.Input, { readonly: true })

export class Checkbox extends F.FieldWrapper {
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
export class Select extends F.FieldWrapper {
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
export const SubmitButton = F.WithForm(function SubmitButton(props: F.WithFormProps & Record<string, unknown>) {
  const { form, path, ...btnProps } = props
  return <SUI.Button primary {...btnProps} disabled={form.hasErrors} onClick={() => form.submit()} />
})

/**
 * FormGroup:
 * - set `name` to scope children's paths.
 */
export const FormGroup = F.WithForm(function FormGroup(props: F.WithFormProps & Record<string, unknown>) {
  const { form, path, ...groupProps } = props
  return <SUI.Form.Group data-path={path} {...groupProps} />
})

/////////////////////
// FormRepeat -- repeat a set of children elements
/////////////////////

/**
 * FormRepeat:
 * - repeat children for form array value
 * TODO: how to render array index in child?
 */
export const FormRepeat = F.WithForm(
  class FormRepeat extends React.Component<F.WithFormProps & { children?: ReactNode }> {
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
