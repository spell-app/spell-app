/**
 * Every name `<ui-search>` uses:  tag, attributes (kind + allowed values), events, slots, parts, states, texts.
 * Schema:  `ComponentVocabulary` (`$/ui/vocabulary`).
 * - Class words come out through `ClassBuilder`, in Fomantic's grammar:
 *   `<ui-search category fluid aligned="right">` => `ui category fluid right aligned search`.  `ui-search.css` keys on
 *   those words.
 * - Rich data is a PROPERTY (`source`, `kind: "json"`);  first paint never needs it -- the input and its `value`
 *   are all SSR must show.
 */

import type { ComponentVocabulary } from "$/ui/vocabulary"

/****************
 * ### `<ui-search>`
 * A combobox + listbox:  a text `<input>` and an anchor-positioned popover of results, from a local `source` or a
 * remote `url`.
 ****************/
export const searchVocabulary = {
  tag: "ui-search",
  topics: ["inputs", "forms", "navigation", "selection", "modules"],
  aka: ["autocomplete", "typeahead", "search box", "combobox", "lookup"],
  skeleton: { display: "inline", width: "15em", height: "2.5em" },
  noun: "search",
  description: "A search module allows a user to query for results from a selection of data.",
  attributes: [
    { name: "size", kind: "size", description: "Size, `mini` ... `massive`;  `medium` is the default." },
    { name: "category", kind: "keyOnly", description: "Results in named groups (`category` of each result)." },
    {
      name: "horizontal",
      kind: "keyOnly",
      description: "`category`:  each group's name above its results, not beside them."
    },
    { name: "fluid", kind: "keyOnly", description: "Takes the full width of its container;  so do the results." },
    { name: "scrolling", kind: "keyOnly", description: "The results scroll after a fixed height." },
    { name: "resizable", kind: "keyOnly", description: "`scrolling`:  the user can resize the results vertically." },
    { name: "short", kind: "keyOnly", description: "The results scroll after a shorter height." },
    { name: "very-short", kind: "keyOnly", description: "The results scroll after a much shorter height." },
    { name: "long", kind: "keyOnly", description: "The results scroll after a longer height." },
    { name: "very-long", kind: "keyOnly", description: "The results scroll after a much longer height." },
    {
      name: "aligned",
      kind: "valueAndKey",
      values: ["left", "right"],
      description: "Which edge the results line up with:  `right` => `right aligned` (they extend to the left)."
    },
    { name: "loading", kind: "keyOnly", description: "Busy:  the icon spins.  Also shown while a remote query runs." },
    { name: "disabled", kind: "keyOnly", description: "Can't be used;  dimmed, and left out of the form." },
    {
      name: "open",
      kind: "boolean",
      description:
        "The results are showing.  Controlled:  `ui-open` / `ui-close` can veto;  shown only with something to show."
    },
    { name: "placeholder", kind: "string", description: "Placeholder text of the input." },
    { name: "value", kind: "string", description: "The input's text:  the query, or a chosen result's title." },
    { name: "name", kind: "string", description: "Form field name:  submits the input's text." },
    { name: "required", kind: "boolean", description: "Form validation:  the input can't be empty." },
    {
      name: "url",
      kind: "string",
      description: "Remote results:  a `UI.api` URL template with `{query}`, e.g. `/api/search?q={query}`."
    },
    {
      name: "min-characters",
      kind: "number",
      default: 1,
      description: "Characters to type before a search runs."
    },
    {
      name: "max-results",
      kind: "number",
      default: 7,
      description: "The most results shown (before categories);  `0` for no limit."
    },
    {
      name: "search-delay",
      kind: "number",
      default: 200,
      description: "Remote:  ms to wait after typing stops before querying (a newer query aborts an older one)."
    },
    {
      name: "full-text-search",
      kind: "enum",
      values: ["exact", "fuzzy", "prefix", "some", "all"],
      default: "exact",
      description:
        "Local matching (`SearchMatch`):  a word START always matches;  then `exact` anywhere, `fuzzy` in order, " +
        "`prefix` nothing more, `some` any word, `all` every word."
    },
    {
      name: "search-fields",
      kind: "string",
      default: "title description",
      description: "Local:  the result fields searched, a comma / space list."
    },
    { name: "ignore-diacritics", kind: "boolean", description: "Local:  `a` matches `á`." },
    {
      name: "highlight-matches",
      kind: "boolean",
      description: "Marks the query in titles and descriptions (`<mark>`)."
    },
    { name: "select-first-result", kind: "boolean", description: "Highlights the first result as results arrive." },
    {
      name: "show-no-results",
      kind: "boolean",
      default: true,
      description: "Shows the no-results message;  `false` shows nothing instead."
    },
    {
      name: "source",
      kind: "json",
      reflect: false,
      description:
        "Local results as a PROPERTY:  `SearchResult[]` (`{ title, description, image, price, category, url }`)."
    }
  ],
  events: [
    {
      name: "ui-search",
      detail: "{ query: string, originalEvent?: Event }",
      description: "The user typed a query at least `min-characters` long;  it's about to run."
    },
    {
      name: "ui-select",
      detail: "{ result: SearchResult, originalEvent?: Event }",
      cancelable: true,
      description: "A result is about to be chosen;  `preventDefault()` keeps the text, the results and the page."
    },
    {
      name: "ui-change",
      detail: "{ value: string, originalEvent?: Event }",
      description: "The text was committed:  a result chosen, the input cleared with Escape, or left after an edit."
    },
    {
      name: "ui-results",
      detail: "{ query: string, results: SearchResult[] }",
      description: "A remote query answered."
    },
    {
      name: "ui-open",
      detail: "{ open: true, originalEvent?: Event }",
      cancelable: true,
      description: "The results are about to show;  `preventDefault()` keeps them hidden."
    },
    {
      name: "ui-close",
      detail: "{ open: false, originalEvent?: Event }",
      cancelable: true,
      description: "The results are about to hide;  `preventDefault()` keeps them showing."
    }
  ],
  slots: [{ name: "icon", description: "Replaces the magnifying glass." }],
  parts: [
    { name: "search", description: "The root box (`ui search`):  where the `--ui-search-*` tokens are read." },
    { name: "input", description: "The `ui icon input` box around the text field." },
    { name: "prompt", description: "The text `<input>` (the combobox)." },
    { name: "icon", description: "The icon box." },
    { name: "results", description: "The results popover (the listbox while there are results)." },
    { name: "result", description: "Each result." },
    { name: "category", description: "Each group of a `category` search." },
    { name: "name", description: "Each group's name." },
    { name: "message", description: "The no-results or error message." }
  ],
  states: [
    { name: "open", description: "The results are showing." },
    { name: "disabled", description: "Can't be used." },
    { name: "loading", description: "Busy (`loading`, or a remote query running)." },
    { name: "invalid", description: "Fails validation (`required`)." },
    { name: "fluid", description: "The host is block-level (`fluid`)." }
  ],
  // NOTE: text keys share ONE namespace across components (`UI.i18n`, first registration wins), hence the prefix
  texts: [
    { key: "searchLabel", text: "Search", description: "Accessible name of the input when nothing else names it." },
    { key: "searchNoResultsHeader", text: "No Results", description: "Header of the no-results message." },
    { key: "searchNoResults", text: "Your search returned no results", description: "The no-results message." },
    {
      key: "searchServerError",
      text: "There was an issue querying the server.",
      description: "A remote query failed."
    },
    { key: "searchOneResult", text: "1 result available.", description: "Announced when one result shows." },
    { key: "searchResultCount", text: "{count} results available.", description: "Announced when results show." }
  ]
} as const satisfies ComponentVocabulary
