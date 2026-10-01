/**
 * Barrel for the embed -- also the `embed` lib entry (`@spell-app/ui/embed`), measured in `docs/report.md`.
 * - SIDE EFFECT:  defines `<ui-embed>`.
 */

import { UIEmbed } from "./UIEmbed"
import { UIEmbedHost } from "./UIEmbedHost"
import { EmbedSources } from "./EmbedSources"

UIEmbed.define()

export { UIEmbed, UIEmbedHost, EmbedSources }
