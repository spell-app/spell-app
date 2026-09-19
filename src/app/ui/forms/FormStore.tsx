import cloneDeep from "lodash/cloneDeep"
import { createStore } from "~/util"

import { spellCore } from "~/spellCore"

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
