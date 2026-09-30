/**
 * Anchor id for a heading:  lower-case, ASCII words joined by `-`.
 * - Matches what Astro's markdown `rehype-heading-ids` produces for plain-word headings, so a
 *   `<Section>` and a markdown `## Heading` with the same text get the same id.
 */
export function slug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}
