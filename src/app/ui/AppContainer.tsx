import { spellCore } from "~/spellCore"

import "./AppContainer.css"

/****************
 * ### `<AppContainer>`
 * Holds the DOM mount point (`id={spellCore.REACT_APP_ROOT_ID}`) the compiled spell app's own React
 * root attaches to -- see `editor.selectPath()`, which unmounts whatever's there when switching projects.
 * - NOTE: imports nothing from the `UI` barrel, so the VS Code runner (`~/app/runner`) can use it
 *   without pulling in the editor.
 ****************/
export function AppContainer({ scrolling, padded }: AppContainerProps) {
  const classNames = ["AppContainer"]
  if (scrolling) classNames.push("scrolling")
  if (padded) classNames.push("padded")
  return (
    <div className={classNames.join(" ")}>
      <div id={spellCore.REACT_APP_ROOT_ID} className="App" />
    </div>
  )
}

/** Props for `<AppContainer>`. */
export type AppContainerProps = {
  /** Add `"scrolling"` class. */
  scrolling?: boolean
  /** Add `"padded"` class. */
  padded?: boolean
}
