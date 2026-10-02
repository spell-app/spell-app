/** @jsxImportSource react */
import cloneDeep from "lodash/cloneDeep"

import { createStore, getPath, setPath } from "$/util"

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
      return getPath(value, path)
    },
    setValue(path, newValue) {
      setPath(value, path, newValue)
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
  /** Reactive form value -- read/write directly for the whole object, or via `getValue()`/`setValue()` per path. */
  value: V
  /** `cloneDeep(value)` -- un-proxied, so reading it does not subscribe to reactive updates. */
  readonly raw: V
  /** Reactively get a value by nested `path` (e.g. `"a.b[0].c"`), via `getPath()` in `$/util`. */
  getValue(path: string): unknown
  /** Reactively set a value by nested `path`, via `setPath()` in `$/util`. */
  setValue(path: string, value: unknown): void
  /** Per-path validation errors, keyed by the same flat `path` strings as `getValue()`/`setValue()`. */
  errors: Record<string, string | undefined>
  /** Reactively get the error for a field by `path`. */
  getError(path: string): string | undefined
  /** Reactively set the error for a field by `path`.  `undefined` clears it. */
  setError(path: string, error: string | undefined): void
  /** Whether any `path` currently has an error. */
  readonly hasErrors: boolean
}
