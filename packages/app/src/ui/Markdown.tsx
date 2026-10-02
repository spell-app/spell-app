/** @jsxImportSource react */
import classnames from "classnames"
import { marked } from "marked"
import React from "react"

/****************
 * ### `<Markdown>`
 * `text` as markdown, e.g. a hover from the language server.
 * - Its links go to `onOpen`, NOT the page -- e.g. `file:///…/Card.spell#L12`, for the editor to open.
 * - NOTE: raw HTML in `text` is rendered as is:  only give it text we made.
 ****************/
export function Markdown({ text, className, onOpen }: MarkdownProps) {
  const html = React.useMemo(() => marked.parse(text, { async: false }), [text])
  return (
    <div className={classnames("Markdown", className)} dangerouslySetInnerHTML={{ __html: html }} onClick={onClick} />
  )

  /** Hand a clicked link to `onOpen`. */
  function onClick(event: React.MouseEvent) {
    const href = (event.target as HTMLElement).closest("a")?.getAttribute("href")
    if (!href) return
    event.preventDefault()
    onOpen(href)
  }
}

/** Props for `<Markdown>`. */
export type MarkdownProps = {
  /** Markdown to show. */
  text: string
  /** Extra class name. */
  className?: string
  /** Link `href` clicked. */
  onOpen: (href: string) => void
}
