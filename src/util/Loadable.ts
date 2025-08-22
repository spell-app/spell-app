import global from "global"
import isEqual from "lodash/isEqual"
import { batch } from "@risingstack/react-easy-state"

import { Observable } from "./Observable"

export type LoadableProps = {
  cacheDuration?: number
  // TODO: default contents?
  contents: any
  isLoaded: boolean
  isDirty: boolean
  isSaving: boolean
}
export type LoadableState = {
  ////// Loading //////
  /** `true` if we have successfully loaded. */
  isLoaded?: boolean
  /** Promise used for the current in-flight `load()`. */
  loader?: Promise<any>
  /** Params passed to current in-flight `load()`. */
  loadParams?: any
  /** Error returned during last load. */
  loadError?: Error
  /** Time last `load()` succeeded or failed. */
  loadTime?: number

  ////// Saving //////
  /** `true` if we need to be saved. */
  isDirty?: boolean
  /** Promise used for current in-flight `save()`. */
  saver?: Promise<any>
  /** Params passed to current in-flight `save()`. */
  saveParams?: any
  /** Error returned during last successful `save()`. */
  saveResult?: any
  /** Error returned during last failed `save()`. */
  saveError?: Error
  /** Time last `save()` succeeded or failed. */
  saveTime?: number

  ////// Both //////
  /** Cancel any in-flight load or save. */
  cancelInFlightAction?: () => void
}

/**
 * Abstract class for a loadable / possibly saveable resource.
 * Create subclasses and implement:
 *  - `getLoader()` to return loading promise and
 *  - `getSaver()` to return saving promise.
 *
 * Use `LoadableFile` and the like to load a single file by URL.
 */
