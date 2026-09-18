import StorageShim from "node-storage-shim"
import { hasOwnProp } from "./class"

/**
 * Set of preferences, currently stored in `localStorage`.
 * Initialize with a unique `appPrefix`, e.g. the name of your app.
 */
export class AppPrefStore {
  /**
   * Name for your application, to keep your keys separate from other apps.
   * Pass a unique key on construction.
   */
  #APP_PREFIX: string

  /** Key/Value store where we store data. */
  #store =
    typeof window !== "undefined" && typeof window.localStorage !== "undefined"
      ? window.localStorage
      : new StorageShim()

  constructor(appPrefix: string) {
    this.#APP_PREFIX = `${appPrefix}::`
  }

  getStoreKey(key: string) {
    return `${this.#APP_PREFIX}${key}`
  }
  removeStoreKey(key: string) {
    if (key.startsWith(this.#APP_PREFIX)) return key.substring(this.#APP_PREFIX.length)
    return key
  }

  /** Return `true` if our store has an item under `key`. */
  has(key: string) {
    return hasOwnProp(this.#store, this.getStoreKey(key))
  }

  /**
   * Get a preference by `key`, returning `_default` if never set.
   */
  get<T>(key: string): T | undefined
  get<T>(key: string, _default: T): T
  get<T>(key: string, _default: T | undefined): T | undefined
  get<T>(key: string, _default?: T): T | undefined {
    if (!this.has(key)) return _default
    const value = this.#store.getItem(this.getStoreKey(key))!
    return JSON.parse(value) as T
  }

  /**
   * Set a preference `value` under `key`.
   * - Returns value as it was stored.
   */
  set = <T>(key: string, value: T) => {
    const jsonValue = JSON.stringify(value)
    this.#store.setItem(this.getStoreKey(key), jsonValue)
    return value
  }

  /** Clear pref a specific `key`. */
  clear = (key: string) => {
    this.#store.removeItem(this.getStoreKey(key))
  }

  /** Clear all keys which starts with a particular prefix. */
  clearForPrefix = (prefix: string) => {
    this.keys.forEach((key) => {
      if (key.startsWith(prefix)) this.clear(key)
    })
  }

  /** Clear all keys. */
  clearAll = () => this.clearForPrefix("")

  /** Return all `keys` in store WITHOUT app prefix. */
  get keys() {
    const keys: string[] = []
    for (let index = 0, length = this.#store.length; index < length; index++) {
      const key = this.#store.key(index)
      if (key?.startsWith(this.#APP_PREFIX)) keys.push(this.removeStoreKey(key))
    }
    return keys
  }
}
