/**
 * The brand composer family:  defines `<ui-brand-composer>`, and exports its component, `UIBrandComposer`,
 * and its DOM element class, `DOMBrandComposerElement`.
 * - SIDE EFFECT:  importing it defines the tag.
 */
import { DOMBrandComposerElement, UIBrandComposer } from "./UIBrandComposer"

UIBrandComposer.define()

export { UIBrandComposer, DOMBrandComposerElement }
