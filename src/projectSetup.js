/**
 * Spell project root setup for client and server.
 * TODO: how to map server folders in here???
 */
export const SPELL_PROJECT_ROOTS = {
  projects: {
    key: "projects",
    type: "user",
    description: "User projects",
    projectRoot: "/projects/",
    apiPrefix: "/api/projects"
  },
  library: {
    key: "library",
    type: "system",
    description: "Library projects",
    projectRoot: "/library/",
    apiPrefix: "/api/library"
  },
  examples: {
    key: "examples",
    type: "system",
    description: "Example projects",
    projectRoot: "/examples/",
    apiPrefix: "/api/examples"
  },
  guides: {
    key: "guides",
    type: "system",
    description: "Guides",
    projectRoot: "/guides/",
    apiPrefix: "/api/guides"
  }
}
