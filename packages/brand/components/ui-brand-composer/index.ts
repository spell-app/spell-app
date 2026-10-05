/**
 * `ui-brand-composer` family barrel:  defines `<ui-brand-composer>` (SIDE EFFECT) and exports its class and host.
 */
import { UIBrandComposer } from "./UIBrandComposer"
import { BrandComposerHost } from "./BrandComposerHost"

UIBrandComposer.define()

export { UIBrandComposer, BrandComposerHost }
