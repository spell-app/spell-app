import global from "global"
import isEqual from "lodash/isEqual"
import { observable, computed, action } from "mobx"

import { proto } from "./decorators"

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

  /** Current load state.  UNLOADED, LOADING or LOADED. */
  @observable _loadState = UNLOADED
  /** Params passed to last `load()`. */
  @observable _loadParams = undefined
  /** Last load promise, set while we're actually loading. */
  @observable _loader = undefined
  /** Contents of the last successful `load()`. */
  @observable contents = undefined
  /** Error from last failed `load()`. */
  @observable loadError = undefined
  /** When last load finished/failed. */
  @observable lastLoaded = undefined

  constructor(props) {
    Object.assign(this, props)
  }

  /** Are we currently loading? */
  @computed get isLoading() {
    return this._loadState === LOADING
  }
  /** Have we been successfully loaded? */
  @computed get isLoaded() {
    return this._loadState === LOADED
  }

  /**
   * Manually set load contents.
   * Cancels pending load. Updates state/etc as well.
   */
  @action setContents(contents) {
    this.stopInflightLoad()
    Object.assign(this, {
      _loadState: LOADED,
      _loadParams: undefined, // TODO: leave `_loadParams` alone???
      _loader: undefined,
      contents,
      loadError: undefined,
      lastLoaded: Date.now()
    })
  }

  /** A loadable is considered `expired` if it's time for it to be reloaded.
   * `undefined` means we don't know.
   * `true` means we are explicitly out of cache
   * `false` means we are explicitly within cache.
   */
  @computed get isExpired() {
    const expiryTime = this.lastLoaded + this.reloadAfter * 1000
    if (isNaN(expiryTime)) return undefined
    return Date.now() > expiryTime
  }

  /**
   * Public load method.
   * NOTE: don't override this, override `getLoader()` instead!
   */
  @action load(_loadParams) {
    // If _loadParams are the same as last time:
    if (isEqual(_loadParams, this._loadParams)) {
      // If we're currently loading, return the current loading promise
      if (this._loader) return this._loader
      // If the cached version is still good
      if (!this.isExpired) {
        // if loaded, resolve with last contents
        if (this.isLoaded) return Promise.resolve(this.contents)
        // if load error, reject with last error
        if (this.loadError) return Promise.reject(this.loadError)
      }
    }
    // Cancel current load if any
    this.stopInflightLoad()

    let _loader
    const onSuccess = action("onSuccess", async contents => {
      // Only update if the same _loader is active
      if (this._loader === _loader) {
        Object.assign(this, {
          _loadState: LOADED,
          _loader: undefined,
          _loadParams,
          contents,
          loadError: undefined,
          lastLoaded: Date.now()
        })
      }
      return this.contents
    })

    const onError = action(async loadError => {
      // Only update if the same _loader is active
      if (this._loader === _loader) {
        Object.assign(this, {
          _loadState: UNLOADED,
          _loadParams,
          _loader: undefined,
          contents: undefined,
          loadError,
          lastLoaded: Date.now()
        })
      }
      if (this.loadError) throw this.loadError
      return this.contents
    })

    try {
      _loader = this.getLoader(_loadParams)
      if (!_loader || !_loader.then)
        throw new TypeError(`${this.constructor.name}.getLoader() didn't return a promise!`)
      Object.assign(this, {
        _loadState: LOADING,
        _loader,
        _loadParams,
        contents: undefined,
        loadError: undefined,
        lastLoaded: undefined
      })
      return _loader.then(onSuccess, onError)
    } catch (e) {
      return onError(e)
    }
  }

  /**
   * Attempt to cancel the current in-flight load.
   * No-op if not loading. Attempts to minimally clean up load variables.
   */
  @action
  stopInflightLoad() {
    if (this.isLoading) {
      const { _loader } = this
      Object.assign(this, {
        _loadState: UNLOADED,
        _loader: undefined
      })
      if (_loader?.cancel) _loader.cancel()
    }
  }

  /** Force reload of the resource, ignoring expiration logic. */
  @action
  reload(_loadParams) {
    this.unload()
    return this.load(_loadParams)
  }

  /** Manual unload. */
  @action
  unload() {
    this.stopInflightLoad()
    Object.assign(this, {
      _loadState: UNLOADED,
      _loader: undefined,
      _loadParams: undefined,
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
  async getLoader(_loadParams) {
    throw new TypeError("You must override loadable.getLoader()!")
  }
}

global.Loadable = Loadable
