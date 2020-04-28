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
   * - `saveParams`:    Params passed to last save().
   * - `saver`:   Promise used for the current in-flight save.
   * - `saveResults`:   Result returned during last save if it succeeded.
   * - `saveError`:     Error returned during last save if it failed.
   * - `saveTime`:      Last save time (only set after save() completes).
   */
  /** Private info about the last save. Immutable. */
  @prop _loadable = {
    isDirty: undefined,
    saveParams: undefined,
    saver: undefined,
    saveResults: undefined,
    saveError: undefined,
    saveTime: undefined
  }

  /** Do we currently need to save?. */
  get isDirty() {
    return this._loadable.isDirty
  }

  /** Set `needsToSave = true` when it's time to save */
  set isDirty(value = true) {
    const { isDirty: _ignored, ...otherProps } = this._loadable
    this.set("_loadable", { isDirty: value, ...otherProps })
  }

  /** Are we currently saving? */
  get isSaving() {
    return !!this._loadable.saver
  }

  /**
   * Public `save()` method. `saveParams` are same as `$fetch()` saveParams.
   * NOTE: don't override this, override `getSaver()` instead!
   */
  save(saveParams) {
    if (this.isSaving) {
      // bail early if we're already saving with the same saveParams (???)
      if (isEqual(saveParams, this._loadable.saveParams)) return this._loadable.saver
      // Otherwise cancel the pending save (if possible) and we'll try again
      this.cancelSave()
    }

    const onSuccess = async saveResults => {
      this._loadable = {
        isDirty: false,
        saveResults,
        saveParams,
        saveTime: Date.now()
      }
      return this._loadable.saveResults
    }

    const onError = async saveError => {
      this._loadable = {
        isDirty: true,
        saveError,
        saveParams,
        saveTime: Date.now()
      }
      throw this._loadable.saveError
    }

    try {
      const saver = this.getSaver(saveParams)
      if (!saver || !saver.then) throw new TypeError(`${this.constructor.name}.getSaver() didn't return a promise!`)
      this._loadable = {
        isDirty: true,
        saveParams,
        saver: saver.then(onSuccess, onError)
      }
      return this._loadable.saver
    } catch (e) {
      return onError(e)
    }
  }

  /** Attempt to cancel an in-flight save. */
  cancelSave() {
    if (this._loadable.saver?.cancel) {
      const { saver, ...otherProps } = this._loadable
      saver.cancel()
      this._loadable = otherProps
    }
  }

  /** Implementation-specific code! */

  /**
   * Return promise actually used to save this file. Must return a promise.
   * Do any transformation of the result in this method.
   */
  getSaver(saveParams) {
    throw new TypeError("You must override saveable.getSaver()!")
  }
}
