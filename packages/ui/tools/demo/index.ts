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

import { UI } from "$/ui/runtime"
import { StubOwner } from "$/ui/test/StubOwner"

import "$/ui/index"

import buttonCSS from "$/ui/components/button/button.css?inline"
import dropdownCSS from "$/ui/components/dropdown/dropdown.css?inline"
import iconCSS from "$/ui/components/icon/icon.css?inline"
import labelCSS from "$/ui/components/label/label.css?inline"
import partsCSS from "$/ui/components/parts/parts.css?inline"
import dividerCSS from "$/ui/components/divider/divider.css?inline"
import segmentCSS from "$/ui/components/segment/segment.css?inline"
import containerCSS from "$/ui/components/container/container.css?inline"
import gridCSS from "$/ui/components/grid/grid.css?inline"
import imageCSS from "$/ui/components/image/image.css?inline"
import textCSS from "$/ui/components/text/text.css?inline"
import flagCSS from "$/ui/components/flag/flag.css?inline"
import loaderCSS from "$/ui/components/loader/loader.css?inline"
import placeholderCSS from "$/ui/components/placeholder/placeholder.css?inline"
import messageCSS from "$/ui/components/message/message.css?inline"
import breadcrumbCSS from "$/ui/components/breadcrumb/breadcrumb.css?inline"
import inputCSS from "$/ui/components/input/input.css?inline"
import checkboxCSS from "$/ui/components/checkbox/checkbox.css?inline"
import formCSS from "$/ui/components/form/form.css?inline"
import listCSS from "$/ui/components/list/list.css?inline"
import menuCSS from "$/ui/components/menu/menu.css?inline"
import tableCSS from "$/ui/components/table/table.css?inline"
import popupCSS from "$/ui/components/popup/popup.css?inline"
import popupAnchoredCSS from "$/ui/components/popup/popup.anchored.css?raw"
import modalCSS from "$/ui/components/modal/modal.css?inline"
import transitionCSS from "$/ui/components/transition/transition.css?inline"
import dimmerCSS from "$/ui/components/dimmer/dimmer.css?inline"
import flyoutCSS from "$/ui/components/flyout/flyout.css?inline"
import sidebarCSS from "$/ui/components/sidebar/sidebar.css?inline"
import shapeCSS from "$/ui/components/shape/shape.css?inline"
import cardCSS from "$/ui/components/card/card.css?inline"
import itemsCSS from "$/ui/components/items/items.css?inline"
import feedCSS from "$/ui/components/feed/feed.css?inline"
import commentCSS from "$/ui/components/comment/comment.css?inline"
import statisticCSS from "$/ui/components/statistic/statistic.css?inline"
import stepCSS from "$/ui/components/step/step.css?inline"
import railCSS from "$/ui/components/rail/rail.css?inline"
import revealCSS from "$/ui/components/reveal/reveal.css?inline"
import adCSS from "$/ui/components/ad/ad.css?inline"
import emojiCSS from "$/ui/components/emoji/emoji.css?inline"
import selectCSS from "$/ui/components/select/select.css?inline"
import searchCSS from "$/ui/components/search/search.css?inline"
import progressCSS from "$/ui/components/progress/progress.css?inline"
import ratingCSS from "$/ui/components/rating/rating.css?inline"
import sliderCSS from "$/ui/components/slider/slider.css?inline"
import accordionCSS from "$/ui/components/accordion/accordion.css?inline"
import tabCSS from "$/ui/components/tab/tab.css?inline"
import toastCSS from "$/ui/components/toast/toast.css?inline"
import nagCSS from "$/ui/components/nag/nag.css?inline"
import stickyCSS from "$/ui/components/sticky/sticky.css?inline"
import visibilityCSS from "$/ui/components/visibility/visibility.css?inline"
import embedCSS from "$/ui/components/embed/embed.css?inline"
import calendarCSS from "$/ui/components/calendar/calendar.css?inline"

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
