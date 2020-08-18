/**
 * The following adds the ability to add arbitrary "watch" expressions on reactive properties in observables.
 * It's not currently in use by spell, removing for now to lower surface area.
 */

// /**
//  * Watch some `callback`, re-executing when observable props or state change.
//  * Returns `reaction` which you can use to `.clearWatch()` later.
//  *
//  * NOTE: you must `clearWatch()` yourself or manually call `onRemove()`
//  * or you'll get a memory leak.  :-(
//  */
// watch(callback) {
//   const reaction = autoEffect((...args) => callback.apply(this, args))
//   if (!this._reactions) Object.defineProperty(this, "_reactions", { value: [] })
//   this._reactions.push(reaction)
//   return reaction
// }
// /** Clear a `reaction` generated from `this.watch()` */
// clearWatch(reaction) {
//   clearEffect(reaction)
//   const index = this._reactions ? this._reactions.indexOf(reaction) : -1
//   if (index !== -1) this._reactions.splice(index, 1)
// }

// /** Clean up all `watch`es `onRemove()` (which must be called manually). */
// onRemove() {
//   if (this._reactions) this._reactions.forEach((reaction) => clearEffect(reaction))
// }
