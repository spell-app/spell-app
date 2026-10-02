/**
 * Barrel for `$/app/solid/modals`:  the app's dialogs, on `@spell-app/ui`.
 * - `dialogs.ts`:  `alert()`, `confirm()`, `prompt()`, `promptForNumber()`, `choose()` -- what `editor`'s dialog
 *   methods call, through a dynamic `import()`.
 * - `Chooser.tsx`:  `<Chooser>` and `openChooser()`, behind `choose()`.
 * - `modals.types.ts`:  their props (`AlertModalProps` ...), which `Actions`' `DialogActionProps` take too.
 */

export * from "./modals.types"

export * from "./dialogs"
export * from "./Chooser"
