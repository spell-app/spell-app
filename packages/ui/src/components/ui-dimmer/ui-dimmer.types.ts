/**
 * Loose constants and types of the `ui-dimmer` family:  the words, selectors and shapes its element
 * classes and its native fallback share, lifted out of their files.
 * - Data only:  nothing here runs;  the classes import what they need from `./ui-dimmer.types`.
 */

import { dimmerVocabulary } from "./ui-dimmer.vocabulary.en"
import type { EventName } from "$/ui/core"

/** Vocabulary type, for brevity. */
export type Vocabulary = typeof dimmerVocabulary

/** Page sheet for the dimmed parents (`ui-dimmer.page.css`). */
export const PAGE_SHEET = "dimmer-page"

/** `on` / `closedby` values the element reads. */
export const HOVER = "hover"
export const ANY = "any"

/** Close reasons it names itself. */
export const CLICK = "click"
export const ESCAPE = "escape"

/** Event it still fires, checked against the vocabulary. */
export const HIDE: EventName<typeof dimmerVocabulary> = "ui-hide"
