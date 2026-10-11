/**
 * The terminal study's tree drawn by Ink (React for the terminal), as the `spell` CLI draws its screens.
 *
 * Epic `python-target`, P15 · Terminal Drawing Study:  a sketch, wired into no build.
 * - The same element tree as the Python prototype (`elements.py`), built by the same kind of `h()`.
 * - Ink lays boxes out with flexbox, but reads no mouse:
 *   an element with an `onClick` is FOCUSED with Tab, and Enter clicks it.
 * - Run it with the CLI's own Ink (5, on React 18), from the repo root:
 *
 *       node_modules/.bin/tsx packages/core/py/experiments/terminal/ink_board.tsx
 *
 *   In a terminal:  Tab moves between the clickable elements, Enter clicks, `q` quits.
 *   Piped (`... | cat`):  it draws once and stops.
 */
import { Box, Text, render, useApp, useFocus, useInput } from "ink"
// React itself, in scope:  this file is outside every tsconfig that says how to compile JSX
import React, { useState } from "react"

////////////////
// ## The tree:  what a `to draw` method makes
////////////////

type Child = Element | string
type Element = { tag: string; props: Record<string, unknown>; children: Child[] }

/** An element:  `h("span", { class: "suit" }, "♠")`;  `props` may be left out, and children are flattened. */
function h(tag: string, props?: Record<string, unknown> | Child | Child[] | null, ...children: unknown[]): Element {
  if (props && (typeof props !== "object" || Array.isArray(props) || "tag" in props)) {
    children = [props, ...children]
    props = undefined
  }
  const flat = (children as unknown[])
    .flat(Infinity)
    .filter((child) => child != null && child !== false)
    .map((child) => (typeof child === "object" ? (child as Element) : String(child)))
  return { tag, props: (props as Record<string, unknown>) ?? {}, children: flat }
}

const classesOf = (node: Element) => String(node.props.class ?? "").split(/\s+/)
const hasClass = (node: Element, ...names: string[]) => names.every((name) => classesOf(node).includes(name))
const INLINE = new Set(["span", "i", "b", "strong", "em"])
const holdsOnlyText = (node: Element) =>
  node.children.every((child) => typeof child === "string" || (INLINE.has(child.tag) && holdsOnlyText(child)))

////////////////
// ## A little Solitaire, drawn as its `to draw` methods draw it
////////////////

type Card = { rank: string; suit: string; up: boolean }
const SYMBOLS: Record<string, string> = { clubs: "♣", diamonds: "♦", hearts: "♥", spades: "♠" }
const log: string[] = []
const trigger = (event: string, data: { card: Card }) => {
  data.card.up = true
  log.push(`${event}: ${data.card.rank} of ${data.card.suit}`)
}

function drawCard(card: Card): Element {
  const color = card.suit === "diamonds" || card.suit === "hearts" ? "red" : "black"
  const className = `Card face-${card.up ? "up" : "down"} ${card.rank} ${card.suit} ui button compact fluid `
  const onClick = () => trigger("card-click", { card })
  if (!card.up) return h("div", { class: className, onClick }, h("i", { class: "fitted bicycle icon" }))
  return h(
    "div",
    { class: className + color, onClick },
    `${card.rank} `,
    h("span", { class: "suit" }, SYMBOLS[card.suit])
  )
}

const stock: Card[] = [{ rank: "4", suit: "hearts", up: false }]
const tableau: Card[] = [
  { rank: "K", suit: "spades", up: false },
  { rank: "7", suit: "clubs", up: false },
  { rank: "Q", suit: "hearts", up: true }
]
const foundation: Card[] = [{ rank: "A", suit: "diamonds", up: true }]

function drawGame(): Element {
  return h(
    "div",
    { class: "ui container" },
    h(
      "table",
      { class: "ui table fixed" },
      h("thead", h("tr", h("th", "Klondike Solitaire"), h("th", `Clicks: ${log.length}`))),
      h(
        "tbody",
        h(
          "tr",
          h("td", h("div", { class: "Pile Stock stacked" }, stock.map(drawCard))),
          h("td", h("div", { class: "Pile Tableau staggered" }, tableau.map(drawCard))),
          h("td", h("div", { class: "Pile Foundation stacked" }, foundation.map(drawCard)))
        )
      )
    )
  )
}

////////////////
// ## Ink:  the tree as boxes and text
////////////////

const INTERACTIVE = Boolean(process.stdin.isTTY)

/** The text an inline element draws:  an icon (`<i class="bicycle icon">`) as a pattern, the terminal has no pictures. */
const textOf = (node: Child): string =>
  typeof node === "string" ? node : hasClass(node, "icon") ? "░░░░" : node.children.map(textOf).join("")

/** One element as Ink draws it:  a row for `<tr>`, a line of text for text, else a column. */
function Drawn({ node, onClicked }: { node: Child; onClicked: () => void }) {
  if (typeof node === "string") return <Text>{node}</Text>
  const onClick = node.props.onClick as (() => void) | undefined
  if (onClick) return <Clickable node={node} onClick={onClick} onClicked={onClicked} />
  return <Plain node={node} onClicked={onClicked} focused={false} />
}

function Plain({ node, onClicked, focused }: { node: Element; onClicked: () => void; focused: boolean }) {
  // the page stacks a `stacked` pile's cards on top of each other (position: absolute):  only the last shows
  const children = hasClass(node, "stacked") ? node.children.slice(-1) : node.children
  if (holdsOnlyText(node) && children.length) {
    const card = hasClass(node, "Card")
    return (
      <Text
        inverse={focused}
        bold={card}
        color={hasClass(node, "red") ? "red" : card ? "black" : undefined}
        backgroundColor={hasClass(node, "face-down") ? "blue" : card ? "white" : undefined}
      >
        {children.map(textOf).join("")}
      </Text>
    )
  }
  const row = node.tag === "tr"
  return (
    <Box flexDirection={row ? "row" : "column"} gap={row ? 2 : 0}>
      {children.map((child, index) => (
        // a column, so what's inside stretches across:  a row inside a row would shrink to its text
        <Box key={index} flexDirection="column" flexGrow={row ? 1 : 0} flexBasis={row ? 0 : undefined}>
          <Drawn node={child} onClicked={onClicked} />
        </Box>
      ))}
    </Box>
  )
}

/** An element with an `onClick`:  Tab focuses it, Enter clicks it -- Ink has no mouse. */
function Clickable({ node, onClick, onClicked }: { node: Element; onClick: () => void; onClicked: () => void }) {
  const { isFocused } = useFocus({ isActive: INTERACTIVE })
  useInput(
    (_input, key) => {
      if (isFocused && key.return) {
        onClick()
        onClicked()
      }
    },
    { isActive: INTERACTIVE }
  )
  return <Plain node={node} onClicked={onClicked} focused={isFocused} />
}

function Board() {
  // drawn again after a click:  this sketch's tree tracks no changes, so a counter forces it
  const [, setClicks] = useState(0)
  const { exit } = useApp()
  useInput((input) => input === "q" && exit(), { isActive: INTERACTIVE })
  return (
    // piped (or a terminal of no size), there is no width:  Ink's flexbox needs one to share out
    <Box flexDirection="column" width={process.stdout.columns || 80}>
      <Drawn node={drawGame()} onClicked={() => setClicks((clicks) => clicks + 1)} />
    </Box>
  )
}

const app = render(<Board />, { patchConsole: false })
if (!INTERACTIVE) app.unmount()
