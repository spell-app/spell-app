/**
 * The breadcrumb family:  defines `<ui-breadcrumb>` and `<ui-breadcrumb-section>`,
 * and exports their components, `UIBreadcrumb` and `UIBreadcrumbSection`.
 * - SIDE EFFECT:  importing it defines the tags.
 * - Also the library's `@spell-app/ui/ui-breadcrumb` entry (its size is in `docs/report.md`).
 */

import { UIBreadcrumb } from "./UIBreadcrumb"
import { UIBreadcrumbSection } from "./UIBreadcrumbSection"

UIBreadcrumb.define()
UIBreadcrumbSection.define()

export { UIBreadcrumb, UIBreadcrumbSection }
