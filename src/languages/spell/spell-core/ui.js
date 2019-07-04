//////////
// UI interaction thingers for spell
// TODO: these are maybe not core, since they're tied into particular UI???
//--------
import spell from "."
Object.assign(spell, {
  // Notify user about `message` in a non-modal (popup?) interface.
  // `message` can be a string or a JSX expression.
  // If `okButton` is specified, they have to click a button to make the notice go away.
  // Pass `okButton = true` for a simple `(x)` close icon.
  notify(message, okButton) {},

  // Show `message` in a modal alert.
  // `message` can be a string or a JSX expression.
  // Returns a promise which resolves when they click `ok`.
  alert(message, okButton = "OK") {},

  // Show modal alert to warn user about `message`.
  // `message` can be a string or a JSX expression.
  // Returns a promise which resolves when they click `ok`.
  warn(message, okButton = "OK") {},

  // Show modal alert to confirm whether user approves some `message`.
  // `message` can be a string or a JSX expression.
  // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
  confirm(message, okButton = "OK", cancelButton = "cancel") {},

  // Show modal alert to prompt user for `value` for some `message`.
  // `message` can be a string or a JSX expression.
  // Returns a promise which `resolve(value)`s when they `ok`, `reject()`s if they `cancel`.
  confirm(message, okButton = "OK", cancelButton = "cancel") {},

  // Show modal alert to choose one item from `collection` with `defaultValue`
  // `message` can be a string or a JSX expression.
  // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
  chooseOne(message, collection, defaultValue, okButton = "OK", cancelButton = "cancel") {},

  // Show modal alert to choose one or more items from `collection` with `defaultValues`
  // `message` can be a string or a JSX expression.
  // Returns a promise which `resolve()`s when they `ok`, `reject()`s if they `cancel`.
  chooseMultiple(message, collection, defaultValues, okButton = "OK", cancelButton = "cancel") {},
})
