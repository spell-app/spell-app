import React from "react"
import classnames from "classnames"

import "./SpellPage.less"

/**
 * <SpellPage> component.
 * TODOC!
 */
export function SpellPage(props: SpellPageProps) {
  const {
    bordered = false, // bordered variant
    dark = false, // dark variant
    fillWindow = false, // fill window completely.  alias for `full`
    light = false, // light variant
    rounded = false, // rounded variant
    spaced = false, // spaced variant (around page)
    padded = false, // padding (within page)
    scrolling = false, // scrolling variant
    rows = false, // use flexbox to lay children out in rows, down the page.
    columns = false, // use flexbox to lay children out in columns, across the page.
    // other props, e.g. `children`, id`, `style`, aria-stuff, etc...
    ...renderProps
  } = props

  const className = classnames(
    {
      bordered,
      dark,
      "fill-window": fillWindow,
      rows,
      columns,
      light,
      rounded,
      spaced,
      padded,
      scrolling
    },
    "SpellPage",
    renderProps.className
  )
  return <div {...renderProps} className={className} />
}

export type SpellPageProps = React.ComponentPropsWithoutRef<"div"> & {
  bordered?: boolean // bordered variant
  dark?: boolean // dark variant
  fillWindow?: boolean // fill window completely.  alias for `full`
  light?: boolean // light variant
  rounded?: boolean // rounded variant
  spaced?: boolean // spaced variant (around page)
  padded?: boolean // padding (within page)
  scrolling?: boolean // scrolling variant
  rows?: boolean // use flexbox to lay children out in rows, down the page.
  columns?: boolean // use flexbox to lay children out in columns, across the page.
}
