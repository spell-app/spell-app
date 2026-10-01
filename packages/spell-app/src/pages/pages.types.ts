// ## Shared types for app pages.

// ## Routing

/** Params parsed out of the `edit/:domain/:project/*filePath` routes. */
export type SpellRouteParams = {
  /** `domain` segment of path, e.g. `"projects"`/`"examples"`/`"guides"`  -- see `SpellLocation`. */
  domain: string
  /** `projectName` segment of path. */
  project: string
  /** Rest of path after `domain`/`project`, identifying file within project. */
  filePath: string
}
