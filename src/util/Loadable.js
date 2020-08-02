import global from "global"
import isEqual from "lodash/isEqual"
import { batch } from "@risingstack/react-easy-state"

import { proto } from "./decorators"
import { Observable, state } from "./Observable"

/**
 * Abstract class for a loadable / possibly saveable resource.
 * Create subclasses and implement:
 *  - `getLoader()` to return loading promise and
 *  - `getSaver()` to return saving promise.
 *
 * Use `LoadableFile` and the like to load a single file by URL.
 * Use `LoadableManager` to manage more than one loadable as a group.
 */
export class Loadable extends Observable {
  /**
   * By default, we'll return cached `load()` results until you `reload()`.
   * Set to number of seconds after which we'll ignore the cache.
   * Set to `0` to never cache.
   * Useful, e.g., to reload data when they come back to the browser window after a break.
   */
  @proto cacheFor = undefined

  /** Contents of the last successful `load()`. */
  @state contents = undefined

  /**
   * Internal loadable state:
   *
   * | Property | Description |
   * |----------|-------------|
   * | **Loading**   |
   * | `isLoaded`    | `true` if we have successfully loaded.  See `.isUnloaded`, `.isLoading`, `.isLoaded`
   * | `loader`      | Promise used for the current in-flight `load()`.
   * | `loadParams`  | Params passed to current in-flight `load()`.
   * | `loadError`   | Error returned during last load.
   * | `loadTime`    | Time last `load()` succeeded or failed.
   * | **Saving**    |
   * | `isDirty`     | `true` if we need to be saved.
   * | `saver`       | Promise used for current in-flight `save()`.
   * | `saveParams`  | Params passed to current in-flight `save()`.
   * | `saveResult`  | Error returned during last successful `save()`.
   * | `saveError`   | Error returned during last failed `save()`.
   * | `saveTime`    | Time last `save()` succeeded or failed.
   */
  @state _loadable = {
    isLoaded: false
  }

  //-----------------
  // Cleanup
  //-----------------
  onRemove() {
    super.onRemove()
    this.stopInflightLoadOrSave()
  }

  //-----------------
  // State
  //-----------------

  /** Are we unloaded? */
  get isUnloaded() {
    return !this.isLoading && !this._loadable.isLoaded
  }

  /** Have we been successfully loaded? */
  get isLoaded() {
    const { isLoaded, loader } = this._loadable
    return isLoaded && !loader
  }

  /** Are we currently loading? */
  get isLoading() {
    return !!this._loadable.loader
  }

  /** Do we need to save? */
  get isDirty() {
    return !!this._loadable.isDirty
  }
  set isDirty(value) {
    setLoadableProps(this, { isDirty: !!value })
  }
  /** Are we currently saving? */
  get isSaving() {
    return !!this._loadable.saver
  }

  /** A loadable is considered `expired` if it's time for it to be reloaded.
   * `undefined` means we don't know.
   * `true` means we are explicitly out of cache
   * `false` means we are explicitly within cache.
   */
  get isExpired() {
    const expiryTime = this._loadable.loadTime + this.cacheFor * 1000
    if (isNaN(expiryTime)) return undefined
    return Date.now() > expiryTime
  }

  //-----------------
  // Loading
  //-----------------

  /**
   * Override in your subclass to return a promise used to `load()` this file.
   * Do any transformation of the result in this method.
   * Don't call this directly, it'll be called from `load()`
   */
  async getLoader(loadParams) {
    throw new TypeError("You must override loadable.getLoader()!")
  }

  /**
   * Public load method.
   * NOTE: don't override this, override `getLoader()` instead!
   */
  load(loadParams) {
    // If loadParams are the same as last time:
    if (isEqual(loadParams, this._loadable.loadParams)) {
      // If we're currently loading, return the current loader
      if (this._loadable.loader) return this._loadable.loader
      // If the cached version is still good
      if (!this.isExpired) {
        // if loaded, resolve with last contents
        if (this.isLoaded) return Promise.resolve(this.contents)
        // if load error, reject with last error
        if (this._loadable.loadError) return Promise.reject(this._loadable.loadError)
      }
    }
    // Cancel current load if any
    this.stopInflightLoadOrSave()

    let loader
    const onSuccess = async (contents) => {
      // Only update if the same `loader` is active
      if (this._loadable.loader === loader) {
        this.setContents(contents, { loadParams })
      }
      return this.contents
    }

    const onError = async (loadError) => {
      // Only update if the same `loader` is active
      if (loader === this._loadable.loader) {
        this.setContents(undefined, { isLoaded: false, loadParams, loadError })
      }
      if (this._loadable.loadError) throw this._loadable.loadError
      return this.contents
    }

    try {
      loader = this.getLoader(loadParams)
      if (!loader || !loader.then) throw new TypeError(`${this.constructor.name}.getLoader() didn't return a loader!`)
      setLoadableProps(this, { loadParams, loader })
      return loader.then(onSuccess, onError)
    } catch (e) {
      return onError(e)
    }
  }

