// Error we'll throw for problems when parsing.
// Uses a specific type so we can check for it in tests.
import { CustomError } from "~/util"
export class ParserError extends CustomError {}
