import { PrefStore } from "spell/util"

/**
 * The editor app's preferences, kept in the browser:  its mode, its tabs, its panels' sizes, and the last project,
 * file and selection it showed.
 * - Under `spellEditor:`, e.g. `spellEditor:mode`.
 * - Each pref is declared where it's used (`EditorMode`, `LineNumbers` ...), with its choices and default.
 * - A module of its own, NOT `editor.ts`:  a component reading a pref as it loads needn't load the editor first,
 *   and `<SplitPanel>`'s components page has no editor at all.
 */
export const editorPrefs = new PrefStore("spellEditor")
