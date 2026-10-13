import type { SP } from "$/spell"
// Import directly:  `<spell-app>` loads this file alone, without spell's barrel and its parser
import { SpellSetup } from "$/spell/SpellSetup"

/**
 * The person whose space this machine's own projects are in:  `owen@spell`, so `@user:projects:errors` is
 * `owen@spell/errors`, in spell-spaces' `@spell/owen@/errors/`.
 * - TODO: from the person's own file, `__me.json5`, once the people phase reads it (epic `people-and-orgs` P8-P9).
 */
export const LOCAL_PERSON = "owen"

/**
 * Spell's project GROUPS:  where projects live, each a list the editor shows (`SpellProjectRoot`).
 * - Each one's `place` is its address;  its folder comes from that (`SP.SpellUrls.folderFor()`):
 *   - `@system:examples`, `@system:guides`, `@system:library`:  the `@spell` space's built-ins,
 *     `packages/spaces/@spell/<group>/`, committed
 *   - `@test:fixtures`:  the test projects, `tests/spaces/@spell/test/`, committed and frozen
 *   - `@user:projects`:  this machine's person's own, `<spell-spaces>/@spell/<person>@/`, outside git
 * - Their paths (`@system:examples`) are today's names, until the address phase (P4's second half).
 * - SIDE EFFECT:  loading this file registers them with spell (`SpellSetup.addProjectRoot()`):
 *   every program that reads a spell path loads it first, through `$/spaces`, spaces' disk reader, or this file alone.
 */
export const PROJECT_GROUPS: SP.ProjectRootSpec[] = [
  {
    path: "@user:projects",
    owner: "@user",
    domain: "projects",
    place: `${LOCAL_PERSON}@spell`,
    title: "Projects",
    Type: "Project",
    type: "project",
    description: "Your own projects",
    icon: "app store ios"
  },
  {
    path: "@system:examples",
    owner: "@system",
    domain: "examples",
    place: "@spell/examples",
    title: "Examples",
    Type: "Example",
    type: "example",
    description: "Example projects",
    icon: "app store ios",
    alias: "@examples"
  },
  {
    path: "@system:guides",
    owner: "@system",
    domain: "guides",
    place: "@spell/guides",
    title: "Guides",
    Type: "Guide",
    type: "guide",
    description: "Usage guides",
    icon: "newspaper outline",
    alias: "@guides"
  },
  {
    path: "@system:library",
    owner: "@system",
    domain: "library",
    place: "@spell/library",
    title: "Libraries",
    Type: "Library",
    type: "library",
    description: "Libraries other projects import, e.g. `@library/cards` in a `project.json`",
    icon: "book",
    alias: "@library"
  },
  {
    path: "@test:fixtures",
    owner: "@test",
    domain: "fixtures",
    place: "@spell/test",
    title: "Test fixtures",
    Type: "Fixture",
    type: "fixture",
    description: "Frozen projects tests run against -- edit one, then `yarn test:fixtures:bless`",
    icon: "lab",
    devOnly: true,
    alias: "@test"
  }
]

for (const group of PROJECT_GROUPS) SpellSetup.addProjectRoot(group)
