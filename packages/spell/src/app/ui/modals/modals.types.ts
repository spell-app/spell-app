//
//  ## Shared types for the modals.
//
//  NOTE: each modal's OWN props (`AlertModalProps` etc) live beside that modal, per `AGENTS.md`.
//  Only the contract they all share, plus the `<Chooser>` option shapes, belong here.
//

////////////////
// ## Modal contract
////////////////

/**
 * Props `<ModalRoot>` hands to whichever modal component it is showing.
 * - `Props` is the modal's own prop bag (e.g. `AlertModalProps`), `Result` what `resolve()` yields.
 * - Lives here rather than beside a component because it is the shared contract for ALL modals --
 *   no single one of them defines it.
 */
export type ModalComponentProps<Props, Result = unknown> = {
  /** NOTE: `<ModalRoot>` does not actually pass this -- it forwards only `props`/`resolve`/`reject`;
   *  the modal's id travels as React's own `key` instead (see `props.id` in `editor.ts`'s `showModal()`). */
  id?: string | number
  /** The modal's own props, e.g. `AlertModalProps`. */
  props: Props
  /** Call to close the modal and resolve `editor.showModal()`'s promise with `value`. */
  resolve: (value?: Result) => void
  /** Call to close the modal and reject `editor.showModal()`'s promise with `reason`. */
  reject?: (reason?: unknown) => void
}

////////////////
// ## `<Chooser>` options
////////////////

/** One `options` entry as callers may pass it -- before `normalizeSUIDropdownOptions()`. */
export type DropdownOptionInput = string | number | NormalizedDropdownOption

/** One `options` entry in the shape SUI's `<Dropdown>` actually wants. */
export type NormalizedDropdownOption = Prettify<
  {
    /** Unique key -- filled in by `normalizeSUIDropdownOptions()` when the caller didn't supply one. */
    key: string | number
    /** Label shown for this option. */
    text?: ReactNode
    /** Value resolved when this option is chosen. */
    value?: unknown
  } & Record<string, unknown>
>
