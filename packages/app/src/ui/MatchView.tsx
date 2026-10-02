/** @jsxImportSource react */
import { P } from "$/parser"
import { SP } from "$/spell"

/****************
 * ### `<MatchView>`
 * View for a particular `Match`, recursing into its `matched` children.
 * - `block` children are pulled out into a separate `blocks` list and rendered as siblings, rather
 *   than nested inside `.contents`, so blocks (indented sub-statements) lay out below their line.
 * - A `P.JSXElementToken` child routes to `<JSXElementView>` instead of recursing into `<MatchView>`.
 * - `data-line`/`data-char`/`data-start`/`data-end` attributes let `MatchViewer` locate this element
 *   for scroll/highlight by offset.
 ****************/
export function MatchView({ match }: MatchViewProps) {
  if (!match) return null
  const { rule, matched } = match
  let hasTokens = false
  let hasMatches = false
  const contents: ReactElement[] = []
  const blocks: ReactElement[] = []
  matched.forEach((child, index) => {
    const childRule = child instanceof P.Match ? child.rule?.name : undefined
    if (childRule === "block") {
      blocks.push(<MatchView key={index} match={child as P.AnyMatch} />)
    } else if (child instanceof P.JSXElementToken) {
      hasMatches = true
      contents.push(<JSXElementView key={index} match={match as JSXMatch} />)
    } else if (child instanceof P.Token) {
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
    ruleName?.replace(/\$/g, "_"),
    hasTokens && "hasTokens",
    hasMatches && "hasMatches",
    blocks.length && "hasBlocks",
    matched.length === 1 && matched[0] instanceof P.Match && matched[0].rule?.name === "blank_line" && "isBlankLine"
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

/** Props for `<MatchView>`. */
export type MatchViewProps = {
  /** Match to render; `null`/`undefined` renders nothing. */
  match?: P.AnyMatch
}

/** Match from a `$/spell` JSX rule (`jsxElement`/`jsxAttribute`/`jsxExpression`) -- see `SP.JSXMatchData`. */
type JSXMatch = P.Match<P.MatchGroups, SP.JSXMatchData>

/****************
 * ### `<TokenView>`
 * Leaf view for a single `Token`.  `data-start`/`data-end` let `MatchViewer` locate it by offset.
 ****************/
export function TokenView({ token }: TokenViewProps) {
  if (!token) return null
  const className = ["Token", token.constructor.name, token.whitespace && "hasWhitespace"].filter(Boolean).join(" ")
  return (
    <div className={className} data-start={`${token.start}`} data-end={`${token.end}`}>
      <div className="spacer" />
      <div className="value">{token.raw}</div>
    </div>
  )
}

/** Props for `<TokenView>`. */
export type TokenViewProps = {
  /** Token to render; `null`/`undefined` renders nothing. */
  token?: P.Token
}

/****************
 * ### `<JSXElementView>`
 * View for a JSX element match -- routes to `<JSXTextView>`/`<JSXExpressionView>` for `jsxText`/
 * `jsxExpression` children, renders nothing for `jsxEndTag` (its own start tag draws the closing
 * tag text), and otherwise draws a start tag with `attributes`, nested `children`, and an end tag
 * (skipped for `isUnaryTag`).
 ****************/
export function JSXElementView({ match }: JSXElementViewProps) {
  const { ruleName } = match
  const { tagName, isUnaryTag } = match.tokens[0] as P.JSXElementToken
  // console.info({ match, ruleName, rule: match.rule, tagName })
  if (ruleName === "jsxText") return <JSXTextView match={match} />
  if (ruleName === "jsxExpression") return <JSXExpressionView match={match} />
  if (ruleName === "jsxEndTag") return null

  const attributes = match.data.attributes?.map(
    (attr, index) => attr && <JSXAttributeView key={index} match={attr as JSXMatch} />
  )
  const children = match.data.children?.map(
    (child, index) => child && <JSXElementView key={index} match={child as JSXMatch} />
  )
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

/** Props for `<JSXElementView>`. */
export type JSXElementViewProps = {
  /** JSX element match, with `JSX.ts`'s `attributes`/`children` on `match.data` (see `JSXMatch`). */
  match: JSXMatch
}

/****************
 * ### `<JSXAttributeView>`
 * View for one JSX attribute -- renders its name, and (if given a value) either a `<JSXTextView>`
 * for a plain string value or the general `<MatchView>` for an expression/error value.
 ****************/
export function JSXAttributeView({ match }: JSXAttributeViewProps) {
  const attribute = match.matched[0] as P.JSXAttributeToken
  const attrMatch = match.data.statement || match.data.expression || match.data.error
  const className = [
    "JSXAttribute",
    match.data.statement && "hasStatement",
    match.data.expression && "hasExpression",
    match.data.error && "hasError",
    !attrMatch && "isEmpty"
  ]
    .filter(Boolean)
    .join(" ")
  // console.info({ match, attribute })
  return (
    <span className={className}>
      <span className="attr-name">{attribute.name + (attrMatch ? " = " : "")}</span>
      {attrMatch ? (
        <span className="attr-value">
          {attrMatch.rule?.name === "text" ? <JSXTextView match={attrMatch} /> : <MatchView match={attrMatch} />}
        </span>
      ) : null}
    </span>
  )
}

/** Props for `<JSXAttributeView>`. */
export type JSXAttributeViewProps = {
  /** JSX attribute match, with `JSX.ts`'s `statement`/`expression`/`error` on `match.data`. */
  match: JSXMatch
}

/****************
 * ### `<JSXTextView>`
 * Leaf view for JSX text content -- trims `value` and renders nothing for whitespace-only text.
 ****************/
export function JSXTextView({ match }: JSXTextViewProps) {
  const value = match.value.trim()
  if (value === "") return null
  return <span className="JSXText">{value}</span>
}

/** Props for `<JSXTextView>`. */
export type JSXTextViewProps = {
  /** Match whose `value` is the raw text. */
  match: P.AnyMatch
}

/****************
 * ### `<JSXExpressionView>`
 * View for a `{expression}` inside JSX -- renders the parsed `expression`, or `error` if it failed
 * to parse, via the general `<MatchView>`.
 ****************/
export function JSXExpressionView({ match }: JSXExpressionViewProps) {
  const className = ["JSXExpression", match.data.expression && "hasExpression", match.data.error && "hasError"]
    .filter(Boolean)
    .join(" ")
  return (
    <span className={className}>
      <MatchView match={match.data.expression || match.data.error} />
    </span>
  )
}

/** Props for `<JSXExpressionView>`. */
export type JSXExpressionViewProps = {
  /** JSX expression match, with `JSX.ts`'s `expression`/`error` on `match.data`. */
  match: JSXMatch
}
