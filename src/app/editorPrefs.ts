import { PrefStore } from "spell/util"

/**
 * The editor app's preferences, kept in the browser:  its mode, its tabs, its panels' sizes,
 * and the last project, file and selection it showed.
 * - Every key is under `spellEditor:`, e.g. `spellEditor:mode`.
 * - Each pref is declared where it's used (`EditorMode`, `LineNumbers` ...), with its choices and default.
 *   - A key from before `PrefStore`, with the store's name in it twice (`spellEditor:spellEditor.mode`),
 *     moves to its new one once, where it's declared (`rename()`).
 * - A module of its own, NOT `editor.ts`:  a component reading a pref as it loads needn't load the editor first,
 *   and `<SplitPanel>`'s components page has no editor at all.
 */
export const editorPrefs = new PrefStore("spellEditor")
