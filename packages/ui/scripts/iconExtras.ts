/**
 * Icons the DEFAULT pack (`fa7-free`) carries beyond Font Awesome's solid + regular sets -- hand-picked, edit freely,
 * then `yarn gen:icons` (in a worktree:  see `scripts/gen-icons.ts`).
 * - Why:  brands and Fomantic's names are opt-in packs, but a few are common enough that a page shouldn't need a
 *   whole pack for them.  Starting set (2026-09-30):  what our own examples and docs pages use.
 * - Everything else:  `<ui-root icons="fa7-brands">` / `<ui-root icons="fomantic">`.
 */
export const ICON_EXTRAS = {
  /** brand icons copied into `fa7-free/brands/` */
  brands: ["discord", "github", "medium", "twitter"],
  /** Fomantic names added as `alias`es of the `fa7-free` icon they mean */
  fomantic: ["help", "linkify", "mail", "setting"],
  /**
   * Our own extra names, by Font Awesome icon name:  `alias`es of its solid icon,
   * and of its regular one with ` outline` added (`hearts outline`).
   * - The playing-card suits, in the plural (Owen, 2026-10-20):  `<ui-icon name="hearts">`.
   * - Font Awesome Free has no club or spade, so `clubs` and `spades` name nothing yet.
   */
  names: { heart: ["hearts"], diamond: ["diamonds"] }
} as const
