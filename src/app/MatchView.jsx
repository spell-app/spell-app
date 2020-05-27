/* eslint-disable react/prop-types */
import React from "react"
import { Token } from "~/parser"
import { SpellParser } from "~/languages/spell"

import "./MatchView.css"

export function MatchView({ match }) {
  // if (!match || match.rule instanceof SpellParser.Rule.Block) return null
  if (!match) return null
  const { rule, matched } = match
  return (
    <span className={`Match ${rule.constructor.name} ${rule.name || "anonymous-rule"}`}>
      {!!rule.name && <span className="name">{rule.name}</span>}
      {matched.map((child, index) =>
        child instanceof Token ? <TokenView key={index} token={child} /> : <MatchView key={index} match={child} />
      )}
    </span>
  )
}

export function TokenView({ token }) {
  if (!token) return null
  return <span className={`Token ${token.constructor.name} ${!!token.whitespace && "hasWhitespace"}`}>{token.raw}</span>
}
