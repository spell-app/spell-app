/**
 * Barrel for `blocks/` -- the block phase:  markdown text => a tree of `MD.Block`s.
 * - NOTE: `lineRules` (the rulex line kinds) isn't exported:  only `BlockScanner` asks it.
 */
export * from "./blocks.types"
export * from "./BlockScanner"
