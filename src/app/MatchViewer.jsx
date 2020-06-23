/* eslint-disable react/prop-types */
import React from "react"
import { Token } from "~/parser"

import { store } from "./store"
import { ErrorHandler } from "./ErrorHandler"
import "./MatchView.less"

function highlight(el, delay = 0) {
  setTimeout(() => {
    el.classList.add("highlight")
    setTimeout(() => el.classList.remove("highlight"), 400)
  }, delay)
}

export class MatchViewer extends ErrorHandler {
  /** Clear `state.error` if `props.match` changes. */
  static getDerivedStateFromProps(props, oldState) {
    const newState = { match: props.match }
    if (oldState.match !== newState.match) newState.error = null
    return newState
  }

  /* Show error in UI when caught. */
  componentDidCatch(error, errorInfo) {
    store.showError(error)
  }

  /** Wrapper class to manage scrolling. */
  Wrapper({ contents, props }) {
    const classNames = ["MatchViewer"]
    if (scroll) classNames.push("scroll")
    return <div className={classNames.join(" ")}>{contents}</div>
  }

  /**
   * Top-level viewer for a Match, e.g. for a `spellFile.match`.
   * Create one of these and it will create <MatchView>s and <TokenView>s underneath it.
   *
   * If you pass `inputOffset` as a character position in the source file,
   * we'll scroll to that position and highlight elements surrounding that position.
   */
  Component({ match, scroll, inputOffset }) {
    if (!match) return null

    // If we're passed a specific `inputOffset`, scroll that line into view and flash its bg.
    React.useLayoutEffect(() => {
      if (typeof inputOffset !== "number" || !match) return
      // get the stack of what was matched, with the inner-most thing FIRST
      const stack = match.matchStackForOffset(inputOffset).reverse()
      // find the lowest item that corresponds to a `line`
      const lineMatch = stack.find((_match) => _match.rule?.name === "line")
      const lineEl = lineMatch && document.querySelector(`.Match.line[data-start="${lineMatch.start}"]`)
      if (!lineEl) return
      // console.warn({ inputOffset, lineMatch, lineEl })
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
    }, [inputOffset])

    // Memoize for the specified `match`.
    // This allow us to update `inputOffset` without redrawing matches.
    return React.useMemo(() => <MatchView match={match} />, [match])
  }
}

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
  const className = [
    "Match",
    rule.constructor.name,
    rule.name || "anonymous-rule",
    hasTokens && "hasTokens",
    hasMatches && "hasMatched",
    blocks.length && "hasBlocks",
    matched.length === 1 && matched[0].rule?.name === "blank_line" && "isBlankLine",
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
    children?.length && "hasChildren",
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
    !attrMatch && "isEmpty",
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
