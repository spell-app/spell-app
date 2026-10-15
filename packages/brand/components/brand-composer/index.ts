/**
 * The brand composer family:  defines `<brand-composer>`, and exports its component, `BrandComposer`,
 * and its DOM element class, `DOMBrandComposerElement`.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { DOMBrandComposerElement, BrandComposer } from "./BrandComposer"

BrandComposer.define()

export { BrandComposer, DOMBrandComposerElement }
