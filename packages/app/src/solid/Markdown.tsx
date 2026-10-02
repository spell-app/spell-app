import { marked } from "marked"

/****************
 * ### `<Markdown>`
 * `text` as markdown, e.g. a hover from the language server.
 * - Its links go to `onOpen`, NOT the page -- e.g. `file:///…/Card.spell#L12`, for the editor to open.
 * - NOTE: raw HTML in `text` is rendered as is:  only give it text we made.
 ****************/
export function Markdown(props: MarkdownProps) {
  return (
    <div
      class={["Markdown", props.class]}
      innerHTML={marked.parse(props.text, { async: false })}
      onClick={(event) => open(event)}
    />
  )

  /** Hand a clicked link to `onOpen`. */
  function open(event: MouseEvent) {
    const href = (event.target as HTMLElement).closest("a")?.getAttribute("href")
    if (!href) return
    event.preventDefault()
    props.onOpen(href)
  }
}

/** Props for `<Markdown>`. */
export type MarkdownProps = {
  /** Markdown to show. */
  text: string
  /** Extra class. */
  class?: string
  /** Link `href` clicked. */
  onOpen: (href: string) => void
}
