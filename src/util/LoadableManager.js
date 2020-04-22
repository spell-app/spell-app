import { Loadable } from "./Loadable"

/**
 * `Loadable` which manages a set of other `Loadables` rather than loading itself.
 */
export class LoadableManager extends Loadable {
  /** Array of loadable objects that we manage. */
  get loadables() {
    throw new TypeError("You must override this.lodables!")
  }

  getLoader(params) {
    return Promise.all(this.loadables.map(loadable => loadable.load(params)))
  }

  unload() {
    super.unload()
    this.loadables.forEach(loadable => loadable.unload())
  }

  stopInflightLoad() {
    super.stopInflightLoad()
    this.loadables.forEach(loadable => loadable.stopInflightLoad())
  }
}
