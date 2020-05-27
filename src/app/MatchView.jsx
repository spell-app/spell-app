/* eslint-disable react/prop-types */
import React from "react"
import { Token } from "~/parser"

import { store } from "./store"
import "./MatchView.css"

export function MatchView({ match, offset }) {
  if (!match) return null

  React.useLayoutEffect(() => {
    if (typeof offset !== "number") return
    const lineMatch = store.file?.lineMatchForOffset(offset)
    const el = lineMatch && document.querySelector(`.Match.line[data-start="${lineMatch.start}"]`)
    // console.warn({ offset, lineMatch, el })
    if (el) {
      el.scrollIntoView({ block: "center" })
      el.classList.add("highlight")
      setTimeout(() => el.classList.remove("highlight"), 300)
    }
  }, [offset])

  const { rule, matched } = match
  let hasTokens = false
  let hasMatches = false
  const contents = []
  const blocks = []
  matched.forEach((child, index) => {
    if (child.rule?.name === "block") {
      blocks.push(<MatchView key={index} match={child} />)
    } else if (child instanceof Token) {
      hasTokens = true
      contents.push(<TokenView key={index} token={child} />)
    } else {
      hasMatches = true
      contents.push(<MatchView key={index} match={child} />)
    }
  })
  const className = [
    "Match",
    rule.constructor.name,
    rule.name || "anonymous-rule",
    hasTokens && "hasTokens",
    hasMatches && "hasMatched",
    blocks.length && "hasBlocks"
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <span className={className} data-start={`${match.start}`} data-end={`${match.end}`}>
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
