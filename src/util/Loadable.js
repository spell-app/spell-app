import global from "global"
import isEqual from "lodash/isEqual"

import { proto } from "./decorators"

import { UNLOADED, LOADING, LOADED } from "./constants"

/**
 * Abstract class for a loadable resource.
 * Use `LoadableFile` to load a single file by URL.
 *
 * TODO: `cancelLoad()` ?
 */
export class Loadable {
  /**
   * By default, we'll return cached `load()` results until you `reload()`.
   * Set to number of seconds after which we'll ignore the cache.
   * Set to `0` to never cache.
   * Useful, e.g., to reload data when they come back to the browser window after a break.
   */
  @proto reloadAfter = undefined

  /** Private info about the last load. Immutable. */
  @proto _load = {
    /** Current load state.  UNLOADED, LOADING or LOADED. */
    state: UNLOADED,
    /** Params passed to last `load()`. */
    params: undefined,
    /** Last load promise, set if we're actually loading. */
    loader: undefined,
    /** Contents of the last successful `load()`. */
    contents: undefined,
    /** Error from last failed `load()`. */
    error: undefined,
    /** When last load finished/failed. */
    time: undefined
  }

  constructor(props) {
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

  /**
   * Contents of last load, valid after successful load.
   * You can also set this manually to load with data from the client.
   */
  get contents() {
    return this._load.contents
  }

  /** Manually set load contents.  Updates state/etc as well. */
  set contents(value) {
    this._load = {
      state: LOADED,
      contents: value,
      time: Date.now()
    }
  }

  /** Error from last load, only valid after load error. */
  get loadError() {
    return this._load.error
  }

  /** Manually set load error.  Updates state/etc as well. */
  set loadError(error) {
    this._load = {
      state: UNLOADED,
      error,
      time: Date.now()
    }
  }

  /** Time when we were last loaded, if any. */
  get loadTime() {
    return this._load.time
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
      if (this.isLoading) return this._load.loader
      // If the cached version is still good
      if (this.isExpired === false) {
        // if loaded, resolve with last contents
        if (this.isLoaded) return Promise.resolve(this.contents)
        // if load error, reject with last error
        if (this.loadError) return Promise.reject(this.loadError)
      }
    }
    // Cancel current load if any
    if (this.isLoading) this.cancelLoad()

    let loader
    const onSuccess = async contents => {
      // Only update if the same loader is active
      if (this._load.loader === loader) {
        this._load = {
          state: LOADED,
          contents,
          params,
          time: Date.now()
        }
      }
      return this.contents
    }

    const onError = async error => {
      // Only update if the same loader is active
      if (this._load.loader === loader) {
        this._load = {
          state: UNLOADED,
          error,
          params,
          time: Date.now()
        }
        throw this.loadError
      }
      if (this.loadError) throw this.loadError
      return this.contents
    }

    try {
      loader = this.getLoader(params)
      if (!loader || !loader.then) throw new TypeError(`${this.constructor.name}.getLoader() didn't return a promise!`)
      this._load = { state: LOADING, loader, params }
      return loader.then(onSuccess, onError)
    } catch (e) {
      return onError(e)
    }
  }

  /** Attempt to cancel the current in-flight load. */
  cancelLoad() {
    if (this._load.loader?.cancel) this._load.loader.cancel()
    this.unload()
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

  /**
   * INTERNAL routine to load contents. Must return a promise.
   * Do any transformation of the result in this method.
   */
  async getLoader(params) {
    throw new TypeError("You must override loadable.getLoader()!")
  }
}

global.Loadable = Loadable
