import React from "react"
import { createComponent, createSignal, flush, type Component } from "solid-js"
import { render } from "@solidjs/web"

/**
 * A React component that renders the Solid `component` inside it:  a SOLID ISLAND in a React page.
 * - While pages are React and their parts move to Solid one by one (bottom-up, plan doc `solid-migration` D14):
 *   a React page keeps writing `<UI.Islands.ConsoleRoot />`, which mounts the Solid `ConsoleRoot` here.
 *   P8 moves the pages to Solid, and this goes.
 * - Props stay live:  each React render hands the latest props to the Solid component, which reads them lazily
 *   (`props.x` where used), so only what changed re-runs.
 * - The wrapper is a `<div class="SolidIsland" style="display: contents">`, so it doesn't box the island;  `wrapper`
 *   adds a `class` / `id` when the page's CSS targets it.
 *   - NOTE: a parent's `> *` rule now matches the wrapper, which takes no box:  reach through it with
 *     `> .SolidIsland > *` (see `SplitPanel.css`).
 * - Each island is its own Solid root:  Solid context doesn't cross from one island to another.
 * - NOTE: no JSX here (it's React's AND Solid's), so this file is `.ts`.
 */
export function solidIsland<P extends object>(component: Component<P>, wrapper: IslandWrapper = {}): React.FC<P> {
  function SolidIsland(props: P) {
    const element = React.useRef<HTMLDivElement>(null)
    const island = React.useRef<Island<P> | undefined>(undefined)
    React.useLayoutEffect(() => {
      island.current = mount(component, element.current!, props)
      return () => island.current?.dispose()
      // oxlint-disable-next-line react-hooks/exhaustive-deps -- mount ONCE;  the effect below hands on new props
    }, [])
    React.useLayoutEffect(() => {
      island.current?.update(props)
    })
    const className = wrapper.className ? `SolidIsland ${wrapper.className}` : "SolidIsland"
    return React.createElement("div", { ref: element, style: { display: "contents" }, id: wrapper.id, className })
  }
  SolidIsland.displayName = `SolidIsland(${component.name || "anonymous"})`
  return SolidIsland
}

/** `class` / `id` for an island's wrapper `<div>`. */
export type IslandWrapper = {
  /** Class of the wrapper, e.g. for a page's layout CSS. */
  className?: string
  /** Id of the wrapper. */
  id?: string
}

/** A mounted Solid island:  hand it new props, or dispose it. */
type Island<P> = {
  /** Replace the props;  readers of a changed prop re-run, flushed at once so React and Solid agree. */
  update(props: P): void
  /** Unmount the Solid component. */
  dispose(): void
}

/**
 * Render `component` into `element` with `props`, kept live through a signal.
 * - Props are a proxy whose every read goes through the signal, so a Solid read of `props.x` tracks it.
 */
function mount<P extends object>(component: Component<P>, element: HTMLElement, props: P): Island<P> {
  const [current, setCurrent] = createSignal<{ props: P }>({ props }, { equals: false })
  const live = new Proxy({} as P, {
    get: (_target, key) => (current().props as Record<PropertyKey, unknown>)[key],
    has: (_target, key) => key in current().props,
    ownKeys: () => Reflect.ownKeys(current().props),
    getOwnPropertyDescriptor: (_target, key) => {
      const value = (current().props as Record<PropertyKey, unknown>)[key]
      return key in current().props ? { value, enumerable: true, configurable: true } : undefined
    }
  })
  const dispose = render(() => createComponent(component, live), element)
  return {
    update(next) {
      setCurrent({ props: next })
      flush()
    },
    dispose
  }
}
