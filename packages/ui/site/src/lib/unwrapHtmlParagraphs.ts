import { defineMdastPlugin } from "satteri"

/**
 * MDX plugin (Sätteri, Astro 7's default Markdown processor):  inside a lower-case (HTML / custom) element,
 * unwrap markdown paragraphs back into plain inline content.
 * - Why:  MDX parses text on its OWN line inside a JSX element as a markdown paragraph, so
 *   `<p class="x">⏎  Some text⏎</p>` renders `<p class="x"><p>Some text</p></p>` -- invalid HTML the browser
 *   splits apart, and the wrong code in `Example`'s "Show code".  oxfmt wraps long JSX that way by itself, so
 *   authors can't avoid it by hand.
 * - Only intrinsic elements (`<p>`, `<li>`, `<ui-button>`):  inside components (`<Section>`, `<Example>`)
 *   paragraphs are what the author meant.
 * - NOTE: a Sätteri plugin, not a remark one:  Astro 7 ignores `remarkPlugins` unless the processor is switched
 *   to `unified()` (see `PAPERCUTS.md`).
 */
export const unwrapHtmlParagraphs = defineMdastPlugin({
  name: "unwrap-html-paragraphs",
  paragraph(node, ctx) {
    const parent = ctx.parent(node) as { type: string; name?: string | null } | undefined
    const intrinsic =
      (parent?.type === "mdxJsxFlowElement" || parent?.type === "mdxJsxTextElement") && /^[a-z]/.test(parent.name ?? "")
    if (intrinsic) ctx.replaceNode(node, [...node.children])
  }
})
