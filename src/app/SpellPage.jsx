import React from "react"
import classnames from "classnames"

import "./SpellPage.less"

/**
 * <SpellPage> component.
 * TODOC!
 */
export function SpellPage(props) {
  const {
    bordered = false, // bordered variant
    dark = false, // dark variant
    fillWindow = false, // fill window completely.  alias for `full`
    light = false, // light variant
    rounded = false, // rounded variant
    spaced = false, // spaced variant (around page)
    padded = false, // padding (within page)
    scrolling = false, // scrolling variant
    flex = true, // use flexbox for children? Values: `true` (rows), `rows` or `columns`.

    // other props, e.g. `children`, id`, `style`, aria-stuff, etc...
    ...renderProps
  } = props

  renderProps.className = classnames(
    {
      bordered,
      dark,
      "fill-window": fillWindow,
      flexible: !!flex,
      rows: flex === true || flex === "rows",
      columns: flex === "columns",
      light,
      rounded,
      spaced,
      padded,
      scrolling
    },
    "SpellPage",
    renderProps.className
  )
  return <div {...renderProps} />
}
