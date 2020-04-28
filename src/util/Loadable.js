import global from "global"
import isEqual from "lodash/isEqual"

import { UNLOADED, LOADING, LOADED } from "./constants"
import { proto } from "./decorators"
import { Observable, prop } from "./Observable"

/**
 * Abstract class for a loadable resource.
 * Use `LoadableFile` to load a single file by URL.
 */
export class Loadable extends Observable {
  /**
   * By default, we'll return cached `load()` results until you `reload()`.
   * Set to number of seconds after which we'll ignore the cache.
   * Set to `0` to never cache.
   * Useful, e.g., to reload data when they come back to the browser window after a break.
   */
  @proto reloadAfter = undefined

  /** Contents of the last successful `load()`. */
  @prop contents = undefined

  /**
   * Current load state (protected):
   * - `status`:    One of `UNLOADED`, `LOADING`, `LOADED`.  See `.isLoading` etc.
   * - `params`:    Params passed to last load().
   * - `promise`:   Promise used for the current in-flight load.
   * - `error`:     Error returned during last load.
   * - `time`:      Last load time (only set after load() attempted or on `setContents()`)
   */
  @prop _load = {
    status: UNLOADED,
    params: undefined,
    promise: undefined,
    error: undefined,
    time: undefined
  }

  //-----------------
  // Loading
  //-----------------

  /** Are we unloaded? */
  get isUnloaded() {
    return this._load.status === UNLOADED
  }
  /** Are we currently loading? */
  get isLoading() {
    return this._load.status === LOADING
  }
  /** Have we been successfully loaded? */
  get isLoaded() {
    return this._load.status === LOADED
  }

  /**
   * Manually set load contents.
   * Cancels in-flight load if necessary. Updates status/etc as well.
   */

  setContents(contents, params) {
    this.stopInflightLoad()
    this.set({
      contents,
      _load: {
        //        status: LOADED,
        params,
        time: Date.now()
      }
    })
  }

  /** A loadable is considered `expired` if it's time for it to be reloaded.
   * `undefined` means we don't know.
   * `true` means we are explicitly out of cache
   * `false` means we are explicitly within cache.
   */
  get isExpired() {
    const expiryTime = this._load.time + this.reloadAfter * 1000
    if (isNaN(expiryTime)) return undefined
    return Date.now() > expiryTime
  }

  /**
   * Public load method.
   * NOTE: don't override this, override `getLoader()` instead!
   */
  load(params) {
    // If params are the same as last time:
    if (isEqual(params, this._load.params)) {
      // If we're currently loading, return the current loading promise
      if (this._load.promise) return this._load.promise
      // If the cached version is still good
      if (!this.isExpired) {
        // if loaded, resolve with last contents
        if (this.isLoaded) return Promise.resolve(this.contents)
        // if load error, reject with last error
        if (this._load.error) return Promise.reject(this._load.error)
      }
    }
    // Cancel current load if any
    this.stopInflightLoad()

    let promise
    const onSuccess = async contents => {
      // Only update if the same `promise` is active
      if (this._load.promise === promise) {
        this.set({
          contents,
          _load: {
            status: LOADED,
            params,
            time: Date.now()
          }
        })
      }
      return this.contents
    }

    const onError = async error => {
      // Only update if the same `promise` is active
      if (this._load.promise === promise) {
        this.set({
          contents: undefined,
          _load: {
            status: UNLOADED,
            params,
            error,
            time: Date.now()
          }
        })
      }
      if (this._load.error) throw this._load.error
      return this.contents
    }

    try {
      promise = this.getLoader(params)
      if (!promise || !promise.then)
        throw new TypeError(`${this.constructor.name}.getLoader() didn't return a promise!`)
      this.set({
        contents: undefined,
        _load: {
          status: LOADING,
          params,
          promise
        }
      })
      return promise.then(onSuccess, onError)
    } catch (e) {
      return onError(e)
    }
  }

  /**
   * Attempt to cancel the current in-flight load.
   * No-op if not loading. Attempts to minimally clean up load variables.
   */
  stopInflightLoad() {
    if (this.isLoading) {
      const { promise } = this._load
      this.set({
        contents: undefined,
        _load: {
          status: UNLOADED
        }
      })
      if (promise?.cancel) promise.cancel()
    }
  }

  /** Force reload of the resource, ignoring expiration logic. */
  reload(params) {
    this.unload()
    return this.load(params)
  }

  /** Manual unload. */
  unload() {
    this.stopInflightLoad()
    this.set({
      contents: undefined,
      _load: {
        status: UNLOADED
      }
    })
  }

  /** Implementation-specific code! */

  /**
   * INTERNAL routine to load contents. Must return a promise.
   * Do any transformation of the result in this method.
   */
  async getLoader(params) {
    throw new TypeError("You must override loadable.getLoader()!")
  }
}

global.Loadable = Loadable
