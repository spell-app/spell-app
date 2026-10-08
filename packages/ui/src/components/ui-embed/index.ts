/**
 * The embed family:  defines `<ui-embed>` and exports its component, `UIEmbed`, its DOM element, `DOMEmbedElement`,
 * and `EmbedSources`, which builds the frame's URL.
 * - SIDE EFFECT:  importing it defines the tag.
 * - Also the library's `@spell-app/ui/ui-embed` entry (its size is in `docs/report.md`).
 */

import { DOMEmbedElement, UIEmbed } from "./UIEmbed"
import { EmbedSources } from "./EmbedSources"

UIEmbed.define()

export { UIEmbed, DOMEmbedElement, EmbedSources }
