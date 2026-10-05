import { NativeFallback, proto } from "$/ui/core"

import { brandPhoneVocabulary } from "./ui-brand-phone.vocabulary.en"
import { CLASSES, DEFAULT_TIME } from "./ui-brand-phone.types"

/****************
 * ### `BrandPhoneFallback`
 * The frame without Solid:  the same `section.phone`, a status bar with the clock only, and the app's slot, so
 * `ui-brand-phone.css` draws it unchanged.
 ****************/
export class BrandPhoneFallback extends NativeFallback<typeof brandPhoneVocabulary> {
  @proto static vocabulary = brandPhoneVocabulary

  @proto static degraded = ["the status bar's signal, wifi and battery icons", "a translated region name"]

  protected override build() {
    const time = this.create("span", { class: CLASSES.time, part: "time" }, this.attr("time") ?? DEFAULT_TIME)
    const status = this.create("div", { class: CLASSES.status, part: "status", "aria-hidden": "true" }, time)
    const label = this.attr("label") ?? brandPhoneVocabulary.texts[0].text
    const dimmed = this.flag("dimmed")
    const phone = this.create(
      "section",
      { class: this.classes(), "aria-label": label || null, "aria-busy": dimmed ? "true" : null },
      status,
      this.slot()
    )
    return [this.decorate(phone, "phone")]
  }
}
