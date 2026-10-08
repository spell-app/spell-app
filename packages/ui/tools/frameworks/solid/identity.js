/**
 * The Solid 2 host page's identity probe (`SolidIdentityHook` in `tools.types.ts`):  sets
 * `globalThis.__uiSolidIdentity`, so the host app (`app.tsx`) can PROVE it shares one `solid-js` / `@solidjs/web`
 * with the components, and that its context reaches them.
 * - A PAGE module, never shipped code:  `solid-js`, `@solidjs/web` and `@spell-app/ui/core` resolve through the page's
 *   import map, i.e. the same vendored files the components load.
 * - Bindings, not `import * as` namespaces:  a namespace import keeps every export of a package alive (in a bundle,
 *   and in what `yarn vendor` must ship), so the vendored Solid couldn't shrink to the bindings in use.  The same
 *   function object in app and components ~== one module instance.
 * - `context`:  `UIComponent.AppContext`, which every component reads as `appContext`;  `read(el)` returns what it saw.
 * - MUST load before the app mounts (`solid.html` imports it first).
 * - SIDE EFFECT:  that global.
 */

import { createSignal } from "solid-js"
import { render } from "@solidjs/web"
import { UIComponent } from "@spell-app/ui/core"

globalThis.__uiSolidIdentity = {
  solidJs: { createSignal },
  web: { render },
  context: UIComponent.AppContext,
  read: (element) => element.component?.appContext
}
