/**
 * Copy buttons for `Example.astro` code panes.
 * - ONE delegated listener for the whole page, so it doesn't matter how many examples there are, or
 *   whether one is added later.
 * - Copies the `<pre>`'s text, i.e. exactly the formatted source shown.
 */
document.addEventListener("click", async (event) => {
  const button = (event.target as Element | null)?.closest<HTMLButtonElement>("[data-copy]")
  const code = button?.parentElement?.querySelector("pre")?.textContent
  if (!button || code == null) return
  try {
    await navigator.clipboard.writeText(code)
    flash(button, "Copied")
  } catch {
    flash(button, "Copy failed")
  }
})

/** Show `text` on `button` for a moment, then restore its label. */
function flash(button: HTMLButtonElement, text: string) {
  const label = button.dataset.label ?? button.textContent ?? ""
  button.dataset.label = label
  button.textContent = text
  setTimeout(() => (button.textContent = label), 1500)
}
