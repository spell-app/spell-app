/**
 * The React bridge:  `view(Component)` re-renders a React component when a spell cell it read while rendering
 * changes -- what `easy-state`'s `view()` did, on cells.
 * - Compiled spell still draws with React (`Thing.Component`, `List`, spell's forms `F`), so React must follow
 *   spell state as Solid does through `bridgeSolid()`.
 * - Each instance has a `Reaction`:  its render runs inside it;  a cell it read changing forces an update.  Only a
 *   derived value it read changing:  checked on a microtask first, see `Reaction`.
 * - NEVER for a change its own render makes -- see `Reaction`.
 * - React batches the updates, so ten writes in a click re-render it once.
 * - NOTE: imports `react`, so only what draws with React should import this:  `$/util`'s other files never do.
 */

import React from "react"

import { Reaction } from "$/util/reactive"

/**
 * `Component`, re-rendering when a cell its render read changes.
 * - A class component:  a subclass, whose instances wrap whatever `render()` they have (a subclass's too).
 * - A function component:  a wrapper calling it inside the reaction.  Its statics are copied over.
 * - NEVER wrap a `forwardRef` / `memo` OBJECT (e.g. every `semantic-ui-react` component):  only functions and
 *   classes render through here.
 */
export function view<C extends React.ComponentType<any>>(Component: C): C {
  const viewed = isClassComponent(Component) ? viewClass(Component) : viewFunction(Component as React.FC<any>)
  return viewed as unknown as C
}

/** A class component's subclass, each instance rendering in its own `Reaction`. */
function viewClass(Base: React.ComponentClass<any>): React.ComponentClass<any> {
  class Viewed extends Base {
    constructor(props: any, context?: any) {
      super(props, context)
      const reaction = new Reaction(() => this.forceUpdate())
      const render = this.render
      this.render = () => reaction.run(() => render.call(this))
      const unmount = this.componentWillUnmount
      this.componentWillUnmount = () => {
        reaction.dispose()
        unmount?.call(this)
      }
    }
  }
  Object.defineProperty(Viewed, "name", { value: Base.name })
  return Viewed
}

/** A function component's wrapper, rendering it in a `Reaction` kept for the component's life. */
function viewFunction(render: React.FC<any>): React.FC<any> {
  function Viewed(props: any) {
    const [, forceUpdate] = React.useReducer((count: number) => count + 1, 0)
    // made once, kept for the component's life:  `useState()`'s initializer
    const [state] = React.useState(() => ({ reaction: new Reaction(forceUpdate), disposed: false }))
    React.useEffect(() => {
      // remounted, e.g. by StrictMode:  render again, so it reads -- and follows -- its cells again
      if (state.disposed) {
        state.disposed = false
        forceUpdate()
      }
      return () => {
        state.reaction.dispose()
        state.disposed = true
      }
    }, [state])
    return state.reaction.run(() => render(props))
  }
  Object.assign(Viewed, render)
  Object.defineProperty(Viewed, "name", { value: render.name })
  if (render.displayName) Viewed.displayName = render.displayName
  return Viewed as React.FC<any>
}

/** Is `Component` a class component, rather than a function? */
function isClassComponent(Component: React.ComponentType<any>): Component is React.ComponentClass<any> {
  return !!(Component as { prototype?: { isReactComponent?: unknown } }).prototype?.isReactComponent
}
