/* eslint-disable react/prop-types */
import React from "react"
import { Token } from "~/parser"

import { store } from "./store"
import "./MatchView.css"

export function MatchView({ match, offset }) {
  if (!match) return null

  React.useLayoutEffect(() => {
    const lineMatch = store.file?.lineMatchForOffset(offset)
    const el = lineMatch && document.querySelector(`.Match.line[data-offset="${lineMatch.start}"]`)
    // console.warn({ offset, lineMatch, el })
    if (el) el.scrollIntoView()
  }, [offset])

  const { rule, matched } = match
  const contents = matched
    .map((child, index) => {
      if (child.rule?.name === "block") return null
      return child instanceof Token ? <TokenView key={index} token={child} /> : <MatchView key={index} match={child} />
    })
    .filter(Boolean)
  const blocks = matched
    .map((child, index) => {
      if (child.rule?.name === "block") return <MatchView key={index} match={child} />
      return null
    })
    .filter(Boolean)
  return (
    <span className={`Match ${rule.constructor.name} ${rule.name || "anonymous-rule"}`} data-offset={`${match.start}`}>
      {!!rule.name && <span className="name">{rule.name}</span>}
      {contents.length > 0 && <span className="contents">{contents}</span>}
      {blocks.length > 0 && blocks}
    </span>
  )
}

export function TokenView({ token }) {
  if (!token) return null
  return (
    <div className={`Token ${token.constructor.name} ${token.whitespace ? "hasWhitespace" : ""}`}>
      <div className="spacer" />
      <div className="value">{token.raw}</div>
    </div>
  )
}
