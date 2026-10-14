import type { SP } from "$/spell"
// Import directly:  `<spell-app>` loads this file alone, without spell's barrel and its parser
import { SpellSetup } from "$/spell/SpellSetup"

/**
 * The person whose space this machine's own projects are in:  `owen@spell`, so Owen's Errors is
 * `owen@spell/errors`, in spell-spaces' `@spell/owen@/errors/`.
 * - Their own file is `@spell/owen@/__me.json5`, which the people store reads and the app's "You" panel changes
 *   (epic `people-and-orgs` P9);  WHO they are is still this name, until a machine can have more than one person.
 */
export const LOCAL_PERSON = "owen"

/**
 * Spell's project GROUPS:  where projects live, each a list the editor shows (`SpellProjectRoot`).
 * - Each one's `path` is its address;  its folder comes from that (`SP.SpellUrls.folderFor()`):
 *   - `@spell/examples`, `@spell/guides`, `@spell/library`:  the `@spell` space's built-ins,
 *     `packages/spaces/@spell/<group>/`, committed
 *   - `@spell/test`:  the test projects, `tests/spaces/@spell/test/`, committed and frozen
 *   - `owen@spell`:  this machine's person's own, `<spell-spaces>/@spell/<person>@/`, outside git
 * - A project in one is its address, a slash and the project's folder name:  `@spell/examples/solitaire`.
 *   Built-in projects' names are lower-kebab (decision Q39).
 * - SIDE EFFECT:  loading this file registers them with spell (`SpellSetup.addProjectRoot()`):
 *   every program that reads a spell address loads it first, through `$/spaces`, spaces' disk reader, or this file
 *   alone.
 */
export const PROJECT_GROUPS: SP.ProjectRootSpec[] = [
  {
    path: `${LOCAL_PERSON}@spell`,
    space: `${LOCAL_PERSON}@spell`,
    domain: "projects",
    title: "Projects",
    Type: "Project",
    type: "project",
    description: "Your own projects",
    icon: "app store ios"
  },
  {
    path: "@spell/examples",
    space: "@spell",
    domain: "examples",
    title: "Examples",
    Type: "Example",
    type: "example",
    description: "Example projects",
    icon: "app store ios"
  },
  {
    path: "@spell/guides",
    space: "@spell",
    domain: "guides",
    title: "Guides",
    Type: "Guide",
    type: "guide",
    description: "Usage guides",
    icon: "newspaper outline"
  },
  {
    path: "@spell/library",
    space: "@spell",
    domain: "library",
    title: "Libraries",
    Type: "Library",
    type: "library",
    description: "Libraries other projects import, e.g. `@spell/library/cards` in a project file",
    icon: "book"
  },
  {
    path: "@spell/test",
    space: "@spell",
    domain: "fixtures",
    title: "Test fixtures",
    Type: "Fixture",
    type: "fixture",
    description: "Frozen projects tests run against -- edit one, then `yarn test:fixtures:bless`",
    icon: "lab",
    devOnly: true
  }
]

for (const group of PROJECT_GROUPS) SpellSetup.addProjectRoot(group)
