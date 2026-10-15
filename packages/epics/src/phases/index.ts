/**
 * `$/epics/phases` barrel:  a phase's stable id and the number people see (`PhaseIds`:  `p-epic-migrate`, `P7`), for
 * the elements AND the node tools.
 * - Node-safe:  works on whatever DOM it's handed (linkedom or the browser's), touches no DOM global.
 */
export * from "./PhaseIds"
