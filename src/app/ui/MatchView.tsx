import { P } from "~/parser"

/**
 * View for a particular `Match`.
 */
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
    } else if (child instanceof P.Tokens.JSXElement) {
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

export type MatchViewProps = { match?: P.AnyMatch }
/**
 * `rules/JSX.ts` (a concurrently-converting chunk, `src/languages/spell/rules/**`) attaches ad-hoc
 * `attributes`/`children`/`statement`/`expression`/`error` fields to JSX-related matches during
 * `parse()` -- these aren't part of the core `Match` shape, so we mirror them locally here.
 */
type JSXMatch = P.AnyMatch
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

export type TokenViewProps = { token?: P.Token }
export function JSXElementView({ match }: JSXElementViewProps) {
  const { ruleName } = match
  const { tagName, isUnaryTag } = match.tokens[0] as P.Tokens.JSXElement
  // console.info({ match, ruleName, rule: match.rule, tagName })
  if (ruleName === "jsxText") return <JSXTextView match={match} />
  if (ruleName === "jsxExpression") return <JSXExpressionView match={match} />
  if (ruleName === "jsxEndTag") return null

  const attributes = match.attributes?.map((attr, index) => attr && <JSXAttributeView key={index} match={attr} />)
  const children = match.children?.map((child, index) => child && <JSXElementView key={index} match={child} />)
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

export type JSXElementViewProps = { match: JSXMatch }
export function JSXAttributeView({ match }: JSXAttributeViewProps) {
  const attribute = match.matched[0] as P.Tokens.JSXAttribute
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
      <span className="attr-name">{attribute.name + (attrMatch ? " = " : "")}</span>
      {attrMatch ? (
        <span className="attr-value">
          {attrMatch.rule?.name === "text" ? <JSXTextView match={attrMatch} /> : <MatchView match={attrMatch} />}
        </span>
      ) : null}
    </span>
  )
}

export type JSXAttributeViewProps = { match: JSXMatch }
export function JSXTextView({ match }: JSXTextViewProps) {
  const value = match.value.trim()
  if (value === "") return null
  return <span className="JSXText">{value}</span>
}

export type JSXTextViewProps = { match: P.AnyMatch }
export function JSXExpressionView({ match }: JSXExpressionViewProps) {
  const className = ["JSXExpression", match.expression && "hasExpression", match.error && "hasError"]
    .filter(Boolean)
    .join(" ")
  return (
    <span className={className}>
      <MatchView match={match.expression || match.error} />
    </span>
  )
}

export type JSXExpressionViewProps = { match: JSXMatch }
