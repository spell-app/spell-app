/** @jsxImportSource react */
import "./AppContainer.css"

/****************
 * ### `<AppContainer>`
 * Holds the DOM mount point the compiled spell app's own React root attaches to -- handed over as `appRef`,
 * e.g. to `editor.setAppRoot()`, for `runApp()`.
 * - Its `id` is `spellCore.REACT_APP_ROOT_ID`, where an app looks if no one says where -- WRITTEN OUT, NOT imported:
 *   the app MUST NOT load `spellCore` itself, see `spellRuntime.ts`.
 * - NOTE: imports nothing from the `UI` barrel, so a runner could use it without pulling in the editor.
 ****************/
export function AppContainer({ scrolling, padded, appRef }: AppContainerProps) {
  const classNames = ["AppContainer"]
  if (scrolling) classNames.push("scrolling")
  if (padded) classNames.push("padded")
  return (
    <div className={classNames.join(" ")}>
      <div ref={appRef} id="spell-app-root" className="App" />
    </div>
  )
}

/** Props for `<AppContainer>`. */
export type AppContainerProps = {
  /** Add `"scrolling"` class. */
  scrolling?: boolean
  /** Add `"padded"` class. */
  padded?: boolean
  /** Hand over the mount point, e.g. `editor.setAppRoot` -- `null` when it goes. */
  appRef?: (element: HTMLDivElement | null) => void
}
