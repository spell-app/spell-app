import { isEqual } from "lodash"

import { Loadable } from "./Loadable"
import { prop } from "./Observable"

/**
 * Abstract class for a saveable resource (which is implicitly also `Loadable`).
 */
export class Saveable extends Loadable {
  /**
   * Current save state (protected):
   * - `isDirty`:   Do we need to save?
   * - `params`:    Params passed to last save().
   * - `promise`:   Promise used for the current in-flight save.
   * - `results`:   Result returned during last save if it succeeded.
   * - `error`:     Error returned during last save if it failed.
   * - `time`:      Last save time (only set after save() completes).
   */
  /** Private info about the last save. Immutable. */
  @prop _save = {
    isDirty: undefined,
    params: undefined,
    promise: undefined,
    result: undefined,
    error: undefined,
    time: undefined
  }

  /** Do we currently need to save?. */
  get isDirty() {
    return this._save.isDirty
  }

  /** Set `needsToSave = true` when it's time to save */
  set isDirty(value = true) {
    const { isDirty: _ignored, ...otherProps } = this._save
    this.set("_save", { isDirty: value, ...otherProps })
  }

  /** Are we currently saving? */
  get isSaving() {
    return !!this._save.promise
  }

  /**
   * Public `save()` method. `$params` are same as `$fetch()` params.
   * NOTE: don't override this, override `getSaver()` instead!
   * */
  save(params) {
    if (this.isSaving) {
      // bail early if we're already saving with the same params (???)
      if (isEqual(params, this._save.params)) return this._save.promise
      // Otherwise cancel the pending save (if possible) and we'll try again
      this.cancelSave()
    }

    const onSuccess = async result => {
      this._save = {
        isDirty: false,
        result,
        params,
        time: Date.now()
      }
      return this._save.result
    }

    const onError = async error => {
      this._save = {
        isDirty: true,
        error,
        params,
        time: Date.now()
      }
      throw this._save.error
    }

    try {
      const promise = this.getSaver(params)
      if (!promise || !promise.then) throw new TypeError(`${this.constructor.name}.getSaver() didn't return a promise!`)
      this._save = {
        isDirty: true,
        params,
        promise: promise.then(onSuccess, onError)
      }
      return this._save.promise
    } catch (e) {
      return onError(e)
    }
  }

  /** Attempt to cancel an in-flight save. */
  cancelSave() {
    if (this._save.promise?.cancel) {
      const { promise, ...otherProps } = this._save
      promise.cancel()
      this._save = otherProps
    }
  }

  /** Implementation-specific code! */

  /**
   * Return promise actually used to save this file. Must return a promise.
   * Do any transformation of the result in this method.
   */
  getSaver(params) {
    throw new TypeError("You must override saveable.getSaver()!")
  }
}
