const testArray = []

/** Lord-help me, I can't help myself! */
// eslint-disable-next-line no-extend-native
if (testArray.last !== undefined) throw new TypeError("Attempting to extend array.last when it's already defined!")
Object.defineProperty(Array.prototype, "last", {
  get() {
    return this[this.length - 1]
  }
})

/** Lord-help me, I can't help myself! */
// eslint-disable-next-line no-extend-native
if (testArray.remove !== undefined) throw new TypeError("Attempting to extend array.remove when it's already defined!")
Object.defineProperty(Array.prototype, "remove", {
  value(valueToRemove) {
    while (true) {
      const index = this.indexOf(valueToRemove)
      if (index === -1) return
      this.splice(index, 1)
    }
  }
})
