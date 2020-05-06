import { typeCase, snakeCase, Scope, Constant, Type } from ".."

/**
 * `Project` scope.
 * TODOC:  Manages parsing a bunch of `Files` with an explicit load order.
 *
 * `Project` scopes define `types` and `constants` which are shared by all files in the project.
 */
export default class Project extends Scope {}
Scope.Project = Project
