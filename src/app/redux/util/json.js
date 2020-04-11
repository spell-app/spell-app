//----------------------------
//
//  JSON utilities
//
import JSON5 from "json5"

// Parse JSON, outputting a helpful error message if it doesn't work.
// Re-throws `error` if encountered uniless `swallowError` is truthy.
export function parseJSON(json, context = "random text", swallowError) {
  try {
    return JSON.parse(json)
  } catch (error) {
    // Try to figure out the line number of the error
    const match = error.message.match(/at position (\d+)/)
    if (match) {
      const charIndex = parseInt(match[1], 10)
      const prefix = json.substring(0, charIndex)
      const lineNumber = Math.max(0, prefix.split("\n").length - 2)
      console.error(`Error parsing JSON near line ${lineNumber} of ${context}`)
      const start = Math.max(0, lineNumber - 3)
      const end = start + 6
      console.log(
        json
          .split("\n")
          .slice(start, end)
          .join("\n")
      )
    }
    if (!swallowError) throw error
    return undefined
  }
}

// Parse JSON5, outputting a helpful error message if it doesn't work.
// Re-throws `error` if encountered uniless `swallowError` is truthy.
export function parseJSON5(json5, context = "random text", swallowError) {
  try {
    return JSON5.parse(json5)
  } catch (error) {
    // Try to figure out the line number of the error
    const match = error.message.match(/at position (\d+)/)
    if (match) {
      const charIndex = parseInt(match[1], 10)
      const prefix = json5.substring(0, charIndex)
      const lineNumber = Math.max(0, prefix.split("\n").length - 2)
      console.error(`Error parsing JSON near line ${lineNumber} of ${context}`)
      const start = Math.max(0, lineNumber - 3)
      const end = start + 6
      console.log(
        json5
          .split("\n")
          .slice(start, end)
          .join("\n")
      )
    }
    if (!swallowError) throw error
    return undefined
  }
}
