import { getCollection } from "astro:content"

/**
 * Site navigation:  the header links and the left sidebar, in one place so they can't drift apart.
 * - Component entries come from the `components` content collection, so a component agent adds a page
 *   by adding one `.mdx` file -- no nav edit.
 */

/** One sidebar / header link. */
export type NavLink = {
  /** visible text */
  label: string
  /** site-relative path, WITHOUT the base (see `url()`) */
  path: string
  /** badge text, e.g. `in progress` */
  badge?: string
}

/** A titled sidebar group. */
export type NavSection = {
  /** group heading */
  title: string
  /** its links, in display order */
  links: NavLink[]
}

/** Prefix `path` with Astro's `base`, so the site also works deployed under a sub-path. */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "")
  return `${base}/${path.replace(/^\//, "")}`
}

/** Header navigation:  one entry per top-level area. */
export const HEADER_LINKS: NavLink[] = [
  { label: "Introduction", path: "/" },
  { label: "Components", path: "/components/" },
  { label: "Theming", path: "/theming/" },
  { label: "Utilities", path: "/utilities/" },
  { label: "Icons", path: "/icons/" },
  { label: "Kitchen sink", path: "/kitchen-sink/" }
]

/** Component categories in sidebar / index order, as Fomantic groups them. */
export const CATEGORIES = ["Elements", "Modules"] as const

/** Sidebar sections, components listed alphabetically from the content collection. */
export async function sidebar(): Promise<NavSection[]> {
  const components = (await getCollection("components")).sort((a, b) => a.data.title.localeCompare(b.data.title))
  return [
    {
      title: "Introduction",
      links: [
        { label: "Overview", path: "/" },
        { label: "Getting started", path: "/getting-started/" },
        { label: "Grammar", path: "/grammar/" }
      ]
    },
    ...CATEGORIES.map((category) => ({
      title: category,
      links: components
        .filter((entry) => entry.data.category === category)
        .map((entry) => ({
          label: entry.data.title,
          path: `/components/${entry.id}/`,
          badge: STATUS_BADGES[entry.data.status]
        }))
    })).filter((section) => section.links.length),
    {
      title: "Foundation",
      links: [
        { label: "Theming", path: "/theming/" },
        { label: "Utilities", path: "/utilities/" },
        { label: "Icons", path: "/icons/" },
        { label: "Kitchen sink", path: "/kitchen-sink/" }
      ]
    }
  ]
}

/** Badge text per component status;  `done` needs none. */
export const STATUS_BADGES: Record<string, string | undefined> = {
  planned: "planned",
  "in-progress": "in progress",
  done: undefined
}
