import "./AppContainer.css"

/****************
 * ### `<AppContainer>`
 * Holds the element a compiled spell program draws into, handed over as `appRef`, e.g. by `<AppRoot>` to
 * `editor.setAppRoot()`.
 * - The program draws with REACT, its own root on that element (`App.start()`):  Solid draws the element once and
 *   never touches what's inside.  See `spellCore.appRoot`.
 * - Its `id` is `spellCore.REACT_APP_ROOT_ID`, where a program looks if no one says where -- WRITTEN OUT, NOT
 *   imported:  the app MUST NOT load `spellCore` itself, see `spellRuntime.ts`.
 * - NOTE: imports nothing from the `$/app/solid` barrel, so a runner could use it without pulling in the editor.
 ****************/
export function AppContainer(props: AppContainerProps) {
  return (
    <div class={["AppContainer", { scrolling: !!props.scrolling, padded: !!props.padded }]}>
      <div ref={(element) => props.appRef?.(element)} id="spell-app-root" class="App" />
    </div>
  )
}

/** Props for `<AppContainer>`. */
export type AppContainerProps = {
  /** Scrolls the program's drawing. */
  scrolling?: boolean
  /** Padding around the program's drawing. */
  padded?: boolean
  /** Hand over where the program draws, once drawn. */
  appRef?: (element: HTMLDivElement) => void
}
