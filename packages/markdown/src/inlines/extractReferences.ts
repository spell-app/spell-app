import { MD, type Block, type RefMap } from "$/markdown"

/**
 * Take the link reference definitions (`[label]: url "title"`) off the front of every paragraph in `doc`, into a
 * `RefMap` -- before any inline parsing, since a reference can be used above its definition.
 * - A paragraph left with nothing goes.
 * - SIDE EFFECT:  edits `doc`'s paragraphs.
 * - NOTE: commonmark.js does this when a paragraph closes;  a paragraph that became a setext heading keeps its
 *   definitions as text here (a deferred edge case).
 */
export function extractReferences(doc: Block): RefMap {
  const refmap: RefMap = {}
  const parser = new MD.InlineParser()
  visit(doc)
  return refmap

  /** Strip definitions from `block`'s paragraphs, depth first, in document order. */
  function visit(block: Block) {
    for (const child of [...block.children]) {
      if (child.kind !== "paragraph") {
        visit(child)
        continue
      }
      let content = `${child.lines.join("\n")}\n`
      let found = false
      for (let length: number; content.startsWith("[") && (length = parser.parseReference(content, refmap));) {
        content = content.slice(length)
        found = true
      }
      if (!found) continue
      if (!/\S/.test(content)) block.children.splice(block.children.indexOf(child), 1)
      else child.lines = content.replace(/\n$/, "").split("\n")
    }
  }
}
