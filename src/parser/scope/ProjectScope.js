import { RootScope } from "./RootScope"
/**
 * A `ProjectScope` manages a set of `FileScope`s.
 * Like `RootScope`, it manages `.rules`, `.types` and `.constants`
 * for things that are defined in the project.
 */
export class ProjectScope extends RootScope {}
