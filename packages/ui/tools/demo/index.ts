/**
 * `yarn dev` home page:  every example fragment of `src/components/ui-<name>/examples/` (class grammar, light DOM)
 * beside its element markup in `examples/elements/` -- button, dropdown, icon, label, parts, divider, segment,
 * container, grid, image, text, flag, loader, placeholder, message, breadcrumb, input, checkbox, form, list, menu, table,
 * popup, modal, transition, dimmer, flyout, sidebar, shape, card, items, feed, comment, statistic, step, rail, reveal,
 * ad, emoji, progress, rating, slider, accordion, tab, calendar, section.
 * - The originals need the component sheets on the PAGE;  the runtime already puts the foundation there.
 * - `item` has no examples of its own:  its look is its owners' (`ui-list.css`, `ui-menu.css`, `ui-items.css`).
 * - The parts' own examples use `stub-*` owners (`StubOwner`) only where the real owner is a hidden overlay
 *   (modal, popup) or owns no parts yet (accordion, toast, search).
 * - `?only=<name>` shows one component's pairs (`yarn screenshots`).
 */

import { UI } from "$/ui/runtime"
import { StubOwner } from "$/ui/test/StubOwner"

import "$/ui/index"

import buttonCSS from "$/ui/components/ui-button/ui-button.css?inline"
import dropdownCSS from "$/ui/components/ui-dropdown/ui-dropdown.css?inline"
import iconCSS from "$/ui/components/ui-icon/ui-icon.css?inline"
import labelCSS from "$/ui/components/ui-label/ui-label.css?inline"
import partsCSS from "$/ui/components/ui-parts/ui-parts.css?inline"
import dividerCSS from "$/ui/components/ui-divider/ui-divider.css?inline"
import segmentCSS from "$/ui/components/ui-segment/ui-segment.css?inline"
import containerCSS from "$/ui/components/ui-container/ui-container.css?inline"
import gridCSS from "$/ui/components/ui-grid/ui-grid.css?inline"
import imageCSS from "$/ui/components/ui-image/ui-image.css?inline"
import textCSS from "$/ui/components/ui-text/ui-text.css?inline"
import flagCSS from "$/ui/components/ui-flag/ui-flag.css?inline"
import loaderCSS from "$/ui/components/ui-loader/ui-loader.css?inline"
import placeholderCSS from "$/ui/components/ui-placeholder/ui-placeholder.css?inline"
import messageCSS from "$/ui/components/ui-message/ui-message.css?inline"
import breadcrumbCSS from "$/ui/components/ui-breadcrumb/ui-breadcrumb.css?inline"
import inputCSS from "$/ui/components/ui-input/ui-input.css?inline"
import checkboxCSS from "$/ui/components/ui-checkbox/ui-checkbox.css?inline"
import formCSS from "$/ui/components/ui-form/ui-form.css?inline"
import listCSS from "$/ui/components/ui-list/ui-list.css?inline"
import menuCSS from "$/ui/components/ui-menu/ui-menu.css?inline"
import tableCSS from "$/ui/components/ui-table/ui-table.css?inline"
import popupCSS from "$/ui/components/ui-popup/ui-popup.css?inline"
import popupAnchoredCSS from "$/ui/components/ui-popup/ui-popup.anchored.css?raw"
import modalCSS from "$/ui/components/ui-modal/ui-modal.css?inline"
import transitionCSS from "$/ui/components/ui-transition/ui-transition.css?inline"
import dimmerCSS from "$/ui/components/ui-dimmer/ui-dimmer.css?inline"
import flyoutCSS from "$/ui/components/ui-flyout/ui-flyout.css?inline"
import sidebarCSS from "$/ui/components/ui-sidebar/ui-sidebar.css?inline"
import shapeCSS from "$/ui/components/ui-shape/ui-shape.css?inline"
import cardCSS from "$/ui/components/ui-card/ui-card.css?inline"
import itemsCSS from "$/ui/components/ui-items/ui-items.css?inline"
import feedCSS from "$/ui/components/ui-feed/ui-feed.css?inline"
import commentCSS from "$/ui/components/ui-comment/ui-comment.css?inline"
import statisticCSS from "$/ui/components/ui-statistic/ui-statistic.css?inline"
import stepCSS from "$/ui/components/ui-step/ui-step.css?inline"
import railCSS from "$/ui/components/ui-rail/ui-rail.css?inline"
import revealCSS from "$/ui/components/ui-reveal/ui-reveal.css?inline"
import adCSS from "$/ui/components/ui-ad/ui-ad.css?inline"
import emojiCSS from "$/ui/components/ui-emoji/ui-emoji.css?inline"
import selectCSS from "$/ui/components/ui-select/ui-select.css?inline"
import searchCSS from "$/ui/components/ui-search/ui-search.css?inline"
import progressCSS from "$/ui/components/ui-progress/ui-progress.css?inline"
import ratingCSS from "$/ui/components/ui-rating/ui-rating.css?inline"
import sliderCSS from "$/ui/components/ui-slider/ui-slider.css?inline"
import accordionCSS from "$/ui/components/ui-accordion/ui-accordion.css?inline"
import tabCSS from "$/ui/components/ui-tab/ui-tab.css?inline"
import toastCSS from "$/ui/components/ui-toast/ui-toast.css?inline"
import nagCSS from "$/ui/components/ui-nag/ui-nag.css?inline"
import stickyCSS from "$/ui/components/ui-sticky/ui-sticky.css?inline"
import visibilityCSS from "$/ui/components/ui-visibility/ui-visibility.css?inline"
import embedCSS from "$/ui/components/ui-embed/ui-embed.css?inline"
import calendarCSS from "$/ui/components/ui-calendar/ui-calendar.css?inline"
import sectionCSS from "$/ui/components/ui-section/ui-section.css?inline"
import markdownCSS from "$/ui/components/ui-markdown/ui-markdown.css?inline"
import codeCSS from "$/ui/components/ui-code/ui-code.css?inline"
import includeCSS from "$/ui/components/ui-include/ui-include.css?inline"

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
  calendar: calendarCSS,
  section: sectionCSS,
  markdown: markdownCSS,
  code: codeCSS,
  include: includeCSS
})) {
  UI.styles.register(name, css, { page: true })
}

const only = new URLSearchParams(location.search).get("only")
const main = document.getElementById("examples")!
for (const [path, html] of Object.entries(ELEMENTS)) {
  // `/src/components/ui-button/examples/elements/content.html` => `ui-button/content.html`
  const [, folder, file] = /\/components\/([\w-]+)\/examples\/elements\/([\w-]+\.html)$/.exec(path) ?? []
  const name = `${folder}/${file}`
  if (only && folder !== only) continue
  const original = ORIGINALS[`/src/components/${folder}/examples/${file}`] ?? ""
  const pair = document.createElement("section")
  pair.className = "pair"
  pair.innerHTML = `<div><h3>${name} -- class grammar</h3>${original}</div><div><h3>${name} -- elements</h3>${html}</div>`
  main.append(pair)
}