  /** Force reload of the resource, ignoring expiration logic. */
  reload(loadParams) {
    return batch(() => {
      this.unload()
      return this.load(loadParams)
    })
  }

  /** Manual unload. */
  unload() {
    batch(() => {
      this.stopInflightLoadOrSave()
      this.resetState("contents", "_loadable")
    })
    return this
  }

  //-----------------
  // Saving
  //-----------------

  /**
   * Override in your subclass to return a promise used to `save()` this file.
   * Do any transformation of the result in this method.
   */
  getSaver(saveParams) {
    throw new TypeError("You must override saveable.getSaver()!")
  }

  /**
   * Public `save()` method. `saveParams` are same as `$fetch()` saveParams.
   * NOTE: don't override this, override `getSaver()` instead!
   */
  save(saveParams) {
    if (this.isSaving) {
      // bail early if we're already saving with equivalent `saveParams`
      if (isEqual(saveParams, this._loadable.saveParams)) return this._loadable.saver
    }
    this.stopInflightLoadOrSave()

    let saver
    const onSuccess = async (saveResults) => {
      // console.warn("saved before:", { ...this._loadable })
      // Only update if the same `saver` is active
      if (this._loadable.saver === saver) {
        setLoadableProps(this, {
          isDirty: false,
          saver: undefined,
          saveParams: undefined,
          saveResults,
          saveError: undefined,
          saveTime: Date.now()
        })
        // console.warn("saved after:", { ...this._loadable })
      }
      return this._loadable.saveResults
    }

    const onError = async (saveError) => {
      // Only update if the same `saver` is active
      if (this._loadable.saver === saver) {
        setLoadableProps(this, {
          saver: undefined,
          saveParams: undefined,
          saveResults: undefined,
          saveError,
          saveTime: Date.now()
        })
      }
      if (this._loadable.saveError) throw this._loadable.saveError
      return this._loadable.saveResults
    }

    try {
      // console.warn("saving: before", { ...this._loadable })
      saver = this.getSaver(saveParams)
      if (!saver || !saver.then) throw new TypeError(`${this.constructor.name}.getSaver() didn't return a promise!`)
      setLoadableProps(this, { saveParams, saver })
      // console.warn("saving after:", { ...this._loadable })
      return saver.then(onSuccess, onError)
    } catch (e) {
      return onError(e)
    }
  }

  //-----------------
  // Manually setting contents
  //-----------------

  /**
   * Manually set load `contents` and adjust any `loadableProps` as necessary.
   * Cancels in-flight operations if necessary.
   */
  setContents(contents, loadableProps) {
    batch(() => {
      this.stopInflightLoadOrSave()
      this.set("_state.contents", contents)
      setLoadableProps(this, {
        isLoaded: true,
        isDirty: false,
        loadError: undefined,
        loadTime: Date.now(),
        ...loadableProps
      })
      this.onContentsUpdated(contents)
    })
    return this
  }

  /**
   * Our `contents` were just updated -- recalculate any dependent variables, etc.
   * Happens inside the `batch()` where contents / load props are set.
   */
  onContentsUpdated() {}

  //-----------------
  // Internal
  //-----------------

  /**
   * Attempt to cancel the current in-flight load.
   * No-op if not loading. Attempts to minimally clean up load variables.
   */
  stopInflightLoadOrSave() {
    batch(() => {
      const { loader, saver } = this._loadable
      if (loader) {
        setLoadableProps(this, {
          isLoaded: false,
          loadParams: undefined,
          loader: undefined
        })
        if (loader.cancel) loader.cancel()
      }
      if (saver) {
        setLoadableProps(this, {
          saver: undefined,
          saveParams: undefined
        })
        if (saver.cancel) saver.cancel()
      }
    })
    return this
  }
}

//-----------------
// Utilities
//-----------------
function setLoadableProps(thing, props) {
  batch(() => {
    if (props) Object.keys(props).forEach((key) => thing.set(`_state._loadable.${key}`, props[key]))
  })
}

global.Loadable = Loadable
