/**
 * Showing a URL to a person:  the default browser, a new browser window, a reused Chrome tab, or VS Code.
 * - Gathered from `cli`'s `serve.ts` (`openBrowser`), goals' `launch.js` (`openInBrowser`, `openInVSCode`) and the
 *   docs' `pages.js` (`openInChrome`).
 * - macOS first:  `open` / `osascript`.  Elsewhere:  `xdg-open`, or `start` on Windows.
 * - `SPELL_NO_BROWSER=1`:  nothing opens (tests, CI, a remote shell);  each says so by returning `false` / `"none"`.
 */
import { spawn, spawnSync } from "node:child_process"

/** Opens a page in VS Code's Simple Browser:  the spell extension's URI handler (`packages/vscode/src/DocPreview.ts`). */
export const VSCODE_PREVIEW = "vscode://spell-app.spell-language/doc-preview"

/** Whether opening is turned off:  `SPELL_NO_BROWSER` set. */
export function noBrowser(): boolean {
  return Boolean(process.env.SPELL_NO_BROWSER)
}

/** Open `url` in the default browser;  returns whether it tried. */
export function openBrowser(url: string): boolean {
  if (noBrowser()) return false
  const [command, ...args] =
    process.platform === "darwin"
      ? ["open", url]
      : process.platform === "win32"
        ? ["cmd", "/c", "start", "", url]
        : ["xdg-open", url]
  const child = spawn(command!, args, { stdio: "ignore", detached: true })
  child.on("error", () => {})
  child.unref()
  return true
}

/**
 * Show `url` in a NEW window of `browser` ("Google Chrome" or "Safari", macOS only, by AppleScript), else in the
 * default browser.  Returns which.
 */
export function openInNewWindow(url: string, browser?: string): string {
  if (noBrowser()) return "none"
  if (process.platform === "darwin" && browser === "Google Chrome") {
    const script = `tell application "Google Chrome"
  activate
  set newWindow to make new window
  set URL of active tab of newWindow to ${appleString(url)}
end tell`
    if (spawnSync("osascript", ["-e", script]).status === 0) return "Google Chrome"
  }
  if (process.platform === "darwin" && browser === "Safari") {
    const script = `tell application "Safari"
  activate
  make new document with properties {URL:${appleString(url)}}
end tell`
    if (spawnSync("osascript", ["-e", script]).status === 0) return "Safari"
  }
  openBrowser(url)
  return "the default browser"
}

/**
 * Show `url` in Chrome, in ONE tab per `key`, IN THE BACKGROUND.  Returns how:  `reused`, `new tab`, `launched`.
 * - `key`:  a stable part of the URL, e.g. the repo path `/epics/x/x.plan.html`, so the same page
 *   from another checkout or port reuses the tab:  re-pointed if the URL differs, else reloaded
 * - never brings Chrome forward:  the tab is made active in ITS window only;  a new tab goes in the front window
 * - Chrome not running, or AppleScript refused:  `open -g -a "Google Chrome"`, which can't reuse a tab
 * - NOTE: `key` is an AppleScript keyword:  the variable is `pageKey`
 */
export function openInChromeTab(url: string, key: string): string {
  if (noBrowser()) return "none"
  const script = `
set target to ${JSON.stringify(url)}
set pageKey to ${JSON.stringify(key)}
if application "Google Chrome" is not running then return "launch"
tell application "Google Chrome"
  repeat with w in windows
    set i to 0
    repeat with t in tabs of w
      set i to i + 1
      if (URL of t) contains pageKey then
        if (URL of t) starts with target then
          tell t to reload
        else
          set URL of t to target
        end if
        set active tab index of w to i
        return "reused"
      end if
    end repeat
  end repeat
  if (count of windows) is 0 then make new window
  tell front window to make new tab with properties {URL:target}
  return "new tab"
end tell`
  const run = spawnSync("osascript", ["-e", script], { encoding: "utf8" })
  const how = run.stdout?.trim()
  if (run.status === 0 && how && how !== "launch") return how
  spawnSync("open", ["-g", "-a", "Google Chrome", url])
  return "launched"
}

/**
 * Show a page in VS Code's Simple Browser, beside the editor, through the spell extension (`spell dev vscode`).
 * - `url`:  a page a local server serves (preferred:  it live-reloads);  `file`:  a file the extension serves itself
 * - returns whether `open` handed the URI over;  without the extension, VS Code says it can't handle it
 */
export function openInVSCode({ url, file }: { url?: string; file?: string }): boolean {
  if (noBrowser()) return false
  const query = new URLSearchParams({ ...(url && { url }), ...(file && { file }) }).toString()
  const opener = process.platform === "darwin" ? "open" : process.platform === "win32" ? "explorer" : "xdg-open"
  return spawnSync(opener, [`${VSCODE_PREVIEW}?${query}`], { encoding: "utf8" }).status === 0
}

/** `text` as an AppleScript string literal. */
function appleString(text: string): string {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}
