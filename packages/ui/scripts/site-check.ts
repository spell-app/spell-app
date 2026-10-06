/**
 * `yarn site:check <page...> | --all [--out <dir>]`:  check the Spell UI docs pages in headless chromium, from this
 * checkout's page server.
 * - The command only:  `SiteCheck` (`tools/SiteCheck.ts`) does the work, flags and exit code included, so the class
 *   file runs nothing when it's imported.
 */
import { SiteCheck } from "../tools/SiteCheck.ts"

await SiteCheck.main(process.argv.slice(2))
