/**
 * Showing a URL to a person:  the default browser, a new browser window, or a reused Chrome tab.
 * - macOS first:  `open` / `osascript`.  Elsewhere:  `xdg-open`, or `start` on Windows.
 * - `SPELL_NO_BROWSER=1`:  nothing opens (tests, CI, a remote shell);  each says so by returning `false` / `"none"`.
 * - VS Code's doc preview is spell-epic's own opener (its `pages.js` `openInVSCode()`):  the extension is its
 *   (the copy here, which nothing read, went in epic `repo-split` P4).
 * - Gathered from `cli`'s `serve.ts` (`openBrowser`), goals' `launch.js` (`openInBrowser`)
 *   and the docs' `pages.js` (`openInChrome`).
 */
import { spawn, spawnSync } from "node:child_process"

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
 * Show `url` in a NEW window of `browser`, else in the default browser.  Returns which.
 * - `browser`:  "Google Chrome" or "Safari", macOS only, by AppleScript
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
 * - `key`:  a stable part of the URL, e.g. the repo path `/epics/x/x.plan.html`,
 *   so the same page from another checkout or port reuses the tab:  re-pointed if the URL differs, else reloaded
 * - never brings Chrome forward:  the tab is made active in ITS window only
 * - a new tab goes in the front window
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

/** `text` as an AppleScript string literal. */
function appleString(text: string): string {
  return `"${text.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`
}
