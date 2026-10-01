/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` (https://github.com/solidjs/solid/tree/next/packages/element) and
 * `component-register` (https://github.com/ryansolid/component-register), both MIT, (c) Ryan Carniato.
 */

/**
 * `@spell-app/solid-element`:  custom elements for Solid 2, a SUPERSET of `@solidjs/element`'s API.
 * - Same `customElement(tag, props?, Component)`, `withSolid`, `noShadowDOM`, `getCurrentElement`, `hot`;
 *   `component-register`'s `register` / `compose` too, so its README patterns keep working.
 * - Additions:  the `options` 4th argument, prop definitions (`type`, `converter`, `property` ...), lifecycle and
 *   form hooks, `element.dispose()`.  See `README.md`;  each fix is its own module (`UPSTREAM.md`).
 * - Hot module replacement:  `hot` (webpack), `hotUpdate` / `reloadElement(s)` / `liveElements` (Vite);  the Vite
 *   plugin is a separate entry, `@spell-app/solid-element/vite` (node-side, never in this barrel).
 * - NOTE: `component-register`'s context helpers (`createContext` / `provide` / `consume`) are left out:  Solid's
 *   own context crosses elements (owner lookup, fix 8).
 */

export * from "./solid-element.types"
export { compose, customElement, register } from "./customElement"
export { createProps, withSolid } from "./withSolid"
export { getCurrentElement, noShadowDOM } from "./current"
export { onConnect, onDisconnect } from "./lifecycle"
export { onFormAssociated, onFormDisabled, onFormReset, onFormStateRestore } from "./internals"
export { toAttribute } from "./props"
export { hot, hotUpdate, liveElements, reloadElement, reloadElements } from "./hot"
