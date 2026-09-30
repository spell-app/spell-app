import { Box, Text } from "ink"

/****************
 * ### `<DetailsPane>`
 * Right pane of `<ExplorerScreen>`:  what `spell describe` would say about the selected node, scrolled.
 * - Lines come already wrapped to fit, so scrolling moves by real screen lines.
 * - Just draws:  `<ExplorerScreen>` owns the scroll position and the keys.
 ****************/
export function DetailsPane({ lines, scroll, width, height, isFocused }: DetailsPaneProps) {
  // inside the border
  const inner = Math.max(1, height - 2)
  return (
    <Box
      flexDirection="column"
      width={width}
      height={height}
      overflow="hidden"
      borderStyle="round"
      borderColor={isFocused ? "cyan" : "gray"}
      paddingX={1}
    >
      {lines.slice(scroll, scroll + inner).map((line, index) => (
        // blank lines need SOME text, or they take no height
        <Text key={scroll + index} wrap="truncate-end">
          {line || " "}
        </Text>
      ))}
    </Box>
  )
}

/**
 * `<DetailsPane>` props.
 * - `lines`:  every line, wrapped to fit inside the border -- see `DETAILS_CHROME`
 * - `scroll`:  index of the top line shown
 * - `width`, `height`:  outside the border
 * - `isFocused`:  do keys scroll it?  Shown by the border's colour.
 */
export type DetailsPaneProps = {
  lines: string[]
  scroll: number
  width: number
  height: number
  isFocused: boolean
}

/** Columns a `<DetailsPane>` takes for its border and padding:  lines must fit in its `width` less this. */
export const DETAILS_CHROME = 4
