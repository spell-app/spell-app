/** @jsxImportSource react */
import cloneDeep from "lodash/cloneDeep"

import { Observable, getPath, prop, setPath } from "$/util"

/**
 * Make the store for a form with form `value`.  See `FormStore` for details.
 */
export function makeFormStore<V extends object>(value: V): FormStore<V> {
  return new FormStore<V>({ value })
}

/**
 * Reactive store backing a `<Form>`:  the editable `value` plus per-path validation `errors`, as spell cells.
 * - `value` is usually a spell `Thing` (e.g. a program's `todo`):  `getValue()` / `setValue()` go through ITS
 *   getters / setters, so its own cells say when a field changes -- and a spell `onClick` doing `app.x = y`
 *   directly is seen too.  A plain object `value` isn't reactive inside:  `<Form>` re-renders its fields after each
 *   `setValue()` anyway (`Form.updateFields()`).
 * - `errors` is replaced, never changed in place:  a spell cell notifies on a new value.
 * - Read in a `view()` render (`$/util`'s React bridge), each of these re-renders it when it changes.
 */
export class FormStore<V extends object> extends Observable {
  /** Form value -- read/write directly for the whole object, or via `getValue()`/`setValue()` per path. */
  @prop()
  accessor value!: V

  /** Per-path validation errors, keyed by the same flat `path` strings as `getValue()`/`setValue()`. */
  @prop({ init: () => ({}) })
  accessor errors!: Readonly<Record<string, string | undefined>>

  /** `cloneDeep(value)` -- a copy, so reading it does not follow later changes. */
  get raw(): V {
    return cloneDeep(this.value)
  }

  /** Get a value by nested `path` (e.g. `"a.b[0].c"`), via `getPath()` in `$/util`. */
  getValue(path: string): unknown {
    return getPath(this.value, path)
  }

  /** Set a value by nested `path`, via `setPath()` in `$/util`. */
  setValue(path: string, value: unknown): void {
    setPath(this.value, path, value)
  }

  /** The error for a field by `path`. */
  getError(path: string): string | undefined {
    return this.errors[path]
  }

  /** Set the error for a field by `path`.  `undefined` clears it. */
  setError(path: string, error: string | undefined): void {
    if (this.errors[path] === error) return
    const errors = { ...this.errors }
    if (error) errors[path] = error
    else delete errors[path]
    this.errors = errors
  }

  /** Whether any `path` currently has an error. */
  get hasErrors(): boolean {
    return Object.keys(this.errors).length > 0
  }
}
