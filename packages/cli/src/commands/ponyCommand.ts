import { CLI } from "$/cli"

/**
 * `spell pony [words...]`:  prints a pony in Spell's wizard hat, saying the words (else one of `PONY_SAYINGS`).
 * - Owen asked for a pony (epic `claude-design`, 2026-10-05;  its other pony is `brand/pony.html`).
 * - No checkout, no project:  works anywhere.
 */
export async function ponyCommand(session: CLI.CliSession, args: string[]): Promise<number> {
  for (const line of ponyLines(args.join(" ").trim() || pickSaying())) session.out(line)
  return CLI.EXIT.OK
}

/**
 * The pony, as lines, with `saying` in a speech bubble above it.
 * - pure:  `ponyCommand()` prints it;  tests read it
 * - the bubble is as wide as the saying;  a long saying stays on one line
 */
export function ponyLines(saying: string): string[] {
  const rule = "-".repeat(saying.length + 2)
  return [
    `  ${rule}`,
    ` < ${saying} >`,
    `  ${rule}`,
    "      \\",
    "       \\      .",
    "        \\    /|\\",
    "            /_|_\\",
    "         __/ o  \\__",
    "        /  \\    ,_ \\__________",
    "       (    \\__/  \\           )~",
    "        \\_/        \\__________/",
    "            ||  ||     ||  ||",
    "            ''  ''     ''  ''"
  ]
}

/** What the pony says when told nothing. */
export const PONY_SAYINGS = [
  "Spell it, and it shall be.",
  "Neigh-tive custom elements, at your service.",
  "I was built in Claude Design.",
  "Every hoof a <ui-*> element."
] as const

/** One of `PONY_SAYINGS`, at random. */
function pickSaying(): string {
  return PONY_SAYINGS[Math.floor(Math.random() * PONY_SAYINGS.length)]
}
