import Link from "next/link";
import TagChips from "./tag-chips";
import { formatPublication, toPublicationDate } from "../lib/date";

/**
 * The one post card used everywhere: home, archive, tag pages and related
 * posts. Server component — date formatting happens at build time and no
 * client JS ships for the card itself.
 *
 * Anatomy (danarnoux-inspired, hybrid with nextjs.org's hairline ring):
 *   meta row (date · reading time)
 *   title            → stretched link covers the whole card
 *   serif excerpt    → line-clamped
 *   tag chips        → real links, sit above the stretched link (z-10)
 */
export default function Card({
  slug,
  title,
  description,
  publishDate,
  publishTime = "",
  location = "",
  tags,
  readingTime,
  featured = false,
  className = "",
  searchHits = [],
  searchQuery = "",
  searchHref,
}) {
  return (
    <article
      className={`card card-interactive card-spotlight group relative flex flex-col p-5 ${className}`}
    >
      <div className="flex items-center gap-2 text-xs text-faint">
        <time dateTime={toPublicationDate(publishDate, publishTime).toISOString()}>
          {formatPublication(publishDate, publishTime)}
        </time>
        {location ? <><span aria-hidden="true">·</span><span>{location}</span></> : null}
        {readingTime ? (
          <>
            <span aria-hidden="true">·</span>
            <span>{readingTime}</span>
          </>
        ) : null}
        {/* {featured ? (
          <span
            className="ml-auto rounded-full px-2 py-0.5 text-[10px] font-semibold text-white"
            style={{ background: "var(--gradient-brand)" }}
          >
            精选
          </span>
        ) : null} */}
      </div>

      <h3 className="card-title mt-2.5 text-lg font-semibold leading-7 tracking-tight text-foreground transition-colors duration-200">
        <Link
          href={searchHref || slug}
          className="after:absolute after:inset-0 after:content-['']"
        >
          {title}
        </Link>
      </h3>

      {description ? (
        <p className="mt-2 line-clamp-3 text-sm leading-6 text-foreground/70">
          {description}
        </p>
      ) : null}

      {searchHits.length ? <div className="search-passages relative z-10"><small>正文匹配</small>{searchHits.map((hit) => <Link key={hit.id} href={hit.href}><SearchExcerpt text={hit.excerpt} query={searchQuery} /></Link>)}</div> : null}

      {tags?.length ? (
        <div className="relative z-10 mt-auto pt-4">
          <TagChips tags={tags} />
        </div>
      ) : null}
    </article>
  );
}

function SearchExcerpt({ text, query }) {
  const at = text.toLowerCase().indexOf(query.toLowerCase());
  return at < 0 || !query ? text : <>{text.slice(0, at)}<mark>{text.slice(at, at + query.length)}</mark>{text.slice(at + query.length)}</>;
}
