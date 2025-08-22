//
//  Constants
//

// Should we test at the start of the tokens, or anywhere in the range?

/**
 * Start testing:
 * - `AT_START` of the token stream, or
 * - `ANYWHERE` within the stream?
 */
export const TestLocation = {
  AT_START: "AT_START",
  ANYWHERE: "ANYWHERE"
} as const
export type TestLocation = keyof typeof TestLocation
