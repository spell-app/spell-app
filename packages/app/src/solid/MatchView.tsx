import type { JSX } from "@solidjs/web"

import { P } from "$/parser"
import type { SP } from "$/spell"

import "$/app/ui/syntax.css"

//
//  ## The tree view of a parser `Match`:  Solid twins of React's `$/app/ui/MatchView.tsx`, same names and props.
//  - Each component draws its WHOLE subtree with the plain `draw*()` functions below, rebuilt when its prop
//    changes:  a `Match` never changes once parsed, so there's nothing finer-grained to track, and a parse tree
//    may hold thousands of nodes -- plain DOM, no computation per node.
//  - Attribute values are local consts, never `match.x` in JSX:  Solid makes an effect for each member-access or
//    call expression in JSX, and these never change.
//  - Look:  `MatchViewer.css` (`.MatchViewer .Match ...`) and `syntax.css`'s colors.
//

/****************
 * ### `<MatchView>`
 * View for a particular `Match`, recursing into its `matched` children.
 * - `block` children are pulled out into a separate `blocks` list and rendered as siblings, rather
 *   than nested inside `.contents`, so blocks (indented sub-statements) lay out below their line.
 * - A `P.JSXElementToken` child routes to `<JSXElementView>` instead of recursing into `<MatchView>`.
 * - `data-line`/`data-char`/`data-start`/`data-end` attributes let `MatchViewer` locate this element
 *   for scroll/highlight by offset.
 ****************/
export function MatchView(props: MatchViewProps) {
  return <>{drawMatch(props.match)}</>
}

/** Props for `<MatchView>`. */
export type MatchViewProps = {
  /** Match to render; `null`/`undefined` renders nothing. */
  match?: P.AnyMatch
}

/** Match from a `$/spell` JSX rule (`jsxElement`/`jsxAttribute`/`jsxExpression`) -- see `SP.JSXMatchData`. */
type JSXMatch = P.Match<P.MatchGroups, SP.JSXMatchData>

/** Draw `match` and everything under it -- see `<MatchView>`. */
function drawMatch(match: P.AnyMatch | undefined): JSX.Element {
  if (!match) return null
  const { rule, matched, ruleName } = match
  let hasTokens = false
  let hasMatches = false
  const contents: JSX.Element[] = []
  const blocks: JSX.Element[] = []
  for (const child of matched) {
    const childRule = child instanceof P.Match ? child.rule?.name : undefined
    if (childRule === "block") {
      blocks.push(drawMatch(child as P.AnyMatch))
    } else if (child instanceof P.JSXElementToken) {
      hasMatches = true
      // NOTE: the PARENT match, as React's did:  its `data` holds the element's attributes / children
      contents.push(drawJSXElement(match as JSXMatch))
    } else if (child instanceof P.Token) {
      hasTokens = true
      contents.push(drawToken(child))
    } else {
      hasMatches = true
      contents.push(drawMatch(child))
    }
  }
  const isBlankLine = matched.length === 1 && matched[0] instanceof P.Match && matched[0].rule?.name === "blank_line"
  const classes = [
    "Match",
    ruleName?.replace(/\$/g, "_"),
    { hasTokens, hasMatches, hasBlocks: blocks.length > 0, isBlankLine }
  ]
  const name = rule.name
  const { line, char, start, end } = match
  return (
    <span class={classes} title={ruleName} data-line={line} data-char={char} data-start={start} data-end={end}>
      {name ? <span class="name">{name}</span> : null}
      {contents.length > 0 ? <span class="contents">{contents}</span> : null}
      {blocks.length > 0 ? blocks : null}
    </span>
  )
}

/****************
 * ### `<TokenView>`
 * Leaf view for a single `Token`.  `data-start`/`data-end` let `MatchViewer` locate it by offset.
 ****************/
export function TokenView(props: TokenViewProps) {
  return <>{drawToken(props.token)}</>
}

/** Props for `<TokenView>`. */
export type TokenViewProps = {
  /** Token to render; `null`/`undefined` renders nothing. */
  token?: P.Token
}

/** Draw `token` -- see `<TokenView>`. */
function drawToken(token: P.Token | undefined): JSX.Element {
  if (!token) return null
  const classes = ["Token", token.constructor.name, { hasWhitespace: !!token.whitespace }]
  const { start, end, raw } = token
  return (
    <div class={classes} data-start={start} data-end={end}>
      <div class="spacer" />
      <div class="value">{raw}</div>
    </div>
  )
}

/****************
 * ### `<JSXElementView>`
 * View for a JSX element match -- routes to `<JSXTextView>`/`<JSXExpressionView>` for `jsxText`/
 * `jsxExpression` children, renders nothing for `jsxEndTag` (its own start tag draws the closing
 * tag text), and otherwise draws a start tag with `attributes`, nested `children`, and an end tag
 * (skipped for `isUnaryTag`).
 ****************/
