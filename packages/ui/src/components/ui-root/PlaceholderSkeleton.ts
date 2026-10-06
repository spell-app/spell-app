import { createRenderEffect, type Accessor } from "solid-js"
import type { JSX } from "@solidjs/web"

import { E } from "$/ui/core"
import { placeholderHeaderVocabulary } from "$/ui/components/ui-placeholder/ui-placeholder-header.vocabulary.en"
import { placeholderImageVocabulary } from "$/ui/components/ui-placeholder/ui-placeholder-image.vocabulary.en"
import { placeholderLineVocabulary } from "$/ui/components/ui-placeholder/ui-placeholder-line.vocabulary.en"
import { placeholderParagraphVocabulary } from "$/ui/components/ui-placeholder/ui-placeholder-paragraph.vocabulary.en"
import { placeholderVocabulary } from "$/ui/components/ui-placeholder/ui-placeholder.vocabulary.en"
import type { RootSkeleton } from "./ui-root.types"

/****************
 * ### `PlaceholderSkeleton`
 * What `<ui-root display="skeleton">` draws while its components load:  one `<ui-placeholder>` per described element
 * (`E.ComponentVocabulary.skeleton`), in page order, stacked (inline ones side by side).  `UIRoot.Skeleton`, so an
 * app swaps the look with one assignment or a subclass (`UIRoot.Skeleton = MySkeleton`).
 * - The `ui-placeholder` family is imported STATICALLY, by the root's barrel (`index.ts`;  with `ui-loader`, the only
 *   families a root never loads on demand).  Here, its vocabularies only:  pure data.
 * - Built with the DOM, not JSX:  Solid's JSX has no types for our tags.  Sizes go through the placeholder's public
 *   tokens (`--ui-placeholder-max-width`, `--ui-placeholder-image-height`), so its own sheet draws them.
 * - The element's `size` scales its skeleton (`--ui-scale`), and `fluid` fills the width.
 * - Static:  an app swaps the CLASS (`UIRoot.Skeleton`), and it keeps no state of its own.
 ****************/
export class PlaceholderSkeleton {
  /** A `<div part>` holding a placeholder per skeleton, following `skeletons`. */
  static render(part: string, skeletons: Accessor<readonly RootSkeleton[]>): JSX.Element {
    const box = document.createElement("div")
    box.setAttribute("part", part)
    createRenderEffect(skeletons, (list) => {
      box.replaceChildren(...list.map((skeleton) => PlaceholderSkeleton.placeholder(skeleton)))
    })
    return box
  }

  /** The `<ui-placeholder>` standing for `element`. */
  static placeholder({ element, spec }: RootSkeleton): HTMLElement {
    const placeholder = PlaceholderSkeleton.create(placeholderVocabulary.tag)
    const style = placeholder.style
    const isFluid = E.Converters.boolean(element.getAttribute(FLUID), FLUID)
    if (isFluid) placeholder.setAttribute(FLUID, "")
    else if (spec.width) style.setProperty("--ui-placeholder-max-width", spec.width)
    const size = element.getAttribute(SIZE)
    if (size && size !== MEDIUM) style.setProperty("--ui-scale", `var(--ui-size-${size})`)
    if (spec.display === "inline") {
      style.display = "inline-block"
      style.verticalAlign = "top"
      style.marginInlineEnd = "0.5em"
      if (!isFluid && spec.width) style.width = spec.width
    }
    placeholder.append(...PlaceholderSkeleton.shapes(spec))
    return placeholder
  }

  /** The shapes inside:  `parts`, or one block `width` x `height`. */
  private static shapes(spec: E.SkeletonSpec): HTMLElement[] {
    if (!spec.parts?.length) {
      const block = PlaceholderSkeleton.create(placeholderImageVocabulary.tag)
      if (spec.height) block.style.setProperty("--ui-placeholder-image-height", spec.height)
      return [block]
    }
    return spec.parts.map((part) => PlaceholderSkeleton.shape(part))
  }

  /** One part as placeholder markup. */
  private static shape(part: E.SkeletonPart): HTMLElement {
    switch (part.shape) {
      case "image": {
        const image = PlaceholderSkeleton.create(placeholderImageVocabulary.tag)
        if (part.ratio) image.setAttribute(part.ratio, "")
        return image
      }
      case "header": {
        const header = PlaceholderSkeleton.create(placeholderHeaderVocabulary.tag)
        if (part.image) header.setAttribute(HEADER_IMAGE, "")
        header.append(...PlaceholderSkeleton.lines(HEADER_LINES))
        return header
      }
      case "paragraph": {
        const paragraph = PlaceholderSkeleton.create(placeholderParagraphVocabulary.tag)
        paragraph.append(...PlaceholderSkeleton.lines(part.lines ?? DEFAULT_LINES))
        return paragraph
      }
      case "line": {
        const [line] = PlaceholderSkeleton.lines(1)
        if (part.length) line!.setAttribute(LINE_LENGTH, part.length)
        return line!
      }
    }
  }

  /** `count` `<ui-placeholder-line>`s. */
  private static lines(count: number): HTMLElement[] {
    return Array.from({ length: count }, () => PlaceholderSkeleton.create(placeholderLineVocabulary.tag))
  }

  /** A new element named `tag`. */
  private static create(tag: string): HTMLElement {
    return document.createElement(tag)
  }
}

/** A class `UIRoot.Skeleton` accepts:  `PlaceholderSkeleton` or one shaped like it. */
export type RootSkeletonRenderer = Pick<typeof PlaceholderSkeleton, "render">

/** Bars in a skeleton paragraph unless it says. */
const DEFAULT_LINES = 3

/** Bars in a skeleton header. */
const HEADER_LINES = 2

/** `fluid`:  read from the described element, set on its placeholder. */
const FLUID: E.AttributeName<typeof placeholderVocabulary> = "fluid"

/** `size`, read from the described element. */
const SIZE = "size"

/** The size that changes nothing. */
const MEDIUM = "medium"

/** A header placeholder's square image. */
const HEADER_IMAGE: E.AttributeName<typeof placeholderHeaderVocabulary> = "image"

/** A line placeholder's length. */
const LINE_LENGTH: E.AttributeName<typeof placeholderLineVocabulary> = "length"
