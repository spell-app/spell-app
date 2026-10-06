// A leaf, not the barrel:  `$/ui/components/ui-root` defines `<ui-root>`, which the site defines only once its theme
// is in
import { RootLoader } from "$/ui/components/ui-root/RootLoader"

/****************
 * ### `DocsFamilies`
 * The doc-only families' barrels (`./ui-docs-example/index.ts` => its `import()`), and the one call that lets
 * `<ui-root>` / `<ui-include>` load them on first use:  `DocsFamilies.add()`.
 * - Called by the bundles that show docs pages (`site/_src/site.ts`), BEFORE `<ui-root>` is defined.
 * - Why not in `RootLoader`'s own glob:  the library build would make every `<ui-docs-*>` family a dynamic entry
 *   that imports the core and other families, and Rolldown then keeps core's modules out of `core.js` (epic
 *   `wwod-spell-ui`, I12).  Here, only a bundle that imports this file has them.
 * - A LITERAL glob (`BARRELS`), so each family stays a lazy chunk of its own.
 * - Static only:  the families are one set per page.
 ****************/
export class DocsFamilies {
  /** Let every root on the page load the `<ui-docs-*>` families. */
  static add(): void {
    RootLoader.add(BARRELS)
  }
}

/** Barrel path => its `import()`. */
const BARRELS: Readonly<Record<string, () => Promise<unknown>>> = import.meta.glob("./*/index.ts")
