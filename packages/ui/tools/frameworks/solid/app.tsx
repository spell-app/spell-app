import { createContext, createSignal, Show, useContext } from "solid-js"
import { render } from "@solidjs/web"

import type { SolidIdentityHook } from "../../tools.types.ts"

/**
 * The Solid 2 host app of `solid.html`, compiled by `HostApp` (`@solidjs/vite-plugin`) with `solid-js` and
 * `@solidjs/web` EXTERNAL:  the page's import map decides which copy runs.
 * - The plain "Solid 2 app consuming custom elements" round trip -- an app signal drives `prop:value` /
 *   `prop:open` (`hostSetsValue`, `hostOpens`), `ui-change` writes the signal (`pickUpdatesHost`), `options` is a
 *   `prop:` binding, the app's own context works (`appContext`), and unmounting releases the runtime's overlay
 *   entry (`unmount`, `overlaysAfterUnmount`).
 * - The page's identity probe (`identity.js`) sets `globalThis.__uiSolidIdentity` (`SolidIdentityHook`), and then:
 *   - `solidIdentity` / `webIdentity` -- the app's `createSignal` / `render` ARE the functions the components' copy
 *     exports (one module instance on the page)
 *   - `contextReachesComponent` -- the app sets `appContext` on the `<ui-root>` around the dropdown,
 *     and `hook.read(el)` sees the app's value inside the component (`UIComponent.appContext`:
 *     a Solid context can't cross the custom-element boundary, epic `spell-element` Q9)
 *   - without the hook these report `n/a`
 * - Solid 2 notes:  no `on:` namespace any more, so `ui-*` listeners go on through a `ref` callback;
 *   signal writes happen only in event handlers (never in an owned scope).
 */
export function mount(root: HTMLElement, options: readonly Option[]): MountedApp {
  const hook = (globalThis as { __uiSolidIdentity?: SolidIdentityHook }).__uiSolidIdentity
  const [value, setValue] = createSignal("b")
  const [open, setOpen] = createSignal(true)
  const [mounted, setMounted] = createSignal(true)

  render(
    () => (
      <Theme value={THEME}>
        <ui-root prop:appContext={APP_CONTEXT_VALUE}>
          <Show when={mounted()}>
            <ui-dropdown
              selection
              placeholder="Fruit"
              prop:options={options}
              prop:value={value()}
              prop:open={open()}
              ref={listen}
            />
          </Show>
        </ui-root>
        <p>
          Solid state: <output id="value">{value()}</output>
        </p>
        <ThemeName />
        <button id="set" type="button" onClick={() => setValue("c")}>
          set cherry
        </button>
        <button id="open" type="button" onClick={() => setOpen(true)}>
          open
        </button>
        <button id="unmount" type="button" onClick={() => setMounted(false)}>
          unmount
        </button>
      </Theme>
    ),
    root
  )

  return { label: `solid ${SOLID_VERSION} (app)${hook ? " + identity hook" : ""}`, extra }

  /** `ui-*` listeners:  Solid 2 dropped `on:`, a ref callback adds them once. */
  function listen(element: HTMLElement) {
    element.addEventListener("ui-change", (event) => setValue(String((event as CustomEvent).detail.value)))
    element.addEventListener("ui-open", () => setOpen(true))
    element.addEventListener("ui-close", () => setOpen(false))
  }

  /** Solid-specific checks, run after the shared round trip. */
  async function extra(): Promise<Record<string, unknown>> {
    const checks: Record<string, unknown> = {}
    const dropdown = document.querySelector("ui-dropdown")!
    checks.appContext = document.querySelector("#theme")?.textContent === THEME
    checks.solidIdentity = hook ? hook.solidJs.createSignal === createSignal : NO_HOOK
    checks.webIdentity = hook?.web ? hook.web.render === render : NO_HOOK
    checks.contextReachesComponent = hook?.read ? hook.read(dropdown) === APP_CONTEXT_VALUE : NO_HOOK
    document.querySelector<HTMLButtonElement>("#unmount")!.click()
    checks.unmount = await eventually(() => !document.querySelector("ui-dropdown"))
    const runtime = (globalThis as Record<symbol, { overlays?: { entries?: unknown[] } }>)[RUNTIME_KEY]
    const entries = runtime?.overlays?.entries
    checks.overlaysAfterUnmount = entries ? await eventually(() => entries.length === 0) : "n/a (no runtime)"
    return checks
  }
}

/** `mount()` result:  the label for the report, and the Solid-specific checks. */
export type MountedApp = { label: string; extra: () => Promise<Record<string, unknown>> }

/** One dropdown option. */
export type Option = { value: string; text: string }

/** The app's OWN context:  proves app context works beside the elements. */
const Theme = createContext("light")

/** Value the app provides for `Theme`. */
const THEME = "dark"

/** Value the app sets as its `<ui-root>`'s `appContext`. */
const APP_CONTEXT_VALUE = "from-the-app"

/** Reported for identity checks when the page sets no hook. */
const NO_HOOK = "n/a (no __uiSolidIdentity hook)"

/** Page-wide `UI` runtime key (`$/ui/runtime`'s `RUNTIME_KEY`), read without importing the foundation. */
const RUNTIME_KEY = Symbol.for("@spell-app/ui:runtime")

/** Version of `solid-js` the app was COMPILED against (the page may load another). */
declare const __SOLID_VERSION__: string
const SOLID_VERSION = __SOLID_VERSION__

/** Renders the `Theme` the app sees. */
function ThemeName() {
  const theme = useContext(Theme)
  return <span id="theme">{theme}</span>
}

/** `true` once `test()` holds, `false` after 3 s. */
function eventually(test: () => boolean): Promise<boolean> {
  const start = performance.now()
  return new Promise((resolve) => poll(resolve))

  /** One try every 20 ms. */
  function poll(resolve: (value: boolean) => void) {
    if (test()) resolve(true)
    else if (performance.now() - start > 3000) resolve(false)
    else setTimeout(() => poll(resolve), 20)
  }
}

declare module "@solidjs/web/types/jsx.js" {
  // NOTE: `interface`, not `type`:  declaration merging is the only way to add a custom tag to Solid's JSX
  namespace JSX {
    interface IntrinsicElements {
      // NOTE: the one `ui-dropdown` JSX type in `ui`'s program:  the docs elements (`src/docs-components/`) render
      // it too, with Fomantic's class words (`floating`, `button` ...), hence the index signature
      "ui-dropdown": JSX.HTMLAttributes<HTMLElement> & {
        selection?: boolean
        placeholder?: string
        "prop:options"?: readonly Option[]
        "prop:value"?: string
        "prop:open"?: boolean
        [attribute: string]: unknown
      }
      /** the app's value for the elements inside it (`UIComponent.appContext`) */
      "ui-root": JSX.HTMLAttributes<HTMLElement> & { "prop:appContext"?: unknown }
    }
  }
}
