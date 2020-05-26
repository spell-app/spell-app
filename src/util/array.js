/** Lord-help me, I can't help myself! */
// eslint-disable-next-line no-extend-native
Object.defineProperty(Array.prototype, "last", {
  get() {
    return this[this.length - 1]
  }
})
