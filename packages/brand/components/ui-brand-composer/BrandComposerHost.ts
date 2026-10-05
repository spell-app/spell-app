import { FormHost } from "$/ui/forms"

/****************
 * ### `BrandComposerHost`
 * Host base of `<ui-brand-composer>`:  the form-control API (`FormHost`), plus `cast()`, so a page can cast what it
 * just put in `value` (the marketing hero's idea chips fill the box and cast at once).
 * - NOTE: the fork checks host prototype members against prop names;  `cast` is no attribute (`casting` is).
 ****************/
export class BrandComposerHost extends FormHost {
  /**
   * Cast the current text, as the Cast button does:  `ui-cast`, then the form's submit.
   * - Returns false when nothing was cast:  empty text, `casting`, `disabled`, not rendered yet, or vetoed.
   */
  cast(): boolean {
    return (this.controller as { cast?(originalEvent?: Event): boolean } | undefined)?.cast?.() ?? false
  }
}
