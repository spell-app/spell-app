/**
 * `yarn dev` home page:  every example fragment of `src/components/<name>/examples/` (class grammar, light DOM)
 * beside its element markup in `examples/elements/` -- button, dropdown, icon, label, parts, divider, segment,
 * container, grid, image, text, flag, loader, placeholder, message, breadcrumb, input, checkbox, form, list, menu, table,
 * popup, modal, transition, dimmer, flyout, sidebar, shape, card, items, feed, comment, statistic, step, rail, reveal,
 * ad, emoji, progress, rating, slider, accordion, tab, calendar.
 * - The originals need the component sheets on the PAGE;  the runtime already puts the foundation there.
 * - `item` has no examples of its own:  its look is its owners' (`list.css`, `menu.css`, `items.css`).
 * - The parts' own examples use `stub-*` owners (`StubOwner`) only where the real owner is a hidden overlay
 *   (modal, popup) or owns no parts yet (accordion, toast, search).
 * - `?only=<name>` shows one component's pairs (`yarn screenshots`).
 */

import { UI } from "$/runtime"
import { StubOwner } from "$test/StubOwner"

import "$/index"

import buttonCSS from "$/components/button/button.css?inline"
import dropdownCSS from "$/components/dropdown/dropdown.css?inline"
import iconCSS from "$/components/icon/icon.css?inline"
import labelCSS from "$/components/label/label.css?inline"
import partsCSS from "$/components/parts/parts.css?inline"
import dividerCSS from "$/components/divider/divider.css?inline"
import segmentCSS from "$/components/segment/segment.css?inline"
import containerCSS from "$/components/container/container.css?inline"
import gridCSS from "$/components/grid/grid.css?inline"
import imageCSS from "$/components/image/image.css?inline"
import textCSS from "$/components/text/text.css?inline"
import flagCSS from "$/components/flag/flag.css?inline"
import loaderCSS from "$/components/loader/loader.css?inline"
import placeholderCSS from "$/components/placeholder/placeholder.css?inline"
import messageCSS from "$/components/message/message.css?inline"
import breadcrumbCSS from "$/components/breadcrumb/breadcrumb.css?inline"
import inputCSS from "$/components/input/input.css?inline"
import checkboxCSS from "$/components/checkbox/checkbox.css?inline"
import formCSS from "$/components/form/form.css?inline"
import listCSS from "$/components/list/list.css?inline"
import menuCSS from "$/components/menu/menu.css?inline"
import tableCSS from "$/components/table/table.css?inline"
import popupCSS from "$/components/popup/popup.css?inline"
import popupAnchoredCSS from "$/components/popup/popup.anchored.css?raw"
import modalCSS from "$/components/modal/modal.css?inline"
import transitionCSS from "$/components/transition/transition.css?inline"
import dimmerCSS from "$/components/dimmer/dimmer.css?inline"
import flyoutCSS from "$/components/flyout/flyout.css?inline"
import sidebarCSS from "$/components/sidebar/sidebar.css?inline"
import shapeCSS from "$/components/shape/shape.css?inline"
import cardCSS from "$/components/card/card.css?inline"
import itemsCSS from "$/components/items/items.css?inline"
import feedCSS from "$/components/feed/feed.css?inline"
import commentCSS from "$/components/comment/comment.css?inline"
import statisticCSS from "$/components/statistic/statistic.css?inline"
import stepCSS from "$/components/step/step.css?inline"
import railCSS from "$/components/rail/rail.css?inline"
import revealCSS from "$/components/reveal/reveal.css?inline"
import adCSS from "$/components/ad/ad.css?inline"
import emojiCSS from "$/components/emoji/emoji.css?inline"
import selectCSS from "$/components/select/select.css?inline"
import searchCSS from "$/components/search/search.css?inline"
import progressCSS from "$/components/progress/progress.css?inline"
import ratingCSS from "$/components/rating/rating.css?inline"
import sliderCSS from "$/components/slider/slider.css?inline"
import accordionCSS from "$/components/accordion/accordion.css?inline"
import tabCSS from "$/components/tab/tab.css?inline"
import toastCSS from "$/components/toast/toast.css?inline"
import nagCSS from "$/components/nag/nag.css?inline"
import stickyCSS from "$/components/sticky/sticky.css?inline"
import visibilityCSS from "$/components/visibility/visibility.css?inline"
import embedCSS from "$/components/embed/embed.css?inline"
import calendarCSS from "$/components/calendar/calendar.css?inline"

/** Original fragments, by path. */
const ORIGINALS = import.meta.glob<string>("/src/components/*/examples/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

/** Element rewrites, by path. */
const ELEMENTS = import.meta.glob<string>("/src/components/*/examples/elements/*.html", {
  query: "?raw",
  import: "default",
  eager: true
})

StubOwner.defineFomanticOwners()
await UI.load()
for (const [name, css] of Object.entries({
  button: buttonCSS,
  dropdown: dropdownCSS,
  icon: iconCSS,
  label: labelCSS,
  parts: partsCSS,
  divider: dividerCSS,
  segment: segmentCSS,
  container: containerCSS,
  grid: gridCSS,
  image: imageCSS,
  text: textCSS,
  flag: flagCSS,
  loader: loaderCSS,
  placeholder: placeholderCSS,
  message: messageCSS,
  breadcrumb: breadcrumbCSS,
  input: inputCSS,
  checkbox: checkboxCSS,
  form: formCSS,
  list: listCSS,
  menu: menuCSS,
  table: tableCSS,
  popup: popupCSS,
  "popup-anchored": popupAnchoredCSS,
  modal: modalCSS,
  transition: transitionCSS,
  dimmer: dimmerCSS,
  flyout: flyoutCSS,
  sidebar: sidebarCSS,
  shape: shapeCSS,
  card: cardCSS,
  items: itemsCSS,
  feed: feedCSS,
  comment: commentCSS,
  statistic: statisticCSS,
  step: stepCSS,
  rail: railCSS,
  reveal: revealCSS,
  ad: adCSS,
  emoji: emojiCSS,
  select: selectCSS,
  search: searchCSS,
  progress: progressCSS,
  rating: ratingCSS,
  slider: sliderCSS,
  accordion: accordionCSS,
  tab: tabCSS,
  toast: toastCSS,
  nag: nagCSS,
  sticky: stickyCSS,
  visibility: visibilityCSS,
  embed: embedCSS,
  calendar: calendarCSS
})) {
  UI.styles.register(name, css, { page: true })
}

const only = new URLSearchParams(location.search).get("only")
const main = document.getElementById("examples")!
for (const [path, html] of Object.entries(ELEMENTS)) {
  // `/src/components/button/examples/elements/content.html` => `button/content.html`
  const [, folder, file] = /\/components\/([\w-]+)\/examples\/elements\/([\w-]+\.html)$/.exec(path) ?? []
  const name = `${folder}/${file}`
  if (only && folder !== only) continue
  const original = ORIGINALS[`/src/components/${folder}/examples/${file}`] ?? ""
  const pair = document.createElement("section")
  pair.className = "pair"
  pair.innerHTML = `<div><h3>${name} -- class grammar</h3>${original}</div><div><h3>${name} -- elements</h3>${html}</div>`
  main.append(pair)
}
