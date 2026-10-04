/**
 * One form of every value-carrying `ui-*` control, and what submitting it sends:  the round trip a static server
 * render (`$/ui/server`) must keep (seo plan, P4).
 * - `static-form.ssr.test.tsx` renders it statically and computes the browser's form data set from the plain HTML;
 *   `static-form.test.ts` submits the LIVE elements and reads `FormData`.  Both compare with `STATIC_FORM_ENTRIES`.
 * - PURE DATA:  read by a node test and a browser test.
 */

/** The form:  every control named, a few NOT submitted (unchosen, disabled, nameless), a named submit button. */
export const STATIC_FORM_HTML = `
<form id="round-trip" action="/submit" method="post">
  <ui-input name="email" type="email" value="a@b.c"></ui-input>
  <ui-input name="off" value="never" disabled></ui-input>
  <ui-input value="nameless"></ui-input>
  <ui-textarea name="bio" value="Hello there"></ui-textarea>
  <ui-checkbox name="terms" value="yes" selected>Agree</ui-checkbox>
  <ui-checkbox name="news" value="weekly">News</ui-checkbox>
  <ui-checkbox name="plain" selected>Default value</ui-checkbox>
  <ui-radio name="size" value="s">S</ui-radio>
  <ui-radio name="size" value="m" selected>M</ui-radio>
  <ui-select name="color" value="green"
    ><ui-item value="red">Red</ui-item><ui-item value="green">Green</ui-item></ui-select
  >
  <ui-dropdown selection multiple name="skills" value="css,html"
    ><ui-item value="css">CSS</ui-item><ui-item value="html">HTML</ui-item><ui-item value="js">JS</ui-item></ui-dropdown
  >
  <ui-search name="q" value="spell"></ui-search>
  <ui-slider name="volume" value="5" max="10"></ui-slider>
  <ui-slider range name="price" value="5" end="15" max="20"></ui-slider>
  <ui-rating name="stars" value="3" max="5"></ui-rating>
  <ui-calendar type="date" name="due" value="2026-09-30"></ui-calendar>
  <ui-button type="submit" name="action" value="save">Save</ui-button>
</form>`

/** Every control named but given NO value:  what each submits by default. */
export const EMPTY_FORM_HTML = `
<form id="defaults">
  <ui-input name="email"></ui-input>
  <ui-textarea name="bio"></ui-textarea>
  <ui-select name="color"><ui-item value="red">Red</ui-item><ui-item value="green">Green</ui-item></ui-select>
  <ui-dropdown selection name="size"><ui-item value="s">S</ui-item><ui-item value="m">M</ui-item></ui-dropdown>
  <ui-search name="q"></ui-search>
  <ui-slider name="volume" max="10"></ui-slider>
  <ui-rating name="stars" max="5"></ui-rating>
  <ui-calendar type="date" name="due"></ui-calendar>
  <ui-button type="submit">Go</ui-button>
</form>`

/**
 * What submitting `EMPTY_FORM_HTML` sends:  text controls an empty string, a slider its minimum;  a select, dropdown,
 * rating or calendar without a value nothing at all (the static select's chosen placeholder is disabled for that).
 */
export const EMPTY_FORM_ENTRIES: readonly (readonly [string, string])[] = [
  ["email", ""],
  ["bio", ""],
  ["q", ""],
  ["volume", "0"]
]

/** What submitting `STATIC_FORM_HTML` with its Save button sends, in tree order. */
export const STATIC_FORM_ENTRIES: readonly (readonly [string, string])[] = [
  ["email", "a@b.c"],
  ["bio", "Hello there"],
  ["terms", "yes"],
  ["plain", "on"],
  ["size", "m"],
  ["color", "green"],
  ["skills", "css"],
  ["skills", "html"],
  ["q", "spell"],
  ["volume", "5"],
  ["price", "5"],
  ["price", "15"],
  ["stars", "3"],
  ["due", "2026-09-30"],
  ["action", "save"]
]