export abstract class Loadable<ContentType extends any, SaveResult extends any> extends Observable<LoadableProps> {
  /** Contents of the last successful `load()`. */
  get contents(): ContentType | undefined {
    return this.getState("contents", () => undefined)
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

  protected get loadState(): LoadableState {
    return this.getState("loadState", () => ({ isLoaded: false }))
  }
  protected updateLoadState(props: Partial<LoadableState>) {
    if (!props) return
    batch(() => {
      Object.entries(props).forEach(([key, value]) => this.setState(`loadState.${key}`, value))
    })
  }

  /** Are we unloaded? */
  get isUnloaded() {
    return !this.isLoading && !this.loadState.isLoaded
  }

  /** Have we been successfully loaded? */
  get isLoaded() {
    const { isLoaded, loader } = this.loadState
    return isLoaded && !loader
  }

  /** Are we currently loading? */
  get isLoading() {
    return !!this.loadState.loader
  }

  /** Do we need to save? */
  get isDirty() {
    return !!this.loadState.isDirty
  }
  /** Are we currently saving? */
  get isSaving() {
    return !!this.loadState.saver
  }

  //-----------------
  // Loading
  //-----------------

  /**
   * How long to keep cached load results before reloading.
   * - `Infinity` means never reload.
   * - `0` means always reload.
   * - `number` means reload after that many seconds.
   */
  get cacheDuration() {
    return this.getProp<number>("cacheDuration", () => Infinity)
  }
  set cacheDuration(cacheDuration: number) {
    this.setProp("cacheDuration", cacheDuration)
  }

  /**
   * Assuming our load params are the same as last time, should we reload?
   */
  get isExpired() {
    if (this.cacheDuration === 0 || !this.loadState.loadTime) return true
    if (this.cacheDuration === Infinity) return false
    const expiryTime = this.loadState.loadTime + this.cacheDuration * 1000 // TODO: use `Date.now()` instead of `Date.now()`
    if (isNaN(expiryTime)) return undefined
    return Date.now() > expiryTime
  }

  /**
   * Override in your subclass to return a promise used to `load()` this file.
   * Do any transformation of the result in this method.
   * Don't call this directly, it'll be called from `load()`
   */
  abstract getLoader(loadParams: any): Promise<ContentType>

  /**
   * Public load method.
   * NOTE: don't override this, override `getLoader()` instead!
   */
  load(loadParams: any) {
    // If loadParams are the same as last time:
    if (isEqual(loadParams, this.loadState.loadParams)) {
      // If we're currently loading, return the current loader
      if (this.loadState.loader) return this.loadState.loader
      // If the cached version is still good
      if (!this.isExpired) {
        // if loaded, resolve with last contents
        if (this.isLoaded) return Promise.resolve(this.contents)
        // if load error, reject with last error
        if (this.loadState.loadError) return Promise.reject(this.loadState.loadError)
      }
    }
    // Cancel current load or save
    this.stopInflightLoadOrSave()

    let loader: Promise<any>
    const onSuccess = async (contents: ContentType) => {
      // Only update if the same `loader` is active
      if (this.loadState.loader === loader) {
        this.setContents(contents, { loadParams })
      }
      return this.contents
    }

    const onError = async (loadError: Error) => {
      // Only update if the same `loader` is active
      if (loader === this.loadState.loader) {
        this.setContents(undefined, { isLoaded: false, loadError })
        this.updateLoadState({})
      }
      if (this.loadState.loadError) throw this.loadState.loadError
      return this.contents
    }

    try {
      loader = this.getLoader(loadParams)
      // TODO: get `cancel` object from promise if there is one
      if (!loader || !loader.then) throw new TypeError(`${this.constructor.name}.getLoader() didn't return a loader!`)
      // Save cancel method, e.g. from `AbortableFetch`
      const cancel = (loader as any)["cancel"] as (() => void) | undefined
      this.updateLoadState({ loadParams, loader, cancelInFlightAction: cancel })
      return loader.then(onSuccess, onError)
    } catch (error) {
      return onError(error as Error)
    }
  }

  /** Force reload of the resource, ignoring expiration logic. */
  reload(loadParams: any) {
    return batch(() => {
      // TODO: don't unload, just reset loadTime?
      this.unload()
      return this.load(loadParams)
    })
  }

  /** Manual unload. */
  unload() {
    batch(() => {
      this.stopInflightLoadOrSave()
      this.resetState("contents", "loadState")
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
  abstract getSaver(saveParams: any): Promise<SaveResult>

  /**
   * Public `save()` method. `saveParams` are same as `$fetch()` saveParams.
   * NOTE: don't override this, override `getSaver()` instead!
   */
  save(saveParams: any) {
    if (this.isSaving) {
      // bail early if we're already saving with equivalent `saveParams`
      if (isEqual(saveParams, this.loadState.saveParams)) return this.loadState.saver
    }
    this.stopInflightLoadOrSave()

    let saver: Promise<any>
    const onSuccess = async (saveResult: any) => {
      // console.warn("saved before:", { ...this.loadState })
      // Only update if the same `saver` is active
      if (this.loadState.saver === saver) {
        this.updateLoadState({
          isDirty: false,
          saver: undefined,
          saveParams: undefined,
          saveResult,
          saveError: undefined,
          saveTime: Date.now()
        })
        // console.warn("saved after:", { ...this.loadState })
      }
      return this.loadState.saveResult
    }

    const onError = async (saveError: Error) => {
      // Only update if the same `saver` is active
      if (this.loadState.saver === saver) {
        this.updateLoadState({
          saver: undefined,
          saveParams: undefined,
          saveResult: undefined,
          saveError,
          saveTime: Date.now()
        })
      }
      if (this.loadState.saveError) throw this.loadState.saveError
      return this.loadState.saveResult
    }

    try {
      // console.warn("saving: before", { ...this.loadState })
      saver = this.getSaver(saveParams)
      if (!saver || !saver.then) throw new TypeError(`${this.constructor.name}.getSaver() didn't return a promise!`)
      this.updateLoadState({ saveParams, saver })
      // console.warn("saving after:", { ...this.loadState })
      return saver.then(onSuccess, onError)
    } catch (error) {
      return onError(error as Error)
    }
  }

  //-----------------
  // Manually setting contents
  //-----------------

  /**
   * Manually set `contents` and adjust `loadState` as necessary.
   * Cancels in-flight operations if necessary.
   */
  setContents(contents: ContentType | undefined, loadableProps: Partial<LoadableState>) {
    batch(() => {
      // The following will also clear active loader/saver
      this.stopInflightLoadOrSave()
      this.setState("contents", contents)
      this.updateLoadState({
        isLoaded: contents !== undefined,
        isDirty: false,
        loadError: undefined,
        loadTime: Date.now(),
        ...loadableProps
      })
      this.onContentsUpdated()
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
      const { loader, saver } = this.loadState
      if (this.loadState.cancelInFlightAction) this.loadState.cancelInFlightAction()

      const newState: Partial<LoadableState> = {
        cancelInFlightAction: undefined
      }
      if (loader) {
        Object.assign(newState, {
          loader: undefined,
          loadParams: undefined,
          loadError: undefined
        })
      }
      if (saver) {
        Object.assign(newState, {
          saver: undefined,
          saveParams: false,
          saveError: undefined
        })
      }
      this.updateLoadState(newState)
    })
    return this
  }
}

global.Loadable = Loadable
