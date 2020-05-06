import { BlockScope } from "./BlockScope"

/**
 * `FileScope` -- a scope which encapsulates a discrete file.
 *  - `methods` (from BlockScope) are methods defined at the root of the file.
 *  - `variables` (from BlockScope) are variables defined at the root of the file.
 */
export class FileScope extends BlockScope {}