export function JSXElementView(props: JSXElementViewProps) {
  return <>{drawJSXElement(props.match)}</>
}

/** Props for `<JSXElementView>`. */
export type JSXElementViewProps = {
  /** JSX element match, with `JSX.ts`'s `attributes`/`children` on `match.data` (see `JSXMatch`). */
  match: JSXMatch
}

/** Draw JSX element `match` -- see `<JSXElementView>`. */
function drawJSXElement(match: JSXMatch): JSX.Element {
  const { ruleName } = match
  if (ruleName === "jsxText") return drawJSXText(match)
  if (ruleName === "jsxExpression") return drawJSXExpression(match)
  if (ruleName === "jsxEndTag") return null

  const { tagName, isUnaryTag } = match.tokens[0] as P.JSXElementToken
  const attributes = (match.data.attributes ?? []).filter(Boolean).map((attr) => drawJSXAttribute(attr as JSXMatch))
  const children = (match.data.children ?? []).filter(Boolean).map((child) => drawJSXElement(child as JSXMatch))
  const classes = [
    "JSXElement",
    { unary: !!isUnaryTag, hasAttributes: attributes.length > 0, hasChildren: children.length > 0 }
  ]
  const { start, end } = match
  const startTag = `<${tagName}`
  const startTagEnd = isUnaryTag ? "/>" : ">"
  const endTag = `</${tagName}>`
  return (
    <span class={classes} data-start={start} data-end={end}>
      <span class="startTag">
        <span class="tagName">{startTag}</span>
        {attributes.length ? <span class="attributes">{attributes}</span> : null}
        <span class="startTagEnd">{startTagEnd}</span>
      </span>
      {children.length ? <span class="children">{children}</span> : null}
      {isUnaryTag ? null : <span class="endTag">{endTag}</span>}
    </span>
  )
}

/****************
 * ### `<JSXAttributeView>`
 * View for one JSX attribute -- renders its name, and (if given a value) either a `<JSXTextView>`
 * for a plain string value or the general `<MatchView>` for an expression/error value.
 ****************/
export function JSXAttributeView(props: JSXAttributeViewProps) {
  return <>{drawJSXAttribute(props.match)}</>
}

/** Props for `<JSXAttributeView>`. */
export type JSXAttributeViewProps = {
  /** JSX attribute match, with `JSX.ts`'s `statement`/`expression`/`error` on `match.data`. */
  match: JSXMatch
}

/** Draw JSX attribute `match` -- see `<JSXAttributeView>`. */
function drawJSXAttribute(match: JSXMatch): JSX.Element {
  const attribute = match.matched[0] as P.JSXAttributeToken
  const { statement, expression, error } = match.data
  const attrMatch = statement || expression || error
  const classes = [
    "JSXAttribute",
    { hasStatement: !!statement, hasExpression: !!expression, hasError: !!error, isEmpty: !attrMatch }
  ]
  const name = attribute.name + (attrMatch ? " = " : "")
  const value = attrMatch && (attrMatch.rule?.name === "text" ? drawJSXText(attrMatch) : drawMatch(attrMatch))
  return (
    <span class={classes}>
      <span class="attr-name">{name}</span>
      {attrMatch ? <span class="attr-value">{value}</span> : null}
    </span>
  )
}

/****************
 * ### `<JSXTextView>`
 * Leaf view for JSX text content -- trims `value` and renders nothing for whitespace-only text.
 ****************/
export function JSXTextView(props: JSXTextViewProps) {
  return <>{drawJSXText(props.match)}</>
}

/** Props for `<JSXTextView>`. */
export type JSXTextViewProps = {
  /** Match whose `value` is the raw text. */
  match: P.AnyMatch
}

/** Draw JSX text `match` -- see `<JSXTextView>`. */
function drawJSXText(match: P.AnyMatch): JSX.Element {
  const value = match.value.trim()
  if (value === "") return null
  return <span class="JSXText">{value}</span>
}

/****************
 * ### `<JSXExpressionView>`
 * View for a `{expression}` inside JSX -- renders the parsed `expression`, or `error` if it failed
 * to parse, via the general `<MatchView>`.
 ****************/
export function JSXExpressionView(props: JSXExpressionViewProps) {
  return <>{drawJSXExpression(props.match)}</>
}

/** Props for `<JSXExpressionView>`. */
export type JSXExpressionViewProps = {
  /** JSX expression match, with `JSX.ts`'s `expression`/`error` on `match.data`. */
  match: JSXMatch
}

/** Draw JSX expression `match` -- see `<JSXExpressionView>`. */
function drawJSXExpression(match: JSXMatch): JSX.Element {
  const { expression, error } = match.data
  const classes = ["JSXExpression", { hasExpression: !!expression, hasError: !!error }]
  const contents = drawMatch(expression || error)
  return <span class={classes}>{contents}</span>
}
