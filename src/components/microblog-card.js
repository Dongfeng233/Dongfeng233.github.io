import Image from "next/image";
import Link from "next/link";
import { formatPublication } from "../lib/date";

function EntryMeta({ entry }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 text-xs text-faint">
      <time dateTime={entry.publishedAt}>{formatPublication(entry.date, entry.time)}</time>
      {entry.location ? <><span aria-hidden="true">·</span><span>发布于 {entry.location}</span></> : null}
    </div>
  );
}

/**
 * Microblog entry card, sharing the site's card language.
 *
 * - full:    /microblog page — all paragraphs + Weibo-style image grid
 *            (1 → wide, 2 → two squares, 3+ → three-column squares,
 *            object-cover; originals open in the global lightbox with
 *            swipe + figcaption description).
 * - compact: home sidebar — first paragraph clamped + up to 3 thumbnails.
 *
 * Images use next/image fill inside aspect-ratio boxes (CLS-safe) and carry
 * the `lightbox-image` class so the globally mounted ImageLightbox picks
 * them up in DOM order (swipe across entries works for free).
 */
export default function MicroblogCard({ entry, compact = false }) {
  const gridClass =
    entry.images.length === 1
      ? "grid-cols-1"
      : entry.images.length === 2
        ? "grid-cols-2"
        : "grid-cols-3";

  const cellAspect = entry.images.length === 1 ? "aspect-[16/10]" : "aspect-square";

  const imageGrid = (limit) => (
    <div className={`grid gap-1.5 ${gridClass}`}>
      {entry.images.slice(0, limit).map((img, i) => (
        <figure key={i} className={`relative overflow-hidden rounded-lg ${cellAspect}`}>
          <Image
            src={img.src}
            alt={img.desc || "微博配图"}
            fill
            loading="lazy"
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 92vw"
            className="lightbox-image object-cover transition-transform duration-300 hover:scale-[1.03]"
          />
          <figcaption className="sr-only">{img.desc || img.src}</figcaption>
        </figure>
      ))}
    </div>
  );

  if (compact) {
    return (
      <article id={entry.id} className="card card-spotlight p-4">
        <EntryMeta entry={entry} />
        {entry.paragraphs[0] && (
          <p className="mt-1.5 line-clamp-4 text-sm leading-6 text-foreground/70">
            {entry.paragraphs[0]}
          </p>
        )}
        {entry.images.length > 0 && (
          <div className="mt-3">{imageGrid(3)}</div>
        )}
      </article>
    );
  }

  return (
    <article id={entry.id} className="card scroll-offset p-6">
      <div className="flex items-center justify-between gap-2">
        <EntryMeta entry={entry} />
      </div>
      <div className="mt-2 space-y-3">
        {entry.paragraphs.map((p, i) => (
          <p key={i} className="leading-7 text-foreground">
            {p}
          </p>
        ))}
      </div>
      {entry.images.length > 0 && (
        <div className="mt-4">{imageGrid(entry.images.length)}</div>
      )}
    </article>
  );
}

export function MicroblogCardLink() {
  return (
    <Link href="/microblog" passHref>
      <p className="pt-2 text-right text-sm text-muted transition-colors duration-300 hover:text-accent hover:underline">
        阅读更多 →
      </p>
    </Link>
  );
}
