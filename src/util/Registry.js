export class Registry {
  constructor(props) {
    Object.assign(this, props)
    this.REGISTRY = {}
  }
  get(path) {
    if (!this.REGISTRY[path]) {
      this.REGISTRY[path] = this.makeInstanceForPath(path)
    }
    return this.REGISTRY[path]
  }
  makeInstanceForPath(path) {
    throw new TypeError("You must override makeInstanceForPath")
  }
}
