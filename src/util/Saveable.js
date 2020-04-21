import { isEqual } from "lodash"

import { proto } from "./decorators"
import { Loadable } from "./Loadable"

/**
 * Abstract class for a saveable resource (which is implicitly also `Loadable`).
 */
export class Saveable extends Loadable {
  /** Private info about the last save. Immutable. */
  @proto _save = {
    /** Do we need to save? */
    isDirty: undefined,
    /** Last save params, set when actually saving. */
    params: undefined,
    /** Last save promise, set if we're actually saving. */
    saver: undefined,
    /** Result of the last successful save(). */
    result: undefined,
    /** Last save error, set on failed save. */
    error: undefined,
    /** When last save finished/failed. */
    time: undefined
  }

  /** Do we currently need to save?. */
  get isDirty() {
    return this._save.isDirty
  }

  /** Set `needsToSave = true` when it's time to save */
  set isDirty(value = true) {
    const { isDirty: _ignored, ...otherProps } = this._save
    this._save = { isDirty: value, ...otherProps }
  }

  /** Are we currently saving? */
  get isSaving() {
    return !!this._save.saver
  }

  /** Result of last `save()`, if any. */
  get saveResult() {
    return this._save.result
  }

  /** Error from last `save()`, if any. */
  get saveError() {
    return this._save.error
  }

  /** Time when we were last saved, if any. */
  get saveTime() {
    return this._save.time
  }

  /**
   * Public `save()` method. `$params` are same as `$fetch()` params.
   * NOTE: don't override this, override `getSaver()` instead!
   * */
  save(params) {
    if (this.isSaving) {
      // bail early if we're already saving with the same params (???)
      if (isEqual(params, this._save.params)) return this._save.saver
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
      return this.saveResult
    }

    const onError = async error => {
      this._save = {
        isDirty: true,
        error,
        params,
        time: Date.now()
      }
      throw this.saveError
    }

    try {
      const saver = this.getSaver(params)
      if (!saver || !saver.then) throw new TypeError(`${this.constructor.name}.getSaver() didn't return a promise!`)
      this._save = {
        isDirty: true,
        params,
        saver: saver.then(onSuccess, onError)
      }
      return this._save.saver
    } catch (e) {
      return onError(e)
    }
  }

  /** Attempt to cancel an in-flight save. */
  cancelSave() {
    if (this._save.saver?.cancel) {
      const { saver, ...otherProps } = this._save
      saver.cancel()
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
