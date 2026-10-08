/*!
 * @spell-app/solid-element -- MIT licence.
 * A fork of `@solidjs/element` and `component-register` (MIT, (c) Ryan Carniato).
 */

/**
 * The element class, assembled from the fix modules;  `component-register`'s `createElementType` rewritten.
 * - Constructor:  base class first, bookkeeping, internals (fix 5), upgrade capture (fix 2).
 * - Prototype:  prop accessors (fix 2), `renderRoot` (fix 9), form callbacks (fix 5), `component-register`'s
 *   instance API (`addReleaseCallback`, `addPropertyChangedCallback`, `lookupProp`) plus `dispose()` (fix 6).
 */

import { attributeChanged } from "./attributes"
import { runHooks } from "./current"
import { connected, disconnected, dispose } from "./lifecycle"
import { attachInternals } from "./internals"
import { initialValue } from "./props"
import { resolveRenderRoot } from "./shadowRoot"
import { captureUpgradeProperties, defineAccessors } from "./upgrade"
// dev only:  a build drops the call (`import.meta.hot`), and with it this module's code
import { trackElement } from "./hot"
import {
  STATE,
  type ElementOptions,
  type ElementState,
  type FunctionComponent,
  type NormalizedProps,
  type PropertyChangedCallback,
  type SolidElement,
  type SolidElementClass
} from "./solid-element.types"

/** Build (not define) the element class for `tag`. */
export function createElementClass(
  tag: string,
  props: NormalizedProps,
  Component: FunctionComponent<any>,
  options: ElementOptions
): SolidElementClass {
  const Base = options.BaseElement ?? HTMLElement
  const wantsInternals = !!(options.formAssociated || options.internals)

  const name = className(tag)
  const Class = {
    [name]: class extends Base {
      declare [STATE]: ElementState
      declare internals?: ElementInternals

      /** Resolved props;  read by the lifecycle. */
      static readonly props = props

      /** Options it was defined with. */
      static readonly options = options

      /** Tag it was defined as. */
      static readonly tag = tag

      /** Current component;  `register()` swaps it on hot reload (with `props` / `options`, in place:  `hot.ts`). */
      static Component = Component

      /** Every attribute a prop observes. */
      static get observedAttributes() {
        return [...props.byAttribute.keys()]
      }

      constructor() {
        super()
        const self = this as unknown as SolidElement
        const values: Record<string, unknown> = {}
        for (const prop of props.list) values[prop.key] = initialValue(prop)
        self[STATE] = {
          values,
          initialized: false,
          releaseCallbacks: [],
          propertyChangedCallbacks: [],
          hooks: {},
          last: {}
        }
        attachInternals(self, wantsInternals)
        captureUpgradeProperties(self, props)
        // dev only (a build replaces `import.meta.hot` with `undefined`):  hot reload finds its instances
        if (import.meta.hot) trackElement(self)
      }

      connectedCallback() {
        connected(this as unknown as SolidElement)
      }

      disconnectedCallback() {
        disconnected(this as unknown as SolidElement)
      }

      attributeChangedCallback(name: string, _old: string | null, value: string | null) {
        attributeChanged(this as unknown as SolidElement, props.byAttribute.get(name), value)
      }

      /** Shadow root, adopted declarative root, or the element itself. */
      get renderRoot(): HTMLElement | ShadowRoot {
        return resolveRenderRoot(this as unknown as SolidElement, options)
      }

      /** Run `fn` when the component is disposed. */
      addReleaseCallback(fn: (element: SolidElement) => void) {
        this[STATE].releaseCallbacks.push(fn)
      }

      /** Run `fn` on every prop write until disposed. */
      addPropertyChangedCallback(fn: PropertyChangedCallback) {
        this[STATE].propertyChangedCallbacks.push(fn)
      }

      /** Definition key for an attribute name or key. */
      lookupProp(name: string): string | undefined {
        return props.byAttribute.get(name)?.key ?? props.byKey.get(name)?.key
      }

      /** Dispose the component now;  the next connect renders afresh. */
      dispose() {
        dispose(this as unknown as SolidElement)
      }

      ////////////////
      // ## Form callbacks (fix 5)
      ////////////////

      formAssociatedCallback(form: HTMLFormElement | null) {
        ;(Base.prototype as FormCallbacks).formAssociatedCallback?.call(this, form)
        runHooks(this as unknown as SolidElement, "formAssociated", form)
      }

      formDisabledCallback(disabled: boolean) {
        ;(Base.prototype as FormCallbacks).formDisabledCallback?.call(this, disabled)
        runHooks(this as unknown as SolidElement, "formDisabled", disabled)
      }

      formResetCallback() {
        ;(Base.prototype as FormCallbacks).formResetCallback?.call(this)
        runHooks(this as unknown as SolidElement, "formReset")
      }

      formStateRestoreCallback(state: unknown, mode: string) {
        ;(Base.prototype as FormCallbacks).formStateRestoreCallback?.call(this, state, mode)
        runHooks(this as unknown as SolidElement, "formStateRestore", state, mode)
      }
    }
  }[name]!
  if (options.formAssociated !== undefined) {
    Object.defineProperty(Class, "formAssociated", { value: options.formAssociated })
  }
  defineAccessors(Class.prototype, props)
  return Class as unknown as SolidElementClass
}

/** Readable class name for devtools:  `my-counter` => `MyCounter`. */
function className(tag: string): string {
  return tag.replace(/(^|-)(\w)/g, (_match, _dash, char: string) => char.toUpperCase()).replace(/\W/g, "")
}

/** Form callbacks a base class may define;  each forwarder calls the base's first. */
type FormCallbacks = {
  formAssociatedCallback?(form: HTMLFormElement | null): void
  formDisabledCallback?(disabled: boolean): void
  formResetCallback?(): void
  formStateRestoreCallback?(state: unknown, mode: string): void
}
