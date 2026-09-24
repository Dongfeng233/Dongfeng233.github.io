/**
 * Tag display labels.
 *
 * Canonical tag slugs stay English (stable URLs, feeds, analytics — raw
 * `/tags/${tag}` interpolation assumes ASCII), while the UI renders Chinese
 * labels. Single source of truth for every tag consumer: cards, tag chips,
 * tag sidebar, tag page headers, the Fuse search index and related posts.
 */
import tagLabels from "./tagLabels.json" with { type: "json" };

/** Chinese label for a tag slug, falling back to the slug itself. */
export function tagLabel(tag) {
  return tagLabels[tag] || tag;
}

export default tagLabels;
