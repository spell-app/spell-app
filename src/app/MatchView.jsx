/* eslint-disable react/prop-types */
import React from "react"
import { Token } from "~/parser"

/**
 * View for a particular `Match`.
 */
export function MatchView({ match }) {
  if (!match) return null
  const { rule, matched } = match
  let hasTokens = false
  let hasMatches = false
  const contents = []
  const blocks = []
  matched.forEach((child, index) => {
    if (!child) return console.warn(index, match)
    const childRule = child.rule?.name
    if (childRule === "block") {
      blocks.push(<MatchView key={index} match={child} />)
    } else if (child instanceof Token.JSXElement) {
      hasMatches = true
      contents.push(<JSXElementView key={index} match={match} />)
    } else if (child instanceof Token) {
      hasTokens = true
      contents.push(<TokenView key={index} token={child} />)
    } else {
      hasMatches = true
      contents.push(<MatchView key={index} match={child} />)
    }
  })
  const { ruleName } = match
  const className = [
    "Match",
    ruleName,
    hasTokens && "hasTokens",
    hasMatches && "hasMatched",
    blocks.length && "hasBlocks",
    matched.length === 1 && matched[0].rule?.name === "blank_line" && "isBlankLine"
  ]
    .filter(Boolean)
    .join(" ")

  const props = {
    className,
    title: ruleName,
    "data-line": match.line,
    "data-char": match.char,
    "data-start": match.start,
    "data-end": match.end
  }
  return (
    <span {...props}>
      {!!rule.name && <span className="name">{rule.name}</span>}
      {contents.length > 0 && <span className="contents">{contents}</span>}
      {blocks.length > 0 && blocks}
    </span>
  )
}

export function TokenView({ token }) {
  if (!token) return null
  const className = ["Token", token.constructor.name, token.whitespace && "hasWhitespace"].filter(Boolean).join(" ")
  return (
    <div className={className} data-start={`${token.start}`} data-end={`${token.end}`}>
      <div className="spacer" />
      <div className="value">{token.raw}</div>
    </div>
  )
}

export function JSXElementView({ match }) {
  const ruleName = match.rule.name
  const { tagName, isUnaryTag } = match.input[0]
  // console.info({ match, ruleName, rule: match.rule, tagName })
  if (ruleName === "jsxText") return <JSXTextView match={match} />
  if (ruleName === "jsxExpression") return <JSXExpressionView match={match} />
  if (ruleName === "jsxEndTag") return null

  const attributes = match.attributes?.map((attr, index) => <JSXAttributeView key={index} match={attr} />)
  const children = match.children?.map((child, index) => <JSXElementView key={index} match={child} />)
  const className = [
    "JSXElement",
    isUnaryTag && "unary",
    attributes?.length && "hasAttributes",
    children?.length && "hasChildren"
  ]
    .filter(Boolean)
    .join(" ")
  return (
    <span className={className} data-start={`${match.start}`} data-end={`${match.end}`}>
      <span className="startTag">
        <span className="tagName">{`<${tagName}`}</span>
        {attributes?.length ? <span className="attributes">{attributes}</span> : null}
        <span className="startTagEnd">{isUnaryTag ? "/>" : ">"}</span>
      </span>
      {children?.length ? <span className="children">{children}</span> : null}
      {!isUnaryTag && <span className="endTag">{`</${tagName}>`}</span>}
    </span>
  )
}

export function JSXAttributeView({ match }) {
  const attribute = match.matched[0]
  const attrMatch = match.statement || match.expression || match.error
  const className = [
    "JSXAttribute",
    match.statement && "hasStatement",
    match.expression && "hasExpression",
    match.error && "hasError",
    !attrMatch && "isEmpty"
  ]
    .filter(Boolean)
    .join(" ")
  // console.info({ match, attribute })
  return (
    <span className={className}>
      <span className="name">{attribute.name + (attrMatch ? " = " : "")}</span>
      {attrMatch ? (
        <span className="value">
          {attrMatch.rule?.name === "text" ? <JSXTextView match={attrMatch} /> : <MatchView match={attrMatch} />}
        </span>
      ) : null}
    </span>
  )
}

export function JSXTextView({ match }) {
  const value = match.value.trim()
  if (value === "") return null
  return <span className="JSXText">{value}</span>
}

export function JSXExpressionView({ match }) {
  const className = ["JSXExpression", match.expression && "hasExpression", match.error && "hasError"]
    .filter(Boolean)
    .join(" ")
  return (
    <span className={className}>
      <MatchView match={match.expression || match.error} />
    </span>
  )
}
