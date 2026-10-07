/**
 * `$/epics/definitions` barrel:  the ONE description of every `<epic-*>` element -- each vocabulary, as data, plus
 * its content model -- for the elements AND the node tools.
 * - Node-safe:  loads no element and touches no DOM (`Definitions` imports the vocabulary FILES, never a family's
 *   barrel).
 */
export * from "./definitions.types"

export * from "./Definitions"
