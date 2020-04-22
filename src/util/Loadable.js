import global from "global"
import isEqual from "lodash/isEqual"
import { observable, computed } from "mobx"

import { proto, forward } from "./decorators"

import { UNLOADED, LOADING, LOADED } from "./constants"

/**
 * Abstract class for a loadable resource.
 * Use `LoadableFile` to load a single file by URL.
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
  @observable
  _load = {
    /** Current load state.  UNLOADED, LOADING or LOADED. */
    state: UNLOADED,
    /** Params passed to last `load()`. */
    params: undefined,
    /** Last load promise, set if we're actually loading. */
    loader: undefined,
    /** Contents of the last successful `load()`. */
    contents: undefined,
    /** Error from last failed `load()`. */
    loadError: undefined,
    /** When last load finished/failed. */
    lastLoaded: undefined
  }

  constructor(props) {
    Object.assign(this, props)
  }

  /** Are we currently loading? */
  @computed get isLoading() {
    return this._load.state === LOADING
  }
  /** Have we been successfully loaded? */
  @computed get isLoaded() {
    return this._load.state === LOADED
  }

  /** Current load contents.  Only valid if we have successfully loaded. */
  @computed get contents() {
    return this._load.contents
  }

  /**
   * Manually set load contents.
   * Cancels pending load. Updates state/etc as well.
   */
  set contents(contents) {
    this.stopInflightLoad()
    Object.assign(this._load, {
      state: LOADED,
      params: undefined, // TODO: leave `params` alone???
      loader: undefined,
      contents,
      loadError: undefined,
      lastLoaded: Date.now()
    })
  }

  /** Last load error.  Only valid if last load failed. */
  @computed get loadError() {
    return this._load.loadError
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
    this.stopInflightLoad()

    let loader
    const onSuccess = async contents => {
      // Only update if the same loader is active
      if (this._load.loader === loader) {
        Object.assign(this._load, {
          state: LOADED,
          loader: undefined,
          contents,
          loadError: undefined,
          lastLoaded: Date.now()
        })
      }
      return this.contents
    }

    const onError = async loadError => {
      // Only update if the same loader is active
      if (this._load.loader === loader) {
        Object.assign(this._load, {
          state: UNLOADED,
          loader: undefined,
          contents: undefined,
          loadError,
          lastLoaded: Date.now()
        })
        throw this.loadError
      }
      if (this.loadError) throw this.loadError
      return this.contents
    }

    try {
      loader = this.getLoader(params)
      if (!loader || !loader.then) throw new TypeError(`${this.constructor.name}.getLoader() didn't return a promise!`)
      Object.assign(this._load, {
        state: LOADING,
        loader,
        params,
        contents: undefined,
        loadError: undefined,
        lastLoaded: undefined
      })
      return loader.then(onSuccess, onError)
    } catch (e) {
      return onError(e)
    }
  }

  /**
   * Attempt to cancel the current in-flight load.
   * No-op if not loading. Attempts to minimally clean up `_load`.
   */
  stopInflightLoad() {
    if (this.isLoading) {
      const { loader } = this._load
      this._load.state = UNLOADED
      this._load.loader = undefined
      if (loader?.cancel) loader.cancel()
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
    Object.assign(this._load, {
      state: UNLOADED,
      loader: undefined,
      params: undefined,
      contents: undefined,
      loadError: undefined,
      lastLoaded: undefined
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
