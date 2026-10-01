/**
 * Barrel for the breadcrumb components -- also the `breadcrumb` lib entry (`@spell-app/ui/breadcrumb`), measured in
 * `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-breadcrumb>` and `<ui-breadcrumb-section>`.
 */

import { UIBreadcrumb } from "./UIBreadcrumb"
import { UIBreadcrumbSection } from "./UIBreadcrumbSection"

UIBreadcrumb.define()
UIBreadcrumbSection.define()

export { UIBreadcrumb, UIBreadcrumbSection }
