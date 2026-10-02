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
  fomantic: ["help", "linkify", "mail", "setting"]
} as const
