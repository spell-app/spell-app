/* eslint-disable react/prop-types */
import React from "react"
import { Token } from "~/parser"

import { store } from "./store"
import "./MatchView.css"

function highlight(el, delay = 0) {
  setTimeout(() => {
    el.classList.add("highlight")
    setTimeout(() => el.classList.remove("highlight"), 400)
  }, delay)
}

export function MatchView({ match, offset }) {
  if (!match) return null

  // If we're passed a specific `offset`, scroll that line into view and flash its bg.
  React.useLayoutEffect(() => {
    if (typeof offset !== "number" || !store.file?.match) return
    // get the stack of what was matched, with the inner-most thing FIRST
    const stack = store.file.match.matchStackForOffset(offset).reverse()
    // find the lowest item that corresponds to a `line`
    const lineMatch = stack.find(_match => _match.rule?.name === "line")
    const lineEl = lineMatch && document.querySelector(`.Match.line[data-start="${lineMatch.start}"]`)
    if (!lineEl) return
    // console.warn({ offset, lineMatch, lineEl })
    // scroll the `name` thinger into the center of the display
    lineEl.querySelector(".name").scrollIntoView({ block: "center" })

    // highlight the line element
    // highlight(lineEl)

    // highlight NAMEs of bits higher in the stack
    stack
      .slice(0, stack.indexOf(lineMatch))
      .reverse()
      .forEach((item, index) => {
        const itemEl =
          item instanceof Token
            ? document.querySelector(`.Token.${item.constructor.name}[data-start="${item.start}"] > .value`)
            : document.querySelector(`.Match.${item.rule?.name}[data-start="${item.start}"] > .name`)

        if (itemEl) highlight(itemEl, index * 20)
      })
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
    blocks.length && "hasBlocks",
    matched.length === 1 && matched[0].rule?.name === "blank_line" && "isBlankLine"
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <>
      <span className={className} data-start={`${match.start}`} data-end={`${match.end}`}>
        {!!rule.name && <span className="name">{rule.name}</span>}
        {contents.length > 0 && <span className="contents">{contents}</span>}
        {blocks.length > 0 && blocks}
      </span>
    </>
  )
}

export function TokenView({ token }) {
  if (!token) return null
  return (
    <div
      className={`Token ${token.constructor.name} ${token.whitespace ? "hasWhitespace" : ""}`}
      data-start={`${token.start}`}
      data-end={`${token.end}`}
    >
      <div className="spacer" />
      <div className="value">{token.raw}</div>
    </div>
  )
}
