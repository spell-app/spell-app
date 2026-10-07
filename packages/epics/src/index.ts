/**
 * `$/epics` barrel:  code the `epics` pack's elements share.
 * - NOTE: the elements are NOT here:  `$/epics/components` (importing a family defines its tags:  SIDE EFFECT).
 * - Loads in the browser AND in node (the `node` tests):  nothing here may touch `window` / `document` at load.
 */
export {}
