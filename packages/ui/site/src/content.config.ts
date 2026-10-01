import { defineCollection } from "astro:content"
import { glob } from "astro/loaders"
import { z } from "astro/zod"

/**
 * One MDX page per component, `src/content/components/ui-<name>.mdx`, rendered by `pages/components/[slug].astro`.
 * - Component agents own their page;  the recipe is in `site/README.md`.
 * - The sidebar's component browser and the `/components/` index list TAGS, from `ComponentDefinitions` (the
 *   vocabularies' `topics` / `aka`), not entries:  this collection only supplies each folder's page and `status`.
 */
const components = defineCollection({
  loader: glob({ pattern: "*.mdx", base: "./src/content/components" }),
  schema: z.object({
    /** display name, e.g. `Button` */
    title: z.string(),
    /** the custom element tag, e.g. `ui-button` */
    tag: z.string().regex(/^[a-z][a-z0-9]*-[a-z0-9-]+$/, "a custom element tag, e.g. ui-button"),
    /** how far along the port is;  anything but `done` gets a badge in the sidebar and masthead */
    status: z.enum(["planned", "in-progress", "done"]),
    /** one-line tagline under the title, Fomantic style:  "A button indicates a possible user action" */
    summary: z.string()
  })
})

export const collections = { components }
