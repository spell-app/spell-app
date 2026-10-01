/**
 * Site navigation:  the header links and the left sidebar, in one place so they can't drift apart.
 * - The sidebar's Components section is the component BROWSER (`components/ComponentBrowser.astro`), listing every
 *   TAG from `ComponentDefinitions` (through `ComponentIndex`), so a new tag or page needs no nav edit.
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
  /** render the component browser here instead of `links` */
  browser?: true
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

/** Sidebar sections;  "Components" is a placeholder for the component browser. */
export function sidebar(): NavSection[] {
  return [
    {
      title: "Introduction",
      links: [
        { label: "Overview", path: "/" },
        { label: "Getting started", path: "/getting-started/" },
        { label: "Grammar", path: "/grammar/" }
      ]
    },
    { title: "Components", links: [], browser: true },
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
