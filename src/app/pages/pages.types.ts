//
//  ## Shared types for app pages.
//

////////////////
// ## Routing
////////////////

/** Params parsed out of the `edit/:domain/:project/*filePath` routes. */
export type SpellRouteParams = {
  domain: string
  project: string
  filePath: string
}
