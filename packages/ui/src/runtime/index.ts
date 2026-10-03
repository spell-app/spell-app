/**
 * Barrel for `$/ui/runtime` -- the shared `UI` runtime.
 * - `UI` is the page's ONE runtime instance (a lazy accessor, see `load.ts`);  `loadUI()` ~== `UI.load()`.
 *   Components:  `import { UI } from "$/ui/runtime"`, then `await UI.load()` in `connectedCallback`.
 * - NOTE: service CLASSES are exported as TYPES only.  A value export would statically import the whole
 *   runtime into every component's chunk and defeat the dynamic `import()` in `load()`.  Reach services
 *   through the instance (`UI.keyboard`, `UI.focus.roving(...)`, `UI.keyboard.chord("Mod+K")`);  tests import
 *   leaf files directly.
 * - NOTE: no `export * as UI` namespace:  `UI` IS the runtime instance, which already namespaces every service.
 */

export * from "./runtime.types"

export { UI, load as loadUI } from "./load"
export type { UIRuntime } from "./UIRuntime"
export type { Api } from "./Api"
export type { AppStylesheet } from "./AppStylesheet"
export type { Browser } from "./Browser"
export type { Chord } from "./Chord"
export type { CodeLanguages } from "./CodeLanguages"
export type { Focus } from "./Focus"
export type { I18n } from "./I18n"
export type { IconPack } from "./IconPack"
export type { IconPacks } from "./IconPacks"
export type { Ids } from "./Ids"
export type { Keyboard } from "./Keyboard"
export type { Modals } from "./Modals"
export type { Overlays } from "./Overlays"
export type { RovingTabindex } from "./RovingTabindex"
export type { Sources } from "./Sources"
export type { Styles } from "./Styles"
export type { Toasts } from "./Toasts"
export type { Transitions } from "./Transitions"
export type { Visibility } from "./Visibility"
