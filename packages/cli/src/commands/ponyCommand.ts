import { CLI } from "$/cli"

/**
 * `spell pony [words...] [--gallop]`:  prints a pony in Spell's wizard hat, saying the words (else one of
 * `PONY_SAYINGS`).
 * - Owen asked for a pony (epic `claude-design`, 2026-10-05;  its other pony is `brand/pony.html`).
 * - `--gallop` (epic `property-editor` P8):  her legs gallop.
 *   - In a terminal:  drawn in place, a few strides, then she stands.
 *   - Piped (no terminal):  one stride's frames, one after another.
 * - No checkout, no project:  works anywhere.
 */
export async function ponyCommand(session: CLI.CliSession, args: string[], options: CLI.PonyOptions): Promise<number> {
  const saying = args.join(" ").trim() || pickSaying()
  if (!options.gallop) {
    for (const line of ponyLines(saying)) session.out(line)
    return CLI.EXIT.OK
  }
  const frames = gallopFrames(saying)
  if (!process.stdout.isTTY) {
    for (const frame of frames) for (const line of [...frame, ""]) session.out(line)
    return CLI.EXIT.OK
  }
  await gallopInPlace(frames, ponyLines(saying))
  return CLI.EXIT.OK
}

/**
 * The pony, as lines, with `saying` in a speech bubble above it, and her legs as `legs` says.
 * - pure:  `ponyCommand()` prints it;  tests read it
 * - the bubble is as wide as the saying;  a long saying stays on one line
 */
export function ponyLines(saying: string, legs: PonyLegs = "standing"): string[] {
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
    ...LEGS[legs]
  ]
}

/**
 * One stride of her gallop, as frames of lines:  legs reaching, passing, tucked, passing.
 * - She faces left:  reaching, her front legs swing forward (left) and her back legs back;  tucked, the other way.
 * - Only her legs move:  every frame is the same height, so each draws over the one before.
 */
export function gallopFrames(saying: string): string[][] {
  return STRIDE.map((legs) => ponyLines(saying, legs))
}

/** Where her legs are. */
export type PonyLegs = keyof typeof LEGS

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

/**
 * Draw `frames` over each other in the terminal for `GALLOP_STRIDES` strides, then `still`, her standing.
 * - Each frame moves the cursor back up over the one before, so she gallops in place.
 * - The cursor is hidden meanwhile, and shown again however it ends (Ctrl-C too).
 */
async function gallopInPlace(frames: string[][], still: string[]) {
  const height = frames[0]!.length
  const write = (lines: string[], first: boolean) =>
    process.stdout.write(`${first ? "" : `\x1b[${height}A`}${lines.map((line) => `\x1b[2K${line}`).join("\n")}\n`)
  const showCursor = () => process.stdout.write("\x1b[?25h")
  const onInterrupt = () => {
    showCursor()
    process.exit(130)
  }
  process.once("SIGINT", onInterrupt)
  process.stdout.write("\x1b[?25l")
  try {
    let first = true
    for (let stride = 0; stride < GALLOP_STRIDES; stride++) {
      for (const frame of frames) {
        write(frame, first)
        first = false
        await new Promise((resolve) => setTimeout(resolve, FRAME_MS))
      }
    }
    write(still, false)
  } finally {
    process.off("SIGINT", onInterrupt)
    showCursor()
  }
}

/** Her legs, two lines each:  the legs, then the hooves. */
const LEGS = {
  standing: [
    "            ||  ||     ||  ||", //
    "            ''  ''     ''  ''"
  ],
  reaching: [
    "            //  //     \\\\  \\\\", //
    "           ''  ''        ''  ''"
  ],
  tucked: [
    "            \\\\  \\\\     //  //", //
    "             ''  ''   ''  ''"
  ]
}

/** One stride, in the order her legs go. */
const STRIDE: readonly PonyLegs[] = ["reaching", "standing", "tucked", "standing"]

/** How long each frame shows, in milliseconds. */
const FRAME_MS = 140

/** How many strides she gallops in a terminal before she stands. */
const GALLOP_STRIDES = 6
