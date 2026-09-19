//
//  ## Master import file for the form system.
//
//  NOTE: `./wrappers` (`FieldWrapper` / `WithField()` / `WithForm()`) is the machinery
//  `./components` is built from.  Exported so peers can reach it as `F.WithField` etc --
//  app code should generally stick to `F.Form`, `F.Input`, `F.Select`.
//

export * from "./Form"
export * from "./FormStore"
export * from "./wrappers"
export * from "./components"

/** Everything above as the `F` barrel, e.g. `F.Form`, `F.Input`, `F.Select`. */
export * as F from "."
