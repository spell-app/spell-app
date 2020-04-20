import { isEqual } from "lodash"

import { proto } from "./decorators"
import { UNSAVED, SAVING, SAVED, SAVE_ERROR, SKIP } from "./constants"

import { Loadable } from "./Loadable"

/** Abstract class for a saveable resource (which is implicitly also loadable). */
// eslint-disable-next-line import/prefer-default-export
export class Saveable extends Loadable {
  /** If true, we auto-update `#load.contents` with results of `_processSave()` on successful save. */
  @proto autoUpdateContentsOnSave = false

  /** Private info about the last save. Immutable. */
  @proto _save = {
    /** Are we dirty? */
    dirty: false,
    /** Current save state */
    state: UNSAVED,
    /** Last save params, set when actually saving. */
    params: undefined,
    /** Last save promise, set if we're actually saving. */
    promise: undefined,
    /** Contents of the last save, set after successful save. */
    contents: undefined,
    /** Last save error, set on failed save. */
    error: undefined,
    /** When last save finished/failed. */
    time: undefined
  }

  /** Syntactic sugar for save state. */
  get isUnsaved() {
    return this._save.state === UNSAVED
  }

  get isSaving() {
    return this._save.state === SAVING
  }

  get isSaved() {
    return this._save.state === SAVED
  }

  get hasSaveError() {
    return this._save.state === SAVE_ERROR
  }

  /** Dirty flag. Not managed automatically. */
  get isDirty() {
    return !!this._save.isDirty
  }

  set isDirty(value = true) {
    const { isDirty: _ignored, ...rest } = this._save
    return { isDirty: !!value, ...rest }
  }

  /**
   * Public `save()` method.
   * NOTE: don't override this, override `getSaver()`, `_processSave()` or `_processSaveError()` instead!
   * */
  save(params) {
    if (this.isSaving) {
      // bail early if we're already saving with the same params (???)
      if (isEqual(params, this._save.params)) return this._save.promise
      // Otherwise cancel the pending save (if possible) and we'll try again
      this.cancelSave()
    }

    const success = (result, skipProcessing) => {
      try {
        this._save = {
          isDirty: false,
          state: SAVED,
          contents: skipProcessing === SKIP ? result : this._processSave(result),
          params,
          time: Date.now()
        }
        if (this.autoUpdateContentsOnSave) this.contents = this.save.contents
        return Promise.resolve(this._save.contents)
      } catch (e) {
        return failure(e, SKIP)
      }
    }

    const failure = (rawError, skipProcessing) => {
      const result = skipProcessing === SKIP ? rawError : this._processSaveError(rawError)
      if (!(result instanceof Error)) return success(result, SKIP)
      this._save = {
        isDirty: true,
        state: SAVE_ERROR,
        error: result,
        params,
        time: Date.now()
      }
      return Promise.reject(this._save.error)
    }

    try {
      this._save = {
        isDirty: true,
        state: SAVING,
        params,
        promise: this.getSaver(params).then(success, failure)
      }
      return this._save.promise
    } catch (e) {
      return failure(e)
    }
  }

  /** Attempt to cancel an in-flight save. */
  cancelSave() {
    if (this._save.promise?.cancel) {
      this._save.promise.cancel()
      this._save = {
        isDirty: this._save.isDirty,
        state: UNSAVED
      }
    }
  }

  /** Implementation-specific code! */

  /** Return promise actually used to save this file. */
  getSaver(params) {
    throw new TypeError("You must override saveable.getSaver()!")
  }

  /**
   * Process `rawResult` from successful completion of our loading promise, deriving a new value if desired.
   * */
  _processSave(rawResult) {
    return rawResult
  }

  /** Process `error` from our saving promise:
   * - return an `Error` (the `error` passed in or a new one) to fail the load.
   * - return any other value to make the load SUCCEED with that value as the (pre-processed) `contents`, e.g. with default contents.
   */
  _processSaveError(error) {
    return error
  }
}
