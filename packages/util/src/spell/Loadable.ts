import isEqual from "lodash/isEqual"
import { Observable, batch } from "./Observable"

/**
 * Abstract class for a loadable / possibly saveable resource.
 * Create subclasses and implement:
 * - `getLoader()` to return loading promise.
 * - `getSaver()` to return saving promise.
 *
 * Use `LoadableFile` and the like to load a single file by URL.
 */
export abstract class Loadable<ContentType, SaveResult = unknown> extends Observable<
  LoadableProps<ContentType>,
  LoadableState<ContentType, SaveResult>
> {
  /** Contents of the last successful `load()`. */
  get contents(): ContentType | undefined {
    return this.getProp("contents")
  }
  /**
   * You can set contents manually, e.g. for a new object
   * or if loading one thing provided data for something else.
   */
  set contents(contents: ContentType | undefined) {
    batch(() => {
      this.stopInflightLoadOrSave()
      this.setProp("contents", contents)
      if (contents !== undefined) {
        this.updateLoadState({
          isLoaded: true,
          lastLoaded: Date.now(),
          loadError: undefined
        })
      } else {
        this.updateLoadState({
          isLoaded: false,
          lastLoaded: undefined,
          loadError: undefined
        })
      }
      this.onContentsUpdated()
    })
  }

  /**
   * Our `contents` were just updated -- recalculate any dependent variables, etc.
   * Happens inside the `batch()` where contents / load props are set.
   */
  onContentsUpdated() {}

  ////////////////
  // ## Cleanup
  ////////////////

  /** SIDE EFFECT: cancels any in-flight `load()` / `save()` before deferring to `super.onRemove()`. */
  onRemove() {
    super.onRemove()
    this.stopInflightLoadOrSave()
  }

  ////////////////
  // ## Load State
  ////////////////

  /** Have we been successfully loaded? */
  get isLoaded() {
    return !!this.loadState.isLoaded
  }

  /** Are we currently loading? */
  get isLoading() {
    return !!this.loadState.loader
  }

  /** Do we need to be saved? */
  get isDirty() {
    return !!this.loadState.isDirty
  }
  set isDirty(isDirty: boolean) {
    this.updateLoadState({ isDirty })
  }
  /** Are we currently saving? */
  get isSaving() {
    return !!this.loadState.saver
  }

  /** Raw `LoadState` bag, defaulting to `{ isLoaded: false }` on first access. */
  protected get loadState(): LoadState<ContentType, SaveResult> {
    return this.getState("loadState", () => ({ isLoaded: false }))
  }
  /**
   * Merge `props` into `loadState`, one `setState()` call per key.
   * - SIDE EFFECT: wraps writes in `batch()` so observers only re-render once.
   */
  protected updateLoadState(props: Partial<LoadState<ContentType, SaveResult>>) {
    if (!props) return
    batch(() => {
      Object.entries(props).forEach(([key, value]) => this.setState(`loadState.${key}`, value))
    })
  }

  ////////////////
  // ## Loading
  ////////////////

  /**
   * How long to keep cached load results before `reload()`ing automatically on `load()`.
   * - `number` means reload after that many seconds.
   * - `0` means always reload.
   * - `-1` (default) means never reload.
   */
  get cacheDuration() {
    // Default to cache forever
    return this.getProp<number>("cacheDuration", () => -1)
  }
  set cacheDuration(cacheDuration: number) {
    this.setProp("cacheDuration", cacheDuration)
  }

  /**
   * Are our cached contents still valid?
   */
  get cacheIsValid() {
    // if we've never loaded, we should reload
    if (!this.loadState.lastLoaded) return false
    // if we should cache forever, we shouldn't reload
    if (this.cacheDuration < 0) return true
    // if we should never cache, we should reload
    if (this.cacheDuration === 0) return false
    // reload if we're past the expiry time
    const expiryTime = this.loadState.lastLoaded + this.cacheDuration * 1000
    if (isNaN(expiryTime)) return false
    return expiryTime > Date.now()
  }

  /**
   * Override in your subclass to return a promise used to `load()` this file.
   * Do any transformation of the result in this method.
   * Don't call this directly, it'll be called from `load()`.
   */
  abstract getLoader(loadParams: any): Promise<ContentType>

  /**
   * Public load method.
   * NOTE: don't override this, override `getLoader()` instead!
   */
  load(loadParams?: unknown) {
    // If loadParams are the same as last time:
    if (isEqual(loadParams, this.loadState.loadParams)) {
      // If we're currently loading, return the current loader
      if (this.loadState.loader) return this.loadState.loader
      // If the cached version is still good
      if (this.cacheIsValid) {
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
        batch(() => {
          this.contents = contents
          // remember params used to load for caching
          this.updateLoadState({ loadParams })
        })
      }
      return this.contents
    }

    const onError = async (loadError: Error) => {
      // Only update if the same `loader` is active
      if (loader === this.loadState.loader) {
        batch(() => {
          this.contents = undefined
          this.updateLoadState({ loadError })
        })
      }
      if (this.loadState.loadError) throw this.loadState.loadError
      return this.contents
    }

    try {
      loader = this.getLoader(loadParams)
      if (!loader || !loader.then) throw new TypeError(`${this.constructor.name}.getLoader() didn't return a loader!`)
      // Save cancel method, e.g. from `AbortableFetch`
      const cancel = (loader as any)["cancel"] as (() => void) | undefined
      this.updateLoadState({ loadParams, loader, cancelInFlightAction: cancel })
      return loader.then(onSuccess, onError)
    } catch (error) {
      return onError(error as Error)
    }
  }

  /**
   * Force reload of the resource, ignoring expiration logic.
   * - If you pass `loadParams`, we'll use that for the new `load()`.
   * - If you don't, we'll re-use the last `loadParams`.
   */
  reload(loadParams: any = this.loadState.loadParams) {
    return batch(() => {
      this.updateLoadState({ lastLoaded: undefined })
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

  ////////////////
  // ## Saving
  ////////////////

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
          lastSaveCompleted: Date.now()
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
          lastSaveCompleted: Date.now()
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

  ////////////////
  // ## Internal
  ////////////////

  /**
   * Attempt to cancel the current in-flight load or save.
   * Does not clean up other load state variables.
   */
  stopInflightLoadOrSave() {
    batch(() => {
      if (this.loadState.cancelInFlightAction) this.loadState.cancelInFlightAction()
      this.updateLoadState({
        loader: undefined,
        saver: undefined,
        cancelInFlightAction: undefined
      })
    })
    return this
  }
}

/** Constructor props accepted by `Loadable` and its subclasses. */
export type LoadableProps<ContentType> = {
  /** Initial contents, e.g. for a new object or when a preload already has data. */
  contents?: ContentType
  /** How long (seconds) to trust a cached load before `reload()`ing.  See `cacheDuration` getter. */
  cacheDuration?: number
}

////////////////
// ## Types
////////////////

/** `Observable` state shape for `Loadable` -- just wraps `LoadState`. */
export type LoadableState<ContentType, SaveResult> = {
  /** See `Loadable.loadState`. */
  loadState: LoadState<ContentType, SaveResult>
}

/** Tracks in-flight and last-completed `load()` / `save()` for a `Loadable`. */
export type LoadState<ContentType, SaveResult> = {
  ////// Loading //////
  /** `true` if we have successfully loaded. */
  isLoaded?: boolean
  /** Promise used for the current, in-flight `load()`. */
  loader?: Promise<ContentType>
  /** Params passed to last successful `load()`. */
  loadParams?: any
  /** Error returned during last failed load. */
  loadError?: Error
  /**
   * Time last `load()` succeeded or failed,
   * or when `contents` are set manually.
   */
  lastLoaded?: number

  ////// Saving //////
  // TODO: `changes` concept!!!
  /** `true` if we need to be saved. */
  isDirty?: boolean
  /** Promise used for current, in-flight `save()`. */
  saver?: Promise<SaveResult>
  /** Params passed for currrent, in-flight `save()`. */
  saveParams?: any
  /** Error returned during last successful `save()`. */
  saveResult?: any
  /** Error returned during last failed `save()`. */
  saveError?: Error
  /** Time last `save()` succeeded or failed. */
  lastSaveCompleted?: number

  ////// Both //////
  /** Cancel any in-flight load or save. */
  cancelInFlightAction?: () => void
}
