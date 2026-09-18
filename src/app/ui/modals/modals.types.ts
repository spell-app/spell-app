//
//  ## Shared types for the modals.
//
//  NOTE: each modal's OWN props (`AlertModalProps` etc) live beside that modal, per `AGENTS.md`.
//  Only the contract they all share, plus the `<Chooser>` option shapes, belong here.
//

/**
 * Props `<ModalRoot>` hands to whichever modal component it is showing.
 * - `Props` is the modal's own prop bag (e.g. `AlertModalProps`), `Result` what `resolve()` yields.
 * - Lives here rather than beside a component because it is the shared contract for ALL modals --
 *   no single one of them defines it.
 */
export type ModalComponentProps<Props, Result = unknown> = {
  id?: string | number
  props: Props
  resolve: (value?: Result) => void
  reject?: (reason?: unknown) => void
}

/** One `options` entry as callers may pass it -- before `normalizeSUIDropdownOptions()`. */
export type DropdownOptionInput = string | number | NormalizedDropdownOption

/** One `options` entry in the shape SUI's `<Dropdown>` actually wants. */
export type NormalizedDropdownOption = Prettify<
  {
    key: string | number
    text?: ReactNode
    value?: unknown
  } & Record<string, unknown>
>
