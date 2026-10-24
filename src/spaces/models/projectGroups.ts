import type { SP } from "spell-parser/spell"
// Import directly:  `<spell-app>` loads this file alone, without spell's barrel and its parser
import { SpellSetup } from "spell-parser/spell/SpellSetup"

/**
 * The person whose space this machine's own projects are in:  `owen@spell`, so a project of theirs, `my-app`, is
 * `owen@spell/my-app`, in spell-spaces' `@spell/owen@/my-app/`.
 * - Their own file is `@spell/owen@/__me.json5`, which the people store reads and the app's "You" panel changes
 *   (epic `people-and-orgs` P9).
 * - WHO they are is still this name, until a machine can have more than one person.
 */
export const LOCAL_PERSON = "owen"

/**
 * Spell's project GROUPS:  where projects live, each a list the editor shows (`SpellProjectRoot`).
 * - Each one's `path` is its address;  its folder comes from that (`SP.SpellUrls.folderFor()`):
 *   - `@spell/examples`, `@spell/guides`, `@spell/library`:
 *     the `@spell` space's built-ins, `spaces/@spell/<group>/`, committed
 *   - `@spell/test`:  the test projects, beside them in `spaces/@spell/test/`, committed and frozen
 *   - `owen@spell`:  this machine's person's own, `<spell-spaces>/@spell/<person>@/`, outside git
 * - A project in one is its address, a slash and the project's folder name:  `@spell/examples/Solitaire`.
 *   Built-in projects' names are lower-kebab (decision Q39).
 * - Each group's `icon` is its projects' icon everywhere the editor shows one:
 *   the project dropdown and its trigger, the program's header, the landing page's cards.
 *   - folder:  your projects;  lightbulb:  examples;  open book:  guides;  puzzle piece:  libraries;  flask:  tests
 * - SIDE EFFECT:  loading this file registers them with spell (`SpellSetup.addProjectRoot()`).
 *   - Every program that reads a spell address loads it first:  through `spell-app/spaces`, spaces' disk reader,
 *     or this file alone.
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
    icon: "folder"
  },
  {
    path: "@spell/examples",
    space: "@spell",
    domain: "examples",
    title: "Examples",
    Type: "Example",
    type: "example",
    description: "Example projects",
    icon: "lightbulb"
  },
  {
    path: "@spell/guides",
    space: "@spell",
    domain: "guides",
    title: "Guides",
    Type: "Guide",
    type: "guide",
    description: "Usage guides",
    icon: "book open"
  },
  {
    path: "@spell/library",
    space: "@spell",
    domain: "library",
    title: "Libraries",
    Type: "Library",
    type: "library",
    description: "Libraries other projects import, e.g. `@spell/library/people` in a project file",
    icon: "puzzle piece"
  },
  {
    path: "@spell/test",
    space: "@spell",
    domain: "fixtures",
    title: "Test fixtures",
    Type: "Fixture",
    type: "fixture",
    description: "Frozen projects tests run against -- edit one, then `yarn spell:test:fixtures:bless`",
    icon: "flask",
    devOnly: true
  }
]

for (const group of PROJECT_GROUPS) SpellSetup.addProjectRoot(group)
