//
//  Constants
//

// Should we test at the start of the tokens, or anywhere in the range?

/** Test at the start of the token stream. */
export const AT_START = "AT_START"
/** Test anwyhere within the token stream. */
export const ANYWHERE = "ANYWHERE"

/**
 * Start testing:
 * - `AT_START` of the token stream, or
 * - `ANYWHERE` within the stream?
 */
export const TestLocation = { AT_START, ANYWHERE } as const
export type TestLocation = keyof typeof TestLocation
