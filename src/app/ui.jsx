/**
 * Standard app MenuItems to go in app toolbars, so we standardize names etc.
 * e.g.
 *  import { menuItems } from
 *  function Toolbar() {
 *    return (
 *      <Menu>
 *        <menuItems.ProjectDropdown showBorder={false} />
 *        <menuItems.aboutSpell />
 *        <menuItems.Spring />
 *        <menuItems.logIn />
 *      </Menu>
 *  }
 */
import React from "react"
import classnames from "classnames"
import { Button, Card, Container, Dropdown, Grid, Icon, Input, Menu, Modal, Segment } from "semantic-ui-react"

import { view } from "~/util"

import { actions, ActionItem } from "./actions"
import { FileDropdown } from "./FileDropdown"
import { ProjectDropdown, ProjectMenu } from "./ProjectDropdown"
import { store } from "./store"
import * as Form from "./Form"

/**
 * Constructors for standard UI elements.
 */
export const UI = {
  ...Form,

  ActionItem,

  /** Top-level app menu. */
  AppMenu: React.memo((props) => (
    <Menu inverted color="violet" attached className="AppMenu medium-short tight" {...props} />
  )),

  /** Panel menu. */
  PanelMenu: React.memo((props) => (
    <Menu inverted color="purple" attached="top" className="PanelMenu short tight" {...props} />
  )),

  /** SUI Pass-throughs */
  Container,
  Grid,
  Segment,
  Card,
  Button: view(Button),

  /** Left / Center / Right Sub-Menus. */
  Submenu: React.memo(({ left, center, right, spring, children, ...props }) => {
    const style = {}
    if (left || center || right) style.minWidth = "33.3%"
    return (
      <Menu.Menu position={right ? "right" : "left"} style={style} {...props}>
        {spring && (center || right) && <UI.Spring />}
        {children}
        {spring && (center || left) && <UI.Spring />}
      </Menu.Menu>
    )
  }),

  /** Menu header item. */
  MenuHeader: React.memo((props) => <ActionItem header noBorder {...props} />),

  /** `Spring` to eat up space beside objects. */
  Spring: React.memo((props) => <Menu.Item className="spring no-border" {...props} />),

  /** A "..." menu. */
  MoreMenu: React.memo(({ stub, item = true, icon = "ellipsis horizontal", children, ...props }) => {
    if (stub) return <Menu.Item disabled icon={icon} {...props} />
    return (
      <Dropdown item={item} icon={icon} {...props}>
        <Dropdown.Menu>{children}</Dropdown.Menu>
      </Dropdown>
    )
  }),

  /** Label that goes next to a dropdown. */
  DropdownLabel: React.memo((props) => <ActionItem className="dropdown-label" {...props} />),

  /** Icon */
  ARROW_COLLAPSED_ICON: "caret right",
  ARROW_EXPANDED_ICON: "caret down",
  Icon: React.memo((props) => <Icon {...props} />),

  //////////////////////
  // Project UI
  //////////////////////
  PROJECT_ICON: "app store ios",
  ProjectDropdown, // re-export for convenience
  ProjectMenu, // re-export for convenience
  ProjectActionsDropdown: React.memo((props) => {
    return <UI.MoreMenu {...props}>{actions.PROJECT_DROPDOWN_ACTIONS}</UI.MoreMenu>
  }),

  //////////////////////
  // File UI
  //////////////////////
  FILE_ICON: "file code",
  FileDropdown: FileDropdown, // re-export for convenience
  FileActionsDropdown: React.memo((props) => {
    return <UI.MoreMenu {...props}>{actions.FILE_DROPDOWN_ACTIONS}</UI.MoreMenu>
  }),

  //////////////////////
  // Modals
  //////////////////////
  getResolver(resolve, value) {
    if (typeof value === "function") return value
    return () => resolve(value)
  },
  /**
   * Container for modals shown with `store.showModal()`.
   * You should have one of these at the top level of your app.
   * e.g. `<ModalContainer />` -- that's it!
   */
  ModalContainer: view(() => {
    const { modals } = store
    if (!modals.length) return null
    const topIndex = modals.length - 1
    return store.modals.map(({ id, component, props, resolve, reject }, index) =>
      React.createElement(component, { key: id, id, index, props, isTopModal: index === topIndex, resolve, reject })
    )
  }),

  /**
   * Standard spell Modal.
   * `props`:
   *  - `content`       Required content to show inside the modal.  The meat of the thing.
   *  - `buttons`       Required array of buttons to show in the lower-left.  See `<ModalButton>`.
   *                    Note that the resolved value of the dialog will depend on which button was pressed.
   *  - `name`          Optional modal name, e.g. `"Alert"`.  Set as a top-level className.
   *  - `header`        Optional header section text / elements.
   *  - `className`     Optional CSS class name.
   *  - `style`         Optional CSS style object.
   *  - `extraButtons`  Optional array of extra buttons, beyond those provided normally for standard dialogs.
   *                    Automatically `floated:left`.  See `<ModalButton/>`
   *  - `manageFocus`   Set to `true` to focus on the `OK` button automatically.
   *                    Set to `false` to manage focus in the caller.
   *  - `onEscape`      What to do when they click outside the dialog or hit the escape key:
   *                    - `cancel` = same as hitting the cancel button (the default).
   *                    - `default` = same as hitting the default button.
   *                    - `nothing` = do nothing -- keep the dialog visible.
   *  The following `props` are automatically set up by `store.showModal()`:
   *  - `isTopModal`         Is this the top-most Modal currently showing?
   *                    Note that we temporarily hide all but the top-most Modal.
   *  - `resolve`       Promise `resolve()` function to call when dismissing the modal.
   *
   * TODO: wrap in an error handler?
   */
  Modal: React.memo((props) => {
    const {
      content,
      buttons = [{ isDefault: true, button: "OK" }],
      name = "",
      header,
      className,
      extraButtons,
      manageFocus = false,
      onEscape = "cancel",
      isTopModal = true,
      resolve,
      ...modalProps
    } = props
    // Convert to <ModalButtons> and set up default/cancel/refs.
    const btns = UI.useModalButtons(resolve, buttons, extraButtons)
    // console.warn({ props, btns })
    if (!btns.defaultRef) console.warn(`<Modal>: you must pass at least one button with 'isDefault' set.`)

    // On each redraw, focus the default button if we have one
    // so the return key will close the dialog.
    React.useEffect(() => {
      if (manageFocus && isTopModal) btns.defaultRef?.current?.focus()
    })

    // Figure out what we should do if they click outside the modal or hit escape
    const onClose =
      (onEscape === "default" && btns.defaultResolver) || //
      (onEscape === "cancel" && btns.cancelResolver) ||
      undefined

    return (
      <Modal
        className={classnames("SpellModal", name, className)}
        open={isTopModal} // show only one modal at a time
        closeOnEscape={!!onClose}
        closeOnDimmerClick={!!onClose}
        onClose={onClose}
        {...modalProps}
      >
        {!!header && <Modal.Header>{header}</Modal.Header>}
        <Modal.Content>{content}</Modal.Content>
        <Modal.Actions>{btns.buttons}</Modal.Actions>
      </Modal>
    )
  }),
  /**
   * Generate an array of `<ModalButtons>`, returning an object with:
   *  - `buttons`         Actual `<ModalButtons>`
   *  - `defaultRef`      React `ref` for `isDefault` button, if any.
   *  - `defaultResolver` Resolver function for `isDefault` button, or `resolve(undefined)`.
   *  - `cancelRef`       Ref to the `isCancel` button, if any.
   *  - `cancelResolver`  Resolver function for `isCancel` button, or `resolve(undefined)`.
   */
  useModalButtons(resolve, buttons, extraButtons = []) {
    const defaultRef = React.createRef()
    const cancelRef = React.createRef()
    return React.useMemo(() => {
      const results = {
        defaultResolver: () => resolve(undefined),
        cancelResolver: () => resolve(undefined)
      }
      results.buttons = [
        // make all extraButtons `floated:left` ???
        ...extraButtons.map((btn) => ({ floated: "left", ...btn })),
        ...buttons
      ].map(({ isDefault, isCancel, value, ...btnProps }, index) => {
        const resolver = UI.getResolver(resolve, value)
        btnProps.className = classnames(btnProps.className, { default: isDefault, cancel: isCancel })
        if (isDefault) {
          btnProps.primary = true
          btnProps.ref = defaultRef
          results.defaultRef = defaultRef
          results.defaultResolver = resolver
        }
        if (isCancel) {
          btnProps.ref = cancelRef
          results.cancelRef = cancelRef
          results.cancelResolver = resolver
        }
        return <UI.ModalButton key={index} onClick={resolver} {...btnProps} />
      })
      return results
    }, [buttons, extraButtons])
  },

  /**
   * A single button in a modal, in an convenient-to-instantiate pattern.
   * TODOC
   */
  ModalButton: React.memo(
    React.forwardRef((props, ref) => {
      const { button, onClick, ...extraProps } = props
      if (!button) return null
      if (ref) extraProps.ref = ref

      // If they passed an element, just set its onClick and return as-is.
      if (React.isValidElement(button)) {
        return React.cloneElement(button, { onClick, ref })
      }
      if (typeof button === "string") {
        return (
          <Button onClick={onClick} {...extraProps}>
            {button}
          </Button>
        )
      }
      if (typeof button === "object") {
        // Assume properties which will override other extraProps?
        return <Button onClick={onClick} {...extraProps} {...button} />
      }
      console.warn("<UI.ModalButton>: don't understand 'button' in", props)
      return null
    })
  ),

  /**
   * Alert the user to some condition, with a single "OK" button.
   * `resolve()`s with `undefined`.
   *
   * Props:
   * - `header` Optional header for the dialog.
   * - `message` Mandatory message to show.
   * - `ok`           Text title or button props for OK button, default "OK".
   * - ...and other standard `Modal` props.
   */
  Alert: React.memo(function Alert({ props, resolve, isTopModal }) {
    const { message, ok = "OK", ...modalProps } = props
    return (
      <UI.Modal
        isTopModal={isTopModal}
        name="Alert"
        resolve={resolve}
        content={<div className="message">{message}</div>}
        buttons={[{ isDefault: true, button: ok }]}
        onEscape="default"
        manageFocus
        size="small"
        {...modalProps}
      />
    )
  }),

  /**
   * Confirm if the user wants to do something:
   * `resolve()`s with `true` or `false`.
   *
   * Props:
   * - `message`      Mandatory message to show.
   * - `header`       Optional header for the dialog.
   * - `ok`           Text title or button props for OK button, default "OK".
   * - `cancel`       Text title or button props for Cancel button, default "Cancel".
   * - ...and other standard `Modal` props.
   */
  Confirm: React.memo(function Confirm({ props, resolve, isTopModal }) {
    const { message, ok = "OK", cancel = "Cancel", ...modalProps } = props
    return (
      <UI.Modal
        isTopModal={isTopModal}
        name="Confirm"
        resolve={resolve}
        content={<div className="message">{message}</div>}
        buttons={[
          { isDefault: true, button: ok, value: true },
          { isCancel: true, button: cancel, value: false }
        ]}
        manageFocus
        onEscape="cancel"
        size="small"
        {...modalProps}
      />
    )
  }),

  /**
   * Prompt with a single input field value:
   * `resolve()`s with:
   * - the field value in OK, or
   * - `undefined` if they cancel or submit the field with an empty value.
   * Note that we always make the return key submit the value.
   *
   * Props:
   * - `message`      Mandatory message to show.
   * - `header`       Optional header for the dialog.
   * - `defaultValue` Start value for field, default `""`.
   * - `type`         `<Input type>`, default `text`.
   * - `inputProps`   Optional props to pass to the `<Input>`, e.g.
   *                  with `type="number"` set `inputProps={{ min: 10, max: 100 }}`
   * - `ok`           Text title or button props for OK button, default "OK".
   * - `cancel`       Text title or button props for Cancel button, default "Cancel".
   * - ...and other standard `Modal` props.
   */
  Prompt: React.memo(function Prompt({ props, resolve, isTopModal }) {
    const { message, ok = "OK", cancel = "Cancel", defaultValue, type = "text", inputProps, ...modalProps } = props

    const input = UI.useInput({
      label: message,
      autoFocus: true,
      fluid: true,
      type: type,
      defaultValue,
      ...inputProps,
      onEnterKey: submit
    })
    const content = <div className="message">{input.content}</div>
    function submit() {
      if (!input.error) resolve(input.value)
    }

    return (
      <UI.Modal
        isTopModal={isTopModal}
        name="Prompt"
        resolve={resolve}
        content={content}
        buttons={[
          { isDefault: true, button: ok, value: submit, disabled: !!input.error || input.value === undefined },
          { isCancel: true, button: cancel, value: undefined }
        ]}
        onEscape="cancel"
        size="small"
        {...modalProps}
      />
    )
  }),

  /**
   * Create a self-contained `<Input>`.
   * `props` of note:
   * - `focus`          Set to true to always focus (??).
   * - `defaultValue`   Initial value for field, defaults to `""`.
   * - `type`           `<input type>`.  Defaults to `text`.
   * - `onEnterKey`     Function to execute if they hit enter and the field is valid.
   * - `hint`           Hint about value, will be replaced by validation error message if necessary.
   * all other `props` are passed to the `<Input>`.
   *
   * Returns an object with:
   * - `content`    React elements to render the `<Input>`.
   * - `value`      Getter for the current value.
   * - `error`      Getter for the current error, or `undefined` if no error.
   * - `isValid`    Getter which returns `true` if valid.
   * - `isFocused`  Does the field currently have focus?
   * - `wasTouched` Has the field been touched (focused in and exited).
   * and internal-ish properties:
   * - `fieldId`    Unique id string for the input (for attaching to labels.)
   * - `state`      React `ref` for the current state: `{ current: { value, touched, focused, error } }`.
   * - DOC:  `value`, `isValid`, `error`, `isFocused`, `wasTouched`
   * - `onEnterKey` As passed in, to make it easy to hook up to the `ok` button in a modal.
   */
  fieldId: 0,
  useInput({ type, defaultValue, label, hint, autoFocus = false, required, onEnterKey, ...inputProps }) {
    const [_, forceUpdate] = React.useState()
    // Current state, passed back to caller to manipulate field
    const state = React.useRef({
      content: undefined, // set below
      value: defaultValue,
      touched: false,
      focused: false,
      error: undefined
    })
    const bound = React.useMemo(() => {
      return {
        inputId: `input-${UI.fieldId++}`,
        get inputElement() {
          return document.querySelector(`#${bound.inputId}`)
        },
        setAndValidate(stateProps, delay = 0) {
          Object.assign(state.current, stateProps)

          // get browser validation error directly from the field
          let error = bound.inputElement?.validationMessage
          // do our own `required` checking so we don't show required error until after field is touched
          // TODO: form submit needs to set `touched` on all fields!
          if (!error && required && state.current.touched && state.current.value === "") {
            error = "This field is required."
          }
          state.current.error = error || undefined
          // update on slight delay
          setTimeout(() => bound.inputElement && forceUpdate(Date.now(), delay))
        },
        onChange(event, { value }) {
          if (value === "") value = undefined
          else if (type === "number" || type === "range") value = parseFloat(value, 10)
          bound.setAndValidate({ value }, 20)
        },
        onFocus() {
          bound.setAndValidate({ focused: true })
        },
        onBlur() {
          bound.setAndValidate({ focused: false, touched: true }, 200) // longer delay so no flash if they `Cancel`
        },
        onKeyUp({ key }) {
          // console.info("onKeyUp", target.value, target, target.validationMessage)
          if (onEnterKey && key === "Enter") onEnterKey()
        }
      }
    }, [])

    // Run field validation before each draw
    const { error, focused, value } = state.current
    state.current.content = (
      <>
        {!!label && (
          <label className="spell input-label" htmlFor={bound.inputId}>
            {label}
          </label>
        )}
        <Input
          id={bound.inputId}
          type={type}
          autoFocus={autoFocus}
          focus={focused}
          defaultValue={value}
          error={!!error}
          onFocus={bound.onFocus}
          onBlur={bound.onBlur}
          onChange={bound.onChange}
          onKeyUp={bound.onKeyUp}
          {...inputProps}
        />
        <label htmlFor={bound.inputId} className={classnames("spell", "input-hint", error && "error")}>
          {error || hint || ""}
        </label>
      </>
    )
    return state.current
  },

  /**
   * Present a Modal which allows the user `Choose` a single value from a list in.
   * `resolve()`s with:
   * - the chosen value if OK, or
   * - `undefined` if they cancel or submit the field with an empty value.
   * Note that we always make the return key submit the value.
   *
   * Props:
   * - `message`      Mandatory message to show.
   * - `options`      List of options as:  array of primitive values, array of `{ value, text, icon, image }`, map of `{ key: text }`.
   * - `defaultValue` Optional start value for field.
   * - `required`     If `true`, we won't let them submit the dialog without choosing a value.
   * - `multiple`     If `true`, they can choose multiple values.
   * - `extensible`   If `true`, the user can add their own value(s).
   * - `header`       Optional header for the dialog.
   * - `inputProps`   Optional props to pass to the `<Dropdown>`, e.g. `placeholder`, `multiple`, `allowAdditions` .
   * - `ok`           Text title or button props for OK button, default "OK".
   * - `cancel`       Text title or button props for Cancel button, default "Cancel".
   * - ...and other standard `Modal` props.
   */
  Chooser: React.memo(function Prompt({ props, resolve, isTopModal }) {
    const {
      message,
      options,
      defaultValue,
      required = false,
      multiple = false,
      extensible = false,
      ok = "OK",
      cancel = "Cancel",
      inputProps,
      ...modalProps
    } = props

    const select = UI.useSelect({
      options,
      defaultValue,
      required,
      multiple,
      extensible,
      focus: true,
      fluid: true,
      ...inputProps
    })

    const content = (
      <div className="message">
        <label htmlFor="prompt">{message}</label>
        {select.content}
      </div>
    )

    return (
      <UI.Modal
        isTopModal={isTopModal}
        name="Prompt"
        resolve={resolve}
        content={content}
        buttons={[
          { isDefault: true, button: ok, value: () => select.isValid && resolve(select.value) },
          { isCancel: true, button: cancel, value: undefined }
        ]}
        onEscape="cancel"
        size="small"
        {...modalProps}
      />
    )
  }),

  /**
   * Create a self-contained `<Dropdown>` which works like a `<select>`.
   * `props` of note:
   * - `options`        Required list of options as:  array of primitive values, array of `{ value, text, icon, image }`, map of `{ key: text }`.
   * - `focus`          Set to true to auto-focus.
   * - `defaultValue`   Initial value for field.
   * - `required`       Show as an error if touched and no value provided.
   * - `multiple`       Select multiple items (returned value will always be an array).
   * all other `props` are passed to the `<Dropdown>`, e.g. `multiple`, `className`, `allowAdditions` etc
   *
   * Returns an object with:
   * - `content`    React elements to render the `<Input>`.
   * - `value`      Getter for the current value.
   * - `error`      Getter for the current error, or `undefined` if no error.
   * - `isValid`    Getter which returns `true` if valid.
   * - `isFocused`  Does the field currently have focus?
   * - `wasTouched` Has the field been touched (focused in and exited).
   * and internal-is properties:
   * - `inputId`    Unique id string for the input (for attaching to labels.)
   * - `inputRef`   React `ref` to the `<Input>`.
   * - `state`      React `ref` for the current state: `{ value, touched, focused, error }`.
   */
  useSelect({
    options,
    defaultValue,
    hint = "",
    focus = false,
    required = false,
    multiple = false,
    extensible = false,
    ...inputProps
  }) {
    const [_, forceUpdate] = React.useState()

    // Pointer to the input.
    const inputRef = React.useRef()
    // Current state, passed back to caller to manipulate field
    const state = React.useRef({
      value: defaultValue,
      touched: false,
      focused: false,
      error: undefined
    })
    const bound = React.useMemo(() => {
      return {
        inputId: `select-${UI.fieldId++}`,
        inputRef,
        options: UI.normalizeOptions(options),
        // getSUIElement: () => document.querySelector(`#${bound.inputId}`),
        // getHintElement: () => bound.getSUIElement()?.nextElementSibling,
        fieldIsValid(update) {
          let error
          const { focused, touched, value } = state.current
          const isEmpty = value === undefined || (multiple && value.length === 0)
          if (required && touched && !focused && isEmpty) {
            error = "This field is required."
          }
          state.current.error = error || undefined
          // console.warn("FIV:", state.current, bound)

          // hintElement out of react's hands
          // const hintElement = bound.getHintElement()
          // if (error) {
          //   hintElement.classList.add("error")
          //   hintElement.innerText = error
          // } else {
          //   hintElement.classList.remove("error")
          //   hintElement.innerText = hint
          // }

          if (update) forceUpdate(Date.now())
          return !error
        },
        onFocus() {
          state.current.focused = true
          // bound.getSUIElement()?.classList.add("active")
        },
        onBlur() {
          state.current.focused = false
          state.current.touched = true
          bound.fieldIsValid("UPDATE")
        },
        onChange(event, { value }) {
          // console.info("change")
          state.current.value = value
          state.current.touched = true
          bound.fieldIsValid("UPDATE")
        },
        onAddItem(event, { value }) {
          // TODO: custom getTitle()
          bound.options = [...bound.options, { text: value, value }]
          forceUpdate(Date.now())
        }
      }
    }, [options])

    // // Auto-focus if we were told to.
    // // And run `fieldIsValid` on start.
    // React.useEffect(() => {
    //   bound.fieldIsValid()
    //   //if (focus) inputRef.current.focus()
    // }, [focus])

    const content = (
      <>
        <Dropdown
          id={bound.inputId}
          ref={inputRef}
          options={bound.options}
          defaultValue={state.current.value}
          clearable={!required}
          selection
          search
          lazyLoad
          scrolling
          multiple={multiple}
          closeOnChange={!multiple}
          allowAdditions={extensible}
          open={(focus && !state.current.touched) || undefined}
          openOnFocus={false}
          error={!!state.current.error}
          onFocus={bound.onFocus}
          onBlur={bound.onBlur}
          onChange={bound.onChange}
          onAddItem={bound.onAddItem}
          {...inputProps}
        />
        <label htmlFor={bound.inputId} className={`spell input-hint${state.current.error ? " error" : ""}`}>
          {state.current.error || hint}
        </label>
      </>
    )
    return {
      inputId: bound.inputId,
      inputRef,
      state,
      content,
      get value() {
        return state.current.value
      },
      get error() {
        return state.current.error
      },
      get isValid() {
        return !state.current.error
      },
      get wasTouched() {
        return state.current.touched
      },
      get isFocused() {
        return state.current.focused
      }
    }
  },
  /**
   * Normalize `options` for  SUI <Dropdown/>:
   * - If an array of objects, pass those through.  Expects `{ text, value, icon?, image? }`
   * - If an array of primitive values, returns as `{ text: <value>, value: <value> }`
   * - If a single object, returns as array of `{ value: <prop>, text: <object[prop]> }`
   * Adds `key` property to all returned values.
   */
  normalizeOptions(options) {
    if (Array.isArray(options)) {
      return options.map((option, index) => {
        if (typeof option === object) return { key: index, ...option }
        else return { key: index, text: option, value: option }
      })
    }
    return Object.entries(options).map(([value, text]) => {
      return { key: value, value, text }
    })
  }
}
window.UI = UI
