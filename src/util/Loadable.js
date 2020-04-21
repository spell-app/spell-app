import global from "global"
import isEqual from "lodash/isEqual"

import { proto } from "./decorators"
import { Assertable } from "./Assertable"

import { UNLOADED, LOADING, LOADED, LOAD_ERROR, SKIP } from "./constants"

/**
 * Abstract class for a loadable resource.
 * Use `LoadableFile` to load a single file by URL.
 *
 * TODO: `cancelLoad()` ?
 */
export class Loadable extends Assertable {
  /** Lifespan to maintain loaded contents, in seconds. */
  @proto loadLifespan = undefined

  /** Private info about the last load. Immutable. */
  @proto _load = {
    /** Current load state */
    state: UNLOADED,
    /** Last load params, set when actually loading. */
    params: undefined,
    /** Last load promise, set if we're actually loading. */
    promise: undefined,
    /** Contents of the last load, set after successful load. */
    contents: undefined,
    /** Last load error, set on failed load. */
    error: undefined,
    /** When last load finished/failed. */
    time: undefined
  }

  constructor(props) {
    super()
    Object.assign(this, props)
  }

  /** Syntactic sugar for loadState */
  get isUnloaded() {
    return this._load.state === UNLOADED
  }
  get isLoading() {
    return this._load.state === LOADING
  }
  get isLoaded() {
    return this._load.state === LOADED
  }
  get hasLoadError() {
    return this._load.state === LOAD_ERROR
  }

  /** Contents of last load, only valid after successful load. */
  get contents() {
    return this._load.contents
  }

  /** Manually set load contents.  Updates state/etc as well. */
  set contents(contents) {
    this._load = {
      state: LOADED,
      contents,
      params: this._load.params,
      time: Date.now()
    }
  }

  /** Error from last load, only valid after load error. */
  get loadError() {
    return this._load.error
  }

  /** A loadable is considered `expired` if it's time for it to be reloaded. */
  get isExpired() {
    const expiryTime = this._load.time + this.loadLifespan * 1000
    if (isNaN(expiryTime)) return false
    return Date.now() > expiryTime
  }

  /**
   * Public load method.
   * NOTE: don't override this, override `getLoader()`, `_processLoad()` or `_processLoadError()` instead!
   */
  load(params) {
    if (isEqual(params, this._load.params)) {
      if (this.isLoading) return this._load.promise
      if (!this.isExpired) {
        if (this.isLoaded) return Promise.resolve(this._load.contents)
        if (this.hasLoadError) throw Promise.reject(this._load.error)
      }
    }

    const success = (result, skipProcessing) => {
      try {
        this.contents = skipProcessing === SKIP ? result : this._processLoad(result)
        return Promise.resolve(this._load.contents)
      } catch (e) {
        return failure(e, SKIP)
      }
    }

    const failure = (rawError, skipProcessing) => {
      const result = skipProcessing === SKIP ? rawError : this._processLoadError(rawError)
      if (!(result instanceof Error)) return success(result, SKIP)

      this._load = {
        state: LOAD_ERROR,
        error: result,
        params,
        time: Date.now()
      }
      return Promise.reject(this._load.error)
    }

    try {
      this._load = {
        state: LOADING,
        params,
        promise: this.getLoader(params).then(success, failure)
      }
      return this._load.promise
    } catch (e) {
      return failure(e)
    }
  }

  /** Attempt to cancel the in-flight load. */
  cancelLoad() {
    if (this._load.state === LOADING && this._load.promise?.cancel) {
      this._load.promise.cancel()
      this.unload()
    }
  }

  /** Force reload of the resource, ignoring expiration logic. */
  reload(params) {
    this.unload()
    return this.load(params)
  }

  /** Manual unload. */
  unload() {
    this._load = { state: UNLOADED }
  }

  /** Implementation-specific code! */

  /** INTERNAL routine to load contents. Must return a promise. */
  async getLoader(params) {
    throw new TypeError("You must override loadable.getLoader()!")
  }

  /** Process `rawResult` from our loading promise, deriving a new value, etc. */
  _processLoad(rawResult) {
    return rawResult
  }

  /** Process `error` from our loading promise:
   * - return an `Error` (the `error` passed in or a new one) to fail the load.
   * - return any other value to make the load SUCCEED with that value as the (pre-processed) `contents`, e.g. with default contents.
   */
  _processLoadError(error) {
    return error
  }
}

global.Loadable = Loadable
